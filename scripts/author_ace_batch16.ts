import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_16_DATA = [
  {
    pattern: "SYNDROMES AND BONE DYSPLASIAS ASSOCIATED WITH BOWING OF LONG BONES",
    itemNumber: "1.30",
    problemCluster: "bowed bones",
    seriousAlternatives: ["Rickets", "Paget's Disease", "Fibrous Dysplasia", "NF1 (Tibia)", "Osteogenesis Imperfecta"],
    differentials: [
      {
        diagnosis: "Rickets",
        dominantImagingFinding: "Symmetric bowing of long bones with associated METAPHYSEAL FRAYING and widening of the physis.",
        distributionLocation: "Generalized. Most evident in the lower limbs (Femur/Tibia).",
        demographicsClinicalContext: "Children. Vitamin D deficiency or renal disease. 'Rachitic Rosary'.",
        discriminatingKeyFeature: "WIDENED PHYSIS and cupping. Unlike other dysplasias, the growth plate itself is primary involved. Symmetrical.",
        associatedFindings: "Generalized osteopenia.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paget's Disease (Bowing)",
        dominantImagingFinding: "Lateral bowing of the femur or anterior bowing of the tibia. BONE ENLARGEMENT and cortical thickening.",
        distributionLocation: "Typically asymmetric (Monostotic or Polyostotic).",
        demographicsClinicalContext: "Elderly. High serum Alk Phos.",
        discriminatingKeyFeature: "BONE ENLARGEMENT: The bone is thicker and larger than normal. Lacks the growth plate involvement of rickets.",
        associatedFindings: "Picture-frame vertebrae and cotton-wool skull.",
        complicationsSeriousAlternatives: "Secondary OA.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Neurofibromatosis Type 1 (Tibia)",
        dominantImagingFinding: "Anterolateral bowing of the tibia. TIBIAL PSEUDARTHROSIS (100% specific).",
        distributionLocation: "Unilateral Tibia focus.",
        demographicsClinicalContext: "Children with skin café-au-lait spots.",
        discriminatingKeyFeature: "PSEUDARTHROSIS: Non-union of a tibial fracture in the distal third. 50% of tibial pseudarthrosis is due to NF1.",
        associatedFindings: "Fibula involvement.",
        complicationsSeriousAlternatives: "Non-union.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "T EMPORAL BONE FRACTURES",
    itemNumber: "11.20",
    problemCluster: "skull base trauma",
    seriousAlternatives: ["Longitudinal Fracture (80%)", "Transverse Fracture (20%)"],
    differentials: [
      {
        diagnosis: "Longitudinal Fracture",
        dominantImagingFinding: "Fracture line parallel to the long axis of the petrous pyramid. Involves the squamous part and EAC.",
        distributionLocation: "Squamous temporal bone and EAC.",
        demographicsClinicalContext: "Blunt lateral head trauma. Conductive hearing loss (common).",
        discriminatingKeyFeature: "PARALLEL to petrous axis. 80% of temporal fractures. Associated with OSSICULAR DISRUPTION and haemotympanum.",
        associatedFindings: "Disruption of the incudostapedial joint.",
        complicationsSeriousAlternatives: "Facial nerve palsy (20% - often delayed).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Transverse Fracture",
        dominantImagingFinding: "Fracture line perpendicular to the long axis of the petrous pyramid. CHARACTERISTICALLY INVOLVES THE OTIC CAPSULE.",
        distributionLocation: "Petrous pyramid focus. Across the IAC.",
        demographicsClinicalContext: "Blunt frontal or occipital trauma. Sensorineural hearing loss.",
        discriminatingKeyFeature: "OTIC CAPSULE INVOLVEMENT: Destroys the cochlea and vestibule. Higher risk of facial nerve injury (50% - immediate).",
        associatedFindings: "Pneumocephalus.",
        complicationsSeriousAlternatives: "Permanent SNHL and immediate facial nerve paralysis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "CHOL ESTEATOMA",
    itemNumber: "11.21",
    problemCluster: "middle ear mass",
    seriousAlternatives: ["Acquired Cholesteatoma", "Congenital Cholesteatoma", "Glomus Tympanicum (Mimic)"],
    differentials: [
      {
        diagnosis: "Acquired Cholesteatoma",
        dominantImagingFinding: "Soft tissue mass in the Prussak space. EROSION of the Scutum and Ossicles (Incus long process).",
        distributionLocation: "Attic (Epitympanum) focus.",
        demographicsClinicalContext: "History of chronic otitis media and retraction pockets. Foul-smelling discharge.",
        discriminatingKeyFeature: "SCUTUM EROSION: Blunting or destruction of the scutum is the earliest and most specific sign. Non-enhancing mass.",
        associatedFindings: "Labyrinthine fistula (usually lateral semi-circular canal).",
        complicationsSeriousAlternatives: "Intracranial abscess or meningitis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Congenital Cholesteatoma",
        dominantImagingFinding: "Well-circumscribed soft tissue mass behind an INTACT tympanic membrane.",
        distributionLocation: "Anterosuperior quadrant of the middle ear common.",
        demographicsClinicalContext: "Children. No history of ear infections or surgery.",
        discriminatingKeyFeature: "INTACT TM: Unlike acquired, the eardrum is normal. Mass is often more anterior.",
        associatedFindings: "Ossicular displacement.",
        complicationsSeriousAlternatives: "Hearing loss.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Glomus Tympanicum",
        dominantImagingFinding: "Intensely ENHANCING soft tissue mass on the promontory.",
        distributionLocation: "Middle ear promontory focus.",
        demographicsClinicalContext: "Adults with pulsatile tinnitus.",
        discriminatingKeyFeature: "VASCULAR ENHANCEMENT: Cholesteatomas do not enhance; Glomus tumors are highly vascular. Bright red mass on otoscopy.",
        associatedFindings: "None early.",
        complicationsSeriousAlternatives: "Facial nerve palsy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PHOTOPENIC AREAS (DEFECTS) ON BONE SCANS",
    itemNumber: "1.45",
    problemCluster: "cold bone scan",
    seriousAlternatives: ["Multiple Myeloma (70%)", "Renal Cell Carcinoma Mets", "Early AVN", "Infarction"],
    differentials: [
      {
        diagnosis: "Multiple Myeloma (Cold lesions)",
        dominantImagingFinding: "Photopenic (COLD) defects in the axial skeleton. Characteristically 'punched-out' on X-ray.",
        distributionLocation: "Skull, Spine, and Pelvis.",
        demographicsClinicalContext: "Elderly. B-symptoms and Bence-Jones proteinuria.",
        discriminatingKeyFeature: "70% COLD: Unlike most bone-forming metastases, myeloma is often cold on Tc-99m MDP scans. Needs MRI or skeletal survey.",
        associatedFindings: "Generalized osteopenia.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Early Avascular Necrosis (AVN)",
        dominantImagingFinding: "Photopenic defect in the center of the femoral head or other joint.",
        distributionLocation: "Epiphyses of weight-bearing joints.",
        demographicsClinicalContext: "Steroids, alcohol, or trauma history.",
        discriminatingKeyFeature: "EARLY PHASE: In the first 24-48h of ischaemia, the scan is cold. Later, it becomes 'hot' due to revascularization.",
        associatedFindings: "Double-line sign on MRI.",
        complicationsSeriousAlternatives: "Joint collapse.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Acute Bone Infarction",
        dominantImagingFinding: "Central photopenic defect in the diaphysis/metaphysis.",
        distributionLocation: "Long bones focus.",
        demographicsClinicalContext: "Sickle Cell Disease or Gaucher Disease.",
        discriminatingKeyFeature: "CENTRAL COLD ZONE: Represents the area of acute ischaemia. Differentiates from osteomyelitis (which is usually 'hot').",
        associatedFindings: "H-shaped vertebrae.",
        complicationsSeriousAlternatives: "Pain crisis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PNEUMONIA INVOLVING PART OR THE WHOLE OF ONE LOBE",
    itemNumber: "4.8",
    problemCluster: "lobar consolidation",
    seriousAlternatives: ["Streptococcus pneumoniae (Pneumococcus)", "Klebsiella pneumoniae", "Mycoplasma", "Legionella"],
    differentials: [
      {
        diagnosis: "Streptococcal Pneumonia (Pneumococcus)",
        dominantImagingFinding: "Homogeneous consolidation with air bronchograms. Characteristically SPARES the airway calibre (no volume loss).",
        distributionLocation: "Lobar or segmental. Lower lobes common.",
        demographicsClinicalContext: "Most common cause of community-acquired pneumonia (CAP). Sudden onset fever/chills.",
        discriminatingKeyFeature: "ABENCE OF BULGING FISSURE: Typically respects the lobe boundaries but does not expand them (unlike Klebsiella).",
        associatedFindings: "Parapneumonic effusion (40%).",
        complicationsSeriousAlternatives: "Lung abscess (rare).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Klebsiella Pneumonia",
        dominantImagingFinding: "Dense consolidation characteristically involving the UPPER LOBES with a BULGING FISSURE.",
        distributionLocation: "Right Upper Lobe predominance.",
        demographicsClinicalContext: "Alcoholics, elderly, or debilitated patients. 'Currant jelly' sputum.",
        discriminatingKeyFeature: "BULGING FISSURE sign: The massive inflammatory exudate expands the lobe and pushes the fissure. High risk of necrosis.",
        associatedFindings: "Early cavitation/abscess formation.",
        complicationsSeriousAlternatives: "Pulmonary gangrene (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Staphylococcal Pneumonia",
        dominantImagingFinding: "Patchy consolidation that rapidly progresses to ABSCESSES and PNEUMATOCELES.",
        distributionLocation: "Multifocal and bilateral.",
        demographicsClinicalContext: "Post-influenza or IVDU. Children.",
        discriminatingKeyFeature: "PNEUMATOCELES: Rapid appearance of thin-walled air-filled cysts within consolidation is highly suggestive of Staph.",
        associatedFindings: "Empyema and pneumothorax.",
        complicationsSeriousAlternatives: "Septic shock.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 16 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_16_DATA) {
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
  console.log("Batch 16 Complete!");
}

main().catch(console.error);