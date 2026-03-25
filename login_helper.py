import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def main():
    browser_profile = "/home/codespace/.notebooklm/browser_profile"
    os.makedirs(browser_profile, exist_ok=True)
    
    async with async_playwright() as p:
        print("\n🚀 Starting secure login session on port 9222...")
        
        # We'll launch it in headless mode but with the debugging port exposed
        # VS Code will pick up the port and let you tunnel in
        context = await p.chromium.launch_persistent_context(
            user_data_dir=browser_profile,
            headless=True,
            args=[
                "--no-sandbox", 
                "--remote-debugging-port=9222", 
                "--remote-debugging-address=0.0.0.0",
                "--disable-gpu",
                "--disable-dev-shm-usage"
            ]
        )
        
        # Navigate to Google Login directly
        page = await context.new_page()
        await page.goto("https://notebooklm.google.com/")
        
        print("\n✅ Browser is ready in the background!")
        print("1. Go to the 'Ports' tab (next to Terminal).")
        print("2. Look for Port 9222 and click the Globe icon (Open in Browser).")
        print("3. You will see a list of tabs. Click 'NotebookLM' or 'Google Login'.")
        print("4. Log in to your Google Account.")
        print("\n👉 Once you see your NotebookLM dashboard, come back here and type 'done'.")
        
        while True:
            # We use a simple input here to wait for you
            line = await asyncio.to_thread(input, "\nType 'done' when you've logged in: ")
            if line.strip().lower() == "done":
                break
        
        # Save cookies for the CLI
        await context.storage_state(path="/home/codespace/.notebooklm/storage_state.json")
        print("\n🎉 Authentication saved to storage_state.json!")
        await context.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nCancelled.")
    except Exception as e:
        print(f"\nError: {e}")
