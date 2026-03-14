import os
import json
import time
import subprocess
import fitz  # PyMuPDF
from openai import OpenAI
from typing import List, Dict, Any, Optional

# --- CONFIGURATION ---
PDF_PATH = "Knowledge source/Textbooks/review manual dahnert.pdf"
PROGRESS_FILE = "scripts/dahnert_progress.json"
CONVEX_INGEST_CMD = "npx convex run rag:ingestTextbookKnowledge"

# OpenRouter Settings
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
# Get the first key from the comma-separated list in .env
OPENROUTER_KEYS = os.environ.get("OPENROUTER_KEYS", "").split(",")
OPENROUTER_KEY = OPENROUTER_KEYS[0].strip() if OPENROUTER_KEYS else ""

LLM_MODEL = "stepfun/step-3.5-flash" # High-speed model preferred by the user
EMBEDDING_MODEL = "openai/text-embedding-3-small"

# Initialize OpenRouter Client
client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_KEY,
)

# Define the extraction prompt
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
1. Extract ALL diseases/conditions mentioned.
2. Identify the PRIMARY PAGE NUMBER for each condition from the text markers provided (e.g., --- PAGE X ---).
3. If a finding doesn't specify a modality but has √, put it in 'xray' by default unless the context implies otherwise.
4. Be 100% accurate. Do not invent data.
5. If a field has no data, return an empty list [].
6. Include clinical associations and cardinal signs.
7. The 'rawTextChunk' should be descriptive enough for semantic search.
8. IGNORE administrative text, page numbers, and headers like 'http://pdfradiology.com'.
9. IGNORE long lists of microbiological organisms or infections unless they have specific imaging signs.

Output ONLY a valid JSON array.
"""

def get_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r") as f:
            return json.load(f)
    return {"last_page": 13} # Start after TOC/Abbreviations

def save_progress(last_page):
    with open(PROGRESS_FILE, "w") as f:
        json.dump({"last_page": last_page}, f)

def get_embedding(text: str) -> List[float]:
    response = client.embeddings.create(
        input=[text.replace("\n", " ")],
        model=EMBEDDING_MODEL
    )
    return response.data[0].embedding

def ingest_to_convex(entity: Dict[str, Any]):
    # Add embedding
    try:
        entity["embedding"] = get_embedding(entity["rawTextChunk"])
        
        # Use a list for subprocess.run to avoid shell escaping issues with single quotes
        cmd = ["npx", "convex", "run", "rag:ingestTextbookKnowledge", json.dumps(entity)]
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"Successfully ingested: {entity['entityName']} (Page {entity.get('pageNumber')})")
    except subprocess.CalledProcessError as e:
        print(f"Convex Error for {entity.get('entityName')}: {e.stderr}")
    except Exception as e:
        print(f"Error ingesting {entity.get('entityName')}: {e}")

def process_chunk(pages_text: str, category: str, start_page: int):
    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": EXTRACTION_PROMPT},
                {"role": "user", "content": f"CURRENT CATEGORY: {category}\nSTARTING PAGE: {start_page}\n\nTEXT:\n{pages_text}"}
            ]
        )
        
        json_str = response.choices[0].message.content.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:-3].strip()
        
        entities = json.loads(json_str)
        for entity in entities:
            if not entity.get("category"):
                entity["category"] = category
            ingest_to_convex(entity)
    except Exception as e:
        print(f"Failed to process chunk starting at page {start_page}: {e}")

def main():
    if not OPENROUTER_KEY:
        print("Error: No OpenRouter key found in .env")
        return

    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    progress = get_progress()
    current_page = progress["last_page"]
    chunk_size = 5
    current_category = "MSK"

    print(f"Starting extraction from page {current_page} using OpenRouter ({LLM_MODEL})...")

    while current_page < total_pages:
        end_page = min(current_page + chunk_size, total_pages)
        print(f"Processing pages {current_page} to {end_page}...")
        
        chunk_text = ""
        for i in range(current_page, end_page):
            chunk_text += f"\n--- PAGE {i} ---\n"
            chunk_text += doc.load_page(i).get_text()
            
        # Detect category change
        if "CENTRAL NERVOUS SYSTEM" in chunk_text: current_category = "CNS"
        elif "CHEST" in chunk_text: current_category = "Chest"
        elif "HEART AND GREAT VESSELS" in chunk_text: current_category = "Cardiac"
        elif "GASTROINTESTINAL TRACT" in chunk_text: current_category = "GI"
        elif "UROGENITAL TRACT" in chunk_text: current_category = "GU"
        elif "OBSTETRICS AND GYNECOLOGY" in chunk_text: current_category = "OBGYN"

        process_chunk(chunk_text, current_category, current_page)
        
        current_page = end_page
        save_progress(current_page)
        time.sleep(1)

if __name__ == "__main__":
    main()
