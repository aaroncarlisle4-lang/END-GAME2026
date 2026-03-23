import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_10_DATA = [
  {
    pattern: "WIDE OR THICK RIBS",
    itemNumber: "1.36",
    problemCluster: "rib thickening",
    seriousAlternatives: ["Thalassaemia Major", "Paget's Disease", "Fibrous Dysplasia", "Hurler Syndrome"],
    differentials: [
      {
        diagnosis: "Thalassaemia Major",
        dominantImagingFinding: "Diffuse expansion of the ribs due to extreme MARROW HYPERPLASIA. 'Rodent facies' and hair-on-end skull.",
        distributionLocation: "Bilateral and symmetric. All ribs involved.",
        demographicsClinicalContext: "Children/Young adults of Mediterranean or Asian descent. Severe anaemia.",
        discriminatingKeyFeature: "MARROW EXPANSION and generalized osteopenia. No focal cortical thickening (unlike Paget's).",
        associatedFindings: "Extramedullary haematopoiesis.",
        complicationsSeriousAlternatives: "Heart failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paget's Disease (Rib)",
        dominantImagingFinding: "Cortical thickening and coarse trabeculation. BONE ENLARGEMENT.",
        distributionLocation: "Typically involves a single rib (Monostotic).",
        demographicsClinicalContext: "Elderly. Often asymptomatic.",
        discriminatingKeyFeature: "BONE ENLARGEMENT and cortical thickening. Lacks the generalized marrow expansion of thalassaemia.",
        associatedFindings: "Elevated Alk Phos.",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hurler Syndrome (Mucopolysaccharidosis)",
        dominantImagingFinding: "Ribs that are broad anteriorly and tapered posteriorly ('OAR-SHAPED' or 'Spatulated' ribs).",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Infants with coarse facial features and dysostosis multiplex.",
        discriminatingKeyFeature: "OAR-SHAPED appearance: Broad anterior ends and narrow posterior necks. Associated with J-shaped sella.",
        associatedFindings: "Gibbus deformity.",
        complicationsSeriousAlternatives: "Severe developmental delay.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "BONY OUTGROWTHS OF THE SPINE",
    itemNumber: "2.12",
    problemCluster: "spinal spurs",
    seriousAlternatives: ["Osteophytes (OA)", "Syndesmophytes (AS)", "DISH", "Flowing Calcification"],
    differentials: [
      {
        diagnosis: "Diffuse Idiopathic Skeletal Hyperostosis (DISH)",
        dominantImagingFinding: "FLOWING CALCIFICATION along the anterior-lateral aspect of at least 4 contiguous vertebrae. 'MOLTEN WAX' appearance.",
        distributionLocation: "Thoracic spine (T7-T11) focus. Right side > Left side (due to aortic pulsations on left).",
        demographicsClinicalContext: "Elderly males. Associated with DIABETES MELLITUS.",
        discriminatingKeyFeature: "FLOWING calcification and PRESERVATION OF DISC SPACES. Lacks SI joint involvement (unlike AS).",
        associatedFindings: "Ossification of the posterior longitudinal ligament (OPLL).",
        complicationsSeriousAlternatives: "Dysphagia (if cervical).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ankylosing Spondylitis (Syndesmophytes)",
        dominantImagingFinding: "Thin, vertical, marginal bony bridges crossing the disc space. BAMBOO SPINE.",
        distributionLocation: "Symmetric and generalized. Ascends from SI joints.",
        demographicsClinicalContext: "Young males. HLA-B27 positive.",
        discriminatingKeyFeature: "VERTICAL/MARGINAL syndesmophytes and FUSED SI JOINTS. Dagger sign (ossified supraspinous ligament).",
        associatedFindings: "Uveitis.",
        complicationsSeriousAlternatives: "Spinal fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Degenerative Osteophytes",
        dominantImagingFinding: "Horizontal or slightly oblique bony spurs arising from the vertebral margins.",
        distributionLocation: "Localized to areas of disc degeneration. Lumbar/Cervical focus.",
        demographicsClinicalContext: "Elderly. Mechanical back pain.",
        discriminatingKeyFeature: "HORIZONTAL orientation and DISC SPACE NARROWING. Unlike syndesmophytes, these do not bridge vertically.",
        associatedFindings: "Subchondral sclerosis.",
        complicationsSeriousAlternatives: "Foraminal stenosis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C ALCIFICATION OF ARTICULAR (HYALINE) CARTILAGE (CHONDROCALCINOSIS)",
    itemNumber: "3.11",
    problemCluster: "chondrocalcinosis",
    seriousAlternatives: ["CPPD (Pseudogout)", "Hyperparathyroidism", "Haemochromatosis", "Hypomagnesaemia"],
    differentials: [
      {
        diagnosis: "CPPD (Calcium Pyrophosphate Disease)",
        dominantImagingFinding: "Linear or shaggy calcification within the hyaline cartilage or fibrocartilage (Meniscus).",
        distributionLocation: "Knee (Meniscus/Hyaline), Wrist (TFCC), Pubic Symphysis.",
        demographicsClinicalContext: "Elderly. Recurrent acute arthritis ('Pseudogout').",
        discriminatingKeyFeature: "TFCC CALCIFICATION and SLAC heart (Scapholunate Advanced Collapse). Hook-like osteophytes at 2nd/3rd MCP joints.",
        associatedFindings: "Subchondral cysts.",
        complicationsSeriousAlternatives: "Severe destructive arthropathy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hyperparathyroidism",
        dominantImagingFinding: "Chondrocalcinosis identical to CPPD.",
        distributionLocation: "Bilateral joints.",
        demographicsClinicalContext: "Renal failure or adenoma. High serum Calcium/PTH.",
        discriminatingKeyFeature: "SYSTEMIC signs: Subperiosteal resorption in the hands and brown tumors. Must check PTH in all cases of chondrocalcinosis.",
        associatedFindings: "Nephrocalcinosis.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Haemochromatosis",
        dominantImagingFinding: "Chondrocalcinosis associated with symmetric arthritis of the MCP joints.",
        distributionLocation: "Hands (MCPs) and Wrists.",
        demographicsClinicalContext: "Bronze skin, Diabetes, and Cirrhosis ('Bronze Diabetes'). High ferritin.",
        discriminatingKeyFeature: "HOOK-LIKE OSTEOPHYTES on the radial side of the 2nd and 3rd MCP joints. Dark liver on T2 MRI.",
        associatedFindings: "Cardiomyopathy.",
        complicationsSeriousAlternatives: "Liver cirrhosis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P LEURAL CALCIFICATION",
    itemNumber: "4.34",
    problemCluster: "calcified pleura",
    seriousAlternatives: ["Asbestos-related Plaques", "Old Empyema", "Old Haemothorax", "Old TB Pleurisy"],
    differentials: [
      {
        diagnosis: "Asbestos-related Plaques",
        dominantImagingFinding: "Multiple, bilateral, well-defined 'HOLLY-LEAF' calcified or non-calcified plaques.",
        distributionLocation: "Parietal pleura. Mid-zones, Diaphragm, and Chest wall. CHARACTERISTICALLY SPARES THE APICES.",
        demographicsClinicalContext: "Occupational history (>20y prior). Asymptomatic. No volume loss.",
        discriminatingKeyFeature: "BILATERALITY and APICAL SPARING. Diaphragmatic calcification is highly specific for asbestos.",
        associatedFindings: "Pleural plaques (non-calcified).",
        complicationsSeriousAlternatives: "Increased lung cancer risk.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Old Empyema / Haemothorax",
        dominantImagingFinding: "Large, thick, unilateral sheet-like calcification. Significant underlying volume loss.",
        distributionLocation: "UNILATERAL. Often lower zone focus.",
        demographicsClinicalContext: "Prior history of severe pneumonia, trauma, or surgery.",
        discriminatingKeyFeature: "UNILATERALITY and VOLUME LOSS. Unlike asbestos, this is a single massive sheet and the underlying lung is small/scarred.",
        associatedFindings: "Resected ribs or clips.",
        complicationsSeriousAlternatives: "Trapped lung.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Old TB Pleurisy",
        dominantImagingFinding: "Thick calcified rind surrounding the lung. Associated with apical scarring.",
        distributionLocation: "Unilateral or bilateral. Predilection for the upper zones.",
        demographicsClinicalContext: "History of TB.",
        discriminatingKeyFeature: "APICAL focus and associated parenchymal fibrocalcific changes (unlike asbestos which spares apices).",
        associatedFindings: "Ghon focus.",
        complicationsSeriousAlternatives: "Reactivation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C T THYMIC MASS",
    itemNumber: "4.47",
    problemCluster: "thymic density",
    seriousAlternatives: ["Thymic Hyperplasia (Rebound)", "Thymoma", "Thymic Carcinoma", "Lymphoma"],
    differentials: [
      {
        diagnosis: "Thymic Hyperplasia (Rebound)",
        dominantImagingFinding: "Smooth, symmetric enlargement of the thymus following chemotherapy or stress.",
        distributionLocation: "Normal thymic position. Quadrilateral shape.",
        demographicsClinicalContext: "Children or young adults following treatment for malignancy. Asymptomatic.",
        discriminatingKeyFeature: "STRESS HISTORY and MRI signal: Signal loss on out-of-phase MRI (Chemical shift) confirms microscopic fat, which is characteristic of hyperplasia, not tumor.",
        associatedFindings: "Stable or regressing on follow-up.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Thymoma",
        dominantImagingFinding: "Solid, well-circumscribed, often lobulated mass. No chemical shift on MRI.",
        distributionLocation: "Anterior mediastinum.",
        demographicsClinicalContext: "Adults (40-60y). 35% have Myasthenia Gravis.",
        discriminatingKeyFeature: "ASSOCIATION WITH MYASTHENIA GRAVIS and solid, non-fatty enhancement. 15% are invasive (Stage III/IV).",
        associatedFindings: "Pleural 'drop' metastases if malignant.",
        complicationsSeriousAlternatives: "Red cell aplasia.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Thymic Carcinoma",
        dominantImagingFinding: "Aggressive mass with poorly defined margins. Invasion of great vessels and hila.",
        distributionLocation: "Anterior mediastinum focus.",
        demographicsClinicalContext: "Older adults.",
        discriminatingKeyFeature: "AGGRESSIVE INVASION and distant metastases. Lacks the MG association of thymoma.",
        associatedFindings: "Pericardial effusion.",
        complicationsSeriousAlternatives: "Death.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "APHTHOID ULCERS",
    itemNumber: "6.28",
    problemCluster: "tiny GI ulcers",
    seriousAlternatives: ["Crohn's Disease (Most common)", "Infectious Colitis", "Behçet Disease", "NSAID Colopathy"],
    differentials: [
      {
        diagnosis: "Crohn's Disease (Early)",
        dominantImagingFinding: "Tiny 'punched-out' ulcers on a background of NORMAL mucosa. Target-like appearance on barium.",
        distributionLocation: "Caecum and terminal ileum common. Characteristically non-contiguous.",
        demographicsClinicalContext: "Young adults. Mild symptoms early on.",
        discriminatingKeyFeature: "NORMAL BACKGROUND: Unlike Ulcerative Colitis, aphthoid ulcers in Crohn's appear on otherwise healthy-looking mucosa.",
        associatedFindings: "Terminal ileitis.",
        complicationsSeriousAlternatives: "Stricture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Infectious Colitis (e.g. Amoebiasis/Yersinia)",
        dominantImagingFinding: "Multiple small ulcers focused in the RLQ.",
        distributionLocation: "Caecum and Right Colon.",
        demographicsClinicalContext: "Acute onset diarrhea and travel history.",
        discriminatingKeyFeature: "ACUTE presentation and clinical resolution. Lacks the chronic skip-lesion pattern of Crohn's.",
        associatedFindings: "Nodal enlargement.",
        complicationsSeriousAlternatives: "Liver abscess (Amoebic).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Behçet Disease",
        dominantImagingFinding: "Large, deep, discrete aphthoid ulcers.",
        distributionLocation: "Ileocaecal region focus.",
        demographicsClinicalContext: "Triad: Oral ulcers, Genital ulcers, and Uveitis.",
        discriminatingKeyFeature: "SYSTEMIC signs: Presence of multisystem inflammation (Oral/Genital). Ulcers are often larger and deeper than in early Crohn's.",
        associatedFindings: "Pulmonary artery aneurysms.",
        complicationsSeriousAlternatives: "Bowel perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C T OF a RETROPERITONEAL CYSTIC MASS",
    itemNumber: "6.33",
    problemCluster: "retroperitoneal cyst",
    seriousAlternatives: ["Lymphangioma", "Duplication Cyst", "Pseudocyst", "Hydatid Cyst"],
    differentials: [
      {
        diagnosis: "Lymphangioma (Cystic Hygroma)",
        dominantImagingFinding: "Large, thin-walled, multilocular cystic mass. CHARACTERISTICALLY ENCASES vessels.",
        distributionLocation: "Anywhere in the retroperitoneum. Often massive.",
        demographicsClinicalContext: "Usually children. Asymptomatic or abdominal distension.",
        discriminatingKeyFeature: "VASCULAR ENCASEMENT: It surrounds the IVC and Aorta without narrowing them. 'Creeps' between structures.",
        associatedFindings: "Fluid-fluid levels (Chyle/Blood).",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pancreatic Pseudocyst",
        dominantImagingFinding: "Unilocular fluid collection with a thick fibrous wall. High attenuation fluid.",
        distributionLocation: "Lesser sac or peripancreatic space.",
        demographicsClinicalContext: "History of acute or chronic pancreatitis.",
        discriminatingKeyFeature: "PANCREATIC HISTORY and location. Lacks the multilocular encasing behavior of lymphangioma.",
        associatedFindings: "Chronic pancreatitis (calcification).",
        complicationsSeriousAlternatives: "Infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hydatid Cyst (Echinococcus)",
        dominantImagingFinding: "Cyst containing multiple internal DAUGHTER CYSTS. Peripheral calcification.",
        distributionLocation: "Liver common, but can be retroperitoneal.",
        demographicsClinicalContext: "Travel to endemic areas (Middle East, Australia). Sheep farming.",
        discriminatingKeyFeature: "DAUGHTER CYSTS and shell-like calcification. Internal septations are characteristic.",
        associatedFindings: "Eosinophilia.",
        complicationsSeriousAlternatives: "Anaphylaxis (if ruptured).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L IVER LESIONS WITH a CENTRAL SCAR",
    itemNumber: "7.24",
    problemCluster: "liver scar",
    seriousAlternatives: ["Focal Nodular Hyperplasia (FNH)", "Fibrolamellar HCC", "Giant Haemangioma", "Cholangiocarcinoma"],
    differentials: [
      {
        diagnosis: "Focal Nodular Hyperplasia (FNH)",
        dominantImagingFinding: "Intensely enhancing mass during arterial phase. CENTRAL SCAR is characteristically BRIGHT on T2 MRI.",
        distributionLocation: "Anywhere in the liver. Subcapsular focus.",
        demographicsClinicalContext: "Young females (8:1). Not associated with OCP use (unlike adenoma).",
        discriminatingKeyFeature: "T2 BRIGHT SCAR and uptake on hepatobiliary agents (Eovist/Primovist). Lacks a capsule. Central scar enhances on DELAYS.",
        associatedFindings: "Normal background liver.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Fibrolamellar HCC",
        dominantImagingFinding: "Large, heterogeneous mass with a central scar. SCAR is characteristically DARK on T2 MRI.",
        distributionLocation: "Unilateral lobe.",
        demographicsClinicalContext: "Young patients (10-30y). NO history of cirrhosis. Normal Alpha-fetoprotein (AFP).",
        discriminatingKeyFeature: "T2 DARK SCAR: Unlike FNH, the scar in fibrolamellar is fibrous and does not enhance. Calcification common (40%).",
        associatedFindings: "Hilar adenopathy (common, unlike FNH).",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Giant Haemangioma",
        dominantImagingFinding: "Peripheral nodular centripetal enhancement. Central scar is a non-enhancing area of fibrosis.",
        distributionLocation: "Large masses (>5cm).",
        demographicsClinicalContext: "Adults.",
        discriminatingKeyFeature: "ENHANCEMENT PATTERN: Discontinuous nodular peripheral filling. The scar is simply an area that never fills in.",
        associatedFindings: "Bright T2 signal (Light-bulb).",
        complicationsSeriousAlternatives: "Kasabach-Merritt syndrome (rare).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "B ILATERAL LARGE SMOOTH KIDNEYS",
    itemNumber: "8.12",
    problemCluster: "bilateral nephromegaly",
    seriousAlternatives: ["Diabetes Mellitus", "Amyloidosis", "Acute Tubular Necrosis (ATN)", "HIV Nephropathy", "Lymphoma"],
    differentials: [
      {
        diagnosis: "Diabetes Mellitus (Diabetic Nephropathy)",
        dominantImagingFinding: "Kidneys remain large or normal sized even when renal failure occurs.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Long-standing Diabetic history. Proteinuria.",
        discriminatingKeyFeature: "SIZE in RENAL FAILURE: Most causes of chronic renal failure result in small kidneys. Diabetes and Amyloid are the major exceptions.",
        associatedFindings: "Renal papillary necrosis.",
        complicationsSeriousAlternatives: "Urosepsis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Renal Amyloidosis",
        dominantImagingFinding: "Bilateral large smooth kidneys. Increased echogenicity on US.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Chronic inflammatory disease (RA, Bronchiectasis) or Multiple Myeloma.",
        discriminatingKeyFeature: "SIZE: Kidneys are characteristically large. Associated with massive proteinuria (Nephrotic Syndrome).",
        associatedFindings: "Thickened cardiac walls (Cardiac amyloid).",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Acute Tubular Necrosis (ATN)",
        dominantImagingFinding: "Smooth, enlarged, oedematous kidneys. Persistent dense nephrogram.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Acute onset renal failure following hypotension, sepsis, or contrast exposure.",
        discriminatingKeyFeature: "ACUTE presentation and history of insult. Nephrogram is delayed and intensely persistent.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Severe electrolyte imbalance.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Renal Lymphoma (Secondary)",
        dominantImagingFinding: "Diffuse renal enlargement without discrete masses. Poor enhancement.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Systemic NHL history. B-symptoms.",
        discriminatingKeyFeature: "LYMPHADENOPATHY: Presence of bulky retroperitoneal nodes helps distinguish from medical renal disease.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "Rapid failure.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "R ENAL SINUS MASS",
    itemNumber: "8.24",
    problemCluster: "sinus opacity",
    seriousAlternatives: ["TCC", "Renal Sinus Lipomatosis", "Parapelvic Cyst", "Artery Aneurysm"],
    differentials: [
      {
        diagnosis: "Transitional Cell Carcinoma (TCC)",
        dominantImagingFinding: "Soft tissue filling defect within the pelvis. Centripetal infiltration of the parenchyma.",
        distributionLocation: "Renal sinus focus.",
        demographicsClinicalContext: "Painless haematuria. Older smokers.",
        discriminatingKeyFeature: "INFILTRATIVE: TCC replaces the sinus fat and invades the medulla while PRESERVING the renal outline.",
        associatedFindings: "Hydronephrosis.",
        complicationsSeriousAlternatives: "Synchronous ureteric tumors.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Renal Sinus Lipomatosis",
        dominantImagingFinding: "Proliferation of fat within the sinus. Low density (-100 HU). No mass effect.",
        distributionLocation: "Bilateral common.",
        demographicsClinicalContext: "Obesity or renal atrophy (aging/scars).",
        discriminatingKeyFeature: "FAT DENSITY: 100% diagnostic on CT. Lacks internal enhancement or soft tissue component.",
        associatedFindings: "Generalized obesity.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Parapelvic Cyst",
        dominantImagingFinding: "Cystic lesion within the sinus. Simple fluid density (0-20 HU).",
        distributionLocation: "Sinus.",
        demographicsClinicalContext: "Asymptomatic incidental finding.",
        discriminatingKeyFeature: "CYSTIC appearance and LACK of communication with the collecting system (distinguishes from hydronephrosis).",
        associatedFindings: "Normal calyces.",
        complicationsSeriousAlternatives: "Ureteric compression (rare).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "BASAL GANGLIA CALCIFICATION",
    itemNumber: "12.19",
    problemCluster: "deep grey calcification",
    seriousAlternatives: ["Physiological (Age)", "Fahr Disease", "Hypoparathyroidism", "Carbon Monoxide"],
    differentials: [
      {
        diagnosis: "Physiological (Age-related)",
        dominantImagingFinding: "Small, punctate calcification characteristically involving the GLOBUS PALLIDUS only.",
        distributionLocation: "Globus pallidus. Bilateral and symmetric.",
        demographicsClinicalContext: "Adults >60y (20%). Asymptomatic incidental finding.",
        discriminatingKeyFeature: "ISOLATED GLOBUS PALLIDUS involvement. If Thalamus or Dentate nuclei are involved, it is pathological.",
        associatedFindings: "Pineal/Choroid calcification.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hypoparathyroidism / Pseudohypoparathyroidism",
        dominantImagingFinding: "Extensive, dense calcification of the basal ganglia, thalami, and dentate nuclei.",
        distributionLocation: "Bilateral and symmetric. Multiple deep grey nuclei.",
        demographicsClinicalContext: "Low serum Calcium. Prior neck surgery (Hypo) or round facies/short MCs (Pseudo).",
        discriminatingKeyFeature: "BIOCHEMISTRY: Hypocalcaemia is the hallmark. Most common pathological cause of BG calcification.",
        associatedFindings: "Intracranial hypertension.",
        complicationsSeriousAlternatives: "Seizures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Fahr Disease",
        dominantImagingFinding: "Extremely dense and widespread calcification involving the BG, Thalami, Dentate, and Centrum semiovale.",
        distributionLocation: "Widespread deep grey and white matter.",
        demographicsClinicalContext: "Young to middle-aged adults. Movement disorders.",
        discriminatingKeyFeature: "NORMAL BIOCHEMISTRY: Fahr is a diagnosis of exclusion (Normal PTH and Calcium). More extensive than hypoparathyroidism.",
        associatedFindings: "Cognitive decline.",
        complicationsSeriousAlternatives: "Neuropsychiatric symptoms.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "D UMBBELL-SHAPED LONG BONES",
    itemNumber: "14.7",
    problemCluster: "metaphyseal widening",
    seriousAlternatives: ["Metatropic Dysplasia", "Mucopolysaccharidosis", "Pyle Disease"],
    differentials: [
      {
        diagnosis: "Metatropic Dysplasia",
        dominantImagingFinding: "Small, wafer-like vertebrae (Platyspondyly) and MASSIVELY widened 'Dumbbell' metaphyses.",
        distributionLocation: "Generalized skeleton.",
        demographicsClinicalContext: "Children. Severe short-limb dwarfism. Kyphoscoliosis.",
        discriminatingKeyFeature: "WAFER-LIKE VERTEBRAE and extreme metaphyseal flaring. Most severe dumbbell appearance.",
        associatedFindings: "Coccygeal tail-like appendage.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pyle Disease (Familial Metaphyseal Dysplasia)",
        dominantImagingFinding: "Extreme broadening of the metaphyses of long bones. Lacks the vertebral collapse of metatropic dysplasia.",
        distributionLocation: "Distal femur and proximal tibia ('ERLENMEYER FLASK').",
        demographicsClinicalContext: "Usually asymptomatic incidental finding.",
        discriminatingKeyFeature: "ERLENMEYER FLASK deformity and normal vertebrae. Distinguished from Gaucher by lack of organomegaly.",
        associatedFindings: "Platyspondyly is NOT present.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "A LTERNATING RADIOLUCENT AND DENSE METAPHYSEAL BANDS",
    itemNumber: "14.18",
    problemCluster: "metaphyseal stripes",
    seriousAlternatives: ["Growth Arrest Lines", "Healing Rickets", "Heavy Metal Poisoning (Lead)", "Leukaemia"],
    differentials: [
      {
        diagnosis: "Growth Arrest Lines (Harris Lines)",
        dominantImagingFinding: "Multiple fine, thin, transverse dense lines across the metaphysis.",
        distributionLocation: "Most evident in the fastest growing bones (Distal Femur, Tibia). Symmetrical.",
        demographicsClinicalContext: "History of severe illness, starvation, or trauma followed by recovery.",
        discriminatingKeyFeature: "MULTIPLICITY and thinness. Represents periods where growth stopped then restarted. Parallel to the physis.",
        associatedFindings: "Normal bone density between lines.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Lead Poisoning",
        dominantImagingFinding: "Very thick, dense bands at the zone of provisional calcification. 'LEAD LINES'.",
        distributionLocation: "Metaphyses. Most prominent at the knees and wrists.",
        demographicsClinicalContext: "Children with pica or living in old housing. Abdominal pain and irritability.",
        discriminatingKeyFeature: "DENSITY: The bands are characteristically denser than the cortex. Associated with 'Lead flakes' in the GI tract.",
        associatedFindings: "Radio-opaque material in the bowel.",
        complicationsSeriousAlternatives: "Encephalopathy (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Leukaemia (Paediatric)",
        dominantImagingFinding: "Alternating LUCENT and dense bands. Metaphyseal lucent bands are the hallmark.",
        distributionLocation: "Metaphyses.",
        demographicsClinicalContext: "Children. Fever, bone pain, and pallor.",
        discriminatingKeyFeature: "LUCENT BANDS: Unlike lead or growth lines which are primarily dense, leukaemia shows prominent lucent bands.",
        associatedFindings: "Hepatosplenomegaly.",
        complicationsSeriousAlternatives: "Marrow failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "UTERINE ENDOMETRIUM",
    itemNumber: "13.5",
    problemCluster: "endometrial thickening",
    seriousAlternatives: ["Endometrial Carcinoma", "Endometrial Polyps", "Hyperplasia", "Tamoxifen-induced"],
    differentials: [
      {
        diagnosis: "Endometrial Carcinoma",
        dominantImagingFinding: "Heterogeneous endometrial thickening (>5mm in PMB). DISRUPTION of the Junctional Zone on MRI.",
        distributionLocation: "Endometrial cavity. Infiltrative.",
        demographicsClinicalContext: "Post-menopausal bleeding (PMB). Obesity, nulliparity, and Lynch syndrome.",
        discriminatingKeyFeature: "JUNCTIONAL ZONE disruption and restricted diffusion (DWI High). Most important diagnosis in PMB.",
        associatedFindings: "Lymphadenopathy and invasion of myometrium.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Endometrial Polyp",
        dominantImagingFinding: "Focal, well-circumscribed thickening. Single 'FEEDING VESSEL' on Doppler US.",
        distributionLocation: "Endometrial cavity. Often fundal.",
        demographicsClinicalContext: "Premenopausal or post-menopausal bleeding.",
        discriminatingKeyFeature: "FEEDING VESSEL sign: US shows a single pedicle. Saline Infusion Sonography (SIS) shows a discrete mass.",
        associatedFindings: "Usually benign.",
        complicationsSeriousAlternatives: "Small risk of malignancy (PMB).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Endometrial Hyperplasia",
        dominantImagingFinding: "Diffuse, smooth, homogeneous thickening of the endometrium.",
        distributionLocation: "Entire endometrial surface.",
        demographicsClinicalContext: "Unopposed oestrogen, PCOS, or Hormone Replacement Therapy (HRT).",
        discriminatingKeyFeature: "HOMOGENEITY: The thickening is uniform and the junctional zone remains intact on MRI. No focal masses.",
        associatedFindings: "Polycystic ovaries.",
        complicationsSeriousAlternatives: "Progression to carcinoma (if Atypical).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P HOTOPENIC AREAS IN RADIONUCLIDE THYROID IMAGING",
    itemNumber: "11.17",
    problemCluster: "thyroid cold nodule",
    seriousAlternatives: ["Thyroid Cyst", "Colloid Nodule", "Thyroid Adenoma", "Thyroid Carcinoma"],
    differentials: [
      {
        diagnosis: "Thyroid Cyst",
        dominantImagingFinding: "Photopenic (COLD) area on Tc-99m or I-123 scan. Anechoic on US.",
        distributionLocation: "Thyroid gland lobes.",
        demographicsClinicalContext: "Adults. Common incidental finding.",
        discriminatingKeyFeature: "ULTRASOUND: Anechoic with posterior enhancement. Cold nodules are non-specific; US is needed to prove it's a benign cyst.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Thyroid Adenoma",
        dominantImagingFinding: "Solitary photopenic (COLD) nodule. Solid on US.",
        distributionLocation: "Thyroid lobe.",
        demographicsClinicalContext: "Middle-aged adults.",
        discriminatingKeyFeature: "SOLID appearance on US. 80-90% of cold nodules are benign adenomas or colloid nodules.",
        associatedFindings: "Halo of oedema on US.",
        complicationsSeriousAlternatives: "Hyperthyroidism (Toxic adenoma - though these are usually 'HOT').",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Thyroid Carcinoma (Papillary/Follicular)",
        dominantImagingFinding: "Photopenic (COLD) nodule. Characteristically solid with MICROCALCIFICATIONS.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "History of neck radiation or family history. Hard nodule.",
        discriminatingKeyFeature: "MICROCALCIFICATIONS and TALLER-THAN-WIDE shape on US. 10-15% of cold nodules are malignant.",
        associatedFindings: "Necrotic level VI nodes.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 10 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_10_DATA) {
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
  console.log("Batch 10 Complete!");
}

main().catch(console.error);