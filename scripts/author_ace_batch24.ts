import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_24_DATA = [
  {
    pattern: "S ITES OF ORIGIN OF PRIMARY BONE NEOPLASMS",
    itemNumber: "1.9",
    problemCluster: "bone tumor location",
    seriousAlternatives: ["Epiphyseal", "Metaphyseal", "Diaphyseal"],
    differentials: [
      {
        diagnosis: "Epiphyseal Tumors (GCT / Chondroblastoma)",
        dominantImagingFinding: "Lucent lesion extending to the subarticular cortex. GCT occurs after physis closure; Chondroblastoma occurs before.",
        distributionLocation: "Epiphysis of long bones.",
        demographicsClinicalContext: "Young adults (GCT) or Children (Chondroblastoma).",
        discriminatingKeyFeature: "EPIPHYSEAL location. GCT lacks a sclerotic rim; Chondroblastoma characteristically has one.",
        associatedFindings: "Joint effusion.",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Metaphyseal Tumors (Osteosarcoma / Osteochondroma)",
        dominantImagingFinding: "Aggressive matrix (Osteosarcoma) or bony outgrowth (Osteochondroma). Most primary tumors arise here.",
        distributionLocation: "Metaphysis (Knee/Shoulder focus).",
        demographicsClinicalContext: "Adolescents.",
        discriminatingKeyFeature: "METAPHYSEAL location. High metabolic activity at the growth plate makes this the most common site for primary bone tumors.",
        associatedFindings: "Periosteal reaction.",
        complicationsSeriousAlternatives: "Systemic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Diaphyseal Tumors (Ewing / Adamantinoma / Osteoid Osteoma)",
        dominantImagingFinding: "Permeative destruction (Ewing) or dense sclerosis (Osteoid Osteoma).",
        distributionLocation: "Mid-shaft of long bones.",
        demographicsClinicalContext: "Children (Ewing).",
        discriminatingKeyFeature: "DIAPHYSEAL focus. Ewing's characteristically lacks matrix but has a huge soft tissue mass.",
        associatedFindings: "Onion-skin periostitis.",
        complicationsSeriousAlternatives: "Marrow failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L UCENT BONE LESION IN THE MEDULLA",
    itemNumber: "1.14",
    problemCluster: "medullary destruction",
    seriousAlternatives: ["Lytic Metastasis", "Multiple Myeloma", "Osteomyelitis", "Ewing Sarcoma"],
    differentials: [
      {
        diagnosis: "Lytic Metastasis",
        dominantImagingFinding: "Ill-defined, moth-eaten or permeative bone destruction. Cortical breakthrough.",
        distributionLocation: "Axial skeleton focus. Pedicle destruction.",
        demographicsClinicalContext: "Older adults. Known primary cancer.",
        discriminatingKeyFeature: "PEDICLE DESTRUCTION and multiplicity. Intensely hot bone scan (unless RCC).",
        associatedFindings: "Pathological fracture.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multiple Myeloma",
        dominantImagingFinding: "Multiple small 'PUNCHED-OUT' lucencies. Discretely marginated.",
        distributionLocation: "Skull, Spine, and Pelvis. Pedicle SPARING.",
        demographicsClinicalContext: "Elderly. B-symptoms and anaemia.",
        discriminatingKeyFeature: "PUNCHED-OUT appearance and COLD bone scan. Diffuse osteopenia.",
        associatedFindings: "M-protein peak.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Acute Osteomyelitis",
        dominantImagingFinding: "Rapidly progressive moth-eaten destruction. SEQUESTRA.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "Acute fever and high CRP. IVDU or diabetic.",
        discriminatingKeyFeature: "RAPID CHANGE (<48h) and SEQUESTRUM. Crosses the joint space (unlike tumor).",
        associatedFindings: "Soft tissue gas or swelling.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S OLITARY DENSE PEDICLE",
    itemNumber: "2.5", // Corrected pattern item mapping
    problemCluster: "white pedicle",
    seriousAlternatives: ["Osteoblastic Metastasis", "Contralateral Pars Defect (Compensatory)", "Osteoid Osteoma"],
    differentials: [
      {
        diagnosis: "Osteoblastic Metastasis (Pedicle)",
        dominantImagingFinding: "Intense sclerosis of a solitary pedicle. No enlargement. NO contralateral defect.",
        distributionLocation: "Any spinal level.",
        demographicsClinicalContext: "Older adults. Known primary (Prostate).",
        discriminatingKeyFeature: "NORMAL CONTRALATERAL SIDE: If the opposite pedicle/pars is normal, sclerosis is malignant until proven otherwise.",
        associatedFindings: "Other 'hot' spots on scan.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Contralateral Pars Stress Fracture (Compensatory)",
        dominantImagingFinding: "Sclerosis of a pedicle/lamina associated with a LYSES (fracture) on the OPPOSITE side.",
        distributionLocation: "Lumbar spine (L4/L5 common).",
        demographicsClinicalContext: "Young athletes (Gymnasts). Chronic back pain.",
        discriminatingKeyFeature: "CONTRALATERAL LYSES: The sclerosis is a reactive response to increased mechanical load from the opposite-side defect.",
        associatedFindings: "Spondylolisthesis.",
        complicationsSeriousAlternatives: "Chronic instability.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Osteoid Osteoma (Spine)",
        dominantImagingFinding: "Intense sclerosis of the pedicle/pars surrounding a small lucent nidus.",
        distributionLocation: "Posterior elements of the spine.",
        demographicsClinicalContext: "Young adults. Painful scoliosis convex away from the lesion.",
        discriminatingKeyFeature: "PAINFUL SCOLIOSIS and dramatic response to Aspirin. CT shows the central nidus.",
        associatedFindings: "Localized hot spot on scan.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "INTERVERTEBRAL DISC CALCIFICATION",
    itemNumber: "2.11",
    problemCluster: "calcified disc",
    seriousAlternatives: ["Degenerative (Spondylosis)", "Ochronosis (Alkaptonuria)", "CPPD", "Prior Infection"],
    differentials: [
      {
        diagnosis: "Degenerative Spondylosis",
        dominantImagingFinding: "Focal calcification of the ANNULUS FIBROSUS. Associated with disc space narrowing.",
        distributionLocation: "Lumbar and Cervical spine. Focused at mobile segments.",
        demographicsClinicalContext: "Elderly patients with mechanical pain.",
        discriminatingKeyFeature: "FOCAL/ANNULAR: Calcification is usually peripheral and limited to a few degenerated levels. Associated with osteophytes.",
        associatedFindings: "Subchondral sclerosis.",
        complicationsSeriousAlternatives: "Foraminal stenosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ochronosis (Alkaptonuria)",
        dominantImagingFinding: "Innumerable, diffuse calcification of the NUCLEUS PULPOSUS at every level.",
        distributionLocation: "Diffuse throughout the entire spine.",
        demographicsClinicalContext: "Black urine and joint pain. AR inheritance.",
        discriminatingKeyFeature: "DIFFUSE/NUCLEUS: Every single disc is calcified centrally. This is pathognomonic for ochronosis.",
        associatedFindings: "SI joint ankylosis.",
        complicationsSeriousAlternatives: "Premature severe OA.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "CPPD (Pseudogout)",
        dominantImagingFinding: "Thin, linear calcification of the intervertebral disc (Chondrocalcinosis).",
        distributionLocation: "Fibrocartilage. Symmetric.",
        demographicsClinicalContext: "Elderly. Associated with calcification in the knees and wrists.",
        discriminatingKeyFeature: "LINEAR/SYMMETRIC: Calcification is fine and linear. Associated with 'Hook-like' osteophytes in the hands.",
        associatedFindings: "Chondrocalcinosis of large joints.",
        complicationsSeriousAlternatives: "Acute flares.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C ONSOLIDATION WITH AN ENLARGED HILUM",
    itemNumber: "4.7",
    problemCluster: "consolidation and nodes",
    seriousAlternatives: ["Primary Tuberculosis", "Bronchogenic Carcinoma (Central)", "Tularemia", "Fungal (Histoplasmosis)"],
    differentials: [
      {
        diagnosis: "Primary Tuberculosis (TB)",
        dominantImagingFinding: "Focal consolidation (Ghon focus) characteristically associated with IPSILATERAL hilar/paratracheal adenopathy.",
        distributionLocation: "Mid or Lower lobes common.",
        demographicsClinicalContext: "Children or immigrants. Often asymptomatic early.",
        discriminatingKeyFeature: "GHON COMPLEX: The combination of a parenchymal focus and large draining node. Nodes often have necrotic centers.",
        associatedFindings: "Pleural effusion.",
        complicationsSeriousAlternatives: "Miliary spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Bronchogenic Carcinoma (Central)",
        dominantImagingFinding: "Lobar consolidation (post-obstructive) distal to a central hilar mass.",
        distributionLocation: "Lobar focus. RUL common (Golden S sign).",
        demographicsClinicalContext: "Adult smokers. Weight loss and haemoptysis.",
        discriminatingKeyFeature: "GOLDEN S SIGN: Downward concave fissure due to RUL collapse around a central mass. Absence of fever.",
        associatedFindings: "Rib destruction.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Histoplasmosis (Acute)",
        dominantImagingFinding: "Patchy consolidation and symmetric hilar/mediastinal nodes.",
        distributionLocation: "Bilateral common.",
        demographicsClinicalContext: "Travel to Ohio/Mississippi River valleys. Bird/Bat droppings exposure.",
        discriminatingKeyFeature: "EPIDEMIOLOGY: History of specific geographic exposure. Nodes often calcify later.",
        associatedFindings: "Lung nodules.",
        complicationsSeriousAlternatives: "Mediastinal fibrosis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "LOCALIZED BULGE OF THE RENAL OUTLINE",
    itemNumber: "8.7",
    problemCluster: "renal lump",
    seriousAlternatives: ["Renal Cell Carcinoma (RCC)", "Dromedary Hump (Variant)", "Pseudotumor (Hypertrophied Column)", "Scarring"],
    differentials: [
      {
        diagnosis: "Renal Cell Carcinoma (RCC)",
        dominantImagingFinding: "Solid, exophytic, hypervascular mass causing a focal bulge. DISRUPTS the corticomedullary junction.",
        distributionLocation: "Renal cortex focus.",
        demographicsClinicalContext: "Adults. Painless haematuria. Smoking.",
        discriminatingKeyFeature: "INTERNAL ENHANCEMENT and disruption of normal architecture. 30% have calcification. Solid on US.",
        associatedFindings: "Renal vein thrombus.",
        complicationsSeriousAlternatives: "Vascular invasion.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Dromedary Hump (Normal Variant)",
        dominantImagingFinding: "Focal bulge of the LEFT renal outline. Identical echogenicity/enhancement to normal cortex.",
        distributionLocation: "Lateral border of the Left kidney.",
        demographicsClinicalContext: "Asymptomatic incidental finding.",
        discriminatingKeyFeature: "IDENTICAL to CORTEX: The hump has the same echogenicity, enhancement, and Doppler flow as the rest of the kidney. No mass effect on calyces.",
        associatedFindings: "Normal renal pelvis.",
        complicationsSeriousAlternatives: "None (MIMIC).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hypertrophied Column of Bertin (Pseudotumor)",
        dominantImagingFinding: "Solid 'mass' in the mid-kidney area. Indents but does not destroy the renal sinus.",
        distributionLocation: "Mid-portion of the kidney, between pyramids.",
        demographicsClinicalContext: "Incidental finding.",
        discriminatingKeyFeature: "SINUS INDENTATION: The 'mass' is continuous with the cortex and has the same enhancement. US shows it's a prominent column between pyramids.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 24 (PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_24_DATA) {
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
  console.log("Batch 24 Part 1 Complete!");
}

main().catch(console.error);