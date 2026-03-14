import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const FINAL_UPDATES = [
  {
    mnemonic: "CAVITIES",
    pattern: "Multiple pulmonary nodules",
    expanded: "C: Cancer (Mets), A: Autoimmune (GPA), V: Vascular (Septic emboli), I: Infection (TB/Fungal), T: Trauma, I: Inhalational, E: Eosinophilic, S: Sarcoidosis",
    differentials: [
      { diagnosis: "Metastases", dominantImagingFinding: "Varying sized nodules. Cavitation in 10% (Squamous).", distributionLocation: "Random, basal.", demographicsClinicalContext: "Known primary.", discriminatingKeyFeature: "Multiple disparate sizes.", associatedFindings: "Effusions.", complicationsSeriousAlternatives: "Tumor emboli.", isCorrectDiagnosis: true },
      { diagnosis: "Sarcoidosis", dominantImagingFinding: "PERILYMPHATIC micronodules. Cavitation rare (<5%).", distributionLocation: "Upper/mid zone.", demographicsClinicalContext: "Young adults.", discriminatingKeyFeature: "Galaxy sign and symmetric hilar nodes.", associatedFindings: "1-2-3 sign.", complicationsSeriousAlternatives: "Fibrosis.", isCorrectDiagnosis: false },
      { diagnosis: "Septic Emboli", dominantImagingFinding: "Multiple nodules with CAVITATION. Wedge-shaped.", distributionLocation: "Peripheral.", demographicsClinicalContext: "IVDU, Sepsis.", discriminatingKeyFeature: "Feeding vessel sign and clinical sepsis.", associatedFindings: "Empyema.", complicationsSeriousAlternatives: "Pneumothorax.", isCorrectDiagnosis: false },
      { diagnosis: "Granulomatosis with Polyangiitis", dominantImagingFinding: "Multiple nodules, CAVITATING (50%).", distributionLocation: "Random.", demographicsClinicalContext: "Sinusitis, renal disease.", discriminatingKeyFeature: "Multiple lesions at different stages.", associatedFindings: "Halo sign.", complicationsSeriousAlternatives: "DAH.", isCorrectDiagnosis: false },
      { diagnosis: "TB / Fungal", dominantImagingFinding: "Cavitating nodules. Tree-in-bud satellites.", distributionLocation: "Apical upper lobes.", demographicsClinicalContext: "Fever, night sweats.", discriminatingKeyFeature: "Tree-in-bud and apical predilection.", associatedFindings: "Volume loss.", complicationsSeriousAlternatives: "Spread.", isCorrectDiagnosis: false },
      { diagnosis: "Traumatic Lung Cysts", dominantImagingFinding: "Lucent areas within consolidation post-trauma.", distributionLocation: "Focal to injury site.", demographicsClinicalContext: "Major blunt trauma.", discriminatingKeyFeature: "History of trauma and rapid appearance.", associatedFindings: "Rib fractures.", complicationsSeriousAlternatives: "Haematoma.", isCorrectDiagnosis: false },
      { diagnosis: "Inhalational (Silicosis)", dominantImagingFinding: "Nodules and conglomerate masses. Cavitation from TB superinfection.", distributionLocation: "Upper lobes.", demographicsClinicalContext: "Mining history.", discriminatingKeyFeature: "Eggshell nodes and occupational history.", associatedFindings: "PMF masses.", complicationsSeriousAlternatives: "Silicotuberculosis.", isCorrectDiagnosis: false },
      { diagnosis: "Eosinophilic Pneumonia", dominantImagingFinding: "Peripheral consolidation and nodules.", distributionLocation: "Peripheral.", demographicsClinicalContext: "Asthma history.", discriminatingKeyFeature: "Rapid response to steroids (100%).", associatedFindings: "Eosinophilia.", complicationsSeriousAlternatives: "Fibrosis.", isCorrectDiagnosis: false }
    ]
  },
  {
    mnemonic: "SAME",
    pattern: "CPA mass",
    expanded: "S: Schwannoma, A: Arachnoid cyst / Aneurysm, M: Meningioma / Metastasis, E: Epidermoid / Ependymoma",
    differentials: [
      { diagnosis: "Schwannoma", dominantImagingFinding: "ICE-CREAM CONE (100%). IAC widening (90%).", distributionLocation: "Centred on IAC.", demographicsClinicalContext: "Hearing loss (95%).", discriminatingKeyFeature: "IAC widening and acute angle.", associatedFindings: "Enhancement.", complicationsSeriousAlternatives: "Compression.", isCorrectDiagnosis: true },
      { diagnosis: "Arachnoid Cyst", dominantImagingFinding: "CSF signal cyst. No enhancement.", distributionLocation: "CPA cistern.", demographicsClinicalContext: "Incidental.", discriminatingKeyFeature: "FLAIR suppression and DARK on DWI (100% specific vs epidermoid).", associatedFindings: "Bone scalloping.", complicationsSeriousAlternatives: "Hemorrhage.", isCorrectDiagnosis: false },
      { diagnosis: "Aneurysm (PICA/AICA)", dominantImagingFinding: "Signal void or pulsatile flow.", distributionLocation: "Circle of Willis.", demographicsClinicalContext: "Headache.", discriminatingKeyFeature: "Continuity with major artery.", associatedFindings: "Wall calcification.", complicationsSeriousAlternatives: "SAH.", isCorrectDiagnosis: false },
      { diagnosis: "Meningioma", dominantImagingFinding: "Broad-based. DURAL TAIL (60%).", distributionLocation: "Eccentric to IAC.", demographicsClinicalContext: "Females (3:1).", discriminatingKeyFeature: "Hyperostosis and obtuse angle.", associatedFindings: "Homogeneous enhancement.", complicationsSeriousAlternatives: "Nerve palsies.", isCorrectDiagnosis: false },
      { diagnosis: "Epidermoid Cyst", dominantImagingFinding: "Cauliflower margin. BRIGHT on DWI (100%).", distributionLocation: "CPA cistern.", demographicsClinicalContext: "Meningitis risk.", discriminatingKeyFeature: "DWI restriction and dirty CSF signal.", associatedFindings: "Encases vessels.", complicationsSeriousAlternatives: "Chemical meningitis.", isCorrectDiagnosis: false }
    ]
  },
  {
    mnemonic: "MDMA",
    pattern: "Bilateral ovarian masses",
    expanded: "M: Metastases (Krukenberg), D: Dermoid (Teratoma), M: Multinodular (Endometriosis), A: Adenocarcinoma (Serous)",
    differentials: [
      { diagnosis: "Metastases (Krukenberg)", dominantImagingFinding: "SOLID bilateral masses (80%+). Hypoechoic.", distributionLocation: "Bilateral.", demographicsClinicalContext: "Stomach (70%), Colon primary.", discriminatingKeyFeature: "Linitis plastica or known gastric CA.", associatedFindings: "Lymphadenopathy.", complicationsSeriousAlternatives: "Carcinomatosis.", isCorrectDiagnosis: true },
      { diagnosis: "Dermoid (Teratoma)", dominantImagingFinding: "INTERNAL FAT (90%). Rokitansky nodule.", distributionLocation: "Bilateral in 15%.", demographicsClinicalContext: "Young females.", discriminatingKeyFeature: "Fat-density (-100 HU) or T1 bright signal.", associatedFindings: "Calcification.", complicationsSeriousAlternatives: "Torsion.", isCorrectDiagnosis: false },
      { diagnosis: "Endometrioma (Multinodular)", dominantImagingFinding: "GROUND-GLASS echoes (100%). No flow.", distributionLocation: "Bilateral in 50%.", demographicsClinicalContext: "Infertility, pain.", discriminatingKeyFeature: "SHADING SIGN on T2 MRI.", associatedFindings: "Kissing ovaries.", complicationsSeriousAlternatives: "Rupture.", isCorrectDiagnosis: false },
      { diagnosis: "Adenocarcinoma (Serous)", dominantImagingFinding: "COMPLEX cystic/solid. Papillary projections.", distributionLocation: "Bilateral in 60%.", demographicsClinicalContext: "Older adults. Elevated CA-125.", discriminatingKeyFeature: "OMENTAL CAKING and ascites.", associatedFindings: "Peritoneal nodules.", complicationsSeriousAlternatives: "Obstruction.", isCorrectDiagnosis: false }
    ]
  }
];

async function main() {
  console.log("Seeding final exhaustive completion batch...");
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