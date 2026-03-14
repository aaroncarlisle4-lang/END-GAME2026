import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MASTER_DATA = [
  {
    mnemonic: "HAPPY",
    pattern: "Bilateral consolidation",
    differentials: [
      { letter: "H", condition: "Heart failure", diagnosis: "Pulmonary Oedema", hallmark: "Bat-wing + Cardiomegaly", stats: "Rapid diuretic response" },
      { letter: "A", condition: "Alveolar proteinosis", diagnosis: "Alveolar Proteinosis", hallmark: "Crazy paving + Geographic sparing", stats: "Whole lung lavage therapy" },
      { letter: "P", condition: "PJP", diagnosis: "Pneumocystis Pneumonia", hallmark: "Perihilar GGO + Pneumatoceles", stats: "Profound hypoxia" },
      { letter: "P", condition: "Phlebitis (Vasculitis)", diagnosis: "Vasculitis (GPA)", hallmark: "Cavitating nodules + Renal disease", stats: "50% cavitation" },
      { letter: "Y", condition: "Y-haemorrhage", diagnosis: "Alveolar Haemorrhage", hallmark: "Rapid clearing + Hb drop", stats: "48-72h clear-out" }
    ]
  },
  {
    mnemonic: "SLIPS",
    pattern: "Bilateral hilar enlargement",
    differentials: [
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis", hallmark: "Striking symmetry + Garland Triad", stats: "95% symmetrical" },
      { letter: "S", condition: "Silicosis", diagnosis: "Silicosis", hallmark: "Eggshell calcification + Upper zone", stats: "5% eggshell calc" },
      { letter: "L", condition: "Lymphoma", diagnosis: "Lymphoma", hallmark: "Asymmetrical + Bulky anterior", stats: "B-symptoms" },
      { letter: "L", condition: "Leukaemia", diagnosis: "Leukaemia (CNS/Chest)", hallmark: "Bulky nodes + Symmetrical", stats: "Blasts on smear" },
      { letter: "I", condition: "Infection (TB/Viral)", diagnosis: "Primary TB", hallmark: "Unilateral hilar (95%)", stats: "Children/Immigrants" },
      { letter: "P", condition: "Pneumoconiosis", diagnosis: "Pneumoconiosis", hallmark: "Discrete nodules + Node calc", stats: "Occupational history" },
      { letter: "S", condition: "Secondary (Mets)", diagnosis: "Metastatic Adenopathy", hallmark: "Bulky + Disparate growth", stats: "Known primary CA" }
    ]
  }
];

async function main() {
  console.log("Master Sync Dual Batch: Chest Slips/Happy...");
  const mnemonics = await client.query(api.mnemonics.list as any, {});
  const discriminators = await client.query(api.discriminators.list as any, {});

  for (const entry of MASTER_DATA) {
    console.log(`Processing: ${entry.mnemonic}`);
    const mRecord = mnemonics.find((m: any) => m.mnemonic === entry.mnemonic);
    if (mRecord) {
      await client.mutation(api.mnemonics.update as any, {
        id: mRecord._id,
        differentials: entry.differentials.map(d => ({
          letter: d.letter,
          condition: d.condition,
          associatedFeatures: d.hallmark
        }))
      });
    }
    const dMatch = discriminators.find((d: any) => d.mnemonicRef?.mnemonic === entry.mnemonic);
    if (dMatch) {
      await client.mutation(api.discriminators.update as any, {
        id: dMatch._id,
        mnemonicRef: {
          mnemonic: entry.mnemonic,
          chapterNumber: dMatch.mnemonicRef.chapterNumber,
          expandedLetters: entry.differentials.map(d => `${d.letter}: ${d.condition}`).join(", ")
        },
        differentials: entry.differentials.map((d, idx) => ({
          diagnosis: d.diagnosis,
          mnemonicLetter: d.letter,
          sortOrder: idx,
          dominantImagingFinding: d.diagnosis.toUpperCase() + ": " + d.hallmark,
          distributionLocation: "Typically " + d.diagnosis + " distribution",
          demographicsClinicalContext: d.stats + ". " + d.hallmark,
          discriminatingKeyFeature: d.hallmark,
          associatedFindings: "Associated with " + d.condition,
          complicationsSeriousAlternatives: "Risk of progression",
          isCorrectDiagnosis: idx === 0
        }))
      });
    }
  }
}

main().catch(console.error);