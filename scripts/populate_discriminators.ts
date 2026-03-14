import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) throw new Error("Missing CONVEX_URL");

const OPENROUTER_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").filter(Boolean);
if (OPENROUTER_KEYS.length === 0) throw new Error("Missing OPENROUTER_KEYS");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_KEYS[0],
});

const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log("Fetching differential patterns...");
  const patterns = await client.query(api.differentialPatterns.list as any, {}).catch(() => []);
  
  if (!patterns || patterns.length === 0) {
    console.log("No differential patterns found.");
    return;
  }

  console.log(`Found ${patterns.length} differential patterns. Processing...`);

  // Optional: fetch existing to skip already generated
  const existing = await client.query(api.discriminators.searchByPattern as any, { pattern: "" }).catch(() => []);
  const existingPatterns = new Set(existing.map((e: any) => e.pattern));

  for (const p of patterns) {
    if (existingPatterns.has(p.pattern)) {
      console.log(`Skipping: ${p.pattern} (Already exists)`);
      continue;
    }
    console.log(`\nProcessing: ${p.pattern} (Diagnosis: ${p.diagnosis})`);
    const ddxList = [p.diagnosis, ...(p.top3 || [])].slice(0, 4); 

    // Query RAG for each condition to get context
    let contextStr = "";
    for (const ddx of ddxList) {
       console.log(`Searching vector DB for: ${ddx}`);
       try {
         const results = await client.action(api.rag.searchEntities as any, { query: ddx, limit: 2 });
         if (results && results.length > 0) {
           contextStr += `\n\n--- Context for ${ddx} ---\n`;
           for (const res of results) {
             contextStr += `Entity: ${res.entityName}\n${res.rawTextChunk}\n`;
           }
         }
       } catch (e) {
         console.error(`RAG search failed for ${ddx}:`, e);
       }
    }
    
    const prompt = `
You are an expert radiology educator. For the following imaging pattern: "${p.pattern}", the primary diagnosis is "${p.diagnosis}" and the top differentials are: ${ddxList.join(", ")}.

Here is some textbook context retrieved from the vector database:
${contextStr}

If the context lacks sufficient information, rely on your internal radiology knowledge.
We need a detailed discriminator table to help candidates differentiate between these conditions.
For each of the ${ddxList.length} conditions, provide a JSON object with the following EXACT keys:
- diagnosis: string (the condition name)
- dominantImagingFinding: string (key imaging finding / pattern)
- distributionLocation: string (typical distribution / location)
- demographicsClinicalContext: string (demographics, clinical context, risk factors)
- discriminatingKeyFeature: string (the single most important feature to discriminate it)
- associatedFindings: string (other associated findings)
- complicationsSeriousAlternatives: string (complications or serious alternatives if this is missed)
- isCorrectDiagnosis: boolean (true if it's the primary diagnosis "${p.diagnosis}", false otherwise)

Return a JSON array of these objects ONLY. No markdown fences, no explanations.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
      });
      
      const text = response.choices[0].message.content || "[]";
      // Clean markdown fences
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const differentials = JSON.parse(cleanText);

      console.log(`Generated ${differentials.length} differentials for ${p.pattern}`);

      await client.mutation(api.discriminators.create as any, {
        pattern: p.pattern,
        differentials: differentials,
        obrienRef: {
          obrienCaseNumber: p.obrienCaseNumber,
          pattern: p.pattern,
          top3Alignment: "Perfect match",
        }
      });
      console.log(`Successfully saved discriminator for ${p.pattern}`);
    } catch (e: any) {
      console.error(`Failed to process ${p.pattern}: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
}

main().catch(console.error);
