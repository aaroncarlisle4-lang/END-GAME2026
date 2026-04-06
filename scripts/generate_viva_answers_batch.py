#!/usr/bin/env python3 -u
"""
Batch generation of FRCR 2B viva ideal answers for YJL2B cases via NotebookLM.
Usage: python3 scripts/generate_viva_answers_batch.py <category> [--limit N] [--dry-run]

Requires:
  - NotebookLM CLI authenticated (notebooklm auth check)
  - Correct notebook selected (notebooklm use 5242a5)
  - Cases must already have discriminators (run enrich_yjl2b_batch.py first)
"""

import subprocess, json, re, sys, time, os
os.environ["PYTHONUNBUFFERED"] = "1"

PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "viva_progress.json")

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
        else:
            print("  Auth still invalid. Stopping batch.")
            return False
    except (EOFError, KeyboardInterrupt):
        return False

def run_convex(func, args_dict):
    result = subprocess.run(
        ["npx", "convex", "run", func, json.dumps(args_dict)],
        capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        raise Exception(f"Convex error: {result.stderr.strip()}")
    return json.loads(result.stdout) if result.stdout.strip() else None

def build_prompt(case, discriminator):
    """Build the FRCR 2B phrase-framework prompt from case + discriminator data."""
    title = case["title"]
    diffs = discriminator.get("differentials", [])

    correct_dx = title
    diff_names = []
    dominant = ""
    key_disc = ""

    for d in diffs:
        if d.get("isCorrectDiagnosis"):
            correct_dx = d["diagnosis"]
            dominant = (d.get("dominantImagingFinding") or "")[:300]
            key_disc = (d.get("discriminatingKeyFeature") or "")[:300]
        else:
            diff_names.append(d["diagnosis"])

    diff1 = diff_names[0] if len(diff_names) > 0 else "an alternative diagnosis"
    diff2 = diff_names[1] if len(diff_names) > 1 else "another differential"

    prompt = f"""FRCR 2B Viva Ideal Answer for: {title}

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
    """Extract the viva answer JSON from NotebookLM response."""
    # Try to find JSON code block
    match = re.search(r'```json\s*\n(.*?)\n```', answer, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Fallback: try to find raw JSON object
    match = re.search(r'\{[\s\S]*"findings"[\s\S]*"management"[\s\S]*"fullScript"[\s\S]*\}', answer)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    return None

def validate_viva(viva):
    """Validate the viva answer has required structure."""
    if not viva:
        return False
    for section in ["findings", "differentials", "management"]:
        if section not in viva or not isinstance(viva[section], dict):
            return False
    if "fullScript" not in viva or not viva["fullScript"]:
        return False
    # Check findings has required fields
    for f in ["dominantFinding", "supportingFeatures", "criticalNegatives", "influentialFeature"]:
        if not viva["findings"].get(f):
            return False
    # Check differentials
    for f in ["primaryDiagnosis", "principleDifferential", "excludeDiagnosis"]:
        if not viva["differentials"].get(f):
            return False
    # Check management required fields
    if not viva["management"].get("priority") or not viva["management"].get("mdtDiscussion"):
        return False
    return True

def clean_nulls(obj):
    """Convert JSON null strings to None for Convex."""
    if isinstance(obj, dict):
        return {k: clean_nulls(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_nulls(v) for v in obj]
    if obj == "null" or obj == "None":
        return None
    return obj

def process_case(case, discriminator):
    """Generate and store viva answer for a single case."""
    title = case["title"]
    disc_id = case["discriminatorId"]

    print(f"\n{'='*60}")
    print(f"  Viva: {title} (sortOrder={case['sortOrder']})")
    print(f"{'='*60}")

    # Step 1: Build prompt with discriminator context
    print("  [1/4] Building prompt...")
    prompt = build_prompt(case, discriminator)

    # Step 2: Query NotebookLM
    print("  [2/4] Querying NotebookLM...")
    answer = query_notebooklm(prompt)

    # Step 3: Extract and validate JSON
    print("  [3/4] Extracting viva JSON...")
    viva = extract_viva_json(answer)
    viva = clean_nulls(viva) if viva else None

    if not validate_viva(viva):
        # Retry once with more explicit instruction
        print("  ⚠ Invalid response — retrying...")
        answer = query_notebooklm(prompt + "\n\nCRITICAL: Return ONLY a valid JSON code block. No other text.")
        viva = extract_viva_json(answer)
        viva = clean_nulls(viva) if viva else None

    if not validate_viva(viva):
        print(f"  ✗ FAILED — invalid viva structure")
        return False

    # Remove None values from management (Convex doesn't accept undefined in optional fields sent as null)
    mgmt = {k: v for k, v in viva["management"].items() if v is not None}
    viva["management"] = mgmt

    # Remove unifyingSummary if None
    if viva["differentials"].get("unifyingSummary") is None:
        del viva["differentials"]["unifyingSummary"]

    # Step 4: Store in Convex
    print("  [4/4] Storing in Convex...")
    run_convex("discriminators:setVivaAnswer", {
        "id": disc_id,
        "vivaAnswer": viva,
    })

    script_len = len(viva.get("fullScript", ""))
    findings_len = sum(len(viva["findings"].get(f, "")) for f in ["dominantFinding", "supportingFeatures", "criticalNegatives", "influentialFeature"])
    mgmt_fields = sum(1 for v in viva["management"].values() if v)

    print(f"  ✓ DONE — fullScript: {script_len} chars, findings: {findings_len} chars, mgmt fields: {mgmt_fields}")
    return True


def main():
    category = sys.argv[1] if len(sys.argv) > 1 else None
    if not category:
        print("Usage: python3 scripts/generate_viva_answers_batch.py <category> [--limit N] [--dry-run]")
        print("\nCategories: Spine, Chest, GI, GI Oncology, GU, Head and Neck, MSK, Multi-system,")
        print("            Neuro, Nuclear Medicine, Pediatrics, Abdominal Trauma, Acute Pancreatitis,")
        print("            Colorectal, GI Emergencies, HPB, HPB Acute, Upper GI")
        return

    limit = None
    dry_run = "--dry-run" in sys.argv
    for i, arg in enumerate(sys.argv):
        if arg == "--limit" and i + 1 < len(sys.argv):
            limit = int(sys.argv[i + 1])

    print(f"\n🎤 FRCR 2B Viva Answer Generation — Category: {category}")
    print(f"{'='*60}")

    # Load progress
    progress = load_progress()
    completed_titles = set(p["title"] for p in progress["completed"])

    # Fetch cases with discriminators
    cases = run_convex("yjlCases:listByCategory", {"category": category})
    cases_with_disc = [c for c in cases if c.get("discriminatorId")]

    # Fetch discriminators for these cases and check which need viva answers
    to_process = []
    print(f"  Checking {len(cases_with_disc)} cases with discriminators...")
    for c in cases_with_disc:
        if c["title"] in completed_titles:
            continue
        disc = run_convex("discriminators:get", {"id": c["discriminatorId"]})
        if disc and not disc.get("vivaAnswer"):
            to_process.append((c, disc))

    to_process.sort(key=lambda x: x[0]["sortOrder"])

    if limit:
        to_process = to_process[:limit]

    print(f"  Total cases: {len(cases)}, With discriminator: {len(cases_with_disc)}, Need viva: {len(to_process)}")

    if not to_process:
        print("  ✓ All cases have viva answers!")
        return

    if dry_run:
        print("\n  DRY RUN — would process:")
        for c, d in to_process:
            correct = next((dd["diagnosis"] for dd in d["differentials"] if dd.get("isCorrectDiagnosis")), "?")
            print(f"    [{c['sortOrder']}] {c['title']} → {correct}")
        return

    # Pre-flight auth check
    print("  Checking auth...")
    if not check_auth():
        print("  ⚠ Auth not valid. Run: python3 scripts/refresh_notebooklm_auth.py")
        if not wait_for_auth():
            return

    success = 0
    failed = []

    for i, (case, disc) in enumerate(to_process):
        # Periodic auth check every 10 cases
        if i > 0 and i % 10 == 0:
            if not check_auth():
                print(f"\n  ⚠ Auth expired after {success} cases")
                if not wait_for_auth():
                    break

        try:
            ok = process_case(case, disc)
            if ok:
                success += 1
                progress["completed"].append({
                    "title": case["title"],
                    "category": category,
                    "time": time.strftime("%Y-%m-%dT%H:%M:%S")
                })
                save_progress(progress)
            else:
                failed.append(case["title"])
                progress["failed"].append({
                    "title": case["title"],
                    "category": category,
                    "time": time.strftime("%Y-%m-%dT%H:%M:%S")
                })
                save_progress(progress)
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed.append(case["title"])
            if "auth" in str(e).lower() or "Redirected" in str(e):
                if not wait_for_auth():
                    break
                # Retry after auth refresh
                try:
                    ok = process_case(case, disc)
                    if ok:
                        success += 1
                        failed.pop()
                        progress["completed"].append({
                            "title": case["title"],
                            "category": category,
                            "time": time.strftime("%Y-%m-%dT%H:%M:%S")
                        })
                        save_progress(progress)
                except Exception as e2:
                    print(f"  ✗ Retry also failed: {e2}")
                    break

        # Rate limit
        if i < len(to_process) - 1:
            print("  ⏳ Waiting 3s (rate limit)...")
            time.sleep(3)

    print(f"\n{'='*60}")
    print(f"  SUMMARY: {success}/{len(to_process)} viva answers generated")
    if failed:
        print(f"  Failed: {', '.join(failed[:10])}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
