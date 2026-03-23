import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_7_DATA = [
  {
    pattern: "DISTAL PHALANGEAL DESTRUCTION",
    itemNumber: "1.41",
    problemCluster: "acro-osteolysis",
    seriousAlternatives: ["Scleroderma", "Psoriatic Arthritis", "Hyperparathyroidism", "Thermal Injury (Frostbite)"],
    differentials: [
      {
        diagnosis: "Systemic Sclerosis (Scleroderma)",
        dominantImagingFinding: "Resorption of the distal phalangeal tufts (Acro-osteolysis) with preservation of joint spaces early on. TAPERED appearance.",
        distributionLocation: "Bilateral and symmetric. Involves all digits.",
        demographicsClinicalContext: "Middle-aged females. RAYNAUD'S phenomenon (95%). Calcinosis, Raynaud's, Oesophageal dysmotility, Sclerodactyly, Telangiectasia (CREST).",
        discriminatingKeyFeature: "CALCINOSIS CUTIS: Massive, dense soft tissue calcification combined with soft tissue ATROPHY. No bone proliferation.",
        associatedFindings: "Oesophageal atony and basal lung fibrosis (NSIP).",
        complicationsSeriousAlternatives: "Renal crisis and pulmonary hypertension.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Psoriatic Arthritis",
        dominantImagingFinding: "Acro-osteolysis with significant BONE PROLIFERATION (fluffy periostitis). PENCIL-IN-CUP deformity.",
        distributionLocation: "Distal Interphalangeal (DIP) joints. Asymmetric and 'random' distribution.",
        demographicsClinicalContext: "Skin psoriasis (90%). Nail pitting and dactylitis (Sausage digit).",
        discriminatingKeyFeature: "BONE PROLIFERATION: Fluffy periosteal new bone at the site of destruction. Absence of periarticular osteoporosis.",
        associatedFindings: "Sacroiliitis (asymmetric) and syndesmophytes.",
        complicationsSeriousAlternatives: "Arthritis mutilans.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hyperparathyroidism (Primary or Secondary)",
        dominantImagingFinding: "Subperiosteal resorption of the tufts. Lacks the tapering of scleroderma.",
        distributionLocation: "RADIAL SIDE of the middle phalanges (2nd and 3rd digits) is pathognomonic.",
        demographicsClinicalContext: "Renal failure (Secondary) or adenoma (Primary). High PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION along the radial aspects of the middle phalanges. Salt-and-pepper skull.",
        associatedFindings: "Brown tumors and rugger-jersey spine.",
        complicationsSeriousAlternatives: "Renal stones and fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Thermal Injury (Frostbite / Burn)",
        dominantImagingFinding: "Distal tuft resorption mimicking 'amputation'. Preserved proximal bone density.",
        distributionLocation: "Digit tips. Strictly localized to the area of exposure.",
        demographicsClinicalContext: "History of exposure to extreme cold or heat.",
        discriminatingKeyFeature: "HISTORY of trauma and preservation of all joints not directly involved in the burn area.",
        associatedFindings: "Soft tissue loss.",
        complicationsSeriousAlternatives: "Secondary infection.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "HYPERTROPHIC OSTEOARTHROPATHY",
    itemNumber: "1.27",
    problemCluster: "HPOA",
    seriousAlternatives: ["Bronchogenic Carcinoma (Lung)", "Pleural Mesothelioma", "Thyroid Acropachy", "Venous Stasis"],
    differentials: [
      {
        diagnosis: "Bronchogenic Carcinoma (NSCLC)",
        dominantImagingFinding: "Symmetrical, smooth, linear PERIOSTEAL REACTION along the diaphyses of the long bones.",
        distributionLocation: "Bilateral and symmetric. Typically Tibia, Fibula, Radius, and Ulna.",
        demographicsClinicalContext: "Adult smokers. Digital clubbing (90%). Painful, swollen joints. Lung mass on CXR.",
        discriminatingKeyFeature: "LUNG MASS: 90% of HPOA cases in adults are secondary to an intrathoracic malignancy (Adenocarcinoma common).",
        associatedFindings: "Hilar adenopathy and digital clubbing.",
        complicationsSeriousAlternatives: "Metastatic spread of cancer.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Thyroid Acropachy",
        dominantImagingFinding: "Aggressive, 'FEATHERY' or spicuated periosteal reaction. Metacarpal and phalangeal involvement.",
        distributionLocation: "Hands and feet focus. Strictly symmetric.",
        demographicsClinicalContext: "History of Graves' disease treated with RAI or surgery. Exophthalmos.",
        discriminatingKeyFeature: "FEATHERY PERIOSTITIS: Characteristically involves the metacarpal and phalangeal mid-shafts. Patient is usually hypothyroid or euthyroid post-treatment.",
        associatedFindings: "Pretibial myxoedema.",
        complicationsSeriousAlternatives: "Severe exophthalmos.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Venous Stasis (Chronic)",
        dominantImagingFinding: "Thick, undulating, mature periosteal reaction. Lacks the linearity of HPOA.",
        distributionLocation: "Limited to the lower limbs (Tibia/Fibula). Unilateral or bilateral.",
        demographicsClinicalContext: "Chronic venous insufficiency, varicose veins, or prior DVT.",
        discriminatingKeyFeature: "DISTRIBUTION: Limited to the calves. Associated with significant soft tissue swelling and phleboliths.",
        associatedFindings: "Subcutaneous ossification and skin ulceration.",
        complicationsSeriousAlternatives: "Venous ulcers.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S ACROILIITIS",
    itemNumber: "3.12",
    problemCluster: "sacroiliac joint disease",
    seriousAlternatives: ["Ankylosing Spondylitis", "IBD Arthritis", "Psoriatic Arthritis", "Septic Arthritis"],
    differentials: [
      {
        diagnosis: "Ankylosing Spondylitis",
        dominantImagingFinding: "Symmetric, bilateral erosions and sclerosis leading to bony ANKYLOSIS (fusion).",
        distributionLocation: "Bilateral and SYMMETRIC. Ascends the spine.",
        demographicsClinicalContext: "Young males (20-30y). HLA-B27 positive (90%). Morning stiffness relieved by exercise.",
        discriminatingKeyFeature: "SYMMETRY and BAMBOO SPINE: Fusion of the SI joints and marginal syndesmophytes in the spine.",
        associatedFindings: "Uveitis, apical lung fibrosis, and aortic regurgitation.",
        complicationsSeriousAlternatives: "Andersson lesion (Pseudoarthrosis) and fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Enteropathic Arthritis (IBD)",
        dominantImagingFinding: "Identical to AS (Bilateral symmetric sacroiliitis).",
        distributionLocation: "Bilateral and SYMMETRIC.",
        demographicsClinicalContext: "Associated with Crohn's disease or Ulcerative Colitis. HLA-B27 positive in 50%.",
        discriminatingKeyFeature: "IBD HISTORY: The sacroiliitis is independent of the bowel disease activity (unlike the peripheral arthritis).",
        associatedFindings: "Bowel wall thickening on CT.",
        complicationsSeriousAlternatives: "Bowel obstruction/perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Psoriatic Arthritis (SIJ)",
        dominantImagingFinding: "Large, asymmetric erosions and sclerosis. Less likely to ankylose.",
        distributionLocation: "Unilateral or ASYMMETRIC bilateral.",
        demographicsClinicalContext: "Skin psoriasis. Digital dactylitis.",
        discriminatingKeyFeature: "ASYMMETRY and non-marginal syndesmophytes (bulky/bridging). Spares the spine compared to AS.",
        associatedFindings: "DIP joint arthritis.",
        complicationsSeriousAlternatives: "Skin flare.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Septic Sacroiliitis",
        dominantImagingFinding: "Rapid destruction of the joint space with large fluid collection/abscess.",
        distributionLocation: "Strictly UNILATERAL.",
        demographicsClinicalContext: "Acute onset fever and severe buttock pain. IVDU or post-partum.",
        discriminatingKeyFeature: "UNILATERALITY and ACUTE presentation. MRI shows intense marrow oedema and joint fluid.",
        associatedFindings: "Iliacus or Piriformis abscess.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "BRONCHIECTASIS",
    itemNumber: "4.10",
    problemCluster: "dilated airways",
    seriousAlternatives: ["Cystic Fibrosis", "Allergic Bronchopulmonary Aspergillosis (ABPA)", "Post-infectious", "Kartagener Syndrome"],
    differentials: [
      {
        diagnosis: "Cystic Fibrosis (CF)",
        dominantImagingFinding: "Cylindrical and cystic bronchiectasis with MUCUS PLUGGING. Upper lobe predominance.",
        distributionLocation: "Bilateral and SYMMETRIC. UPPER LOBE predominance.",
        demographicsClinicalContext: "Children/Young adults. Failure to thrive, recurrent infections, and pancreatic insufficiency.",
        discriminatingKeyFeature: "UPPER LOBE predilection and presence of PANCREATIC ATROPHY/calcification on CT.",
        associatedFindings: "Hyperinflation and pulmonary hypertension.",
        complicationsSeriousAlternatives: "Haemoptysis (from bronchial artery hypertrophy).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Allergic Bronchopulmonary Aspergillosis (ABPA)",
        dominantImagingFinding: "CENTRAL (proximal) bronchiectasis. 'FINGER-IN-GLOVE' sign due to high-attenuation mucus plugs.",
        distributionLocation: "Central/Perihilar focus. Upper and mid-zones.",
        demographicsClinicalContext: "Asthmatic patients or CF. Eosinophilia and high IgE.",
        discriminatingKeyFeature: "HIGH-ATTENUATION MUCUS (70%): The plugs are denser than muscle on CT. Central distribution.",
        associatedFindings: "Transient pulmonary infiltrates.",
        complicationsSeriousAlternatives: "Pulmonary fibrosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Kartagener Syndrome (PCD)",
        dominantImagingFinding: "Diffuse bronchiectasis, characteristically involving the LOWER LOBES.",
        distributionLocation: "Lower lobe predominance.",
        demographicsClinicalContext: "Triad: Situs inversus, Bronchiectasis, and Sinusitis.",
        discriminatingKeyFeature: "SITUS INVERSUS: Dextrocardia and right-sided stomach are diagnostic when present with bronchiectasis.",
        associatedFindings: "Absent or small frontal sinuses.",
        complicationsSeriousAlternatives: "Infertility.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Post-Infectious Bronchiectasis",
        dominantImagingFinding: "Localized area of bronchiectasis distal to a prior severe pneumonia.",
        distributionLocation: "Segmental or lobar. Often Lower lobes or RML.",
        demographicsClinicalContext: "History of childhood Whooping Cough or Measles.",
        discriminatingKeyFeature: "LOCALIZATION: Lacks the upper lobe symmetry of CF or the central focus of ABPA.",
        associatedFindings: "Volume loss in the affected segment.",
        complicationsSeriousAlternatives: "Lung abscess.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "P NEUMOMEDIASTINUM",
    itemNumber: "4.30",
    problemCluster: "gas in mediastinum",
    seriousAlternatives: ["Oesophageal Rupture (Boerhaave - EMERGENCY)", "Asthma (Macklin Effect)", "Tracheal Rupture", "Pneumothorax"],
    differentials: [
      {
        diagnosis: "Spontaneous / Macklin Effect (Asthma)",
        dominantImagingFinding: "Linear streaks of gas outlining mediastinal structures (Aorta, Heart, Trachea). NO associated fluid.",
        distributionLocation: "Superior and middle mediastinum. Characteristically extends into the neck (Surgical Emphysema).",
        demographicsClinicalContext: "Young adults. Acute asthma attack or severe coughing fit. Valsalva maneuver.",
        discriminatingKeyFeature: "MACKLIN EFFECT: Gas tracks from ruptured alveoli along the bronchovascular bundles to the hilum. NO pleural effusion.",
        associatedFindings: "Subcutaneous emphysema in the neck.",
        complicationsSeriousAlternatives: "None usually.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Oesophageal Rupture (Boerhaave Syndrome)",
        dominantImagingFinding: "Pneumomediastinum with associated LEFT PLEURAL EFFUSION or hydropneumothorax.",
        distributionLocation: "Lower mediastinum focus.",
        demographicsClinicalContext: "Sudden onset severe chest pain after forceful vomiting. Septic shock.",
        discriminatingKeyFeature: "PLEURAL EFFUSION: The presence of fluid (effusion) or an air-fluid level in the mediastinum is highly suggestive of rupture. URGENT.",
        associatedFindings: "Pneumothorax (usually left).",
        complicationsSeriousAlternatives: "Mediastinitis and death (FATAL within 24h).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Tracheal / Bronchial Rupture",
        dominantImagingFinding: "Large volume pneumomediastinum and persistent pneumothorax despite ICD.",
        distributionLocation: "Centered on the airways.",
        demographicsClinicalContext: "Major blunt chest trauma or iatrogenic (Intubation).",
        discriminatingKeyFeature: "FALLEN LUNG SIGN: The collapsed lung falls away from the hilum (towards the dependent side) due to airway transection.",
        associatedFindings: "Rib fractures.",
        complicationsSeriousAlternatives: "Tension pneumomediastinum (Cardiac compression).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "LINITIS PLASTICA",
    itemNumber: "6.10",
    problemCluster: "rigid stomach",
    seriousAlternatives: ["Gastric Adenocarcinoma", "Gastric Lymphoma", "Corrosive Gastritis", "Sarcoidosis"],
    differentials: [
      {
        diagnosis: "Scirrhous Adenocarcinoma",
        dominantImagingFinding: "Diffuse mural thickening and RIGIDITY of the stomach. Narrowed lumen ('Leather-bottle' stomach).",
        distributionLocation: "Diffuse (involves >50% of the stomach).",
        demographicsClinicalContext: "Older adults. Anorexia, weight loss, and early satiety.",
        discriminatingKeyFeature: "MUCOSAL DESTRUCTION: Irregular, ulcerated mucosa with absolute lack of peristalsis on fluoroscopy.",
        associatedFindings: "Omental caking and ascites.",
        complicationsSeriousAlternatives: "Krukenberg tumor (ovarian mets).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Gastric Lymphoma (MALT)",
        dominantImagingFinding: "Massive mural thickening (often >2cm) with PRESERVED flexibility.",
        distributionLocation: "Diffuse or segmental.",
        demographicsClinicalContext: "Adults. B-symptoms. Associated with H. pylori.",
        discriminatingKeyFeature: "PRESERVED FLEXIBILITY: Unlike adenocarcinoma, the lymphoma-infiltrated stomach may still distend slightly. Crosses the pylorus (30%).",
        associatedFindings: "Bulky lymphadenopathy below the diaphragm.",
        complicationsSeriousAlternatives: "Perforation during treatment.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Corrosive Gastritis (Chronic)",
        dominantImagingFinding: "Stricture formation and antral narrowing. Rigid wall.",
        distributionLocation: "Antrum focus.",
        demographicsClinicalContext: "History of ingestion of strong acids or alkalis (suicide attempt).",
        discriminatingKeyFeature: "HISTORY: Clear temporal relation to caustic ingestion. Typically spares the fundus.",
        associatedFindings: "Oesophageal strictures.",
        complicationsSeriousAlternatives: "Gastric outlet obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C OLONIC POLYPS",
    itemNumber: "6.22",
    problemCluster: "colonic filling defect",
    seriousAlternatives: ["Adenomatous Polyp", "Hyperplastic Polyp", "Villous Adenoma", "Lipoma"],
    differentials: [
      {
        diagnosis: "Adenomatous Polyp (Pedunculated)",
        dominantImagingFinding: "Smooth filling defect on a stalk ('BOWL-ON-A-STALK'). Diameter <2cm is usually benign.",
        distributionLocation: "Sigmoid and Rectum focus (70%).",
        demographicsClinicalContext: "Adults >50y. Occult bleeding.",
        discriminatingKeyFeature: "STALK presence: Pedunculated polyps have a lower risk of malignancy than sessile ones of the same size.",
        associatedFindings: "Synchronous polyps (25%).",
        complicationsSeriousAlternatives: "Malignant transformation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Villous Adenoma (Sessile)",
        dominantImagingFinding: "Large, frond-like, 'CAULIFLOWER' mass. Often >3cm. Barium trapped between fronds.",
        distributionLocation: "Rectum common.",
        demographicsClinicalContext: "Elderly. Profuse mucous diarrhea and hypokalaemia.",
        discriminatingKeyFeature: "CAULIFLOWER appearance and LARGE size. 40% risk of malignancy if >3cm. Sessile (broad-based).",
        associatedFindings: "Electrolyte imbalance.",
        complicationsSeriousAlternatives: "Invasive carcinoma.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Colonic Lipoma",
        dominantImagingFinding: "Smooth, submucosal filling defect. Changeable shape ('Squeeze sign').",
        distributionLocation: "Caecum and ascending colon (Right side).",
        demographicsClinicalContext: "Asymptomatic incidental finding.",
        discriminatingKeyFeature: "FAT DENSITY on CT (-60 to -100 HU) is diagnostic. Smooth overlying mucosa.",
        associatedFindings: "Intussusception (if large).",
        complicationsSeriousAlternatives: "Intussusception.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "T HICKENED GALLBLADDER WALL",
    itemNumber: "7.3",
    problemCluster: "gallbladder wall thickening",
    seriousAlternatives: ["Acute Cholecystitis", "Adenomyomatosis", "Heart Failure (Systemic)", "GB Carcinoma"],
    differentials: [
      {
        diagnosis: "Acute Cholecystitis",
        dominantImagingFinding: "Wall thickening (>3mm) with PERICHOLECYSTIC FLUID and gallstones.",
        distributionLocation: "Gallbladder focus.",
        demographicsClinicalContext: "Fat, Female, Forty, Fertile. RUQ pain and positive Murphy sign.",
        discriminatingKeyFeature: "SONOGRAPHIC MURPHY SIGN (100% specific) and impacted stone in the GB neck. Hyperaemia on Doppler.",
        associatedFindings: "Gallbladder distension (>4cm width).",
        complicationsSeriousAlternatives: "Gangrenous cholecystitis or perforation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Gallbladder Adenomyomatosis",
        dominantImagingFinding: "Focal or diffuse thickening with small intramural diverticula (ROKITANSKY-ASCHOFF SINUSES).",
        distributionLocation: "Often focal (Fundal).",
        demographicsClinicalContext: "Asymptomatic incidental finding.",
        discriminatingKeyFeature: "COMET-TAIL ARTIFACT: Echogenic foci within the wall sinuses causing reverberation. No Murphy sign.",
        associatedFindings: "Hourglass constriction of the GB.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Systemic Oedema (CHF/Hypoproteinaemia)",
        dominantImagingFinding: "Diffuse, smooth, 'STRATIFIED' wall thickening (sandwich appearance).",
        distributionLocation: "Gallbladder wall.",
        demographicsClinicalContext: "Heart failure, liver failure, or renal failure. Generalised anasarca.",
        discriminatingKeyFeature: "ABSENCE OF PAIN: The GB is not tender, and there are no stones or pericholecystic fluid. Associated with ASCITES.",
        associatedFindings: "Pleural effusions and IVC dilatation.",
        complicationsSeriousAlternatives: "None (related to GB).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Gallbladder Carcinoma",
        dominantImagingFinding: "Irregular, asymmetric wall thickening or a solid mass REPLACING the gallbladder.",
        distributionLocation: "Gallbladder fossa.",
        demographicsClinicalContext: "Elderly females. Associated with Porcelain GB (calcification).",
        discriminatingKeyFeature: "ASYMMETRIC mass and invasion of the liver (Segment IV/V). Often associated with large stones.",
        associatedFindings: "Liver metastases and hilar nodes.",
        complicationsSeriousAlternatives: "Biliary obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "F AT-CONTAINING RENAL MASS",
    itemNumber: "8.21",
    problemCluster: "renal fat",
    seriousAlternatives: ["Angiomyolipoma (AML)", "Renal Cell Carcinoma (Rarely)", "Liposarcoma", "Myelolipoma"],
    differentials: [
      {
        diagnosis: "Angiomyolipoma (AML)",
        dominantImagingFinding: "Well-circumscribed mass containing MACROSCOPIC FAT (-20 to -100 HU). No calcification.",
        distributionLocation: "Renal cortex. Often multiple and bilateral.",
        demographicsClinicalContext: "Sporadic (80%) or associated with TUBEROUS SCLEROSIS (TSC) in 20%.",
        discriminatingKeyFeature: "MACROSCOPIC FAT and ABSENCE OF CALCIFICATION (100% specific vs RCC). Multiple AMLs are diagnostic of TSC.",
        associatedFindings: "TSC signs: Brain tubers, subependymal nodes, ash-leaf spots.",
        complicationsSeriousAlternatives: "Spontaneous haemorrhage (Wunderlich Syndrome) if mass >4cm.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Renal Cell Carcinoma (RCC)",
        dominantImagingFinding: "Solid enhancing mass. Macroscopic fat is rare (<1%) and usually indicates bone invasion or fat entrapment.",
        distributionLocation: "Renal cortex.",
        demographicsClinicalContext: "Older adults. Smokers. Triad: Pain, haematuria, mass.",
        discriminatingKeyFeature: "CALCIFICATION: 30% of RCCs contain calcification. If a fat-containing mass has calcification, it is RCC until proven otherwise.",
        associatedFindings: "Renal vein thrombus.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Liposarcoma (Retroperitoneal)",
        dominantImagingFinding: "Large mass containing fat and solid elements. Characteristically DISPLACES the kidney.",
        distributionLocation: "Perinephric space.",
        demographicsClinicalContext: "Older adults.",
        discriminatingKeyFeature: "DISPLACEMENT vs INVASION: Liposarcoma arises in the retroperitoneum and pushes the kidney. AML arises FROM the kidney.",
        associatedFindings: "Local invasion.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "B LADDER WALL THICKENING",
    itemNumber: "8.42",
    problemCluster: "bladder wall",
    seriousAlternatives: ["Bladder Outflow Obstruction (BPH)", "Cystitis (Infection)", "Bladder Carcinoma (TCC)", "Schistosomiasis"],
    differentials: [
      {
        diagnosis: "Chronic Outflow Obstruction (BPH)",
        dominantImagingFinding: "Diffuse, smooth thickening with TRABECULATION and DIVERTICULA.",
        distributionLocation: "Diffuse bladder wall.",
        demographicsClinicalContext: "Elderly males. Hesitancy and frequency.",
        discriminatingKeyFeature: "TRABECULATION: Thickened detrusor muscle bundles giving a 'Swiss-cheese' wall appearance. Enlarged PROSTATE (>30cc).",
        associatedFindings: "Large post-void residual volume.",
        complicationsSeriousAlternatives: "Hydronephrosis and renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acute Cystitis",
        dominantImagingFinding: "Diffuse wall thickening, often focused at the base. NO trabeculation early on.",
        distributionLocation: "Bladder base and trigone.",
        demographicsClinicalContext: "Females common. Dysuria and frequency.",
        discriminatingKeyFeature: "ACUTE presentation and response to antibiotics. Bladder volume is often small due to irritability.",
        associatedFindings: "Debris in the bladder (pyuria).",
        complicationsSeriousAlternatives: "Ascending pyelonephritis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Bladder Carcinoma (TCC/SCC)",
        dominantImagingFinding: "Focal, irregular, asymmetric thickening or a solid sessile mass.",
        distributionLocation: "Anywhere. Trigone common.",
        demographicsClinicalContext: "Smokers. Older adults. Painless haematuria.",
        discriminatingKeyFeature: "ASYMMETRY: Focal nodular thickening is malignant until proven otherwise. Lacks the smooth symmetry of obstruction.",
        associatedFindings: "Ureteric obstruction.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Schistosomiasis",
        dominantImagingFinding: "Bladder wall CALCIFICATION (linear). Small, contracted bladder.",
        distributionLocation: "Entire bladder wall.",
        demographicsClinicalContext: "History of travel to endemic areas (Egypt/Africa).",
        discriminatingKeyFeature: "LINEAR CALCIFICATION: Fine calcification outlining the entire bladder wall. High risk of Squamous Cell Carcinoma.",
        associatedFindings: "Ureteric calcification.",
        complicationsSeriousAlternatives: "Bladder SCC.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "ECTOPIC GESTATION",
    itemNumber: "13.16",
    problemCluster: "ectopic pregnancy",
    seriousAlternatives: ["Tubal Pregnancy", "Ruptured Ectopic", "Corpus Luteum (Mimic)", "Miscarriage"],
    differentials: [
      {
        diagnosis: "Tubal Ectopic (Unruptured)",
        dominantImagingFinding: "Extra-uterine gestational sac with a THICK VASCULAR RIM (Ring of Fire). Empty uterus.",
        distributionLocation: "Ampulla of the fallopian tube (95%).",
        demographicsClinicalContext: "Positive pregnancy test. Empty uterus on US. Adnexal mass.",
        discriminatingKeyFeature: "ADXENAL MASS and EMPTY UTERUS. The 'Ring of Fire' Doppler sign is highly suggestive. b-hCG >1500 with no IUP.",
        associatedFindings: "Decidual reaction in the uterus (pseudogestational sac).",
        complicationsSeriousAlternatives: "Rupture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ruptured Ectopic Pregnancy",
        dominantImagingFinding: "Complex adnexal mass and LARGE volume of free fluid (HAEMOPERITONEUM).",
        distributionLocation: "Pouch of Douglas and Morison's pouch.",
        demographicsClinicalContext: "Acute severe pelvic pain and septic/haemorrhagic shock. Collapse.",
        discriminatingKeyFeature: "ECHOGENIC FREE FLUID: The fluid contains low-level echoes representing blood clots. Life-threatening EMERGENCY.",
        associatedFindings: "Absence of a clear gestational sac.",
        complicationsSeriousAlternatives: "Death from haemorrhage (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Corpus Luteum Cyst (Mimic)",
        dominantImagingFinding: "Thick-walled, vascular ovarian cyst. Can mimic the 'Ring of Fire'.",
        distributionLocation: "Within the ovary.",
        demographicsClinicalContext: "Normal early pregnancy.",
        discriminatingKeyFeature: "OVARIAN LOCATION: The CL is within the ovary. The ectopic is typically separate from the ovary (90%). Moveable relative to ovary.",
        associatedFindings: "Identifiable intrauterine pregnancy (IUP).",
        complicationsSeriousAlternatives: "None (Normal).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S UBARACHNOID HAEMORRHAGE",
    itemNumber: "12.7",
    problemCluster: "SAH",
    seriousAlternatives: ["Aneurysmal Rupture (85%)", "Traumatic SAH", "Perimesencephalic Non-aneurysmal", "RCVS"],
    differentials: [
      {
        diagnosis: "Aneurysmal Rupture",
        dominantImagingFinding: "High-attenuation blood in the Basal Cisterns and Sylvian fissures. 'Star-like' pattern.",
        distributionLocation: "Basal cisterns focus. Characteristically follows the site of the aneurysm (e.g. ACom, PCom).",
        demographicsClinicalContext: "Sudden onset 'THUNDERCLAP' headache ('Worst ever'). Risk factors: Smoking, HTN, ADPKD.",
        discriminatingKeyFeature: "DISTRIBUTION in the basal cisterns. 85% of spontaneous SAH is due to a ruptured berry aneurysm.",
        associatedFindings: "Hydrocephalus and intracranial haematoma.",
        complicationsSeriousAlternatives: "Vasospasm (days 4-14) and re-bleeding (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Traumatic SAH",
        dominantImagingFinding: "Blood restricted to the peripheral sulci over the convexities. Characteristically SPARES the basal cisterns.",
        distributionLocation: "Peripheral cortical sulci.",
        demographicsClinicalContext: "History of head trauma.",
        discriminatingKeyFeature: "PERIPHERAL focus and history of trauma. Associated with contusions and skull fractures.",
        associatedFindings: "Subdural or epidural haematoma.",
        complicationsSeriousAlternatives: "Intracranial hypertension.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Perimesencephalic Non-aneurysmal SAH",
        dominantImagingFinding: "Blood strictly localized to the cisterns anterior to the PONS and MIDBRAIN. Spares the Sylvian fissures.",
        distributionLocation: "Pre-pontine and perimesencephalic cisterns.",
        demographicsClinicalContext: "Thunderclap headache but patient is often clinically stable. Benign course.",
        discriminatingKeyFeature: "LOCALIZATION: Blood is confined to the perimesencephalic region. 100% negative angiography for aneurysm.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None (Excellent prognosis).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "SUPRASELLAR MASS",
    itemNumber: "12.37",
    problemCluster: "suprasellar mass",
    seriousAlternatives: ["Craniopharyngioma", "Pituitary Macroadenoma", "Meningioma", "Optic Nerve Glioma"],
    differentials: [
      {
        diagnosis: "Craniopharyngioma",
        dominantImagingFinding: "Complex cystic and solid mass. Calcification (90%) and enhancement. 'MACHINERY OIL' fluid.",
        distributionLocation: "Suprasellar space. Displaces the optic chiasm.",
        demographicsClinicalContext: "Bimodal: Children (5-15y) or adults (50-60y). Visual field defects (Bitemporal hemianopia).",
        discriminatingKeyFeature: "CALCIFICATION and cystic components in a child. In adults, papillary type is less often calcified.",
        associatedFindings: "Endocrine dysfunction (Diabetes insipidus).",
        complicationsSeriousAlternatives: "Hydrocephalus (obstructing the Foramen of Monro).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pituitary Macroadenoma",
        dominantImagingFinding: "Solid mass arising from the sella and extending upwards. 'FIGURE-OF-EIGHT' or 'SNOWMAN' shape.",
        distributionLocation: "Intrasellar and suprasellar. Centered on the sella turcica.",
        demographicsClinicalContext: "Adults. Bitemporal hemianopia. Prolactinoma symptoms.",
        discriminatingKeyFeature: "SELLA EXPANSION: The sella is always enlarged. The mass is contiguous with the pituitary gland. Rarely calcifies.",
        associatedFindings: "Cavernous sinus invasion.",
        complicationsSeriousAlternatives: "Pituitary apoplexy (Haemorrhage - URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Suprasellar Meningioma",
        dominantImagingFinding: "Broad-based dural mass. Intense uniform enhancement. DURAL TAIL (60%).",
        distributionLocation: "Planum sphenoidale or tuberculum sellae.",
        demographicsClinicalContext: "Middle-aged females.",
        discriminatingKeyFeature: "NORMAL SELLA: Unlike adenoma, the sella is of normal size. Dural tail and hyperostosis of the planum.",
        associatedFindings: "Visual loss.",
        complicationsSeriousAlternatives: "Vessel encasement.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Optic Nerve Glioma",
        dominantImagingFinding: "Fusiform enlargement of the optic chiasm and nerves. Bright on T2.",
        distributionLocation: "Optic chiasm focus.",
        demographicsClinicalContext: "Children. Strong association with NF1 (50%).",
        discriminatingKeyFeature: "CONTINUITY with the optic nerves and NF1 association. Lacks calcification (unlike craniopharyngioma).",
        associatedFindings: "NF1 signs elsewhere.",
        complicationsSeriousAlternatives: "Blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "F RAYING OF METAPHYSES",
    itemNumber: "14.21",
    problemCluster: "metaphyseal fraying",
    seriousAlternatives: ["Rickets", "Hypophosphatasia", "Metaphyseal Dysplasia", "Leukaemia (Mimic)"],
    differentials: [
      {
        diagnosis: "Rickets (Any cause)",
        dominantImagingFinding: "FRAYING, CUPPING, and WIDENING of the metaphyses. Widened growth plate (physis).",
        distributionLocation: "Rapidly growing bones: Wrist (Ulna), Knee (Distal Femur). Symmetrical.",
        demographicsClinicalContext: "Children. Vitamin D deficiency or renal disease. Bowed legs and 'Rachitic Rosary'.",
        discriminatingKeyFeature: "WIDENED PHYSIS and cupping. Generalised osteopenia. Delayed bone age.",
        associatedFindings: "Looser's zones (osteomalacia in adults).",
        complicationsSeriousAlternatives: "Pathological fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hypophosphatasia",
        dominantImagingFinding: "Severe fraying and IRREGULAR lucent defects in the metaphysis extending into the diaphysis.",
        distributionLocation: "Generalized. More severe than rickets.",
        demographicsClinicalContext: "Infants. Low serum alkaline phosphatase (100% specific).",
        discriminatingKeyFeature: "LOW ALKALINE PHOSPHATASE: Rickets has HIGH Alk Phos. Hypophosphatasia has LOW. Severe bowing.",
        associatedFindings: "Premature loss of teeth.",
        complicationsSeriousAlternatives: "Infantile death.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Metaphyseal Chondrodysplasia (Schmid)",
        dominantImagingFinding: "Symmetric fraying and cupping. NORMAL PHYSIS width early on.",
        distributionLocation: "Metaphyses focus.",
        demographicsClinicalContext: "Children. Short stature. Normal blood chemistry.",
        discriminatingKeyFeature: "NORMAL CHEMISTRY (Calcium/PO4/Alk Phos). Rickets has abnormal labs.",
        associatedFindings: "Coxa vara.",
        complicationsSeriousAlternatives: "Severe dwarfism.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "B LADDER OUTFLOW OBSTRUCTION IN a CHILD",
    itemNumber: "14.54",
    problemCluster: "paediatric outflow obstruction",
    seriousAlternatives: ["Posterior Urethral Valves (PUV)", "Ureterocoele (Ectopic)", "Neurogenic Bladder"],
    differentials: [
      {
        diagnosis: "Posterior Urethral Valves (PUV)",
        dominantImagingFinding: "Thick-walled, trabeculated bladder with a dilated posterior urethra. KEYHOLE SIGN.",
        distributionLocation: "Males only. Midline urethra.",
        demographicsClinicalContext: "Male neonates. Palpable bladder and poor stream. 100% specific gender.",
        discriminatingKeyFeature: "KEYHOLE SIGN: Dilation of the posterior urethra above the valves. VCUG is diagnostic.",
        associatedFindings: "Bilateral hydroureter and renal dysplasia.",
        complicationsSeriousAlternatives: "Potter sequence and renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ectopic Ureterocoele (Duplex System)",
        dominantImagingFinding: "Smooth filling defect in the bladder base. Often associated with upper pole hydroureter.",
        distributionLocation: "Bladder base (Trigone).",
        demographicsClinicalContext: "Children (Females 4:1). Recurrent UTIs.",
        discriminatingKeyFeature: "DUPLEX SYSTEM: Weigert-Meyer Law. Upper pole ureter is ectopic and frequently forms a ureterocoele causing obstruction.",
        associatedFindings: "Upper pole hydronephrosis.",
        complicationsSeriousAlternatives: "Urosepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Neurogenic Bladder (Spina Bifida)",
        dominantImagingFinding: "Thickened, 'CHRISTMAS-TREE' or pine-cone shaped bladder. Trabeculation.",
        distributionLocation: "Entire bladder wall.",
        demographicsClinicalContext: "Children with Myelomeningocoele or Sacral Agenesis.",
        discriminatingKeyFeature: "SPINAL DEFECT: Associated with a visible or known defect in the lumbosacral spine. Lacks the urethral dilation of PUV.",
        associatedFindings: "Sacral anomalies.",
        complicationsSeriousAlternatives: "VUR and renal scarring.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C RANIOSYNOSTOSIS",
    itemNumber: "14.68",
    problemCluster: "fused sutures",
    seriousAlternatives: ["Sagittal (Scaphocephaly)", "Coronal (Brachycephaly)", "Metopic (Trigonocephaly)", "Apert Syndrome"],
    differentials: [
      {
        diagnosis: "Sagittal Synostosis",
        dominantImagingFinding: "Long, narrow skull (SCAPHOCEPHALY or Dolichocephaly). Premature fusion of the sagittal suture.",
        distributionLocation: "Sagittal suture. 50% of all cases.",
        demographicsClinicalContext: "Most common synostosis. Usually isolated.",
        discriminatingKeyFeature: "SCAPHOCEPHALY: Increased AP diameter and decreased biparietal diameter. No associated facial anomalies.",
        associatedFindings: "Beaten copper appearance (Copper-beaten skull) if intracranial pressure is high.",
        complicationsSeriousAlternatives: "Raised ICP.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Coronal Synostosis (Unilateral)",
        dominantImagingFinding: "Asymmetric skull (PLAGIOCEPHALY). HARLEQUIN EYE appearance on the affected side.",
        distributionLocation: "Unilateral coronal suture.",
        demographicsClinicalContext: "Children. Facial asymmetry.",
        discriminatingKeyFeature: "HARLEQUIN EYE: Elevation of the superior orbital rim and sphenoid wing on the fused side.",
        associatedFindings: "Deviation of the nasal septum.",
        complicationsSeriousAlternatives: "Vision loss.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Apert Syndrome",
        dominantImagingFinding: "Bilateral coronal synostosis (BRACHYCEPHALY) with complex syndactyly of hands and feet.",
        distributionLocation: "Bilateral coronal sutures.",
        demographicsClinicalContext: "Genetic syndrome. Midface hypoplasia.",
        discriminatingKeyFeature: "SYNDACTYLY: 'Mitten-hand' deformity is diagnostic for Apert's when combined with synostosis.",
        associatedFindings: "Cleft palate and hydrocephalus.",
        complicationsSeriousAlternatives: "Severe raised ICP.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "OEDEMATOUS BREAST",
    itemNumber: "10.10",
    problemCluster: "breast oedema",
    seriousAlternatives: ["Inflammatory Breast CA", "Mastitis", "Lymphatic Obstruction (Axilla)", "Congestive Heart Failure"],
    differentials: [
      {
        diagnosis: "Inflammatory Breast Carcinoma",
        dominantImagingFinding: "Skin thickening (>2mm) and diffuse increased density. RETICULAR pattern. No discrete mass in 50%.",
        distributionLocation: "Unilateral. Entire breast.",
        demographicsClinicalContext: "Adults. Peau d'orange skin and warmth. NO response to antibiotics.",
        discriminatingKeyFeature: "NON-RESPONSE to antibiotics and absence of a focal abscess. Axillary adenopathy is almost always present.",
        associatedFindings: "Axillary node involvement.",
        complicationsSeriousAlternatives: "Rapid metastatic death (Highly aggressive).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acute Mastitis / Abscess",
        dominantImagingFinding: "Skin thickening and ill-defined mass (abscess). Internal echoes on US.",
        distributionLocation: "Segmental or diffuse. Unilateral.",
        demographicsClinicalContext: "Lactating women. Fever, pain, and redness. Dramatic response to antibiotics.",
        discriminatingKeyFeature: "FEVER and response to antibiotics. US shows a complex fluid collection if an abscess is present.",
        associatedFindings: "Nipple discharge.",
        complicationsSeriousAlternatives: "Skin necrosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Congestive Heart Failure (Breast)",
        dominantImagingFinding: "Bilateral skin thickening and trabecular coarsening.",
        distributionLocation: "BILATERAL and SYMMETRIC. Dependent portion of the breast.",
        demographicsClinicalContext: "Elderly with CHF. Generalised oedema.",
        discriminatingKeyFeature: "BILATERALITY: Symmetrical thickening without pain or nodes is diagnostic of a systemic cause (Heart/Renal failure).",
        associatedFindings: "Cardiomegaly and pleural effusions.",
        complicationsSeriousAlternatives: "None (related to breast).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M ALIGNANT CORONARY ARTERY ANOMALIES IN THE ADULT",
    itemNumber: "5.11",
    problemCluster: "coronary variants",
    seriousAlternatives: ["Inter-arterial Course", "Myocardial Bridging", "ALCAPA (Childhood)"],
    differentials: [
      {
        diagnosis: "Inter-arterial Course (Malignant)",
        dominantImagingFinding: "Coronary artery arises from the wrong sinus and passes BETWEEN THE AORTA AND PULMONARY ARTERY.",
        distributionLocation: "Origin from the contralateral sinus (e.g. RCA from left sinus).",
        demographicsClinicalContext: "Young adults. Sudden cardiac death during or after exercise.",
        discriminatingKeyFeature: "INTER-ARTERIAL path: Compression of the coronary between the great vessels during exercise leads to ischaemia.",
        associatedFindings: "Slit-like orifice and acute take-off angle.",
        complicationsSeriousAlternatives: "Sudden Cardiac Death (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Myocardial Bridging",
        dominantImagingFinding: "Segment of a coronary artery (usually LAD) travels WITHIN the myocardium.",
        distributionLocation: "Mid-LAD focus.",
        demographicsClinicalContext: "Extremely common incidental finding (25% on CT). Usually benign.",
        discriminatingKeyFeature: "SYSTOLIC NARROWING: The artery is compressed during systole but normal in diastole. Best seen on invasive angiography.",
        associatedFindings: "Early atherosclerosis proximal to the bridge.",
        complicationsSeriousAlternatives: "Ischaemia (if long/deep).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "ALCAPA (Bland-White-Garland)",
        dominantImagingFinding: "LCA arises from the Pulmonary Artery. Large collateral vessels.",
        distributionLocation: "LCA focus.",
        demographicsClinicalContext: "Typically presents in infancy. Rare adults show massive tortuous collaterals.",
        discriminatingKeyFeature: "PULMONARY origin of the LCA and 'Steal' phenomenon into the low-pressure PA.",
        associatedFindings: "Endocardial fibroelastosis.",
        complicationsSeriousAlternatives: "Infantile MI.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ORBITAL MASS LESIONS",
    itemNumber: "11.1",
    problemCluster: "orbital mass",
    seriousAlternatives: ["Orbital Pseudotumor", "Cavernous Haemangioma", "Optic Nerve Glioma", "Lymphoma"],
    differentials: [
      {
        diagnosis: "Orbital Pseudotumor (Idiopathic Inflammation)",
        dominantImagingFinding: "Ill-defined enhancing soft tissue mass. Involves the EXTRAOCULAR MUSCLES including the TENDONS.",
        distributionLocation: "Unilateral common. Can involve any part of the orbit.",
        demographicsClinicalContext: "Adults. ACUTE PAINFUL proptosis. Rapid response to steroids.",
        discriminatingKeyFeature: "TENDON INVOLVEMENT: Unlike Graves (which spares tendons), pseudotumor involves the entire muscle and tendon insertion. PAINFUL.",
        associatedFindings: "Uveitis or Scleritis.",
        complicationsSeriousAlternatives: "Vision loss.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Cavernous Haemangioma (Adult)",
        dominantImagingFinding: "Well-circumscribed, ovoid, intraconal mass. Slow progressive enhancement.",
        distributionLocation: "Intraconal (behind the globe).",
        demographicsClinicalContext: "Middle-aged adults. Chronic PAINLESS proptosis.",
        discriminatingKeyFeature: "WELL-DEFINED margin and slow FILLING on delays. Most common benign orbital mass in adults.",
        associatedFindings: "Remodeling of the orbital walls.",
        complicationsSeriousAlternatives: "Optic nerve compression.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Thyroid Orbitopathy (Graves')",
        dominantImagingFinding: "Enlargement of the extraocular muscle bellies with SPARING OF THE TENDONS.",
        distributionLocation: "Bilateral and symmetric. Inferior Rectus (IM SLOW mnemonic).",
        demographicsClinicalContext: "Graves' disease. Painless proptosis and lid lag.",
        discriminatingKeyFeature: "TENDON SPARING and bilateral involvement. I'M SLOW: Inferior > Medial > Superior > Lateral rectus.",
        associatedFindings: "Increased retro-orbital fat.",
        complicationsSeriousAlternatives: "Optic neuropathy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "O PAQUE MAXILLARY ANTRUM",
    itemNumber: "11.10",
    problemCluster: "opaque sinus",
    seriousAlternatives: ["Acute Sinusitis", "Antrochoanal Polyp", "Sinonasal Malignancy", "Silent Sinus Syndrome"],
    differentials: [
      {
        diagnosis: "Acute Maxillary Sinusitis",
        dominantImagingFinding: "Air-fluid level and mucosal thickening. NO bone destruction.",
        distributionLocation: "Maxillary sinus. Unilateral or bilateral.",
        demographicsClinicalContext: "Fever, facial pain, and purulent discharge.",
        discriminatingKeyFeature: "AIR-FLUID LEVEL and lack of bone erosion. Response to treatment.",
        associatedFindings: "Other sinus involvement (Pansinusitis).",
        complicationsSeriousAlternatives: "Orbital cellulitis (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Antrochoanal Polyp",
        dominantImagingFinding: "Opaque antrum with a soft tissue mass extending through a widened ostium into the NASOPHARYNX.",
        distributionLocation: "Maxillary sinus extending into the choana.",
        demographicsClinicalContext: "Young adults. Unilateral nasal obstruction.",
        discriminatingKeyFeature: "WIDENED OSTIUM: The polyp passes through the accessory ostium and hangs in the nasopharynx.",
        associatedFindings: "Opaque sinus.",
        complicationsSeriousAlternatives: "Airway obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sinonasal Carcinoma (SCC)",
        dominantImagingFinding: "Solid soft tissue mass associated with AGGRESSIVE BONE DESTRUCTION.",
        distributionLocation: "Unilateral.",
        demographicsClinicalContext: "Older adults. Smokers or wood-dust exposure. Occult bleeding.",
        discriminatingKeyFeature: "BONE DESTRUCTION: Frank destruction of the sinus walls is pathognomonic for malignancy or aggressive fungal infection.",
        associatedFindings: "Nodal metastases.",
        complicationsSeriousAlternatives: "Orbital or intracranial invasion.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Silent Sinus Syndrome",
        dominantImagingFinding: "SMALL, opacified, and collapsed maxillary sinus. ENOPHTHALMOS.",
        distributionLocation: "Unilateral.",
        demographicsClinicalContext: "Chronic painless facial asymmetry.",
        discriminatingKeyFeature: "SINUS COLLAPSE: The volume of the sinus is reduced, and the orbital floor is sucked downwards. No bone destruction.",
        associatedFindings: "Downward displacement of the globe.",
        complicationsSeriousAlternatives: "Diplopia.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 7 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_7_DATA) {
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
  console.log("Batch 7 Complete!");
}

main().catch(console.error);