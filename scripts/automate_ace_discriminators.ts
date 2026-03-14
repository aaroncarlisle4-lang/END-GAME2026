import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

async function main() {
  console.log("Automating ACE Discriminator population from DB content...");
  
  const allAce = await client.query(api.chapman.list as any, {});
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  console.log(`Found ${allAce.length} ACE items.`);

  for (const ace of allAce) {
    const pattern = ace.pattern.trim();
    const diagnoses: string[] = [];
    ace.families.forEach((f: any) => {
      f.diagnoses.forEach((dx: string) => {
        if (dx && dx.trim().length > 3) diagnoses.push(dx.trim());
      });
    });

    if (diagnoses.length === 0) continue;

    const existing = discriminators.find((d: any) => d.pattern.toLowerCase().trim() === pattern.toLowerCase().trim());
    
    // If it already has a high-quality manual entry (many differentials), maybe skip?
    // Actually, the user wants it to MATCH the DDx.
    
    const differentials = diagnoses.map((rawDx, idx) => {
      // Basic parsing of descriptive text: "Diagnosis - Description" or "Diagnosis (Description)"
      let diagnosis = rawDx;
      let description = "";
      
      const dashSplit = rawDx.split(" – "); // Em dash
      const normalDashSplit = rawDx.split(" - ");
      const bracketMatch = rawDx.match(/^([^(]+)\(([^)]+)\)/);

      if (dashSplit.length > 1) {
        diagnosis = dashSplit[0].trim();
        description = dashSplit.slice(1).join(" ").trim();
      } else if (normalDashSplit.length > 1) {
        diagnosis = normalDashSplit[0].trim();
        description = normalDashSplit.slice(1).join(" ").trim();
      } else if (bracketMatch) {
        diagnosis = bracketMatch[1].trim();
        description = bracketMatch[2].trim();
      }

      // Clean up diagnosis name (remove trailing dots etc)
      diagnosis = diagnosis.replace(/\.$/, "").trim();

      return {
        diagnosis: diagnosis,
        dominantImagingFinding: description || `${diagnosis} characteristic features.`,
        distributionLocation: "As per Chapman ACE distribution.",
        demographicsClinicalContext: "See ACE card for details.",
        discriminatingKeyFeature: description ? description.split('.')[0] : "Key sign from Chapman.",
        associatedFindings: "Associated features listed in ACE.",
        complicationsSeriousAlternatives: "Refer to clinical guidelines.",
        isCorrectDiagnosis: idx === 0,
        sortOrder: idx
      };
    });

    if (existing) {
      console.log(`Updating discriminator for: ${pattern} (${diagnoses.length} items)`);
      await client.mutation(api.discriminators.update as any, {
        id: existing._id,
        differentials: differentials
      });
    } else {
      console.log(`Creating discriminator for: ${pattern} (${diagnoses.length} items)`);
      await client.mutation(api.discriminators.create as any, {
        pattern: pattern,
        problemCluster: ace.itemNumber,
        differentials: differentials
      });
    }
  }
  console.log("ACE Automation Complete!");
}

main().catch(console.error);