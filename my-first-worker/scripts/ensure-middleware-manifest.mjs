#!/usr/bin/env node
// Compatibility shims for opennextjs-cloudflare with Next.js 16:
//
// 1. Turbopack no longer generates middleware-manifest.json — create a stub.
// 2. Standalone output is now at .next/standalone/<name>/.next instead of
//    .next/standalone/.next — symlink the expected path.

import fs from "fs";
import path from "path";

const cwd = process.cwd();

// 1. Stub middleware-manifest.json
const manifestPath = path.join(cwd, ".next/server/middleware-manifest.json");
if (!fs.existsSync(manifestPath)) {
  const stub = { version: 3, sortedMiddleware: [], middleware: {}, functions: {}, pages: {} };
  fs.writeFileSync(manifestPath, JSON.stringify(stub));
  console.log("Created stub middleware-manifest.json");
}

// 2. Fix standalone path — find the nested app dir and symlink it up
const standaloneDir = path.join(cwd, ".next/standalone");
const expectedLink = path.join(standaloneDir, ".next");

if (!fs.existsSync(expectedLink)) {
  // Find the actual nested .next dir (e.g. standalone/my-first-worker/.next)
  const entries = fs.readdirSync(standaloneDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = path.join(standaloneDir, entry.name, ".next");
      if (fs.existsSync(nested)) {
        fs.symlinkSync(nested, expectedLink);
        console.log(`Symlinked ${nested} → ${expectedLink}`);
        break;
      }
    }
  }
}
