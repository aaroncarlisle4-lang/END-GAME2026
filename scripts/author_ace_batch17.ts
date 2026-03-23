import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_17_DATA = [
  {
    pattern: "GENERALIZED OSTEOPENIA",
    itemNumber: "1.20",
    problemCluster: "diffuse bone loss",
    seriousAlternatives: ["Osteoporosis", "Osteomalacia", "Hyperparathyroidism", "Multiple Myeloma"],
    differentials: [
      {
        diagnosis: "Osteoporosis",
        dominantImagingFinding: "Thinning of the cortex and sparse but sharp trabeculae. NO loss of mineralization.",
        distributionLocation: "Generalized. Axial skeleton focus.",
        demographicsClinicalContext: "Post-menopausal females or elderly males. Chronic steroids.",
        discriminatingKeyFeature: "SHARP TRABECULAE: Unlike osteomalacia, the remaining trabeculae are well-defined. Normal blood chemistry (Ca/PO4/Alk Phos).",
        associatedFindings: "Vertebral compression fractures and biconcave (codfish) vertebrae.",
        complicationsSeriousAlternatives: "Hip fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteomalacia (Adult Rickets)",
        dominantImagingFinding: "Blurred, 'fuzzy' trabeculae and thin, ill-defined cortices. Loss of mineralization.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Vitamin D deficiency or malabsorption. Bone pain and muscle weakness.",
        discriminatingKeyFeature: "LOOSER'S ZONES (Pseudofractures): Transverse lucent bands perpendicular to the cortex (e.g. Scapula, Pubic rami, Femoral neck).",
        associatedFindings: "Protrusio acetabuli and triradiate pelvis.",
        complicationsSeriousAlternatives: "Pathological fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hyperparathyroidism",
        dominantImagingFinding: "Generalized osteopenia with subperiosteal resorption and brown tumors.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Renal failure or parathyroid adenoma. High PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION (Radial side 2nd/3rd middle phalanges) and salt-and-pepper skull.",
        associatedFindings: "Resorption of the distal clavicles.",
        complicationsSeriousAlternatives: "Nephrocalcinosis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M ULTIPLE WORMIAN BONES",
    itemNumber: "14.67",
    problemCluster: "skull ossicles",
    seriousAlternatives: ["Osteogenesis Imperfecta", "Cleidocranial Dysostosis", "Pyknodysostosis", "Hypothyroidism"],
    differentials: [
      {
        diagnosis: "Osteogenesis Imperfecta (OI)",
        dominantImagingFinding: "Innumerable Wormian bones giving a 'MOSAIC' appearance to the skull vault.",
        distributionLocation: "Skull sutures (Lambdoid common).",
        demographicsClinicalContext: "Children. Blue sclerae and multiple fractures.",
        discriminatingKeyFeature: "BLUE SCLERAE and MOSAIC skull. Bones are thin and gracile.",
        associatedFindings: "Basilar invagination.",
        complicationsSeriousAlternatives: "Deafness.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Cleidocranial Dysostosis",
        dominantImagingFinding: "Multiple Wormian bones associated with absent or hypoplastic CLAVICLES.",
        distributionLocation: "Skull and Clavicles.",
        demographicsClinicalContext: "Short stature. Persistent open fontanelles.",
        discriminatingKeyFeature: "ABSENT CLAVICLES and supernumerary teeth. 100% specific association.",
        associatedFindings: "Widened symphysis pubis.",
        complicationsSeriousAlternatives: "Dental anomalies.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pyknodysostosis",
        dominantImagingFinding: "Wormian bones with generalized OSTEOSCLEROSIS (Marble bone).",
        distributionLocation: "Generalized skeleton.",
        demographicsClinicalContext: "Short stature and acro-osteolysis.",
        discriminatingKeyFeature: "SCLEROSIS and ACRO-OSTEOLYSIS. Unlike OI or Cleidocranial, the bones are extremely dense.",
        associatedFindings: "Obtuse mandibular angle.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P RIMARY RENAL NEOPLASMS IN CHILDHOOD",
    itemNumber: "14.51",
    problemCluster: "paediatric renal tumor",
    seriousAlternatives: ["Wilms Tumor (85%)", "Mesoblastic Nephroma (Neonate)", "Clear Cell Sarcoma", "Rhabdoid Tumor"],
    differentials: [
      {
        diagnosis: "Wilms Tumor (Nephroblastoma)",
        dominantImagingFinding: "Large solid renal mass. CLAW SIGN (Renal origin). Spares vessels.",
        distributionLocation: "Renal parenchyma. Displaces but rarely encases vessels.",
        demographicsClinicalContext: "Peak age 3-4 years. Rarely neonates. Palpable mass.",
        discriminatingKeyFeature: "CLAW SIGN and absence of calcification (15% only). Most common renal tumor in childhood.",
        associatedFindings: "IVC tumor thrombus (20%) and lung metastases.",
        complicationsSeriousAlternatives: "Rupture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Congenital Mesoblastic Nephroma",
        dominantImagingFinding: "Solid renal mass indistinguishable from Wilms.",
        distributionLocation: "Renal.",
        demographicsClinicalContext: "NEONATES (<3 months). Most common renal tumor in the first month of life.",
        discriminatingKeyFeature: "AGE: Any solid renal mass in a neonate is Mesoblastic Nephroma until proven otherwise. Wilms is rare before 1y.",
        associatedFindings: "Polyhydramnios in utero.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Clear Cell Sarcoma of the Kidney (CCSK)",
        dominantImagingFinding: "Solid renal mass with a high propensity for BONE METASTASES.",
        distributionLocation: "Renal.",
        demographicsClinicalContext: "Children 1-4 years.",
        discriminatingKeyFeature: "BONE METASTASES: Unlike Wilms (which goes to lungs), CCSK characteristically spreads to the skeleton. 'Bone-seeking' tumor.",
        associatedFindings: "Lytic bone lesions.",
        complicationsSeriousAlternatives: "Early death.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Rhabdoid Tumor of the Kidney (RTK)",
        dominantImagingFinding: "Aggressive mass with subcapsular fluid collections. Strong association with BRAIN tumors.",
        distributionLocation: "Renal.",
        demographicsClinicalContext: "Infants (<1y). Very poor prognosis.",
        discriminatingKeyFeature: "BRAIN TUMORS: Synchronous or metachronous posterior fossa tumors (ATRT). Extremely aggressive.",
        associatedFindings: "Subcapsular haemorrhage.",
        complicationsSeriousAlternatives: "Rapid dissemination.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "INTERSTITIAL LUNG DISEASE IN AN INFANT",
    itemNumber: "4.17",
    problemCluster: "ChILD",
    seriousAlternatives: ["Neuroendocrine Cell Hyperplasia (NEHI)", "Surfactant Protein Deficiency", "Pulmonary Interstitial Glycogenosis (PIG)"],
    differentials: [
      {
        diagnosis: "NEHI (Neuroendocrine Cell Hyperplasia)",
        dominantImagingFinding: "Ground-glass opacities characteristically involving the RIGHT MIDDLE LOBE and LINGULA.",
        distributionLocation: "RML, Lingula, and perihilar regions.",
        demographicsClinicalContext: "Infants (<2y) with persistent tachypnoea and crackles. Good prognosis.",
        discriminatingKeyFeature: "GEOGRAPHIC GGO in the RML/Lingula. MRI/CT shows air trapping. Diagnosis confirmed by biopsy or characteristic clinical course.",
        associatedFindings: "Hyperinflation.",
        complicationsSeriousAlternatives: "None (usually regresses).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Surfactant Protein Deficiency (e.g. ABCA3)",
        dominantImagingFinding: "Diffuse, persistent ground-glass opacities and progressive fibrosis.",
        distributionLocation: "Generalized and symmetric.",
        demographicsClinicalContext: "Full-term neonates or infants with refractory respiratory failure. Family history.",
        discriminatingKeyFeature: "PERSISTENCE: Unlike TTN or infection, the GGOs never clear and progress to ILD. Full-term neonate context.",
        associatedFindings: "Consolidation and cysts later.",
        complicationsSeriousAlternatives: "Respiratory failure requiring transplant.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pulmonary Interstitial Glycogenosis (PIG)",
        dominantImagingFinding: "Diffuse ground-glass opacities. Normal heart size.",
        distributionLocation: "Diffuse.",
        demographicsClinicalContext: "Neonates with respiratory distress immediately after birth. Often associated with CHD.",
        discriminatingKeyFeature: "RESPONSE to steroids: PIG often shows rapid clinical improvement with corticosteroid therapy.",
        associatedFindings: "Pulmonary hypertension.",
        complicationsSeriousAlternatives: "Hypoxia.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C OMMUNICATING HYDROCEPHALUS",
    itemNumber: "12.15",
    problemCluster: "communicating hydrocephalus",
    seriousAlternatives: ["Post-meningitic", "Post-haemorrhagic (SAH)", "Normal Pressure Hydrocephalus (NPH)"],
    differentials: [
      {
        diagnosis: "Post-SAH Hydrocephalus",
        dominantImagingFinding: "Global ventricular dilatation including the 4th ventricle. Dilated basal cisterns.",
        distributionLocation: "Global ventricular system.",
        demographicsClinicalContext: "Follows aneurysmal SAH (days to weeks). Headache and cognitive drop.",
        discriminatingKeyFeature: "SAH HISTORY: Presence of residual blood or a known history of subarachnoid haemorrhage. All 4 ventricles are enlarged.",
        associatedFindings: "Berry aneurysm (if acute).",
        complicationsSeriousAlternatives: "Permanent cognitive deficit.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Normal Pressure Hydrocephalus (NPH)",
        dominantImagingFinding: "Ventricular dilatation with NARROW sulci at the vertex. Wide Sylvian fissures.",
        distributionLocation: "Ventricles and Sylvian fissures focus.",
        demographicsClinicalContext: "Elderly. Triad: Incontinence, Dementia, and Gait disturbance (Wet, Wacky, Wobbly).",
        discriminatingKeyFeature: "DISPROPORTIONATE sulcal narrowing at the vertex (DES-Sign). Response to shunt/LP drainage.",
        associatedFindings: "Upward bowing of the corpus callosum.",
        complicationsSeriousAlternatives: "Progressive dementia.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Post-Meningitic Hydrocephalus",
        dominantImagingFinding: "Ventricular dilatation with associated LEPTOMENINGEAL ENHANCEMENT early on.",
        distributionLocation: "Global.",
        demographicsClinicalContext: "History of meningitis (especially TB or Neonatal).",
        discriminatingKeyFeature: "LEPTOMENINGEAL ENHANCEMENT: Thick enhancement of the basal cisterns and sulci in the acute/subacute phase.",
        associatedFindings: "Infarcts (from vasculitis).",
        complicationsSeriousAlternatives: "Cranial nerve palsies.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 17 (20 items - PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_17_DATA) {
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
  console.log("Part 1 complete!");
}

main().catch(console.error);