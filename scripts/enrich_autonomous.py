#!/usr/bin/env python3 -u
"""
Fully autonomous YJL2B enrichment pipeline.
No manual input required — auto-refreshes cookies, processes all categories,
recovers from transient failures.

Usage:
  python3 scripts/enrich_autonomous.py                    # all categories
  python3 scripts/enrich_autonomous.py Spine Chest        # specific categories
  python3 scripts/enrich_autonomous.py --status           # show progress only
  python3 scripts/enrich_autonomous.py --fix GI           # re-enrich cases with <3 diffs

Cookies are refreshed automatically via HTTP (Google sends fresh SIDCC cookies
on every request). Long-lived cookies (SID, HSID, APISID) expire in ~1 year.
"""

import subprocess, json, re, sys, time, os, asyncio, signal
from pathlib import Path
from datetime import datetime
from email.utils import parsedate_to_datetime

os.environ["PYTHONUNBUFFERED"] = "1"

STORAGE_PATH = Path.home() / ".notebooklm" / "storage_state.json"
PROGRESS_FILE = Path(__file__).parent / "yjl2b_progress.json"
ALL_CATEGORIES = [
    "Spine", "Chest", "GI", "GI Oncology", "GU",
    "Head and Neck", "MSK", "Neuro", "Pediatrics"
]
RATE_LIMIT_PAUSE = 3       # seconds between queries
AUTH_CHECK_INTERVAL = 10   # check auth every N cases
MAX_RETRIES = 2            # retries per case on transient failure
COOKIE_REFRESH_INTERVAL = 50  # refresh cookies every N cases

# ─── Progress Tracking ───────────────────────────────────────────────

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"enriched": [], "failed": [], "started": None, "last_update": None}

def save_progress(progress):
    progress["last_update"] = datetime.now().isoformat()
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {level}: {msg}", flush=True)

# ─── Cookie Auto-Refresh ─────────────────────────────────────────────

async def _refresh_cookies_async():
    """Hit NotebookLM homepage to refresh short-lived cookies."""
    import httpx

    storage = json.loads(STORAGE_PATH.read_text())
    cookies_dict = {}
    for c in storage["cookies"]:
        if c["domain"] in (".google.com", "notebooklm.google.com"):
            cookies_dict[c["name"]] = c["value"]

    cookie_header = "; ".join(f"{k}={v}" for k, v in cookies_dict.items())

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://notebooklm.google.com/",
            headers={"Cookie": cookie_header},
            follow_redirects=True,
            timeout=30.0,
        )

        if "accounts.google.com" in str(resp.url):
            return False  # Auth truly expired (long-lived cookies dead)

        # Update storage with refreshed cookies from Set-Cookie headers
        updated = 0
        for sc_header in resp.headers.get_list("set-cookie"):
            parts = sc_header.split(";")
            name_val = parts[0].split("=", 1)
            if len(name_val) != 2:
                continue
            name, value = name_val[0].strip(), name_val[1].strip()

            expires = None
            for part in parts[1:]:
                part = part.strip()
                if part.lower().startswith("expires="):
                    try:
                        expires = parsedate_to_datetime(part[8:]).timestamp()
                    except Exception:
                        pass

            for c in storage["cookies"]:
                if c["name"] == name:
                    if c["value"] != value:
                        c["value"] = value
                        updated += 1
                    if expires:
                        c["expires"] = expires

        if updated > 0:
            STORAGE_PATH.write_text(json.dumps(storage, indent=2))

        return True

def refresh_cookies():
    """Sync wrapper for cookie refresh. Returns True if auth is valid."""
    try:
        return asyncio.run(_refresh_cookies_async())
    except Exception as e:
        log(f"Cookie refresh error: {e}", "WARN")
        return False

def check_auth_quick():
    """Fast auth check via notebooklm CLI."""
    try:
        result = subprocess.run(
            ["notebooklm", "auth", "check", "--test"],
            capture_output=True, text=True, timeout=30
        )
        return result.returncode == 0 and "pass" in result.stdout.lower()
    except Exception:
        return False

# ─── Convex + NotebookLM ─────────────────────────────────────────────

def run_convex(func, args_dict):
    result = subprocess.run(
        ["npx", "convex", "run", func, json.dumps(args_dict)],
        capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        raise Exception(f"Convex error: {result.stderr.strip()}")
    return json.loads(result.stdout) if result.stdout.strip() else None

def query_notebooklm(title):
    prompt = (
        f"{title}. Please generate Part A structured viva response, "
        f"Part B enrichment JSON, and Part C discriminator matrix JSON. "
        f"IMPORTANT: Part C must include exactly 4 differentials "
        f"(1 correct diagnosis + 3 alternatives), not fewer."
    )
    result = subprocess.run(
        ["notebooklm", "ask", prompt, "--json"],
        capture_output=True, text=True, timeout=120
    )
    if result.returncode != 0:
        err = result.stderr.strip() or result.stdout.strip()
        raise Exception(f"NotebookLM error: {err}")
    data = json.loads(result.stdout)
    if data.get("error"):
        raise Exception(f"NotebookLM: {data.get('message', 'Unknown error')}")
    return data["answer"]

def extract_json_blocks(answer):
    part_b_match = re.search(
        r'PART\s*B.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE
    )
    enrichment = json.loads(part_b_match.group(1))["enrichment"] if part_b_match else None

    part_c_match = re.search(
        r'PART\s*C.*?```json\s*\n(.*?)\n```', answer, re.DOTALL | re.IGNORECASE
    )
    matrix = json.loads(part_c_match.group(1)) if part_c_match else None

    return enrichment, matrix

def prepare_differentials(enrichment, matrix):
    diffs = matrix["differentials"]
    for i, d in enumerate(diffs):
        d["sortOrder"] = i
        if i == 0:
            d["isCorrectDiagnosis"] = True
            if enrichment.get("dominantImagingFeatures"):
                d["dominantImagingFinding"] = enrichment["dominantImagingFeatures"]
            if enrichment.get("keyDiscriminatorsVsTop"):
                d["discriminatingKeyFeature"] = enrichment["keyDiscriminatorsVsTop"]
            if enrichment.get("associatedFindings"):
                d["associatedFindings"] = enrichment["associatedFindings"]
        else:
            d["isCorrectDiagnosis"] = False
    return diffs

# ─── Single Case Enrichment ──────────────────────────────────────────

def enrich_case(case):
    title = case["title"]
    case_id = case["_id"]

    log(f"Enriching: {title} (sortOrder={case['sortOrder']})")

    # Step 1: Query
    answer = query_notebooklm(title)

    # Step 2: Extract
    enrichment, matrix = extract_json_blocks(answer)

    if not enrichment:
        log("Part B missing — retrying with explicit prompt...", "WARN")
        answer = query_notebooklm(
            title + " — include Part B enrichment JSON and Part C discriminator matrix JSON"
        )
        enrichment, matrix = extract_json_blocks(answer)

    if not enrichment or not matrix:
        raise ValueError(f"Missing Part B={bool(enrichment)} Part C={bool(matrix)}")

    # Step 3: Merge
    diffs = prepare_differentials(enrichment, matrix)

    # Step 4: Create discriminator
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

    # Step 5: Link
    top3 = [d["diagnosis"] for d in diffs if not d.get("isCorrectDiagnosis")][:3]
    run_convex("yjlCases:update", {
        "id": case_id,
        "discriminatorId": disc_id,
        "top3Differentials": top3,
    })

    correct = diffs[0]["diagnosis"]
    dif_len = len(diffs[0].get("dominantImagingFinding", ""))
    log(f"  DONE: {correct} | DIF={dif_len}ch | top3={', '.join(top3)}")
    return True

# ─── Category Processing ─────────────────────────────────────────────

def process_category(category, progress, fix_mode=False):
    log(f"{'='*50}")
    log(f"Category: {category}")
    log(f"{'='*50}")

    cases = run_convex("yjlCases:listByCategory", {"category": category})

    if fix_mode:
        unenriched = [
            c for c in cases
            if c.get("discriminatorId") and len(c.get("top3Differentials", [])) < 3
        ]
        for c in unenriched:
            c.pop("discriminatorId", None)
        log(f"FIX MODE: {len(unenriched)} cases with < 3 differentials")
    else:
        unenriched = [c for c in cases if not c.get("discriminatorId")]

    unenriched.sort(key=lambda x: x["sortOrder"])
    log(f"Total: {len(cases)}, To process: {len(unenriched)}")

    if not unenriched:
        log("All cases enriched!")
        return 0, 0

    success = 0
    failed = 0

    for i, case in enumerate(unenriched):
        # Periodic cookie refresh
        if i > 0 and i % COOKIE_REFRESH_INTERVAL == 0:
            log("Refreshing cookies...")
            if not refresh_cookies():
                log("AUTH EXPIRED — long-lived cookies dead. Need manual re-auth.", "ERROR")
                return success, failed

        # Periodic auth check
        if i > 0 and i % AUTH_CHECK_INTERVAL == 0:
            if not check_auth_quick():
                log("Auth check failed — attempting cookie refresh...", "WARN")
                if not refresh_cookies():
                    log("AUTH EXPIRED — stopping.", "ERROR")
                    return success, failed

        # Enrich with retries
        for attempt in range(MAX_RETRIES + 1):
            try:
                ok = enrich_case(case)
                if ok:
                    success += 1
                    progress["enriched"].append({
                        "title": case["title"],
                        "category": category,
                        "time": datetime.now().isoformat()
                    })
                    save_progress(progress)
                break
            except Exception as e:
                err_str = str(e)
                if "auth" in err_str.lower() or "redirect" in err_str.lower():
                    log(f"Auth error: {e}", "WARN")
                    if not refresh_cookies():
                        log("AUTH EXPIRED — stopping.", "ERROR")
                        return success, failed
                    continue  # Retry after refresh

                if attempt < MAX_RETRIES:
                    log(f"Attempt {attempt+1} failed: {e} — retrying...", "WARN")
                    time.sleep(5)
                else:
                    log(f"FAILED after {MAX_RETRIES+1} attempts: {e}", "ERROR")
                    failed += 1
                    progress["failed"].append({
                        "title": case["title"],
                        "category": category,
                        "error": str(e)[:200],
                        "time": datetime.now().isoformat()
                    })
                    save_progress(progress)

        # Rate limit
        if i < len(unenriched) - 1:
            time.sleep(RATE_LIMIT_PAUSE)

    return success, failed

# ─── Status Report ────────────────────────────────────────────────────

def show_status():
    log("YJL2B Enrichment Status")
    log("=" * 50)

    total_enriched = 0
    total_remaining = 0

    for cat in ALL_CATEGORIES:
        try:
            cases = run_convex("yjlCases:listByCategory", {"category": cat})
            enriched = sum(1 for c in cases if c.get("discriminatorId"))
            remaining = len(cases) - enriched
            total_enriched += enriched
            total_remaining += remaining
            bar = "#" * (enriched * 20 // max(len(cases), 1)) + "." * (20 - enriched * 20 // max(len(cases), 1))
            log(f"  {cat:15s} [{bar}] {enriched:3d}/{len(cases):3d}")
        except Exception as e:
            log(f"  {cat:15s} ERROR: {e}", "WARN")

    log(f"  {'TOTAL':15s}            {total_enriched:3d}/{total_enriched + total_remaining:3d}")
    log(f"  Remaining: {total_remaining}")

    progress = load_progress()
    if progress.get("last_update"):
        log(f"  Last activity: {progress['last_update']}")
    if progress.get("failed"):
        log(f"  Failed cases: {len(progress['failed'])}")

# ─── Main ─────────────────────────────────────────────────────────────

def main():
    if "--status" in sys.argv:
        show_status()
        return

    fix_mode = "--fix" in sys.argv
    categories = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not categories:
        categories = ALL_CATEGORIES

    progress = load_progress()
    if not progress.get("started"):
        progress["started"] = datetime.now().isoformat()

    log(f"Autonomous YJL2B Enrichment Pipeline")
    log(f"Categories: {', '.join(categories)}")
    log(f"Fix mode: {fix_mode}")
    log(f"=" * 50)

    # Pre-flight: refresh cookies
    log("Pre-flight cookie refresh...")
    if not refresh_cookies():
        log("AUTH EXPIRED before start. Need manual cookie refresh.", "ERROR")
        log("Run: python3 scripts/refresh_notebooklm_auth.py")
        sys.exit(1)
    log("Auth valid — starting enrichment")

    # Select notebook
    try:
        subprocess.run(
            ["notebooklm", "use", "5242a5"],
            capture_output=True, text=True, timeout=15
        )
    except Exception:
        pass

    total_success = 0
    total_failed = 0

    for cat in categories:
        # Refresh cookies between categories
        refresh_cookies()

        success, failed = process_category(cat, progress, fix_mode)
        total_success += success
        total_failed += failed

        log(f"Category {cat} done: {success} enriched, {failed} failed")

    log(f"=" * 50)
    log(f"PIPELINE COMPLETE")
    log(f"  Enriched: {total_success}")
    log(f"  Failed: {total_failed}")
    log(f"  Progress saved to: {PROGRESS_FILE}")
    log(f"=" * 50)

if __name__ == "__main__":
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, lambda *_: (log("Interrupted — progress saved."), sys.exit(0)))
    main()
