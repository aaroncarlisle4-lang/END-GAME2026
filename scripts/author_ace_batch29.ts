import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_29_DATA = [
  {
    pattern: "L UCENT BONE LESION IN THE",
    itemNumber: "1.12",
    problemCluster: "well-defined medullary lucency",
    seriousAlternatives: ["Metastasis", "Multiple Myeloma", "Brown Tumor", "Simple Bone Cyst"],
    differentials: [
      {
        diagnosis: "Lytic Metastasis",
        dominantImagingFinding: "Well-defined or ill-defined lucency. CORTICAL DESTRUCTION and pedicle involvement.",
        distributionLocation: "Axial skeleton focus. Proximal appendicular.",
        demographicsClinicalContext: "Adults >50y. Known primary (Lung, Breast, Kidney).",
        discriminatingKeyFeature: "PEDICLE DESTRUCTION and multiplicity. Intensely hot on bone scan (unless RCC).",
        associatedFindings: "Pathological fracture.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multiple Myeloma",
        dominantImagingFinding: "Multiple small, sharply defined 'PUNCHED-OUT' lucencies. Discretely marginated.",
        distributionLocation: "Skull, Spine, and Pelvis. Pedicle SPARING early.",
        demographicsClinicalContext: "Elderly. B-symptoms and anaemia.",
        discriminatingKeyFeature: "PUNCHED-OUT appearance and COLD bone scan. Diffuse osteopenia.",
        associatedFindings: "Raindrop skull.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Brown Tumor (Hyperparathyroidism)",
        dominantImagingFinding: "Well-defined geographic lucency. NO sclerotic rim. Multi-focal.",
        distributionLocation: "Generalized skeleton. Jaw and ribs common.",
        demographicsClinicalContext: "Renal failure history. High PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION: Look for resorption in the hands. Lacks the aggressive cortical destruction of malignancy.",
        associatedFindings: "Salt-and-pepper skull.",
        complicationsSeriousAlternatives: "Fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Simple Bone Cyst",
        dominantImagingFinding: "Well-defined central geographic lucency. FALLEN FRAGMENT SIGN.",
        distributionLocation: "Proximal humerus or femur focus.",
        demographicsClinicalContext: "Children and adolescents.",
        discriminatingKeyFeature: "FALLEN FRAGMENT SIGN: Pathognomonic for a fluid-filled SBC after fracture. Centrally located.",
        associatedFindings: "Thinning of the cortex.",
        complicationsSeriousAlternatives: "Recurrent fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "D IAPHRAGMATIC HUMPS",
    itemNumber: "4.31",
    problemCluster: "diaphragm hump",
    seriousAlternatives: ["Eventration", "Hiatus Hernia", "Subphrenic Abscess", "Liver Mass"],
    differentials: [
      {
        diagnosis: "Diaphragmatic Eventration",
        dominantImagingFinding: "Smooth elevation of a segment of the diaphragm (usually anteromedial).",
        distributionLocation: "Typically RIGHT side. Anteromedial focus.",
        demographicsClinicalContext: "Asymptomatic incidental finding. Congenital thinning of the muscle.",
        discriminatingKeyFeature: "SMOOTH contour and normal respiratory movement. No associated mass beneath.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hiatus Hernia",
        dominantImagingFinding: "Retrocardiac soft tissue mass with an AIR-FLUID LEVEL.",
        distributionLocation: "Oesophageal hiatus focus.",
        demographicsClinicalContext: "Adults with reflux or incidental.",
        discriminatingKeyFeature: "AIR-FLUID LEVEL behind the heart. Barium swallow confirms gastric folds within the chest.",
        associatedFindings: "Gastric distension.",
        complicationsSeriousAlternatives: "Volvulus.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Subphrenic Abscess",
        dominantImagingFinding: "Focal elevation of the diaphragm by an underlying fluid/gas collection.",
        distributionLocation: "Right subphrenic common.",
        demographicsClinicalContext: "Fever and RUQ pain. Post-operative history.",
        discriminatingKeyFeature: "FLUID/GAS BENEATH: US/CT shows a collection pushing the diaphragm up. Acute symptoms.",
        associatedFindings: "Pleural effusion.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S TOMACH MASSES AND FILLING DEFECTS",
    itemNumber: "6.8",
    problemCluster: "gastric filling defect",
    seriousAlternatives: ["Gastric Adenocarcinoma", "Gastric Lymphoma", "GIST", "Gastric Polyps"],
    differentials: [
      {
        diagnosis: "Gastric Adenocarcinoma",
        dominantImagingFinding: "Irregular filling defect with MUCOSAL DESTRUCTION and shouldered margins.",
        distributionLocation: "Antrum focus common (50%).",
        demographicsClinicalContext: "Older smokers. Weight loss and anemia.",
        discriminatingKeyFeature: "MUCOSAL DESTRUCTION and abrupt transition. Malignant until proven otherwise. Lacks the flexibility of lymphoma.",
        associatedFindings: "Omental caking.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Gastric Lymphoma (MALT)",
        dominantImagingFinding: "Massive mural thickening (>2cm) with PRESERVED gastric flexibility.",
        distributionLocation: "Diffuse or segmental.",
        demographicsClinicalContext: "Adults. B-symptoms.",
        discriminatingKeyFeature: "PRESERVED FLEXIBILITY: The stomach still distends despite massive wall thickening. Crosses the pylorus.",
        associatedFindings: "Bulky nodes.",
        complicationsSeriousAlternatives: "Perforation during chemotherapy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "GIST (Gastric)",
        dominantImagingFinding: "Large EXOPHYTIC mass. Intensely and uniformly enhancing. Central ulceration.",
        distributionLocation: "Stomach body focus.",
        demographicsClinicalContext: "Older adults. Occult bleeding.",
        discriminatingKeyFeature: "EXOPHYTIC growth: Most of the mass is outside the stomach wall. Highly vascular.",
        associatedFindings: "Central air (Torrodane sign).",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "U NILATERAL LARGE SMOOTH KIDNEY",
    itemNumber: "8.11",
    problemCluster: "big smooth kidney",
    seriousAlternatives: ["Compensatory Hypertrophy", "Acute Pyelonephritis", "Renal Vein Thrombosis", "Acute Obstruction"],
    differentials: [
      {
        diagnosis: "Compensatory Hypertrophy",
        dominantImagingFinding: "Uniform enlargement of a structurally normal kidney.",
        distributionLocation: "Unilateral (contralateral side focus).",
        demographicsClinicalContext: "History of prior nephrectomy or contralateral renal agenesis/atrophy.",
        discriminatingKeyFeature: "NORMAL STRUCTURE: The kidney is large but has normal echogenicity, Doppler flow, and architecture. Absent or small contralateral kidney.",
        associatedFindings: "Empty contralateral renal fossa.",
        complicationsSeriousAlternatives: "Hyperfiltration injury (long-term).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acute Pyelonephritis",
        dominantImagingFinding: "Enlarged, edematous kidney with STRIATED NEPHROGRAM on CT.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Acute fever, flank pain, and pyuria. Sepsis.",
        discriminatingKeyFeature: "STRIATED NEPHROGRAM: Alternating bands of high and low enhancement. Clinically unwell.",
        associatedFindings: "Perinephric stranding.",
        complicationsSeriousAlternatives: "Abscess or emphysematous change.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Renal Vein Thrombosis",
        dominantImagingFinding: "Enlarged, congested kidney. ABSENT or reversed flow in the renal vein.",
        distributionLocation: "Unilateral focus.",
        demographicsClinicalContext: "Nephrotic syndrome or neonates with dehydration.",
        discriminatingKeyFeature: "ABSENT VEIN FLOW: Doppler US shows thrombus in the vein. Persistent dense nephrogram on CT.",
        associatedFindings: "Varicocele (if left side).",
        complicationsSeriousAlternatives: "Renal infarction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "R ENAL CYSTIC DISEASE",
    itemNumber: "8.25",
    problemCluster: "renal cysts",
    seriousAlternatives: ["Simple Cysts", "ADPKD", "Acquired Cystic Disease (Dialysis)", "MCDK"],
    differentials: [
      {
        diagnosis: "Simple Renal Cysts",
        dominantImagingFinding: "Anechoic, thin-walled cyst with POSTERIOR ACOUSTIC ENHANCEMENT. No solid parts.",
        distributionLocation: "Unilateral or bilateral. Random.",
        demographicsClinicalContext: "Extremely common in adults (prevalence increases with age). Asymptomatic.",
        discriminatingKeyFeature: "SIMPLE criteria: US shows anechoic, thin-walled, posterior enhancement. CT shows <20 HU and no enhancement (Bosniak I).",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "ADPKD",
        dominantImagingFinding: "MASSIVELY ENLARGED kidneys filled with innumerable cysts. Multi-organ cysts.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Family history of renal failure. Hypertension.",
        discriminatingKeyFeature: "MASSIVE SIZE and LIVER CYSTS (70%). Unlike simple cysts, the normal parenchyma is entirely replaced.",
        associatedFindings: "Berry aneurysms.",
        complicationsSeriousAlternatives: "End-stage renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Acquired Cystic Disease (ACKD)",
        dominantImagingFinding: "Multiple small cysts in SMALL, ATROPHIC kidneys.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Chronic renal failure on DIALYSIS (>3 years).",
        discriminatingKeyFeature: "ATROPHIC kidneys and DIALYSIS history. High risk of RCC (100x increased).",
        associatedFindings: "RCC (solid mass).",
        complicationsSeriousAlternatives: "Renal Cell Carcinoma (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 29 (Final GS Push)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_29_DATA) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === entry.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      console.log(`Updating ${entry.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: entry.differentials,
        problemCluster: entry.problemCluster,
        seriousAlternatives: entry.seriousAlternatives
      });
    } else {
      console.log(`Creating ${entry.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: entry.pattern,
        differentials: entry.differentials,
        problemCluster: entry.problemCluster,
        seriousAlternatives: entry.seriousAlternatives
      });
    }
  }
  console.log("Batch 29 Complete!");
}

main().catch(console.error);