import os
import json
import time
import subprocess
from openai import OpenAI
from typing import List, Dict, Any

# --- CONFIGURATION ---
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_KEYS = [k.strip() for k in os.environ.get("OPENROUTER_KEYS", "").split(",") if k.strip()]
OPENROUTER_KEY = OPENROUTER_KEYS[0] if OPENROUTER_KEYS else ""

REFINEMENT_MODEL = "google/gemini-2.0-flash-001" 
EMBEDDING_MODEL = "openai/text-embedding-3-small"

client = OpenAI(base_url=OPENROUTER_BASE_URL, api_key=OPENROUTER_KEY)

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

def get_embedding(text: str) -> List[float]:
    try:
        response = client.embeddings.create(input=[text.replace("\n", " ")[:8000]], model=EMBEDDING_MODEL)
        return response.data[0].embedding
    except: return [0.0] * 1536

def refine_stub(stub: Dict[str, Any]):
    print(f"Refining: {stub['entityName']}...", flush=True)
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
        refined["embedding"] = get_embedding(refined["rawTextChunk"])
        subprocess.run(["npx", "convex", "run", "rag:refineTextbookKnowledge", json.dumps(refined), "--typecheck", "disable"], capture_output=True)
        print(f"Updated: {refined['entityName']}", flush=True)
    except Exception as e: 
        print(f"Failed {stub['entityName']}: {e}", flush=True)

def main():
    print("Starting refinement pass...", flush=True)
    cursor = None
    tmp_file = "scripts/stubs_temp.json"
    while True:
        args = {"limit": 10}
        if cursor: args["cursor"] = cursor
        
        print(f"Fetching stubs (cursor: {cursor})...", flush=True)
        # Use file redirection to bypass shell pipe limits
        cmd = f"npx convex run rag:getStubs '{json.dumps(args)}' --typecheck disable > {tmp_file}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0: 
            print(f"Error calling getStubs: {result.stderr}", flush=True)
            break
            
        try:
            with open(tmp_file, "r") as f:
                content = f.read()
                # Find the JSON start
                start_idx = content.find("{")
                if start_idx == -1:
                    print(f"No JSON found in output: {content[:100]}...", flush=True)
                    break
                data = json.loads(content[start_idx:])
        except Exception as e:
            print(f"Error parsing JSON from {tmp_file}: {e}", flush=True)
            break
            
        stubs, cursor = data.get("stubs", []), data.get("nextCursor")
        print(f"Retrieved {len(stubs)} stubs. Next cursor: {cursor}", flush=True)
        
        if not stubs and not cursor: break
        for stub in stubs:
            refine_stub(stub)
            time.sleep(0.5)
        if not cursor: break
    print("Refinement pass complete.", flush=True)

if __name__ == "__main__":
    main()
