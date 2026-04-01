#!/usr/bin/env python3
"""
Streamlined NotebookLM cookie refresh.

Usage:
  1. In browser: go to notebooklm.google.com
  2. Click Cookie Editor extension → Export (JSON)
  3. Run: python3 scripts/refresh_notebooklm_auth.py
  4. Paste the JSON, then press Ctrl+D (EOF)

Or pipe directly:
  pbpaste | python3 scripts/refresh_notebooklm_auth.py
  cat /tmp/cookies.json | python3 scripts/refresh_notebooklm_auth.py

The script also accepts 3 extra cookies (SSID, HSID, APISID) from DevTools
if they're missing from the Cookie Editor export. It will prompt interactively.
"""

import json, sys, os, subprocess
from pathlib import Path
from datetime import datetime

STORAGE_PATH = Path.home() / ".notebooklm" / "storage_state.json"
REQUIRED_COOKIES = {"SID", "HSID", "APISID"}
NOTEBOOK_ID = "5242a511-a134-40f5-b832-eeda3e1bcae8"  # Rapid Review of Radiology


def convert_cookie(c):
    """Convert Cookie Editor JSON format to Playwright storage_state format."""
    pw = {
        "name": c["name"],
        "value": c["value"],
        "domain": c["domain"],
        "path": c.get("path", "/"),
        "secure": c.get("secure", False),
        "httpOnly": c.get("httpOnly", False),
    }
    ss = c.get("sameSite", "")
    pw["sameSite"] = "Lax" if ss == "lax" else ("Strict" if ss == "strict" else "None")
    if c.get("expirationDate"):
        pw["expires"] = c["expirationDate"]
    return pw


def read_cookie_json():
    """Read cookie JSON from stdin (piped or interactive)."""
    if sys.stdin.isatty():
        print("Paste Cookie Editor JSON export below, then press Ctrl+D:")
        print("-" * 40)
    raw = sys.stdin.read().strip()
    if not raw:
        print("ERROR: No input received.")
        sys.exit(1)
    return json.loads(raw)


def prompt_extra_cookies(existing_names):
    """If SSID/HSID/APISID are missing, prompt for them from DevTools."""
    missing = REQUIRED_COOKIES - existing_names
    extra = []
    if missing and sys.stdin.isatty():
        print(f"\nMissing cookies from export: {', '.join(sorted(missing))}")
        print("Get these from DevTools → Application → Cookies → .google.com")
        for name in sorted(missing):
            val = input(f"  {name} value (or Enter to skip): ").strip()
            if val:
                extra.append({
                    "name": name,
                    "value": val,
                    "domain": ".google.com",
                    "path": "/",
                    "secure": True,
                    "httpOnly": True,
                    "sameSite": "None",
                })
    return extra


def check_auth():
    """Run notebooklm auth check --test and return success."""
    try:
        result = subprocess.run(
            ["notebooklm", "auth", "check"],
            capture_output=True, text=True, timeout=15
        )
        return result.returncode == 0 and "pass" in result.stdout.lower()
    except Exception:
        return False


def select_notebook():
    """Ensure the correct notebook is selected."""
    try:
        subprocess.run(
            ["notebooklm", "use", NOTEBOOK_ID[:6]],
            capture_output=True, text=True, timeout=15
        )
    except Exception:
        pass


def main():
    print(f"NotebookLM Cookie Refresh — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)

    # Step 1: Read cookie JSON
    cookies_raw = read_cookie_json()

    # Step 2: Convert to Playwright format
    pw_cookies = [convert_cookie(c) for c in cookies_raw]
    existing_names = {c["name"] for c in pw_cookies}

    print(f"\nImported {len(pw_cookies)} cookies from Cookie Editor")
    print(f"  Domains: {', '.join(sorted(set(c['domain'] for c in pw_cookies)))}")

    # Step 3: Check for required cookies, prompt if missing
    # Re-open stdin for interactive prompts if it was piped
    missing = REQUIRED_COOKIES - existing_names
    if missing:
        print(f"\n  WARNING: Missing required cookies: {', '.join(sorted(missing))}")
        print("  These are usually in .google.com domain in DevTools.")
        print("  The export may still work if __Secure-* variants are present.")

    # Step 4: Write storage_state.json
    STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Back up existing
    if STORAGE_PATH.exists():
        backup = STORAGE_PATH.with_suffix(f".backup.json")
        STORAGE_PATH.rename(backup)
        print(f"\n  Backed up previous auth to {backup.name}")

    storage_state = {"cookies": pw_cookies, "origins": []}
    STORAGE_PATH.write_text(json.dumps(storage_state, indent=2))
    print(f"  Written {len(pw_cookies)} cookies to {STORAGE_PATH}")

    # Step 5: Validate
    print("\nValidating auth...")
    if check_auth():
        print("  AUTH VALID")
        select_notebook()
        print(f"  Notebook selected: Rapid Review of Radiology")
        print(f"\n  Ready to enrich! Run:")
        print(f"    python3 scripts/enrich_yjl2b_batch.py <category>")
    else:
        print("  AUTH CHECK FAILED — cookies may be expired or incomplete")
        print("  Try re-exporting from browser (make sure you're logged in)")


if __name__ == "__main__":
    main()
