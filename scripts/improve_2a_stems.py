#!/usr/bin/env python3 -u
"""
Batch improvement of FRCR 2A question stems via NotebookLM.
Reads from Supabase mcq_question_bank, rewrites stems to match Paper 1-4 difficulty,
writes back to Supabase. Only changes question_text — nothing else.

Usage:
  python3 scripts/improve_2a_stems.py --category Paediatrics
  python3 scripts/improve_2a_stems.py --category Paediatrics --limit 5 --dry-run
  python3 scripts/improve_2a_stems.py --category Paediatrics --validate-only

Requires:
  - NotebookLM CLI authenticated (notebooklm auth check)
  - Correct notebook selected (notebooklm use 5242a5)
  - Difficulty profile generated (python3 scripts/analyze_paper_style.py)
  - Backup table exists (mcq_question_bank_stems_backup_20260412)
"""

import subprocess, json, re, sys, time, os, argparse, hashlib
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
os.environ["PYTHONUNBUFFERED"] = "1"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.path.join(SCRIPT_DIR, "stem_progress.json")
PROFILE_FILE = os.path.join(SCRIPT_DIR, "stem_difficulty_profile.json")

CATEGORIES = [
    "Paediatrics",
    "Neuro & Head/Neck",
    "Neuro/Head & Neck",
    "Gastrointestinal",
    "MSK",
    "Genitourinary_Gynaecology_Breast",
    "Thoracic/Cardiothoracic",
]

# ---------------------------------------------------------------------------
# Progress tracking
# ---------------------------------------------------------------------------

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {
        "backup_table": "mcq_question_bank_stems_backup_20260412",
        "categories": {},
        "last_run": None,
    }

def save_progress(progress):
    progress["last_run"] = datetime.utcnow().isoformat()
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)

def get_completed_ids(progress, category):
    cat_data = progress.get("categories", {}).get(category, {})
    return {entry["id"] for entry in cat_data.get("completed", [])}

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def check_auth():
    try:
        result = subprocess.run(
            ["notebooklm", "auth", "check"],
            capture_output=True, text=True, timeout=15
        )
        return result.returncode == 0 and "pass" in result.stdout.lower()
    except Exception:
        return False

def wait_for_auth():
    print("\n" + "!" * 60)
    print("  AUTH EXPIRED — cookies need refreshing")
    print("  Run: python3 scripts/refresh_notebooklm_auth.py")
    print("  Then press Enter here to resume, or 'q' to quit.")
    print("!" * 60)
    try:
        response = input("\n  Press Enter to resume (or 'q' to quit): ").strip().lower()
        if response == 'q':
            return False
        if check_auth():
            print("  Auth restored! Resuming...")
            return True
        else:
            print("  Auth still invalid. Stopping batch.")
            return False
    except (EOFError, KeyboardInterrupt):
        return False

# ---------------------------------------------------------------------------
# Supabase access
# ---------------------------------------------------------------------------

def query_supabase(sql):
    result = subprocess.run(
        ["npx", "supabase", "db", "query", sql, "--linked"],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        raise Exception(f"Supabase error: {result.stderr.strip()}")
    data = json.loads(result.stdout)
    return data.get("rows", [])

def fetch_questions(category):
    # Escape single quotes in category name for SQL
    safe_cat = category.replace("'", "''")
    sql = (
        f"SELECT id, question_text, option_a, option_b, option_c, option_d, option_e, correct_option "
        f"FROM mcq_question_bank WHERE category = '{safe_cat}' ORDER BY display_order NULLS LAST, id;"
    )
    return query_supabase(sql)

def update_stem_in_db(question_id, new_stem):
    # Use dollar-quoting to avoid SQL injection from apostrophes in medical text
    sql = f"UPDATE mcq_question_bank SET question_text = $stem${new_stem}$stem$ WHERE id = '{question_id}';"
    query_supabase(sql)

# ---------------------------------------------------------------------------
# NotebookLM
# ---------------------------------------------------------------------------

def query_notebooklm(prompt):
    result = subprocess.run(
        ["notebooklm", "ask", prompt, "--json"],
        capture_output=True, text=True, timeout=120
    )
    if result.returncode != 0:
        raise Exception(f"NotebookLM error: {result.stderr.strip() or result.stdout.strip()}")
    data = json.loads(result.stdout)
    if data.get("error"):
        raise Exception(f"NotebookLM error: {data.get('message', 'Unknown error')}")
    return data["answer"]

# ---------------------------------------------------------------------------
# Prompt building
# ---------------------------------------------------------------------------

def load_difficulty_profile():
    if not os.path.exists(PROFILE_FILE):
        print(f"ERROR: Difficulty profile not found at {PROFILE_FILE}")
        print("Run: python3 scripts/analyze_paper_style.py")
        sys.exit(1)
    with open(PROFILE_FILE) as f:
        return json.load(f)

def get_correct_option_text(question):
    letter = question["correct_option"].strip().upper()
    key = f"option_{letter.lower()}"
    return question.get(key, "")

SHARED_INSTRUCTIONS = """Rewrite each stem to match Papers 1-4 difficulty (your sources). Rules:
- Age/sex/complaint → explicit modality → descriptive findings (exact locations, sequences, phases) → "What is the most likely diagnosis?" 50-100 words.
- Embed 1-2 discriminators that rule out wrong answers (e.g. "no restricted diffusion" excludes epidermoid).
- Describe appearance, never name the diagnosis or use buzzwords ("vertically aligned paravertebral ossifications" not "bamboo spine").
- Red herring history: history implies common condition, imaging pivots to correct answer.
- Demographics plausible for 2-3 options. Never name the diagnosis in the stem."""


def build_prompt(question, profile):
    correct_text = get_correct_option_text(question)
    letter = question['correct_option'].strip().upper()

    prompt = f"""{SHARED_INSTRUCTIONS}

CONSTRAINT: Correct answer is option {letter} ({correct_text}). Do not make any other option the obvious choice.

Original stem: {question['question_text']}

Options (fixed):
A) {question['option_a']}
B) {question['option_b']}
C) {question['option_c']}
D) {question['option_d']}
E) {question['option_e']}

Return ONLY the rewritten stem (50-100 words, ending with "?"). No labels, no preamble."""

    return prompt


def build_batch_prompt(batch, profile):
    """Build a single prompt for multiple questions. Returns prompt string."""
    parts = [SHARED_INSTRUCTIONS, ""]
    parts.append(f"Rewrite each of the {len(batch)} question stems below. Apply the techniques above to each one.")
    parts.append("CRITICAL FORMAT: After each question, output exactly one line starting with the label shown, e.g.:")
    parts.append("  STEM 1: <rewritten stem ending with ?>")
    parts.append("  STEM 2: <rewritten stem ending with ?>")
    parts.append("Output ONLY the STEM N: lines. No explanations, no preamble, no other text.\n")

    for i, q in enumerate(batch, 1):
        correct_text = get_correct_option_text(q)
        letter = q['correct_option'].strip().upper()
        parts.append(f"QUESTION {i} — correct answer is {letter} ({correct_text}):")
        parts.append(f"Stem: {q['question_text']}")
        parts.append(f"A) {q['option_a']}  B) {q['option_b']}  C) {q['option_c']}  D) {q['option_d']}  E) {q['option_e']}")
        parts.append(f"→ STEM {i}: ")
        parts.append("")

    return "\n".join(parts)


def parse_batch_response(answer, batch):
    """Parse a batched NotebookLM response into individual stems. Returns list of (stem|None)."""
    results = [None] * len(batch)
    # Match STEM N: ... up to the next STEM or end
    pattern = re.compile(r'STEM\s+(\d+)\s*:\s*(.*?)(?=STEM\s+\d+\s*:|$)', re.DOTALL | re.IGNORECASE)
    for m in pattern.finditer(answer):
        idx = int(m.group(1)) - 1
        if 0 <= idx < len(batch):
            stem = m.group(2).strip()
            # Clean up
            last_q = stem.rfind("?")
            if last_q > 0:
                stem = stem[:last_q + 1]
            stem = stem.strip().strip('"').strip("'").strip()
            results[idx] = stem if stem else None
    return results

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_stem(new_stem, question):
    """Validate the rewritten stem. Returns (is_valid, error_message)."""
    if not new_stem or not new_stem.strip():
        return False, "Empty stem"

    stem = new_stem.strip()
    word_count = len(stem.split())

    if word_count < 25:
        return False, f"Too short ({word_count} words, min 25)"
    if word_count > 400:
        return False, f"Too long ({word_count} words, max 400)"
    if not stem.endswith("?"):
        return False, "Does not end with '?'"
    if stem == question["question_text"].strip():
        return False, "Identical to original"

    # Check for NotebookLM artifacts
    artifacts = ["based on the sources", "according to the sources", "i cannot", "as an ai", "i'm unable"]
    stem_lower = stem.lower()
    for artifact in artifacts:
        if artifact in stem_lower:
            return False, f"Contains NotebookLM artifact: '{artifact}'"

    # Check correct answer text doesn't appear verbatim in stem
    correct_text = get_correct_option_text(question).strip()
    if correct_text and len(correct_text) > 5 and correct_text.lower() in stem_lower:
        return False, f"Stem contains correct answer text verbatim: '{correct_text[:50]}'"

    return True, "OK"

def extract_stem(answer):
    """Extract clean stem text from NotebookLM response."""
    stem = answer.strip()

    # Remove markdown code fences
    stem = re.sub(r'^```[a-z]*\s*\n?', '', stem)
    stem = re.sub(r'\n?```\s*$', '', stem)

    # Remove leading labels like "Here is the rewritten stem:" or "Rewritten stem:"
    stem = re.sub(r'^(?:Here is |Rewritten |New |Updated ).*?(?:stem|question)[:\s]*\n?', '', stem, flags=re.IGNORECASE)

    # Remove trailing commentary after the last question mark
    last_q = stem.rfind("?")
    if last_q > 0:
        stem = stem[:last_q + 1]

    # Remove surrounding quotes
    stem = stem.strip().strip('"').strip("'").strip()

    return stem

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Improve FRCR 2A question stems via NotebookLM")
    parser.add_argument("--category", required=True, help="Category to process")
    parser.add_argument("--limit", type=int, default=0, help="Max questions to process (0=all)")
    parser.add_argument("--dry-run", action="store_true", help="Query NotebookLM but don't write to DB")
    parser.add_argument("--validate-only", action="store_true", help="Re-validate already completed stems")
    parser.add_argument("--batch-size", type=int, default=3, help="Questions per NotebookLM call (default 3)")
    parser.add_argument("--workers", type=int, default=2, help="Parallel NotebookLM workers (default 2)")
    args = parser.parse_args()

    if args.category not in CATEGORIES:
        print(f"ERROR: Unknown category '{args.category}'")
        print(f"Valid categories: {', '.join(CATEGORIES)}")
        sys.exit(1)

    print("=" * 60)
    print(f"  FRCR 2A Stem Improvement Pipeline")
    print(f"  Category: {args.category}")
    if args.dry_run:
        print(f"  MODE: DRY RUN (no DB writes)")
    if args.validate_only:
        print(f"  MODE: VALIDATE ONLY")
    if args.limit:
        print(f"  Limit: {args.limit}")
    print("=" * 60)

    # Load difficulty profile
    profile = load_difficulty_profile()
    print(f"Difficulty profile loaded ({profile.get('extracted_at', 'unknown')})")

    # Check auth
    if not args.validate_only:
        if not check_auth():
            print("ERROR: NotebookLM auth not valid.")
            sys.exit(1)
        print("Auth OK.")

    # Load progress
    progress = load_progress()
    completed_ids = get_completed_ids(progress, args.category)
    print(f"Previously completed: {len(completed_ids)} questions")

    # Fetch questions
    print(f"\nFetching questions for '{args.category}'...")
    questions = fetch_questions(args.category)
    print(f"Found {len(questions)} questions total")

    if args.validate_only:
        # Just re-validate completed stems
        print(f"\nValidating {len(completed_ids)} completed stems...")
        valid = 0
        invalid = 0
        for q in questions:
            if q["id"] in completed_ids:
                is_valid, msg = validate_stem(q["question_text"], q)
                if not is_valid:
                    print(f"  INVALID [{q['id'][:8]}]: {msg}")
                    invalid += 1
                else:
                    valid += 1
        print(f"\nValidation: {valid} valid, {invalid} invalid")
        return

    # Filter out completed
    pending = [q for q in questions if q["id"] not in completed_ids]
    if args.limit:
        pending = pending[:args.limit]
    print(f"To process: {len(pending)} questions\n")

    if not pending:
        print("Nothing to do!")
        return

    # Initialize category in progress
    if args.category not in progress.get("categories", {}):
        progress.setdefault("categories", {})[args.category] = {
            "total": len(questions),
            "completed": [],
            "failed": [],
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": None,
        }

    # Split pending into batches
    batch_size = max(1, args.batch_size)
    batches = [pending[i:i + batch_size] for i in range(0, len(pending), batch_size)]
    print(f"Processing {len(pending)} questions in {len(batches)} batches of {batch_size} "
          f"with {args.workers} parallel workers\n")

    progress_lock = threading.Lock()
    success = 0
    failed = 0
    processed_batches = 0

    def process_batch(batch_idx, batch):
        """Process one batch of questions. Returns list of (question, new_stem|None, error|None)."""
        prompt = build_batch_prompt(batch, profile)
        try:
            answer = query_notebooklm(prompt)
            stems = parse_batch_response(answer, batch)
            parsed = sum(1 for s in stems if s is not None)
            print(f"  [batch {batch_idx+1}] NLM returned {parsed}/{len(batch)} stems in batch format"
                  + (f" — {len(batch)-parsed} falling back to individual" if parsed < len(batch) else ""), flush=True)
        except Exception as e:
            print(f"  [batch {batch_idx+1}] NLM batch call FAILED ({e}) — all {len(batch)} going individual", flush=True)
            stems = [None] * len(batch)

        results = []
        for q, stem in zip(batch, stems):
            if stem is None:
                # Fallback: retry this question individually
                try:
                    single_prompt = build_prompt(q, profile)
                    single_answer = query_notebooklm(single_prompt)
                    stem = extract_stem(single_answer)
                except Exception as e:
                    results.append((q, None, str(e)))
                    continue

            stem = extract_stem(stem) if stem else stem
            is_valid, msg = validate_stem(stem, q) if stem else (False, "Empty")
            if not is_valid:
                results.append((q, None, msg))
            else:
                results.append((q, stem, None))
        return results

    # Auth check every 30 questions
    auth_check_counter = 0
    auth_lock = threading.Lock()

    def maybe_check_auth(n):
        nonlocal auth_check_counter
        with auth_lock:
            auth_check_counter += n
            if auth_check_counter >= 30:
                auth_check_counter = 0
                return check_auth()
        return True

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(process_batch, i, b): (i, b) for i, b in enumerate(batches)}
        for future in as_completed(futures):
            batch_idx, batch = futures[future]
            processed_batches += 1
            try:
                results = future.result()
            except Exception as e:
                print(f"[batch {batch_idx+1}] FATAL: {e}")
                for q in batch:
                    failed += 1
                continue

            with progress_lock:
                for q, new_stem, error in results:
                    qid_short = q["id"][:8]
                    if error or new_stem is None:
                        print(f"  FAILED {qid_short}: {error}")
                        progress["categories"][args.category]["failed"].append({
                            "id": q["id"], "error": error or "None",
                            "timestamp": datetime.utcnow().isoformat(),
                        })
                        failed += 1
                    else:
                        old_words = len(q["question_text"].split())
                        new_words = len(new_stem.split())
                        if args.dry_run:
                            print(f"  DRY {qid_short} ({old_words}→{new_words}w): {new_stem[:100]}...")
                            success += 1
                            continue  # don't record progress in dry-run
                        else:
                            try:
                                update_stem_in_db(q["id"], new_stem)
                                print(f"  OK {qid_short} ({old_words}→{new_words}w)")
                            except Exception as e:
                                print(f"  DB ERR {qid_short}: {e}")
                                failed += 1
                                continue
                        old_hash = hashlib.sha256(q["question_text"].encode()).hexdigest()[:16]
                        progress["categories"][args.category]["completed"].append({
                            "id": q["id"], "old_stem_hash": old_hash,
                            "new_stem_length": new_words,
                            "timestamp": datetime.utcnow().isoformat(),
                        })
                        success += 1

                total_done = len(progress["categories"][args.category]["completed"])
                total_q = progress["categories"][args.category]["total"]
                print(f"[batch {processed_batches}/{len(batches)}] {total_done}/{total_q} done, "
                      f"{success} ok, {failed} failed this session")
                save_progress(progress)

    # Check if category is complete
    total_completed = len(progress["categories"][args.category]["completed"])
    total_questions = progress["categories"][args.category]["total"]
    if total_completed >= total_questions:
        progress["categories"][args.category]["completed_at"] = datetime.utcnow().isoformat()

    save_progress(progress)

    print(f"\n{'=' * 60}")
    print(f"  Session complete for {args.category}")
    print(f"  Success: {success} | Failed: {failed}")
    print(f"  Total completed: {total_completed}/{total_questions}")
    if args.dry_run:
        print(f"  (DRY RUN — no DB writes made)")
    print(f"{'=' * 60}")

    # Rollback reminder
    if not args.dry_run and success > 0:
        print(f"\n  To rollback: UPDATE mcq_question_bank q SET question_text = b.question_text")
        print(f"  FROM mcq_question_bank_stems_backup_20260412 b")
        print(f"  WHERE q.id = b.id AND b.category = '{args.category}';")

if __name__ == "__main__":
    main()
