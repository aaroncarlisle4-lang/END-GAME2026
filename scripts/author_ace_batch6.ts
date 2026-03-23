import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_6_DATA = [
  {
    pattern: "POSTERIOR SCALLOPING OF VERTEBRAL BODIES",
    itemNumber: "2.13",
    problemCluster: "vertebral scalloping",
    seriousAlternatives: ["Intradural Tumor", "NF1", "Marfan Syndrome", "Achondroplasia"],
    differentials: [
      {
        diagnosis: "Intradural Mass (e.g. Ependymoma / Schwannoma)",
        dominantImagingFinding: "Focal, smooth posterior scalloping of one or more vertebral bodies. Widening of the spinal canal.",
        distributionLocation: "Any level. Usually localized to the site of the mass.",
        demographicsClinicalContext: "Young to middle-aged adults. Chronic back pain and progressive neurological signs.",
        discriminatingKeyFeature: "FOCAL distribution and presence of an associated INTRADURAL MASS on MRI. Often involves pedicle erosion.",
        associatedFindings: "Widened neural foramina.",
        complicationsSeriousAlternatives: "Permanent neurological deficit.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Neurofibromatosis Type 1 (NF1)",
        dominantImagingFinding: "Diffuse posterior scalloping over multiple segments. Associated with DURAL ECTASIA.",
        distributionLocation: "Typically Thoracic and Lumbar spine. Multilevel.",
        demographicsClinicalContext: "AD inheritance. Skin café-au-lait spots. Peripheral neurofibromas.",
        discriminatingKeyFeature: "DURAL ECTASIA (expansion of the dural sac) and RIBBON-LIKE RIBS. Lacks a discrete solid mass (unless plexiform).",
        associatedFindings: "Lateral meningocoeles.",
        complicationsSeriousAlternatives: "Severe kyphoscoliosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Marfan Syndrome",
        dominantImagingFinding: "Extensive multilevel posterior scalloping due to severe DURAL ECTASIA.",
        distributionLocation: "Lumbar and Sacral spine predominates.",
        demographicsClinicalContext: "Tall, thin patients with arachnodactyly. Lens dislocation. Heart murmurs.",
        discriminatingKeyFeature: "SYSTEMIC signs of Marfan's and extreme posterior sacral scalloping. Aortic root dilatation.",
        associatedFindings: "Acetabular protrusion.",
        complicationsSeriousAlternatives: "Aortic dissection.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Achondroplasia",
        dominantImagingFinding: "Posterior scalloping with characteristically SHORT PEDICLES. Narrowing interpedicular distance.",
        distributionLocation: "Lumbar spine.",
        demographicsClinicalContext: "Rhizomelic dwarfism. Large head with frontal bossing.",
        discriminatingKeyFeature: "NARROWING INTERPEDICULAR DISTANCE caudally. Normal spine widens; achondroplasia narrows.",
        associatedFindings: "Bullet-shaped vertebrae and trident hands.",
        complicationsSeriousAlternatives: "Spinal stenosis (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "B ILATERAL HILAR ENLARGEMENT",
    itemNumber: "4.23",
    problemCluster: "bilateral adenopathy",
    seriousAlternatives: ["Sarcoidosis", "Lymphoma", "Metastatic Adenopathy", "Primary Pulmonary Hypertension"],
    differentials: [
      {
        diagnosis: "Sarcoidosis (Stage I)",
        dominantImagingFinding: "Strikingly SYMMETRICAL hilar and paratracheal adenopathy. GARLAND TRIAD (1-2-3 sign).",
        distributionLocation: "Right hilar, Left hilar, and Right paratracheal nodes.",
        demographicsClinicalContext: "Young adults (20-40y). Often asymptomatic. High serum ACE.",
        discriminatingKeyFeature: "STRIKING SYMMETRY and presence of the RIGHT PARATRACHEAL node. Usually spares the anterior mediastinum.",
        associatedFindings: "Erythema nodosum. Perilymphatic nodules (Stage II).",
        complicationsSeriousAlternatives: "Progressive lung fibrosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Lymphoma",
        dominantImagingFinding: "ASYMMETRICAL hilar enlargement. Bulky ANTERIOR MEDIASTINAL nodes.",
        distributionLocation: "Hilar and multiple mediastinal compartments (Pre-vascular).",
        demographicsClinicalContext: "Young adults (Hodgkin) or older (NHL). B-symptoms (fever, weight loss).",
        discriminatingKeyFeature: "ANTERIOR MEDIASTINAL involvement and asymmetry. Sarcoid rarely involves the pre-vascular space.",
        associatedFindings: "Pleural effusions and hepatosplenomegaly.",
        complicationsSeriousAlternatives: "SVC obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Metastatic Adenopathy",
        dominantImagingFinding: "Asymmetrical hilar enlargement. Disparate growth of nodes.",
        distributionLocation: "Hilar and tracheobronchial nodes.",
        demographicsClinicalContext: "Older adults. Known primary (Lung, Breast, GI). Cachexia.",
        discriminatingKeyFeature: "KNOWN PRIMARY CANCER and rapid change in size. Nodes often have necrotic centers on CT.",
        associatedFindings: "Lung nodules or pleural effusions.",
        complicationsSeriousAlternatives: "Bronchial obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Primary Pulmonary Hypertension",
        dominantImagingFinding: "Enlargement of the MAIN PULMONARY ARTERIES. Rapid peripheral pruning.",
        distributionLocation: "Central hilar vessels.",
        demographicsClinicalContext: "Young females. Progressive dyspnoea and syncope.",
        discriminatingKeyFeature: "VASCULAR rather than nodal: On lateral view, the nodes would be posterior to the vessels. On CT, the main PA is >29mm.",
        associatedFindings: "Right ventricular enlargement.",
        complicationsSeriousAlternatives: "Right heart failure (Cor pulmonale).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "ANTERIOR MEDIASTINAL MASSES IN ADULTS",
    itemNumber: "4.42",
    problemCluster: "anterior mediastinal mass",
    seriousAlternatives: ["Thymoma", "Teratoma", "Terrible Lymphoma", "Thyroid Goitre"],
    differentials: [
      {
        diagnosis: "Thymoma",
        dominantImagingFinding: "Well-circumscribed, solid, homogeneous mass. Often lobulated.",
        distributionLocation: "Anterior mediastinum, typically at the level of the great vessels.",
        demographicsClinicalContext: "Adults (40-60y). 35% have MYASTHENIA GRAVIS. 15% of MG patients have a thymoma.",
        discriminatingKeyFeature: "ASSOCIATION WITH MYASTHENIA GRAVIS. Usually solid; calcification suggests invasive thymoma.",
        associatedFindings: "Pleural 'drop' metastases if malignant.",
        complicationsSeriousAlternatives: "Invasion of the pericardium or phrenic nerve.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Germ Cell Tumor (Teratoma)",
        dominantImagingFinding: "Large, heterogeneous mass containing FAT, FLUID, and CALCIFICATION (90%).",
        distributionLocation: "Anterior mediastinum.",
        demographicsClinicalContext: "Young adults (20-30y). Benign (Mature) or Malignant (Seminoma/Non-seminoma).",
        discriminatingKeyFeature: "PRESENCE OF MACROSCOPIC FAT or teeth/bone. High Alpha-fetoprotein or Beta-hCG if malignant.",
        associatedFindings: "Fat-fluid levels (pathognomonic for teratoma).",
        complicationsSeriousAlternatives: "Rupture into the pleural space.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Lymphoma (Mediastinal)",
        dominantImagingFinding: "Bulky, lobulated mass. Often involves multiple mediastinal compartments.",
        distributionLocation: "Pre-vascular space. Characteristically wraps around vessels without narrowing them.",
        demographicsClinicalContext: "Young adults. Fever, night sweats, and itchy skin.",
        discriminatingKeyFeature: "BULKY NODES and systemic B-symptoms. Does not typically contain fat (unlike teratoma).",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "SVC syndrome.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Retrosternal Thyroid Goitre",
        dominantImagingFinding: "Solid, often heterogeneous mass. Characteristically shows HIGH ATTENUATION on CT (>100 HU).",
        distributionLocation: "Upper anterior mediastinum. Continuous with the cervical thyroid gland.",
        demographicsClinicalContext: "Elderly. Asymptomatic or stridor.",
        discriminatingKeyFeature: "CONTINUITY with the neck and INTENSE enhancement. Often shows coarse calcification.",
        associatedFindings: "Tracheal deviation and narrowing.",
        complicationsSeriousAlternatives: "Tracheal compression.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "INCIDENTAL ADRENAL MASS (UNILATERAL)",
    itemNumber: "8.2",
    problemCluster: "adrenal nodule",
    seriousAlternatives: ["Adrenal Adenoma", "Adrenal Metastasis", "Phaeochromocytoma", "Adrenal Cortical CA"],
    differentials: [
      {
        diagnosis: "Adrenal Adenoma (Lipid-rich)",
        dominantImagingFinding: "Small (<3cm), well-defined, homogeneous mass. Low density on non-contrast CT (<10 HU).",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Extremely common incidental finding (5-10% of population). Asymptomatic.",
        discriminatingKeyFeature: "LOW ATTENUATION (<10 HU) on non-contrast CT and RAPID WASHOUT (>60% absolute washout at 15 mins).",
        associatedFindings: "Loss of signal on out-of-phase MRI (Chemical shift).",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Adrenal Metastasis",
        dominantImagingFinding: "Large, irregular, heterogeneous mass. High density (>20 HU) and DELAYED washout.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Known primary (Lung, Breast, Melanoma).",
        discriminatingKeyFeature: "DELAYED WASHOUT (<40% at 15 mins) and high non-contrast density. Known malignancy history.",
        associatedFindings: "Evidence of primary cancer elsewhere.",
        complicationsSeriousAlternatives: "Adrenal insufficiency (if massive/bilateral).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Phaeochromocytoma",
        dominantImagingFinding: "Intensely enhancing solid mass. Often shows central necrosis ('Light-bulb' sign on T2 MRI).",
        distributionLocation: "Adrenal medulla.",
        demographicsClinicalContext: "Triad: Headache, palpitations, and sweating. Hypertension.",
        discriminatingKeyFeature: "INTENSE VASCULAR ENHANCEMENT and bright T2 signal. High urinary metanephrines.",
        associatedFindings: "Associated with MEN 2, VHL, and NF1.",
        complicationsSeriousAlternatives: "Hypertensive crisis (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Adrenal Cortical Carcinoma",
        dominantImagingFinding: "MASSIVE mass (typically >6cm). Very heterogeneous with central necrosis and calcification.",
        distributionLocation: "Unilateral.",
        demographicsClinicalContext: "Adults. 50% are functioning (Cushing's / Virilization).",
        discriminatingKeyFeature: "LARGE SIZE (>6cm) and vascular invasion (IVC thrombus). Very aggressive.",
        associatedFindings: "Liver metastases and local invasion.",
        complicationsSeriousAlternatives: "Rapid metastatic death.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "OVARY",
    itemNumber: "13.6",
    problemCluster: "adnexal mass",
    seriousAlternatives: ["Dermoid Cyst", "Ovarian Serous Cystadenocarcinoma", "Endometrioma", "Ectopic Pregnancy"],
    differentials: [
      {
        diagnosis: "Mature Cystic Teratoma (Dermoid)",
        dominantImagingFinding: "Unilocular cyst containing MACROSCOPIC FAT. High T1/T2 signal that suppresses on fat-sat.",
        distributionLocation: "Unilateral or bilateral (15%).",
        demographicsClinicalContext: "Young women (20-30y). Most common benign ovarian tumor.",
        discriminatingKeyFeature: "MACROSCOPIC FAT and the ROKITANSKY NODULE (dermoid plug) containing hair/teeth. Chemical shift artifact on MRI.",
        associatedFindings: "Fat-fluid level.",
        complicationsSeriousAlternatives: "Ovarian Torsion (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Serous Cystadenocarcinoma",
        dominantImagingFinding: "Complex cystic and solid mass. Thick septations (>3mm) and large papillary projections.",
        distributionLocation: "Often bilateral (50%).",
        demographicsClinicalContext: "Post-menopausal women. Elevated CA-125.",
        discriminatingKeyFeature: "LARGE SOLID COMPONENTS and associated ASCITES / OMENTAL CAKING. Most common malignant ovarian tumor.",
        associatedFindings: "Peritoneal seeding.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Endometrioma ('Chocolate Cyst')",
        dominantImagingFinding: "Cyst with diffuse low-level internal echoes ('Ground-glass') on US. High T1 signal on MRI.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Premenopausal women with chronic pelvic pain and dysmenorrhoea.",
        discriminatingKeyFeature: "T2 SHADING: High T1 signal that 'shades' (becomes dark) on T2 due to high iron/protein concentration.",
        associatedFindings: "Adhesions and tethered uterus.",
        complicationsSeriousAlternatives: "Rupture causing acute abdomen.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Ectopic Pregnancy",
        dominantImagingFinding: "Extra-uterine gestational sac or complex adnexal mass with a THICK VASCULAR RIM (Ring of Fire).",
        distributionLocation: "Fallopian tube (95%).",
        demographicsClinicalContext: "Positive pregnancy test (beta-hCG). Acute pelvic pain and spotting.",
        discriminatingKeyFeature: "POSITIVE B-HCG and empty uterus. The 'Ring of Fire' on Doppler is highly suggestive.",
        associatedFindings: "Free fluid in the Pouch of Douglas (may be haemorrhagic).",
        complicationsSeriousAlternatives: "Rupture and life-threatening haemorrhage (EMERGENCY).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "M IDDLE MEDIASTINAL MASSES IN ADULTS",
    itemNumber: "4.43",
    problemCluster: "middle mediastinal mass",
    seriousAlternatives: ["Lymphadenopathy (Mets/Lymphoma)", "Foregut Cyst", "Aneurysm"],
    differentials: [
      {
        diagnosis: "Lymphadenopathy",
        dominantImagingFinding: "Multiple discrete or confluent soft tissue nodules. Symmetrical or asymmetrical.",
        distributionLocation: "Paratracheal, subcarinal, and hilar regions.",
        demographicsClinicalContext: "Adults. Causes: Sarcoidosis, Lymphoma, Metastases, or Infection (TB).",
        discriminatingKeyFeature: "NODULAR pattern. Necrosis suggests Metastasis or TB. Eggshell calcification suggests Silicosis/Sarcoid.",
        associatedFindings: "Lung parenchymal disease.",
        complicationsSeriousAlternatives: "SVC obstruction.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Foregut Duplication Cyst (Bronchogenic/Oesophageal)",
        dominantImagingFinding: "Well-circumscribed, thin-walled cyst. Fluid attenuation (0-20 HU) but can be higher if proteinaceous.",
        distributionLocation: "Subcarinal or paratracheal (Bronchogenic). Near oesophagus (Oesophageal).",
        demographicsClinicalContext: "Usually incidental in adults. Asymptomatic or mild dysphagia.",
        discriminatingKeyFeature: "CYSTIC appearance and LACK of solid enhancement. Typically located near the carina.",
        associatedFindings: "Compression of adjacent structures.",
        complicationsSeriousAlternatives: "Infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Aortic Arch Aneurysm",
        dominantImagingFinding: "Dilation of the aortic arch. Calcified wall.",
        distributionLocation: "Aortic arch.",
        demographicsClinicalContext: "Elderly, hypertensive, or atherosclerotic patients.",
        discriminatingKeyFeature: "VASCULAR origin: Continuous with the aorta and contains internal flow/contrast. Wall calcification.",
        associatedFindings: "Atherosclerotic disease elsewhere.",
        complicationsSeriousAlternatives: "Rupture (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P OSTERIOR MEDIASTINAL MASSES IN ADULTS",
    itemNumber: "4.44",
    problemCluster: "posterior mediastinal mass",
    seriousAlternatives: ["Neurogenic Tumor", "Paravertebral Abscess", "Extramedullary Haematopoiesis"],
    differentials: [
      {
        diagnosis: "Neurogenic Tumor (Schwannoma/Neurofibroma)",
        dominantImagingFinding: "Well-defined, round or vertically elongated mass in the paravertebral sulcus.",
        distributionLocation: "Paravertebral sulcus. Often associated with neural foramen widening.",
        demographicsClinicalContext: "Adults. Most common posterior mediastinal mass.",
        discriminatingKeyFeature: "DUMBBELL SHAPE: Extension through the neural foramen. Pressure erosion of adjacent vertebrae/ribs.",
        associatedFindings: "Widened neural foramen.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Extramedullary Haematopoiesis",
        dominantImagingFinding: "Multiple, bilateral paravertebral soft tissue masses. No bone destruction.",
        distributionLocation: "Lower thoracic paravertebral region. Bilateral and symmetric.",
        demographicsClinicalContext: "History of chronic haemolytic anaemia (Thalassaemia/Sickle Cell).",
        discriminatingKeyFeature: "BILATERAL SYMMETRY and lack of bone destruction. Associated with coarse trabecular bone pattern.",
        associatedFindings: "Massive splenomegaly.",
        complicationsSeriousAlternatives: "Rarely, cord compression.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Paravertebral Abscess (Pott's Disease)",
        dominantImagingFinding: "Fluid-filled paravertebral collection with a thick enhancing rim. Bone destruction.",
        distributionLocation: "Adjacent to infected vertebrae.",
        demographicsClinicalContext: "Fever, back pain, and high inflammatory markers.",
        discriminatingKeyFeature: "VERTEBRAL DESTRUCTION: Associated with disc space narrowing and endplate erosion (Spondylodiscitis).",
        associatedFindings: "Psoas abscess.",
        complicationsSeriousAlternatives: "Sepsis and cord injury.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C T MEDIASTINAL MASS CONTAINING FAT",
    itemNumber: "4.45",
    problemCluster: "mediastinal fat",
    seriousAlternatives: ["Mediastinal Lipomatosis", "Teratoma", "Liposarcoma"],
    differentials: [
      {
        diagnosis: "Mediastinal Lipomatosis",
        dominantImagingFinding: "Diffuse, non-encapsulated accumulation of mature fat (-60 to -100 HU) without mass effect.",
        distributionLocation: "Generalised mediastinal fat spaces. Prominent in the superior mediastinum and epicardial regions.",
        demographicsClinicalContext: "Obesity, Cushing's syndrome, or steroid use. Asymptomatic.",
        discriminatingKeyFeature: "ABSENCE OF CAPSULE and lack of displacement of vessels. The fat is just 'more abundant' than normal.",
        associatedFindings: "Fatty neck or buffalo hump.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Germ Cell Tumor (Mature Teratoma)",
        dominantImagingFinding: "HETEROGENEOUS mass containing fat, fluid, and calcification. ENCAPSULATED.",
        distributionLocation: "Anterior mediastinum.",
        demographicsClinicalContext: "Young adults. Asymptomatic or chest pain.",
        discriminatingKeyFeature: "FAT-FLUID LEVEL (Pathognomonic) and presence of other tissues (calcification/teeth).",
        associatedFindings: "Elevated AFP/hCG if malignant.",
        complicationsSeriousAlternatives: "Rupture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Liposarcoma",
        dominantImagingFinding: "Large, irregular mass with THICK SEPTATIONS and solid enhancing components (>1cm).",
        distributionLocation: "Anywhere in the mediastinum.",
        demographicsClinicalContext: "Older adults.",
        discriminatingKeyFeature: "THICK SEPTATIONS: Mature lipomas have hair-thin septa. Liposarcomas have thick, nodular enhancement.",
        associatedFindings: "Local invasion.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C T MEDIASTINAL CYSTS",
    itemNumber: "4.46",
    problemCluster: "mediastinal cysts",
    seriousAlternatives: ["Bronchogenic Cyst", "Pericardial Cyst", "Oesophageal Cyst"],
    differentials: [
      {
        diagnosis: "Bronchogenic Cyst",
        dominantImagingFinding: "Well-circumscribed, fluid-filled cyst. Often subcarinal. No enhancement.",
        distributionLocation: "Subcarinal (50%) or paratracheal.",
        demographicsClinicalContext: "Adults or children. Often incidental.",
        discriminatingKeyFeature: "SUBCARINAL location and unilocular cystic appearance. Does not communicate with the airway.",
        associatedFindings: "Can have high CT density (Milk of calcium).",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pericardial Cyst",
        dominantImagingFinding: "Thin-walled cyst characteristically located in the cardiophrenic angle.",
        distributionLocation: "RIGHT CARDIOPHRENIC ANGLE (70%).",
        demographicsClinicalContext: "Incidental finding in asymptomatic adults.",
        discriminatingKeyFeature: "CARDIOPHRENIC location. Lacks the paratracheal/hilar predilection of bronchogenic cysts.",
        associatedFindings: "Contact with the pericardium.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Thymic Cyst",
        dominantImagingFinding: "Cystic lesion within the anterior mediastinum. Can be unilocular or multilocular.",
        distributionLocation: "Thymic bed (Anterior mediastinum).",
        demographicsClinicalContext: "Incidental or following treatment for Hodgkin's.",
        discriminatingKeyFeature: "ANTERIOR position. Unlike teratomas, they lack fat or calcified solid elements.",
        associatedFindings: "Residual thymic tissue.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "A NTERIOR MEDIASTINAL MASSES IN CHILDHOOD",
    itemNumber: "14.37",
    problemCluster: "paediatric mediastinal mass",
    seriousAlternatives: ["Normal Thymus", "Lymphoma", "Teratoma"],
    differentials: [
      {
        diagnosis: "Normal Thymus",
        dominantImagingFinding: "Smooth, quadrilateral mass. WAVY BORDER (Sign of Mulder). No mass effect.",
        distributionLocation: "Anterior mediastinum. Superior to the heart.",
        demographicsClinicalContext: "Infants and young children. Asymptomatic.",
        discriminatingKeyFeature: "WAVY BORDER: The thymus is soft and takes the shape of the ribs. Does NOT displace the trachea or vessels.",
        associatedFindings: "Sail sign on CXR.",
        complicationsSeriousAlternatives: "Thymic rebound.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Lymphoma (Hodgkin)",
        dominantImagingFinding: "Bulky, nodular mass. CHARACTERISTICALLY CAUSES TRACHEAL NARROWING.",
        distributionLocation: "Pre-vascular space. Bilateral and asymmetric.",
        demographicsClinicalContext: "Older children and adolescents. B-symptoms.",
        discriminatingKeyFeature: "MASS EFFECT: Lymphoma is firm and DISPLACES/COMPRESSES the trachea and vessels. Normal thymus does not.",
        associatedFindings: "Pleural effusions and adenopathy.",
        complicationsSeriousAlternatives: "Airway obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Teratoma (Paediatric)",
        dominantImagingFinding: "Large, heterogeneous mass containing FAT and CALCIFICATION.",
        distributionLocation: "Anterior mediastinum.",
        demographicsClinicalContext: "Infants or young children.",
        discriminatingKeyFeature: "FAT and calcified elements. 90% are benign (Mature) but can be huge.",
        associatedFindings: "Pleural effusion if ruptured.",
        complicationsSeriousAlternatives: "Invasion (if malignant).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ANTERIOR SCALLOPING OF VERTEBRAL BODIES",
    itemNumber: "2.14",
    problemCluster: "anterior scalloping",
    seriousAlternatives: ["Aortic Aneurysm (Erosion)", "Tuberculous Spondylitis", "Lymphadenopathy"],
    differentials: [
      {
        diagnosis: "Abdominal Aortic Aneurysm (AAA)",
        dominantImagingFinding: "Smooth anterior scalloping of the lumbar vertebrae. The DISCS ARE PRESERVED.",
        distributionLocation: "Lumbar spine (L1-L4). Anterior surface focus.",
        demographicsClinicalContext: "Elderly, hypertensive smokers. Pulsatile abdominal mass.",
        discriminatingKeyFeature: "DISC PRESERVATION: Chronic pressure from an aneurysm erodes the bone but spares the resilient intervertebral discs.",
        associatedFindings: "Calcified aortic wall and mural thrombus.",
        complicationsSeriousAlternatives: "Aortic rupture (FATAL).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Tuberculous Spondylitis (Pott's)",
        dominantImagingFinding: "Anterior scalloping ('Gouge defect') due to sub-ligamentous spread of infection.",
        distributionLocation: "Thoracolumbar junction. Anterior vertebral body focus.",
        demographicsClinicalContext: "Insidious onset. Fever, night sweats, and weight loss.",
        discriminatingKeyFeature: "GOUGE DEFECT: Sub-ligamentous spread of TB pus beneath the ALL causing anterior erosion. Usually involves discs later.",
        associatedFindings: "Large psoas abscesses with calcification.",
        complicationsSeriousAlternatives: "Gibbus deformity and paralysis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Lymphadenopathy (Bulky)",
        dominantImagingFinding: "Smooth anterior scalloping of multiple vertebrae. Masses wrap around the spine.",
        distributionLocation: "Any level depending on nodes.",
        demographicsClinicalContext: "Adults. Known primary cancer or lymphoma.",
        discriminatingKeyFeature: "MULTIPLE LEVELS and presence of lobulated soft tissue masses. Associated with B-symptoms.",
        associatedFindings: "Elevated inflammatory markers.",
        complicationsSeriousAlternatives: "Invasion of the spinal canal.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ARTHRITIS WITH A PERIOSTEAL REACTION",
    itemNumber: "3.5",
    problemCluster: "arthritis with periostitis",
    seriousAlternatives: ["Psoriatic Arthritis", "Reactive Arthritis", "Juvenile Idiopathic Arthritis (JIA)"],
    differentials: [
      {
        diagnosis: "Psoriatic Arthritis",
        dominantImagingFinding: "Marginal erosions with fluffy PERIOSTEAL NEW BONE (bone proliferation). PENCIL-IN-CUP deformity.",
        distributionLocation: "Distal Interphalangeal (DIP) joints common. Asymmetric.",
        demographicsClinicalContext: "Skin psoriasis (90%). Nail pitting and dactylitis (Sausage digit).",
        discriminatingKeyFeature: "BONE PROLIFERATION: Fluffy periostitis at the site of erosions. DIP involvement and absence of osteoporosis.",
        associatedFindings: "Sacroiliitis (asymmetric) and syndesmophytes.",
        complicationsSeriousAlternatives: "Arthritis mutilans.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Reactive Arthritis (Reiter's)",
        dominantImagingFinding: "Fluffy periosteal reaction and ill-defined erosions. Joint space narrowing.",
        distributionLocation: "Lower limb predominance (Feet, Ankle, Knee). Asymmetric.",
        demographicsClinicalContext: "Young males. History of urethritis or dysentery. 'Can't see, can't pee, can't climb a tree'.",
        discriminatingKeyFeature: "LOWER LIMB focus and severe fluffy calcaneal spurs (Enthesitis). Triad symptoms.",
        associatedFindings: "Sacroiliitis (asymmetric).",
        complicationsSeriousAlternatives: "Chronic disability.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Juvenile Idiopathic Arthritis (JIA)",
        dominantImagingFinding: "Thickened, periosteal new bone formation along the shafts of the phalanges and metacarpals.",
        distributionLocation: "Small joints of the hands/wrists. Often symmetric.",
        demographicsClinicalContext: "Children (<16y). Joint swelling and growth disturbance.",
        discriminatingKeyFeature: "CHILDHOOD context and accelerated skeletal maturation (enlarged epiphyses). Diffuse periostitis.",
        associatedFindings: "Carpal fusion and micrognathia.",
        complicationsSeriousAlternatives: "Uveitis and blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "U NILATERAL HILAR ENLARGEMENT",
    itemNumber: "4.22",
    problemCluster: "unilateral hilum",
    seriousAlternatives: ["Bronchogenic Carcinoma", "Primary TB", "Pulmonary Artery Aneurysm"],
    differentials: [
      {
        diagnosis: "Bronchogenic Carcinoma (Hilar)",
        dominantImagingFinding: "Lobulated, solid mass at the hilum. Associated with post-obstructive collapse or pneumonia.",
        distributionLocation: "Unilateral hilum.",
        demographicsClinicalContext: "Adult smokers. Weight loss and haemoptysis.",
        discriminatingKeyFeature: "MASS EFFECT: Irregular nodular margin. Encases or narrows bronchi. GOLDEN S SIGN if RUL is involved.",
        associatedFindings: "Mediastinal adenopathy and rib destruction.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Primary Tuberculosis",
        dominantImagingFinding: "UNILATERAL hilar and paratracheal adenopathy. Often associated with a small parenchymal focus (Ghon focus).",
        distributionLocation: "Right hilum > Left hilum. Mid/Lower lobes.",
        demographicsClinicalContext: "Children or immigrants. Often asymptomatic or mild fever.",
        discriminatingKeyFeature: "UNILATERAL ADENOPATHY in a child is TB until proven otherwise. Symmetrical nodes suggest sarcoid.",
        associatedFindings: "Pleural effusion (unilateral).",
        complicationsSeriousAlternatives: "Miliary spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pulmonary Artery Enlargement",
        dominantImagingFinding: "Smooth, vascular enlargement of the hilum. Lacks a nodular margin.",
        distributionLocation: "Main pulmonary artery or branches.",
        demographicsClinicalContext: "Pulmonary hypertension or post-stenotic dilatation (Pulmonary Stenosis).",
        discriminatingKeyFeature: "VASCULAR on CT: Continuous with the pulmonary trunk. On lateral film, the hilum is NOT posterior to the bronchus.",
        associatedFindings: "Pruning of peripheral vessels.",
        complicationsSeriousAlternatives: "Right heart failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PLEURAL EFFUSION",
    itemNumber: "4.26",
    problemCluster: "fluid in pleura",
    seriousAlternatives: ["Malignant Effusion", "Parapneumonic Effusion", "Congestive Heart Failure"],
    differentials: [
      {
        diagnosis: "Congestive Heart Failure (CHF)",
        dominantImagingFinding: "Bilateral effusions, often asymmetric (RIGHT > LEFT).",
        distributionLocation: "Pleural spaces. Dependent.",
        demographicsClinicalContext: "Elderly with orthopnoea. Low protein transudate.",
        discriminatingKeyFeature: "CARDIOMEGALY and cephalisation of vessels. Rapid response to diuretics. Symmetrical involvement.",
        associatedFindings: "Kerley B lines and peribronchial cuffing.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Malignant Pleural Effusion",
        dominantImagingFinding: "Large, unilateral effusion that does not respond to diuretics. Nodular pleural thickening.",
        distributionLocation: "Unilateral space.",
        demographicsClinicalContext: "Known primary (Breast, Lung). Cachexia. Exudate.",
        discriminatingKeyFeature: "NODULAR PLEURA: Contrast CT shows nodular or circumferential pleural thickening (>1cm).",
        associatedFindings: "Mediastinal shift AWAY from the effusion.",
        complicationsSeriousAlternatives: "Trapped lung.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Empyema / Parapneumonic Effusion",
        dominantImagingFinding: "Loculated pleural fluid. SPLIT PLEURA SIGN on CT.",
        distributionLocation: "Unilateral. Often loculated.",
        demographicsClinicalContext: "Fever, cough, and pleuritic chest pain. Associated with pneumonia.",
        discriminatingKeyFeature: "SPLIT PLEURA sign: Enhancing visceral and parietal pleura separated by fluid. Lenticular shape.",
        associatedFindings: "Underlying lung consolidation.",
        complicationsSeriousAlternatives: "Sepsis and fibrothorax.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L OCAL PLEURAL MASSES",
    itemNumber: "4.35",
    problemCluster: "pleural nodules",
    seriousAlternatives: ["Mesothelioma", "Pleural Metastases", "Solitary Fibrous Tumor"],
    differentials: [
      {
        diagnosis: "Mesothelioma",
        dominantImagingFinding: "Nodular, circumferential pleural RIND. Characteristically involves the MEDIASTINAL pleura.",
        distributionLocation: "Entire hemithorax space. Often with volume loss.",
        demographicsClinicalContext: "Occupational ASBESTOS exposure history (>20y). Chest wall pain.",
        discriminatingKeyFeature: "MEDIASTINAL PLEURA: Involvement of the mediastinal pleura is highly suggestive of mesothelioma over benign disease.",
        associatedFindings: "Pleural effusion and calcified plaques (asbestos history).",
        complicationsSeriousAlternatives: "Invasion of the chest wall and pericardium.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pleural Metastases",
        dominantImagingFinding: "Multiple discrete pleural nodules or masses. Large associated effusion.",
        distributionLocation: "Dependent pleura common. Unilateral or bilateral.",
        demographicsClinicalContext: "Primary Breast or Lung cancer. Metastatic Adenocarcinoma.",
        discriminatingKeyFeature: "MULTIPLE DISCRETE masses and primary CA history. Spares the mediastinal pleura compared to mesothelioma.",
        associatedFindings: "Liver or bone metastases.",
        complicationsSeriousAlternatives: "Respiratory compromise.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Solitary Fibrous Tumor of the Pleura",
        dominantImagingFinding: "Large, well-circumscribed mass arising from the visceral pleura. PEDUNCULATED.",
        distributionLocation: "Usually unilateral and solitary. Can be HUGE.",
        demographicsClinicalContext: "Adults. Often asymptomatic or produces DOE. 50% have clubbing (HPOA).",
        discriminatingKeyFeature: "PEDUNCULATED: Changes position with respiration or posture. Not associated with asbestos.",
        associatedFindings: "Hypoglycaemia (Doege-Potter Syndrome).",
        complicationsSeriousAlternatives: "Mass effect.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "B ILATERAL ADRENAL MASSES",
    itemNumber: "8.3",
    problemCluster: "bilateral adrenal nodules",
    seriousAlternatives: ["Adrenal Metastases", "Adrenal Haemorrhage", "Congenital Adrenal Hypertrophy"],
    differentials: [
      {
        diagnosis: "Adrenal Metastases",
        dominantImagingFinding: "Bilateral heterogeneous adrenal masses. High density (>20 HU) and delayed washout.",
        distributionLocation: "Bilateral adrenals.",
        demographicsClinicalContext: "Known primary (Lung, Breast, Melanoma). Lung cancer is the most common cause.",
        discriminatingKeyFeature: "BILATERALITY and primary CA history. Washout is <40% at 15 mins.",
        associatedFindings: "Systemic metastatic disease.",
        complicationsSeriousAlternatives: "Adrenal crisis (Addisonian).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Adrenal Haemorrhage",
        dominantImagingFinding: "Bilateral ovoid, non-enhancing masses. High attenuation on non-contrast CT (>50 HU).",
        distributionLocation: "Bilateral adrenals.",
        demographicsClinicalContext: "Neonates (trauma/sepsis) or Adults on anticoagulants/HIT.",
        discriminatingKeyFeature: "HIGH HU on non-contrast CT and LACK of enhancement. Shrinks on follow-up.",
        associatedFindings: "Decreasing haematocrit.",
        complicationsSeriousAlternatives: "Acute adrenal insufficiency (EMERGENCY).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Adrenal Hyperplasia",
        dominantImagingFinding: "Bilateral smooth or nodular thickening of the adrenal limbs (>10mm). Normal shape preserved.",
        distributionLocation: "Bilateral adrenals.",
        demographicsClinicalContext: "Cushing's disease (Pituitary ACTH) or ectopic ACTH (Small Cell Lung CA).",
        discriminatingKeyFeature: "PRESERVED CONFIGURATION: The adrenal limbs are thick but maintain their 'seagull' or 'Y' shape. No discrete masses.",
        associatedFindings: "Pituitary adenoma or lung tumor.",
        complicationsSeriousAlternatives: "Cushingoid features.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M IDDLE MEDIASTINAL MASSES IN CHILDHOOD",
    itemNumber: "14.38",
    problemCluster: "paediatric middle mediastinum",
    seriousAlternatives: ["Lymphadenopathy", "Bronchogenic Cyst", "Hiatus Hernia"],
    differentials: [
      {
        diagnosis: "Lymphadenopathy (Reactive / Infectious)",
        dominantImagingFinding: "Nodular soft tissue masses in the paratracheal and hilar regions.",
        distributionLocation: "Middle mediastinal nodes.",
        demographicsClinicalContext: "Children with fever or cough. Common in Primary TB or Viral infections.",
        discriminatingKeyFeature: "NODULAR pattern. In TB, nodes often show necrotic centers. Symmetrical in Sarcoid (rare in children).",
        associatedFindings: "Underlying lung infection.",
        complicationsSeriousAlternatives: "Airway compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Bronchogenic Cyst",
        dominantImagingFinding: "Well-defined, thin-walled cyst. Often subcarinal.",
        distributionLocation: "Subcarinal or paratracheal.",
        demographicsClinicalContext: "Infants with stridor or respiratory distress. Often found on prenatal US.",
        discriminatingKeyFeature: "CYSTIC and UNILOCULAR. Located near the tracheal bifurcation. Fluid density.",
        associatedFindings: "Displacement of the oesophagus or trachea.",
        complicationsSeriousAlternatives: "Neonatal respiratory distress (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hiatus Hernia",
        dominantImagingFinding: "Fluid or air-filled mass in the retrocardiac space.",
        distributionLocation: "Oesophageal hiatus.",
        demographicsClinicalContext: "Children with reflux or vomiting.",
        discriminatingKeyFeature: "GASTRO-OESOPHAGEAL contents within the chest. Air-fluid level. Positioned behind the heart.",
        associatedFindings: "Upside-down stomach.",
        complicationsSeriousAlternatives: "Volvulus.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P OSTERIOR MEDIASTINAL MASSES IN CHILDHOOD",
    itemNumber: "14.39",
    problemCluster: "paediatric posterior mediastinum",
    seriousAlternatives: ["Neuroblastoma", "Enteric Duplication Cyst", "Meningocoele"],
    differentials: [
      {
        diagnosis: "Neuroblastoma (Paravertebral)",
        dominantImagingFinding: "Large, irregular mass in the paravertebral sulcus. CALCIFICATION (90%). Neural foramen extension.",
        distributionLocation: "Posterior mediastinum. Often crosses the midline.",
        demographicsClinicalContext: "Infants and children (<2y). Bone pain and fever.",
        discriminatingKeyFeature: "CALCIFICATION and midline crossing. Encases vessels. Most common posterior mediastinal mass in children.",
        associatedFindings: "Opsoclonus-myoclonus and high urinary catecholamines.",
        complicationsSeriousAlternatives: "Cord compression ('Dumbbell' tumor).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Enteric Duplication Cyst (Neurenteric)",
        dominantImagingFinding: "Smooth, fluid-filled mass in the posterior mediastinum.",
        distributionLocation: "Paravertebral region.",
        demographicsClinicalContext: "Associated with VERTEBRAL ANOMALIES (Hemi-vertebrae, Spina bifida).",
        discriminatingKeyFeature: "VERTEBRAL ANOMALIES: The association with cervical/thoracic spine defects is pathognomonic for a neurenteric cyst.",
        associatedFindings: "Anomalous spinal development.",
        complicationsSeriousAlternatives: "Rupture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Extramedullary Haematopoiesis (Paediatric)",
        dominantImagingFinding: "Bilateral paravertebral soft tissue masses without bone destruction.",
        distributionLocation: "Lower thoracic spine.",
        demographicsClinicalContext: "History of severe anaemia (Thalassaemia Major).",
        discriminatingKeyFeature: "BILATERAL SYMMETRY and lack of calcification or bone destruction. Associated with thick skull vault.",
        associatedFindings: "Hepatosplenomegaly.",
        complicationsSeriousAlternatives: "Anaphylaxis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "UTERUS",
    itemNumber: "13.7",
    problemCluster: "uterine mass",
    seriousAlternatives: ["Leiomyoma (Fibroid)", "Endometrial Carcinoma", "Adenomyosis", "Uterine Sarcoma"],
    differentials: [
      {
        diagnosis: "Leiomyoma (Fibroid)",
        dominantImagingFinding: "Well-circumscribed, solid mass. LOW T2 signal on MRI. Popcorn calcification on CT/X-ray.",
        distributionLocation: "Intramural (most common), subserosal, or submucosal.",
        demographicsClinicalContext: "Premenopausal women. Menorrhagia and pelvic pressure.",
        discriminatingKeyFeature: "LOW T2 SIGNAL and well-defined margin. Unlike adenomyosis, it displaces the normal myometrium.",
        associatedFindings: "Cystic or hyaline degeneration.",
        complicationsSeriousAlternatives: "Red degeneration during pregnancy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Endometrial Carcinoma",
        dominantImagingFinding: "Irregular thickening of the endometrium (>5mm in post-menopausal). Heterogeneous enhancement.",
        distributionLocation: "Endometrial cavity.",
        demographicsClinicalContext: "Post-menopausal bleeding (PMB). Obesity and nulliparity.",
        discriminatingKeyFeature: "POST-MENOPAUSAL status and disrupted junctional zone on MRI. Endometrial thickness >5mm is abnormal.",
        associatedFindings: "Invasion of the myometrium.",
        complicationsSeriousAlternatives: "Lymph node metastases.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Adenomyosis",
        dominantImagingFinding: "Diffuse enlargement of the uterus with asymmetric thickening of the junctional zone (>12mm).",
        distributionLocation: "Myometrium focus (usually posterior wall).",
        demographicsClinicalContext: "Premenopausal women. Chronic pelvic pain and dysmenorrhoea.",
        discriminatingKeyFeature: "THICKENED JUNCTIONAL ZONE (>12mm) and small high T2 'cystic' spaces within the myometrium. No clear capsule.",
        associatedFindings: "Globular uterine enlargement.",
        complicationsSeriousAlternatives: "Chronic pain.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Uterine Sarcoma",
        dominantImagingFinding: "RAPIDLY GROWING, aggressive heterogeneous mass. Indistinguishable from a degenerating fibroid on imaging.",
        distributionLocation: "Uterine body.",
        demographicsClinicalContext: "Post-menopausal women with a 'growing fibroid'.",
        discriminatingKeyFeature: "RAPID GROWTH in a post-menopausal patient. Restricted diffusion (DWI) and high mitotic rate.",
        associatedFindings: "Regional invasion.",
        complicationsSeriousAlternatives: "Early metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 6 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_6_DATA) {
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
  console.log("Batch 6 Complete!");
}

main().catch(console.error);