import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const FINAL_UPDATES = [
  {
    mnemonic: "SLIPS",
    pattern: "Bilateral hilar enlargement",
    expanded: "S: Sarcoidosis / Silicosis, L: Lymphoma / Leukaemia, I: Infection (TB/Viral), P: Pneumoconiosis, S: Secondary (Mets)",
    differentials: [
      { diagnosis: "Sarcoidosis", dominantImagingFinding: "SYMMETRICAL, lobulated hilar nodes (95%).", distributionLocation: "Bilateral hilar + R paratracheal.", demographicsClinicalContext: "Young adults. Asymptomatic.", discriminatingKeyFeature: "STRIKING SYMMETRY and Garland Triad.", associatedFindings: "Lung nodules.", complicationsSeriousAlternatives: "Fibrosis.", isCorrectDiagnosis: true },
      { diagnosis: "Lymphoma", dominantImagingFinding: "ASYMMETRICAL bulky nodes. Anterior mediastinum.", distributionLocation: "Multi-compartmental.", demographicsClinicalContext: "B-symptoms. Bimodal age.", discriminatingKeyFeature: "ASYMMETRY and bulky multi-compartment nodes.", associatedFindings: "Effusions.", complicationsSeriousAlternatives: "SVC syndrome.", isCorrectDiagnosis: false },
      { diagnosis: "Primary TB", dominantImagingFinding: "UNILATERAL hilar nodes (95%).", distributionLocation: "Ipsilateral to primary focus.", demographicsClinicalContext: "Exposure. Children.", discriminatingKeyFeature: "UNILATERALITY and Ghon focus.", associatedFindings: "Effusion.", complicationsSeriousAlternatives: "Miliary spread.", isCorrectDiagnosis: false },
      { diagnosis: "Silicosis", dominantImagingFinding: "SYMMETRICAL hilar nodes. EGGSHELL calcification (5%).", distributionLocation: "Bilateral.", demographicsClinicalContext: "Mining history.", discriminatingKeyFeature: "EGGSHELL NODAL CALCIFICATION and upper lobe nodules.", associatedFindings: "PMF masses.", complicationsSeriousAlternatives: "Silicotuberculosis.", isCorrectDiagnosis: false },
      { diagnosis: "Secondary (Metastases)", dominantImagingFinding: "Bulky or discrete nodes. Disparate sizes.", distributionLocation: "Often asymmetric.", demographicsClinicalContext: "Known Lung/Breast primary.", discriminatingKeyFeature: "Known primary and disparate nodal growth.", associatedFindings: "Lung masses.", complicationsSeriousAlternatives: "Death.", isCorrectDiagnosis: false }
    ]
  },
  {
    mnemonic: "CUBS",
    pattern: "Inferior rib notching",
    expanded: "C: Coarctation / Collaterals (SVC), U: Upper limb shunt (Blalock-Taussig), B: Bone (NF1 / Hyperparathyroidism), S: Subclavian artery stenosis",
    differentials: [
      { diagnosis: "Coarctation of the Aorta", dominantImagingFinding: "BILATERAL inferior notching (3rd-8th ribs). SPARING of 1st/2nd ribs (100%).", distributionLocation: "Bilateral symmetric.", demographicsClinicalContext: "Turner Syndrome (15%). Arm HTN.", discriminatingKeyFeature: "3-SIGN and sparing of 1st/2nd ribs.", associatedFindings: "LVH.", complicationsSeriousAlternatives: "Dissection.", isCorrectDiagnosis: true },
      { diagnosis: "SVC Obstruction (Chronic)", dominantImagingFinding: "Diffuse notching due to venous collaterals.", distributionLocation: "Unilateral or bilateral.", demographicsClinicalContext: "Catheter or tumor history.", discriminatingKeyFeature: "PROMINENT venous collaterals and SVC syndrome.", associatedFindings: "Mediastinal mass.", complicationsSeriousAlternatives: "Cerebral oedema.", isCorrectDiagnosis: false },
      { diagnosis: "Blalock-Taussig Shunt", dominantImagingFinding: "STRICTLY UNILATERAL rib notching.", distributionLocation: "Ipsilateral to shunt side (100%).", demographicsClinicalContext: "Cyanotic heart disease history.", discriminatingKeyFeature: "UNILATERALITY and hilar surgical clips.", associatedFindings: "Reduced lung volume.", complicationsSeriousAlternatives: "Shunt stenosis.", isCorrectDiagnosis: false },
      { diagnosis: "Neurofibromatosis Type 1", dominantImagingFinding: "RIBBON-LIKE RIBS (100% specific). Focal notching.", distributionLocation: "Random.", demographicsClinicalContext: "NF1 diagnosis.", discriminatingKeyFeature: "RIBBON-LIKE RIBS and posterior spinal masses.", associatedFindings: "Scoliosis.", complicationsSeriousAlternatives: "MPNST.", isCorrectDiagnosis: false },
      { diagnosis: "Subclavian Artery Stenosis", dominantImagingFinding: "UNILATERAL rib notching.", distributionLocation: "Ipsilateral.", demographicsClinicalContext: "Claudication.", discriminatingKeyFeature: "UNILATERALITY and weak radial pulse.", associatedFindings: "Aortic atheroma.", complicationsSeriousAlternatives: "Stroke.", isCorrectDiagnosis: false }
    ]
  }
];

async function main() {
  console.log("Seeding final exhaustive completion batch v5...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of FINAL_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.mnemonicRef?.mnemonic === update.mnemonic
    );
    
    if (matches.length > 0) {
      console.log(`Updating ${update.mnemonic}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: update.differentials,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: matches[0].mnemonicRef.chapterNumber,
          expandedLetters: update.expanded
        }
      });
    }
  }
  console.log("Final update complete!");
}

main().catch(console.error);