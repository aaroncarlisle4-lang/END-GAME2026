import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const UPDATES = [
  {
    mnemonic: "SATCHMO",
    pattern: "Supra-sellar mass",
    expanded: "S: Sarcoid / Sellar (Adenoma), A: Aneurysm, T: Teratoma, C: Craniopharyngioma, H: Hypothalamic glioma / Histiocytosis, M: Meningioma / Metastasis, O: Optic glioma",
    problemCluster: "intracranial mass",
    seriousAlternatives: ["Pituitary Apoplexy", "Aneurysm Rupture", "Optic Pathway Glioma"],
    differentials: [
      {
        diagnosis: "Pituitary Adenoma",
        dominantImagingFinding: "FIGURE-OF-8 (Snowman) shape. Sella enlargement (100%).",
        distributionLocation: "Intra-sellar and Supra-sellar.",
        demographicsClinicalContext: "Adults. Bitemporal hemianopia.",
        discriminatingKeyFeature": "SELLA ENLARGEMENT and figure-of-8 morphology.",
        associatedFindings": "Stalk deviation.",
        complicationsSeriousAlternatives": "Apoplexy.",
        isCorrectDiagnosis": true
      },
      {
        diagnosis: "Aneurysm (Giant)",
        dominantImagingFinding: "SIGNAL VOID on MRI. Pulsatile flow.",
        distributionLocation: "Circle of Willis (ACom).",
        demographicsClinicalContext: "Any age. Sudden severe headache.",
        discriminatingKeyFeature": "CONTINUITY with major intracranial artery.",
        associatedFindings": "Peripheral wall calcification.",
        complicationsSeriousAlternatives": "Rupture (SAH).",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Teratoma (Dermoid)",
        dominantImagingFinding: "COMPLEX mass with FAT signal (High T1).",
        distributionLocation: "Midline suprasellar.",
        demographicsClinicalContext: "Young adults.",
        discriminatingKeyFeature": "FAT-FLUID LEVELS or macroscopic fat.",
        associatedFindings": "Rupture causes 'fat droplets' in subarachnoid space.",
        complicationsSeriousAlternatives": "Chemical meningitis.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Craniopharyngioma",
        dominantImagingFinding: "CYSTIC (90%) and CALCIFIED (90%). Machinery oil content.",
        distributionLocation: "Suprasellar cistern.",
        demographicsClinicalContext: "Bimodal: 5-15y and >50y.",
        discriminatingKeyFeature": "COARSE CALCIFICATION and complex cystic morphology.",
        associatedFindings": "Stalk displacement.",
        complicationsSeriousAlternatives": "Hypothalamic dysfunction.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Hypothalamic Glioma",
        dominantImagingFinding: "Focal or diffuse enlargement of hypothalamus.",
        distributionLocation: "Suprasellar floor.",
        demographicsClinicalContext: "Children. NF1 association.",
        discriminatingKeyFeature": "FUSIFORM enlargement of the optic pathways/hypothalamus.",
        associatedFindings": "NF1 skin stigmata.",
        complicationsSeriousAlternatives": "Visual loss.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Meningioma",
        dominantImagingFinding: "DURAL TAIL (60%). Broad base. Hyperostosis.",
        distributionLocation: "Planum sphenoidale / Tuberculum sellae.",
        demographicsClinicalContext: "Females (3:1). Peak 50y.",
        discriminatingKeyFeature": "DURAL ATTACHMENT and absence of sella expansion.",
        associatedFindings": "Normal sella.",
        complicationsSeriousAlternatives": "Optic nerve compression.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Optic Glioma",
        dominantImagingFinding: "Tubular enlargement of the optic nerves/chiasm.",
        distributionLocation: "Suprasellar cistern.",
        demographicsClinicalContext: "Children. 100% NF1 association if bilateral.",
        discriminatingKeyFeature": "TRAM-TRACK optic nerve enlargement.",
        associatedFindings": "NF1 markers.",
        complicationsSeriousAlternatives": "Blindness.",
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
        dominantImagingFinding: "CYSTIC mass with ENHANCING MURAL NODULE (100% specific).",
        distributionLocation: "OFF-MIDLINE (Cerebellar Hemisphere).",
        demographicsClinicalContext: "Peak 5-15y.",
        discriminatingKeyFeature": "CYST + ENHANCING NODULE and hemispheric location.",
        associatedFindings": "Significant oedema.",
        complicationsSeriousAlternatives": "Recurrence.",
        isCorrectDiagnosis": true
      },
      {
        diagnosis: "Astrocytoma (Brainstem)",
        dominantImagingFinding: "Diffusely ENLARGED PONS. T2 hyperintense.",
        distributionLocation: "Centred on PONS.",
        demographicsClinicalContext: "Peak 5-10y.",
        discriminatingKeyFeature": "DIFFUSE expansion of PONS without focal mass.",
        associatedFindings": "Encasement of basilar artery.",
        complicationsSeriousAlternatives": "Death (Uniformly fatal).",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Medulloblastoma",
        dominantImagingFinding: "SOLID hyperdense mass (90%). RESTRICTED DIFFUSION (100%).",
        distributionLocation: "MIDLINE (Vermian). Roof of 4th ventricle.",
        demographicsClinicalContext: "Peak 5-10y.",
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
      }
    ]
  }
];

async function main() {
  console.log("Seeding final completion batch v3...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.mnemonicRef?.mnemonic === update.mnemonic || 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      console.log(`Updating ${update.mnemonic}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 1, 
          expandedLetters: update.expanded
        }
      });
    } else {
      console.log(`Creating ${update.mnemonic}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 1,
          expandedLetters: update.expanded
        }
      });
    }
  }
}

main().catch(console.error);