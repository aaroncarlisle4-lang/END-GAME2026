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
  const targetPatterns = []; // Leave empty [] for all
  
  console.log("Fetching discriminators...");
  let discriminators = await client.query(api.discriminators.list as any, {}).catch(() => []);
  
  if (targetPatterns.length > 0) {
    discriminators = discriminators.filter((d: any) => targetPatterns.includes(d.pattern));
  }
  
  if (!discriminators || discriminators.length === 0) {
    console.log("No discriminators matching targets found.");
    return;
  }

  console.log(`Processing ${discriminators.length} discriminators...`);

  for (const d of discriminators) {
    // Re-fetch to get most recent state
    const currentDoc = await client.query(api.discriminators.get as any, { id: d._id });
    if (!currentDoc) continue;

    const existingNames = new Set(currentDoc.differentials.map((diff: any) => diff.diagnosis.toLowerCase()));
    const missing = (currentDoc.seriousAlternatives || []).filter((alt: string) => !existingNames.has(alt.toLowerCase()));

    if (missing.length === 0) {
      console.log(`- ${currentDoc.pattern}: No missing serious alternatives.`);
      continue;
    }

    console.log(`\nPattern: ${currentDoc.pattern}`);
    console.log(`Missing: ${missing.join(", ")}`);

    let updatedDifferentials = [...currentDoc.differentials];
    let changed = false;

    for (const alt of missing) {
      // Double check inside loop in case of multiple missing for same doc
      if (updatedDifferentials.some(diff => diff.diagnosis.toLowerCase() === alt.toLowerCase())) continue;

      console.log(`  > Generating: ${alt}`);
      
      let contextStr = "";
      try {
        const results = await client.action(api.rag.searchEntities as any, { query: alt, limit: 1 });
        if (results && results.length > 0) {
          contextStr = `Textbook context for ${alt}: ${results[0].rawTextChunk}`;
        }
      } catch (e) {}

      const prompt = `
You are an expert radiology educator. For the imaging pattern "${currentDoc.pattern}", we need a detailed comparison entry for the serious alternative: "${alt}".

${contextStr || "Rely on your internal radiology expertise."}

Provide a JSON object with these EXACT keys:
- diagnosis: string (must be exactly "${alt}")
- dominantImagingFinding: string (key imaging finding)
- distributionLocation: string (typical distribution)
- demographicsClinicalContext: string (age, sex, risk factors, clinical clues)
- discriminatingKeyFeature: string (single most specific feature to tell it apart)
- associatedFindings: string (other findings often present)
- complicationsSeriousAlternatives: string (one line on what happens if missed or complications)
- isCorrectDiagnosis: boolean (set to false)

JSON ONLY. No markdown.
`;

      try {
        const response = await openai.chat.completions.create({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }],
        });
        
        const text = response.choices[0].message.content || "{}";
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const newDiff = JSON.parse(cleanText);

        updatedDifferentials.push(newDiff);
        changed = true;
        console.log(`    ✅ Generated ${alt}`);
      } catch (e: any) {
        console.error(`    ✗ Error generating ${alt}: ${e.message}`);
      }
      
      await new Promise(r => setTimeout(r, 1000));
    }

    if (changed) {
      try {
        await client.mutation(api.discriminators.update as any, {
          id: currentDoc._id,
          differentials: updatedDifferentials
        });
        console.log(`  💾 Updated ${currentDoc.pattern} in database.`);
      } catch (e: any) {
        console.error(`  ✗ Error saving ${currentDoc.pattern}: ${e.message}`);
      }
    }
  }
}

main().catch(console.error);
