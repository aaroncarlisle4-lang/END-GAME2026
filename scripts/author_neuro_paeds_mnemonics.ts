import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const NEURO_PAEDS_UPDATES = [
  {
    mnemonic: "SATCHMO",
    pattern: "Supra-sellar mass",
    expanded: "S: Sarcoid / Sellar (Adenoma), A: Aneurysm, T: Teratoma, C: Craniopharyngioma, H: Hypothalamic glioma / Histiocytosis, M: Meningioma / Metastasis, O: Optic glioma",
    problemCluster: "intracranial mass",
    seriousAlternatives: ["Pituitary Apoplexy", "Aneurysm Rupture", "Optic Pathway Glioma"],
    differentials: [
      {
        diagnosis: "Sarcoidosis (CNS)",
        dominantImagingFinding: "NODULAR LEPTOMENINGEAL enhancement (100%). Thickening of the pituitary stalk.",
        distributionLocation: "Base of brain, hypothalamus, and suprasellar cistern.",
        demographicsClinicalContext: "Young adults. Cranial nerve palsies (7th most common). Uveitis.",
        discriminatingKeyFeature": "NODULAR meningeal enhancement and stalk thickening.",
        associatedFindings": "Symmetric hilar lymphadenopathy on CXR.",
        complicationsSeriousAlternatives": "Diabetes insipidus.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Pituitary Adenoma",
        dominantImagingFinding: "FIGURE-OF-8 shape. Sella enlargement (100%).",
        distributionLocation: "Sellar and suprasellar extension.",
        demographicsClinicalContext: "Adults. Bitemporal hemianopia. Prolactin elevation.",
        discriminatingKeyFeature": "SELLA ENLARGEMENT and figure-of-8 morphology.",
        associatedFindings": "Deviation of the stalk.",
        complicationsSeriousAlternatives": "Pituitary apoplexy.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Giant Aneurysm",
        dominantImagingFinding: "SIGNAL VOID on MRI. Pulsatile flow. Laminar thrombus.",
        distributionLocation: "Circle of Willis (ACom/ICA).",
        demographicsClinicalContext: "Any age. Sudden severe headache.",
        discriminatingKeyFeature": "CONTINUITY with major intracranial artery.",
        associatedFindings": "Peripheral calcification.",
        complicationsSeriousAlternatives": "SAH.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Craniopharyngioma",
        dominantImagingFinding": "CYSTIC (90%) and CALCIFIED (90%). Machinery oil content.",
        distributionLocation: "Suprasellar cistern. Retrosellar extension.",
        demographicsClinicalContext: "Bimodal: 5-15y and >50y.",
        discriminatingKeyFeature": "COARSE CALCIFICATION and complex cystic morphology.",
        associatedFindings": "Stalk displacement.",
        complicationsSeriousAlternatives": "Hypothalamic obesity.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Meningioma",
        dominantImagingFinding": "DURAL TAIL (60%). Broad base. Intense enhancement.",
        distributionLocation: "Planum sphenoidale or tuberculum sellae.",
        demographicsClinicalContext: "Females (3:1). Peak 50y.",
        discriminatingKeyFeature": "DURAL ATTACHMENT and hyperostosis.",
        associatedFindings": "Normal sella size.",
        complicationsSeriousAlternatives": "Optic nerve compression.",
        isCorrectDiagnosis": false
      }
    ]
  },
  {
    mnemonic: "GAME",
    pattern: "Posterior fossa mass in child",
    expanded: "G: Glioma (Pilocytic astrocytoma), A: Astrocytoma, M: Medulloblastoma, E: Ependymoma",
    problemCluster: "paediatric brain tumor",
    seriousAlternatives: ["Medulloblastoma", "ATRT", "Brainstem Glioma"],
    differentials: [
      {
        diagnosis: "Pilocytic Astrocytoma",
        dominantImagingFinding: "CYSTIC mass with highly ENHANCING MURAL NODULE (100%).",
        distributionLocation: "OFF-MIDLINE (Cerebellar Hemisphere) in 60%.",
        demographicsClinicalContext: "Peak 5-15y. Slower onset.",
        discriminatingKeyFeature": "CYST + ENHANCING NODULE and hemispheric location.",
        associatedFindings": "Significant peri-tumoral oedema.",
        complicationsSeriousAlternatives": "Recurrence.",
        isCorrectDiagnosis": true
      },
      {
        diagnosis: "Medulloblastoma",
        dominantImagingFinding: "SOLID hyperdense mass (90%). RESTRICTED DIFFUSION (100%).",
        distributionLocation: "MIDLINE (Vermian). Roof of 4th ventricle.",
        demographicsClinicalContext: "Peak 5-10y. Obstructive hydrocephalus.",
        discriminatingKeyFeature": "MIDLINE location and bright DWI signal.",
        associatedFindings": "DROP METS (30%).",
        complicationsSeriousAlternatives": "CNS dissemination.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Ependymoma",
        dominantImagingFinding: "SOLID heterogeneous mass. CALCIFIED (50%). 'Plastic' growth.",
        distributionLocation: "FLOOR of 4th ventricle. Squeezes through foramina.",
        demographicsClinicalContext: "Peak 1-5y.",
        discriminatingKeyFeature": "PLASTICITY and calcification.",
        associatedFindings": "Expansion of 4th ventricle.",
        complicationsSeriousAlternatives": "Brainstem invasion.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "ATRT",
        dominantImagingFinding: "Large aggressive mass. Haemorrhage and necrosis (100%).",
        distributionLocation: "Off-midline. Often CPA.",
        demographicsClinicalContext": "INFANTS (<3y). Highly aggressive.",
        discriminatingKeyFeature": "NEONATAL/INFANT age and extreme aggressiveness.",
        associatedFindings": "Early drop mets.",
        complicationsSeriousAlternatives": "Rapidly fatal.",
        isCorrectDiagnosis": false
      }
    ]
  }
];

async function main() {
  console.log("Upgrading Neuro/Paeds discriminators...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of NEURO_PAEDS_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.mnemonicRef?.mnemonic === update.mnemonic || 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      console.log(`Updating existing record for ${update.mnemonic}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: update.mnemonic === "GAME" ? 12 : 12,
          expandedLetters: update.expanded
        }
      });
    } else {
      console.log(`Creating new record for ${update.mnemonic}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 12,
          expandedLetters: update.expanded
        }
      });
    }
  }
}

main().catch(console.error);