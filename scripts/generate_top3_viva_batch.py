#!/usr/bin/env python3 -u
"""
Batch generation of FRCR 2B viva ideal answers for Top 3 Pattern discriminators
(O'Brien-linked) via NotebookLM.

Iterates discriminators where obrienRef.obrienCaseNumber is set and vivaAnswer is missing,
queries NotebookLM with the FRCR 2B phrase-framework prompt, then writes via
discriminators:setVivaAnswer.

Run AFTER scripts/enrich_top3_patterns_batch.py — this script needs the discriminator
matrix populated (specifically the correct-diagnosis row's dominantImagingFinding +
discriminatingKeyFeature fields) as input context.

Usage:
  python3 scripts/generate_top3_viva_batch.py                 # All eligible
  python3 scripts/generate_top3_viva_batch.py --limit 5
  python3 scripts/generate_top3_viva_batch.py --dry-run
  python3 scripts/generate_top3_viva_batch.py --case-from 100 --case-to 150  # Range
"""

import subprocess, json, re, sys, time, os, argparse, tempfile
from datetime import datetime, timezone

os.environ["PYTHONUNBUFFERED"] = "1"

PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "top3_viva_progress.json")


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": []}


def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)


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
        print("  Auth still invalid. Stopping batch.")
        return False
    except (EOFError, KeyboardInterrupt):
        return False


def run_convex(func, args_dict):
    """Run a Convex function and return parsed JSON, using tempfile to avoid pipe truncation."""
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False) as tmp:
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


def build_prompt(item):
    """FRCR 2B phrase-framework prompt for a Top 3 Pattern.
    Mirrors generate_viva_answers_batch.py.build_prompt but uses pattern + correct dx
    rather than a YJL case title."""
    pattern = item["pattern"]
    correct_dx = item.get("correctDiagnosis") or pattern
    diff_names = item.get("otherDifferentials") or []
    dominant = (item.get("dominantImagingFinding") or "")[:300]
    key_disc = (item.get("discriminatingKeyFeature") or "")[:300]
    diff1 = diff_names[0] if len(diff_names) > 0 else "an alternative diagnosis"
    diff2 = diff_names[1] if len(diff_names) > 1 else "another differential"

    prompt = f"""FRCR 2B Viva Ideal Answer for: {pattern}

Correct diagnosis: {correct_dx}
Differentials: {', '.join(diff_names[:3]) if diff_names else 'unknown'}
Dominant imaging: {dominant[:200]}
Key discriminator: {key_disc[:200]}

Generate a structured FRCR 2B viva answer using EXACTLY these phrase stems. Output as a SINGLE JSON code block only — no other text.

FINDINGS section:
- "dominantFinding": Start with "The dominant imaging finding is..." (2-3 sentences describing the key finding)
- "supportingFeatures": Start with "Supporting features include..." (2-3 sentences listing ancillary findings)
- "criticalNegatives": Start with "Importantly, there is no evidence of..." (1-2 sentences, case-specific critical negatives that help narrow the differential)
- "influentialFeature": Start with "The feature that most influences my thinking is..." (1 sentence identifying the single most discriminating feature)

DIFFERENTIALS section:
- "primaryDiagnosis": Start with "The appearances are most in keeping with {correct_dx}, given the..." (2-3 sentences citing specific imaging features)
- "principleDifferential": Start with "The principle differential would be {diff1}, however..." (2 sentences explaining which discriminating feature argues against it)
- "excludeDiagnosis": Start with "A diagnosis I would want to exclude is {diff2}, given..." (2 sentences with clinical consequence of missing it)
- "unifyingSummary": ONLY if this case involves multiple organ systems, start with "Taken together, these findings point to a unifying diagnosis of..." Otherwise set to null.

MANAGEMENT section (include ONLY fields that are clinically relevant to this specific case, set others to null):
- "priority": Start with "From a radiological perspective, the priority is to..." (1 sentence: confirm/stage/characterise)
- "priorImaging": Start with "I would review any available prior imaging to assess disease behaviour — whether this is stable, progressive, or improving." Then add case-specific rationale: e.g. comparison for interval change, looking for features to support a syndrome or systemic disease, establishing chronicity. Null if not relevant.
- "furtherImaging": Recommend specific modality (MRI/US/PET-CT) with rationale including WHY this modality is superior here. Null if current imaging is sufficient.
- "ctPhases": If CT relevant, specify phases (non-contrast/arterial/portal venous/delayed) with rationale for EACH phase. Null if CT not indicated.
- "mriSequences": If MRI relevant, specify sequences (DWI/DCE/MRS/SWI/STIR/hepatobiliary) with rationale for each. Null if MRI not indicated.
- "spectralCt": If dual-energy CT would add value, explain material decomposition benefit. Null for most cases.
- "nuclearMedicine": If PET-CT or bone scan relevant, explain metabolic/functional benefit. Null if not indicated.
- "intervention": If tissue diagnosis needed, specify guided biopsy approach and optimal target. Null if tissue not needed.
- "followUp": If surveillance appropriate, specify interval and guideline reference. Null if definitive management needed.
- "mdtDiscussion": Start with "This should go to [specific MDT]. My report would clearly document..." (1-2 sentences specifying WHAT to document)

- "fullScript": Combine all three sections into a single flowing 3-paragraph answer as if speaking out loud in the viva exam. First paragraph = findings. Second paragraph = differentials. Third paragraph = management. Use the phrase stems naturally.

Return ONLY a JSON code block — no commentary before or after:
```json
{{
  "findings": {{ "dominantFinding": "...", "supportingFeatures": "...", "criticalNegatives": "...", "influentialFeature": "..." }},
  "differentials": {{ "primaryDiagnosis": "...", "principleDifferential": "...", "excludeDiagnosis": "...", "unifyingSummary": null }},
  "management": {{ "priority": "...", "priorImaging": "...", "furtherImaging": "...", "ctPhases": null, "mriSequences": "...", "spectralCt": null, "nuclearMedicine": null, "intervention": "...", "followUp": null, "mdtDiscussion": "..." }},
  "fullScript": "..."
}}
```"""
    return prompt


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


def extract_viva_json(answer):
    match = re.search(r'```json\s*\n(.*?)\n```', answer, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r'\{[\s\S]*"findings"[\s\S]*"management"[\s\S]*"fullScript"[\s\S]*\}', answer)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


def validate_viva(viva):
    if not viva:
        return False
    for section in ["findings", "differentials", "management"]:
        if section not in viva or not isinstance(viva[section], dict):
            return False
    if "fullScript" not in viva or not viva["fullScript"]:
        return False
    for f in ["dominantFinding", "supportingFeatures", "criticalNegatives", "influentialFeature"]:
        if not viva["findings"].get(f):
            return False
    for f in ["primaryDiagnosis", "principleDifferential", "excludeDiagnosis"]:
        if not viva["differentials"].get(f):
            return False
    if not viva["management"].get("priority") or not viva["management"].get("mdtDiscussion"):
        return False
    return True


def clean_nulls(obj):
    if isinstance(obj, dict):
        return {k: clean_nulls(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_nulls(v) for v in obj]
    if obj == "null" or obj == "None":
        return None
    return obj


def process_item(item, viva_cache_dir=None, cache_file=None):
    pattern = item["pattern"]
    disc_id = item["_id"]
    case_num = item["obrienCaseNumber"]

    print(f"\n{'='*60}")
    print(f"  Viva: O'Brien #{case_num} | {pattern}")
    print(f"{'='*60}")

    print("  [1/4] Building prompt...")
    prompt = build_prompt(item)

    print("  [2/4] Querying NotebookLM...")
    answer = query_notebooklm(prompt)

    print("  [3/4] Extracting viva JSON...")
    viva = extract_viva_json(answer)
    viva = clean_nulls(viva) if viva else None

    if not validate_viva(viva):
        print("  ⚠ Invalid response — retrying...")
        answer = query_notebooklm(prompt + "\n\nCRITICAL: Return ONLY a valid JSON code block. No other text.")
        viva = extract_viva_json(answer)
        viva = clean_nulls(viva) if viva else None

    if not validate_viva(viva):
        print("  ✗ FAILED — invalid viva structure")
        return False

    mgmt = {k: v for k, v in viva["management"].items() if v is not None}
    viva["management"] = mgmt
    if viva["differentials"].get("unifyingSummary") is None:
        del viva["differentials"]["unifyingSummary"]

    # Try Convex first; fall back to local cache file if bandwidth exceeded
    stored = False
    if disc_id:
        print("  [4/4] Storing in Convex...")
        try:
            run_convex("discriminators:setVivaAnswer", {"id": disc_id, "vivaAnswer": viva})
            stored = True
        except Exception as e:
            if not ("exceeded" in str(e).lower() or "disabled" in str(e).lower() or "free plan" in str(e).lower()):
                raise

    if not stored:
        target = cache_file or (os.path.join(viva_cache_dir, f"obrien_{case_num:04d}.json") if viva_cache_dir else None)
        if target:
            with open(target, "w") as f:
                json.dump({"_id": disc_id, "obrienCaseNumber": case_num, "pattern": pattern, "vivaAnswer": viva}, f, indent=2)
            print(f"  💾 Saved locally → viva_cache/obrien_{case_num:04d}.json")
        else:
            print("  ⚠ No storage target — result lost")

    script_len = len(viva.get("fullScript", ""))
    findings_len = sum(len(viva["findings"].get(f, "")) for f in
                        ["dominantFinding", "supportingFeatures", "criticalNegatives", "influentialFeature"])
    mgmt_fields = sum(1 for v in viva["management"].values() if v)
    print(f"  ✓ DONE — fullScript: {script_len} chars, findings: {findings_len} chars, mgmt fields: {mgmt_fields}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Generate FRCR 2B viva answers for Top 3 Pattern discriminators")
    parser.add_argument("--limit", type=int, help="Process at most N items")
    parser.add_argument("--dry-run", action="store_true", help="Preview without querying NotebookLM")
    parser.add_argument("--case-from", type=int, help="Start case number (inclusive)")
    parser.add_argument("--case-to", type=int, help="End case number (inclusive)")
    parser.add_argument("--force", action="store_true", help="Re-run completed entries from progress file")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  Top 3 Pattern Viva Answer Generation")
    print(f"  {'[DRY RUN] ' if args.dry_run else ''}Range: {args.case_from or 'any'}-{args.case_to or 'any'}")
    print(f"{'='*60}")

    progress = load_progress()
    completed_case_nums = set(p.get("obrienCaseNumber") for p in progress["completed"] if p.get("obrienCaseNumber"))
    completed_ids = set(p["_id"] for p in progress["completed"] if p.get("_id"))

    # Load patterns from local seed file — zero Convex bandwidth
    print("  Loading differentialPatterns from local seed file...")
    seed_path = os.path.join(os.path.dirname(__file__), "..", "convex", "data", "differentialPatternsSeed.ts")
    seed_text = open(seed_path).read()
    import re as _re
    # Parse each object from the TypeScript array
    patterns = []
    for block in _re.finditer(r'\{([^{}]*obrienCaseNumber[^{}]*)\}', seed_text, _re.DOTALL):
        txt = block.group(0)
        def _extract(key):
            m = _re.search(rf'{key}:\s*"([^"]*)"', txt)
            return m.group(1) if m else ""
        def _extract_num(key):
            m = _re.search(rf'{key}:\s*(\d+)', txt)
            return int(m.group(1)) if m else 0
        def _extract_list(key):
            m = _re.search(rf'{key}:\s*\[([^\]]*)\]', txt, _re.DOTALL)
            if not m: return []
            return [s.strip().strip('"') for s in _re.findall(r'"([^"]*)"', m.group(1))]
        case_num = _extract_num("obrienCaseNumber")
        if case_num == 0: continue
        patterns.append({
            "obrienCaseNumber": case_num,
            "pattern": _extract("pattern"),
            "diagnosis": _extract("diagnosis"),
            "top3": _extract_list("top3"),
            "additional": _extract_list("additional"),
        })
    patterns.sort(key=lambda x: x["obrienCaseNumber"])
    print(f"  Loaded {len(patterns)} patterns from seed")

    if args.case_from is not None:
        patterns = [p for p in patterns if p["obrienCaseNumber"] >= args.case_from]
    if args.case_to is not None:
        patterns = [p for p in patterns if p["obrienCaseNumber"] <= args.case_to]
    if not args.force:
        patterns = [p for p in patterns if p["obrienCaseNumber"] not in completed_case_nums]
    if args.limit:
        patterns = patterns[:args.limit]

    print(f"  {len(patterns)} patterns to process")

    if not patterns:
        print("  Nothing to process.")
        return

    VIVA_CACHE_DIR = os.path.join(os.path.dirname(__file__), "viva_cache")
    os.makedirs(VIVA_CACHE_DIR, exist_ok=True)

    if args.dry_run:
        print(f"\n  DRY RUN — {len(patterns)} patterns to check")
        return

    print("  Checking auth...")
    if not check_auth():
        print("  ⚠ Auth not valid. Run: python3 scripts/refresh_notebooklm_auth.py")
        if not wait_for_auth():
            return

    success = 0
    failed = []
    cases_since_reset = 0
    RESET_EVERY = 15  # Reset conversation every N cases to avoid rate limiting

    for i, pat in enumerate(patterns):
        case_num = pat["obrienCaseNumber"]

        # Check local cache — skip if already saved
        cache_file = os.path.join(VIVA_CACHE_DIR, f"obrien_{case_num:04d}.json")
        if os.path.exists(cache_file) and not args.force:
            continue

        # Reset conversation periodically to avoid rate limiting from long sessions
        if cases_since_reset > 0 and cases_since_reset % RESET_EVERY == 0:
            print(f"  🔄 Resetting conversation (every {RESET_EVERY} cases)...")
            subprocess.run(["notebooklm", "clear"], capture_output=True)
            subprocess.run(["notebooklm", "use", "5242a5"], capture_output=True)
            time.sleep(5)

        # Build item from seed data (no Convex needed)
        all_diffs = [pat["diagnosis"]] + [d for d in pat["top3"] + pat["additional"] if d != pat["diagnosis"]]
        item = {
            "_id": None,  # Unknown until Convex re-enabled; import script will match by obrienCaseNumber
            "obrienCaseNumber": case_num,
            "pattern": pat["pattern"],
            "correctDiagnosis": pat["diagnosis"],
            "dominantImagingFinding": "",  # Not available offline; prompt still works without
            "discriminatingKeyFeature": "",
            "otherDifferentials": all_diffs[1:],
        }

        if i > 0 and i % 10 == 0:
            if not check_auth():
                print(f"\n  ⚠ Auth expired after {success} items")
                if not wait_for_auth():
                    break

        try:
            ok = process_item(item, viva_cache_dir=VIVA_CACHE_DIR, cache_file=cache_file)
            cases_since_reset += 1
            entry = {
                "_id": None,
                "obrienCaseNumber": case_num,
                "pattern": pat["pattern"],
                "time": datetime.now(timezone.utc).isoformat(),
            }
            if ok:
                success += 1
                progress["completed"].append(entry)
                completed_case_nums.add(case_num)
            else:
                failed.append(pat["pattern"])
                progress["failed"].append(entry)
            save_progress(progress)
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed.append(pat["pattern"])
            if "auth" in str(e).lower() or "Redirected" in str(e):
                if not wait_for_auth():
                    break

        print("  ⏳ Waiting 10s (rate limit)...")
        time.sleep(10)

    cached = len([f for f in os.listdir(VIVA_CACHE_DIR) if f.endswith(".json")]) if os.path.isdir(VIVA_CACHE_DIR) else 0
    print(f"\n{'='*60}")
    print(f"  SUMMARY: {success} viva answers stored in Convex")
    if cached:
        print(f"  Cached locally (Convex disabled): {cached} files in scripts/viva_cache/")
        print(f"  Run import script once Convex is re-enabled: python3 scripts/import_viva_cache.py")
    if failed:
        print(f"  Failed: {', '.join(failed[:10])}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
