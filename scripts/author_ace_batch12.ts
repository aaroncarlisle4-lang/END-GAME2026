import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_12_DATA = [
  {
    pattern: "VERTEBRAL BODY ENLARGEMENT",
    itemNumber: "2.5",
    problemCluster: "big vertebra",
    seriousAlternatives: ["Paget's Disease", "Haemangioma", "Acromegaly"],
    differentials: [
      {
        diagnosis: "Paget's Disease (Spine)",
        dominantImagingFinding: "Cortical thickening and coarse trabeculation leading to BONE ENLARGEMENT. 'PICTURE-FRAME' appearance.",
        distributionLocation: "Typically involves the entire vertebral body and posterior elements.",
        demographicsClinicalContext: "Elderly patients. High serum Alkaline Phosphatase.",
        discriminatingKeyFeature: "BONE EXPANSION and PICTURE-FRAME sign. Unlike haemangioma, there is overall bone size increase.",
        associatedFindings: "Sclerotic (Ivory) vertebra phase.",
        complicationsSeriousAlternatives: "Spinal stenosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Vertebral Haemangioma",
        dominantImagingFinding: "Prominent vertical striations ('CORDUROY CLOTH'). No bone expansion.",
        distributionLocation: "Vertebral body focus. Often T-spine.",
        demographicsClinicalContext: "Incidental finding in adults.",
        discriminatingKeyFeature: "LACK OF EXPANSION and POLKA-DOT sign on CT. Bright on both T1 and T2 MRI.",
        associatedFindings: "Usually solitary.",
        complicationsSeriousAlternatives: "None (usually).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Acromegaly",
        dominantImagingFinding: "Increased sagittal diameter of the vertebral bodies. POSTERIOR SCALLOPING.",
        distributionLocation: "Generalized spinal involvement.",
        demographicsClinicalContext: "Growth hormone excess. Large hands/feet and coarse facies.",
        discriminatingKeyFeature: "POSTERIOR SCALLOPING and increased AP diameter. Associated with heel pad thickening (>25mm).",
        associatedFindings: "Splayed teeth.",
        complicationsSeriousAlternatives: "Visual field loss.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "G ASTRIC ULCERATION",
    itemNumber: "6.11",
    problemCluster: "stomach ulcer",
    seriousAlternatives: ["Benign Peptic Ulcer", "Malignant Gastric Ulcer (Adeno)", "Leiomyoma (Degenerating)"],
    differentials: [
      {
        diagnosis: "Benign Peptic Ulcer",
        dominantImagingFinding: "Ulcer niche projecting BEYOND the gastric lumen. Smooth, radiating mucosal folds to the edge.",
        distributionLocation: "Lesser curve focus (90%).",
        demographicsClinicalContext: "History of NSAID use or H. pylori. Epigastric pain relieved by food.",
        discriminatingKeyFeature: "PROJECTS BEYOND LUMEN and HAMPTON'S LINE (1mm lucent line at the neck). Radiating folds are smooth.",
        associatedFindings: "Gastritis.",
        complicationsSeriousAlternatives: "Perforation (free gas).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Malignant Gastric Ulcer",
        dominantImagingFinding: "Ulcer niche within a soft tissue mass. Does NOT project beyond the expected lumen. 'CARMAN MENISCUS' sign.",
        distributionLocation: "Greater curve common. Anywhere.",
        demographicsClinicalContext: "Older adults. Weight loss and anorexia.",
        discriminatingKeyFeature: "WITHIN THE LUMEN: The ulcer is 'excavated' into a mass. CARMAN MENISCUS sign: Ulcer is convex towards the lumen.",
        associatedFindings: "Linitis plastica elsewhere.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "PANCREATIC MASS",
    itemNumber: "7.31",
    problemCluster: "pancreatic solid mass",
    seriousAlternatives: ["Pancreatic Adenocarcinoma", "Neuroendocrine Tumor (NET)", "Pancreatic Lymphoma", "Solid Pseudopapillary Neoplasm"],
    differentials: [
      {
        diagnosis: "Pancreatic Adenocarcinoma",
        dominantImagingFinding: "Poorly enhancing, ill-defined solid mass. Characteristically HYPOVASCULAR on arterial phase CT.",
        distributionLocation: "Pancreatic HEAD (65%).",
        demographicsClinicalContext: "Elderly smokers. Painless jaundice (Courvoisier law). Weight loss.",
        discriminatingKeyFeature: "HYPOVASCULAR and DOUBLE-DUCT SIGN: Dilatation of both the CBD and Pancreatic duct. Encases the SMA/Celiac axis.",
        associatedFindings: "Distal pancreatic atrophy and liver metastases.",
        complicationsSeriousAlternatives: "Biliary obstruction.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Neuroendocrine Tumor (e.g. Insulinoma/Gastrinoma)",
        dominantImagingFinding: "Intensely and uniformly ENHANCING solid mass. HYPERVASCULAR on arterial phase.",
        distributionLocation: "Anywhere in the pancreas. Often small.",
        demographicsClinicalContext: "MEN 1 syndrome association. Functional (Hypoglycaemia) or non-functional.",
        discriminatingKeyFeature: "HYPERVASCULARITY: NETs are bright on arterial phase; Adenocarcinomas are dark. Lacks the double-duct sign usually.",
        associatedFindings: "Liver metastases (also hypervascular).",
        complicationsSeriousAlternatives: "Hormonal syndromes.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pancreatic Lymphoma",
        dominantImagingFinding: "Large, homogeneous solid mass. Spares the pancreatic duct (No dilatation).",
        distributionLocation: "Head common.",
        demographicsClinicalContext: "Adults. B-symptoms.",
        discriminatingKeyFeature: "LACK OF DUCTAL DILATATION: Unlike cancer, lymphoma wraps around the duct without causing high-grade obstruction. Bulky retroperitoneal nodes.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "Systemic NHL.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "STELLATE BREAST LESION",
    itemNumber: "10.4",
    problemCluster: "spiculated breast mass",
    seriousAlternatives: ["Invasive Ductal Carcinoma (IDC)", "Radial Scar", "Surgical Scar", "Fat Necrosis"],
    differentials: [
      {
        diagnosis: "Invasive Ductal Carcinoma (IDC)",
        dominantImagingFinding: "Irregular, high-density mass with central core and radiating SPICULES. Distorts normal architecture.",
        distributionLocation: "Anywhere in the breast.",
        demographicsClinicalContext: "Adult females. Hard, fixed lump on exam.",
        discriminatingKeyFeature: "CENTRAL CORE: Malignant spiculation has a dense, solid center. Spicules are usually short and thick.",
        associatedFindings: "Pleomorphic microcalcifications (60%).",
        complicationsSeriousAlternatives: "Axillary node involvement.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Radial Scar (Complex Sclerosing Lesion)",
        dominantImagingFinding: "Architechtural distortion with long, fine spicules. Characteristically LACKS a central mass/core.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "Asymptomatic. Screen-detected.",
        discriminatingKeyFeature: "LACK OF CORE: The center of the lesion is often lucent or contains fat. Spicules are longer and thinner than IDC.",
        associatedFindings: "No associated calcification usually.",
        complicationsSeriousAlternatives: "Association with ADH or low-grade malignancy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Surgical Scar",
        dominantImagingFinding: "Stellate lesion at the site of prior surgery. Diminishes in density over time.",
        distributionLocation: "At the site of a prior biopsy or lumpectomy.",
        demographicsClinicalContext: "Known surgical history.",
        discriminatingKeyFeature: "TEMPORAL CHANGE: Scars become smaller and less dense on follow-up. IDC grows. Skin scar often visible.",
        associatedFindings: "Surgical clips.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Fat Necrosis",
        dominantImagingFinding: "Stellate lesion or oil cyst. Central lucency (Fat).",
        distributionLocation: "Subareolar or site of trauma.",
        demographicsClinicalContext: "Prior trauma or surgery.",
        discriminatingKeyFeature: "FAT DENSITY: Presence of internal fat (-100 HU or lucent on mammogram) is diagnostic.",
        associatedFindings: "Eggshell calcification (late).",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "EXOPHTHALMOS",
    itemNumber: "11.3",
    problemCluster: "proptosis",
    seriousAlternatives: ["Thyroid Orbitopathy", "Orbital Pseudotumor", "Cavernous Haemangioma", "Carotid-Cavernous Fistula"],
    differentials: [
      {
        diagnosis: "Thyroid Orbitopathy (Graves’)",
        dominantImagingFinding: "Enlargement of the extraocular muscle bellies with SPARING OF THE TENDONS.",
        distributionLocation: "Bilateral and symmetric (usually). I'M SLOW (Inferior > Medial > Superior > Lateral).",
        demographicsClinicalContext: "Graves' disease symptoms. Painless proptosis and lid lag.",
        discriminatingKeyFeature: "TENDON SPARING and bilateral involvement. Most common cause of exophthalmos.",
        associatedFindings: "Increased retro-orbital fat.",
        complicationsSeriousAlternatives: "Optic nerve compression (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Orbital Pseudotumor",
        dominantImagingFinding: "Ill-defined enhancing mass involving the extraocular muscles AND their TENDONS.",
        distributionLocation: "Typically UNILATERAL.",
        demographicsClinicalContext: "Adults. ACUTE PAINFUL proptosis. Rapid response to steroids.",
        discriminatingKeyFeature: "TENDON INVOLVEMENT: Unlike Graves, the muscle insertion onto the globe is thickened. PAIN is a major feature.",
        associatedFindings: "Uveitis or Scleritis.",
        complicationsSeriousAlternatives: "Vision loss.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Carotid-Cavernous Fistula (CCF)",
        dominantImagingFinding: "Proptosis with a MASSIVELY DILATED SUPERIOR OPHTHALMIC VEIN.",
        distributionLocation: "Orbital veins focus.",
        demographicsClinicalContext: "Trauma history or spontaneous (post-menopausal). Pulsatile proptosis.",
        discriminatingKeyFeature: "DILATED SOV (>3-4mm) and enlarged cavernous sinus. Orbital bruit on auscultation.",
        associatedFindings: "Extraocular muscle swelling (due to congestion).",
        complicationsSeriousAlternatives: "Blindness from glaucoma.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "DESTRUCTION OF THE MAXILLARY SINUS WALLS",
    itemNumber: "11.11",
    problemCluster: "aggressive sinus lesion",
    seriousAlternatives: ["Sinonasal SCC", "Invasive Fungal Sinusitis", "Wegener's (GPA)", "Esthesioneuroblastoma"],
    differentials: [
      {
        diagnosis: "Sinonasal SCC",
        dominantImagingFinding: "Solid soft tissue mass with AGGRESSIVE, moth-eaten bone destruction.",
        distributionLocation: "Maxillary antrum (80%). Unilateral.",
        demographicsClinicalContext: "Older adults. Smokers or wood-dust exposure. Occult epistaxis.",
        discriminatingKeyFeature: "MASS EFFECT and AGGRESSIVE DESTRUCTION. 80% of all primary sinus malignancies.",
        associatedFindings: "Level II nodes.",
        complicationsSeriousAlternatives: "Invasion of the orbit or cribriform plate.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Invasive Fungal Sinusitis (Mucor)",
        dominantImagingFinding: "Aggressive destruction of the sinus walls. Characteristically CROSSES anatomic boundaries into the orbit/brain.",
        distributionLocation: "Ethmoid and Maxillary sinuses focus.",
        demographicsClinicalContext: "IMMUNOCOMPROMISED (Diabetic ketoacidosis, neutropenia). Extremely rapid progression.",
        discriminatingKeyFeature: "IMMUNOCOMPROMISE and RAPID progression (hours/days). Black eschar on the palate.",
        associatedFindings: "Cavernous sinus thrombosis.",
        complicationsSeriousAlternatives: "Death (FATAL within days).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Granulomatosis with Polyangiitis (GPA)",
        dominantImagingFinding: "Soft tissue thickening and bone destruction, often involving the NASAL SEPTUM.",
        distributionLocation: "Midline nasal cavity and sinuses. Bilateral.",
        demographicsClinicalContext: "Adults. c-ANCA positive. Renal disease.",
        discriminatingKeyFeature: "SEPTAL DESTRUCTION: GPA characteristically destroys the cartilaginous nasal septum (Saddle-nose deformity).",
        associatedFindings: "Lung nodules.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "B ILATERAL ELEVATED HEMIDIAPHRAGMS",
    itemNumber: "4.33",
    problemCluster: "low lung volumes",
    seriousAlternatives: ["Poor Inspiratory Effort", "Obesity", "Massive Ascites", "Pregnancy", "Fibrosis"],
    differentials: [
      {
        diagnosis: "Poor Inspiratory Effort (Splinting)",
        dominantImagingFinding: "Bilateral elevation of the diaphragms with associated BASAL ATELECTASIS.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Post-operative pain (upper GI surgery), rib fractures, or chest wall pain.",
        discriminatingKeyFeature: "TEMPORARY nature: Clears when the patient is able to take a deep breath. No intrinsic lung disease.",
        associatedFindings: "Basal linear opacities (Atelectasis).",
        complicationsSeriousAlternatives: "Pneumonia.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Massive Ascites",
        dominantImagingFinding: "Diaphragms pushed upwards by large volume of abdominal fluid.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Cirrhosis or ovarian cancer. Abdominal distension.",
        discriminatingKeyFeature: "ABDOMINAL SIGNS: US/CT shows massive fluid pushing the diaphragms. Associated with 'Bulging Flanks' on AXR.",
        associatedFindings: "Small pleural effusions (Sympathetic).",
        complicationsSeriousAlternatives: "None (related to chest).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Shrinking Lung Syndrome",
        dominantImagingFinding: "Extreme bilateral elevation of the diaphragms with marked volume loss. Normal lung parenchyma.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Patients with SLE (Systemic Lupus Erythematosus). Progressive dyspnoea.",
        discriminatingKeyFeature: "SLE HISTORY and lack of parenchymal fibrosis. Represents phrenic nerve or diaphragmatic muscle dysfunction.",
        associatedFindings: "Basal atelectasis.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 12 (20 items - PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_12_DATA) {
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
  console.log("Batch 12 complete!");
}

main().catch(console.error);