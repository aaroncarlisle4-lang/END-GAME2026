import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_3_DATA = [
  {
    pattern: "M ULTIPLE SCLEROTIC BONE LESIONS",
    itemNumber: "1.3",
    problemCluster: "multiple sclerosis",
    seriousAlternatives: ["Osteoblastic Metastases (Prostate/Breast)", "Lymphomatous Sclerosis", "Mastocytosis"],
    differentials: [
      {
        diagnosis: "Osteoblastic Metastases",
        dominantImagingFinding: "Multiple ill-defined sclerotic foci of varying sizes. Loss of normal trabecular architecture. PEDICLE INVOLVEMENT common (90%).",
        distributionLocation: "Axial skeleton (Spine, Pelvis, Ribs) and proximal appendicular skeleton. Characteristically follows red marrow distribution.",
        demographicsClinicalContext: "Older adults (>50y). Known PROSTATE carcinoma (males) or BREAST cancer (females). Elevated serum Alkaline Phosphatase.",
        discriminatingKeyFeature: "KNOWN PRIMARY CANCER and intensely HOT bone scan. Multiple disparate lesions rather than the contiguous expansion of Paget's.",
        associatedFindings: "Pathological fractures and paraspinal soft tissue masses (MRI).",
        complicationsSeriousAlternatives: "Spinal cord compression (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Sclerotic Myeloma (POEMS Syndrome)",
        dominantImagingFinding: "Rare (3%) sclerotic manifestation of Multiple Myeloma. Well-defined sclerotic lesions, sometimes with a spicuated 'sunburst' appearance.",
        distributionLocation: "Axial and appendicular skeleton.",
        demographicsClinicalContext: "POEMS: Polyneuropathy, Organomegaly, Endocrinopathy, M-protein, Skin changes. Older adults.",
        discriminatingKeyFeature: "SYSTEMIC POEMS features and elevated M-protein. Unlike typical myeloma, these lesions are COLD or only mildly warm on bone scan.",
        associatedFindings: "Hepatosplenomegaly and lymphadenopathy.",
        complicationsSeriousAlternatives: "Severe progressive peripheral neuropathy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Osteopoikilosis",
        dominantImagingFinding: "Multiple small (1-10mm), uniform, very dense nodules ('Spotted Bone Disease'). Homogeneous and well-defined.",
        distributionLocation: "Peri-articular clustering (around epiphyses and metaphyses of joints). CHARACTERISTICALLY SPARES THE SKULL AND SPINE (Axial skeleton).",
        demographicsClinicalContext: "Asymptomatic incidental finding. Autosomal Dominant inheritance.",
        discriminatingKeyFeature: "PERI-ARTICULAR clustering and COLD bone scan. Stability over years. Lack of symptoms.",
        associatedFindings: "Dermatofibrosis lenticularis (Buschke-Ollendorff syndrome).",
        complicationsSeriousAlternatives: "None (STABLE).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Mastocytosis (Sclerotic Phase)",
        dominantImagingFinding: "Diffuse or patchy osteosclerosis interspersed with small areas of radiolucency. Thickened trabeculae.",
        distributionLocation: "Diffuse marrow-bearing skeleton. Symmetric.",
        demographicsClinicalContext: "URTICARIA PIGMENTOSA (skin rash). Episodic flushing, tachycardia, and diarrhea (histamine release).",
        discriminatingKeyFeature: "SKIN RASH (Darier Sign) and absence of bone expansion. Normal serum Alk Phos (usually).",
        associatedFindings: "Massive splenomegaly and peptic ulcer disease.",
        complicationsSeriousAlternatives: "Anaphylaxis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "EROSION OR ABSENCE OF THE OUTER END OF THE CLAVICLE",
    itemNumber: "1.32",
    problemCluster: "distal clavicle resorption",
    seriousAlternatives: ["Hyperparathyroidism (Renal)", "Rheumatoid Arthritis", "Post-traumatic Osteolysis"],
    differentials: [
      {
        diagnosis: "Hyperparathyroidism (Primary or Secondary)",
        dominantImagingFinding: "SUBPERIOSTEAL RESORPTION of the distal clavicle. Widening of the AC joint space. Lack of significant marginal sclerosis.",
        distributionLocation: "Bilateral and symmetric usually. Often associated with other sites of resorption.",
        demographicsClinicalContext: "Chronic Renal Failure (Secondary) or Parathyroid Adenoma (Primary). High serum PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION on the radial side of 2nd/3rd middle phalanges (PATHOGNOMONIC) and salt-and-pepper skull.",
        associatedFindings: "Brown tumours and soft tissue calcification.",
        complicationsSeriousAlternatives: "Pathological fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Rheumatoid Arthritis (RA)",
        dominantImagingFinding: "Symmetric marginal erosions of the distal clavicle. Tapering of the clavicular end ('Pencil-pointing').",
        distributionLocation: "Bilateral and symmetric. Involves the AC joint and often the glenohumeral joint.",
        demographicsClinicalContext: "Middle-aged females. Positive Rheumatoid Factor or Anti-CCP. Morning stiffness.",
        discriminatingKeyFeature: "SYMMETRIC SMALL JOINT ARTHRITIS (MCPs/PIPs) and periarticular osteoporosis. Clavicular end appears 'whittled'.",
        associatedFindings: "Rotator cuff tear and subluxation.",
        complicationsSeriousAlternatives: "Joint instability.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Post-Traumatic Osteolysis",
        dominantImagingFinding: "Focal resorption of the distal 1-2cm of the clavicle following an acute injury or repetitive stress.",
        distributionLocation: "UNILATERAL (dominant arm). Strictly involving the distal clavicle; the acromion is spared.",
        demographicsClinicalContext: "Young adults, weightlifters, or manual labourers. History of prior AC joint sprain.",
        discriminatingKeyFeature: "UNILATERAL distribution and history of weightlifting/trauma. Normal bone density and normal PTH.",
        associatedFindings: "Local tenderness over the AC joint.",
        complicationsSeriousAlternatives: "Chronic pain.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Scleroderma (Systemic Sclerosis)",
        dominantImagingFinding: "Acro-osteolysis of the distal clavicle combined with soft tissue loss and calcification.",
        distributionLocation: "Bilateral. Also involves the distal phalangeal tufts.",
        demographicsClinicalContext: "Female with Raynaud's phenomenon and tight skin.",
        discriminatingKeyFeature: "SHEET-LIKE SOFT TISSUE CALCIFICATION (Calcinosis Cutis) and fingertip tuft resorption.",
        associatedFindings: "Oesophageal atony and lung fibrosis.",
        complicationsSeriousAlternatives: "Renal crisis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "P ULMONARY AIR CYSTS",
    itemNumber: "4.5",
    problemCluster: "cystic lung disease",
    seriousAlternatives: ["LAM (Women)", "LCH (Smokers)", "PJP (HIV)", "BHD Syndrome"],
    differentials: [
      {
        diagnosis: "Lymphangioleiomyomatosis (LAM)",
        dominantImagingFinding: "Diffuse, thin-walled, UNIFORM air cysts (2-20mm). Normal intervening lung parenchyma.",
        distributionLocation: "Diffuse and symmetric. NO zonal sparing (includes the Costophrenic Angles).",
        demographicsClinicalContext: "Exclusively females of childbearing age. Associated with Tuberous Sclerosis (TSC) in 30-40%.",
        discriminatingKeyFeature: "COSTOPHRENIC ANGLE INVOLVEMENT (unlike LCH which spares them). Associated with chylous effusions and renal AMLs.",
        associatedFindings: "Recurrent pneumothoraces (80%) and Chylous pleural effusions.",
        complicationsSeriousAlternatives: "Respiratory failure requiring lung transplant.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Langerhans Cell Histiocytosis (PLCH)",
        dominantImagingFinding: "Bizarre-shaped, thick-walled cysts and centrilobular nodules. Cysts often appear 'clover-leaf' or 'bilobed'.",
        distributionLocation: "Upper and mid-zone predominance. CHARACTERISTIC SPARING OF THE COSTOPHRENIC ANGLES.",
        demographicsClinicalContext: "Strong association with SMOKING (>95%). Young to middle-aged adults.",
        discriminatingKeyFeature: "COSTOPHRENIC ANGLE SPARING and SMOKING history. Cysts evolve from nodules.",
        associatedFindings: "Upper lobe reticulonodular shadowing. No effusions.",
        complicationsSeriousAlternatives: "Secondary pulmonary hypertension.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pneumocystis Jirovecii Pneumonia (PJP)",
        dominantImagingFinding: "Ground-glass opacities (GGO) with superimposed air-filled cysts (Pneumatoceles). Cysts are often perihilar.",
        distributionLocation: "Perihilar and mid-zone predominance.",
        demographicsClinicalContext: "Immunocompromised (HIV with CD4 <200, post-transplant). Profound hypoxia out of proportion to X-ray.",
        discriminatingKeyFeature: "PERIHILAR GGO and profound hypoxia. Cysts are transient and appear during the acute phase.",
        associatedFindings: "Gallium-67 scan shows diffuse uptake.",
        complicationsSeriousAlternatives: "Pneumothorax (difficult to manage).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Birt-Hogg-Dubé (BHD) Syndrome",
        dominantImagingFinding: "Multiple thin-walled cysts of varying sizes, often large and irregular.",
        distributionLocation: "Subpleural and BASAL predominance. Predilection for the lung bases.",
        demographicsClinicalContext: "AD inheritance. Triad: Lung cysts, Renal tumors (Chromophobe/Oncocytoma), and Skin lesions (Fibrofolliculomas).",
        discriminatingKeyFeature: "BASAL distribution and associated RENAL MASSES. Genetic testing for folliculin gene.",
        associatedFindings: "Spontaneous pneumothorax.",
        complicationsSeriousAlternatives: "Renal Cell Carcinoma (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "S EPTAL (KERLEY B) LINES",
    itemNumber: "4.14",
    problemCluster: "interstitial thickening",
    seriousAlternatives: ["Pulmonary Oedema (Acute)", "Lymphangitis Carcinomatosa", "Sarcoidosis"],
    differentials: [
      {
        diagnosis: "Left Ventricular Failure (Pulmonary Oedema)",
        dominantImagingFinding: "Short (1-2cm) horizontal lines at the lung bases, perpendicular to the pleura (Kerley B). Perihilar haze and Kerley A lines (longer, radiating from hilum).",
        distributionLocation: "Basal and peripheral (B-lines); Perihilar (A-lines). Usually bilateral.",
        demographicsClinicalContext: "Acute MI, valvular disease, or fluid overload. Presents with orthopnoea and paroxysmal nocturnal dyspnoea.",
        discriminatingKeyFeature: "CARDIOMEGALY, pleural effusions, and cephalisation of vessels. Rapid clearance with diuretics (<24-48h).",
        associatedFindings: "Bat-wing alveolar opacities if severe.",
        complicationsSeriousAlternatives: "Cardiogenic shock.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Lymphangitis Carcinomatosa",
        dominantImagingFinding: "Coarse septal thickening ('Beaded' septal appearance). Lung volumes are typically reduced.",
        distributionLocation: "Often UNILATERAL or asymmetric. Diffuse but often more prominent in the lower zones.",
        demographicsClinicalContext: "Known primary malignancy (Breast, Lung, GI, Pancreas). Profound progressive dyspnoea and cachexia.",
        discriminatingKeyFeature: "ASYMMETRY and BEADED septal thickening on HRCT. Absence of cardiomegaly. Refractory to diuretics.",
        associatedFindings: "Hilar and mediastinal lymphadenopathy. Pleural effusions.",
        complicationsSeriousAlternatives: "Rapidly fatal respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sarcoidosis (Stage II/III)",
        dominantImagingFinding: "Septal thickening with fine micronodular pattern along the septa and bronchovascular bundles.",
        distributionLocation: "Upper and mid-zone predominance. Bilateral and symmetric.",
        demographicsClinicalContext: "Young adults (20-40y). Often asymptomatic or mild cough. High serum ACE level.",
        discriminatingKeyFeature: "SYMMETRIC HILAR ADENOPATHY (1-2-3 sign / Garland Triad) and perilymphatic distribution of nodules.",
        associatedFindings: "Skin erythema nodosum and uveitis.",
        complicationsSeriousAlternatives: "Progression to Stage IV (Fibrosis).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Alveolar Proteinosis",
        dominantImagingFinding: "Profound septal thickening superimposed on ground-glass opacity, creating a 'CRAZY-PAVING' pattern.",
        distributionLocation: "Diffuse but often with GEOGRAPHIC SPARING of some lobules.",
        demographicsClinicalContext: "Adults 30-50y. Progressive dyspnoea. Milky fluid on Bronchoalveolar Lavage (BAL).",
        discriminatingKeyFeature: "GEOGRAPHIC SPARING and crazy-paving pattern without cardiomegaly or effusions.",
        associatedFindings: "PAS-positive alveolar material.",
        complicationsSeriousAlternatives: "Superinfection with Nocardia.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "N EPHROCALCINOSIS",
    itemNumber: "7.11",
    problemCluster: "renal calcification",
    seriousAlternatives: ["Hyperparathyroidism", "Medullary Sponge Kidney", "Renal Tubular Acidosis (Type 1)"],
    differentials: [
      {
        diagnosis: "Hyperparathyroidism (Primary)",
        dominantImagingFinding: "Bilateral medullary nephrocalcinosis (90%). Calcification is often faint and granular.",
        distributionLocation: "Medullary pyramids. Bilateral.",
        demographicsClinicalContext: "Middle-aged females. High serum Calcium and PTH. Stones, bones, abdominal groans, and psychic moans.",
        discriminatingKeyFeature: "SYSTEMIC HYPERCALCAEMIA and pathognomonic subperiosteal resorption in the hands.",
        associatedFindings: "Nephrolithiasis (stones in the collecting system).",
        complicationsSeriousAlternatives: "Renal failure and pathological fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Medullary Sponge Kidney (MSK)",
        dominantImagingFinding: "Bouquet of flowers appearance on IVP. Ectatic collecting ducts (tubular ectasia) containing small stones.",
        distributionLocation: "Bilateral (70%) or unilateral. Restricted to the pyramids.",
        demographicsClinicalContext: "Young adults. Often asymptomatic or presents with recurrent stones/UTI. Normal serum Calcium.",
        discriminatingKeyFeature: "TUBULAR ECTASIA (Brush-like striations) radiating from the papillae. Normal serum chemistry.",
        associatedFindings: "Increased risk of stones and infection.",
        complicationsSeriousAlternatives: "Urosepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Renal Tubular Acidosis (RTA) - Type 1 (Distal)",
        dominantImagingFinding: "DENSE, coarse medullary nephrocalcinosis. Usually the most severe calcification of all causes.",
        distributionLocation: "Medullary pyramids. Symmetric.",
        demographicsClinicalContext: "Inability to acidify urine (pH >5.5). Associated with autoimmune diseases (Sjögren's).",
        discriminatingKeyFeature: "URINARY pH >5.5 despite systemic acidosis. Coarse dense calcification.",
        associatedFindings: "Osteomalacia and rickets.",
        complicationsSeriousAlternatives: "Severe growth retardation in children.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Primary Oxalosis",
        dominantImagingFinding: "CORTICAL AND MEDULLARY nephrocalcinosis. Progresses rapidly to small, dense 'putty' kidneys.",
        distributionLocation: "Both Cortex and Medulla (rare). Global renal density.",
        demographicsClinicalContext: "Children. AR inheritance. Deficiency of alanine-glyoxylate aminotransferase.",
        discriminatingKeyFeature: "CORTICAL CALCIFICATION (highly unusual) and rapid progression to end-stage renal failure in childhood.",
        associatedFindings: "Extra-renal oxalosis (Heart, Bone marrow).",
        complicationsSeriousAlternatives: "Early childhood death from renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "MULTIPLE RING-ENHANCING LESIONS",
    itemNumber: "10.11",
    problemCluster: "brain ring enhancement",
    seriousAlternatives: ["Cerebral Abscess (URGENT)", "Glioblastoma (Multifocal)", "Metastases"],
    differentials: [
      {
        diagnosis: "Metastases",
        dominantImagingFinding: "Multiple, well-defined, thin-walled ring-enhancing lesions. DISPROPORTIONATE VASEOGENIC OEDEMA.",
        distributionLocation: "GREY-WHITE JUNCTION (watershed areas). Supratentorial (80%) and infratentorial.",
        demographicsClinicalContext: "Older adults. Known primary (Lung, Breast, Melanoma, Renal).",
        discriminatingKeyFeature: "GREY-WHITE JUNCTION location and profound oedema. Central core does NOT restrict on DWI (usually).",
        associatedFindings: "Haemorrhagic components (Melanoma, RCC).",
        complicationsSeriousAlternatives: "Herniation and death.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Cerebral Abscess",
        dominantImagingFinding: "Thin, smooth, uniform ring enhancement. The wall is often THINNER ON THE VENTRICULAR SIDE.",
        distributionLocation: "Variable. Often frontal or temporal lobes.",
        demographicsClinicalContext: "Fever, headache, and focal deficit. Source of infection (Cyanotic heart disease, dental, sinusitis).",
        discriminatingKeyFeature: "CENTRAL RESTRICTED DIFFUSION (DWI High, ADC Low): 100% diagnostic for pyogenic abscess. Double-rim sign.",
        associatedFindings: "Satellite lesions and ventriculitis.",
        complicationsSeriousAlternatives: "Rupture into the ventricle (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Glioblastoma (Multifocal GBM)",
        dominantImagingFinding: "Thick, irregular, 'shaggy' ring enhancement. Central necrosis. CROSSES THE CORPUS CALLOSUM.",
        distributionLocation: "Supratentorial. Characteristically invades white matter tracts.",
        demographicsClinicalContext: "Peak 50-70y. Rapidly progressive neurological decline.",
        discriminatingKeyFeature: "THICK SHAGGY WALL and crossing of midline (Butterfly Glioma). Elevated choline on MRS.",
        associatedFindings: "Haemorrhage and mass effect.",
        complicationsSeriousAlternatives: "Rapid recurrence.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Toxoplasmosis (HIV/AIDS)",
        dominantImagingFinding: "Multiple small ring-enhancing lesions in the deep grey matter.",
        distributionLocation: "BASAL GANGLIA and Thalamus (characteristic).",
        demographicsClinicalContext: "HIV positive with CD4 <100. CD4 count is the most important clinical clue.",
        discriminatingKeyFeature: "ECCENTRIC TARGET SIGN: A small nodule of enhancement along the ring wall (30% specific). Response to anti-toxo treatment in 2 weeks.",
        associatedFindings: "Absence of ependymal spread.",
        complicationsSeriousAlternatives: "Death if untreated.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "B ONE SCLEROSIS WITH A PERIOSTEAL REACTION",
    itemNumber: "1.4",
    problemCluster: "sclerosis with periostitis",
    seriousAlternatives: ["Osteosarcoma", "Ewing Sarcoma", "Chronic Osteomyelitis"],
    differentials: [
      {
        diagnosis: "Chronic Osteomyelitis",
        dominantImagingFinding: "Medullary sclerosis with thick, regular or irregular solid periosteal reaction. SEQUESTRUM (dead bone) and INVOLUCRUM (reactive shell).",
        distributionLocation: "Metaphysis or diaphysis of long bones (Tibia common).",
        demographicsClinicalContext: "Any age. Prior trauma, surgery, or history of poorly treated acute infection.",
        discriminatingKeyFeature: "CLOACA (defect in involucrum) and sequestrum. Sinus tract on MRI. Unlike tumors, typically lacks a huge soft tissue mass.",
        associatedFindings: "Brodie abscess. Soft tissue sinus tracts.",
        complicationsSeriousAlternatives: "Squamous Cell Carcinoma (Marjolin Ulcer) in chronic tracts.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteosarcoma (Conventional)",
        dominantImagingFinding: "Aggressive cloud-like OSTEOMATRIX mineralization. SUNBURST or CODMAN TRIANGLE periosteal reaction.",
        distributionLocation: "Metaphysis of long bones (Knee 60%: Distal Femur, Proximal Tibia).",
        demographicsClinicalContext: "Bimodal: Adolescents (10-25y) or elderly (post-Paget's/Radiation).",
        discriminatingKeyFeature: "SUNBURST reaction and aggressive cortical destruction with an associated LARGE soft tissue mass. Presence of tumor osteoid.",
        associatedFindings: "Skip metastases in the same bone. Lung metastases (often calcified).",
        complicationsSeriousAlternatives: "Early pulmonary metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Ewing Sarcoma",
        dominantImagingFinding: "Permeative bone destruction with ONION-SKIN (lamellated) periosteal reaction. Characteristically lacks osteoid matrix.",
        distributionLocation: "DIAPHYSIS of long bones or flat bones (Pelvis).",
        demographicsClinicalContext: "Children and young adults (5-20y). Presents with pain, fever, and leukocytosis (mimicking infection).",
        discriminatingKeyFeature: "ONION-SKIN reaction and HUGE SOFT TISSUE MASS relative to the bone destruction. Purely lytic or permeative.",
        associatedFindings: "Extra-osseous components. Saucering of the cortex.",
        complicationsSeriousAlternatives: "Rapid systemic dissemination.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Melorheostosis",
        dominantImagingFinding: "Flowing cortical hyperostosis resembling 'MOLTEN WAX' dripping down a candle.",
        distributionLocation: "Monomelic (one limb). Follows a sclerotome distribution. Crosses joints.",
        demographicsClinicalContext: "Usually incidental. May have limb pain or contractures.",
        discriminatingKeyFeature: "MOLTEN WAX appearance. Dense cortical thickening that is strictly eccentric. No destruction or soft tissue mass.",
        associatedFindings: "Joint contractures and skin changes over the affected area.",
        complicationsSeriousAlternatives: "Functional deformity.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "GROSS CARDIOMEGALY ON CHEST X-RAY",
    itemNumber: "5.1",
    problemCluster: "large heart shadow",
    seriousAlternatives: ["Pericardial Tamponade (URGENT)", "Dilated Cardiomyopathy", "Ebstein Anomaly"],
    differentials: [
      {
        diagnosis: "Pericardial Effusion",
        dominantImagingFinding: "WATER-BOTTLE HEART (Flask-shaped). Symmetrical enlargement with sharp margins. Spares the hila.",
        distributionLocation: "Global cardiac shadow enlargement.",
        demographicsClinicalContext: "Uraemia, post-viral, malignancy, or SLE. Sudden increase in heart size on serial films.",
        discriminatingKeyFeature: "RAPID CHANGE in heart size and absence of specific chamber enlargement. EPICARDIAL FAT PAD SIGN (>2mm separation on lateral).",
        associatedFindings: "Electrical alternans on ECG. Small hila (unlike failure).",
        complicationsSeriousAlternatives: "Tamponade: Raised JVP, hypotension, muffled heart sounds (Beck's Triad).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Dilated Cardiomyopathy (DCM)",
        dominantImagingFinding: "Globular heart involving all 4 chambers. Apex points downwards and to the left.",
        distributionLocation: "Global predominance.",
        demographicsClinicalContext: "Alcohol, post-viral, or ischaemic. Heart failure symptoms.",
        discriminatingKeyFeature: "PULMONARY VENOUS CONGESTION (Kerley lines, cephalisation) always accompanies DCM. Pericardial effusion often lacks congestion.",
        associatedFindings: "Pleural effusions and interstitial oedema.",
        complicationsSeriousAlternatives: "Sudden cardiac death from arrhythmia.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Ebstein Anomaly",
        dominantImagingFinding: "MASSIVE cardiomegaly with a 'BOX-SHAPED' cardiac silhouette. Right-sided enlargement.",
        distributionLocation: "Right heart predominant.",
        demographicsClinicalContext: "Neonates (cyanotic) or adults (asymptomatic). Apical displacement of the tricuspid valve.",
        discriminatingKeyFeature: "BOX-SHAPED heart and OLIGEMIC LUNGS (decreased vascularity). The heart is massive but the lungs are clear.",
        associatedFindings: "WPW syndrome on ECG.",
        complicationsSeriousAlternatives: "Right heart failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Multiple Valvular Disease",
        dominantImagingFinding: "Specific chamber prominences (e.g. LA appendage bulge in Mitral Stenosis, LV downward apex in AR).",
        distributionLocation: "Predominantly left-sided unless secondary PH occurs.",
        demographicsClinicalContext: "Rheumatic heart disease history. Heart murmurs.",
        discriminatingKeyFeature: "SPECIFIC CHAMBER ENLARGEMENT and valvular calcification. Unlike the 'water-bottle' of effusion.",
        associatedFindings: "Mitral or Aortic valve calcification.",
        complicationsSeriousAlternatives: "Irreversible heart failure.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "LEFT ATRIAL ENLARGEMENT",
    itemNumber: "5.4",
    problemCluster: "specific chamber enlargement",
    seriousAlternatives: ["Mitral Stenosis", "Mitral Regurgitation", "Left-to-Right Shunt (VSD/PDA)"],
    differentials: [
      {
        diagnosis: "Mitral Stenosis",
        dominantImagingFinding: "LA enlargement with a small or normal LV. Hilar prominence due to Pulmonary Venous Hypertension.",
        distributionLocation: "Left atrium focus.",
        demographicsClinicalContext: "Rheumatic fever history. Opening snap and diastolic rumble.",
        discriminatingKeyFeature: "DOUBLE DENSITY sign (superimposed LA on RA) and SPLAYING OF THE CARINA (>90 degrees). NORMAL LV size.",
        associatedFindings: "Bulging Left Atrial Appendage (3rd mogul) and Kerley B lines.",
        complicationsSeriousAlternatives: "Atrial Fibrillation and Pulmonary Haemosiderosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Mitral Regurgitation",
        dominantImagingFinding: "LA enlargement COMBINED with LV enlargement (apex points down/left).",
        distributionLocation: "Left heart (LA and LV).",
        demographicsClinicalContext: "Pansystolic murmur. Post-MI papillary muscle rupture or MVP.",
        discriminatingKeyFeature: "CONCOMITANT LV ENLARGEMENT. In pure stenosis, the LV is small. In regurgitation, the LV is dilated.",
        associatedFindings: "Right Upper Lobe Pulmonary Oedema (Jet effect).",
        complicationsSeriousAlternatives: "Flash pulmonary oedema.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "VSD / PDA (Left-to-Right Shunt)",
        dominantImagingFinding: "LA and LV enlargement with INCREASED pulmonary vascularity (Plethora).",
        distributionLocation: "Global left heart and pulmonary arteries.",
        demographicsClinicalContext: "Children or young adults. Harsh pansystolic (VSD) or continuous (PDA) murmur.",
        discriminatingKeyFeature: "PULMONARY PLETHORA (enlarged peripheral vessels). Acquired mitral disease usually shows congestion, not plethora.",
        associatedFindings: "Enlarged pulmonary trunk.",
        complicationsSeriousAlternatives: "Eisenmenger Syndrome (Reversal of shunt).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S TRICTURES IN THE SMALL BOWEL",
    itemNumber: "6.15",
    problemCluster: "small bowel narrowing",
    seriousAlternatives: ["Crohn's Disease", "Ischaemic Stricture", "Small Bowel Adenocarcinoma"],
    differentials: [
      {
        diagnosis: "Crohn's Disease",
        dominantImagingFinding: "Long-segment, eccentric strictures with mucosal nodularity (Cobblestone) and deep ulcers (Rose-thorn).",
        distributionLocation: "TERMINAL ILEUM (95%) with SKIP LESIONS. Asymmetric.",
        demographicsClinicalContext: "Young adults. Diarrhea, weight loss, and anal fistulae.",
        discriminatingKeyFeature: "STRING SIGN (narrowed lumen) and FIBROFATTY PROLIFERATION (Creeping fat) separating loops on CT.",
        associatedFindings: "Entero-enteric fistulae and abscesses. Sacroiliitis.",
        complicationsSeriousAlternatives: "Bowel obstruction or perforation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ischaemic Stricture",
        dominantImagingFinding: "Smooth, concentric, tubular stricture with loss of valvulae conniventes. Usually 3-6cm long.",
        distributionLocation: "Watershed areas (Splenic flexure) or site of prior trauma/vascular insult.",
        demographicsClinicalContext: "Elderly with AF or vascular disease. History of severe pain weeks prior.",
        discriminatingKeyFeature: "SMOOTH CONCENTRIC narrowing lacking the nodularity or skip lesions of Crohn's. History of prior ischaemic episode.",
        associatedFindings: "Vascular calcification. Normal mesenteric fat (unlike Crohn's).",
        complicationsSeriousAlternatives: "Chronic obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Adenocarcinoma",
        dominantImagingFinding: "Short-segment (<5cm), sharply demarcated stricture with SHOULDERED MARGINS (Apple-core).",
        distributionLocation: "Duodenum or Proximal Jejunum (most common).",
        demographicsClinicalContext: "Adults >50y. Occult bleeding or iron deficiency anaemia.",
        discriminatingKeyFeature: "APPLE-CORE appearance and VERY SHORT segment. Inflammatory strictures are usually longer.",
        associatedFindings: "Proximal dilatation and regional lymphadenopathy.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Ileocaecal Tuberculosis",
        dominantImagingFinding: "Stricture involving the terminal ileum and CAECUM. Retracted, conical caecum.",
        distributionLocation: "Ileocaecal region (90%). Symmetric.",
        demographicsClinicalContext: "Immigrants or immunocompromised. Fever, night sweats.",
        discriminatingKeyFeature: "STIERLIN SIGN: Rapid emptying of an inflamed segment. Conical caecum and patulous ileocaecal valve.",
        associatedFindings: "Nodal calcification and ascites.",
        complicationsSeriousAlternatives: "Peritoneal TB.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "B ILIARY TRACT DILATATION",
    itemNumber: "6.24",
    problemCluster: "dilated bile ducts",
    seriousAlternatives: ["Choledocholithiasis", "Pancreatic Cancer", "Cholangiocarcinoma"],
    differentials: [
      {
        diagnosis: "Choledocholithiasis (CBD Stone)",
        dominantImagingFinding: "Dilated extra-hepatic and intra-hepatic ducts with a FOCAL FILLING DEFECT at the distal end.",
        distributionLocation: "Distal CBD (most common site).",
        demographicsClinicalContext: "Colicky RUQ pain, jaundice, and abnormal LFTs (Obstructive).",
        discriminatingKeyFeature: "CRESCENT SIGN: The contrast or bile forms a crescent around the top of the stone. Shadowing on US.",
        associatedFindings: "Gallstones in the GB (90%).",
        complicationsSeriousAlternatives: "Ascending Cholangitis (EMERGENCY: Charcot's Triad).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pancreatic Head Carcinoma",
        dominantImagingFinding: "Abrupt, high-grade obstruction of the CBD and Pancreatic Duct.",
        distributionLocation: "Distal CBD / Pancreatic head.",
        demographicsClinicalContext: "Older adults. Painless jaundice and weight loss (Courvoisier's Law).",
        discriminatingKeyFeature: "DOUBLE DUCT SIGN: Dilatation of both the CBD and the Main Pancreatic Duct. Discrete soft tissue mass.",
        associatedFindings: "Distal pancreatic atrophy and vascular invasion (SMA/Portal vein).",
        complicationsSeriousAlternatives: "Liver metastases.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hilar Cholangiocarcinoma (Klatskin Tumor)",
        dominantImagingFinding: "Dilatation of the intra-hepatic ducts with a NORMAL calibre extra-hepatic CBD.",
        distributionLocation: "Confluence of the right and left hepatic ducts (Bismuth-Corlette).",
        demographicsClinicalContext: "Older adults. Associated with Primary Sclerosing Cholangitis (PSC).",
        discriminatingKeyFeature: "ABRUPT CUT-OFF at the hilum with non-union of the left and right ducts. CBD is collapsed.",
        associatedFindings: "Capsular retraction and lobar atrophy.",
        complicationsSeriousAlternatives: "Inoperability.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "D ILATED URETER",
    itemNumber: "7.31",
    problemCluster: "ureteromegaly",
    seriousAlternatives: ["Calculus Obstruction", "Vesicoureteric Reflux", "Primary Megaureter"],
    differentials: [
      {
        diagnosis: "Calculus Obstruction",
        dominantImagingFinding: "Hydroureter and Hydronephrosis proximal to a dense calcification. Perinephric stranding.",
        distributionLocation: "Point of narrowing (PUJ, Pelvic brim, or VUJ).",
        demographicsClinicalContext: "Acute loin-to-groin pain and microscopic haematuria.",
        discriminatingKeyFeature: "FOCAL CALCULUS and associated stranding (Rim Sign). Abrupt transition at the stone.",
        associatedFindings: "Delayed nephrogram on the affected side.",
        complicationsSeriousAlternatives: "Pyonephrosis (infection above obstruction - URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Vesicoureteric Reflux (VUR)",
        dominantImagingFinding: "Ureteric dilatation that varies during voiding. Blunting of the fornices.",
        distributionLocation: "Often bilateral. Continuous with the bladder.",
        demographicsClinicalContext: "Children with recurrent UTIs.",
        discriminatingKeyFeature: "VOIDING CYSTOURETHROGRAM (VCUG): Contrast fills the ureter from the bladder during micturition.",
        associatedFindings: "Renal scarring (Upper/Lower poles).",
        complicationsSeriousAlternatives: "Reflux nephropathy and renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Primary Megaureter",
        dominantImagingFinding: "Massive dilatation of the distal ureter with a short adynamic functional segment at the VUJ.",
        distributionLocation: "Distal third of the ureter. Pelvis is often spared early on.",
        demographicsClinicalContext: "Children (Males 4:1). Often found on prenatal US.",
        discriminatingKeyFeature: "ADYNAMIC SEGMENT: A short narrowed segment at the VUJ without a stone or reflux. Typical 'Fusiform' dilatation.",
        associatedFindings: "Normal bladder and normal urethra.",
        complicationsSeriousAlternatives: "Stone formation from stasis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Pregnancy (Physiological)",
        dominantImagingFinding: "Mild to moderate hydroureter, characteristically MORE SEVERE ON THE RIGHT.",
        distributionLocation: "Right side > Left side. Ends at the pelvic brim.",
        demographicsClinicalContext: "Pregnant females (2nd/3rd trimester).",
        discriminatingKeyFeature: "RIGHT-SIDED predominance (due to dextrorotation of the uterus and the right ovarian vein). Resolves 6-8 weeks postpartum.",
        associatedFindings: "Visible gravid uterus.",
        complicationsSeriousAlternatives: "Increased risk of Pyelonephritis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "SINGLE WELL-DEFINED SOFT-TISSUE OPACITY",
    itemNumber: "8.5",
    problemCluster: "well-circumscribed breast mass",
    seriousAlternatives: ["Cyst", "Fibroadenoma", "Phyllodes Tumor", "Medullary Carcinoma"],
    differentials: [
      {
        diagnosis: "Breast Cyst",
        dominantImagingFinding: "Well-circumscribed, round or oval mass. HALO SIGN (100% specific if thin/complete).",
        distributionLocation: "Anywhere in the breast.",
        demographicsClinicalContext: "Perimenopausal women (35-50y). Often fluctuates with cycle. Tender.",
        discriminatingKeyFeature: "ULTRASOUND: Anechoic, well-defined, with POSTERIOR ACOUSTIC ENHANCEMENT. Non-palpable or soft.",
        associatedFindings: "Often multiple and bilateral.",
        complicationsSeriousAlternatives: "Infected cyst.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Fibroadenoma",
        dominantImagingFinding: "Smooth, well-defined mass. May show 'POPCORN' calcification in older patients.",
        distributionLocation: "Anywhere.",
        demographicsClinicalContext: "Young women (15-35y). 'Breast Mouse' (highly mobile on palpation).",
        discriminatingKeyFeature: "ULTRASOUND: Hypoechoic, wider-than-tall, with smooth lobulations. Gentle edge shadowing.",
        associatedFindings: "Stability on serial films.",
        complicationsSeriousAlternatives: "Giant fibroadenoma (>5cm).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Phyllodes Tumor",
        dominantImagingFinding: "Large, rapidly growing, well-circumscribed mass. Indistinguishable from fibroadenoma on imaging alone.",
        distributionLocation: "Typically large (>4-5cm).",
        demographicsClinicalContext: "Older women (40-50y). Rapid increase in size.",
        discriminatingKeyFeature: "RAPID GROWTH and large size. Cystic spaces on ultrasound within a solid mass (cleft-like).",
        associatedFindings: "High mitotic index on biopsy.",
        complicationsSeriousAlternatives: "Malignant transformation (25%) and haematogenous spread.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Medullary Carcinoma",
        dominantImagingFinding: "Well-circumscribed mass that MIMICS a benign lesion. Lacks spiculation.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "Younger patients. Associated with BRCA1.",
        discriminatingKeyFeature: "BENIGN APPEARANCE: It looks like a fibroadenoma but is hard on palpation. High-grade on pathology.",
        associatedFindings: "Prominent lymphocytic infiltrate on histology.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "L UCENT BONE LESION IN THE",
    itemNumber: "1.11",
    problemCluster: "epiphyseal lucency",
    seriousAlternatives: ["Giant Cell Tumor", "Chondroblastoma", "Clear Cell Chondrosarcoma"],
    differentials: [
      {
        diagnosis: "Giant Cell Tumor (GCT)",
        dominantImagingFinding: "Expansile lytic lesion with non-sclerotic 'geographic' margins. EXTENDS TO SUBARTICULAR CORTEX.",
        distributionLocation: "Epiphysis/Metaphysis of long bones (Distal Femur, Proximal Tibia, Distal Radius).",
        demographicsClinicalContext: "Young adults (20-40y). Characteristically occurs after GROWTH PLATE CLOSURE.",
        discriminatingKeyFeature: "CLOSED PHYSIS and extension to the subarticular surface. Lack of a sclerotic rim (unlike Chondroblastoma).",
        associatedFindings: "Fluid-fluid levels if secondary ABC component (20%).",
        complicationsSeriousAlternatives: "Malignant GCT (rare) or pulmonary 'benign' metastases.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Chondroblastoma (Codman Tumor)",
        dominantImagingFinding: "Well-defined lytic lesion with a thin SCLEROTIC RIM. Internal 'stippled' calcification (50%).",
        distributionLocation: "Epiphysis of long bones (Proximal Humerus, Femur, Tibia).",
        demographicsClinicalContext: "Children and adolescents (10-20y). Characteristically occurs BEFORE GROWTH PLATE CLOSURE.",
        discriminatingKeyFeature: "OPEN PHYSIS and presence of a sclerotic margin. Often central or eccentric within the epiphysis.",
        associatedFindings: "Joint effusion and periosteal reaction distant from the lesion.",
        complicationsSeriousAlternatives: "Recurrence post-curettage.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Geode (Subchondral Cyst)",
        dominantImagingFinding: "Small, well-defined lucency immediately beneath the articular surface. Sclerotic margin.",
        distributionLocation: "Subchondral bone of weight-bearing joints (Hip, Knee).",
        demographicsClinicalContext: "Older adults with Osteoarthritis or RA.",
        discriminatingKeyFeature: "ASSOCIATED ARTHRITIS: Look for joint space narrowing, subchondral sclerosis, and osteophytes.",
        associatedFindings: "Subchondral sclerosis and eburnation.",
        complicationsSeriousAlternatives: "Articular collapse.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Clear Cell Chondrosarcoma",
        dominantImagingFinding: "Aggressive lytic lesion in the epiphysis. May mimic GCT but often has a more infiltrative margin.",
        distributionLocation: "Proximal Femur or Humerus (Epiphysis).",
        demographicsClinicalContext: "Adults (30-50y). Slow-growing malignant tumor.",
        discriminatingKeyFeature: "MALIGNANT features in an epiphyseal location in an adult. Older than the typical GCT age range.",
        associatedFindings: "Cortical destruction and soft tissue extension.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "N ASOPHARYNGEAL MASS",
    itemNumber: "9.13",
    problemCluster: "nasopharyngeal narrowing",
    seriousAlternatives: ["Nasopharyngeal Carcinoma", "Lymphoma", "Juvenile Angiofibroma"],
    differentials: [
      {
        diagnosis: "Nasopharyngeal Carcinoma (NPC)",
        dominantImagingFinding: "Soft tissue mass in the Fossa of Rosenmüller. Loss of normal mucosal folds. Bone destruction (Skull base).",
        distributionLocation: "Lateral nasopharyngeal wall (Fossa of Rosenmüller).",
        demographicsClinicalContext: "Adults. Associated with EBV. South-East Asian predominance. Presents with neck nodes (70%).",
        discriminatingKeyFeature: "SKULL BASE EROSION and Obliteration of the Parapharyngeal Fat Space. Often associated with large necrotic level II neck nodes.",
        associatedFindings: "Unilateral serous otitis media (due to Eustachian tube block).",
        complicationsSeriousAlternatives: "Cranial nerve palsies (III-VI).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Juvenile Nasopharyngeal Angiofibroma (JNA)",
        dominantImagingFinding: "Intensely enhancing mass centered on the SPHENOPALATINE FORAMEN. Antral bowing.",
        distributionLocation: "Centered on the sphenopalatine foramen. Extends to pterygopalatine fossa.",
        demographicsClinicalContext: "Almost exclusively adolescent MALES. Presents with severe epistaxis.",
        discriminatingKeyFeature: "HOLMAN-MILLER SIGN: Anterior bowing of the posterior wall of the maxillary antrum. Intense vascular enhancement.",
        associatedFindings: "Widening of the pterygomaxillary fissure.",
        complicationsSeriousAlternatives: "Massive intra-operative haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Thornwaldt Cyst",
        dominantImagingFinding: "Well-circumscribed, high T1/T2 signal cystic lesion in the midline.",
        distributionLocation: "Midline nasopharynx, between the longus capitis muscles.",
        demographicsClinicalContext: "Incidental finding in young adults. Asymptomatic.",
        discriminatingKeyFeature: "STRICT MIDLINE location and cystic appearance (no enhancement). No mass effect.",
        associatedFindings: "Proteinaceous content (High T1).",
        complicationsSeriousAlternatives: "Infection/Abscess (rare).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C EREBELLOPONTINE ANGLE MASS",
    itemNumber: "10.36",
    problemCluster: "CPA mass",
    seriousAlternatives: ["Vestibular Schwannoma", "Meningioma", "Epidermoid Cyst"],
    differentials: [
      {
        diagnosis: "Vestibular Schwannoma (Acoustic Neuroma)",
        dominantImagingFinding: "ICE-CREAM CONE appearance: Canalicular component (cone) and Cisternal component (scoop). Intense enhancement.",
        distributionLocation: "Internal Auditory Canal (IAC) and CPA cistern.",
        demographicsClinicalContext: "Adults (40-60y). Progressive sensorineural hearing loss and tinnitus. Bilateral in NF2.",
        discriminatingKeyFeature: "IAC WIDENING: The mass is centered on the IAC and widens it. Acute angles with the petrous bone.",
        associatedFindings: "Brainstem compression and hydrocephalus if large.",
        complicationsSeriousAlternatives: "Total deafness and facial nerve palsy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Meningioma (CPA)",
        dominantImagingFinding: "Broad-based, hemispherical dural mass. Intense uniform enhancement. DURAL TAIL (60-70%).",
        distributionLocation: "Broadly based along the petrous durra. Eccentric to the IAC.",
        demographicsClinicalContext: "Middle-aged females. Slower progression.",
        discriminatingKeyFeature: "DURAL TAIL and OBTUSE ANGLES with the petrous bone. Often shows calcification and HYPEROSTOSIS of the adjacent bone.",
        associatedFindings: "Spares the IAC (usually).",
        complicationsSeriousAlternatives: "Venous sinus thrombosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Epidermoid Cyst",
        dominantImagingFinding: "CAULIFLOWER-like mass that ENCASES nerves and vessels. CSF-like signal but with restricted diffusion.",
        distributionLocation: "CPA cistern. Often extends into the prepontine cistern.",
        demographicsClinicalContext: "Young adults. Insidious onset.",
        discriminatingKeyFeature: "RESTRICTED DIFFUSION (DWI Bright, ADC Dark) is 100% specific vs Arachnoid Cyst. Lacks enhancement.",
        associatedFindings: "Nerve encasement without displacement.",
        complicationsSeriousAlternatives: "Aseptic chemical meningitis if ruptured.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Arachnoid Cyst",
        dominantImagingFinding: "Smooth, well-circumscribed cyst. Identical to CSF on all sequences. NO restriction.",
        distributionLocation: "CPA cistern.",
        demographicsClinicalContext: "Usually incidental. Congenital.",
        discriminatingKeyFeature: "CSF SIGNAL on all sequences and NO RESTRICTION on DWI. Displaces rather than encases vessels.",
        associatedFindings: "Remodeling of the adjacent bone.",
        complicationsSeriousAlternatives: "Mass effect.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "A BDOMINAL MASS IN a CHILD",
    itemNumber: "14.46",
    problemCluster: "paediatric abdominal mass",
    seriousAlternatives: ["Wilms Tumor", "Neuroblastoma", "Hepatoblastoma", "Mesoblastic Nephroma"],
    differentials: [
      {
        diagnosis: "Wilms Tumor (Nephroblastoma)",
        dominantImagingFinding: "Large, intra-renal solid mass. CLAW SIGN (100% specific for renal origin). Spares the vascular structures.",
        distributionLocation: "Renal parenchyma. Displaces vessels but rarely encases them.",
        demographicsClinicalContext: "Peak age 3-4 years. Rarely neonates. Palpable mass, hypertension, haematuria.",
        discriminatingKeyFeature: "INTRA-RENAL origin (Claw Sign) and absence of calcification (only 10-15% calcify). Does not cross the midline.",
        associatedFindings: "Tumor thrombus in the renal vein/IVC (20%). Lung metastases.",
        complicationsSeriousAlternatives: "Rupture and haemorrhage.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Neuroblastoma (Adrenal)",
        dominantImagingFinding: "Large, extra-renal mass. CROSSES THE MIDLINE. Encases and lifts the aorta/vessels.",
        distributionLocation: "Adrenal gland (Retroperitoneum).",
        demographicsClinicalContext: "Peak age <2 years. Sick child, opsoclonus-myoclonus (dancing eyes/feet). High VMA/HVA.",
        discriminatingKeyFeature: "CALCIFICATION (90%) and MIDLINE CROSSING. Encases vessels (Aorta/Celiac) without obstructing them. Displaces kidney inferiorly.",
        associatedFindings: "Skull and orbital metastases (Raccoon eyes). Paraspinal extension.",
        complicationsSeriousAlternatives: "Metastatic bone marrow infiltration.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hepatoblastoma",
        dominantImagingFinding: "Large, solitary hepatic mass. Highly vascular. Calcification in 50%.",
        distributionLocation: "Liver (Right lobe common).",
        demographicsClinicalContext: "Infants <3 years. Markedly elevated ALPHA-FETOPROTEIN (AFP) in 90%.",
        discriminatingKeyFeature: "HEPATIC origin and extreme AFP elevation. Associated with Beckwith-Wiedemann syndrome.",
        associatedFindings: "Early pulmonary metastases.",
        complicationsSeriousAlternatives: "Liver failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Congenital Mesoblastic Nephroma",
        dominantImagingFinding: "Solid renal mass indistinguishable from Wilms by imaging.",
        distributionLocation: "Renal.",
        demographicsClinicalContext: "NEONATES (<3 months). Most common solid renal mass in this age group.",
        discriminatingKeyFeature: "AGE: Any solid renal mass in a neonate is Mesoblastic Nephroma until proven otherwise. Wilms is rare before 1 year.",
        associatedFindings: "Polyhydramnios in utero.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "LARGE HEAD IN INFANCY",
    itemNumber: "14.64",
    problemCluster: "macrocephaly",
    seriousAlternatives: ["Hydrocephalus", "Megaencephaly", "Chronic Subdural Haematoma"],
    differentials: [
      {
        diagnosis: "Hydrocephalus",
        dominantImagingFinding: "Dilatation of the ventricular system disproportionate to the subarachnoid spaces. Bulging anterior fontanelle.",
        distributionLocation: "Ventricular system.",
        demographicsClinicalContext: "Vomiting, irritability, and 'Setting Sun' sign (downward gaze).",
        discriminatingKeyFeature: "VENTRICULAR DILATATION and thinning of the corpus callosum. Effacement of cortical sulci.",
        associatedFindings: "Periventricular lucency (trans-ependymal oedema).",
        complicationsSeriousAlternatives: "Herniation and irreversible brain injury.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Chronic Subdural Haematoma / Effusion",
        dominantImagingFinding: "Crescentic, low-attenuation fluid collections over the cerebral convexities.",
        distributionLocation: "Extra-axial (Subdural space). Bilateral.",
        demographicsClinicalContext: "Infants. May be post-meningitic or due to NAI (Non-Accidental Injury).",
        discriminatingKeyFeature: "EXTRA-AXIAL location and displacement of the cortical veins AWAY from the skull vault.",
        associatedFindings: "Retinal haemorrhages (if NAI).",
        complicationsSeriousAlternatives: "NAI must be excluded (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Megaencephaly (Benign)",
        dominantImagingFinding: "Large brain with normal-sized ventricles and normal subarachnoid spaces.",
        distributionLocation: "Diffuse parenchymal.",
        demographicsClinicalContext: "Family history of large heads. Developmentally normal.",
        discriminatingKeyFeature: "NORMAL VENTRICULAR SIZE and normal development. Brain is structurally perfect but large.",
        associatedFindings: "Stable head circumference growth curve.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Alexander's Disease",
        dominantImagingFinding: "Macrocephaly with progressive white matter destruction. Frontal lobe predominance.",
        distributionLocation: "Frontal white matter focus.",
        demographicsClinicalContext: "Infants with developmental regression and seizures.",
        discriminatingKeyFeature: "FRONTAL PREDOMINANCE of leukodystrophy and progressive head growth.",
        associatedFindings: "Basal ganglia and thalamic involvement.",
        complicationsSeriousAlternatives: "Early death.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "P NEUMATOSIS INTESTINALIS (GAS IN THE BOWEL WALL)",
    itemNumber: "6.25",
    problemCluster: "intramural gas",
    seriousAlternatives: ["Necrotising Enterocolitis (NEC)", "Mesenteric Ischaemia", "Pneumatosis Cystoides Intestinalis"],
    differentials: [
      {
        diagnosis: "Necrotising Enterocolitis (NEC)",
        dominantImagingFinding: "Linear or bubbly intramural gas. Portal venous gas (30%). Dilated, featureless bowel loops.",
        distributionLocation: "Terminal ileum and Right Colon common.",
        demographicsClinicalContext: "PREMATURE NEONATES. Abdominal distension, bloody stools, and septic shock.",
        discriminatingKeyFeature: "NEONATAL context and PORTAL VENOUS GAS (100% specific for severe disease). Bubbly gas may mimic stool.",
        associatedFindings: "Pneumoperitoneum (Football Sign) if perforated.",
        complicationsSeriousAlternatives: "Bowel perforation and high mortality.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acute Mesenteric Ischaemia (Adult)",
        dominantImagingFinding: "Intramural gas in a dilated, thinned-walled bowel loop. Lacks normal enhancement.",
        distributionLocation: "Vascular territory (SMA).",
        demographicsClinicalContext: "Elderly with AF or vascular disease. Pain out of proportion to exam.",
        discriminatingKeyFeature: "ADULT context and presence of arterial/venous THROMBUS on CT Angio. High lactate.",
        associatedFindings: "Mesenteric stranding and ascites.",
        complicationsSeriousAlternatives: "Full-thickness gangrene.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pneumatosis Cystoides Intestinalis (PCI)",
        dominantImagingFinding: "Multiple large, thin-walled, grape-like cysts of gas within the bowel wall. NO bowel wall thickening.",
        distributionLocation: "Colon (Left side) or Small bowel.",
        demographicsClinicalContext: "Incidental finding or associated with COPD/Scleroderma. Patient is often CLINICALLY WELL.",
        discriminatingKeyFeature: "CLINICALLY WELL patient and 'Grape-like' gas clusters. Lacks the mural thickening or portal gas of ischaemia.",
        associatedFindings: "Benign pneumoperitoneum (from cyst rupture).",
        complicationsSeriousAlternatives: "None (usually benign).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "A CUTE AORTIC SYNDROMES",
    itemNumber: "5.12",
    problemCluster: "acute aorta",
    seriousAlternatives: ["Aortic Dissection (Type A - URGENT)", "Intramural Haematoma", "Penetrating Atherosclerotic Ulcer"],
    differentials: [
      {
        diagnosis: "Aortic Dissection (Stanford Type A)",
        dominantImagingFinding: "INTIMAL FLAP in the ascending aorta. True and false lumens visible. FLAP SPIRALS down the aorta.",
        distributionLocation: "Ascending aorta (involves or is proximal to the brachiocephalic artery).",
        demographicsClinicalContext: "Sudden onset 'tearing' chest pain radiating to the back. Hypertension history.",
        discriminatingKeyFeature: "INTIMAL FLAP visible on CT Angio. False lumen is often larger and contains the 'Cobweb sign' (residual media strands).",
        associatedFindings: "Pericardial effusion (tamponade) and aortic regurgitation.",
        complicationsSeriousAlternatives: "Coronary artery occlusion or stroke (FATAL). Requires immediate surgery.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Stanford Type B Dissection",
        dominantImagingFinding: "Intimal flap restricted to the descending aorta, DISTAL TO THE LEFT SUBCLAVIAN ARTERY.",
        distributionLocation: "Descending thoracic and abdominal aorta.",
        demographicsClinicalContext: "Hypertensive middle-aged/elderly patients.",
        discriminatingKeyFeature: "SPARING OF THE ASCENDING AORTA. Managed medically (blood pressure control) unless complicated.",
        associatedFindings: "Visceral organ ischaemia (Renal/Mesenteric).",
        complicationsSeriousAlternatives: "Aneurysmal dilatation and rupture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Intramural Haematoma (IMH)",
        dominantImagingFinding: "Crescentic, high-attenuation wall thickening (>5mm) on NON-CONTRAST CT. No intimal flap.",
        distributionLocation: "Thoracic aorta.",
        demographicsClinicalContext: "Similar to dissection. 'Pre-dissection' state.",
        discriminatingKeyFeature: "HIGH ATTENUATION on non-contrast CT (>60 HU) and LACK OF AN INTIMAL FLAP or internal flow on contrast films.",
        associatedFindings: "Displacement of intimal calcification inwards.",
        complicationsSeriousAlternatives: "Progression to frank dissection or rupture.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Penetrating Atherosclerotic Ulcer (PAU)",
        dominantImagingFinding: "Mushroom-shaped out-pouching of contrast through an atherosclerotic plaque into the aortic media.",
        distributionLocation: "Descending thoracic aorta (usually mid-to-distal).",
        demographicsClinicalContext: "Elderly patients with extensive atherosclerosis.",
        discriminatingKeyFeature: "FOCAL CRATER-LIKE projection beyond the intimal layer. Associated with extensive mural calcification.",
        associatedFindings: "Adjacent intramural haematoma.",
        complicationsSeriousAlternatives: "Pseudoaneurysm formation or transmural rupture.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 3 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_3_DATA) {
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
  console.log("Batch 3 Complete!");
}

main().catch(console.error);