import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const ACE_UPDATES = [
  {
    pattern: "M ULTIPLE SCLEROTIC BONE LESIONS",
    problemCluster: "multiple sclerosis",
    differentials: [
      { 
        diagnosis: "Osteoblastic Metastases", 
        dominantImagingFinding: "Multiple ill-defined sclerotic foci of varying sizes.", 
        distributionLocation: "Axial skeleton (spine, pelvis, ribs) predominates.", 
        demographicsClinicalContext: "Older adults. Prostate (males) or Breast (females) primary.", 
        discriminatingKeyFeature: "Known primary tumor and hot on bone scan. Often associated with pedicle involvement.", 
        associatedFindings: "Elevated Alk Phos and PSA.", 
        complicationsSeriousAlternatives: "Cord compression.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Mastocytosis", 
        dominantImagingFinding: "Diffuse scattered small sclerotic nodules interspersed with osteopenia.", 
        distributionLocation: "Axial skeleton, symmetric.", 
        demographicsClinicalContext: "Urticaria pigmentosa (skin rash). Episodic flushing and tachycardia.", 
        discriminatingKeyFeature: "SKIN RASH and histamine release symptoms. Normal prostate/breast imaging.", 
        associatedFindings: "Hepatosplenomegaly.", 
        complicationsSeriousAlternatives: "Systemic anaphylaxis.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Tuberous Sclerosis", 
        dominantImagingFinding: "Multiple sclerotic bone islands. Enlarged bones with thick cortices.", 
        distributionLocation: "Pelvis, spine, and calvaria.", 
        demographicsClinicalContext: "Classic triad: Seizures, mental retardation, adenoma sebaceum.", 
        discriminatingKeyFeature: "PRESENCE OF CNS TUBERS and renal angiomyolipomas (AMLs).", 
        associatedFindings: "Pulmonary LAM in females.", 
        complicationsSeriousAlternatives: "Renal haemorrhage (from AML).", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Osteopoikilosis", 
        dominantImagingFinding: "Multiple small (1-10mm) dense bone islands ('spotted bone disease').", 
        distributionLocation: "Peri-articular distribution (epiphyses and metaphyses). Spares the axial skeleton.", 
        demographicsClinicalContext: "Asymptomatic incidental finding. Autosomal dominant.", 
        discriminatingKeyFeature: "PERI-ARTICULAR clustering of thorny dense nodules. Cold on bone scan.", 
        associatedFindings: "Dermatofibrosis lenticularis (in Buschke-Ollendorff syndrome).", 
        complicationsSeriousAlternatives: "None (benign).", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "B ONE SCLEROSIS WITH A PERIOSTEAL REACTION",
    problemCluster: "sclerosis with periostitis",
    differentials: [
      { 
        diagnosis: "Chronic Osteomyelitis", 
        dominantImagingFinding: "Thick irregular solid periosteal reaction with underlying medullary sclerosis.", 
        distributionLocation: "Metaphysis/diaphysis of long bones (tibia, femur).", 
        demographicsClinicalContext: "History of prior trauma, surgery, or prolonged dull pain/swelling.", 
        discriminatingKeyFeature: "SEQUESTRUM (dead bone) and INVOLUCRUM (reactive new bone shell) with a cloaca.", 
        associatedFindings: "Discharging sinus tract.", 
        complicationsSeriousAlternatives: "Squamous cell carcinoma arising in sinus tract (Marjolin ulcer).", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Osteoid Osteoma", 
        dominantImagingFinding: "Massive solid periosteal reaction surrounding a tiny (<1.5cm) radiolucent nidus.", 
        distributionLocation: "Cortical location in long bones.", 
        demographicsClinicalContext: "Young adults. Night pain completely relieved by Aspirin.", 
        discriminatingKeyFeature: "LUCENT NIDUS hidden within the dense sclerosis (best seen on CT).", 
        associatedFindings: "Double density sign on bone scan.", 
        complicationsSeriousAlternatives: "Limb length discrepancy if near physis.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Ewing Sarcoma", 
        dominantImagingFinding: "Aggressive permeative sclerosis (or lysis) with ONION-SKIN or SUNBURST periosteal reaction.", 
        distributionLocation: "Diaphysis of long bones.", 
        demographicsClinicalContext: "Children and young adults (5-20y). Pain and fever (mimicking infection).", 
        discriminatingKeyFeature: "LARGE SOFT TISSUE MASS extending beyond the bone destruction. Highly aggressive periostitis.", 
        associatedFindings: "Lung metastases.", 
        complicationsSeriousAlternatives: "Rapid metastatic spread and death.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Langerhans Cell Histiocytosis (EG)", 
        dominantImagingFinding: "Focal medullary sclerosis with solid or lamellated periosteal reaction.", 
        distributionLocation: "Diaphysis/metaphysis.", 
        demographicsClinicalContext: "Children (peak 5-10y).", 
        discriminatingKeyFeature: "BEVELLED EDGE (in skull) or HOLE-WITHIN-A-HOLE appearance. Often purely lytic but can show sclerosis during healing.", 
        associatedFindings: "Vertebra plana.", 
        complicationsSeriousAlternatives: "Systemic multi-organ involvement.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "SOLITARY SCLEROTIC BONE LESION WITH A LUCENT CENTRE",
    problemCluster: "sclerosis with lucency",
    differentials: [
      { 
        diagnosis: "Osteoid Osteoma", 
        dominantImagingFinding: "Dense cortical sclerosis surrounding a small (<1.5cm) targetoid lucent nidus.", 
        distributionLocation: "Diaphysis/metaphysis of femur or tibia.", 
        demographicsClinicalContext: "Adolescents/Young adults. Severe night pain relieved by NSAIDs.", 
        discriminatingKeyFeature: "NIDUS <1.5cm and dramatic clinical response to Aspirin/NSAIDs.", 
        associatedFindings: "Central calcified dot within the nidus (target sign).", 
        complicationsSeriousAlternatives: "Growth disturbance.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Brodie Abscess (Subacute Osteomyelitis)", 
        dominantImagingFinding: "Thick sclerotic rim surrounding an elongated lucent cavity (>1.5cm).", 
        distributionLocation: "Metaphysis. Pathognomonic if tract extends towards the physis.", 
        demographicsClinicalContext: "Children/Young adults. Intermittent dull pain. No systemic fever.", 
        discriminatingKeyFeature: "PENUMBRA SIGN on MRI (T1 hyperintense rim lining the abscess cavity). Serpentine shape.", 
        associatedFindings: "Cloaca (draining sinus).", 
        complicationsSeriousAlternatives: "Chronic draining infection.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Osteoblastoma", 
        dominantImagingFinding: "Expansile lucent lesion (>2cm) with internal matrix calcification and a thin sclerotic rim.", 
        distributionLocation: "POSTERIOR ELEMENTS of the spine (100% classic) or long bone diaphysis.", 
        demographicsClinicalContext: "Young adults. Dull pain NOT relieved by Aspirin.", 
        discriminatingKeyFeature: "SIZE >2cm and predilection for the posterior elements of the spine.", 
        associatedFindings: "Painful scoliosis convex away from the lesion.", 
        complicationsSeriousAlternatives: "Cord compression.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "CONDITIONS INVOLVING SKIN AND BONE",
    problemCluster: "skin and bone",
    differentials: [
      { 
        diagnosis: "Neurofibromatosis Type 1", 
        dominantImagingFinding: "Ribbon-like ribs, tibial pseudarthrosis, and posterior vertebral scalloping.", 
        distributionLocation: "Diffuse skeletal anomalies.", 
        demographicsClinicalContext: "Café-au-lait spots, axillary freckling, cutaneous neurofibromas.", 
        discriminatingKeyFeature: "CUTANEOUS NEUROFIBROMAS and diagnostic skeletal dysplasias (sphenoid wing dysplasia).", 
        associatedFindings: "Optic pathway gliomas.", 
        complicationsSeriousAlternatives: "Malignant Peripheral Nerve Sheath Tumor (MPNST).", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Tuberous Sclerosis", 
        dominantImagingFinding: "Sclerotic bone islands and thick calvaria.", 
        distributionLocation: "Pelvis and skull.", 
        demographicsClinicalContext: "Adenoma sebaceum (facial angiofibromas), ash-leaf spots.", 
        discriminatingKeyFeature: "FACIAL RASH and subependymal calcified nodules in the brain.", 
        associatedFindings: "Cardiac rhabdomyomas.", 
        complicationsSeriousAlternatives: "Intractable seizures.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Mastocytosis", 
        dominantImagingFinding: "Diffuse patchy osteosclerosis.", 
        distributionLocation: "Axial skeleton.", 
        demographicsClinicalContext: "Urticaria pigmentosa (brownish-red macules that hive when rubbed - Darier sign).", 
        discriminatingKeyFeature: "SKIN RASH that releases histamine upon mechanical stimulation.", 
        associatedFindings: "Peptic ulcer disease (histamine-driven).", 
        complicationsSeriousAlternatives: "Anaphylactic shock.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Scleroderma", 
        dominantImagingFinding: "Acro-osteolysis (resorption of distal phalangeal tufts) and massive soft tissue calcification.", 
        distributionLocation: "Hands and soft tissues.", 
        demographicsClinicalContext: "Thick, tight, shiny skin. Raynaud's phenomenon.", 
        discriminatingKeyFeature: "TAPERED FINGERTIPS with dense amorphous calcinosis cutis.", 
        associatedFindings: "Oesophageal dysmotility and lung fibrosis.", 
        complicationsSeriousAlternatives: "Pulmonary hypertension.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "COARSE TRABECULAR PATTERN",
    problemCluster: "coarse trabeculae",
    differentials: [
      { 
        diagnosis: "Paget's Disease", 
        dominantImagingFinding: "Cortical thickening, extreme trabecular coarsening, and BONE ENLARGEMENT.", 
        distributionLocation: "Pelvis, Spine, Skull, Femur (asymmetric).", 
        demographicsClinicalContext: "Older adults (>55y). High Alk Phos, normal Calcium/Phosphate.", 
        discriminatingKeyFeature: "BONE ENLARGEMENT (unlike haemangioma or osteoporosis) and picture-frame vertebrae.", 
        associatedFindings: "Cotton-wool skull.", 
        complicationsSeriousAlternatives: "Osteosarcomatous transformation (<1%).", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Thalassaemia / Sickle Cell (Marrow Hyperplasia)", 
        dominantImagingFinding: "Widened medullary space, thinned cortices, and coarse, sparse remaining trabeculae.", 
        distributionLocation: "Skull, facial bones, ribs, hands (in children).", 
        demographicsClinicalContext: "Severe chronic haemolytic anaemia.", 
        discriminatingKeyFeature: "HAIR-ON-END SKULL and massive expansion of facial bones (rodent facies). No focal bone enlargement of long bones.", 
        associatedFindings: "Extramedullary haematopoiesis.", 
        complicationsSeriousAlternatives: "High output heart failure.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Vertebral Haemangioma", 
        dominantImagingFinding: "Prominent vertical striations ('Corduroy cloth' or 'Jailhouse' striations).", 
        distributionLocation: "Spine (thoracic/lumbar).", 
        demographicsClinicalContext: "Incidental finding in adults.", 
        discriminatingKeyFeature: "POLKA-DOT SIGN on axial CT and bright T1/T2 signal on MRI. No bone expansion.", 
        associatedFindings: "Fatty replacement.", 
        complicationsSeriousAlternatives: "Rarely, aggressive expansion causing cord compression.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Gaucher Disease", 
        dominantImagingFinding: "Diffuse osteopenia with a 'honeycomb' or coarse trabecular pattern.", 
        distributionLocation: "Distal femora and axial skeleton.", 
        demographicsClinicalContext: "Ashkenazi Jewish descent. Hepatosplenomegaly.", 
        discriminatingKeyFeature: "ERLENMEYER FLASK DEFORMITY of the distal femora and massive splenomegaly.", 
        associatedFindings: "H-shaped vertebrae (from AVN).", 
        complicationsSeriousAlternatives: "Severe bone pain crises.", 
        isCorrectDiagnosis: false 
      }
    ]
  }
];

async function main() {
  console.log("Seeding ACE Differentials (Chapman) Batch 2...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of ACE_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    const differentialsWithSort = update.differentials.map((d, idx) => ({
      ...d,
      sortOrder: idx
    }));
    
    if (matches.length > 0) {
      console.log(`Updating ${update.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    } else {
      console.log(`Creating ${update.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    }
  }
  console.log("ACE Batch 2 complete!");
}

main().catch(console.error);