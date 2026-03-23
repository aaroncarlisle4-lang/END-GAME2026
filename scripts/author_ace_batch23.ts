import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_23_DATA = [
  {
    pattern: "IVORY VERTEBRAL BODY",
    itemNumber: "2.9",
    problemCluster: "ivory vertebra",
    seriousAlternatives: ["Osteoblastic Metastasis (Prostate)", "Paget's Disease", "Lymphoma", "Sclerotic Myeloma"],
    differentials: [
      {
        diagnosis: "Osteoblastic Metastases (Prostate)",
        dominantImagingFinding: "Uniformly dense, white vertebra. PEDICLE INVOLVEMENT common (90%). No bone expansion.",
        distributionLocation: "Typically Thoracic or Lumbar spine. Often multiple vertebrae.",
        demographicsClinicalContext: "Older males with known Prostate CA or high PSA.",
        discriminatingKeyFeature: "PEDICLE INVOLVEMENT and intensely hot bone scan. Unlike Paget's, the vertebral body size is normal.",
        associatedFindings: "Elevated Alk Phos.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paget's Disease (Ivory Phase)",
        dominantImagingFinding: "Uniformly dense vertebra with characteristically ENLARGED bone outline. 'Picture-frame' appearance.",
        distributionLocation: "Any spinal level. Often monostotic.",
        demographicsClinicalContext: "Elderly. Asymptomatic or chronic pain.",
        discriminatingKeyFeature: "BONE ENLARGEMENT: The bone is larger and thicker than normal (Expansion). This is not seen in mets or lymphoma.",
        associatedFindings: "Picture-frame appearance (thickened cortex).",
        complicationsSeriousAlternatives: "Spinal stenosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Lymphoma (Sclerotic)",
        dominantImagingFinding: "Uniformly dense vertebra with ANTERIOR SCALLOPING. No bone expansion.",
        distributionLocation: "Thoracolumbar spine.",
        demographicsClinicalContext: "Young to middle-aged adults. B-symptoms (fever, weight loss).",
        discriminatingKeyFeature: "ANTERIOR SCALLOPING: Pressure from bulky retroperitoneal lymphadenopathy causes smooth anterior vertebral body erosion.",
        associatedFindings: "Bulky retroperitoneal nodes.",
        complicationsSeriousAlternatives: "SVC obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ATLANTOAXIAL SUBLUXATION",
    itemNumber: "2.10",
    problemCluster: "C1-C2 instability",
    seriousAlternatives: ["Rheumatoid Arthritis", "Down Syndrome", "Trauma", "Psoriatic Arthritis"],
    differentials: [
      {
        diagnosis: "Rheumatoid Arthritis (RA)",
        dominantImagingFinding: "ADI (Atlantodental Interval) >3mm in adults. PANNUS formation and erosions of the dens.",
        distributionLocation: "C1-C2 joint.",
        demographicsClinicalContext: "Adults with chronic symmetric arthritis. Positive RF/Anti-CCP.",
        discriminatingKeyFeature: "DENS EROSIONS: Pannus (inflammatory soft tissue) causes destruction of the odontoid peg. Associated with subaxial subluxations.",
        associatedFindings: "Superior migration of the dens (Basilar invagination).",
        complicationsSeriousAlternatives: "Sudden death from cord transection (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Down Syndrome (Trisomy 21)",
        dominantImagingFinding: "Bilateral ADI widening due to transverse ligament laxity. No erosions.",
        distributionLocation: "C1-C2 joint.",
        demographicsClinicalContext: "Children/Adults with Trisomy 21.",
        discriminatingKeyFeature: "CONGENITAL LAXITY: Ligamentous laxity without bony erosions. 20% of Down's patients have AA instability.",
        associatedFindings: "Hypoplastic odontoid (Os odontoideum).",
        complicationsSeriousAlternatives: "Myelopathy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Grisel Syndrome (Inflammatory)",
        dominantImagingFinding: "AA subluxation in a child with soft tissue swelling in the neck.",
        distributionLocation: "C1-C2 joint.",
        demographicsClinicalContext: "Children following a pharyngeal infection or neck surgery.",
        discriminatingKeyFeature: "NECK INFECTION history: Inflammatory hyperaemia leads to transverse ligament laxity. No prior RA or Down's.",
        associatedFindings: "Torticollis.",
        complicationsSeriousAlternatives: "Quadriplegia.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "CARPAL FUSION",
    itemNumber: "1.38",
    problemCluster: "carpal coalition",
    seriousAlternatives: ["Congenital Coalition", "Rheumatoid Arthritis (Acquired)", "Juvenile Idiopathic Arthritis", "Infection"],
    differentials: [
      {
        diagnosis: "Congenital Carpal Coalition",
        dominantImagingFinding: "Fusion of two or more carpal bones. Characteristically involves the LUNATE and TRIQUETRUM.",
        distributionLocation: "Lunate-Triquetrum (Most common) or Capitate-Hamate.",
        demographicsClinicalContext: "Asymptomatic incidental finding. More common in African descent.",
        discriminatingKeyFeature: "LUNATE-TRIQUETRUM fusion and LACK of joint space narrowing elsewhere. Normal bone density.",
        associatedFindings: "Ellis-van Creveld syndrome (if distal row).",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acquired Carpal Fusion (RA/JIA)",
        dominantImagingFinding: "Generalized carpal fusion ('CARPAL MASS') with severe joint narrowing and osteoporosis.",
        distributionLocation: "All carpal bones. Bilateral and symmetric.",
        demographicsClinicalContext: "History of severe juvenile or adult inflammatory arthritis.",
        discriminatingKeyFeature: "GENERALIZED fusion: Involves the entire carpal mass. Associated with prior erosions and significant OSTEOPOROSIS.",
        associatedFindings: "Ulnar deviation.",
        complicationsSeriousAlternatives: "Complete wrist immobility.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Prior Septic Arthritis",
        dominantImagingFinding: "Localized carpal fusion following an acute destructive joint infection.",
        distributionLocation: "Variable. Unilateral.",
        demographicsClinicalContext: "Prior history of a hot, swollen wrist or surgery.",
        discriminatingKeyFeature: "UNILATERALITY and evidence of prior bone destruction. Lacks the symmetry of inflammatory causes.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Chronic pain.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S QUARING OF ONE OR MORE VERTEBRAL BODIES",
    itemNumber: "2.7",
    problemCluster: "square vertebra",
    seriousAlternatives: ["Ankylosing Spondylitis", "Paget's Disease", "Psoriatic Arthritis", "Rheumatoid Arthritis"],
    differentials: [
      {
        diagnosis: "Ankylosing Spondylitis (Early)",
        dominantImagingFinding: "Loss of the normal anterior concavity of the vertebral body. 'SHINY CORNER' sign.",
        distributionLocation: "Thoracolumbar junction. Symmetric.",
        demographicsClinicalContext: "Young males. HLA-B27 positive.",
        discriminatingKeyFeature: "SHINY CORNER (Romanus lesion): Small erosions at the vertebral corners with reactive sclerosis. Leads to BAMBOO SPINE.",
        associatedFindings: "Fused SI joints.",
        complicationsSeriousAlternatives: "Spinal fusion.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paget's Disease (Squaring)",
        dominantImagingFinding: "Squaring associated with significant BONE ENLARGEMENT and cortical thickening.",
        distributionLocation: "Monostotic vertebral body.",
        demographicsClinicalContext: "Elderly.",
        discriminatingKeyFeature: "BONE EXPANSION: Unlike AS, the bone size is increased. Picture-frame appearance.",
        associatedFindings: "Elevated Alk Phos.",
        complicationsSeriousAlternatives: "None (related to squaring).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "B LOCK VERTEBRAE",
    itemNumber: "2.8",
    problemCluster: "fused vertebrae",
    seriousAlternatives: ["Congenital (Klippel-Feil)", "Acquired (Infection)", "Post-surgical", "Ankylosing Spondylitis"],
    differentials: [
      {
        diagnosis: "Congenital Block Vertebra",
        dominantImagingFinding: "Fusion of two or more vertebrae. CHARACTERISTIC 'WASP-WAIST' narrowing at the disc level.",
        distributionLocation: "Cervical spine (Klippel-Feil) or Lumbar.",
        demographicsClinicalContext: "Asymptomatic or limited neck mobility (Triad: Low hairline, short neck, limited mobility).",
        discriminatingKeyFeature: "WASP-WAIST deformity: The vertebral bodies are narrowed at the site of the failed disc space. Fused posterior elements (50%).",
        associatedFindings: "Ovoid-shaped vertebral bodies.",
        complicationsSeriousAlternatives: "Accelerated degeneration of adjacent levels.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acquired Block Vertebra (Post-Infectious)",
        dominantImagingFinding: "Fusion following disc space destruction. LACKS the 'wasp-waist' sign.",
        distributionLocation: "Any level. Often involves only the vertebral bodies.",
        demographicsClinicalContext: "Prior history of Spondylodiscitis (TB or pyogenic).",
        discriminatingKeyFeature: "LACK OF WASP-WAIST: The fused segment is thick and irregular. Posterior elements are usually SPARED (unlike congenital).",
        associatedFindings: "Gibbus deformity (if TB).",
        complicationsSeriousAlternatives: "Spinal deformity.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Post-Surgical Fusion",
        dominantImagingFinding: "Block vertebra with identifiable surgical hardware or bone graft.",
        distributionLocation: "Cervical or Lumbar.",
        demographicsClinicalContext: "Prior history of spinal fusion surgery.",
        discriminatingKeyFeature: "HARDWARE presence: Metallic plates, screws, or cages are diagnostic. History is key.",
        associatedFindings: "Laminectomy scars.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 23 (PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_23_DATA) {
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
  console.log("Batch 23 Part 1 complete!");
}

main().catch(console.error);