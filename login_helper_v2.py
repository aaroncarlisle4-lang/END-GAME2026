"""
NotebookLM login helper for headless Codespace environments.

Strategy: Launch headless Chromium with CDP, then use the DevTools
frontend to give you a visual browser you can interact with.

Access via: http://localhost:9222/json → find the page's devtoolsFrontendUrl
"""
import asyncio
import os
import json
import urllib.request
from playwright.async_api import async_playwright

async def main():
    browser_profile = "/home/codespace/.notebooklm/browser_profile"
    os.makedirs(browser_profile, exist_ok=True)

    async with async_playwright() as p:
        print("\n🚀 Launching headless browser with CDP on port 9222...")

        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--remote-debugging-port=9222",
                "--remote-debugging-address=0.0.0.0",
                "--disable-gpu",
                "--disable-dev-shm-usage",
            ],
        )

        context = await browser.new_context(
            storage_state="/home/codespace/.notebooklm/storage_state.json"
            if os.path.exists("/home/codespace/.notebooklm/storage_state.json")
            else None
        )
        page = await context.new_page()
        await page.goto("https://notebooklm.google.com/")
        await asyncio.sleep(3)

        current_url = page.url
        print(f"\nBrowser is at: {current_url}")

        # Get the DevTools inspect URL
        try:
            raw = urllib.request.urlopen("http://localhost:9222/json").read()
            tabs = json.loads(raw)
            for tab in tabs:
                if "devtoolsFrontendUrl" in tab:
                    inspect_url = f"http://localhost:9222{tab['devtoolsFrontendUrl']}"
                    print(f"\n{'='*60}")
                    print("STEP 1: Open the PORTS tab, find port 9222, make it Public")
                    print(f"STEP 2: Open this URL in your browser (replace localhost:9222")
                    print(f"        with the forwarded URL from Ports tab):")
                    print(f"\n  {tab['devtoolsFrontendUrl']}")
                    print(f"\n{'='*60}")
                    print("\nIn DevTools, the Google login page should be visible.")
                    print("Complete the login there.")
                    break
        except Exception as e:
            print(f"Could not get DevTools URL: {e}")
            print("Try opening http://localhost:9222 in the Ports tab")

        print("\n👉 Once you see your NotebookLM dashboard in the DevTools view,")
        print("   come back here and type 'done'.\n")

        while True:
            line = await asyncio.to_thread(input, "Type 'done' when logged in: ")
            if line.strip().lower() == "done":
                break
            elif line.strip().lower() == "url":
                print(f"Current URL: {page.url}")
            elif line.strip().lower() == "screenshot":
                await page.screenshot(path="/workspaces/END-GAME2026/login_screenshot.png")
                print("Screenshot saved to login_screenshot.png")

        # Save storage state for the CLI
        storage_path = "/home/codespace/.notebooklm/storage_state.json"
        await context.storage_state(path=storage_path)
        print(f"\n🎉 Authentication saved to {storage_path}")

        # Verify
        print("Verifying...")
        await page.goto("https://notebooklm.google.com/")
        await asyncio.sleep(3)
        final_url = page.url
        if "accounts.google.com" not in final_url:
            print("✅ Authentication looks good!")
        else:
            print("⚠️  Still redirecting to login. Auth may not have saved properly.")

        await context.close()
        await browser.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nCancelled.")
    except Exception as e:
        print(f"\nError: {e}")
