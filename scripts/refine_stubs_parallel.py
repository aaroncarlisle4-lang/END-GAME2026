import os
import json
import time
import subprocess
from openai import OpenAI
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# --- CONFIGURATION ---
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_KEYS = [k.strip() for k in os.environ.get("OPENROUTER_KEYS", "").split(",") if k.strip()]

REFINEMENT_MODEL = "google/gemini-2.0-flash-001" 
EMBEDDING_MODEL = "openai/text-embedding-3-small"

REFINEMENT_PROMPT = """
You are a senior radiologist. You will be provided with a medical condition name and a raw text chunk from Dahnert's Radiology Review Manual.
Re-extract the cardinal imaging features and clinical data with high precision.

### TARGET JSON SCHEMA:
{
  "entityName": "The official name",
  "category": "MSK, CNS, Chest, GI, GU, Cardiac, or OBGYN",
  "radiographicFeatures": {
    "xray": ["List of findings"],
    "us": ["List of findings"],
    "ct": ["List of findings"],
    "mri": ["List of findings"],
    "fluoroscopy": ["List of findings"],
    "nuclearMedicine": ["List of findings"]
  },
  "clinicalData": {
    "demographics": ["Age, gender, etc."],
    "associations": ["Clinical signs, syndromes"],
    "cardinalSigns": ["Pathognomonic hallmarks"]
  },
  "rawTextChunk": "A high-quality synthesized summary for RAG"
}
"""

# Thread-safe logging
print_lock = threading.Lock()

def safe_print(msg):
    with print_lock:
        print(msg, flush=True)

def get_client(key):
    return OpenAI(base_url=OPENROUTER_BASE_URL, api_key=key)

def get_embedding(client, text: str) -> List[float]:
    try:
        response = client.embeddings.create(input=[text.replace("\n", " ")[:8000]], model=EMBEDDING_MODEL)
        return response.data[0].embedding
    except: return [0.0] * 1536

def refine_stub(stub: Dict[str, Any], key: str):
    client = get_client(key)
    safe_print(f"Refining: {stub['entityName']}...")
    try:
        response = client.chat.completions.create(
            model=REFINEMENT_MODEL,
            messages=[
                {"role": "system", "content": REFINEMENT_PROMPT},
                {"role": "user", "content": f"ENTITY: {stub['entityName']}\nCATEGORY: {stub['category']}\nRAW TEXT: {stub['rawTextChunk']}"}
            ],
            response_format={"type": "json_object"}
        )
        refined = json.loads(response.choices[0].message.content)
        refined["id"] = stub["_id"]
        refined["embedding"] = get_embedding(client, refined["rawTextChunk"])
        
        # Patch the document back into Convex
        subprocess.run(["npx", "convex", "run", "rag:refineTextbookKnowledge", json.dumps(refined), "--typecheck", "disable"], capture_output=True)
        safe_print(f"Updated: {refined['entityName']}")
    except Exception as e: 
        safe_print(f"Failed {stub['entityName']}: {e}")

def main():
    if not OPENROUTER_KEYS:
        safe_print("Error: No OpenRouter keys found in .env")
        return

    safe_print(f"Starting parallel refinement pass with {len(OPENROUTER_KEYS)} agents...")
    cursor = None
    tmp_file = "scripts/stubs_temp_parallel.json"
    
    while True:
        # Fetch a batch of stubs
        args = {"limit": 20} # Fetch 20 stubs to distribute among 10 agents
        if cursor: args["cursor"] = cursor
        
        cmd = f"npx convex run rag:getStubs '{json.dumps(args)}' --typecheck disable > {tmp_file}"
        if subprocess.run(cmd, shell=True).returncode != 0: 
            safe_print("Error fetching stubs from Convex.")
            break
            
        try:
            with open(tmp_file, "r") as f:
                content = f.read()
                start_idx = content.find("{")
                if start_idx == -1: break
                data = json.loads(content[start_idx:])
        except Exception as e:
            safe_print(f"Error parsing stubs: {e}")
            break
            
        stubs, cursor = data.get("stubs", []), data.get("nextCursor")
        
        if not stubs:
            if not cursor:
                safe_print("Finished all stubs.")
                break
            else:
                # If we got 0 stubs but have a cursor, just keep loop going to next batch
                continue

        # Distribute work to 10 agents
        with ThreadPoolExecutor(max_workers=len(OPENROUTER_KEYS)) as executor:
            futures = []
            for i, stub in enumerate(stubs):
                key = OPENROUTER_KEYS[i % len(OPENROUTER_KEYS)]
                futures.append(executor.submit(refine_stub, stub, key))
            
            for future in as_completed(futures):
                future.result()

        if not cursor:
            safe_print("End of table reached.")
            break

if __name__ == "__main__":
    main()
