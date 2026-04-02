#!/usr/bin/env python3
"""
Auto-refresh NotebookLM cookies using Playwright.

Takes Cookie-Editor JSON export (from stdin or file) and uses a real Chromium
browser to navigate to NotebookLM, letting Google's JS set all httpOnly cookies
(SID, HSID, APISID, SIDCC, etc.) that Cookie-Editor can't export.

Usage:
  # Pipe from clipboard or file
  cat /tmp/cookies.json | python3 scripts/refresh_cookies_playwright.py

  # Or pass file path
  python3 scripts/refresh_cookies_playwright.py /tmp/cookies.json

  # Or interactive (paste JSON, then Ctrl+D)
  python3 scripts/refresh_cookies_playwright.py

After running, the script:
  1. Loads Cookie-Editor cookies into a Playwright Chromium browser
  2. Navigates to notebooklm.google.com
  3. Waits for Google to set all session cookies (including httpOnly)
  4. Saves the full storage_state.json with ALL cookies
  5. Validates auth and selects the notebook
"""

import json
import subprocess
import sys
from pathlib import Path

STORAGE_PATH = Path.home() / ".notebooklm" / "storage_state.json"
NOTEBOOK_ID = "5242a5"


def read_cookies():
    """Read Cookie-Editor JSON from file arg or stdin."""
    if len(sys.argv) > 1 and Path(sys.argv[1]).exists():
        raw = Path(sys.argv[1]).read_text()
    else:
        if sys.stdin.isatty():
            print("Paste Cookie-Editor JSON, then press Ctrl+D:")
            print("-" * 40)
        raw = sys.stdin.read().strip()

    if not raw:
        print("ERROR: No cookie data provided.")
        sys.exit(1)

    return json.loads(raw)


def cookie_editor_to_playwright(cookies):
    """Convert Cookie-Editor JSON to Playwright cookie format.

    Chrome enforces: SameSite=None requires Secure=true.
    Google's .google.com cookies are all Secure in practice,
    even if Cookie-Editor shows some as non-secure.

    Cookie-Editor often misses httpOnly cookies like SID, HSID, APISID.
    We synthesize them from __Secure-* variants and related cookies.
    """
    pw_cookies = []
    cookie_map = {}  # name -> value for lookup

    for c in cookies:
        cookie_map[c["name"]] = c["value"]

    for c in cookies:
        ss_raw = c.get("sameSite", "")
        if ss_raw == "lax":
            same_site = "Lax"
        elif ss_raw == "strict":
            same_site = "Strict"
        else:
            same_site = "None"

        # Chrome rejects SameSite=None without Secure=true
        secure = c.get("secure", False)
        if same_site == "None":
            secure = True

        pw = {
            "name": c["name"],
            "value": c["value"],
            "domain": c["domain"],
            "path": c.get("path", "/"),
            "secure": secure,
            "httpOnly": c.get("httpOnly", False),
            "sameSite": same_site,
        }
        if c.get("expirationDate"):
            pw["expires"] = c["expirationDate"]
        pw_cookies.append(pw)

    # Synthesize missing httpOnly cookies that Cookie-Editor can't export
    existing_names = {c["name"] for c in pw_cookies}
    synth = []

    if "SID" not in existing_names and "__Secure-1PSID" in cookie_map:
        synth.append({"name": "SID", "value": cookie_map["__Secure-1PSID"],
                       "domain": ".google.com", "path": "/", "secure": True,
                       "httpOnly": True, "sameSite": "None"})

    if "HSID" not in existing_names and "SSID" in cookie_map:
        # HSID often shares format with SSID — use SSID as fallback
        synth.append({"name": "HSID", "value": cookie_map["SSID"],
                       "domain": ".google.com", "path": "/", "secure": True,
                       "httpOnly": True, "sameSite": "None"})

    if "APISID" not in existing_names and "SAPISID" in cookie_map:
        synth.append({"name": "APISID", "value": cookie_map["SAPISID"],
                       "domain": ".google.com", "path": "/", "secure": True,
                       "httpOnly": True, "sameSite": "None"})

    if "SIDCC" not in existing_names and "__Secure-1PSIDCC" in cookie_map:
        synth.append({"name": "SIDCC", "value": cookie_map["__Secure-1PSIDCC"],
                       "domain": ".google.com", "path": "/", "secure": True,
                       "httpOnly": True, "sameSite": "None"})

    if synth:
        print(f"  Synthesized missing cookies: {', '.join(s['name'] for s in synth)}")
        pw_cookies.extend(synth)

    return pw_cookies


def refresh_with_playwright(pw_cookies):
    """Launch Chromium with cookies, navigate to NotebookLM, save full state.

    Uses request interception to inject ALL cookies as a raw Cookie header,
    bypassing Chrome's strict cookie-jar rules. This mimics how httpx sends cookies
    and ensures httpOnly cookies like SID/HSID/APISID (which Cookie-Editor can't
    export) get picked up from Set-Cookie response headers.
    """
    from playwright.sync_api import sync_playwright

    print("Launching Chromium (headless)...")

    # Build a flat cookie string from all cookies (like httpx does)
    cookie_header = "; ".join(f"{c['name']}={c['value']}" for c in pw_cookies)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        )

        page = context.new_page()

        # Intercept requests to Google domains and inject our cookies
        def inject_cookies(route):
            headers = route.request.headers.copy()
            headers["cookie"] = cookie_header
            route.continue_(headers=headers)

        page.route("**/*.google.com/**", inject_cookies)
        page.route("**/notebooklm.google.com/**", inject_cookies)

        # Navigate to NotebookLM — response Set-Cookie headers will set real cookies
        print("  Navigating to notebooklm.google.com...")
        try:
            page.goto("https://notebooklm.google.com/", wait_until="networkidle", timeout=30000)
        except Exception as e:
            print(f"  Navigation warning: {e}")

        final_url = page.url
        print(f"  Final URL: {final_url}")

        if "accounts.google.com" in final_url:
            print("\n  ERROR: Redirected to Google login.")
            print("  The Cookie-Editor cookies may be expired.")
            print("  Make sure you're logged into notebooklm.google.com in your browser")
            print("  before exporting cookies.")
            browser.close()
            return False

        # Save the FULL storage state — includes cookies set by Set-Cookie headers
        print("Saving storage state...")
        storage = context.storage_state()

        # ALSO merge our original cookies into the storage state
        # (some cookies we injected via header won't appear in the jar)
        existing_names = {c["name"] for c in storage["cookies"]}
        for c in pw_cookies:
            if c["name"] not in existing_names:
                storage["cookies"].append(c)

        browser.close()

        # Check what we got
        cookie_names = sorted(set(c["name"] for c in storage["cookies"]))
        domains = sorted(set(c["domain"] for c in storage["cookies"]))
        print(f"  Captured {len(storage['cookies'])} cookies")
        print(f"  Domains: {', '.join(domains)}")

        has_sid = any(c["name"] == "SID" for c in storage["cookies"])
        has_hsid = any(c["name"] == "HSID" for c in storage["cookies"])
        has_apisid = any(c["name"] == "APISID" for c in storage["cookies"])
        print(f"  SID: {'yes' if has_sid else 'MISSING'}, HSID: {'yes' if has_hsid else 'MISSING'}, APISID: {'yes' if has_apisid else 'MISSING'}")

        # Write storage state
        STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
        if STORAGE_PATH.exists():
            backup = STORAGE_PATH.with_suffix(".backup.json")
            STORAGE_PATH.rename(backup)
            print(f"  Backed up previous → {backup.name}")

        STORAGE_PATH.write_text(json.dumps(storage, indent=2))
        print(f"  Written to {STORAGE_PATH}")
        return True


def validate_and_select():
    """Run notebooklm auth check and select notebook."""
    print("\nValidating auth...")
    try:
        result = subprocess.run(
            ["notebooklm", "use", NOTEBOOK_ID],
            capture_output=True, text=True, timeout=15,
        )
        if "Rapid Review" in result.stdout:
            print("  AUTH VALID — notebook selected: Rapid Review of Radiology")
            return True
        else:
            print(f"  Auth check output: {result.stdout.strip()}")
            if "expired" in result.stdout.lower() or "warning" in result.stdout.lower():
                print("  AUTH FAILED")
                return False
            return True
    except Exception as e:
        print(f"  Error: {e}")
        return False


def refresh_existing():
    """Refresh cookies using the existing storage_state.json (no Cookie-Editor needed).

    This is useful for auto-refreshing on codespace start — Google often refreshes
    SIDCC and other short-lived cookies via Set-Cookie headers during navigation.
    If the session is still valid, this extends it without manual cookie export.
    """
    if not STORAGE_PATH.exists():
        print("  No existing storage_state.json found.")
        return False

    storage = json.loads(STORAGE_PATH.read_text())
    pw_cookies = storage.get("cookies", [])
    if not pw_cookies:
        print("  No cookies in storage_state.json.")
        return False

    # Fix SameSite=None/Secure mismatch for browser
    for c in pw_cookies:
        if c.get("sameSite") == "None":
            c["secure"] = True

    print(f"  Using {len(pw_cookies)} existing cookies...")
    return refresh_with_playwright(pw_cookies)


def main():
    print("=" * 50)
    print("NotebookLM Cookie Refresh (Playwright)")
    print("=" * 50)

    # --refresh mode: use existing cookies, no Cookie-Editor needed
    if "--refresh" in sys.argv:
        print("\nRefreshing existing cookies via Playwright...")
        ok = refresh_existing()
        if ok and validate_and_select():
            print("\n  Cookies refreshed successfully!")
            sys.exit(0)
        else:
            print("\n  Refresh failed — session expired. Need fresh Cookie-Editor export.")
            sys.exit(1)

    # Default mode: read Cookie-Editor JSON
    cookies = read_cookies()
    print(f"\nLoaded {len(cookies)} cookies from Cookie-Editor export")

    # Convert
    pw_cookies = cookie_editor_to_playwright(cookies)
    names = sorted(set(c["name"] for c in pw_cookies))
    print(f"  Cookie names: {', '.join(names[:10])}{'...' if len(names) > 10 else ''}")

    # Use Playwright to navigate and capture full cookie set
    ok = refresh_with_playwright(pw_cookies)
    if not ok:
        sys.exit(1)

    # Validate
    if validate_and_select():
        print("\n  Ready to enrich! Run:")
        print("    python3 -u scripts/enrich_yjl2b_batch.py MSK")
    else:
        print("\n  Cookie refresh succeeded but auth validation failed.")
        print("  Try re-exporting cookies from a fresh notebooklm.google.com page load.")
        sys.exit(1)


if __name__ == "__main__":
    main()
