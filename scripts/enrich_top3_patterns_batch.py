#!/usr/bin/env python3 -u
"""
Batch enrichment of O'Brien Top 3 Differential Pattern discriminator matrices via NotebookLM.

Iterates the 344 records in `differentialPatterns` and creates/updates a `discriminators`
record for each, with `obrienRef.obrienCaseNumber` set so the patterns tab on
DifferentialsPage.tsx finds it via obrienMap lookup.

Usage:
  python3 scripts/enrich_top3_patterns_batch.py                       # All 344 patterns
  python3 scripts/enrich_top3_patterns_batch.py --category Chest      # Filter by category
  python3 scripts/enrich_top3_patterns_batch.py --dry-run             # Preview prompts only
  python3 scripts/enrich_top3_patterns_batch.py --limit 5             # Process N patterns
  python3 scripts/enrich_top3_patterns_batch.py --skip-existing       # Skip patterns with discriminator
  python3 scripts/enrich_top3_patterns_batch.py --force               # Re-enrich completed entries
"""

import subprocess, json, re, sys, time, os, argparse, tempfile
from datetime import datetime, timezone

os.environ["PYTHONUNBUFFERED"] = "1"

PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "top3_progress.json")


def run_convex(func, args_dict):
    """Run a Convex function and return parsed JSON.
    Uses a tempfile for stdout to avoid pipe buffer truncation on large queries."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp:
        tmp_path = tmp.name
    try:
        with open(tmp_path, 'w') as out_f:
            result = subprocess.run(
                ["npx", "convex", "run", func, json.dumps(args_dict)],
                stdout=out_f, stderr=subprocess.PIPE, text=True, timeout=120
            )
        if result.returncode != 0:
            raise Exception(f"Convex error: {result.stderr.strip()}")
        with open(tmp_path) as in_f:
            content = in_f.read().strip()
        return json.loads(content) if content else None
    finally:
        os.unlink(tmp_path)


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed_case_numbers": [], "failed_case_numbers": [], "last_run": None}


def save_progress(data):
    data["last_run"] = datetime.now(timezone.utc).isoformat()
    with open(PROGRESS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def fetch_top3_patterns(category=None):
    """Fetch all differentialPatterns records. Returns list of pattern dicts."""
    print("  Loading differentialPatterns from Convex...")
    records = run_convex("differentialPatterns:list", {})
    if category:
        records = [r for r in records if r.get("categoryAbbreviation") == category]
    print(f"  Found {len(records)} patterns" + (f" (category={category})" if category else ""))

    patterns = []
    for r in records:
        patterns.append({
            "obrien_case_number": r.get("obrienCaseNumber"),
            "category": r.get("categoryAbbreviation", ""),
            "section": r.get("section", ""),
            "pattern": r.get("pattern", ""),
            "diagnosis": r.get("diagnosis", ""),
            "clinical_presentation": r.get("clinicalPresentation", ""),
            "top3": r.get("top3", []),
            "additional": r.get("additional", []),
        })
    return patterns


def find_existing_discriminator(pattern_data):
    """Find existing discriminator for this O'Brien case.
    Prefer obrienRef match (most reliable); fall back to exact pattern-name match."""
    case_number = pattern_data.get("obrien_case_number")
    pattern = pattern_data["pattern"]

    results = run_convex("discriminators:searchByPattern", {"pattern": pattern})
    if not results:
        return None

    # 1. Prefer obrienRef match
    if case_number is not None:
        for r in results:
            ref = r.get("obrienRef")
            if ref and ref.get("obrienCaseNumber") == case_number:
                return r

    # 2. Exact pattern match (case-insensitive)
    exact = [r for r in results if r["pattern"].lower().strip() == pattern.lower().strip()]
    if exact:
        return exact[0]

    # 3. Substring match (last resort)
    return results[0]


def build_prompt(pattern_data):
    """Concise prompt: pattern + section + diagnosis + diff list + Part B/C instruction."""
    all_diffs = [pattern_data["diagnosis"]]
    for d in pattern_data["top3"]:
        if d not in all_diffs:
            all_diffs.append(d)
    for a in pattern_data["additional"]:
        if a not in all_diffs:
            all_diffs.append(a)

    diff_list = ", ".join(all_diffs)

    prompt = (
        f"{pattern_data['pattern']} ({pattern_data['section']}). "
        f"Correct diagnosis: {pattern_data['diagnosis']}. "
        f"Differentials: {diff_list}. "
        f"Please generate Part B enrichment JSON and Part C discriminator matrix JSON "
        f"covering ALL {len(all_diffs)} differentials listed. "
        f"CRITICAL: Every differential in Part C must have equally detailed content — "
        f"write 2-3 sentences per field for EVERY differential, not just the first few. "
        f"Do not shorten later entries."
    )
    return prompt


def query_notebooklm(prompt):
    result = subprocess.run(
        ["notebooklm", "ask", prompt, "--json"],
        capture_output=True, text=True, timeout=180
    )
    if result.returncode != 0:
        raise Exception(f"NotebookLM error: {result.stderr.strip() or result.stdout.strip()}")
    data = json.loads(result.stdout)
    if data.get("error"):
        raise Exception(f"NotebookLM error: {data.get('message', 'Unknown error')}")
    return data["answer"]


def extract_json_blocks(answer):
    """Extract Part B enrichment and Part C matrix from answer text."""
    enrichment = None
    matrix = None

    part_b_match = re.search(r'PART\s*B.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE)
    if part_b_match:
        try:
            enrichment = json.loads(part_b_match.group(1))["enrichment"]
        except (json.JSONDecodeError, KeyError):
            pass

    part_c_match = re.search(r'PART\s*C.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE)
    if part_c_match:
        try:
            matrix = json.loads(part_c_match.group(1))
        except json.JSONDecodeError:
            pass

    if not enrichment or not matrix:
        all_json = re.findall(r'```json\s*?\n?(.*?)\n?\s*?```', answer, re.DOTALL)
        for block_str in all_json:
            try:
                parsed = json.loads(block_str.strip())
                if "enrichment" in parsed and not enrichment:
                    enrichment = parsed["enrichment"]
                elif "differentials" in parsed and not matrix:
                    matrix = parsed
            except json.JSONDecodeError:
                continue

    return enrichment, matrix


def prepare_differentials(enrichment, matrix, pattern_data):
    """Merge Part B paragraphs into the correct-diagnosis row, set sortOrder + isCorrectDiagnosis."""
    diffs = matrix["differentials"]
    correct_dx = pattern_data["diagnosis"].lower().strip()
    correct_idx = -1

    for i, d in enumerate(diffs):
        d["sortOrder"] = i
        if d["diagnosis"].lower().strip() == correct_dx:
            d["isCorrectDiagnosis"] = True
            correct_idx = i
            if enrichment:
                if enrichment.get("dominantImagingFeatures"):
                    d["dominantImagingFinding"] = enrichment["dominantImagingFeatures"]
                if enrichment.get("keyDiscriminatorsVsTop"):
                    d["discriminatingKeyFeature"] = enrichment["keyDiscriminatorsVsTop"]
                if enrichment.get("associatedFindings"):
                    d["associatedFindings"] = enrichment["associatedFindings"]
        else:
            d["isCorrectDiagnosis"] = False

    # If no name match, fall back to first row as correct (NotebookLM sometimes paraphrases names)
    if correct_idx == -1 and diffs:
        diffs[0]["isCorrectDiagnosis"] = True
        if enrichment:
            if enrichment.get("dominantImagingFeatures"):
                diffs[0]["dominantImagingFinding"] = enrichment["dominantImagingFeatures"]
            if enrichment.get("keyDiscriminatorsVsTop"):
                diffs[0]["discriminatingKeyFeature"] = enrichment["keyDiscriminatorsVsTop"]
            if enrichment.get("associatedFindings"):
                diffs[0]["associatedFindings"] = enrichment["associatedFindings"]

    expected = set(
        [correct_dx] +
        [x.lower().strip() for x in pattern_data["top3"]] +
        [x.lower().strip() for x in pattern_data["additional"]]
    )
    got = set(d["diagnosis"].lower().strip() for d in diffs)
    missing = expected - got
    if missing:
        print(f"  WARNING: NotebookLM omitted differentials: {missing}")

    # Strip any keys unknown to the schema (e.g., problemCluster inside a differential)
    allowed = {
        "diagnosis", "mnemonicLetter", "sortOrder", "dominantImagingFinding",
        "distributionLocation", "demographicsClinicalContext",
        "discriminatingKeyFeature", "associatedFindings",
        "complicationsSeriousAlternatives", "isCorrectDiagnosis",
    }
    cleaned = []
    for d in diffs:
        cleaned.append({k: v for k, v in d.items() if k in allowed and v is not None})
    return cleaned


def upsert_discriminator(pattern_data, diffs, enrichment, existing_disc):
    """Create or update discriminator. Always patches obrienRef so the patterns tab finds it."""
    viva = enrichment.get("vivaSummary", "") if enrichment else ""
    pitfalls = enrichment.get("commonPitfalls", []) if enrichment else []
    next_step = enrichment.get("nextBestStep", "") if enrichment else ""

    obrien_ref = None
    if pattern_data.get("obrien_case_number") is not None:
        obrien_ref = {
            "obrienCaseNumber": pattern_data["obrien_case_number"],
            "pattern": pattern_data["pattern"],
            "top3Alignment": "direct",
        }

    if existing_disc:
        update_args = {
            "id": existing_disc["_id"],
            "differentials": diffs,
            "seriousAlternatives": [],
            "vivaSummary": viva,
            "commonPitfalls": pitfalls,
            "nextBestStep": next_step,
        }
        if obrien_ref:
            update_args["obrienRef"] = obrien_ref
        run_convex("discriminators:update", update_args)
        return existing_disc["_id"]

    create_args = {
        "pattern": pattern_data["pattern"],
        "differentials": diffs,
        "vivaSummary": viva,
        "commonPitfalls": pitfalls,
        "nextBestStep": next_step,
    }
    if obrien_ref:
        create_args["obrienRef"] = obrien_ref
    return run_convex("discriminators:create", create_args)


def enrich_pattern(pattern_data, dry_run=False):
    """Full pipeline for a single pattern. Returns True on success."""
    case_number = pattern_data.get("obrien_case_number")
    pattern = pattern_data["pattern"]
    diagnosis = pattern_data["diagnosis"]
    all_diffs = [diagnosis] + [
        d for d in pattern_data["top3"] + pattern_data["additional"] if d != diagnosis
    ]

    print(f"\n{'='*60}")
    print(f"  Case #{case_number} | {pattern_data['category']}/{pattern_data['section']}")
    print(f"  Pattern: {pattern}")
    print(f"  Diagnosis: {diagnosis}")
    print(f"  Differentials ({len(all_diffs)}): {', '.join(all_diffs[:4])}{'...' if len(all_diffs) > 4 else ''}")
    print(f"{'='*60}")

    existing_disc = find_existing_discriminator(pattern_data)
    action = "UPDATE" if existing_disc else "CREATE"
    print(f"  Discriminator: {action}" +
          (f" (id={existing_disc['_id'][:12]}...)" if existing_disc else ""))

    prompt = build_prompt(pattern_data)

    if dry_run:
        print(f"  [DRY RUN] Prompt length: {len(prompt)} chars")
        print(f"  [DRY RUN] Prompt preview:\n  {prompt[:400]}{'...' if len(prompt) > 400 else ''}")
        return True

    print("  [1/4] Querying NotebookLM...")
    answer = query_notebooklm(prompt)

    print("  [2/4] Extracting Part B + C...")
    enrichment, matrix = extract_json_blocks(answer)

    if not matrix:
        print("  WARNING: Part C missing — retrying with explicit prompt...")
        retry = prompt + "\n\nIMPORTANT: You MUST include Part B enrichment JSON and Part C discriminator matrix JSON in your response."
        answer = query_notebooklm(retry)
        enrichment, matrix = extract_json_blocks(answer)

    if not matrix:
        print(f"  FAILED — missing Part C matrix (Part B={'yes' if enrichment else 'no'})")
        return False

    print("  [3/4] Merging Part B into correct diagnosis...")
    diffs = prepare_differentials(enrichment, matrix, pattern_data)

    print(f"  [4/4] {action} discriminator in Convex...")
    disc_id = upsert_discriminator(pattern_data, diffs, enrichment, existing_disc)
    print(f"       Discriminator: {disc_id}")

    correct = next((d for d in diffs if d.get("isCorrectDiagnosis")), None)
    if correct:
        dif_len = len(correct.get("dominantImagingFinding", "") or "")
        dkf_len = len(correct.get("discriminatingKeyFeature", "") or "")
        print(f"  DONE — {len(diffs)} differentials, DIF={dif_len} chars, DKF={dkf_len} chars")
    else:
        print(f"  DONE — {len(diffs)} differentials (correct dx not name-matched)")
    return True


def main():
    parser = argparse.ArgumentParser(description="Batch enrich O'Brien Top 3 Pattern discriminator matrices via NotebookLM")
    parser.add_argument("--category", help="Filter by category abbreviation (e.g., Chest, MSK)")
    parser.add_argument("--dry-run", action="store_true", help="Preview prompts without querying NotebookLM")
    parser.add_argument("--limit", type=int, help="Process at most N patterns")
    parser.add_argument("--skip-existing", action="store_true", help="Skip patterns that already have a discriminator")
    parser.add_argument("--force", action="store_true", help="Re-enrich completed entries (ignore progress file)")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  Top 3 Pattern Discriminator Enrichment")
    print(f"  {'[DRY RUN] ' if args.dry_run else ''}Category: {args.category or 'ALL'}")
    print(f"{'='*60}")

    patterns = fetch_top3_patterns(args.category)
    if not patterns:
        print("  No patterns found.")
        return

    progress = load_progress()
    completed = set(progress["completed_case_numbers"])

    if args.force:
        remaining = patterns
    else:
        remaining = [p for p in patterns if p["obrien_case_number"] not in completed]
    print(f"  Total: {len(patterns)}, Already done: {len(patterns) - len(remaining)}, Remaining: {len(remaining)}")

    if args.skip_existing:
        before = len(remaining)
        remaining = [p for p in remaining if not find_existing_discriminator(p)]
        print(f"  After --skip-existing: {len(remaining)} (filtered {before - len(remaining)})")

    if args.limit:
        remaining = remaining[:args.limit]
        print(f"  Limiting to: {len(remaining)}")

    if not remaining:
        print("  Nothing to process.")
        return

    success = 0
    failed = []

    for i, pat in enumerate(remaining):
        try:
            ok = enrich_pattern(pat, dry_run=args.dry_run)
            cn = pat["obrien_case_number"]
            if ok:
                success += 1
                if cn not in progress["completed_case_numbers"]:
                    progress["completed_case_numbers"].append(cn)
                if cn in progress["failed_case_numbers"]:
                    progress["failed_case_numbers"].remove(cn)
            else:
                failed.append(cn)
                if cn not in progress["failed_case_numbers"]:
                    progress["failed_case_numbers"].append(cn)
        except Exception as e:
            print(f"  ERROR: {e}")
            cn = pat["obrien_case_number"]
            failed.append(cn)
            if cn not in progress["failed_case_numbers"]:
                progress["failed_case_numbers"].append(cn)
            if "Authentication expired" in str(e) or "Redirected to" in str(e):
                print("\n  Auth expired — stopping batch. Re-authenticate and resume.")
                break

        if not args.dry_run:
            save_progress(progress)

        if i < len(remaining) - 1 and not args.dry_run:
            print("  Waiting 5s (rate limit)...")
            time.sleep(5)

    print(f"\n{'='*60}")
    print(f"  SUMMARY: {success}/{len(remaining)} enriched")
    if failed:
        print(f"  Failed case numbers: {failed[:10]}{'...' if len(failed) > 10 else ''}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
