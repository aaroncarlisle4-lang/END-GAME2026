import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const UPDATES = [
  {
    mnemonic: "CAVITIES",
    pattern: "Multiple pulmonary nodules",
    expanded: "C: Cancer (Mets), A: Autoimmune (GPA), V: Vascular (Septic emboli), I: Infection (TB/Fungal), T: Trauma, I: Inhalational, E: Eosinophilic, S: Sarcoidosis",
    problemCluster: "pulmonary nodules",
    differentials: [
      {
        diagnosis: "Metastases",
        dominantImagingFinding: "Multiple round, well-defined nodules of varying sizes.",
        distributionLocation: "Random, basal and peripheral predominance.",
        demographicsClinicalContext: "Known primary (Thyroid, Renal, Melanoma, Choriocarcinoma often cavitate).",
        discriminatingKeyFeature: "Varying sizes (disparate) and presence of known primary.",
        associatedFindings: "Pleural effusions. Hilar adenopathy.",
        complicationsSeriousAlternatives: "Tumor emboli.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Sarcoidosis",
        dominantImagingFinding: "PERILYMPHATIC micronodules.",
        distributionLocation: "Upper and mid zone predominance. Fissural.",
        demographicsClinicalContext: "Young adults. Erythema nodosum.",
        discriminatingKeyFeature: "Galaxy sign and symmetric hilar nodes.",
        associatedFindings: "1-2-3 sign.",
        complicationsSeriousAlternatives: "Pulmonary HTN.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Septic emboli",
        dominantImagingFinding: "Multiple nodules with CAVITATION. Often wedge-shaped.",
        distributionLocation: "Peripheral and lower lobe predominance.",
        demographicsClinicalContext: "IVDU, indwelling catheter, right-sided endocarditis.",
        discriminatingKeyFeature: "Feeding vessel sign and rapid cavitation in a septic patient.",
        associatedFindings: "Empyema.",
        complicationsSeriousAlternatives: "Pneumothorax.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Granulomatosis with polyangiitis (GPA)",
        dominantImagingFinding: "Multiple nodules or masses, often CAVITATING (50%).",
        distributionLocation: "Random, bilateral.",
        demographicsClinicalContext: "Sinusitis, renal disease (GN), c-ANCA positive.",
        discriminatingKeyFeature: "Lesions at different stages of evolution.",
        associatedFindings: "Ground-glass halo (haemorrhage).",
        complicationsSeriousAlternatives: "Diffuse alveolar haemorrhage.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Tuberculosis (TB)",
        dominantImagingFinding: "Cavitating nodules with tree-in-bud satellites.",
        distributionLocation: "Apical and posterior upper lobes.",
        demographicsClinicalContext: "Fever, night sweats, exposure.",
        discriminatingKeyFeature: "Apical predominance and tree-in-bud.",
        associatedFindings: "Volume loss.",
        complicationsSeriousAlternatives: "Rasmussen aneurysm.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "4 Ts",
    pattern: "Anterior mediastinal mass",
    expanded: "T: Thymoma, T: Teratoma, T: Terrible lymphoma, T: Thyroid",
    problemCluster: "mediastinal mass",
    differentials: [
      {
        diagnosis: "Thymoma",
        dominantImagingFinding: "Solid, well-defined soft tissue mass. Homogeneous.",
        distributionLocation: "Anterior mediastinum. Level of the heart base.",
        demographicsClinicalContext: "Adults (40-60y). MYASTHENIA GRAVIS (35%).",
        discriminatingKeyFeature: "Association with Myasthenia Gravis and Red Cell Aplasia.",
        associatedFindings: "Drop metastases to pleura if invasive.",
        complicationsSeriousAlternatives: "Invasive thymoma.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Teratoma/germ cell tumour",
        dominantImagingFinding: "Complex mass. FAT and CALCIFICATION (90%).",
        distributionLocation: "Anterior mediastinum.",
        demographicsClinicalContext: "Young adults (20-30y).",
        discriminatingKeyFeature: "Presence of macroscopic fat or teeth.",
        associatedFindings: "Fluid-fluid levels.",
        complicationsSeriousAlternatives: "Malignant germ cell tumour.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Terrible lymphoma",
        dominantImagingFinding: "BULKY, lobulated, multi-compartmental nodes.",
        distributionLocation: "Anterior and middle compartments.",
        demographicsClinicalContext: "Bimodal age. B-symptoms.",
        discriminatingKeyFeature: "Encases vessels without significant compression.",
        associatedFindings: "Pleural effusions.",
        complicationsSeriousAlternatives: "SVC syndrome.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Thyroid (retrosternal goitre)",
        dominantImagingFinding: "Intensely enhancing mass. Continuity with cervical thyroid.",
        distributionLocation: "Anterior and superior mediastinum.",
        demographicsClinicalContext: "Older adults. Tracheal deviation.",
        discriminatingKeyFeature: "Continuity with the neck thyroid gland (100%).",
        associatedFindings: "Coarse calcification.",
        complicationsSeriousAlternatives: "Airway compression.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "MARSH",
    pattern: "Nephrocalcinosis",
    expanded: "M: Medullary sponge kidney, A: Acidosis (RTA), R: Renal papillary necrosis, S: Sarcoidosis, H: Hyperparathyroidism",
    problemCluster: "renal calcification",
    differentials: [
      {
        diagnosis: "Medullary sponge kidney",
        dominantImagingFinding: "BOUQUET OF FLOWERS appearance (100% classic).",
        distributionLocation: "Medullary pyramids.",
        demographicsClinicalContext: "Adults. Incidental finding.",
        discriminatingKeyFeature: "Ectatic collecting ducts filled with contrast.",
        associatedFindings: "Normal renal function.",
        complicationsSeriousAlternatives: "Recurrent UTIs.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Renal tubular acidosis (type 1)",
        dominantImagingFinding: "DENSE medullary nephrocalcinosis (90%).",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Hypokalaemia. ALKALINE URINE.",
        discriminatingKeyFeature: "Severe diffuse calcification and alkaline urine.",
        associatedFindings: "Osteomalacia.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Hyperparathyroidism",
        dominantImagingFinding: "Diffuse medullary stippling.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "High Calcium, High PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION in hands.",
        associatedFindings: "Brown tumors.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Sarcoidosis",
        dominantImagingFinding: "Nephrocalcinosis.",
        distributionLocation: "Medullary.",
        demographicsClinicalContext: "Hypercalcaemia. Known sarcoid.",
        discriminatingKeyFeature: "Hilar adenopathy and lung nodules.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "Pulmonary HTN.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Oxalosis",
        dominantImagingFinding: "CORTICAL and Medullary calcification.",
        distributionLocation: "Diffuse.",
        demographicsClinicalContext: "Children. Renal failure.",
        discriminatingKeyFeature: "CORTICAL involvement.",
        associatedFindings: "Bone marrow deposits.",
        complicationsSeriousAlternatives: "ESRD.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "ROMPS",
    pattern: "Diffuse osteosclerosis",
    expanded: "R: Renal osteodystrophy, O: Osteopetrosis, M: Myelofibrosis / Metastases, P: Paget disease / Pyknodysostosis, S: Sickle cell disease",
    problemCluster: "increased bone density",
    differentials: [
      {
        diagnosis: "Myelofibrosis",
        dominantImagingFinding: "DIFFUSE, symmetric, ground-glass osteosclerosis (100%).",
        distributionLocation: "Axial skeleton (Spine, Pelvis, Ribs).",
        demographicsClinicalContext: "Adults (>50y). Massive SPLENOMEGALY.",
        discriminatingKeyFeature: "MASSIVE SPLENOMEGALY and diffuse axial sclerosis without bone expansion.",
        associatedFindings: "Extramedullary haematopoiesis.",
        complicationsSeriousAlternatives: "AML transformation.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Sclerotic metastases",
        dominantImagingFinding: "MULTIPLE focal or diffuse blastic lesions.",
        distributionLocation: "Axial skeleton in 90%.",
        demographicsClinicalContext: "Older adults. PROSTATE or Breast cancer.",
        discriminatingKeyFeature: "BLASTIC NODULAR lesions and known primary.",
        associatedFindings: "Superscan.",
        complicationsSeriousAlternatives: "Spinal cord compression.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Renal osteodystrophy",
        dominantImagingFinding: "RUGGER-JERSEY SPINE (100% specific).",
        distributionLocation: "Axial skeleton (Spine).",
        demographicsClinicalContext: "Chronic Renal Failure.",
        discriminatingKeyFeature: "SUBPERIOSTEAL resorption.",
        associatedFindings: "Brown tumors.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Paget's disease",
        dominantImagingFinding: "Cortical thickening and BONE ENLARGEMENT.",
        distributionLocation: "Asymmetric. Pelvis, skull.",
        demographicsClinicalContext: "Older adults (>55y).",
        discriminatingKeyFeature: "BONE ENLARGEMENT and PICTURE-FRAME vertebra.",
        associatedFindings: "Cotton-wool skull.",
        complicationsSeriousAlternatives: "Osteosarcoma.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Fluorosis",
        dominantImagingFinding: "DENSE osteosclerosis with ligament calcification.",
        distributionLocation: "Axial skeleton.",
        demographicsClinicalContext: "Chronic fluoride ingestion.",
        discriminatingKeyFeature: "LIGAMENTOUS CALCIFICATION.",
        associatedFindings: "Osteophytes.",
        complicationsSeriousAlternatives: "Joint stiffness.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "FOG MACHINES",
    pattern: "Multiple lucent bone lesions",
    expanded: "F: Fibrous dysplasia, O: Osteomyelitis, G: GCT, M: Myeloma/Metastasis, A: ABC, C: Chondroblastoma, H: Hyperparathyroidism (Brown tumor), I: Infection, N: Non-ossifying fibroma, E: Enchondroma / EG (LCH), S: Simple bone cyst",
    problemCluster: "lytic bone lesions",
    differentials: [
      {
        diagnosis: "Metastases",
        dominantImagingFinding: "AGGRESSIVE lytic destruction. Disparate sizes.",
        distributionLocation: "Axial skeleton. Involves PEDICLES.",
        demographicsClinicalContext: "Older adults. Known primary.",
        discriminatingKeyFeature: "PEDICLE DESTRUCTION and HOT BONE SCAN.",
        associatedFindings: "Vertebral collapse.",
        complicationsSeriousAlternatives: "Spinal instability.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Myeloma",
        dominantImagingFinding: "PUNCHED-OUT lytic lesions. Uniform size.",
        distributionLocation: "Axial skeleton. SPARES PEDICLES.",
        demographicsClinicalContext: "Adults (>50y). Bence-Jones protein.",
        discriminatingKeyFeature: "PEDICLE SPARING and COLD BONE SCAN.",
        associatedFindings: "Plasmacytoma.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Hyperparathyroidism (brown tumours)",
        dominantImagingFinding: "EXPANSILE lytic lesions. No sclerotic rim.",
        distributionLocation: "Random. Hands, Pelvis.",
        demographicsClinicalContext: "Chronic Renal Failure.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION in hands.",
        associatedFindings: "Rugger-Jersey spine.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Langerhans cell histiocytosis",
        dominantImagingFinding: "Punched-out lytic lesions. Bevelled edge in skull.",
        distributionLocation: "Skull, pelvis.",
        demographicsClinicalContext: "Children (5-15y).",
        discriminatingKeyFeature: "BEVELLED EDGE and BUTTON SEQUESTRUM.",
        associatedFindings: "Vertebra plana.",
        complicationsSeriousAlternatives: "Systemic disease.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Enchondromatosis (Ollier's)",
        dominantImagingFinding: "Multiple expansile lesions with RINGS AND ARCS.",
        distributionLocation: "Hands and feet.",
        demographicsClinicalContext: "Children.",
        discriminatingKeyFeature: "CHONDROID MATRIX calcification.",
        associatedFindings: "Bone shortening.",
        complicationsSeriousAlternatives: "Chondrosarcoma.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "FEGNOMASHIC",
    pattern: "Expansile lytic lesion",
    expanded: "F: Fibrous dysplasia, E: EG (LCH), G: GCT, N: NOF, O: Osteoblastoma, M: Myeloma/Metastasis, A: ABC, S: Simple bone cyst, H: Hyperparathyroidism, I: Infection, C: Chondromyxoid fibroma",
    problemCluster: "lytic bone lesion",
    differentials: [
      {
        diagnosis: "Aneurysmal bone cyst",
        dominantImagingFinding: "Highly EXPANSILE 'blow-out' lesion. Internal septa.",
        distributionLocation: "Metaphyseal.",
        demographicsClinicalContext: "Children (<20y).",
        discriminatingKeyFeature: "FLUID-FLUID LEVELS on MRI.",
        associatedFindings: "Thin subperiosteal bone shell.",
        complicationsSeriousAlternatives: "Fracture.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Giant cell tumour",
        dominantImagingFinding: "LYTIC, eccentric, expansile. No sclerotic rim.",
        distributionLocation: "EPIPHYSEAL - reaches subarticular surface. CLOSED PHYSIS.",
        demographicsClinicalContext: "Adults (20-40y).",
        discriminatingKeyFeature: "SUBARTICULAR location in a mature skeleton.",
        associatedFindings: "Soap-bubble appearance.",
        complicationsSeriousAlternatives: "Malignant transformation.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Simple bone cyst",
        dominantImagingFinding: "Central lytic. Truncated cone shape.",
        distributionLocation: "Metaphyseal/Diaphyseal.",
        demographicsClinicalContext: "Children (5-15y).",
        discriminatingKeyFeature: "FALLEN FRAGMENT SIGN.",
        associatedFindings: "Fracture.",
        complicationsSeriousAlternatives: "Recurrent fractures.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Chondromyxoid fibroma",
        dominantImagingFinding: "Eccentric lytic. Scalloped sclerotic margin.",
        distributionLocation: "Metaphyseal (Proximal tibia).",
        demographicsClinicalContext: "Young adults.",
        discriminatingKeyFeature: "HEAVILY SCALLOPED sclerotic border.",
        associatedFindings: "Cortical expansion.",
        complicationsSeriousAlternatives: "ABC mimic.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Fibrous dysplasia",
        dominantImagingFinding: "GROUND-GLASS matrix (100%). Thick sclerotic 'rind'.",
        distributionLocation: "Long bones (Shepherd's Crook).",
        demographicsClinicalContext: "Young adults.",
        discriminatingKeyFeature: "GROUND-GLASS attenuation.",
        associatedFindings: "Bowing deformities.",
        complicationsSeriousAlternatives: "Sarcomatous transformation.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "LOSE ME",
    pattern: "Aggressive lytic lesion in child",
    expanded: "L: Leukaemia / Lymphoma, O: Osteomyelitis, S: Sarcoma (Ewing), E: EG (LCH), M: Metastasis (Neuroblastoma)",
    problemCluster: "paediatric bone lesion",
    differentials: [
      {
        diagnosis: "Ewing sarcoma",
        dominantImagingFinding: "PERMEATIVE destruction. Onion-skin periostitis.",
        distributionLocation: "DIAPHYSEAL or metadiaphyseal.",
        demographicsClinicalContext: "Peak 5-20y.",
        discriminatingKeyFeature: "LARGE SOFT TISSUE MASS.",
        associatedFindings: "Codman's triangle.",
        complicationsSeriousAlternatives: "Pulmonary metastases.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Osteosarcoma",
        dominantImagingFinding: "Aggressive destruction with OSTEIOD matrix.",
        distributionLocation: "Metaphyseal (Knee).",
        demographicsClinicalContext: "Adolescents.",
        discriminatingKeyFeature: "SUNBURST periosteal reaction and osteoid matrix.",
        associatedFindings: "Soft tissue mass.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Langerhans cell histiocytosis",
        dominantImagingFinding: "PUNCHED-OUT lytic lesion. Bevelled edge.",
        distributionLocation: "Skull, Pelvis, Femur.",
        demographicsClinicalContext: "Children (5-10y).",
        discriminatingKeyFeature: "BEVELLED EDGE in skull.",
        associatedFindings: "Vertebra plana.",
        complicationsSeriousAlternatives: "Systemic disease.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Acute osteomyelitis",
        dominantImagingFinding: "LYTIC destruction. SEQUESTRUM.",
        distributionLocation: "Metaphyseal.",
        demographicsClinicalContext: "Acute fever.",
        discriminatingKeyFeature: "SEQUESTRUM and rapid change.",
        associatedFindings: "Soft tissue oedema.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Metastatic neuroblastoma",
        dominantImagingFinding: "Aggressive destruction and soft tissue mass.",
        distributionLocation: "Skull, spine.",
        demographicsClinicalContext: "Peak 2y. High VMA.",
        discriminatingKeyFeature: "Raccoon eyes and known primary.",
        associatedFindings: "Sutural widening.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "GOCCI",
    pattern: "Epiphyseal lucent lesion",
    expanded: "G: GCT, O: Osteoblastoma, C: Chondroblastoma, C: Clear cell chondrosarcoma, I: Intraosseous ganglion",
    problemCluster: "subarticular bone lesion",
    differentials: [
      {
        diagnosis: "Giant cell tumour",
        dominantImagingFinding: "LYTIC, eccentric. No sclerotic rim.",
        distributionLocation: "EPIPHYSEAL. CLOSED PHYSIS.",
        demographicsClinicalContext: "Adults (20-40y).",
        discriminatingKeyFeature: "SUBARTICULAR location in mature skeleton.",
        associatedFindings: "Soap-bubble appearance.",
        complicationsSeriousAlternatives: "Malignancy.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Chondroblastoma",
        dominantImagingFinding: "LYTIC with thin sclerotic rim. Stippled calcification.",
        distributionLocation: "EPIPHYSEAL. OPEN PHYSIS.",
        demographicsClinicalContext: "Children (Peak 15y).",
        discriminatingKeyFeature: "OPEN PHYSIS and calcification.",
        associatedFindings: "Peri-lesional oedema.",
        complicationsSeriousAlternatives: "Recurrence.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Clear cell chondrosarcoma",
        dominantImagingFinding: "Lytic epiphyseal lesion. Chondroid calcification.",
        distributionLocation: "Epiphyseal (Proximal femur).",
        demographicsClinicalContext: "Adults (30-50y).",
        discriminatingKeyFeature: "Malignant features in middle-aged adult.",
        associatedFindings: "Cortical breakthrough.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Subchondral cyst (geode)",
        dominantImagingFinding: "LYTIC subarticular cyst. Sclerotic rim.",
        distributionLocation: "Subarticular. Weight-bearing joints.",
        demographicsClinicalContext: "Older adults. OSTEOARTHRITIS.",
        discriminatingKeyFeature: "JOINT SPACE NARROWING and osteophytes.",
        associatedFindings: "Subchondral sclerosis.",
        complicationsSeriousAlternatives: "Joint collapse.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Intraosseous ganglion",
        dominantImagingFinding: "Well-defined solitary lytic lesion.",
        distributionLocation: "Subarticular. Normal joint space.",
        demographicsClinicalContext: "Adults.",
        discriminatingKeyFeature: "NORMAL ADJACENT JOINT SPACE.",
        associatedFindings: "Communicates with joint capsule.",
        complicationsSeriousAlternatives: "Fracture.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "Five Ms",
    pattern: "Diffuse marrow infiltration MRI",
    expanded: "M: Myeloma, M: Metastases, M: Mastocytosis, M: Myelofibrosis, M: Marrow hyperplasia",
    problemCluster: "marrow signal abnormality",
    differentials: [
      {
        diagnosis: "Myeloma",
        dominantImagingFinding: "Focal or diffuse LOW T1 signal (darker than muscle).",
        distributionLocation: "Axial skeleton. SPARES PEDICLES.",
        demographicsClinicalContext: "Adults (>50y).",
        discriminatingKeyFeature: "COLD BONE SCAN and low T1.",
        associatedFindings: "Punched-out lesions.",
        complicationsSeriousAlternatives: "Fracture.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Lymphoma",
        dominantImagingFinding: "Diffuse marrow infiltration. Low T1.",
        distributionLocation: "Axial skeleton.",
        demographicsClinicalContext: "B-symptoms.",
        discriminatingKeyFeature: "Associated lymphadenopathy.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Leukaemia",
        dominantImagingFinding: "Diffuse marrow replacement.",
        distributionLocation: "Symmetric.",
        demographicsClinicalContext: "Children.",
        discriminatingKeyFeature: "Lucent metaphyseal bands.",
        associatedFindings: "Hepatosplenomegaly.",
        complicationsSeriousAlternatives: "Infection.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Metastatic disease",
        dominantImagingFinding: "Focal or diffuse LOW T1 signal.",
        distributionLocation: "Axial skeleton. INVOLVES PEDICLES.",
        demographicsClinicalContext: "Known primary.",
        discriminatingKeyFeature: "HOT BONE SCAN and pedicle destruction.",
        associatedFindings: "Soft tissue mass.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Myelofibrosis",
        dominantImagingFinding: "DIFFUSE Low T1 and Low T2 signal.",
        distributionLocation: "Axial skeleton.",
        demographicsClinicalContext: "SPLENOMEGALY.",
        discriminatingKeyFeature: "MASSIVE SPLENOMEGALY and very dark marrow.",
        associatedFindings: "Extramedullary haematopoiesis.",
        complicationsSeriousAlternatives: "AML.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "AMEND",
    pattern: "Posterior vertebral scalloping",
    expanded: "A: Acromegaly / Achondroplasia, M: Marfan syndrome, E: Ehlers-Danlos, N: NF1 (Dural ectasia), D: Dwarfism",
    problemCluster: "spinal bone remodeling",
    differentials: [
      {
        diagnosis: "Intradural tumour (ependymoma/schwannoma)",
        dominantImagingFinding: "Scalloping due to slow-growing mass.",
        distributionLocation: "Focal to the tumor site.",
        demographicsClinicalContext: "Variable.",
        discriminatingKeyFeature: "Visible enhancing mass on MRI.",
        associatedFindings: "Foraminal widening.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Neurofibromatosis",
        dominantImagingFinding: "DEEP posterior scalloping (Dural Ectasia).",
        distributionLocation: "Lumbosacral.",
        demographicsClinicalContext: "NF1 diagnosis.",
        discriminatingKeyFeature: "Dumbbell neurofibromas and ribbon ribs.",
        associatedFindings: "Kyphoscoliosis.",
        complicationsSeriousAlternatives: "Deformity.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Marfan syndrome",
        dominantImagingFinding: "DURAL ECTASIA. Tall thin vertebrae.",
        distributionLocation: "Lumbosacral.",
        demographicsClinicalContext: "Arachnodactyly.",
        discriminatingKeyFeature: "Aortic root dilatation.",
        associatedFindings: "Pectus excavatum.",
        complicationsSeriousAlternatives: "Aortic dissection.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Achondroplasia",
        dominantImagingFinding: "Scalloping with NARROWING interpedicular distance.",
        distributionLocation: "Lumbar spine.",
        demographicsClinicalContext: "Rhizomelic dwarfism.",
        discriminatingKeyFeature: "NARROWING interpedicular distance caudally.",
        associatedFindings: "Champagne glass pelvis.",
        complicationsSeriousAlternatives: "Spinal stenosis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Acromegaly",
        dominantImagingFinding: "CONCAVE posterior bodies. Increased sagittal diameter.",
        distributionLocation: "Diffuse spine.",
        demographicsClinicalContext: "Pituitary adenoma.",
        discriminatingKeyFeature: "Heel pad >25mm and Spade-like tufts.",
        associatedFindings: "Enlarged sella.",
        complicationsSeriousAlternatives: "Heart failure.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "SHIRT",
    pattern: "Lateral clavicle resorption",
    expanded: "S: Scleroderma, H: Hyperparathyroidism, I: Iatrogenic, R: RA, T: Trauma (post-traumatic osteolysis)",
    problemCluster: "distal clavicle loss",
    differentials: [
      {
        diagnosis: "Rheumatoid arthritis",
        dominantImagingFinding: "EROSIVE destruction.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Females. Polyarthritis.",
        discriminatingKeyFeature: "Symmetrical small joint erosions.",
        associatedFindings: "AC joint subluxation.",
        complicationsSeriousAlternatives: "Atlanto-axial subluxation.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Hyperparathyroidism",
        dominantImagingFinding: "SUBPERIOSTEAL resorption.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Renal failure.",
        discriminatingKeyFeature: "Resorption on radial side of middle phalanges.",
        associatedFindings: "Rugger-Jersey spine.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Post-traumatic osteolysis",
        dominantImagingFinding: "Focal resorption.",
        distributionLocation: "UNILATERAL.",
        demographicsClinicalContext: "Weightlifters.",
        discriminatingKeyFeature: "Unilaterality and stress history.",
        associatedFindings: "AC joint widening.",
        complicationsSeriousAlternatives: "Chronic pain.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Scleroderma",
        dominantImagingFinding: "TAPERED distal clavicle.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Raynaud's.",
        discriminatingKeyFeature: "Acro-osteolysis and calcinosis.",
        associatedFindings: "NSIP.",
        complicationsSeriousAlternatives: "Renal crisis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Cleidocranial dysplasia",
        dominantImagingFinding: "ABSENT or hypoplastic clavicles.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Short stature.",
        discriminatingKeyFeature: "Absent clavicles and supernumerary teeth.",
        associatedFindings: "Wormian bones.",
        complicationsSeriousAlternatives: "Hearing loss.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "TIPS",
    pattern: "Short metacarpals",
    expanded: "T: Turner syndrome, I: Idiopathic, P: Pseudohypoparathyroidism (PHP), S: Sickle cell (infarction)",
    problemCluster: "metacarpal sign",
    differentials: [
      {
        diagnosis: "Pseudohypoparathyroidism",
        dominantImagingFinding: "MULTIPLE short metacarpals (3,4,5).",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Short stature, obesity.",
        discriminatingKeyFeature: "Multiple short MCs and subcutaneous calcification.",
        associatedFindings: "Basal ganglia calcification.",
        complicationsSeriousAlternatives: "Hypocalcaemia.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Turner syndrome",
        dominantImagingFinding: "SHORT 4th MC.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Females (XO). Webbed neck.",
        discriminatingKeyFeature: "Positive metacarpal sign.",
        associatedFindings: "Carpal angle <117 deg.",
        complicationsSeriousAlternatives: "Coarctation of aorta.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Sickle cell disease",
        dominantImagingFinding: "Shortening due to epiphyseal fusion.",
        distributionLocation: "Focal.",
        demographicsClinicalContext: "African descent.",
        discriminatingKeyFeature: "H-shaped vertebrae.",
        associatedFindings: "Bone infarcts.",
        complicationsSeriousAlternatives: "Osteomyelitis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Idiopathic/post-traumatic",
        dominantImagingFinding: "Isolated short MC.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Healthy adults.",
        discriminatingKeyFeature: "Isolated finding.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Hereditary multiple exostoses",
        dominantImagingFinding: "Shortening secondary to osteochondromas.",
        distributionLocation: "Multiple.",
        demographicsClinicalContext: "AD inheritance.",
        discriminatingKeyFeature: "Bony outgrowths.",
        associatedFindings: "Madelung-like wrist.",
        complicationsSeriousAlternatives: "Chondrosarcoma.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "PINCH FO",
    pattern: "Acro-osteolysis",
    expanded: "P: Psoriasis / PVC exposure, I: Injury (Frostbite/Burn), N: Neuropathy (Diabetes/Leprosy), C: Collagen vascular (Scleroderma), H: Hyperparathyroidism, F: Familial, O: Osteolysis",
    problemCluster: "distal phalangeal resorption",
    differentials: [
      {
        diagnosis: "Scleroderma",
        dominantImagingFinding: "TAPERED resorption.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Raynaud's.",
        discriminatingKeyFeature: "Calcinosis.",
        associatedFindings: "Oesophageal dilatation.",
        complicationsSeriousAlternatives: "Renal crisis.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Psoriatic arthritis",
        dominantImagingFinding: "Pencil-in-cup deformity.",
        distributionLocation: "Asymmetric. DIP joints.",
        demographicsClinicalContext: "Skin psoriasis.",
        discriminatingKeyFeature: "No periarticular osteopenia.",
        associatedFindings: "Ivory phalanx.",
        complicationsSeriousAlternatives: "Arthritis mutilans.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Hyperparathyroidism",
        dominantImagingFinding: "Subperiosteal resorption.",
        distributionLocation: "Symmetric.",
        demographicsClinicalContext: "Renal failure.",
        discriminatingKeyFeature: "Radial side middle phalanx resorption.",
        associatedFindings: "Rugger-Jersey spine.",
        complicationsSeriousAlternatives: "Brown tumors.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Thermal injury/frostbite",
        dominantImagingFinding: "Sharp amputation.",
        distributionLocation: "Exposed digits.",
        demographicsClinicalContext: "Cold exposure.",
        discriminatingKeyFeature: "Preserved joint spaces.",
        associatedFindings: "Early OA.",
        complicationsSeriousAlternatives: "Gangrene.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Vinyl chloride exposure",
        dominantImagingFinding: "Transverse band-like osteolysis.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "PVC manufacturing.",
        discriminatingKeyFeature: "Band-like lucency.",
        associatedFindings: "Hepatic angiosarcoma risk.",
        complicationsSeriousAlternatives: "Angiosarcoma.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "PRION",
    pattern: "Bowed tibia",
    expanded: "P: Paget's disease, R: Rickets, I: Injury, O: OI, N: Neurofibromatosis",
    problemCluster: "tibial bowing",
    differentials: [
      {
        diagnosis: "Paget's disease",
        dominantImagingFinding: "ANTEROLATERAL bowing. Cortical thickening.",
        distributionLocation: "Asymmetric.",
        demographicsClinicalContext: "Older adults.",
        discriminatingKeyFeature: "Blade of grass sign.",
        associatedFindings: "Bone enlargement.",
        complicationsSeriousAlternatives: "Osteosarcoma.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Rickets",
        dominantImagingFinding: "METAPHYSEAL CUPPING and fraying.",
        distributionLocation: "Bilateral. Knees/Ankles.",
        demographicsClinicalContext: "Infant.",
        discriminatingKeyFeature: "Widened physis.",
        associatedFindings: "Rachitic rosary.",
        complicationsSeriousAlternatives: "Deformity.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Fibrous dysplasia",
        dominantImagingFinding: "Ground-glass matrix.",
        distributionLocation: "Long bones.",
        demographicsClinicalContext: "Young adults.",
        discriminatingKeyFeature: "Shepherd's crook.",
        associatedFindings: "Rind sign.",
        complicationsSeriousAlternatives: "Sarcoma.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Neurofibromatosis",
        dominantImagingFinding: "ANTEROLATERAL bowing. Cortical thinning.",
        distributionLocation: "Unilateral.",
        demographicsClinicalContext: "NF1 diagnosis.",
        discriminatingKeyFeature: "PSEUDOARTHROSIS.",
        associatedFindings: "Ribbon ribs.",
        complicationsSeriousAlternatives: "Non-union.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Osteogenesis imperfecta",
        dominantImagingFinding: "Multiple fractures. Gracile bones.",
        distributionLocation: "Diffuse.",
        demographicsClinicalContext: "Blue sclerae.",
        discriminatingKeyFeature: "Wormian bones.",
        associatedFindings: "Platyspondyly.",
        complicationsSeriousAlternatives: "Deformity.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "HALT V",
    pattern: "Diffuse periosteal reaction adults",
    expanded: "H: HOA, A: Acmeopathy, L: Leukaemia / Lymphoma, T: Trauma, V: Venous stasis",
    problemCluster: "periostitis",
    differentials: [
      {
        diagnosis: "Hypertrophic pulmonary osteoarthropathy",
        dominantImagingFinding: "BILATERAL symmetric smooth periostitis.",
        distributionLocation: "Diaphyses.",
        demographicsClinicalContext: "Lung Cancer.",
        discriminatingKeyFeature: "Clubbing.",
        associatedFindings: "Double stripe sign.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Thyroid acropachy",
        dominantImagingFinding: "SPICULATED reaction.",
        distributionLocation: "Hands.",
        demographicsClinicalContext: "Graves disease.",
        discriminatingKeyFeature: "Spiculated in hands.",
        associatedFindings: "Exophthalmos.",
        complicationsSeriousAlternatives: "Thyroid storm.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Venous stasis",
        dominantImagingFinding: "SHAGGY undulating thickening.",
        distributionLocation: "Lower limb.",
        demographicsClinicalContext: "Varicose veins.",
        discriminatingKeyFeature: "Phleboliths.",
        associatedFindings: "Oedema.",
        complicationsSeriousAlternatives: "Ulcer.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Leukaemia/lymphoma",
        dominantImagingFinding: "Permeative loss.",
        distributionLocation: "Diffuse.",
        demographicsClinicalContext: "B-symptoms.",
        discriminatingKeyFeature: "Permeative destruction.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "Multi-organ failure.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Pachydermoperiostosis",
        dominantImagingFinding: "Irregular new bone.",
        distributionLocation: "Diffuse.",
        demographicsClinicalContext: "Young males.",
        discriminatingKeyFeature: "Facial skin thickening.",
        associatedFindings: "Joint effusions.",
        complicationsSeriousAlternatives: "Joint stiffness.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "SAD GITS",
    pattern: "Osteonecrosis of the hips",
    expanded: "S: Steroids / Sickle cell, A: Alcohol, D: Dysbarism, G: Gaucher disease, I: Infection, T: Trauma, S: Storage disease",
    problemCluster: "avascular necrosis",
    differentials: [
      {
        diagnosis: "Steroid use",
        dominantImagingFinding: "DOUBLE LINE SIGN.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "SLE, Asthma.",
        discriminatingKeyFeature: "Crescent sign.",
        associatedFindings: "OA.",
        complicationsSeriousAlternatives: "Collapse.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Alcohol",
        dominantImagingFinding: "Aggressive collapse.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Ethanol abuse.",
        discriminatingKeyFeature: "Liver stigmata.",
        associatedFindings: "Fatty liver.",
        complicationsSeriousAlternatives: "Liver failure.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Sickle cell disease",
        dominantImagingFinding: "Medullary infarcts.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "African descent.",
        discriminatingKeyFeature: "H-shaped vertebrae.",
        associatedFindings: "Autosplenectomy.",
        complicationsSeriousAlternatives: "Osteomyelitis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "SLE",
        dominantImagingFinding: "DOUBLE LINE SIGN.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Steroid therapy.",
        discriminatingKeyFeature: "Lupus markers.",
        associatedFindings: "Pleural effusions.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Trauma (Post-traumatic)",
        dominantImagingFinding: "Subchondral collapse.",
        distributionLocation: "STRICTLY UNILATERAL.",
        demographicsClinicalContext: "Neck fracture.",
        discriminatingKeyFeature: "Surgical hardware.",
        associatedFindings: "Unilateral OA.",
        complicationsSeriousAlternatives: "Non-union.",
        isCorrectDiagnosis: false
      }
    ]
  }
];

async function main() {
  console.log("Seeding strictly ordered MSK batch...");
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
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 2, 
          expandedLetters: update.expanded
        }
      });
    } else {
      console.log(`Creating ${update.mnemonic}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
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