import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const UPDATES = [
  {
    mnemonic: "ROMPS",
    pattern: "Diffuse osteosclerosis",
    expanded: "R: Renal osteodystrophy, O: Osteopetrosis, M: Myelofibrosis / Metastases, P: Paget disease / Pyknodysostosis, S: Sickle cell disease",
    problemCluster: "increased bone density",
    seriousAlternatives: ["Metastatic Prostate CA", "Myelofibrosis", "Osteopetrosis"],
    differentials: [
      {
        diagnosis: "Renal Osteodystrophy",
        dominantImagingFinding: "RUGGER-JERSEY SPINE (100% classic). Subperiosteal resorption. Osteosclerosis of vertebral endplates.",
        distributionLocation: "Axial skeleton (Spine). Metaphyses of long bones.",
        demographicsClinicalContext: "Chronic Renal Failure (Secondary HPT). Bone pain and pruritus.",
        discriminatingKeyFeature": "SUBPERIOSTEAL RESORPTION (middle phalanges) and Rugger-Jersey pattern.",
        associatedFindings: "Brown tumors. Soft tissue calcification.",
        complicationsSeriousAlternatives: "Pathological fractures.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Osteopetrosis",
        dominantImagingFinding: "Extreme uniform density ('Marble bone'). BONE-IN-BONE (90%) and SANDWICH vertebrae.",
        distributionLocation: "Diffuse entire skeleton. Skull base thickening (100%).",
        demographicsClinicalContext: "AR (Infantile) or AD (Adult). Failure to thrive or asymptomatic.",
        discriminatingKeyFeature": "BONE-IN-BONE (Endobone) and loss of medullary space.",
        associatedFindings: "Erlenmeyer flask deformity. Cranial nerve palsies.",
        complicationsSeriousAlternatives": "Pancytopenia and secondary osteomyelitis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Myelofibrosis",
        dominantImagingFinding: "DIFFUSE ground-glass sclerosis (100%). Massive SPLENOMEGALY.",
        distributionLocation: "Axial skeleton and proximal long bones. Symmetrical.",
        demographicsClinicalContext: "Adults (>50y). Anaemia. Dry marrow tap.",
        discriminatingKeyFeature": "MASSIVE SPLENOMEGALY and diffuse axial sclerosis without bone expansion.",
        associatedFindings": "Extramedullary haematopoiesis.",
        complicationsSeriousAlternatives: "Acute Leukaemia transformation.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Sclerotic Metastases",
        dominantImagingFinding: "MULTIPLE focal or diffuse blastic lesions. Loss of trabecular architecture.",
        distributionLocation: "Axial skeleton (Spine/Pelvis) in 90%.",
        demographicsClinicalContext: "Older adults. PROSTATE (80%), Breast, or Carcinoid.",
        discriminatingKeyFeature": "BLASTIC NODULAR lesions and elevated tumor markers (PSA).",
        associatedFindings: "Bone scan 'Superscan' (absent kidneys).",
        complicationsSeriousAlternatives": "Spinal cord compression.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Paget's Disease",
        dominantImagingFinding: "Cortical thickening, trabecular coarsening, and BONE ENLARGEMENT (100%).",
        distributionLocation: "Asymmetric. Pelvis, skull, spine.",
        demographicsClinicalContext: "Older adults (>55y). Pain or increasing hat size.",
        discriminatingKeyFeature": "BONE ENLARGEMENT and PICTURE-FRAME vertebra.",
        associatedFindings": "Blade of grass sign. Elevated Alk Phos.",
        complicationsSeriousAlternatives": "Osteosarcomatous transformation.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "FOG MACHINES",
    pattern: "Multiple lucent bone lesions",
    expanded: "F: Fibrous dysplasia, O: Osteoblastoma, G: GCT, M: Myeloma/Metastasis, A: ABC, C: Chondromyxoid fibroma, H: Hyperparathyroidism (Brown tumor), I: Infection, N: Non-ossifying fibroma, E: Enchondroma / EG (LCH), S: Solitary bone cyst",
    problemCluster: "lytic bone lesions",
    seriousAlternatives: ["Multiple Myeloma", "Lytic Metastases", "Gorham-Stout Disease"],
    differentials: [
      {
        diagnosis: "Multiple Myeloma",
        dominantImagingFinding: "PUNCHED-OUT lytic lesions (100%). Uniform size (1-2cm). Diffuse osteopenia.",
        distributionLocation: "Axial skeleton. SPARES THE PEDICLES (unlike metastases).",
        demographicsClinicalContext: "Adults (>50y). Bence-Jones protein (99%).",
        discriminatingKeyFeature: "PEDICLE SPARING and COLD BONE SCAN (70%). Punched-out skull lesions.",
        associatedFindings: "Plasmacytoma (solitary expansile lesion).",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis": true
      },
      {
        diagnosis: "Metastases (Lytic)",
        dominantImagingFinding: "AGGRESSIVE lytic destruction. Disparate sizes. Ill-defined margins.",
        distributionLocation: "Axial skeleton. Characteristically involves PEDICLES.",
        demographicsClinicalContext: "Older adults. Known primary (Lung, Breast, Kidney).",
        discriminatingKeyFeature: "PEDICLE DESTRUCTION and HOT BONE SCAN (90%).",
        associatedFindings": "Vertebral collapse (vertebra plana).",
        complicationsSeriousAlternatives": "Spinal instability.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Fibrous Dysplasia",
        dominantImagingFinding: "GROUND-GLASS matrix (100%). Thick sclerotic 'rind'.",
        distributionLocation: "Long bones (Femur - Shepherd's Crook) and Craniofacial.",
        demographicsClinicalContext: "Young adults (<30y). McCune-Albright Syndrome.",
        discriminatingKeyFeature: "GROUND-GLASS appearance and RIND sign.",
        associatedFindings: "Endosteal scalloping.",
        complicationsSeriousAlternatives: "Sarcomatous transformation.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Brown Tumours (HPT)",
        dominantImagingFinding: "EXPANSILE lytic lesions. No matrix mineralisation. No rim.",
        distributionLocation: "Random. Hands (phalanges), Pelvis, Ribs.",
        demographicsClinicalContext: "Chronic Renal Failure. High PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION (middle phalanges) - pathognomonic.",
        associatedFindings": "Rugger-Jersey spine.",
        complicationsSeriousAlternatives": "Fractures through the Brown tumours.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Langerhans Cell Histiocytosis (LCH)",
        dominantImagingFinding: "Punched-out lytic lesions. BEVELLED EDGE in skull.",
        distributionLocation: "Skull, pelvis, femur.",
        demographicsClinicalContext: "Children (Peak 5-15y). Bone pain.",
        discriminatingKeyFeature: "BEVELLED EDGE and BUTTON SEQUESTRUM in skull.",
        associatedFindings": "Vertebra plana.",
        complicationsSeriousAlternatives: "Systemic disease.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Osteoblastoma",
        dominantImagingFinding: "LARGE expansile lytic lesion (>2cm). Matrix calcification (50%).",
        distributionLocation: "POSTERIOR ELEMENTS of spine (40%).",
        demographicsClinicalContext: "Young adults. Chronic pain.",
        discriminatingKeyFeature": "POSTERIOR SPINE location and large size.",
        associatedFindings": "Surrounding oedema.",
        complicationsSeriousAlternatives": "Malignant transformation.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Chondromyxoid Fibroma (CMF)",
        dominantImagingFinding: "Eccentric, expansile lytic. Scalloped margin.",
        distributionLocation: "Metaphyseal (Proximal tibia 50%).",
        demographicsClinicalContext: "Young adults.",
        discriminatingKeyFeature": "HEAVILY SCALLOPED sclerotic border.",
        associatedFindings": "Cortical expansion.",
        complicationsSeriousAlternatives": "ABC mimic.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Infection (Brodie Abscess)",
        dominantImagingFinding: "Lytic tract crossing physis. Thick sclerotic rim.",
        distributionLocation: "Metadiaphyseal.",
        demographicsClinicalContext: "Subacute pain.",
        discriminatingKeyFeature": "PENUMBRA SIGN on MRI.",
        associatedFindings": "Soft tissue abscess.",
        complicationsSeriousAlternatives": "Growth plate arrest.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Non-Ossifying Fibroma (NOF)",
        dominantImagingFinding: "Eccentric lytic. Scalloped sclerotic border.",
        distributionLocation: "Distal femur / Proximal tibia.",
        demographicsClinicalContext: "Children. Asymptomatic.",
        discriminatingKeyFeature": "ASYMPTOMATIC incidental finding in a child.",
        associatedFindings": "Migrates away from physis.",
        complicationsSeriousAlternatives": "Fracture.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Enchondroma",
        dominantImagingFinding: "Lytic lesion with RINGS AND ARCS calcification.",
        distributionLocation: "Small bones of hands/feet (50%).",
        demographicsClinicalContext: "Any age. Incidental.",
        discriminatingKeyFeature": "CHONDROID MATRIX (Rings/Arcs) calcification.",
        associatedFindings": "Endosteal scalloping (<50%).",
        complicationsSeriousAlternatives": "Chondrosarcoma.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Solitary Bone Cyst (SBC)",
        dominantImagingFinding: "Central lytic. Truncated cone shape.",
        distributionLocation: "Proximal humerus/femur.",
        demographicsClinicalContext: "Children (5-15y).",
        discriminatingKeyFeature": "FALLEN FRAGMENT SIGN (100% specific).",
        associatedFindings": "Pathological fracture.",
        complicationsSeriousAlternatives": "Recurrent fractures.",
        isCorrectDiagnosis": false
      }
    ]
  }
];

async function main() {
  console.log("Seeding final completion batch v2...");
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