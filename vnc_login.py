import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser_profile = "/home/codespace/.notebooklm/browser_profile"
        os.makedirs(browser_profile, exist_ok=True)
        
        print("\n🚀 Launching visual login browser...")
        
        # We launch a real browser with a special VNC-like display
        # and expose it on port 9222 (remote debugger)
        context = await p.chromium.launch_persistent_context(
            user_data_dir=browser_profile,
            headless=False,
            args=[
                "--no-sandbox", 
                "--remote-debugging-port=9222", 
                "--remote-debugging-address=0.0.0.0",
                "--disable-gpu",
                "--disable-dev-shm-usage"
            ]
        )
        
        page = await context.new_page()
        await page.goto("https://notebooklm.google.com/")
        
        print("\n✅ BROWSER IS RUNNING!")
        print("1. Click the 'Ports' tab (next to Terminal).")
        print("2. Look for Port 9222 and click the Globe icon (Open in Browser).")
        print("3. You will see a list of tabs. Click 'NotebookLM'.")
        print("4. Follow the Google Login steps (user, password, 2FA).")
        print("\n👉 Once you see your NotebookLM dashboard, come back here and type 'done'.")
        
        while True:
            line = await asyncio.to_thread(input, "\nType 'done' when you've logged in: ")
            if line.strip().lower() == "done":
                break
        
        # Save storage state for the CLI
        await context.storage_state(path="/home/codespace/.notebooklm/storage_state.json")
        await context.close()
        print("\n🎉 Authentication saved! You can now use 'notebooklm list'.")

if __name__ == "__main__":
    # We use xvfb-run to provide the display for the browser we're projecting
    os.system('xvfb-run --server-args="-screen 0 1024x768x24" python3 -c "import asyncio; from playwright.async_api import async_playwright; ' + 
              'import os; ' + open(__file__).read().split('if __name__ == "__main__":')[0] + ' asyncio.run(main())"')
