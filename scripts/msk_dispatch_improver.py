#!/usr/bin/env python3
"""
MSK Stem Improver — Dispatch version
Reads MSK questions from Supabase, prints each formatted prompt,
reads the improved stem back from stdin, validates, then writes to DB.
Progress is tracked in msk_dispatch_progress.json.

Usage: python3 scripts/msk_dispatch_improver.py [--limit N] [--dry-run]
"""

import subprocess, json, sys, os, datetime, re, argparse, time

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.path.join(SCRIPT_DIR, "msk_dispatch_progress.json")

OPTION_LABELS = {"A": "option_a", "B": "option_b", "C": "option_c",
                 "D": "option_d", "E": "option_e"}

# ── Supabase helpers ──────────────────────────────────────────────────────────

def db(sql: str) -> list[dict]:
    result = subprocess.run(
        ["npx", "supabase", "db", "query", "--linked", sql],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip())
    lines = [l for l in result.stdout.strip().splitlines() if l.strip()]
    if len(lines) < 3:
        return []
    headers = [h.strip() for h in lines[0].split("|") if h.strip()]
    rows = []
    for line in lines[2:]:
        vals = [v.strip() for v in line.split("|") if v.strip() != ""]
        if vals:
            rows.append(dict(zip(headers, vals)))
    return rows


def fetch_questions(limit: int, done_ids: set) -> list[dict]:
    sql = (
        "SELECT id, question_text, correct_option, "
        "option_a, option_b, option_c, option_d, option_e "
        "FROM mcq_question_bank "
        "WHERE category = 'MSK' "
        "ORDER BY display_order, id "
        f"LIMIT {limit + len(done_ids) + 50};"
    )
    rows = db(sql)
    return [r for r in rows if r.get("id") not in done_ids][:limit]


def write_improved_stem(question_id: str, new_stem: str, dry_run: bool):
    if dry_run:
        print("  [DRY-RUN] Would update DB — skipping write.")
        return
    escaped = new_stem.replace("'", "''")
    sql = (
        f"UPDATE mcq_question_bank "
        f"SET question_text = '{escaped}' "
        f"WHERE id = '{question_id}';"
    )
    db(sql)


# ── Progress tracking ─────────────────────────────────────────────────────────

def load_progress() -> dict:
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": [], "started_at": datetime.datetime.utcnow().isoformat()}


def save_progress(p: dict):
    p["last_run"] = datetime.datetime.utcnow().isoformat()
    with open(PROGRESS_FILE, "w") as f:
        json.dump(p, f, indent=2)


# ── Prompt builder ────────────────────────────────────────────────────────────

def build_prompt(q: dict) -> str:
    letter = q.get("correct_option", "A").strip().upper()
    correct_text = q.get(OPTION_LABELS.get(letter, "option_a"), "").strip()
    opts = "\n".join(
        f"{lbl}) {q.get(col, '').strip()}"
        for lbl, col in [("A","option_a"),("B","option_b"),("C","option_c"),
                          ("D","option_d"),("E","option_e")]
    )

    return f"""You are an FRCR 2A examiner writing questions to the exact standard of Papers 1-4 in your sources. Your task is to rewrite the question stem below so it matches the difficulty, style, and precision of those papers. The five answer options are fixed — do not change them. Only the stem changes.

STEM STRUCTURE (Papers 1-4 standard):
Open with age, sex, and presenting complaint (e.g. "A 46-year-old man presents with progressive headache and fever"). State the imaging modality explicitly — CT, MRI, plain radiograph, ultrasound, nuclear medicine scan. Describe all imaging findings using exact anatomical locations, contrast phases, and sequence behaviour. Close with a standard sign-off: "What is the most likely diagnosis?" or "What is the most appropriate next step in management?" Target 50-100 words.

DIFFICULTY TECHNIQUES — apply at least three:
• Near-miss distractors: all five options must share significant imaging features. Embed 1-2 specific discriminators in the stem that rule out the wrong answers.
• Descriptive not diagnostic language: never name the diagnosis or use pathognomonic buzzwords. Describe appearance instead.
• Red herring clinical details: include history that implies a common condition, but the imaging findings pivot to the correct answer.
• Progressive layering: structure as history → examination finding → initial imaging → key discriminating imaging finding → question.
• Overlapping signal characteristics with anatomical localisation as the sole discriminator.
• Demographics that fit multiple options: choose a profile plausible for 2-3 of the options.

ANTI-PATTERNS — eliminate all of these:
• Never use pathognomonic buzzwords — describe the radiological appearance instead.
• Never state a finding that matches only the correct answer and no plausible distractor.
• Never provide clinical history so specific that it reveals the diagnosis before the imaging findings.
• Never use age/sex demographics that are implausible for all but the correct answer.
• Never name the diagnosis anywhere in the stem.
• Never include redundant or obvious confirmatory findings that make one option the only possibility.

CONSTRAINT: The correct answer is option {letter} ({correct_text}). The rewritten stem must be answerable as {letter} by a well-prepared candidate who reads the discriminating features carefully. Do not make any other option the obvious correct choice.

QUESTION TO REWRITE:

Original stem: {q.get("question_text", "").strip()}

Answer options (fixed — do not change):
{opts}

Return ONLY the rewritten stem text (50-100 words, ending with "?"). No labels, no explanation, no preamble, no commentary. Just the stem."""


# ── Validation ────────────────────────────────────────────────────────────────

def validate(stem: str, original: str) -> tuple[bool, str]:
    stem = stem.strip()
    if not stem:
        return False, "Empty response"
    if not stem.endswith("?"):
        return False, "Does not end with '?'"
    words = len(stem.split())
    if words < 30:
        return False, f"Too short ({words} words)"
    if words > 150:
        return False, f"Too long ({words} words)"
    if stem.lower() == original.lower().strip():
        return False, "Unchanged from original"
    return True, "OK"


# ── Main loop ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit",   type=int, default=10, help="Max questions this session")
    parser.add_argument("--dry-run", action="store_true",  help="Don't write to DB")
    args = parser.parse_args()

    progress   = load_progress()
    done_ids   = set(r["id"] for r in progress.get("completed", []))
    failed_ids = set(r["id"] for r in progress.get("failed",    []))

    print(f"\n{'='*60}")
    print(f"MSK Stem Improver — Dispatch Mode")
    print(f"Already done : {len(done_ids)}  |  Failed: {len(failed_ids)}")
    print(f"Target this session: {args.limit}")
    if args.dry_run:
        print("DRY-RUN — no DB writes")
    print(f"{'='*60}\n")

    print("Fetching questions from Supabase...")
    questions = fetch_questions(args.limit, done_ids | failed_ids)
    print(f"Got {len(questions)} questions to process.\n")

    session_ok = session_fail = 0

    for i, q in enumerate(questions, 1):
        qid = q.get("id", "?")
        print(f"\n{'─'*60}")
        print(f"Question {i}/{len(questions)}  |  ID: {qid}")
        print(f"{'─'*60}")

        prompt = build_prompt(q)

        # Print the prompt clearly so Dispatch can copy it into NotebookLM
        print("\n>>> PASTE THIS INTO NOTEBOOKLM:\n")
        print(prompt)
        print("\n>>> END OF PROMPT\n")

        # Read improved stem from stdin
        for attempt in range(1, 4):
            print(f"Paste the improved stem from NotebookLM (attempt {attempt}/3).")
            print("Enter the stem, then press Enter twice (blank line to finish):")
            lines = []
            while True:
                try:
                    line = input()
                except EOFError:
                    break
                if line == "" and lines and lines[-1] == "":
                    break
                lines.append(line)
            new_stem = " ".join(l for l in lines if l).strip()

            if new_stem.lower() in ("skip", "s"):
                print("Skipping this question.")
                progress.setdefault("failed", []).append({
                    "id": qid, "reason": "manually skipped",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                })
                save_progress(progress)
                session_fail += 1
                break

            ok, msg = validate(new_stem, q.get("question_text", ""))
            if ok:
                write_improved_stem(qid, new_stem, args.dry_run)
                progress.setdefault("completed", []).append({
                    "id": qid, "new_stem_words": len(new_stem.split()),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                })
                save_progress(progress)
                session_ok += 1
                print(f"✓ Written to DB. ({len(new_stem.split())} words)")
                break
            else:
                print(f"✗ Validation failed: {msg}. Try again.")
        else:
            print("Max attempts reached — marking as failed.")
            progress.setdefault("failed", []).append({
                "id": qid, "reason": "max attempts",
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
            save_progress(progress)
            session_fail += 1

    print(f"\n{'='*60}")
    print(f"Session complete — Success: {session_ok}  |  Failed: {session_fail}")
    print(f"Total done so far: {len(progress.get('completed',[]))}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
