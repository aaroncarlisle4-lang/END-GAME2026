#!/usr/bin/env python3
"""
extract_dahnert_v2.py — Production extraction of Dahnert's Radiology Review Manual

V2 improvements over v1 (extract_dahnert_parallel.py):
  - Model: google/gemini-2.0-flash-001 via OpenRouter (handles dense tabular format)
  - Chunk size: 2-3 pages (less context confusion)
  - Embeddings: openai/text-embedding-3-large with dimensions=1536
  - TOC-based category assignment (parsed from pages 0-13)
  - Quality gates: reject rawTextChunk < 200 chars or all-empty findings
  - Stores sourceText (raw PDF text) for future refinement
  - sourceBook = "dahnert", qualityScore computed per entity
  - Improved extraction prompt that understands Dahnert's symbols
  - Exponential backoff on rate limits
  - Manifest-based resumability via dahnert_v2_progress.json
"""

import os
import json
import re
import time
import subprocess
import fitz  # PyMuPDF
from openai import OpenAI
from typing import List, Dict, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import logging

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

PDF_PATH = "Knowledge source/Textbooks/review manual dahnert.pdf"
PROGRESS_FILE = "scripts/dahnert_v2_progress.json"
REJECT_LOG_FILE = "scripts/dahnert_v2_rejected.jsonl"
CONVEX_INGEST_CMD = "npx convex run rag:ingestTextbookKnowledge"

# OpenRouter
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_KEYS = [k.strip() for k in os.environ.get("OPENROUTER_KEYS", "").split(",") if k.strip()]

LLM_MODEL = "google/gemini-2.0-flash-001"
EMBEDDING_MODEL = "openai/text-embedding-3-large"
EMBEDDING_DIMENSIONS = 1536

# Chunking
CHUNK_SIZE = 3          # pages per chunk
TOC_END_PAGE = 14       # TOC occupies pages 0-13

# Quality gates
MIN_RAW_CHUNK_LENGTH = 200
MAX_RETRIES = 5
BASE_BACKOFF_SEC = 2.0

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("dahnert_v2")

# ═══════════════════════════════════════════════════════════════════════════════
# SHARED STATE
# ═══════════════════════════════════════════════════════════════════════════════

progress_lock = threading.Lock()
reject_lock = threading.Lock()
completed_chunks: set = set()  # set of "startPage-endPage" strings
stats = {"extracted": 0, "ingested": 0, "rejected": 0, "errors": 0}
stats_lock = threading.Lock()

# ═══════════════════════════════════════════════════════════════════════════════
# TOC-BASED CATEGORY MAP
# ═══════════════════════════════════════════════════════════════════════════════

# Dahnert's major section headers → RadQuiz categories.
# We parse the TOC to build a sorted list of (start_page, category).
# At extraction time we binary-search for the section that covers the chunk.

SECTION_TO_CATEGORY = {
    # Exact matches and common variants found in Dahnert TOC
    "bone": "MSK",
    "joints": "MSK",
    "soft tissue": "MSK",
    "musculoskeletal": "MSK",
    "skull": "Neuro",
    "brain": "Neuro",
    "spine": "Neuro",
    "central nervous system": "Neuro",
    "head and neck": "Neuro",
    "orbit": "Neuro",
    "chest": "Chest",
    "lung": "Chest",
    "mediastin": "Chest",
    "pleura": "Chest",
    "airway": "Chest",
    "heart": "Cardiac",
    "cardiac": "Cardiac",
    "pericardi": "Cardiac",
    "great vessel": "Cardiac",
    "vascular": "Cardiac",
    "gastrointestinal": "GI",
    "liver": "GI",
    "biliary": "GI",
    "pancrea": "GI",
    "spleen": "GI",
    "peritoneum": "GI",
    "mesentery": "GI",
    "esophag": "GI",
    "oesophag": "GI",
    "stomach": "GI",
    "small bowel": "GI",
    "colon": "GI",
    "rectum": "GI",
    "appendix": "GI",
    "kidney": "GU",
    "ureter": "GU",
    "bladder": "GU",
    "urinary": "GU",
    "adrenal": "GU",
    "renal": "GU",
    "retroperiton": "GU",
    "genital": "GU",
    "uterus": "Gynae",
    "ovary": "Gynae",
    "obstetric": "Gynae",
    "gynecol": "Gynae",
    "breast": "Breast",
    "mammogra": "Breast",
    "pediatric": "Paeds",
    "paediatric": "Paeds",
    "neonatal": "Paeds",
    "nuclear medicine": "NucMed",
    "scintigra": "NucMed",
    "pet": "NucMed",
    "ultrasound": "US",
    "ear": "ENT",
    "nose": "ENT",
    "sinus": "ENT",
    "temporal bone": "ENT",
    "larynx": "ENT",
    "pharynx": "ENT",
    "interventional": "VIR",
    "angiogra": "VIR",
}


def parse_toc_categories(doc: fitz.Document) -> List[Tuple[int, str]]:
    """
    Parse TOC pages (0-13) to build a sorted list of (page_number, category).
    Falls back to built-in outline if fitz can extract it.
    """
    # Try the built-in PDF outline first
    toc = doc.get_toc(simple=True)  # list of [level, title, page]
    category_ranges: List[Tuple[int, str]] = []

    if toc:
        for level, title, page in toc:
            if level > 2:
                continue
            title_lower = title.lower().strip()
            for keyword, cat in SECTION_TO_CATEGORY.items():
                if keyword in title_lower:
                    category_ranges.append((page, cat))
                    break

    # If outline extraction yielded results, sort and return
    if category_ranges:
        category_ranges.sort(key=lambda x: x[0])
        log.info(f"Parsed {len(category_ranges)} TOC section entries from PDF outline.")
        return category_ranges

    # Fallback: text-scan the first 14 pages for section headers
    log.info("PDF outline empty; scanning TOC pages for section headers...")
    toc_text = ""
    for i in range(min(TOC_END_PAGE, len(doc))):
        toc_text += doc.load_page(i).get_text()

    # Look for lines like "Bone and Soft-Tissue Disorders  123" (title + page number)
    pattern = re.compile(r"^(.+?)\s{2,}(\d{1,4})\s*$", re.MULTILINE)
    for match in pattern.finditer(toc_text):
        title_candidate = match.group(1).strip().lower()
        page_num = int(match.group(2))
        for keyword, cat in SECTION_TO_CATEGORY.items():
            if keyword in title_candidate:
                category_ranges.append((page_num, cat))
                break

    category_ranges.sort(key=lambda x: x[0])
    log.info(f"Scanned {len(category_ranges)} section entries from TOC text.")
    return category_ranges


def category_for_page(page: int, toc_ranges: List[Tuple[int, str]]) -> str:
    """Binary search for the category that covers `page`."""
    if not toc_ranges:
        return "General"
    result = "General"
    for start_page, cat in toc_ranges:
        if start_page <= page:
            result = cat
        else:
            break
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# PROGRESS / RESUME
# ═══════════════════════════════════════════════════════════════════════════════

def load_progress() -> set:
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r") as f:
                data = json.load(f)
                return set(data.get("completed_chunks", []))
        except Exception:
            return set()
    return set()


def save_progress():
    with progress_lock:
        with open(PROGRESS_FILE, "w") as f:
            json.dump({
                "completed_chunks": sorted(completed_chunks),
                "stats": stats,
            }, f, indent=2)


def log_rejection(reason: str, entity: Dict[str, Any], chunk_key: str):
    with reject_lock:
        with open(REJECT_LOG_FILE, "a") as f:
            f.write(json.dumps({
                "reason": reason,
                "chunk": chunk_key,
                "entityName": entity.get("entityName", ""),
                "rawTextChunkLen": len(entity.get("rawTextChunk", "")),
            }) + "\n")
    with stats_lock:
        stats["rejected"] += 1


# ═══════════════════════════════════════════════════════════════════════════════
# OPENROUTER CLIENT HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def get_client(key: str) -> OpenAI:
    return OpenAI(base_url=OPENROUTER_BASE_URL, api_key=key)


def call_with_backoff(fn, *args, max_retries=MAX_RETRIES, **kwargs):
    """Call `fn` with exponential backoff on rate-limit / transient errors."""
    for attempt in range(max_retries):
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            err_str = str(e).lower()
            is_rate_limit = "429" in err_str or "rate" in err_str or "quota" in err_str
            is_transient = "500" in err_str or "502" in err_str or "503" in err_str or "timeout" in err_str

            if (is_rate_limit or is_transient) and attempt < max_retries - 1:
                wait = BASE_BACKOFF_SEC * (2 ** attempt)
                log.warning(f"Retry {attempt+1}/{max_retries} after {wait:.1f}s — {e}")
                time.sleep(wait)
            else:
                raise


def get_embedding(client: OpenAI, text: str) -> List[float]:
    """Generate embedding via text-embedding-3-large with 1536 dimensions."""
    # Clip to safe token boundary (~8000 chars ≈ 2000 tokens)
    truncated = text.replace("\n", " ")[:8000]

    def _embed():
        resp = client.embeddings.create(
            input=[truncated],
            model=EMBEDDING_MODEL,
            dimensions=EMBEDDING_DIMENSIONS,
        )
        return resp.data[0].embedding

    return call_with_backoff(_embed)


# ═══════════════════════════════════════════════════════════════════════════════
# EXTRACTION PROMPT (V2)
# ═══════════════════════════════════════════════════════════════════════════════

EXTRACTION_PROMPT = """You are a specialist radiology knowledge extractor. You are processing pages from Dahnert's Radiology Review Manual — a dense reference textbook with a distinctive tabular/outline format.

### DAHNERT SYMBOL KEY
The text uses these symbols extensively:
  √  = radiologic sign or imaging finding
  •  = clinical sign or symptom
  @  = anatomic location
  ◊  = important comment, pearl, or classic teaching point
  ►  = subheading / modality-specific findings

Modality headers appear as:
  "MR:", "MR Imaging:", "CT:", "CECT:", "NECT:", "US:", "Ultrasound:", "Radiographs:", "Plain film:", "Angio:", "Angiography:", "Fluoroscopy:", "Barium:", "NUC:", "Nuclear Medicine:", "Scintigraphy:", "PET:", "Mammography:", "MRA:", "CTA:"

### TASK
Extract ALL discrete diseases, conditions, or diagnostic entities from the text below. For EACH entity, produce a JSON object. Return a JSON array of objects.

### OUTPUT SCHEMA (per entity)
{
  "entityName": "Official name of the disease/condition — use the EXACT heading from Dahnert",
  "category": "<CATEGORY>",
  "radiographicFeatures": {
    "xray": ["Finding 1 from plain film / radiograph lines or √ symbols without modality prefix"],
    "us": ["Finding from US / Ultrasound sections"],
    "ct": ["Finding from CT / CECT / NECT sections"],
    "mri": ["Finding from MR / MRI sections"],
    "fluoroscopy": ["Finding from Fluoroscopy / Barium sections"],
    "nuclearMedicine": ["Finding from NUC / Scintigraphy / PET sections"]
  },
  "clinicalData": {
    "demographics": ["Age/sex predilection, prevalence, incidence"],
    "associations": ["Syndromes, risk factors, associated conditions (often marked •)"],
    "cardinalSigns": ["Pathognomonic signs, 'Aunt Minnie' findings, classic pearls (often marked ◊)"]
  },
  "rawTextChunk": "A rich markdown summary ≥200 chars synthesizing: entity name, key demographics, ALL imaging findings by modality, classic signs, and important pearls. This text will be embedded for RAG search, so include all searchable terms.",
  "pageNumber": 123,
  "sourceReference": "Dahnert Review Manual - <CATEGORY> Section"
}

### RULES
1. Extract EVERY disease/condition heading you can identify — do not skip entries.
2. The CATEGORY placeholder has been filled in the user message based on TOC analysis. Use it unless the text clearly belongs to a different system.
3. Findings prefixed with √ but no modality header → put in "xray" by default.
4. The rawTextChunk MUST be ≥200 characters. Synthesize the entity name + ALL findings + demographics + associations + pearls into a flowing markdown paragraph. Do NOT just copy the entity name.
5. Be 100% faithful to the source text. Do NOT invent findings.
6. If a field has no data, use an empty array [].
7. Skip pure index entries, page references, or bibliography items.
8. If you find multiple entities on the same page, return separate objects for each.
9. Use the page markers (--- PAGE X ---) to set pageNumber accurately.

Output ONLY a valid JSON array. No commentary, no markdown fences."""


# ═══════════════════════════════════════════════════════════════════════════════
# QUALITY SCORING
# ═══════════════════════════════════════════════════════════════════════════════

def compute_quality_score(entity: Dict[str, Any]) -> float:
    """
    Compute a 0-10 quality score based on:
      - rawTextChunk length (0-3 points)
      - Total findings count across modalities (0-4 points)
      - Clinical data richness (0-3 points)
    """
    score = 0.0

    # rawTextChunk length: 200-400 → 1pt, 400-800 → 2pt, 800+ → 3pt
    chunk_len = len(entity.get("rawTextChunk", ""))
    if chunk_len >= 800:
        score += 3.0
    elif chunk_len >= 400:
        score += 2.0
    elif chunk_len >= 200:
        score += 1.0

    # Findings count across all modalities
    rf = entity.get("radiographicFeatures", {})
    total_findings = sum(
        len(rf.get(mod, []) or [])
        for mod in ("xray", "us", "ct", "mri", "fluoroscopy", "nuclearMedicine")
    )
    if total_findings >= 10:
        score += 4.0
    elif total_findings >= 5:
        score += 3.0
    elif total_findings >= 2:
        score += 2.0
    elif total_findings >= 1:
        score += 1.0

    # Clinical data richness
    cd = entity.get("clinicalData", {})
    clinical_items = sum(
        len(cd.get(field, []) or [])
        for field in ("demographics", "associations", "cardinalSigns")
    )
    if clinical_items >= 5:
        score += 3.0
    elif clinical_items >= 3:
        score += 2.0
    elif clinical_items >= 1:
        score += 1.0

    return round(score, 1)


def passes_quality_gate(entity: Dict[str, Any], chunk_key: str) -> bool:
    """Return True if entity passes quality gates, else log rejection and return False."""
    # Gate 1: rawTextChunk length
    chunk_len = len(entity.get("rawTextChunk", ""))
    if chunk_len < MIN_RAW_CHUNK_LENGTH:
        log_rejection(f"rawTextChunk too short ({chunk_len} chars)", entity, chunk_key)
        return False

    # Gate 2: At least one finding across all arrays
    rf = entity.get("radiographicFeatures", {})
    cd = entity.get("clinicalData", {})
    total_findings = sum(
        len(rf.get(mod, []) or [])
        for mod in ("xray", "us", "ct", "mri", "fluoroscopy", "nuclearMedicine")
    )
    total_clinical = sum(
        len(cd.get(field, []) or [])
        for field in ("demographics", "associations", "cardinalSigns")
    )
    if total_findings == 0 and total_clinical == 0:
        log_rejection("All finding and clinical arrays empty", entity, chunk_key)
        return False

    return True


# ═══════════════════════════════════════════════════════════════════════════════
# CONVEX INGESTION
# ═══════════════════════════════════════════════════════════════════════════════

def ingest_to_convex(client: OpenAI, entity: Dict[str, Any]) -> bool:
    """Embed + ingest a single entity into Convex via CLI."""
    try:
        # Compute embedding
        entity["embedding"] = get_embedding(client, entity["rawTextChunk"])

        # Ensure all required nested objects have correct shape
        rf = entity.setdefault("radiographicFeatures", {})
        for mod in ("xray", "us", "ct", "mri", "fluoroscopy", "nuclearMedicine"):
            if mod not in rf or rf[mod] is None:
                rf[mod] = []

        cd = entity.setdefault("clinicalData", {})
        for field in ("demographics", "associations", "cardinalSigns"):
            if field not in cd or cd[field] is None:
                cd[field] = []

        # Build the payload — only include fields the mutation accepts
        payload = {
            "entityName": entity["entityName"],
            "category": entity["category"],
            "radiographicFeatures": rf,
            "clinicalData": cd,
            "rawTextChunk": entity["rawTextChunk"],
            "embedding": entity["embedding"],
            "sourceBook": entity.get("sourceBook", "dahnert"),
            "sourceText": entity.get("sourceText", ""),
            "qualityScore": entity.get("qualityScore", 0),
        }
        if "pageNumber" in entity and entity["pageNumber"] is not None:
            payload["pageNumber"] = entity["pageNumber"]
        if "sourceReference" in entity and entity["sourceReference"]:
            payload["sourceReference"] = entity["sourceReference"]

        cmd = [
            "npx", "convex", "run", "rag:ingestTextbookKnowledge",
            json.dumps(payload),
            "--typecheck", "disable",
        ]
        result = subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=60)
        return True
    except subprocess.TimeoutExpired:
        log.error(f"Convex ingestion timed out for: {entity.get('entityName')}")
        return False
    except Exception as e:
        log.error(f"Convex ingestion failed for {entity.get('entityName')}: {e}")
        return False


# ═══════════════════════════════════════════════════════════════════════════════
# CORE EXTRACTION WORKER
# ═══════════════════════════════════════════════════════════════════════════════

def extract_chunk(
    start_page: int,
    end_page: int,
    key: str,
    toc_ranges: List[Tuple[int, str]],
) -> Optional[str]:
    """
    Process a single chunk of pages: extract text, call LLM, quality-gate,
    embed, and ingest. Returns the chunk key on success, None on failure.
    """
    chunk_key = f"{start_page}-{end_page}"
    client = get_client(key)

    # Determine category from TOC mapping (use middle page of chunk)
    mid_page = (start_page + end_page) // 2
    category = category_for_page(mid_page, toc_ranges)

    # Extract raw text from PDF
    doc = fitz.open(PDF_PATH)
    source_text_parts = []
    chunk_text = ""
    for i in range(start_page, min(end_page, len(doc))):
        page_text = doc.load_page(i).get_text()
        source_text_parts.append(page_text)
        chunk_text += f"\n--- PAGE {i} ---\n{page_text}"
    doc.close()

    source_text = "\n\n".join(source_text_parts)

    # Skip nearly-empty pages (index, bibliography, etc.)
    if len(chunk_text.strip()) < 100:
        log.info(f"Chunk {chunk_key}: Skipped (text too short: {len(chunk_text.strip())} chars)")
        return chunk_key  # Mark as done so we don't retry

    # Call LLM with backoff
    try:
        def _call_llm():
            return client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": EXTRACTION_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"CATEGORY for this section: {category}\n\n"
                            f"TEXT (pages {start_page}-{end_page - 1}):\n{chunk_text}"
                        ),
                    },
                ],
                temperature=0.1,
                max_tokens=8192,
            )

        response = call_with_backoff(_call_llm)
    except Exception as e:
        log.error(f"Chunk {chunk_key}: LLM call failed after retries — {e}")
        with stats_lock:
            stats["errors"] += 1
        return None

    # Parse JSON response
    content = response.choices[0].message.content.strip()
    # Strip markdown fences if present
    if content.startswith("```"):
        # Remove opening fence (```json or ```)
        first_newline = content.index("\n") if "\n" in content else 3
        content = content[first_newline:].strip()
    if content.endswith("```"):
        content = content[:-3].strip()

    try:
        entities = json.loads(content)
    except json.JSONDecodeError as e:
        log.error(f"Chunk {chunk_key}: JSON parse failed — {e}")
        log.debug(f"Raw content: {content[:500]}")
        with stats_lock:
            stats["errors"] += 1
        return None

    if not isinstance(entities, list):
        entities = [entities]

    # Process each entity
    ingested_count = 0
    extracted_count = len(entities)

    for entity in entities:
        if not entity.get("entityName"):
            continue

        # Override / fill fields
        if not entity.get("category"):
            entity["category"] = category
        entity["sourceBook"] = "dahnert"
        entity["sourceText"] = source_text[:16000]  # Cap at ~16k chars
        entity["qualityScore"] = compute_quality_score(entity)

        if not entity.get("sourceReference"):
            entity["sourceReference"] = f"Dahnert Review Manual - {entity['category']} Section"

        # Quality gate
        if not passes_quality_gate(entity, chunk_key):
            continue

        with stats_lock:
            stats["extracted"] += 1

        # Ingest
        if ingest_to_convex(client, entity):
            ingested_count += 1
            with stats_lock:
                stats["ingested"] += 1

    log.info(
        f"Chunk {chunk_key} ({category}): "
        f"Extracted {extracted_count}, Passed QA {extracted_count - (extracted_count - ingested_count)}, "
        f"Ingested {ingested_count}"
    )
    return chunk_key


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    if not OPENROUTER_KEYS:
        log.error("No OpenRouter keys found. Set OPENROUTER_KEYS as comma-separated in .env or environment.")
        return

    global completed_chunks
    completed_chunks = load_progress()
    log.info(f"Loaded progress: {len(completed_chunks)} chunks already completed.")

    # Open PDF to get total pages and parse TOC
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    log.info(f"PDF has {total_pages} pages.")

    # Parse TOC for category assignment
    toc_ranges = parse_toc_categories(doc)
    if toc_ranges:
        log.info("TOC category map:")
        for page, cat in toc_ranges:
            log.info(f"  Page {page:>5} → {cat}")
    else:
        log.warning("No TOC entries found — falling back to 'General' for all pages.")

    doc.close()

    # Build chunk manifest (skip TOC pages 0-13)
    all_chunks: List[Tuple[int, int]] = []
    for start in range(TOC_END_PAGE, total_pages, CHUNK_SIZE):
        end = min(start + CHUNK_SIZE, total_pages)
        chunk_key = f"{start}-{end}"
        if chunk_key not in completed_chunks:
            all_chunks.append((start, end))

    num_workers = len(OPENROUTER_KEYS)
    log.info(
        f"Starting extraction: {len(all_chunks)} chunks to process, "
        f"{num_workers} workers (keys), "
        f"chunk size = {CHUNK_SIZE} pages."
    )

    # Clear reject log for this run (append mode in log_rejection)
    if not completed_chunks and os.path.exists(REJECT_LOG_FILE):
        os.remove(REJECT_LOG_FILE)

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = {}
        for i, (start, end) in enumerate(all_chunks):
            key = OPENROUTER_KEYS[i % num_workers]
            future = executor.submit(extract_chunk, start, end, key, toc_ranges)
            futures[future] = f"{start}-{end}"

        done_count = 0
        total_count = len(futures)

        for future in as_completed(futures):
            chunk_key = futures[future]
            try:
                result = future.result()
                if result:
                    with progress_lock:
                        completed_chunks.add(result)
                    save_progress()
                    done_count += 1
                else:
                    log.warning(f"Chunk {chunk_key} failed — will retry on next run.")
            except Exception as e:
                log.error(f"Chunk {chunk_key} raised exception: {e}")
                with stats_lock:
                    stats["errors"] += 1

            # Progress report every 10 chunks
            if done_count % 10 == 0:
                log.info(
                    f"Progress: {done_count}/{total_count} chunks | "
                    f"Extracted: {stats['extracted']} | "
                    f"Ingested: {stats['ingested']} | "
                    f"Rejected: {stats['rejected']} | "
                    f"Errors: {stats['errors']}"
                )

    # Final report
    save_progress()
    log.info("=" * 70)
    log.info("EXTRACTION COMPLETE")
    log.info(f"  Chunks processed: {done_count}/{total_count}")
    log.info(f"  Entities extracted: {stats['extracted']}")
    log.info(f"  Entities ingested: {stats['ingested']}")
    log.info(f"  Entities rejected: {stats['rejected']}")
    log.info(f"  Errors: {stats['errors']}")
    log.info(f"  Progress file: {PROGRESS_FILE}")
    log.info(f"  Rejection log: {REJECT_LOG_FILE}")
    log.info("=" * 70)


if __name__ == "__main__":
    main()
