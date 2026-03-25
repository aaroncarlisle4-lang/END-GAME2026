import asyncio
from playwright.async_api import async_playwright
import sys

async def main():
    async with async_playwright() as p:
        # Use the same browser profile path as the CLI
        browser_profile = "/home/codespace/.notebooklm/browser_profile"
        context = await p.chromium.launch_persistent_context(
            user_data_dir=browser_profile,
            headless=True,  # No display needed
            args=["--no-sandbox"]
        )
        page = await context.new_page()
        await page.goto("https://notebooklm.google.com/")
        # Wait for potential redirects to Google login
        await asyncio.sleep(5)
        print(f"Login URL: {page.url}")
        await context.close()

if __name__ == "__main__":
    asyncio.run(main())
