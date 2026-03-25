"""
NotebookLM login helper for Codespaces - Cookie Transfer Method.

Instead of trying to run a browser here, this script:
1. Launches headless Playwright to drive the login flow
2. You type commands to navigate (type email, password, etc.)
3. Takes screenshots so you can see what's happening

OR - the easier way:
1. Log into notebooklm.google.com in YOUR browser
2. Export cookies using a browser extension
3. Paste them here
"""
import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

STORAGE_PATH = "/home/codespace/.notebooklm/storage_state.json"

def build_storage_state(cookies_list):
    """Build a Playwright storage_state.json from a list of cookie dicts."""
    return {
        "cookies": cookies_list,
        "origins": []
    }

async def interactive_login():
    """Drive a headless browser with text commands + screenshots."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )
        context = await browser.new_context()
        page = await context.new_page()

        print("\n🚀 Navigating to NotebookLM...")
        await page.goto("https://notebooklm.google.com/")
        await asyncio.sleep(3)

        ss_count = 0
        while True:
            ss_count += 1
            ss_path = f"/workspaces/END-GAME2026/screen_{ss_count}.png"
            await page.screenshot(path=ss_path, full_page=True)
            print(f"\n📸 Screenshot saved: screen_{ss_count}.png (open in VS Code file explorer)")
            print(f"   Current URL: {page.url}")
            print(f"\nCommands:")
            print(f"  type <text>     - Type text into the focused field")
            print(f"  click <text>    - Click a button/link containing that text")
            print(f"  enter           - Press Enter")
            print(f"  tab             - Press Tab")
            print(f"  goto <url>      - Navigate to URL")
            print(f"  screenshot      - Take another screenshot")
            print(f"  done            - Save auth and exit")
            print(f"  quit            - Exit without saving")

            line = await asyncio.to_thread(input, "\n> ")
            cmd = line.strip()

            if not cmd:
                continue
            elif cmd == "done":
                await context.storage_state(path=STORAGE_PATH)
                print(f"\n🎉 Auth saved to {STORAGE_PATH}")
                break
            elif cmd == "quit":
                print("Exiting without saving.")
                break
            elif cmd == "enter":
                await page.keyboard.press("Enter")
                await asyncio.sleep(2)
            elif cmd == "tab":
                await page.keyboard.press("Tab")
                await asyncio.sleep(1)
            elif cmd == "screenshot":
                continue  # Will take screenshot at top of loop
            elif cmd.startswith("type "):
                text = cmd[5:]
                await page.keyboard.type(text, delay=50)
                await asyncio.sleep(1)
            elif cmd.startswith("click "):
                text = cmd[6:]
                try:
                    await page.get_by_text(text, exact=False).first.click()
                    await asyncio.sleep(2)
                except Exception as e:
                    print(f"  ❌ Could not find/click '{text}': {e}")
            elif cmd.startswith("goto "):
                url = cmd[5:]
                await page.goto(url)
                await asyncio.sleep(3)
            else:
                print(f"  Unknown command: {cmd}")

        await context.close()
        await browser.close()

def paste_cookies():
    """Let user paste cookies from their browser."""
    print("""
╔══════════════════════════════════════════════════════════════╗
║  COOKIE TRANSFER METHOD                                      ║
║                                                              ║
║  1. Open https://notebooklm.google.com in YOUR browser       ║
║  2. Make sure you're logged in                               ║
║  3. Open DevTools (F12) → Application → Cookies              ║
║  4. Or install "EditThisCookie" / "Cookie-Editor" extension  ║
║  5. Export ALL cookies for notebooklm.google.com             ║
║     AND .google.com as JSON                                  ║
║  6. Paste the JSON below                                     ║
╚══════════════════════════════════════════════════════════════╝
    """)
    print("Paste your cookies JSON (then press Enter twice on an empty line):")

    lines = []
    while True:
        line = input()
        if line.strip() == "" and lines:
            break
        lines.append(line)

    raw = "\n".join(lines)
    try:
        cookies = json.loads(raw)

        # Normalize cookie format for Playwright
        pw_cookies = []
        for c in cookies:
            cookie = {
                "name": c.get("name", ""),
                "value": c.get("value", ""),
                "domain": c.get("domain", ".google.com"),
                "path": c.get("path", "/"),
                "secure": c.get("secure", True),
                "httpOnly": c.get("httpOnly", False),
                "sameSite": c.get("sameSite", "None"),
            }
            if "expirationDate" in c:
                cookie["expires"] = c["expirationDate"]
            pw_cookies.append(cookie)

        state = build_storage_state(pw_cookies)
        os.makedirs(os.path.dirname(STORAGE_PATH), exist_ok=True)
        with open(STORAGE_PATH, "w") as f:
            json.dump(state, f, indent=2)

        print(f"\n🎉 Saved {len(pw_cookies)} cookies to {STORAGE_PATH}")
        print("Now run: notebooklm list")

    except json.JSONDecodeError as e:
        print(f"\n❌ Invalid JSON: {e}")
        print("Make sure you copied the full JSON array.")

if __name__ == "__main__":
    print("\nNotebookLM Login Helper for Codespaces")
    print("=" * 40)
    print("\nChoose method:")
    print("  1. Interactive (screenshot-driven headless browser)")
    print("  2. Cookie paste (transfer from your browser)")

    choice = input("\nChoice [1/2]: ").strip()

    if choice == "2":
        paste_cookies()
    else:
        asyncio.run(interactive_login())
