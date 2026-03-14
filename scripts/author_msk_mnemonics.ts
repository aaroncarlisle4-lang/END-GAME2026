import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MSK_UPDATES = [
  {
    mnemonic: "FEGNOMASHIC",
    pattern: "Expansile lytic lesion",
    expanded: "F: Fibrous dysplasia, E: EG (LCH), G: GCT, N: NOF, O: Osteoblastoma, M: Myeloma/Metastasis, A: ABC, S: SBC, H: HPT (Brown tumor), I: Infection, C: Chondromyxoid fibroma",
    problemCluster: "lytic bone lesion",
    seriousAlternatives: ["GCT (Malignant)", "Lytic Metastases", "Osteomyelitis"],
    differentials: [
      {
        diagnosis: "Fibrous Dysplasia",
        dominantImagingFinding: "GROUND-GLASS matrix (100%). Thick sclerotic 'rind'.",
        distributionLocation: "Shepherd's crook femur. Craniofacial bones.",
        demographicsClinicalContext: "Young adults (<30y). McCune-Albright Syndrome.",
        discriminatingKeyFeature: "GROUND-GLASS attenuation (20-40 HU).",
        associatedFindings: "Bowing deformities. Endosteal scalloping.",
        complicationsSeriousAlternatives: "Sarcomatous transformation.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Eosinophilic Granuloma (LCH)",
        dominantImagingFinding: "PUNCHED-OUT lytic lesion. Bevelled edge in skull.",
        distributionLocation: "Skull (most common), Pelvis, Femur.",
        demographicsClinicalContext: "Children (5-10y). Pain/swelling.",
        discriminatingKeyFeature: "BEVELLED EDGE (unequal destruction of inner/outer table).",
        associatedFindings": "Vertebra plana.",
        complicationsSeriousAlternatives": "Hand-Schüller-Christian triad.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Giant Cell Tumor (GCT)",
        dominantImagingFinding": "LYTIC, eccentric, expansile. No sclerotic rim (80%).",
        distributionLocation: "EPIPHYSEAL - reaches subarticular surface. Knee (50%).",
        demographicsClinicalContext": "Adults (20-40y). Closed physis (100%).",
        discriminatingKeyFeature": "SUBARTICULAR location in a skeletally mature adult.",
        associatedFindings": "Soap-bubble appearance.",
        complicationsSeriousAlternatives": "Pulmonary 'benign' metastases.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Non-Ossifying Fibroma (NOF)",
        dominantImagingFinding": "Eccentric lytic lesion. Sclerotic, scalloped border.",
        distributionLocation: "METAPHYSEAL. Distal femur / proximal tibia.",
        demographicsClinicalContext": "Children/Adolescents. Asymptomatic incidentaloma.",
        discriminatingKeyFeature": "ASYMPTOMATIC incidental finding in a child. Migrates to diaphysis.",
        associatedFindings": "Thin sclerotic margin.",
        complicationsSeriousAlternatives": "Pathological fracture (if >50% width).",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Osteoblastoma",
        dominantImagingFinding: "LARGE (>2cm) expansile lytic lesion. Matrix calcification (50%).",
        distributionLocation: "POSTERIOR ELEMENTS of spine (40%).",
        demographicsClinicalContext": "Young adults (10-30y). Chronic pain NOT relieved by aspirin.",
        discriminatingKeyFeature": "POSTERIOR SPINE location and size >2cm (unlike osteoid osteoma).",
        associatedFindings": "Surrounding bone oedema on MRI.",
        complicationsSeriousAlternatives": "Malignant transformation (rare).",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Aneurysmal Bone Cyst (ABC)",
        dominantImagingFinding: "Highly EXPANSILE 'blow-out' lesion (100%). Internal septa.",
        distributionLocation: "Metaphyseal long bones. Posterior spine.",
        demographicsClinicalContext": "Children (<20y in 80%). Painful expansion.",
        discriminatingKeyFeature": "FLUID-FLUID LEVELS on MRI (80%).",
        associatedFindings": "Thin subperiosteal bone shell.",
        complicationsSeriousAlternatives": "Rapid recurrence post-curettage.",
        isCorrectDiagnosis": false
      }
    ]
  },
  {
    mnemonic: "LOSE ME",
    pattern: "Aggressive lytic lesion in child",
    expanded: "L: Leukaemia / Lymphoma, O: Osteomyelitis, S: Sarcoma (Ewing), E: EG (LCH), M: Metastasis (Neuroblastoma)",
    problemCluster: "paediatric bone lesion",
    seriousAlternatives: ["Ewing Sarcoma", "Osteomyelitis", "Neuroblastoma Metastases"],
    differentials: [
      {
        diagnosis: "Ewing Sarcoma",
        dominantImagingFinding: "PERMEATIVE (moth-eaten) destruction. Onion-skin periostitis (50%).",
        distributionLocation": "DIAPHYSEAL (mid-shaft) in 30%. Lower limb (50%).",
        demographicsClinicalContext": "Peak 5-20y. Soft tissue mass (100%). Fever/Pain.",
        discriminatingKeyFeature": "LARGE SOFT TISSUE MASS out of proportion to bone loss.",
        associatedFindings": "Codman's triangle.",
        complicationsSeriousAlternatives": "Pulmonary metastases.",
        isCorrectDiagnosis": true
      },
      {
        diagnosis: "Osteomyelitis",
        dominantImagingFinding": "LYTIC destruction. SEQUESTRUM (dead bone) and INVOLUCRUM.",
        distributionLocation": "METAPHYSEAL (due to blood supply).",
        demographicsClinicalContext": "Acute onset fever, high CRP. Refusal to bear weight.",
        discriminatingKeyFeature": "SEQUESTRUM (isolated dense bone fragment) and rapid change over days.",
        associatedFindings": "Soft tissue oedema.",
        complicationsSeriousAlternatives": "Chronic sepsis.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Leukaemia",
        dominantImagingFinding": "LUCENT METAPHYSEAL BANDS (90%). Diffuse permeative loss.",
        distributionLocation": "BILATERAL and SYMMETRIC. Knees/Wrists.",
        demographicsClinicalContext": "Peak 2-5y. Anaemia, bone pain, bruising.",
        discriminatingKeyFeature": "SYMMETRICAL involvement and lucent metaphyseal bands.",
        associatedFindings": "Hepatosplenomegaly.",
        complicationsSeriousAlternatives": "Multi-organ failure.",
        isCorrectDiagnosis": false
      }
    ]
  }
];

async function main() {
  console.log("Cleaning up and upgrading MSK discriminators...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of MSK_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.mnemonicRef?.mnemonic === update.mnemonic || 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      const primaryId = matches[0]._id;
      console.log(`Updating existing record for ${update.mnemonic} (${primaryId})`);
      
      await client.mutation(api.discriminators.update as any, {
        id: primaryId,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 2, 
          expandedLetters: update.expanded
        }
      });
    } else {
      console.log(`Creating new record for ${update.mnemonic}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 2,
          expandedLetters: update.expanded
        }
      });
    }
  }
}

main().catch(console.error);