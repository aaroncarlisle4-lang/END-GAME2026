import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const UPDATES = [
  {
    mnemonic: "PINCH FO",
    pattern: "Acro-osteolysis",
    expanded: "P: Psoriasis / PVC exposure, I: Injury (Frostbite/Burn), N: Neuropathy (Diabetes/Leprosy), C: Collagen vascular (Scleroderma), H: Hyperparathyroidism, F: Familial (Hadju-Cheney), O: Osteolysis",
    problemCluster: "distal phalangeal resorption",
    seriousAlternatives: ["Scleroderma", "Hyperparathyroidism", "Psoriatic Arthritis"],
    differentials: [
      {
        diagnosis: "Scleroderma (PSS)",
        dominantImagingFinding: "TAPERED resorption of the distal tufts. Marked SOFT TISSUE THINNING (100% specific morphological combination).",
        distributionLocation: "BILATERAL and SYMMETRIC. Multiple digits of the hands.",
        demographicsClinicalContext: "Raynaud's phenomenon (95%+). Sclerodactyly. Females (3:1).",
        discriminatingKeyFeature": "ACRO-OSTEOLYSIS associated with SOFT TISSUE CALCINOSIS (100% pathognomonic).",
        associatedFindings: "Oesophageal dilatation (80%). Basal pulmonary fibrosis (NSIP).",
        complicationsSeriousAlternatives: "Renal crisis and pulmonary hypertension.",
        isCorrectDiagnosis": true
      },
      {
        diagnosis: "Psoriatic Arthritis",
        dominantImagingFinding: "AGGRESSIVE distal phalangeal destruction. 'Pencil-in-cup' deformity (75% of severe disease).",
        distributionLocation: "ASYMMETRIC and random. Characteristically involves DIP joints.",
        demographicsClinicalContext": "Skin PSORIASIS (90%). Pitting of nails (80%). Sero-negative.",
        discriminatingKeyFeature": "PENCIL-IN-CUP deformity and ABSENCE of periarticular osteopenia (unlike RA).",
        associatedFindings: "Enthesitis and Ivory phalanx.",
        complicationsSeriousAlternatives": "Arthritis mutilans.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Hyperparathyroidism",
        dominantImagingFinding": "SUBPERIOSTEAL resorption involving the distal tufts. Radial side middle phalanx resorption (100%).",
        distributionLocation": "Symmetric. Multiple phalanges.",
        demographicsClinicalContext: "Chronic Renal Failure (Secondary HPT).",
        discriminatingKeyFeature": "SUBPERIOSTEAL resorption on the RADIAL ASPECT of the middle phalanx.",
        associatedFindings": "Rugger-Jersey spine and distal clavicle resorption.",
        complicationsSeriousAlternatives": "Brown tumors.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Thermal Injury (Frostbite)",
        dominantImagingFinding": "SHARP amputation-like loss of the tufts. Preserved joint spaces.",
        distributionLocation": "Focal to exposed digits (fingers/toes).",
        demographicsClinicalContext": "History of severe cold or burn exposure.",
        discriminatingKeyFeature": "PRESERVED JOINT SPACES and known history of cold injury.",
        associatedFindings": "Secondary premature osteoarthritis.",
        complicationsSeriousAlternatives": "Superimposed gangrene.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "PVC / Vinyl Chloride Exposure",
        dominantImagingFinding": "TRANSVERSE BAND-LIKE osteolysis across the tuft. Sparing of the tip and base.",
        distributionLocation": "Bilateral hands. Symmetrical.",
        demographicsClinicalContext": "Occupational history: PVC manufacturing.",
        discriminatingKeyFeature": "UNIQUE BAND-LIKE lucency across the central tuft.",
        associatedFindings": "Hepatic angiosarcoma risk.",
        complicationsSeriousAlternatives": "Liver angiosarcoma.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Neuropathy (Diabetes/Leprosy)",
        dominantImagingFinding": "Progressive resorption of the tuft associated with neuropathic joint destruction (Charcot).",
        distributionLocation": "Weight-bearing or high-pressure areas (Toes > Fingers).",
        demographicsClinicalContext": "Diabetes Mellitus or chronic leprosy history.",
        discriminatingKeyFeature": "SENSORY LOSS and associated soft tissue ulceration.",
        associatedFindings": "Charcot joint changes (Sclerosis, Fragmentation, Destruction).",
        complicationsSeriousAlternatives": "Osteomyelitis.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Hadju-Cheney Syndrome",
        dominantImagingFinding": "Generalized acro-osteolysis. Skull changes (Wormian bones).",
        distributionLocation": "Diffuse skeletal involvement.",
        demographicsClinicalContext": "Autosomal Dominant. Rare.",
        discriminatingKeyFeature": "ACRO-OSTEOLYSIS combined with multiple WORMIAN BONES and persistent fontanelles.",
        associatedFindings": "Short stature and platyspondyly.",
        complicationsSeriousAlternatives": "Basilar invagination.",
        isCorrectDiagnosis": false
      }
    ]
  },
  {
    mnemonic: "POSTCARDS",
    pattern: "Renal papillary necrosis",
    expanded: "P: Pyelonephritis, O: Obstruction, S: Sickle cell, T: TB, C: Cirrhosis, A: Analgesics, R: Renal vein thrombosis, D: Diabetes, S: Systemic (Vasculitis)",
    problemCluster: "renal medullary abnormality",
    seriousAlternatives: ["Diabetes Mellitus", "Analgesic Nephropathy", "Sickle Cell Disease"],
    differentials: [
      {
        diagnosis: "Diabetes Mellitus",
        dominantImagingFinding": "LOBSTER-CLAW appearance (90%). Contrast in necrotic cavity. RING SHADOW (100% classic).",
        distributionLocation": "BILATERAL in 80%. Multiple papillae.",
        demographicsClinicalContext: "History of poorly controlled DM. Acute renal colic.",
        discriminatingKeyFeature": "LOBSTER-CLAW pattern and clinical history of diabetes.",
        associatedFindings": "Enlarged kidneys. Emphysematous changes.",
        complicationsSeriousAlternatives": "Acute renal failure.",
        isCorrectDiagnosis": true
      },
      {
        diagnosis: "Analgesic Nephropathy",
        dominantImagingFinding": "SMALL kidneys. PAPILLARY CALCIFICATION (90% classic).",
        distributionLocation": "BILATERAL and SYMMETRIC. Diffuse.",
        demographicsClinicalContext": "History of chronic aspirin/NSAID use.",
        discriminatingKeyFeature": "PAPILLARY CALCIFICATION at the medullary pyramid tips and SMALL size.",
        associatedFindings": "Increased risk of TCC.",
        complicationsSeriousAlternatives": "Renal Pelvis TCC.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Sickle Cell Disease",
        dominantImagingFinding": "Necrotic papillae with DIFFUSE medullary sclerosis.",
        distributionLocation": "Bilateral and symmetric.",
        demographicsClinicalContext": "African/Mediterranean descent. Vaso-occlusive crises.",
        discriminatingKeyFeature": "H-SHAPED VERTEBRAE and small calcified spleen (autosplenectomy).",
        associatedFindings": "Pelvicalyceal enlargement.",
        complicationsSeriousAlternatives": "Renal Medullary Carcinoma.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Acute Pyelonephritis",
        dominantImagingFinding": "STRIATED NEPHROGRAM (100% classic). Kidney is ENLARGED.",
        distributionLocation": "Focal or unilateral wedge-shaped distribution.",
        demographicsClinicalContext": "Acute fever, flank pain, leukocytosis.",
        discriminatingKeyFeature": "STRIATED NEPHROGRAM and clinical SEPSIS.",
        associatedFindings": "Perinephric stranding.",
        complicationsSeriousAlternatives": "Renal abscess.",
        isCorrectDiagnosis": false
      }
    ]
  }
];

async function main() {
  console.log("Seeding multi-letter acronym discriminators...");
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