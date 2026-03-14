import os
import json
import time
import subprocess
import fitz  # PyMuPDF
from openai import OpenAI
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# --- CONFIGURATION ---
PDF_PATH = "Knowledge source/Textbooks/review manual dahnert.pdf"
PROGRESS_FILE = "scripts/dahnert_progress.json"
CONVEX_INGEST_CMD = "npx convex run rag:ingestTextbookKnowledge"

# OpenRouter Settings
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
# Load ALL keys from .env
OPENROUTER_KEYS = [k.strip() for k in os.environ.get("OPENROUTER_KEYS", "").split(",") if k.strip()]

LLM_MODEL = "stepfun/step-3.5-flash"
EMBEDDING_MODEL = "openai/text-embedding-3-small"

# Shared state
progress_lock = threading.Lock()
completed_pages = set()

# Define the extraction prompt (same as before)
EXTRACTION_PROMPT = """
You are a highly specialized radiology AI assistant. Your task is to extract structured medical knowledge from the provided text of "Dahnert's Radiology Review Manual".

### SYMBOL KEY IN THE TEXT:
- √ = radiologic sign
- • = clinical sign/symptom
- @ = at anatomic location
- ◊ = important comment / pearl
- MR:, CT:, US:, Radiographs:, MR Imaging:, Angio: = Modality specific findings

### TARGET JSON SCHEMA:
Return a LIST of objects with this structure:
{{
  "entityName": "The official name of the disease or condition",
  "category": "The major system (e.g., MSK, CNS, Chest, GI, GU, Cardiac)",
  "radiographicFeatures": {{
    "xray": ["List of findings prefixed with √ or under Radiographs header"],
    "us": ["List of findings under US header"],
    "ct": ["List of findings under CT header"],
    "mri": ["List of findings under MR or MR Imaging header"],
    "fluoroscopy": ["List of findings under Fluoroscopy or Barium studies header"],
    "nuclearMedicine": ["List of findings under Nuclear Medicine or Scintigraphy header"]
  }},
  "clinicalData": {{
    "demographics": ["Age, gender, prevalence info"],
    "associations": ["Syndromes, risk factors, or conditions marked with •"],
    "cardinalSigns": ["Pathognomonic signs, 'Aunt Minnie' findings, or hallmark comments marked with ◊"]
  }},
  "rawTextChunk": "A condensed markdown-style summary of the entity including its name and most important features for RAG embedding.",
  "pageNumber": 123,
  "sourceReference": "Dahnert Review Manual - [Category] Section"
}}

### INSTRUCTIONS:
1. Extract ALL diseases/conditions mentioned in the text.
2. Identify the PRIMARY PAGE NUMBER for each condition from the markers provided (e.g., --- PAGE X ---).
3. If a finding doesn't specify a modality but has √, put it in 'xray' by default.
4. Be 100% accurate. Do not invent data.
5. If a field has no data, return an empty list [].
6. IGNORE long lists of microbiological organisms.

Output ONLY a valid JSON array.
"""

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r") as f:
                data = json.load(f)
                return set(data.get("completed_pages", []))
        except:
            return set()
    return set()

def save_progress():
    with progress_lock:
        with open(PROGRESS_FILE, "w") as f:
            json.dump({"completed_pages": list(completed_pages)}, f)

def get_client(key):
    return OpenAI(base_url=OPENROUTER_BASE_URL, api_key=key)

def get_embedding(client, text: str) -> List[float]:
    response = client.embeddings.create(
        input=[text.replace("\n", " ")[:8000]], # Clip to safety limit
        model=EMBEDDING_MODEL
    )
    return response.data[0].embedding

def ingest_to_convex(client, entity: Dict[str, Any]):
    try:
        # Get embedding using the worker's client
        entity["embedding"] = get_embedding(client, entity["rawTextChunk"])
        
        # Use a list for subprocess.run to avoid shell escaping issues
        # Use --typecheck disable to significantly speed up individual runs
        cmd = ["npx", "convex", "run", "rag:ingestTextbookKnowledge", json.dumps(entity), "--typecheck", "disable"]
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True
    except Exception as e:
        print(f"Error ingesting {entity.get('entityName')}: {e}")
        return False

def process_page_range(start_page, end_page, key):
    client = get_client(key)
    doc = fitz.open(PDF_PATH)
    
    # Simple category heuristic based on page number
    # (Rough estimates based on TOC)
    category = "MSK"
    if start_page > 300: category = "CNS"
    if start_page > 800: category = "Chest"
    if start_page > 1500: category = "Cardiac"
    if start_page > 2000: category = "GI"
    if start_page > 2800: category = "GU"
    if start_page > 3500: category = "OBGYN"

    chunk_text = ""
    for i in range(start_page, end_page):
        chunk_text += f"\n--- PAGE {i} ---\n"
        chunk_text += doc.load_page(i).get_text()

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": EXTRACTION_PROMPT},
                {"role": "user", "content": f"CURRENT CATEGORY: {category}\nTEXT:\n{chunk_text}"}
            ]
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        
        entities = json.loads(content)
        success_count = 0
        for entity in entities:
            if not entity.get("category"):
                entity["category"] = category
            if ingest_to_convex(client, entity):
                success_count += 1
        
        print(f"Done Pages {start_page}-{end_page-1}: Found {len(entities)} entities, Ingested {success_count}.")
        return list(range(start_page, end_page))
    except Exception as e:
        print(f"Failed Pages {start_page}-{end_page-1}: {e}")
        return []

def main():
    if not OPENROUTER_KEYS:
        print("Error: No OpenRouter keys found in .env")
        return

    global completed_pages
    completed_pages = load_progress()
    
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    chunk_size = 5
    
    # Identify pages to process
    # Skip TOC (0-13)
    all_ranges = []
    for start in range(13, total_pages, chunk_size):
        end = min(start + chunk_size, total_pages)
        # Only add if NONE of the pages in this range are completed
        if not any(p in completed_pages for p in range(start, end)):
            all_ranges.append((start, end))

    print(f"Starting extraction. {len(all_ranges)} chunks to process using {len(OPENROUTER_KEYS)} keys.")

    with ThreadPoolExecutor(max_workers=len(OPENROUTER_KEYS)) as executor:
        futures = []
        for i, page_range in enumerate(all_ranges):
            # Rotate through keys
            key = OPENROUTER_KEYS[i % len(OPENROUTER_KEYS)]
            futures.append(executor.submit(process_page_range, page_range[0], page_range[1], key))
        
        for future in as_completed(futures):
            pages = future.result()
            if pages:
                with progress_lock:
                    completed_pages.update(pages)
                save_progress()

if __name__ == "__main__":
    main()
