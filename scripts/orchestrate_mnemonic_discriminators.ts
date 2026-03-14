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
  console.log("Fetching mnemonics...");
  const mnemonics = await client.query(api.mnemonics.list as any, {}).catch(() => []);
  
  if (!mnemonics || mnemonics.length === 0) {
    console.log("No mnemonics found.");
    return;
  }

  console.log(`Found ${mnemonics.length} mnemonics. Checking for missing discriminators...`);

  const existing = await client.query(api.discriminators.list as any, {}).catch(() => []);
  const existingMnemonicNames = new Set(existing.map((e: any) => e.mnemonicRef?.mnemonic));
  const existingPatterns = new Set(existing.map((e: any) => e.pattern.toLowerCase().trim()));

  const missing = mnemonics.filter((m: any) => 
    !existingMnemonicNames.has(m.mnemonic) && 
    !existingPatterns.has(m.pattern.toLowerCase().trim())
  );

  console.log(`Found ${missing.length} mnemonics without discriminators.`);

  // Limit to first 10 for this run to ensure quality and avoid timeout
  const batch = missing.slice(0, 10);

  for (const m of batch) {
    console.log(`\n--- Processing Mnemonic: ${m.mnemonic} (${m.pattern}) ---`);
    
    // Use the differentials defined in the mnemonic as our ddx list
    const ddxList = m.differentials.map((d: any) => d.condition).slice(0, 4);
    
    // Context search
    let contextStr = "";
    for (const ddx of ddxList) {
       console.log(`Searching vector DB for: ${ddx}`);
       try {
         const results = await client.action(api.rag.searchEntities as any, { query: ddx, limit: 1 });
         if (results && results.length > 0) {
           for (const res of results) {
             contextStr += `\nCondition: ${res.entityName}\n${res.rawTextChunk}\n`;
           }
         }
       } catch (e) {
         console.error(`RAG search failed for ${ddx}`);
       }
    }
    
    const prompt = `
You are a senior radiology consultant and educator. Create an A-star quality comparison matrix for the imaging pattern: "${m.pattern}".
The mnemonic for this is "${m.mnemonic}".
The top conditions to compare are: ${ddxList.join(", ")}.

TEXTBOOK CONTEXT:
${contextStr}

Your goal is to provide high-density, discriminating data that helps a candidate pass the FRCR 2B exam.
For each of the ${ddxList.length} conditions, provide a JSON object with these EXACT keys:
- diagnosis: string (Condition name)
- dominantImagingFinding: string (The hallmark imaging feature. Use UPPERCASE for key terms like INCREASED, ABSENT, etc.)
- distributionLocation: string (Anatomical distribution)
- demographicsClinicalContext: string (Typical patient profile and clinical presentation)
- discriminatingKeyFeature: string (The "Pathognomonic" or most unique feature that excludes the others)
- associatedFindings: string (Co-existing signs)
- complicationsSeriousAlternatives: string (What not to miss / dangerous mimics)
- isCorrectDiagnosis: boolean (Set true for the first condition "${ddxList[0]}", false for others)

Include serious life-threatening alternatives in a separate 'seriousAlternatives' array if applicable.

Return a JSON object:
{
  "pattern": "${m.pattern}",
  "differentials": [...],
  "seriousAlternatives": ["...", "..."],
  "problemCluster": "string describing the clinical category"
}
ONLY JSON. No markdown fences.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: [{ role: "user", content: prompt }],
      });
      
      const text = response.choices[0].message.content || "{}";
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleanText);

      await client.mutation(api.discriminators.create as any, {
        pattern: m.pattern,
        differentials: result.differentials,
        seriousAlternatives: result.seriousAlternatives,
        problemCluster: result.problemCluster,
        mnemonicRef: {
          mnemonic: m.mnemonic,
          chapterNumber: m.chapterNumber,
          expandedLetters: m.differentials.map((d: any) => `${d.letter}: ${d.condition}`).join(", "),
        }
      });
      
      console.log(`✅ Saved discriminator for ${m.mnemonic}`);
    } catch (e: any) {
      console.error(`❌ Failed ${m.mnemonic}: ${e.message}`);
    }
    
    // Increase delay for free tier rate limits
    await new Promise(r => setTimeout(r, 3000));
  }
}

main().catch(console.error);
