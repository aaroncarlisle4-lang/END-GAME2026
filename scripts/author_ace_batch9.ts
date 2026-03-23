import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_9_DATA = [
  {
    pattern: "ARACHNODACTYLY",
    itemNumber: "1.40",
    problemCluster: "long thin digits",
    seriousAlternatives: ["Marfan Syndrome", "Homocystinuria", "Ehlers-Danlos Syndrome", "MEN 2B"],
    differentials: [
      {
        diagnosis: "Marfan Syndrome",
        dominantImagingFinding: "Arachnodactyly (Metacarpal Index >8.4). Pectus excavatum/carinatum. Scoliosis.",
        distributionLocation: "Generalized connective tissue. Hands and feet focus.",
        demographicsClinicalContext: "Tall stature, long limbs, and lens dislocation (ectopia lentis - UPWARDS). AD inheritance (FBN1).",
        discriminatingKeyFeature: "UPWARD lens dislocation and AORTIC ROOT DILATATION. Normal IQ (unlike Homocystinuria).",
        associatedFindings: "Dural ectasia and protrusio acetabuli.",
        complicationsSeriousAlternatives: "Aortic dissection (Type A).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Homocystinuria",
        dominantImagingFinding: "Arachnodactyly with associated GENERALIZED OSTEOPOROSIS. High risk of thromboembolism.",
        distributionLocation: "Generalized skeleton.",
        demographicsClinicalContext: "AR inheritance. Intellectual disability and DOWNWARD lens dislocation.",
        discriminatingKeyFeature: "DOWNWARD lens dislocation and INTELLECTUAL DISABILITY. Significant osteoporosis (Marfan's usually has normal density).",
        associatedFindings: "Vascular occlusions (strokes).",
        complicationsSeriousAlternatives: "Pulmonary embolism and MI.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Ehlers-Danlos Syndrome",
        dominantImagingFinding: "Arachnodactyly with extreme JOINT LAXITY and skin hyperextensibility.",
        distributionLocation: "Joints focus.",
        demographicsClinicalContext: "Hyperflexible joints and fragile skin. Easy bruising.",
        discriminatingKeyFeature: "SKIN HYPEREXTENSIBILITY and multiple joint dislocations. Lacks the aortic root focus of Marfan's.",
        associatedFindings: "Subcutaneous calcified spherules.",
        complicationsSeriousAlternatives: "Arterial rupture (Vascular type).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M ULTIPLE COLLAPSED VERTEBRAE",
    itemNumber: "2.3",
    problemCluster: "multiple vertebral fractures",
    seriousAlternatives: ["Osteoporosis", "Multiple Myeloma", "Metastases", "Scheuermann Disease"],
    differentials: [
      {
        diagnosis: "Osteoporosis",
        dominantImagingFinding: "Multiple wedge-shaped anterior collapses. Diffuse sparse trabeculation. Preserved pedicles.",
        distributionLocation: "Thoracolumbar junction (T11-L2). Typically multiple levels.",
        demographicsClinicalContext: "Post-menopausal females or patients on chronic steroids.",
        discriminatingKeyFeature: "DIFFUSE OSTEOPENIA and preservation of the posterior elements (pedicles). Lack of soft tissue mass.",
        associatedFindings: "Codfish vertebrae (biconcave).",
        complicationsSeriousAlternatives: "Kyphosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multiple Myeloma",
        dominantImagingFinding: "Multiple collapses with associated focal 'PUNCHED-OUT' lytic lesions.",
        distributionLocation: "Axial skeleton (Skull, Spine, Pelvis).",
        demographicsClinicalContext: "Elderly. Bone pain and anaemia.",
        discriminatingKeyFeature: "PEDICLE SPARING early on. Marrow replacement on MRI (Low T1). Unlike osteoporosis, has discrete lytic defects.",
        associatedFindings: "Raindrop skull.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Scheuermann Disease",
        dominantImagingFinding: "Anterior wedging of at least 3 adjacent vertebrae (>5 degrees each). Irregular endplates.",
        distributionLocation: "Thoracic spine.",
        demographicsClinicalContext: "Adolescents. Kyphosis and back pain.",
        discriminatingKeyFeature: "SCHMORL'S NODES and increased AP diameter of vertebral bodies. Lacks the acute pain of fracture.",
        associatedFindings: "Limitation of extension.",
        complicationsSeriousAlternatives: "Premature OA.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "U NILATERAL ELEVATED HEMIDIAPHRAGM",
    itemNumber: "4.32",
    problemCluster: "elevated diaphragm",
    seriousAlternatives: ["Phrenic Nerve Palsy", "Eventration", "Volume Loss (Collapse)", "Subphrenic Abscess"],
    differentials: [
      {
        diagnosis: "Phrenic Nerve Palsy",
        dominantImagingFinding: "Smooth elevation of the entire hemidiaphragm. PARADOXICAL movement on sniffing.",
        distributionLocation: "Unilateral (affected side).",
        demographicsClinicalContext: "Adults. Post-surgical (Cardiac/Neck), or secondary to malignancy (Lung/Mediastinum).",
        discriminatingKeyFeature: "SNIFF TEST: The affected side moves UPWARDS during a quick inspiration (sniff), while the normal side moves down.",
        associatedFindings: "Hilar or apical lung mass (invading the nerve).",
        complicationsSeriousAlternatives: "Respiratory compromise.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Diaphragmatic Eventration",
        dominantImagingFinding: "Elevation of a segment (usually anterior) or the whole diaphragm. Smooth contour.",
        distributionLocation: "Right side > Left side. Usually anteromedial.",
        demographicsClinicalContext: "Asymptomatic incidental finding. Congenital focal thinning of the muscle.",
        discriminatingKeyFeature: "LOCALIZATION: Typically involves a part of the diaphragm (hump). Sniff test is often normal or slightly reduced.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Volume Loss (Lung Collapse)",
        dominantImagingFinding: "Diaphragm pulled upwards by lung collapse or fibrosis.",
        distributionLocation: "Ipsilateral to the lung pathology.",
        demographicsClinicalContext: "History of surgery (Pneumonectomy) or known collapse.",
        discriminatingKeyFeature: "MEDIASTINAL SHIFT: The heart and trachea are shifted TOWARDS the elevated diaphragm. Diaphragm is 'pulled' not 'paralyzed'.",
        associatedFindings: "Crowded ribs.",
        complicationsSeriousAlternatives: "Infection.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Subphrenic Abscess / Liver Mass",
        dominantImagingFinding: "Elevation of the diaphragm by an underlying abdominal mass or fluid collection.",
        distributionLocation: "Right side common (Subphrenic).",
        demographicsClinicalContext: "Fever and RUQ pain. Post-operative history.",
        discriminatingKeyFeature: "ABDOMINAL SIGNS: US/CT shows fluid or mass BENEATH the diaphragm pushing it up. Lung volume is normal.",
        associatedFindings: "Basal atelectasis and small pleural effusion.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "S PLENOMEGALY",
    itemNumber: "7.26",
    problemCluster: "enlarged spleen",
    seriousAlternatives: ["Portal Hypertension", "Lymphoma", "Leukaemia", "Myelofibrosis", "Malaria"],
    differentials: [
      {
        diagnosis: "Portal Hypertension",
        dominantImagingFinding: "Symmetrical splenic enlargement (>12-14cm). Dilated splenic and portal veins.",
        distributionLocation: "Spleen and portal system.",
        demographicsClinicalContext: "Chronic liver disease (Cirrhosis), Alcoholism, or Hepatitis.",
        discriminatingKeyFeature: "VARICES and ASCITES: Presence of portosystemic collaterals (e.g. Oesophageal, Paraumbilical) and shrunken liver.",
        associatedFindings: "Gamna-Gandy bodies (siderotic nodules) in the spleen (High T2/SWI).",
        complicationsSeriousAlternatives: "Variceal haemorrhage (EMERGENCY).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Myelofibrosis",
        dominantImagingFinding: "MASSIVE SPLENOMEGALY. Spleen often crosses the midline and extends into the pelvis.",
        distributionLocation: "Spleen and marrow.",
        demographicsClinicalContext: "Adults >50y. Dry marrow tap and tear-drop RBCs.",
        discriminatingKeyFeature: "SIZE and BONE SCLEROSIS: Myelofibrosis causes the most extreme splenomegaly. Associated with diffuse axial sclerosis.",
        associatedFindings: "Extramedullary haematopoiesis.",
        complicationsSeriousAlternatives: "Leukaemic transformation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Lymphoma (Splenic)",
        dominantImagingFinding: "Splenomegaly with or without discrete HYPODENSE NODULES. Focal masses.",
        distributionLocation: "Spleen and lymph nodes.",
        demographicsClinicalContext: "Adults. B-symptoms (fever, weight loss).",
        discriminatingKeyFeature: "NODULARITY: Presence of multiple hypodense lesions within the enlarged spleen is highly suggestive of lymphoma.",
        associatedFindings: "Bulky retroperitoneal and mesenteric nodes.",
        complicationsSeriousAlternatives: "Splenic rupture.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P ANCREATIC CALCIFICATION",
    itemNumber: "7.29",
    problemCluster: "pancreatic density",
    seriousAlternatives: ["Chronic Alcohol-induced Pancreatitis", "Cystic Fibrosis", "Hyperparathyroidism"],
    differentials: [
      {
        diagnosis: "Chronic Alcohol-induced Pancreatitis",
        dominantImagingFinding: "Coarse, clumped calcifications following the course of the pancreatic duct. Atrophic gland.",
        distributionLocation: "Diffuse (Head, Body, and Tail).",
        demographicsClinicalContext: "Adults with chronic alcohol abuse. Recurrent epigastric pain and steatorrhoea.",
        discriminatingKeyFeature: "DUCTAL distribution: Calcifications are within the ductal system. Associated with main duct dilatation.",
        associatedFindings: "Pseudocysts and fatty liver.",
        complicationsSeriousAlternatives: "Pancreatic Adenocarcinoma (4% risk).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Cystic Fibrosis (Pancreas)",
        dominantImagingFinding: "FATTY REPLACEMENT of the gland with small, punctate calcifications.",
        distributionLocation: "Diffuse fatty replacement.",
        demographicsClinicalContext: "Children/Young adults. Respiratory disease (bronchiectasis).",
        discriminatingKeyFeature: "FATTY ATROPHY: The pancreas is entirely replaced by fat (-100 HU). Calcifications are fine and stippled.",
        associatedFindings: "Upper lobe bronchiectasis and small GB.",
        complicationsSeriousAlternatives: "Diabetes mellitus.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Tropical Pancreatitis",
        dominantImagingFinding: "MASSIVE, large staghorn-like calcifications in the main pancreatic duct.",
        distributionLocation: "Main pancreatic duct focus.",
        demographicsClinicalContext: "Young patients from India/Africa. Malnutrition.",
        discriminatingKeyFeature: "LARGE SIZE of stones and young age. Not associated with alcohol.",
        associatedFindings: "Severe atrophy.",
        complicationsSeriousAlternatives: "Pancreatic CA.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "A DRENAL CALCIFICATION",
    itemNumber: "8.1",
    problemCluster: "adrenal density",
    seriousAlternatives: ["Old Haemorrhage", "Tuberculosis", "Neuroblastoma (Child)", "Phaeochromocytoma"],
    differentials: [
      {
        diagnosis: "Old Adrenal Haemorrhage",
        dominantImagingFinding: "Dense, focal or rim calcification in a normal-sized or small adrenal gland.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Incidental in adults. History of birth trauma or neonatal sepsis.",
        discriminatingKeyFeature: "STABILITY and lack of soft tissue mass. Haemorrhage is the most common cause of incidental adrenal calcification.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Adrenal Tuberculosis (Addison’s)",
        dominantImagingFinding: "Bilateral, diffuse, cloud-like calcifications. Adrenals are characteristically ATROPHIC.",
        distributionLocation: "Bilateral (90%).",
        demographicsClinicalContext: "Immigrants or immunocompromised. Adrenal insufficiency (Addison's Disease).",
        discriminatingKeyFeature: "BILATERAL ATROPHY and diffuse calcification. Addison's disease clinical signs (hyperpigmentation).",
        associatedFindings: "Lung TB scarring.",
        complicationsSeriousAlternatives: "Acute adrenal crisis (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Neuroblastoma (Calcified)",
        dominantImagingFinding: "Mass-like, stippled or coarse calcifications within a LARGE retroperitoneal mass.",
        distributionLocation: "Children <2y. Adrenal focus.",
        demographicsClinicalContext: "Sick child with palpable mass. High VMA.",
        discriminatingKeyFeature: "MASS EFFECT and calcification (90%). Crosses the midline and encases vessels.",
        associatedFindings: "Bone metastases.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "H YDROCEPHALUS",
    itemNumber: "12.14",
    problemCluster: "ventricular dilatation",
    seriousAlternatives: ["Communicating", "Non-communicating (Obstructive)", "Normal Pressure Hydrocephalus (NPH)", "Atrophy (Mimic)"],
    differentials: [
      {
        diagnosis: "Obstructive (Non-communicating)",
        dominantImagingFinding: "Dilatation of ventricles PROXIMAL to a site of obstruction. Normal distal ventricles.",
        distributionLocation: "Aqueduct, Foramen of Monro, or 4th ventricle outlet.",
        demographicsClinicalContext: "Acute raised ICP: Headache, vomiting, papilloedema.",
        discriminatingKeyFeature: "TRANS-EPENDYMAL OEDEMA (Periventricular low density) and bowed corpus callosum. Disproportionate dilatation.",
        associatedFindings: "Specific obstructing mass (e.g. Tectal glioma).",
        complicationsSeriousAlternatives: "Herniation (FATAL).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Normal Pressure Hydrocephalus (NPH)",
        dominantImagingFinding: "Ventricular dilatation with characteristically NARROW sulci at the vertex. DES-Sign.",
        distributionLocation: "Ventricles and Sylvian fissures.",
        demographicsClinicalContext: "Elderly. Triad: Wet (Incontinence), Wacky (Dementia), Wobbly (Ataxia).",
        discriminatingKeyFeature: "DES-SIGN (Disproportionate Enlargement of Subarachnoid Spaces): Sylvian fissures are wide but high-convexity sulci are TIGHT.",
        associatedFindings: "Upward bowing of the corpus callosum.",
        complicationsSeriousAlternatives: "Progressive dementia.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Atrophy (Hydrocephalus Ex-vacuo)",
        dominantImagingFinding: "Ventricular dilatation proportionate to the enlargement of the peripheral cortical sulci.",
        distributionLocation: "Global.",
        demographicsClinicalContext: "Elderly. Cognitive decline.",
        discriminatingKeyFeature: "WIDENED SULCI: Unlike true hydrocephalus, the sulci are deep and wide. No periventricular oedema.",
        associatedFindings: "Thinning of the gyri.",
        complicationsSeriousAlternatives: "None (related to ICP).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "INTRASELLAR MASS",
    itemNumber: "12.35",
    problemCluster: "sella mass",
    seriousAlternatives: ["Pituitary Adenoma", "Craniopharyngioma", "Rathke Cleft Cyst", "Meningioma"],
    differentials: [
      {
        diagnosis: "Pituitary Macroadenoma",
        dominantImagingFinding: "Solid mass arising from the gland. Intensely and uniformly enhancing. 'FIGURE-OF-EIGHT' shape.",
        distributionLocation: "Intrasellar extending to suprasellar.",
        demographicsClinicalContext: "Adults. Bitemporal hemianopia. Hormone excess (Prolactin).",
        discriminatingKeyFeature: "SELLA EXPANSION: The sella is always enlarged and the floor is often eroded. Rarely calcifies.",
        associatedFindings: "Cavernous sinus invasion (encasing ICA).",
        complicationsSeriousAlternatives: "Pituitary apoplexy (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Rathke Cleft Cyst",
        dominantImagingFinding: "Small, non-enhancing cyst between the anterior and posterior lobes. INTRA-CYSTIC NODULE.",
        distributionLocation: "Intrasellar (Pars intermedia).",
        demographicsClinicalContext: "Incidental in adults.",
        discriminatingKeyFeature: "WAXY INTRA-CYSTIC NODULE: A small T2-dark/T1-bright non-enhancing nodule within the cyst is diagnostic (75%).",
        associatedFindings: "No enhancement of the cyst wall.",
        complicationsSeriousAlternatives: "Visual loss (if large).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Empty Sella",
        dominantImagingFinding: "Sella filled with CSF. Pituitary gland is flattened against the floor.",
        distributionLocation: "Sella turcica.",
        demographicsClinicalContext: "Multiparous obese females. Associated with Idiopathic Intracranial Hypertension (IIH).",
        discriminatingKeyFeature: "CSF SIGNAL: The sella is not empty, but filled with CSF. Normal or enlarged sella size.",
        associatedFindings: "Vertical tortuosity of the optic nerves.",
        complicationsSeriousAlternatives: "CSF rhinorrhoea.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S YNDROMES AND BONE DYSPLASIAS WITH MULTIPLE FRACTURES",
    itemNumber: "14.13",
    problemCluster: "paediatric fractures",
    seriousAlternatives: ["NAI", "Osteogenesis Imperfecta", "Rickets", "Hypophosphatasia"],
    differentials: [
      {
        diagnosis: "Osteogenesis Imperfecta (OI)",
        dominantImagingFinding: "Multiple fractures of varying ages. GRACILE, thin bones. Profound osteopenia.",
        distributionLocation: "Generalized. Long bones and ribs.",
        demographicsClinicalContext: "Children. Blue sclerae, dentinogenesis imperfecta, and hearing loss.",
        discriminatingKeyFeature: "WORMIMAN BONES and BLUE SCLERAE. Type II is lethal. Lacks the metaphyseal corner fractures of NAI.",
        associatedFindings: "Popcorn calcification at epiphyses.",
        complicationsSeriousAlternatives: "Severe deformity and dwarfism.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Non-Accidental Injury (NAI)",
        dominantImagingFinding: "Fractures of different ages. METAPHYSEAL CORNER FRACTURES (CML). Posterior rib fractures.",
        distributionLocation: "Posterior ribs, Metaphyses, Skull, and Scapula.",
        demographicsClinicalContext: "Infants. Discrepancy between history and injury. Bruising.",
        discriminatingKeyFeature: "POSTERIOR RIB fractures and METAPHYSEAL BUCKET-HANDLE fractures. These are highly specific for abuse.",
        associatedFindings: "Subdural haematoma and retinal haemorrhages.",
        complicationsSeriousAlternatives: "Death (EMERGENCY).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hypophosphatasia (Infantile)",
        dominantImagingFinding: "Severe generalized osteopenia and 'FRAYED' metaphyses. Bowing and fractures.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Neonates/Infants. LOW serum Alkaline Phosphatase.",
        discriminatingKeyFeature: "LOW ALKALINE PHOSPHATASE: Unlike rickets (high) or NAI (normal), hypophosphatasia has pathologically low labs.",
        associatedFindings: "Cranial synostosis.",
        complicationsSeriousAlternatives: "Early childhood death.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C UPPING OF METAPHYSES",
    itemNumber: "14.22",
    problemCluster: "metaphyseal cupping",
    seriousAlternatives: ["Rickets", "Hypophosphatasia", "Scurvy", "Normal Variant"],
    differentials: [
      {
        diagnosis: "Rickets (Active Phase)",
        dominantImagingFinding: "Cupping, fraying, and WIDENING of the metaphyses. Widened physis.",
        distributionLocation: "Rapidly growing zones: Distal Radius/Ulna and Distal Femur.",
        demographicsClinicalContext: "Vitamin D deficiency or renal disease. Bowed legs.",
        discriminatingKeyFeature: "WIDENED PHYSIS and abnormal labs (High Alk Phos). Symmetrical.",
        associatedFindings: "Rachitic rosary (ribs).",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hypophosphatasia",
        dominantImagingFinding: "Severe cupping and irregular lucent defects. Mimics rickets but more aggressive.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Low Alk Phos labs.",
        discriminatingKeyFeature: "BIOCHEMISTRY: Low Alkaline Phosphatase is the key. Normal physis width in some variants.",
        associatedFindings: "Short limbs.",
        complicationsSeriousAlternatives: "Marrow failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Scurvy (Healing)",
        dominantImagingFinding: "Cupping of the metaphysis with a central 'TRUMMERFELD' zone of lucency.",
        distributionLocation: "Knee and wrist.",
        demographicsClinicalContext: "Malnourished infants. Painful, pseudo-paralysis.",
        discriminatingKeyFeature: "WIMBERGER RING (epiphysis) and FRANKEL LINE (dense zone of provisional calcification). Lacks the widened physis of rickets.",
        associatedFindings: "Pelkan spurs (lateral metaphyseal spurs).",
        complicationsSeriousAlternatives: "Subperiosteal haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "GYNAECOMASTIA",
    itemNumber: "10.13",
    problemCluster: "male breast enlargement",
    seriousAlternatives: ["Physiological", "Drug-induced", "Male Breast CA", "Cirrhosis"],
    differentials: [
      {
        diagnosis: "Physiological / Drug-induced",
        dominantImagingFinding: "Subareolar 'Flame-shaped' soft tissue density. Symmetrical or asymmetric.",
        distributionLocation: "Strictly SUBAREOLAR. Bilateral common.",
        demographicsClinicalContext: "Puberty, Senescence, or Drugs (Spironolactone, Digoxin, Marijuana).",
        discriminatingKeyFeature: "SUBAREOLAR location and symmetry. Smooth margins. No skin thickening or nodes.",
        associatedFindings: "History of drug use or Liver disease.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Male Breast Carcinoma",
        dominantImagingFinding: "ECCENTRIC, irregular solid mass. Spiculation and skin thickening.",
        distributionLocation: "Typically eccentric to the nipple (unlike gynaecomastia).",
        demographicsClinicalContext: "Older males (>60y). Hard, fixed lump. Nipple inversion.",
        discriminatingKeyFeature: "ECCENTRIC position and spiculation. Gynaecomastia is characteristically centered behind the nipple.",
        associatedFindings: "Axillary adenopathy.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pseudogynaecomastia",
        dominantImagingFinding: "Diffuse increase in breast size due to ADIPOSE tissue only. No subareolar glandular tissue.",
        distributionLocation: "Entire breast.",
        demographicsClinicalContext: "Obese males.",
        discriminatingKeyFeature: "PURE FAT density: No 'flame-shaped' glandular density behind the nipple. Soft on palpation.",
        associatedFindings: "Generalized obesity.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "T HORACIC AORTIC ANEURYSM",
    itemNumber: "5.16",
    problemCluster: "thoracic aneurysm",
    seriousAlternatives: ["Atherosclerotic Aneurysm", "Annulo-aortic Ectasia (Marfan)", "Mycotic Aneurysm", "Syphilitic Aortitis"],
    differentials: [
      {
        diagnosis: "Atherosclerotic Aneurysm",
        dominantImagingFinding: "Fusiform dilatation of the aorta. Extensive mural calcification and thrombus.",
        distributionLocation: "Descending aorta (most common site).",
        demographicsClinicalContext: "Elderly, smokers, and hypertensive patients.",
        discriminatingKeyFeature: "DESCENDING location and extensive CALCIFICATION. Associated with AAA.",
        associatedFindings: "Generalized atherosclerosis.",
        complicationsSeriousAlternatives: "Rupture (FATAL).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Annulo-aortic Ectasia (Marfan's)",
        dominantImagingFinding: "Pear-shaped dilatation of the AORTIC ROOT and SINUSES OF VALSALVA.",
        distributionLocation: "Ascending Aorta (Root focus).",
        demographicsClinicalContext: "Young adults with Marfan or Loeys-Dietz syndrome.",
        discriminatingKeyFeature: "PEAR-SHAPED configuration and root involvement. Typically lacks the wall calcification of atherosclerosis.",
        associatedFindings: "Aortic regurgitation and pectus excavatum.",
        complicationsSeriousAlternatives: "Type A Dissection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Syphilitic Aortitis",
        dominantImagingFinding: "Extensive linear calcification of the ASCENDING AORTIC WALL.",
        distributionLocation: "Ascending Aorta (Arch sparing).",
        demographicsClinicalContext: "Older adults with tertiary syphilis history.",
        discriminatingKeyFeature: "ASCENDING WALL calcification (Eggshell). Atherosclerosis rarely calcifies the ascending aorta without the arch.",
        associatedFindings: "Aortic regurgitation.",
        complicationsSeriousAlternatives: "Ostial coronary narrowing.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ORBITAL HYPEROSTOSIS",
    itemNumber: "11.8",
    problemCluster: "thickened orbital bone",
    seriousAlternatives: ["Sphenoid Wing Meningioma", "Fibrous Dysplasia", "Paget's Disease", "Prostate Metastasis"],
    differentials: [
      {
        diagnosis: "Sphenoid Wing Meningioma",
        dominantImagingFinding: "Intense, uniform thickening of the sphenoid wing. Associated EN-PLAQUE soft tissue enhancement.",
        distributionLocation: "Sphenoid wing and lateral orbital wall.",
        demographicsClinicalContext: "Middle-aged females. Proptosis and vision loss.",
        discriminatingKeyFeature: "EN-PLAQUE ENHANCEMENT: MRI shows an enhancing dural component. Unlike fibrous dysplasia, it is reactive bone.",
        associatedFindings: "Proptosis.",
        complicationsSeriousAlternatives: "Optic nerve compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Fibrous Dysplasia (Orbital)",
        dominantImagingFinding: "Bony expansion with GROUND-GLASS matrix. Well-defined.",
        distributionLocation: "Sphenoid, Frontal, or Ethmoid bones.",
        demographicsClinicalContext: "Children/Young adults. Asymptomatic or facial asymmetry.",
        discriminatingKeyFeature: "GROUND-GLASS matrix and absence of dural enhancement. Expands the bone rather than just thickening the cortex.",
        associatedFindings: "Leontiasis ossea (Lion face).",
        complicationsSeriousAlternatives: "Cranial nerve foramina narrowing.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sclerotic Metastasis (Prostate)",
        dominantImagingFinding: "Irregular, nodular bone thickening and sclerosis. Moth-eaten appearance.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "Older males with prostate CA.",
        discriminatingKeyFeature: "NODULARITY and known primary. Lacks the uniform ground-glass appearance of FD.",
        associatedFindings: "Hot bone scan.",
        complicationsSeriousAlternatives: "None (related to orbit).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P REVERTEBRAL SOFT-TISSUE MASS IN an ADULT ON LATERAL CERVICAL X-RAY",
    itemNumber: "11.16",
    problemCluster: "prevertebral thickening",
    seriousAlternatives: ["Retropharyngeal Abscess", "Retropharyngeal Cellulitis", "Vertebral Osteomyelitis", "Goitre"],
    differentials: [
      {
        diagnosis: "Retropharyngeal Abscess",
        dominantImagingFinding: "Marked prevertebral soft tissue thickening (>7mm at C2, >22mm at C6). FLUID-GAS LEVEL.",
        distributionLocation: "Prevertebral space focus.",
        demographicsClinicalContext: "Fever, neck stiffness (Meningismus), and odynophagia. Severe sepsis.",
        discriminatingKeyFeature: "FLUID-GAS LEVEL: Presence of gas within the soft tissues is pathognomonic for abscess. URGENT.",
        associatedFindings: "Loss of cervical lordosis.",
        complicationsSeriousAlternatives: "Mediastinitis (via danger space) and death.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acute Calcific Prevertebral Tendonitis",
        dominantImagingFinding: "Prevertebral thickening with an AMORPHOUS CALCIFICATION anterior to C1-C2.",
        distributionLocation: "Longus colli muscle (C1-C2).",
        demographicsClinicalContext: "Adults. Sudden onset severe neck pain and odynophagia. Normal markers.",
        discriminatingKeyFeature: "FOCAL CALCIFICATION at C1-C2 level within the longus colli muscle. Lacks the systemic sepsis of an abscess.",
        associatedFindings: "Effusion in the retropharyngeal space.",
        complicationsSeriousAlternatives: "None (Self-limiting).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Cervical Osteomyelitis / Discitis",
        dominantImagingFinding: "Prevertebral thickening associated with DISC SPACE NARROWING and endplate destruction.",
        distributionLocation: "Centered on the disc space.",
        demographicsClinicalContext: "IVDU, post-operative, or elderly. Chronic neck pain and fever.",
        discriminatingKeyFeature: "DISC DESTRUCTION: Abscesses spare the bone early; discitis rapidly destroys the intervertebral disc.",
        associatedFindings: "Epidural abscess.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M ULTIPLE RING-ENHANCING LESIONS",
    itemNumber: "12.22",
    problemCluster: "brain ring enhancement",
    seriousAlternatives: ["Metastases", "Abscesses", "Toxoplasmosis", "Multifocal GBM"],
    differentials: [
      {
        diagnosis: "Metastases",
        dominantImagingFinding: "Multiple, thin-walled ring-enhancing lesions at the GREY-WHITE junction. Profound vaseogenic oedema.",
        distributionLocation: "Grey-white junction (Watershed zones).",
        demographicsClinicalContext: "Older adults. Known primary (Lung, Breast, Melanoma).",
        discriminatingKeyFeature: "GREY-WHITE location and DISPROPORTIONATE oedema. Solid parts do not restrict on DWI.",
        associatedFindings: "Haemorrhage (Melanoma).",
        complicationsSeriousAlternatives: "Herniation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multiple Brain Abscesses",
        dominantImagingFinding: "Smooth, uniform ring enhancement. CENTRAL RESTRICTED DIFFUSION (High DWI).",
        distributionLocation: "Frontal/Temporal focus. Variable.",
        demographicsClinicalContext: "Septic source (Endocarditis, Cyanotic Heart Disease).",
        discriminatingKeyFeature: "CENTRAL DWI RESTRICTION (100% specific). Metastases usually have low/dark central signal on DWI.",
        associatedFindings: "Satellite lesions.",
        complicationsSeriousAlternatives: "Ventriculitis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Toxoplasmosis (HIV/AIDS)",
        dominantImagingFinding: "Multiple small ring-enhancing lesions. ECCENTRIC TARGET SIGN.",
        distributionLocation: "BASAL GANGLIA and Thalamus.",
        demographicsClinicalContext: "HIV positive with CD4 <100.",
        discriminatingKeyFeature: "ECCENTRIC TARGET sign and BASAL GANGLIA predilection. Response to anti-toxo treatment.",
        associatedFindings: "Absence of ependymal spread (unlike CNS lymphoma).",
        complicationsSeriousAlternatives: "Death.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 9 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_9_DATA) {
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
  console.log("Batch 9 Complete!");
}

main().catch(console.error);