#!/usr/bin/env python3 -u
"""
Batch enrichment of YJL2B cases via NotebookLM pipeline.
Usage: python3 scripts/enrich_yjl2b_batch.py <category>
"""

import subprocess, json, re, sys, time, os
os.environ["PYTHONUNBUFFERED"] = "1"

def run_convex(func, args_dict):
    """Run a Convex function and return parsed JSON."""
    result = subprocess.run(
        ["npx", "convex", "run", func, json.dumps(args_dict)],
        capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        raise Exception(f"Convex error: {result.stderr.strip()}")
    return json.loads(result.stdout) if result.stdout.strip() else None

def query_notebooklm(title):
    """Query NotebookLM for a case and return the answer text."""
    prompt = f"{title}. Please generate Part A structured viva response, Part B enrichment JSON, and Part C discriminator matrix JSON. IMPORTANT: Part C must include exactly 4 differentials (1 correct diagnosis + 3 alternatives), not fewer."
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

def extract_json_blocks(answer):
    """Extract Part B enrichment and Part C matrix from answer text."""
    # Part B
    part_b_match = re.search(r'PART\s*B.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE)
    enrichment = json.loads(part_b_match.group(1))["enrichment"] if part_b_match else None

    # Part C
    part_c_match = re.search(r'PART\s*C.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE)
    matrix = json.loads(part_c_match.group(1)) if part_c_match else None

    return enrichment, matrix

def prepare_differentials(enrichment, matrix):
    """Merge Part B into correct diagnosis, prepare differentials array."""
    diffs = matrix["differentials"]

    for i, d in enumerate(diffs):
        d["sortOrder"] = i
        if i == 0:
            d["isCorrectDiagnosis"] = True
            # CRITICAL: Overwrite correct diagnosis with Part B's rich paragraphs
            if enrichment.get("dominantImagingFeatures"):
                d["dominantImagingFinding"] = enrichment["dominantImagingFeatures"]
            if enrichment.get("keyDiscriminatorsVsTop"):
                d["discriminatingKeyFeature"] = enrichment["keyDiscriminatorsVsTop"]
            if enrichment.get("associatedFindings"):
                d["associatedFindings"] = enrichment["associatedFindings"]
        else:
            d["isCorrectDiagnosis"] = False

    return diffs

def enrich_case(case):
    """Full pipeline for a single case."""
    title = case["title"]
    case_id = case["_id"]

    print(f"\n{'='*60}")
    print(f"  Enriching: {title} (sortOrder={case['sortOrder']})")
    print(f"{'='*60}")

    # Step 1: Query NotebookLM
    print("  [1/5] Querying NotebookLM...")
    answer = query_notebooklm(title)

    # Step 2: Extract JSON
    print("  [2/5] Extracting Part B + C...")
    enrichment, matrix = extract_json_blocks(answer)

    if not enrichment:
        print("  ⚠ Part B missing — retrying with explicit prompt...")
        answer = query_notebooklm(title + " — include Part B enrichment JSON and Part C discriminator matrix JSON")
        enrichment, matrix = extract_json_blocks(answer)

    if not enrichment or not matrix:
        print(f"  ✗ FAILED — missing Part B={bool(enrichment)} Part C={bool(matrix)}")
        return False

    # Step 3: Prepare differentials with Part B enrichment
    print("  [3/5] Merging Part B into correct diagnosis...")
    diffs = prepare_differentials(enrichment, matrix)

    # Step 4: Create discriminator
    print("  [4/5] Creating discriminator in Convex...")
    create_args = {
        "pattern": matrix.get("pattern", title),
        "differentials": diffs,
        "vivaSummary": enrichment.get("vivaSummary", ""),
        "commonPitfalls": enrichment.get("commonPitfalls", []),
        "nextBestStep": enrichment.get("nextBestStep", ""),
    }
    if matrix.get("problemCluster"):
        create_args["problemCluster"] = matrix["problemCluster"]

    disc_id = run_convex("discriminators:create", create_args)
    print(f"       Discriminator: {disc_id}")

    # Step 5: Link to YJL case
    print("  [5/5] Linking to YJL case...")
    top3 = [d["diagnosis"] for d in diffs if not d.get("isCorrectDiagnosis")][:3]
    run_convex("yjlCases:update", {
        "id": case_id,
        "discriminatorId": disc_id,
        "top3Differentials": top3,
    })

    correct = diffs[0]["diagnosis"]
    print(f"  ✓ DONE — {correct} vs {', '.join(top3)}")
    print(f"       Viva: {enrichment.get('vivaSummary','')[:80]}...")
    print(f"       DIF chars: {len(diffs[0].get('dominantImagingFinding',''))}")
    print(f"       DKF chars: {len(diffs[0].get('discriminatingKeyFeature',''))}")
    return True

def main():
    category = sys.argv[1] if len(sys.argv) > 1 else "Spine"

    print(f"\n🔬 YJL2B Batch Enrichment — Category: {category}")
    print(f"{'='*60}")

    # Check for --fix flag: re-enrich cases with < 3 differentials
    fix_mode = "--fix" in sys.argv

    cases = run_convex("yjlCases:listByCategory", {"category": category})

    if fix_mode:
        unenriched = [c for c in cases if c.get("discriminatorId") and len(c.get("top3Differentials", [])) < 3]
        # Clear their discriminatorId so they get re-enriched
        for c in unenriched:
            c.pop("discriminatorId", None)
        print(f"  FIX MODE: {len(unenriched)} cases with < 3 differentials")
    else:
        unenriched = [c for c in cases if not c.get("discriminatorId")]

    unenriched.sort(key=lambda x: x["sortOrder"])

    print(f"  Total: {len(cases)}, To process: {len(unenriched)}")

    if not unenriched:
        print("  ✓ All cases enriched!")
        return

    success = 0
    failed = []

    for i, case in enumerate(unenriched):
        try:
            ok = enrich_case(case)
            if ok:
                success += 1
            else:
                failed.append(case["title"])
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed.append(case["title"])
            # Check if auth expired
            if "Authentication expired" in str(e) or "Redirected to" in str(e):
                print("\n⚠ Auth expired — stopping batch. Re-authenticate and resume.")
                break

        # Rate limit pause between queries
        if i < len(unenriched) - 1:
            print("  ⏳ Waiting 3s (rate limit)...")
            time.sleep(3)

    print(f"\n{'='*60}")
    print(f"  SUMMARY: {success}/{len(unenriched)} enriched")
    if failed:
        print(f"  Failed: {', '.join(failed)}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
