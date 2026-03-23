import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_33_DATA = [
  {
    pattern: "SOLITARY SCLEROTIC BONE LESION WITH A LUCENT CENTRE",
    itemNumber: "1.5",
    problemCluster: "sclerosis with lucency",
    seriousAlternatives: ["Brodie's Abscess", "Osteoid Osteoma", "Sclerotic Metastasis"],
    differentials: [
      {
        diagnosis: "Brodie’s Abscess (Subacute Osteomyelitis)",
        dominantImagingFinding: "Elongated, serpentine lucency with a thick, well-defined sclerotic rim. 'PENUMBRA SIGN' on MRI.",
        distributionLocation: "Metaphysis of long bones (Tibia/Femur). Characteristically crosses the physis.",
        demographicsClinicalContext: "Children or young adults. Chronic localized pain. No systemic fever.",
        discriminatingKeyFeature: "PENUMBRA SIGN (T1 hyperintense rim) and serpentine shape. Larger than 1.5cm usually.",
        associatedFindings: "Sinus tract (Cloaca).",
        complicationsSeriousAlternatives: "Chronic infection.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteoid Osteoma",
        dominantImagingFinding: "Tiny lucent NIDUS (<1.5cm) with surrounding MASSIVE reactive sclerosis.",
        distributionLocation: "Cortical location in long bone diaphyses.",
        demographicsClinicalContext: "Young adults (10-25y). Intense night pain relieved by Aspirin.",
        discriminatingKeyFeature: "NIDUS <1.5cm and dramatic clinical response to NSAIDs. Intense focal hot spot on bone scan.",
        associatedFindings: "Double-density sign on scan.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "A RTHRITIS WITH SOFT-TISSUE NODULES",
    itemNumber: "3.7",
    problemCluster: "nodular arthritis",
    seriousAlternatives: ["Rheumatoid Arthritis (Rheumatoid Nodules)", "Gout (Tophi)", "Xanthomatosis", "Multicentric Reticulohistiocytosis"],
    differentials: [
      {
        diagnosis: "Rheumatoid Arthritis (Nodular)",
        dominantImagingFinding: "Symmetric marginal erosions and OSTEOPOROSIS with associated dense soft tissue nodules.",
        distributionLocation: "Extensor surfaces (Elbow/Olecranon) and MCP joints.",
        demographicsClinicalContext: "Adults with high-titre RF. Chronic systemic RA.",
        discriminatingKeyFeature: "SYMMETRY and OSTEOPOROSIS. Rheumatoid nodules are typically located on pressure surfaces, not just periarticular.",
        associatedFindings: "Ulnar deviation.",
        complicationsSeriousAlternatives: "Lung nodules (Caplan Syndrome).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Gout (Tophaceous)",
        dominantImagingFinding: "Punched-out erosions with OVERHANGING EDGES and eccentric dense soft tissue masses (TOPHI).",
        distributionLocation: "1st MTP, Elbow (Olecranon bursa), and Ear pinna.",
        demographicsClinicalContext: "Middle-aged males. High uric acid.",
        discriminatingKeyFeature: "TOPHI and OVERHANGING EDGES. Unlike RA, the bone density is characteristically preserved.",
        associatedFindings: "Olecranon bursitis.",
        complicationsSeriousAlternatives: "Joint deformity.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "S OFT-TISSUE OSSIFICATION",
    itemNumber: "9.5",
    problemCluster: "ectopic bone",
    seriousAlternatives: ["Myositis Ossificans (Trauma)", "Myositis Ossificans Progressiva", "Neuropathic Ossification"],
    differentials: [
      {
        diagnosis: "Myositis Ossificans (Traumata)",
        dominantImagingFinding: "Zonal ossification: Mature peripheral bone with a lucent center. Lacks connection to underlying bone.",
        distributionLocation: "Large muscle groups (Quads/Brachialis) following trauma.",
        demographicsClinicalContext: "Young adults. Prior history of blunt trauma or hematoma.",
        discriminatingKeyFeature: "ZONAL PHENOMENON: Peripheral maturation differentiates it from parosteal osteosarcoma (which has a central dense core).",
        associatedFindings: "Lacks a periosteal reaction from adjacent bone.",
        complicationsSeriousAlternatives: "Mistaken for sarcoma.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Fibrodysplasia Ossificans Progressiva (FOP)",
        dominantImagingFinding: "Extensive, sheet-like ossification of muscles and fascia. Associated with a SHORT 1st METATARSAL.",
        distributionLocation: "Generalized. Starts in neck/back and moves distally.",
        demographicsClinicalContext: "Children. Progressive 'stone-man' syndrome.",
        discriminatingKeyFeature: "SHORT BIG TOE: Congenital short 1st metatarsal is pathognomonic when seen with progressive soft tissue bone.",
        associatedFindings: "Short 1st metacarpal.",
        complicationsSeriousAlternatives: "Respiratory failure from chest wall restriction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "SHORT METACARPAL(S) OR METATARSAL(S)",
    itemNumber: "11.39",
    problemCluster: "short hand bones",
    seriousAlternatives: ["Pseudohypoparathyroidism (PHP)", "Turner Syndrome", "Sickle Cell Disease", "Idiopathic"],
    differentials: [
      {
        diagnosis: "Pseudohypoparathyroidism (PHP)",
        dominantImagingFinding: "Short 4th and 5th metacarpals. Generalized soft tissue calcification.",
        distributionLocation: "Bilateral. 4th/5th digits common.",
        demographicsClinicalContext: "Short stature, round facies, and intellectual disability (Albright's Hereditary Osteodystrophy).",
        discriminatingKeyFeature: "BIOCHEMISTRY: Low Calcium and High PTH (End-organ resistance). Associated with soft tissue calcinosis.",
        associatedFindings: "Short stature.",
        complicationsSeriousAlternatives: "Seizures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Turner Syndrome (45,X)",
        dominantImagingFinding: "Short 4th metacarpal (Positive Metacarpal Sign). Madelung deformity.",
        distributionLocation: "Unilateral or bilateral. 4th MC focus.",
        demographicsClinicalContext: "Females with primary amenorrhoea and webbed neck.",
        discriminatingKeyFeature: "NEGATIVE ARCHIBALD SIGN: A line touching the heads of the 3rd and 5th MCs passes through the 4th.",
        associatedFindings: "Horseshoe kidney.",
        complicationsSeriousAlternatives: "Aortic dissection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sickle Cell Disease (Dactylitis)",
        dominantImagingFinding: "Short metacarpal due to premature physeal fusion following a childhood bone infarct.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "African descent. History of painful hand-foot syndrome in childhood.",
        discriminatingKeyFeature: "HISTORY: Clear prior episode of dactylitis (infarction). Associated with medullary sclerosis.",
        associatedFindings: "H-shaped vertebrae.",
        complicationsSeriousAlternatives: "Bone crisis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "RIGHT ATRIAL ENLARGEMENT",
    itemNumber: "5.2",
    problemCluster: "RA dilatation",
    seriousAlternatives: ["Ebstein Anomaly", "Tricuspid Stenosis/Regurgitation", "ASD"],
    differentials: [
      {
        diagnosis: "Ebstein Anomaly",
        dominantImagingFinding: "MASSIVE RA enlargement giving a 'BOX-SHAPED' cardiac silhouette. Small RV.",
        distributionLocation: "Right heart focus.",
        demographicsClinicalContext: "Neonates (cyanotic) or adults. Apical displacement of the tricuspid valve.",
        discriminatingKeyFeature: "BOX-SHAPE and CLEAR LUNGS (Oligemia). The heart is huge but the pulmonary vascularity is decreased.",
        associatedFindings: "WPW syndrome.",
        complicationsSeriousAlternatives: "Arrhythmias.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Tricuspid Regurgitation",
        dominantImagingFinding: "Enlarged RA with a prominent right heart border. DILATED SVC and hepatic veins.",
        distributionLocation: "Right heart.",
        demographicsClinicalContext: "IVDU (endocarditis) or secondary to pulmonary hypertension.",
        discriminatingKeyFeature: "SVC DILATATION and pulsatile liver on US. Contrast reflux into the hepatic veins on CT.",
        associatedFindings: "Pleural effusions.",
        complicationsSeriousAlternatives: "Right heart failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 33 (Final Push)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_33_DATA) {
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
  console.log("Batch 33 Complete!");
}

main().catch(console.error);