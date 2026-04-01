#!/usr/bin/env python3 -u
"""
Batch enrichment of High-Yield differential pattern discriminator matrices via NotebookLM.
Revamps existing suboptimal discriminator content with textbook-quality data.

Usage:
  python3 scripts/enrich_highyield_batch.py                    # All patterns
  python3 scripts/enrich_highyield_batch.py --category MSK     # Filter by category
  python3 scripts/enrich_highyield_batch.py --dry-run          # Preview prompts only
  python3 scripts/enrich_highyield_batch.py --limit 5          # Process N patterns
  python3 scripts/enrich_highyield_batch.py --skip-existing    # Only patterns without discriminator
"""

import subprocess, json, re, sys, time, os, argparse
from datetime import datetime, timezone

os.environ["PYTHONUNBUFFERED"] = "1"

PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "highyield_progress.json")


def run_convex(func, args_dict):
    """Run a Convex function and return parsed JSON.
    Uses stdin for large payloads to avoid shell arg limits."""
    args_json = json.dumps(args_dict)
    # Use a temp file for input to avoid truncation of large outputs
    result = subprocess.run(
        ["npx", "convex", "run", func, args_json],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        raise Exception(f"Convex error: {result.stderr.strip()}")
    return json.loads(result.stdout) if result.stdout.strip() else None


def load_progress():
    """Load progress tracking file."""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed_patterns": [], "failed_patterns": [], "last_run": None}


def save_progress(data):
    """Save progress tracking file."""
    data["last_run"] = datetime.now(timezone.utc).isoformat()
    with open(PROGRESS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def fetch_highyield_patterns(category=None):
    """Fetch all high-yield clusters with populated data.
    Returns list of pattern dicts."""

    print("  Loading high-yield clusters from Convex...")
    clusters = run_convex("highYield:getHighYieldClusters", {})

    # Filter to pattern-sourced clusters only
    pattern_clusters = [c for c in clusters if c.get("sourceType") == "pattern" and c.get("populatedData")]
    if category:
        pattern_clusters = [c for c in pattern_clusters if c.get("category") == category]

    print(f"  Found {len(pattern_clusters)} pattern-sourced clusters" +
          (f" (category={category})" if category else ""))

    # Extract pattern data from populated clusters
    patterns = []
    for c in pattern_clusters:
        pd = c["populatedData"]
        patterns.append({
            "cluster_id": c["_id"],
            "cluster_name": c.get("clusterName", ""),
            "category": c.get("category", ""),
            "obrien_case_number": pd.get("obrienCaseNumber"),
            "section": pd.get("section", ""),
            "pattern": pd.get("pattern", ""),
            "diagnosis": pd.get("diagnosis", ""),
            "clinical_presentation": pd.get("clinicalPresentation", ""),
            "top3": pd.get("top3", []),
            "additional": pd.get("additional", []),
        })

    return patterns


def find_existing_discriminator(pattern_data):
    """Find existing discriminator by searching by pattern name."""
    results = run_convex("discriminators:searchByPattern", {"pattern": pattern_data["pattern"]})
    if results:
        # Prefer exact match
        exact = [r for r in results if r["pattern"].lower().strip() == pattern_data["pattern"].lower().strip()]
        return exact[0] if exact else results[0]
    return None


def format_existing_discriminator(disc):
    """Format existing discriminator content for the prompt."""
    if not disc or not disc.get("differentials"):
        return ""

    lines = ["\nCURRENT CONTENT (for reference — your response should REPLACE this entirely with better content):"]
    for i, d in enumerate(disc["differentials"]):
        correct = " [CORRECT]" if d.get("isCorrectDiagnosis") else ""
        lines.append(f"\n  {i+1}. {d['diagnosis']}{correct}")
        for field in ["dominantImagingFinding", "distributionLocation", "demographicsClinicalContext",
                       "discriminatingKeyFeature", "associatedFindings", "complicationsSeriousAlternatives"]:
            val = d.get(field, "")
            if val:
                lines.append(f"     {field}: {val[:200]}{'...' if len(val) > 200 else ''}")

    if disc.get("vivaSummary"):
        lines.append(f"\n  vivaSummary: {disc['vivaSummary'][:200]}")
    if disc.get("commonPitfalls"):
        lines.append(f"  commonPitfalls: {disc['commonPitfalls']}")
    if disc.get("nextBestStep"):
        lines.append(f"  nextBestStep: {disc['nextBestStep'][:200]}")

    return "\n".join(lines)


def build_prompt(pattern_data, existing_disc):
    """Build the NotebookLM prompt for a high-yield pattern.
    Kept concise to stay within NotebookLM's input limits."""
    all_diffs = [pattern_data["diagnosis"]] + pattern_data["top3"]
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
    """Query NotebookLM and return the answer text."""
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
    # Part B
    part_b_match = re.search(r'PART\s*B.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE)
    enrichment = None
    if part_b_match:
        try:
            enrichment = json.loads(part_b_match.group(1))["enrichment"]
        except (json.JSONDecodeError, KeyError):
            pass

    # Part C
    part_c_match = re.search(r'PART\s*C.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE)
    matrix = None
    if part_c_match:
        try:
            matrix = json.loads(part_c_match.group(1))
        except json.JSONDecodeError:
            pass

    # Fallback: try any JSON code blocks if Part-labeled regex failed
    if not enrichment or not matrix:
        all_json = re.findall(r'```json\s*?\n?(.*?)\n?\s*?```', answer, re.DOTALL)
        for block_str in all_json:
            block_str = block_str.strip()
            try:
                parsed = json.loads(block_str)
                if "enrichment" in parsed and not enrichment:
                    enrichment = parsed["enrichment"]
                elif "differentials" in parsed and not matrix:
                    matrix = parsed
            except json.JSONDecodeError:
                continue

    return enrichment, matrix


def prepare_differentials(enrichment, matrix, pattern_data):
    """Merge Part B into correct diagnosis, prepare differentials array."""
    diffs = matrix["differentials"]
    correct_dx = pattern_data["diagnosis"].lower().strip()

    for i, d in enumerate(diffs):
        d["sortOrder"] = i
        if d["diagnosis"].lower().strip() == correct_dx:
            d["isCorrectDiagnosis"] = True
            # Overwrite correct diagnosis with Part B's rich paragraphs
            if enrichment:
                if enrichment.get("dominantImagingFeatures"):
                    d["dominantImagingFinding"] = enrichment["dominantImagingFeatures"]
                if enrichment.get("keyDiscriminatorsVsTop"):
                    d["discriminatingKeyFeature"] = enrichment["keyDiscriminatorsVsTop"]
                if enrichment.get("associatedFindings"):
                    d["associatedFindings"] = enrichment["associatedFindings"]
        else:
            d["isCorrectDiagnosis"] = False

    # Validate coverage
    expected = set(
        [correct_dx] +
        [x.lower().strip() for x in pattern_data["top3"]] +
        [x.lower().strip() for x in pattern_data["additional"]]
    )
    got = set(d["diagnosis"].lower().strip() for d in diffs)
    missing = expected - got
    if missing:
        print(f"  WARNING: NotebookLM omitted differentials: {missing}")

    return diffs


def upsert_discriminator(pattern_data, diffs, enrichment, existing_disc):
    """Create or update discriminator in Convex. Returns discriminator ID."""
    viva = enrichment.get("vivaSummary", "") if enrichment else ""
    pitfalls = enrichment.get("commonPitfalls", []) if enrichment else []
    next_step = enrichment.get("nextBestStep", "") if enrichment else ""

    if existing_disc:
        # Update existing — clear seriousAlternatives since our differentials cover them
        update_args = {
            "id": existing_disc["_id"],
            "differentials": diffs,
            "seriousAlternatives": [],
            "vivaSummary": viva,
            "commonPitfalls": pitfalls,
            "nextBestStep": next_step,
        }
        run_convex("discriminators:update", update_args)
        return existing_disc["_id"]
    else:
        # Create new
        create_args = {
            "pattern": pattern_data["pattern"],
            "differentials": diffs,
            "vivaSummary": viva,
            "commonPitfalls": pitfalls,
            "nextBestStep": next_step,
        }
        # Add obrienRef for UI lookup
        if pattern_data.get("obrien_case_number"):
            create_args["obrienRef"] = {
                "obrienCaseNumber": pattern_data["obrien_case_number"],
                "pattern": pattern_data["pattern"],
                "top3Alignment": "direct",
            }
        disc_id = run_convex("discriminators:create", create_args)
        return disc_id


def enrich_pattern(pattern_data, dry_run=False):
    """Full pipeline for a single high-yield pattern. Returns True on success."""
    pattern = pattern_data["pattern"]
    diagnosis = pattern_data["diagnosis"]
    all_diffs = [diagnosis] + pattern_data["top3"] + [
        a for a in pattern_data["additional"] if a not in pattern_data["top3"]
    ]

    print(f"\n{'='*60}")
    print(f"  Pattern: {pattern}")
    print(f"  Diagnosis: {diagnosis}")
    print(f"  Differentials: {len(all_diffs)} ({', '.join(all_diffs[:4])}{'...' if len(all_diffs) > 4 else ''})")
    print(f"{'='*60}")

    # Find existing discriminator by pattern name search
    existing_disc = find_existing_discriminator(pattern_data)
    action = "UPDATE" if existing_disc else "CREATE"
    print(f"  Discriminator: {action}" +
          (f" (id={existing_disc['_id'][:12]}...)" if existing_disc else ""))

    # Build prompt
    prompt = build_prompt(pattern_data, existing_disc)

    if dry_run:
        print(f"  [DRY RUN] Prompt length: {len(prompt)} chars")
        print(f"  [DRY RUN] First 500 chars of prompt:")
        print(f"  {prompt[:500]}...")
        return True

    # Query NotebookLM
    print("  [1/4] Querying NotebookLM...")
    answer = query_notebooklm(prompt)

    # Extract JSON
    print("  [2/4] Extracting Part B + C...")
    enrichment, matrix = extract_json_blocks(answer)

    if not enrichment:
        print("  WARNING: Part B missing — retrying with explicit prompt...")
        retry_prompt = prompt + "\n\nIMPORTANT: You MUST include Part B enrichment JSON and Part C discriminator matrix JSON in your response."
        answer = query_notebooklm(retry_prompt)
        enrichment, matrix = extract_json_blocks(answer)

    if not matrix:
        print(f"  FAILED — missing Part C matrix (Part B={'yes' if enrichment else 'no'})")
        return False

    # Prepare differentials
    print("  [3/4] Merging Part B into correct diagnosis...")
    diffs = prepare_differentials(enrichment, matrix, pattern_data)

    # Upsert discriminator
    print(f"  [4/4] {action} discriminator in Convex...")
    disc_id = upsert_discriminator(pattern_data, diffs, enrichment, existing_disc)
    print(f"       Discriminator: {disc_id}")

    # Log quality metrics
    correct_diff = next((d for d in diffs if d.get("isCorrectDiagnosis")), None)
    if correct_diff:
        dif_len = len(correct_diff.get("dominantImagingFinding", ""))
        dkf_len = len(correct_diff.get("discriminatingKeyFeature", ""))
        print(f"  DONE — {len(diffs)} differentials, DIF={dif_len} chars, DKF={dkf_len} chars")
    else:
        print(f"  DONE — {len(diffs)} differentials (correct diagnosis not matched by name)")

    return True


def main():
    parser = argparse.ArgumentParser(description="Batch enrich High-Yield discriminator matrices via NotebookLM")
    parser.add_argument("--category", help="Filter by category (e.g., MSK, Chest)")
    parser.add_argument("--dry-run", action="store_true", help="Preview prompts without querying NotebookLM")
    parser.add_argument("--limit", type=int, help="Process at most N patterns")
    parser.add_argument("--skip-existing", action="store_true", help="Skip patterns that already have a discriminator")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  High-Yield Discriminator Enrichment")
    print(f"  {'[DRY RUN] ' if args.dry_run else ''}Category: {args.category or 'ALL'}")
    print(f"{'='*60}")

    # Fetch data
    patterns = fetch_highyield_patterns(args.category)

    if not patterns:
        print("  No patterns found.")
        return

    # Load progress
    progress = load_progress()
    completed = set(progress["completed_patterns"])

    # Filter out already-completed patterns
    remaining = [p for p in patterns if p["pattern"] not in completed]
    print(f"  Total: {len(patterns)}, Already done: {len(completed)}, Remaining: {len(remaining)}")

    # Filter skip-existing
    if args.skip_existing:
        remaining = [p for p in remaining if not find_existing_discriminator(p)]
        print(f"  After skip-existing filter: {len(remaining)}")

    # Apply limit
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
            if ok:
                success += 1
                progress["completed_patterns"].append(pat["pattern"])
                # Remove from failed if it was there
                if pat["pattern"] in progress["failed_patterns"]:
                    progress["failed_patterns"].remove(pat["pattern"])
            else:
                failed.append(pat["pattern"])
                if pat["pattern"] not in progress["failed_patterns"]:
                    progress["failed_patterns"].append(pat["pattern"])
        except Exception as e:
            print(f"  ERROR: {e}")
            failed.append(pat["pattern"])
            if pat["pattern"] not in progress["failed_patterns"]:
                progress["failed_patterns"].append(pat["pattern"])
            # Check auth expiry
            if "Authentication expired" in str(e) or "Redirected to" in str(e):
                print("\n  Auth expired — stopping batch. Re-authenticate and resume.")
                break

        # Save progress after each pattern
        if not args.dry_run:
            save_progress(progress)

        # Rate limit (5s for longer prompts/responses)
        if i < len(remaining) - 1 and not args.dry_run:
            print("  Waiting 5s (rate limit)...")
            time.sleep(5)

    print(f"\n{'='*60}")
    print(f"  SUMMARY: {success}/{len(remaining)} enriched")
    if failed:
        print(f"  Failed: {', '.join(failed)}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
