#!/usr/bin/env python3 -u
"""
One-time analysis: extract FRCR 2A difficulty profile from Paper 1-4 via NotebookLM.
Outputs scripts/stem_difficulty_profile.json used by improve_2a_stems.py.

Usage: python3 scripts/analyze_paper_style.py
"""

import subprocess, json, sys, time, os
os.environ["PYTHONUNBUFFERED"] = "1"

PROFILE_FILE = os.path.join(os.path.dirname(__file__), "stem_difficulty_profile.json")

def check_auth():
    try:
        result = subprocess.run(
            ["notebooklm", "auth", "check"],
            capture_output=True, text=True, timeout=15
        )
        return result.returncode == 0 and "pass" in result.stdout.lower()
    except Exception:
        return False

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

def main():
    print("=" * 60)
    print("  FRCR 2A Difficulty Profile Extraction")
    print("=" * 60)

    if not check_auth():
        print("ERROR: NotebookLM auth not valid. Run: python3 scripts/refresh_notebooklm_auth.py")
        sys.exit(1)
    print("Auth OK.\n")

    queries = {
        "stem_structure": (
            "Analyzing Paper 1, Paper 2, Paper 3, and Paper 4 exam papers in your sources: "
            "What is the typical structure of an FRCR 2A SBA (single best answer) question stem? "
            "Describe: (1) how clinical information is presented — what comes first (age, sex, presentation), "
            "(2) what imaging findings are included and at what level of detail, "
            "(3) whether the modality is stated or implied, "
            "(4) how the question is phrased at the end (e.g. 'What is the most likely diagnosis?'), "
            "(5) typical word count range. "
            "Give concrete examples from the papers."
        ),
        "difficulty_mechanisms": (
            "Looking at Paper 1, Paper 2, Paper 3, and Paper 4 in your sources: "
            "What specific techniques make these FRCR 2A questions challenging? "
            "Identify at least 6 concrete mechanisms, such as: "
            "(1) presenting overlapping imaging features between differentials, "
            "(2) including subtle or indirect findings rather than pathognomonic ones, "
            "(3) red herring demographics or clinical details, "
            "(4) requiring integration of multiple findings to reach the answer, "
            "(5) using findings that could point to 2-3 plausible options, "
            "(6) avoiding classic textbook presentations. "
            "For each mechanism, give a specific example from the papers."
        ),
        "anti_patterns": (
            "Based on Paper 1, Paper 2, Paper 3, and Paper 4 in your sources: "
            "What would make an FRCR 2A question too easy or obviously pointing to the answer? "
            "Identify giveaway clues that a poorly-written question might contain, such as: "
            "(1) pathognomonic findings stated explicitly in the stem, "
            "(2) classic demographics that immediately narrow to one diagnosis, "
            "(3) imaging descriptions that only match one answer option, "
            "(4) using the exact terminology of the correct answer in the stem, "
            "(5) providing too much clinical context that eliminates all but one option. "
            "Contrast these with how Paper 1-4 avoid these pitfalls."
        ),
        "style_guide": (
            "Based on your analysis of Paper 1, Paper 2, Paper 3, and Paper 4 in your sources, "
            "provide a concise style guide for writing FRCR 2A question stems. Include: "
            "(1) typical stem length in words, "
            "(2) level of clinical detail (minimal vs detailed history), "
            "(3) how imaging findings are described (specific sequences/phases vs generic), "
            "(4) whether the stem mentions the modality explicitly, "
            "(5) exact phrasing patterns used for the final question sentence, "
            "(6) how distractors (wrong options) relate to findings in the stem, "
            "(7) the balance between clinical and imaging information. "
            "Also check Paper_prompt1 and Paper_prompt2 in your sources — summarize what they describe "
            "about question generation and what lessons can be drawn from previous approaches."
        ),
    }

    profile = {}
    for i, (key, prompt) in enumerate(queries.items(), 1):
        print(f"[{i}/4] Querying: {key}...")
        try:
            answer = query_notebooklm(prompt)
            profile[key] = answer
            print(f"  Got {len(answer)} chars")
        except Exception as e:
            print(f"  ERROR: {e}")
            profile[key] = f"ERROR: {e}"

        if i < len(queries):
            print("  Waiting 5s...")
            time.sleep(5)

    # Add metadata
    from datetime import datetime
    profile["extracted_at"] = datetime.utcnow().isoformat()
    profile["source_notebook"] = "Rapid Review of Radiology"

    with open(PROFILE_FILE, "w") as f:
        json.dump(profile, f, indent=2)

    print(f"\nProfile saved to {PROFILE_FILE}")
    print(f"Total keys: {len(profile)}")

    # Print summary
    for key in ["stem_structure", "difficulty_mechanisms", "anti_patterns", "style_guide"]:
        val = profile.get(key, "")
        if val.startswith("ERROR"):
            print(f"  {key}: {val}")
        else:
            print(f"  {key}: {len(val)} chars")

if __name__ == "__main__":
    main()
