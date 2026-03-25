#!/usr/bin/env node
/**
 * Cloudflare OAuth helper for Codespaces.
 *
 * Usage:
 *   node scripts/cf-auth-helper.mjs
 *
 * When wrangler login fails because the browser can't reach localhost:8976,
 * paste the full callback URL here when prompted.
 */

import http from "http";
import { createInterface } from "readline";

const PORT = 8976;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/oauth/callback") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html><body>
      <h2>✅ Auth received — you can close this tab.</h2>
      <p>Wrangler is completing login...</p>
    </body></html>`);
    console.log("\n✅ Callback received. Wrangler should now be authenticated.");
    setTimeout(() => server.close(), 500);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\nListening on http://localhost:${PORT}`);
  console.log("\nPaste the full Cloudflare callback URL (starts with http://localhost:8976/oauth/callback?...):");
  console.log("(or press Ctrl+C to cancel)\n");

  const rl = createInterface({ input: process.stdin });

  rl.on("line", async (line) => {
    const raw = line.trim();
    if (!raw.startsWith("http")) {
      console.log("❌ Not a valid URL. Try again.");
      return;
    }

    try {
      const parsed = new URL(raw);
      // Deliver it to the local server so wrangler's server handles it
      const target = `http://localhost:${PORT}${parsed.pathname}${parsed.search}`;
      console.log(`\n→ Delivering callback to ${target}`);
      const { default: fetch } = await import("node-fetch").catch(() => ({ default: globalThis.fetch }));
      const resp = await fetch(target);
      console.log(`   Server responded: ${resp.status}`);
    } catch (err) {
      console.error("❌ Error:", err.message);
    }
    rl.close();
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} already in use — wrangler's server may still be running.`);
    console.log(`Try: curl "<paste URL here>"`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
