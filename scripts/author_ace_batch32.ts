import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_32_DATA = [
  {
    pattern: "DIFFUSE LUNG DISEASE WITH PRESERVED LUNG VOLUMES",
    itemNumber: "4.25",
    problemCluster: "ILD with normal volumes",
    seriousAlternatives: ["Langerhans Cell Histiocytosis (LCH)", "Lymphangioleiomyomatosis (LAM)", "Sarcoidosis", "Cystic Fibrosis"],
    differentials: [
      {
        diagnosis: "Langerhans Cell Histiocytosis (PLCH)",
        dominantImagingFinding: "Bizarre-shaped air cysts and centrilobular nodules. Lung volumes are characteristically NORMAL or INCREASED.",
        distributionLocation: "Upper and mid-zone predominance. Sparing of the costophrenic angles.",
        demographicsClinicalContext: "Young to middle-aged adults. Strong association with SMOKING (>95%).",
        discriminatingKeyFeature: "COSTOPHRENIC ANGLE SPARING and smoking history. Unlike IPF, the lung volume is not reduced.",
        associatedFindings: "Centrilobular nodules (early phase).",
        complicationsSeriousAlternatives: "Pneumothorax.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Lymphangioleiomyomatosis (LAM)",
        dominantImagingFinding: "Innumerable, thin-walled, UNIFORM air cysts. Normal lung volumes.",
        distributionLocation: "Diffuse distribution including the costophrenic angles. Symmetric.",
        demographicsClinicalContext: "Females of childbearing age. Associated with Tuberous Sclerosis (TSC).",
        discriminatingKeyFeature: "COSTOPHRENIC ANGLE INVOLVEMENT and female gender. Unlike LCH, it involves the lung bases.",
        associatedFindings: "Chylous pleural effusions and renal AMLs.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sarcoidosis (Stage IV - Fibrotic)",
        dominantImagingFinding: "Upper lobe predominant fibrosis. Lung volumes are often surprisingly preserved early on.",
        distributionLocation: "Upper and mid-zones. Perilymphatic nodules.",
        demographicsClinicalContext: "Young adults. High serum ACE.",
        discriminatingKeyFeature: "SYMMETRIC HILAR NODES and upper lobe focus. Associated with outward hilar displacement.",
        associatedFindings: "Eggshell nodal calcification.",
        complicationsSeriousAlternatives: "Pulmonary hypertension.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "U NILATERAL SMALL SMOOTH KIDNEY",
    itemNumber: "8.9",
    problemCluster: "unilateral atrophy",
    seriousAlternatives: ["Chronic Renal Artery Stenosis", "Chronic Pyelonephritis (Scarred)", "Renal Hypoplasia (Miniature)", "Obstructive Uropathy"],
    differentials: [
      {
        diagnosis: "Renal Artery Stenosis (Chronic)",
        dominantImagingFinding: "Small smooth kidney (<9cm) with thin but uniform cortex. Delayed nephrogram.",
        distributionLocation: "Unilateral focus.",
        demographicsClinicalContext: "Elderly with vascular disease or young females (FMD). Refractory HTN.",
        discriminatingKeyFeature: "SMOOTH OUTLINE: Unlike reflux nephropathy (scarring), the kidney remains smooth. Parvus-tardus waveform on Doppler.",
        associatedFindings: "Compensatory hypertrophy of the contralateral kidney.",
        complicationsSeriousAlternatives: "End-stage renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Renal Hypoplasia (Miniature Kidney)",
        dominantImagingFinding: "Structurally normal but very small kidney. Normal shape and normal calyces.",
        distributionLocation: "Unilateral common.",
        demographicsClinicalContext: "Congenital. Asymptomatic incidental finding.",
        discriminatingKeyFeature: "NORMAL ARCHITECTURE: The kidney is perfectly formed but small. No evidence of ischaemia or scarring.",
        associatedFindings: "Small ipsilateral renal artery.",
        complicationsSeriousAlternatives: "Secondary hypertension.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Chronic Pyelonephritis (Scarring)",
        dominantImagingFinding: "Small kidney with IRREGULAR cortical thinning and blunted calyces. Scarring over the poles.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "History of childhood UTIs and VUR.",
        discriminatingKeyFeature: "CORTICAL SCARRING: Unlike RAS, the renal outline is irregular and notched. Pathognomonic polar scarring.",
        associatedFindings: "Vesicoureteric reflux.",
        complicationsSeriousAlternatives: "Renal stones.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "D IFFERENTIATION BETWEEN INFARCT AND TUMOUR",
    itemNumber: "12.5",
    problemCluster: "infarct vs mass",
    seriousAlternatives: ["Acute Infarct", "Glioblastoma (GBM)", "Cerebral Abscess"],
    differentials: [
      {
        diagnosis: "Acute Ischaemic Infarct",
        dominantImagingFinding: "Sudden onset cytotoxic oedema. GYRAL swelling and LOSS of grey-white differentiation.",
        distributionLocation: "VASCULAR territory focus (e.g. MCA). Respects arterial boundaries.",
        demographicsClinicalContext: "Sudden onset focal neurological deficit (FAST). Vascular risk factors.",
        discriminatingKeyFeature: "RESTRICTED DIFFUSION (DWI Bright, ADC Dark) and respect of vascular boundaries. Lacks internal enhancement in the first week.",
        associatedFindings: "Dense artery sign on CT.",
        complicationsSeriousAlternatives: "Haemorrhagic transformation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Glioblastoma (GBM)",
        dominantImagingFinding: "Heterogeneous mass with irregular peripheral enhancement. PROFOUND vaseogenic oedema.",
        distributionLocation: "Supratentorial. Characteristically CROSSES the corpus callosum.",
        demographicsClinicalContext: "Adults (50-70y). Progressive decline over weeks.",
        discriminatingKeyFeature: "MIDLINE CROSSING and vaseogenic (white matter) oedema. Unlike infarct, it does not respect vascular territories.",
        associatedFindings: "Central necrosis.",
        complicationsSeriousAlternatives: "Herniation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "H EPATIC TUMOURS IN CHILDREN",
    itemNumber: "14.57",
    problemCluster: "paediatric liver mass",
    seriousAlternatives: ["Hepatoblastoma", "Infantile Haemangioma", "Mesenchymal Hamartoma", "Metastatic Neuroblastoma"],
    differentials: [
      {
        diagnosis: "Hepatoblastoma",
        dominantImagingFinding: "Large, solitary solid mass. Highly vascular with heterogeneous enhancement. Calcification in 50%.",
        distributionLocation: "Liver (Right lobe focus common).",
        demographicsClinicalContext: "Infants and children <3 years. Markedly elevated ALPHA-FETOPROTEIN (AFP) in 90%.",
        discriminatingKeyFeature: "AFP ELEVATION: Extreme elevation of AFP (>100,000) is diagnostic. Most common primary liver tumor in children.",
        associatedFindings: "Beckwith-Wiedemann syndrome association.",
        complicationsSeriousAlternatives: "Lung metastases.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Infantile Haemangioma (Hemangioendothelioma)",
        dominantImagingFinding: "Highly vascular mass with 'Centripetal' enhancement. Associated with high-output cardiac failure.",
        distributionLocation: "Liver focus. Often multifocal.",
        demographicsClinicalContext: "Infants <6 months. Heart failure or skin haemangiomas.",
        discriminatingKeyFeature: "CARDIAC FAILURE: High-output failure and shunting are characteristic. Normal or only mildly elevated AFP.",
        associatedFindings: "Skin haemangiomas.",
        complicationsSeriousAlternatives: "Kasabach-Merritt syndrome.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mesenchymal Hamartoma",
        dominantImagingFinding: "Large, multicystic mass with internal septations. Minimal solid component.",
        distributionLocation: "Liver focus.",
        demographicsClinicalContext: "Infants and young children (<2y). Rapid abdominal distension.",
        discriminatingKeyFeature: "CYSTIC appearance: Primarily a cystic mass with thin septa. Normal AFP.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Mass effect.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "D IFFUSE TERMINAL PHALANGEAL SCLEROSIS",
    itemNumber: "3.9",
    problemCluster: "ivory tufts",
    seriousAlternatives: ["Normal Variant (Mimic)", "Systemic Sclerosis", "Psoriatic Arthritis", "Renal Osteodystrophy"],
    differentials: [
      {
        diagnosis: "Systemic Sclerosis (Scleroderma)",
        dominantImagingFinding: "Ivory density of the distal phalangeal tufts with associated ACRO-OSTEOLYSIS.",
        distributionLocation: "Bilateral and symmetric. Hands focus.",
        demographicsClinicalContext: "Middle-aged females. Raynaud's phenomenon.",
        discriminatingKeyFeature: "ACRO-OSTEOLYSIS: Sclerosis is combined with actual bone loss (tapering). Associated with calcinosis cutis.",
        associatedFindings: "Soft tissue atrophy.",
        complicationsSeriousAlternatives: "None (related to tufts).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Psoriatic Arthritis (Ivory Phalanx)",
        dominantImagingFinding: "Uniform sclerosis of the ENTIRE phalanx (Distal or Middle). Not just the tuft.",
        distributionLocation: "Asymmetric. DIP joints.",
        demographicsClinicalContext: "Skin psoriasis. Sausage digit.",
        discriminatingKeyFeature: "GLOBAL SCLEROSIS: The entire small bone is dense ('Ivory Phalanx'). Associated with bone proliferation.",
        associatedFindings: "Pencil-in-cup deformity.",
        complicationsSeriousAlternatives: "Arthritis mutilans.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 32 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_32_DATA) {
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
  console.log("Batch 32 Complete!");
}

main().catch(console.error);