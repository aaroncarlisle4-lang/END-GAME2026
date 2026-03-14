import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MASTER_DATA = [
  {
    mnemonic: "I HEAL",
    pattern: "Intramedullary spinal mass",
    differentials: [
      { letter: "I", condition: "Infarct", diagnosis: "Spinal Cord Infarct", hallmark: "Owl's Eyes sign + Acute", stats: "Anterior spinal artery" },
      { letter: "I", condition: "Infection", diagnosis: "Transverse Myelitis", hallmark: "Diffuse high T2 + Long segment", stats: "Post-viral / AI" },
      { letter: "H", condition: "Haemangioblastoma", diagnosis: "Haemangioblastoma", hallmark: "Cyst + Enhancing mural nodule", stats: "100% specific mural nodule" },
      { letter: "E", condition: "Ependymoma", diagnosis: "Ependymoma", hallmark: "Central + Hemosiderin cap", stats: "80% hemosiderin cap" },
      { letter: "A", condition: "Astrocytoma", diagnosis: "Spinal Astrocytoma", hallmark: "Eccentric + Ill-defined", stats: "Children (60%)" },
      { letter: "L", condition: "Lipoma", diagnosis: "Spinal Lipoma", hallmark: "Fat signal (T1 high)", stats: "Associated dysraphism" },
      { letter: "L", condition: "Lymphoma", diagnosis: "Spinal Lymphoma", hallmark: "Homogeneous + solid enhancement", stats: "Systemic NHL" }
    ]
  },
  {
    mnemonic: "MAGIC DR",
    pattern: "Ring enhancing brain lesions",
    differentials: [
      { letter: "M", condition: "Metastasis", diagnosis: "Metastasis", hallmark: "Thin ring + Grey-white junction", stats: "90% grey-white" },
      { letter: "A", condition: "Abscess", diagnosis: "Cerebral Abscess", hallmark: "Thin ring + DWI restricted center", stats: "100% central restriction" },
      { letter: "G", condition: "Glioblastoma", diagnosis: "Glioblastoma (GBM)", hallmark: "Thick shaggy wall + midline cross", stats: "90% cross corpus callosum" },
      { letter: "I", condition: "Infarct", diagnosis: "Subacute Infarct", hallmark: "Gyral enhancement + vascular territory", stats: "FAST history" },
      { letter: "C", condition: "Contusion", diagnosis: "Cerebral Contusion", hallmark: "Surface blood + Trauma", stats: "Coup/Contre-coup" },
      { letter: "D", condition: "Demyelinating", diagnosis: "Tumefactive MS", hallmark: "Open ring sign (facing grey)", stats: "90% arc-like" },
      { letter: "R", condition: "Radiation necrosis", diagnosis: "Radiation Necrosis", hallmark: "Swiss-cheese pattern + field respect", stats: "6-24m post-RT" }
    ]
  }
];

async function main() {
  console.log("Master Sync Dual Batch: Neuro I HEAL/MAGIC...");
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