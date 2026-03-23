#!/usr/bin/env npx tsx
/**
 * Seed dahnertDDxClusters from all_ddx.json (deduplicated, all quality scores).
 * Usage:
 *   npx tsx scripts/seed_dahnert_ddx.ts
 *   npx tsx scripts/seed_dahnert_ddx.ts --clear
 *   npx tsx scripts/seed_dahnert_ddx.ts --link
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq), v = t.slice(eq + 1);
    if (!process.env[k]) process.env[k] = v;
  }
}

const CONVEX_URL = process.env.VITE_CONVEX_URL ?? "https://reminiscent-seal-853.convex.cloud";
const BATCH = 80;
const CLEAR = process.argv.includes("--clear");
const LINK  = process.argv.includes("--link");

async function main() {
  const src = path.join(__dirname, "..", "Bob's UK MLA", "structured", "all_ddx.json");
  const raw: any[] = JSON.parse(fs.readFileSync(src, "utf-8"));

  // Deduplicate: strip hash suffix from slug, keep highest quality_score per base
  const groups = new Map<string, any>();
  for (const d of raw) {
    const base = d.slug.replace(/_[0-9a-f]{6}$/, "");
    const existing = groups.get(base);
    if (!existing || (d.quality_score ?? 0) > (existing.quality_score ?? 0)) {
      groups.set(base, d);
    }
  }
  const deduped = [...groups.values()];
  console.log(`Raw: ${raw.length}  Deduped: ${deduped.length}`);

  // Transform
  const clusters = deduped.map((d, i) => ({
    finding: String(d.finding || "").trim(),
    slug: d.slug.replace(/_[0-9a-f]{6}$/, ""),
    chapter: String(d.chapter || "").trim(),
    clusterType: d.cluster_type || "differential",
    qualityScore: d.quality_score ?? 0,
    differentials: (d.differentials || []).map((diff: any, rank: number) => ({
      name: String(diff.name || "").trim(),
      rank,
      frequency: diff.frequency ? String(diff.frequency) : undefined,
    })).filter((diff: any) => diff.name),
    context: d.context ? String(d.context).trim().slice(0, 1000) : undefined,
  })).filter(c => c.finding && c.differentials.length > 0);

  console.log(`After filter: ${clusters.length} clusters to seed`);

  const client = new ConvexHttpClient(CONVEX_URL);

  if (CLEAR) {
    const r = await client.mutation(api.dahnertDDxClusters.clear, {});
    console.log(`Cleared ${r.deleted} records`);
  }

  let total = 0;
  for (let i = 0; i < clusters.length; i += BATCH) {
    const batch = clusters.slice(i, i + BATCH);
    const r = await client.mutation(api.dahnertDDxClusters.batchSeed, { clusters: batch });
    total += r.inserted;
    process.stdout.write(`\rSeeded ${i + batch.length}/${clusters.length} (+${total} inserted)`);
  }
  console.log(`\nTotal inserted: ${total}`);

  if (LINK) {
    console.log("Linking to highYieldClusters and differentialPatterns...");
    const r = await client.mutation(api.dahnertDDxClusters.linkToHighYieldAndPatterns, {});
    console.log(`Linked: highYield=${r.hyLinked}  patterns=${r.patLinked}  (from ${r.totalClusters} clusters)`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
