#!/usr/bin/env npx tsx
/**
 * Parallel Discriminator Orchestrator
 * Modelled on orchestrateAgents.ts for high-performance population.
 * 
 * Scaled to 10 agents to process 325 differential patterns.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: ".env.local" });
dotenv.config();

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "https://reminiscent-seal-853.convex.cloud";
const OPENROUTER_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").filter(Boolean);
const MODEL = "google/gemini-2.5-pro"; // Powerful model for detailed discriminators
const BATCH_SIZE = 1; // Process one pattern at a time to ensure high quality
const DELAY = 2; // 2s between calls per worker
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 120000;
const MANIFEST_PATH = path.join(__dirname, "discriminator_manifest.json");

const client = new ConvexHttpClient(CONVEX_URL);

interface ManifestEntry {
  _id: string;
  pattern: string;
  diagnosis: string;
  top3: string[];
  obrienCaseNumber: number;
  status: "pending" | "processing" | "done" | "failed";
  attempts: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(workerId: number, msg: string) {
  const prefix = workerId >= 0 ? `[W${workerId}]` : "     ";
  console.log(`${prefix} ${msg}`);
}

function saveManifest(manifest: ManifestEntry[]) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function buildManifest(): Promise<ManifestEntry[]> {
  if (fs.existsSync(MANIFEST_PATH)) {
    const existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as ManifestEntry[];
    const done = existing.filter(m => m.status === "done").length;
    console.log(`📂 Resuming: ${done}/${existing.length} done`);
    return existing;
  }

  console.log("🔍 Querying Convex for all differential patterns...");
  const patterns = await client.query(api.differentialPatterns.list as any, {});
  
  // Also check existing discriminators to mark as done
  const existingDiscs = await client.query(api.discriminators.searchByPattern as any, { pattern: "" });
  const donePatterns = new Set(existingDiscs.map((d: any) => d.pattern));

  const manifest: ManifestEntry[] = patterns.map((p: any) => ({
    _id: p._id,
    pattern: p.pattern,
    diagnosis: p.diagnosis,
    top3: p.top3 || [],
    obrienCaseNumber: p.obrienCaseNumber,
    status: donePatterns.has(p.pattern) ? "done" : "pending",
    attempts: 0,
  }));

  saveManifest(manifest);
  return manifest;
}

async function callOpenRouter(apiKey: string, prompt: string, workerId: number): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          log(workerId, `⚠ Rate limited, retrying...`);
          await sleep(5000 * (attempt + 1));
          continue;
        }
        return "";
      }

      const data = await response.json() as any;
      return data.choices?.[0]?.message?.content || "";
    } catch (err: any) {
      log(workerId, `✗ Error: ${err.message}`);
      await sleep(2000);
    }
  }
  return "";
}

async function workerLoop(workerId: number, apiKey: string, manifest: ManifestEntry[]) {
  while (true) {
    const entry = manifest.find(m => m.status === "pending");
    if (!entry) break;

    entry.status = "processing";
    entry.attempts++;
    saveManifest(manifest);

    log(workerId, `Processing: ${entry.pattern}`);

    // RAG Retrieval
    const ddxList = [entry.diagnosis, ...entry.top3].slice(0, 4);
    let contextStr = "";
    for (const ddx of ddxList) {
      try {
        const results = await client.action(api.rag.searchEntities as any, { query: ddx, limit: 1 });
        if (results && results.length > 0) {
          contextStr += `\nContext for ${ddx}: ${results[0].rawTextChunk}\n`;
        }
      } catch {}
    }

    const prompt = `
You are an expert radiology educator. For the following imaging pattern: "${entry.pattern}", the primary diagnosis is "${entry.diagnosis}" and the top differentials are: ${ddxList.join(", ")}.

Retrieved context: ${contextStr}

Provide a detailed discriminator table. For each of the ${ddxList.length} conditions, provide a JSON object with:
- diagnosis: string
- dominantImagingFinding: string
- distributionLocation: string
- demographicsClinicalContext: string (with risk factors)
- discriminatingKeyFeature: string
- associatedFindings: string
- complicationsSeriousAlternatives: string
- isCorrectDiagnosis: boolean (true if it's "${entry.diagnosis}")

Return a JSON array of objects ONLY. No markdown.
`;

    const raw = await callOpenRouter(apiKey, prompt, workerId);
    if (!raw) {
      entry.status = "pending";
      log(workerId, `✗ Failed, re-queuing`);
      await sleep(DELAY * 1000);
      continue;
    }

    try {
      const cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const differentials = JSON.parse(cleanJson);

      await client.mutation(api.discriminators.create as any, {
        pattern: entry.pattern,
        differentials,
        obrienRef: {
          obrienCaseNumber: entry.obrienCaseNumber,
          pattern: entry.pattern,
          top3Alignment: "Perfect match",
        }
      });

      entry.status = "done";
      log(workerId, `✅ Success!`);
    } catch (e: any) {
      log(workerId, `✗ Parse/Seed Error: ${e.message}`);
      entry.status = "pending";
    }

    saveManifest(manifest);
    await sleep(DELAY * 1000);
  }
}

async function main() {
  const numWorkers = Math.min(OPENROUTER_KEYS.length, 10);
  console.log(`🚀 Starting Discriminator Orchestrator with ${numWorkers} workers...`);

  const manifest = await buildManifest();
  const workers = [];
  for (let i = 0; i < numWorkers; i++) {
    await sleep(200);
    workers.push(workerLoop(i, OPENROUTER_KEYS[i], manifest));
  }

  await Promise.all(workers);
  console.log("🏁 All workers finished!");
}

main().catch(console.error);
