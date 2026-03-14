import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const FINAL_UPDATES = [
  {
    mnemonic: "MATCH",
    pattern: "Intra-axial haemorrhage",
    expanded: "M: Metastasis, A: Amyloid angiopathy / AVM, T: Trauma, C: Coagulopathy, H: Hypertension",
    differentials: [
      { diagnosis: "Hypertension", dominantImagingFinding: "Deep grey bleed (60%). Hyperdense.", distributionLocation: "Basal ganglia, Thalamus.", demographicsClinicalContext: "Older, HTN history.", discriminatingKeyFeature: "DEEP GREY location and chronic HTN.", associatedFindings: "Small vessel disease.", complicationsSeriousAlternatives: "Hydrocephalus.", isCorrectDiagnosis: true },
      { diagnosis: "Amyloid Angiopathy", dominantImagingFinding: "Lobar bleed. Microbleeds (100%).", distributionLocation: "Cortical/Subcortical.", demographicsClinicalContext: "Elderly (>65).", discriminatingKeyFeature: "LOBAR location and peripheral microbleeds.", associatedFindings: "Siderosis.", complicationsSeriousAlternatives: "Dementia.", isCorrectDiagnosis: false },
      { diagnosis: "AVM", dominantImagingFinding: "Flow voids (90%). Calcification.", distributionLocation: "Random.", demographicsClinicalContext: "Young adults.", discriminatingKeyFeature: "Serpiginous vessels within bleed.", associatedFindings: "Draining veins.", complicationsSeriousAlternatives: "SAH.", isCorrectDiagnosis: false },
      { diagnosis: "Metastasis", dominantImagingFinding: "Heterogeneous bleed. Persistent oedema.", distributionLocation: "Grey-white junction.", demographicsClinicalContext: "Known primary (Melanoma).", discriminatingKeyFeature: "Enhancing solid component.", associatedFindings: "Multiple lesions.", complicationsSeriousAlternatives: "Herniation.", isCorrectDiagnosis: false },
      { diagnosis: "Coagulopathy", dominantImagingFinding: "Large bleed with fluid levels.", distributionLocation: "Random.", demographicsClinicalContext: "Warfarin / Liver disease.", discriminatingKeyFeature: "Clinical history and haematocrit levels.", associatedFindings: "Diffuse bleed.", complicationsSeriousAlternatives: "Death.", isCorrectDiagnosis: false }
    ]
  },
  {
    mnemonic: "ALICE",
    pattern: "Restricted diffusion in brain",
    expanded: "A: Abscess, L: Lymphoma / Leukaemia, I: Infarct (Acute), C: CJD, E: Encephalitis (HSV)",
    differentials: [
      { diagnosis: "Acute Infarct", dominantImagingFinding: "DWI Bright (100% specific). ADC Dark.", distributionLocation: "Vascular territory (MCA).", demographicsClinicalContext: "FAST positive.", discriminatingKeyFeature: "VASCULAR territory and loss of grey-white diff.", associatedFindings: "Sulcal effacement.", complicationsSeriousAlternatives: "Herniation.", isCorrectDiagnosis: true },
      { diagnosis: "Abscess", dominantImagingFinding: "Central restriction (100%). Thin ring.", distributionLocation: "Random.", demographicsClinicalContext: "Fever, dental history.", discriminatingKeyFeature: "CENTRAL restriction in thin capsule.", associatedFindings: "Vasogenic oedema.", complicationsSeriousAlternatives: "Ventriculitis.", isCorrectDiagnosis: false },
      { diagnosis: "Encephalitis (HSV)", dominantImagingFinding: "Gyral restriction. T2 high.", distributionLocation: "Limbic system (Temporal).", demographicsClinicalContext: "Confusion, fever.", discriminatingKeyFeature: "TEMPORAL LOBE involvement.", associatedFindings: "Bilateral asymmetric.", complicationsSeriousAlternatives: "Death.", isCorrectDiagnosis: false },
      { diagnosis: "CJD", dominantImagingFinding: "Cortical ribboning. Basal ganglia bright.", distributionLocation: "Cortex, Caudate.", demographicsClinicalContext: "Rapid dementia.", discriminatingKeyFeature: "CORTICAL RIBBONING and myoclonus.", associatedFindings: "Atrophy.", complicationsSeriousAlternatives: "Fatal.", isCorrectDiagnosis: false },
      { diagnosis: "Lymphoma", dominantImagingFinding: "Solid restriction. Homogeneous.", distributionLocation: "Periventricular.", demographicsClinicalContext: "HIV / Elderly.", discriminatingKeyFeature: "SOLID enhancement matching restriction.", associatedFindings: "Subependymal spread.", complicationsSeriousAlternatives: "Hydrocephalus.", isCorrectDiagnosis: false }
    ]
  },
  {
    mnemonic: "WHAM",
    pattern: "Large abdominal mass in child",
    expanded: "W: Wilms tumor, H: Hepatoblastoma / Hydronephrosis, A: Adrenal (Neuroblastoma), M: Mesoblastic nephroma / MCDK",
    differentials: [
      { diagnosis: "Neuroblastoma", dominantImagingFinding: "Extra-renal. CALCIFIED (90%). Encases vessels.", distributionLocation: "Crosses midline (90%).", demographicsClinicalContext: "Sick child. Peak 2y.", discriminatingKeyFeature: "VESSEL ENCASEMENT and calcification.", associatedFindings: "VMA elevated.", complicationsSeriousAlternatives: "Cord compression.", isCorrectDiagnosis: true },
      { diagnosis: "Wilms Tumor", dominantImagingFinding: "Intra-renal. CLAW SIGN (90%). Spares vessels.", distributionLocation: "Kidney. Displaces midline.", demographicsClinicalContext: "Well child. Peak 3-4y.", discriminatingKeyFeature: "CLAW SIGN and renal origin.", associatedFindings: "Thrombus.", complicationsSeriousAlternatives: "Rupture.", isCorrectDiagnosis: false },
      { diagnosis: "Hepatoblastoma", dominantImagingFinding: "Solid liver mass. High AFP (90%+).", distributionLocation: "Liver (RUQ).", demographicsClinicalContext: "Peak <3y.", discriminatingKeyFeature: "LIVER origin and high AFP.", associatedFindings: "BWS history.", complicationsSeriousAlternatives: "Failure.", isCorrectDiagnosis: false },
      { diagnosis: "Lymphoma (Burkitt)", dominantImagingFinding: "Bulky mesenteric nodes. Bowel thickening.", distributionLocation: "Terminal ileum / Mesentery.", demographicsClinicalContext: "Peak 5-10y.", discriminatingKeyFeature: "ANEURYSMAL bowel dilatation.", associatedFindings: "Ascites.", complicationsSeriousAlternatives: "Tumor lysis.", isCorrectDiagnosis: false },
      { diagnosis: "Hydronephrosis (Massive)", dominantImagingFinding: "Fluid-filled system. Thinned cortex.", distributionLocation: "Renal fossa.", demographicsClinicalContext: "PUJ obstruction.", discriminatingKeyFeature: "PURELY CYSTIC / fluid nature.", associatedFindings: "Ureteric dilatation.", complicationsSeriousAlternatives: "Renal failure.", isCorrectDiagnosis: false }
    ]
  }
];

async function main() {
  console.log("Seeding final exhaustive completion batch v6...");
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