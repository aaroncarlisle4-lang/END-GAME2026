import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MASTER_DATA = [
  {
    mnemonic: "LEMON",
    pattern: "Vertebra plana",
    differentials: [
      { letter: "L", condition: "Langerhans' cell histiocytosis (EG)", diagnosis: "EG (LCH)", hallmark: "Solitary pancake + Preserved disc", stats: "100% disc preservation" },
      { letter: "E", condition: "Ewing's sarcoma", diagnosis: "Ewing Sarcoma", hallmark: "Massive soft tissue + Permeative", stats: "Peak 5-20y" },
      { letter: "E", condition: "Enchondroma", diagnosis: "Enchondroma (Spine)", hallmark: "Lytic expansile + rings/arcs", stats: "Rare in spine" },
      { letter: "M", condition: "Metastasis (Neuroblastoma)", diagnosis: "Metastatic Neuroblastoma", hallmark: "Raccoon eyes + paraspinal mass", stats: "Peak 2y" },
      { letter: "M", condition: "Myeloma", diagnosis: "Plasmacytoma (Spine)", hallmark: "Soap-bubble expansile + older", stats: "Peak 60y" },
      { letter: "O", condition: "Osteomyelitis", diagnosis: "TB (Pott's Disease)", hallmark: "Disc destruction + abscess", stats: "100% specific vs tumor" },
      { letter: "N", condition: "Neuroblastoma", diagnosis: "Neuroblastoma", hallmark: "Primary paraspinal + calcification", stats: "Midline crossing" }
    ]
  }
];

async function main() {
  console.log("Master Sync Dual Batch: Paeds LEMON...");
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