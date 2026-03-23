import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_8_DATA = [
  {
    pattern: "R EGIONAL OSTEOPENIA",
    itemNumber: "1.19",
    problemCluster: "localized bone loss",
    seriousAlternatives: ["Complex Regional Pain Syndrome (CRPS)", "Disuse Atrophy", "Septic Arthritis", "Transient Osteoporosis"],
    differentials: [
      {
        diagnosis: "CRPS (Sudeck’s Atrophy)",
        dominantImagingFinding: "Rapid, severe patchy 'moth-eaten' osteopenia. Significant soft tissue swelling.",
        distributionLocation: "Distal to a site of injury (Hand/Foot). Crosses multiple joint spaces.",
        demographicsClinicalContext: "Follows minor trauma or surgery. Intense burning pain, vasomotor instability, and trophic skin changes.",
        discriminatingKeyFeature: "PATCHY OSTEOPENIA and intense pain out of proportion to injury. Bone scan shows increased uptake in all 3 phases.",
        associatedFindings: "Preserved joint spaces (unlike septic arthritis).",
        complicationsSeriousAlternatives: "Permanent limb disability.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Transient Osteoporosis of the Hip (TOH)",
        dominantImagingFinding: "Profound osteopenia of the femoral head and neck. Blurred trabeculae.",
        distributionLocation: "Hip (unilateral). Characteristically spares the joint space.",
        demographicsClinicalContext: "Middle-aged males or pregnant females (3rd trimester). Spontaneous onset groin pain.",
        discriminatingKeyFeature: "BONE MARROW OEDEMA on MRI: Diffuse low T1/High T2 signal throughout the femoral head and neck. Self-limiting (6-12 months).",
        associatedFindings: "Occasional joint effusion.",
        complicationsSeriousAlternatives: "Insufficiency fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Disuse Atrophy",
        dominantImagingFinding: "Generalized thinning of the cortex and sparse trabeculae. More gradual than CRPS.",
        distributionLocation: "Limited to the immobilized limb.",
        demographicsClinicalContext: "History of plaster cast immobilization or paralysis.",
        discriminatingKeyFeature: "HISTORY: Clear link to immobilization. Lacks the vasomotor symptoms or intense pain of CRPS.",
        associatedFindings: "Muscle wasting.",
        complicationsSeriousAlternatives: "Increased fracture risk.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Septic Arthritis (Early)",
        dominantImagingFinding: "Juxta-articular osteoporosis and rapid joint space narrowing.",
        distributionLocation: "Monoarticular. Weight-bearing joints common.",
        demographicsClinicalContext: "Acute fever and hot, swollen joint.",
        discriminatingKeyFeature: "JOINT SPACE NARROWING: Infection destroys cartilage rapidly. CRPS and disuse usually preserve the joint space.",
        associatedFindings: "Subchondral erosions.",
        complicationsSeriousAlternatives: "Irreversible joint destruction (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "A RTHRITIS MUTILANS",
    itemNumber: "3.8",
    problemCluster: "destructive arthritis",
    seriousAlternatives: ["Psoriatic Arthritis", "Rheumatoid Arthritis", "Neuropathic (Charcot) Joint", "Multicentric Reticulohistiocytosis"],
    differentials: [
      {
        diagnosis: "Psoriatic Arthritis (Mutilans form)",
        dominantImagingFinding: "Extreme destruction of small joints with 'TELESCOPING' of digits (Opera-glass hand).",
        distributionLocation: "Hands and feet (DIPs and PIPs). Asymmetric.",
        demographicsClinicalContext: "Severe skin psoriasis. Dactylitis.",
        discriminatingKeyFeature: "PENCIL-IN-CUP deformity and lack of periarticular osteoporosis. Significant bone proliferation (periostitis) elsewhere.",
        associatedFindings: "Sacroiliitis and syndesmophytes.",
        complicationsSeriousAlternatives: "Complete loss of hand function.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Rheumatoid Arthritis (Severe)",
        dominantImagingFinding: "Severe symmetric joint destruction, subluxations, and profound osteoporosis.",
        distributionLocation: "MCPs, PIPs, and Carpals. Bilateral and symmetric.",
        demographicsClinicalContext: "Female predominance. Positive RF/Anti-CCP.",
        discriminatingKeyFeature: "SYMMETRY and OSTEOPOROSIS. RA lacks the bone proliferation/periostitis of psoriasis.",
        associatedFindings: "Ulnar deviation and Swan-neck deformities.",
        complicationsSeriousAlternatives: "Atlanto-axial subluxation (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Neuropathic (Charcot) Joint",
        dominantImagingFinding: "The 6 Ds: Destruction, Debris, Disorganization, Dislocation, Distension, increased Density.",
        distributionLocation: "Foot/Ankle (Diabetes) or Shoulder/Elbow (Syringomyelia).",
        demographicsClinicalContext: "Loss of pain/proprioception. Diabetic neuropathy.",
        discriminatingKeyFeature: "DISORGANIZATION and SCLEROSIS (Density). Unlike inflammatory arthritis, Charcot joints are often hyper-dense/sclerotic.",
        associatedFindings: "Soft tissue gas (if infected).",
        complicationsSeriousAlternatives: "Superimposed osteomyelitis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L UNG CAVITIES",
    itemNumber: "4.19",
    problemCluster: "cavitating lung lesions",
    seriousAlternatives: ["Squamous Cell Carcinoma", "TB Cavity", "Lung Abscess", "Septic Emboli", "GPA"],
    differentials: [
      {
        diagnosis: "Squamous Cell Carcinoma (SCC)",
        dominantImagingFinding: "Thick-walled cavity (>15mm wall thickness) with an irregular, nodular inner margin.",
        distributionLocation: "Upper lobes common. Centrally located.",
        demographicsClinicalContext: "Older smokers. Weight loss and haemoptysis.",
        discriminatingKeyFeature: "THICK NODULAR WALL: A wall thickness >15mm is highly suggestive of malignancy. 95% of cavitating lung cancers are SCC.",
        associatedFindings: "Hilar adenopathy and post-obstructive collapse.",
        complicationsSeriousAlternatives: "Massive haemoptysis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Post-Primary Tuberculosis (TB)",
        dominantImagingFinding: "Thin or thick-walled cavity characteristically surrounded by 'TREE-IN-BUD' centrilobular nodules.",
        distributionLocation: "APICAL and posterior segments of the upper lobes (85%).",
        demographicsClinicalContext: "Fever, night sweats, and chronic cough. Immigrants or immunocompromised.",
        discriminatingKeyFeature: "APICAL LOCATION and TREE-IN-BUD satellites. SCC rarely has widespread satellite nodules.",
        associatedFindings: "Volume loss and fibrocalcific scarring.",
        complicationsSeriousAlternatives: "Miliary dissemination.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Lung Abscess",
        dominantImagingFinding: "Thick-walled cavity containing a prominent AIR-FLUID LEVEL.",
        distributionLocation: "Dependent segments (Posterior upper lobes, Superior lower lobes).",
        demographicsClinicalContext: "Aspiration risk (Alcoholism, epilepsy, poor dental hygiene). Acute fever and foul-smelling sputum.",
        discriminatingKeyFeature: "AIR-FLUID LEVEL and dependent location. The wall is typically smooth on the inside (unlike SCC).",
        associatedFindings: "Surrounding consolidation (pneumonia).",
        complicationsSeriousAlternatives: "Empyema.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Granulomatosis with Polyangiitis (GPA)",
        dominantImagingFinding: "Multiple cavitating nodules or masses. Often thin-walled.",
        distributionLocation: "Random and peripheral. No zonal predilection.",
        demographicsClinicalContext: "Adults. Sinusitis and renal disease. c-ANCA positive.",
        discriminatingKeyFeature: "MULTIPLICITY: Unlike the solitary SCC or TB cavity, GPA characteristically presents with multiple bilateral cavities.",
        associatedFindings: "Subglottic stenosis.",
        complicationsSeriousAlternatives: "Alveolar haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "P ULMONARY CALCIFICATION OR OSSIFICATION",
    itemNumber: "4.21",
    problemCluster: "lung density",
    seriousAlternatives: ["Healed Infection (Granuloma)", "Hamartoma", "Mitral Stenosis", "Alveolar Microlithiasis"],
    differentials: [
      {
        diagnosis: "Healed Granuloma (TB/Histo)",
        dominantImagingFinding: "Small, dense, well-defined calcified nodule. Usually <1cm.",
        distributionLocation: "Random. Often upper lobes (TB) or lower (Histoplasmosis).",
        demographicsClinicalContext: "Asymptomatic incidental finding.",
        discriminatingKeyFeature: "STABILITY: Absolute stability on old films and benign calcification pattern (Central, Diffuse, or Laminar).",
        associatedFindings: "Calcified hilar nodes.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pulmonary Hamartoma",
        dominantImagingFinding: "Well-circumscribed nodule with 'POPCORN' calcification and internal MACROSCOPIC FAT.",
        distributionLocation: "Peripheral.",
        demographicsClinicalContext: "Adults. Most common benign lung tumor.",
        discriminatingKeyFeature: "POPCORN CALCIFICATION and FAT (-60 to -100 HU) are diagnostic. Lacks internal flow.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mitral Stenosis (Ossification)",
        dominantImagingFinding: "Multiple small (2-5mm) very dense 'DENDRIFORM' bony nodules in the lung bases.",
        distributionLocation: "Mid and lower zones. Bilateral.",
        demographicsClinicalContext: "Longstanding Rheumatic Heart Disease.",
        discriminatingKeyFeature: "BASAL OSSIFICATION and CARDIOMEGALY (LA enlargement). Associated with venous congestion.",
        associatedFindings: "Double-density sign and splayed carina.",
        complicationsSeriousAlternatives: "Pulmonary hypertension.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Alveolar Microlithiasis",
        dominantImagingFinding: "Extremely dense, 'SAND-LIKE' micronodular calcification (INNUMERABLE).",
        distributionLocation: "Diffuse, but more intense in the lower zones. 'SAND STORM' appearance.",
        demographicsClinicalContext: "Rare. Often asymptomatic early. Familial.",
        discriminatingKeyFeature: "BLACK PLEURA LINE: A fine lucent line between the dense lung and the ribs (representing normal pleura).",
        associatedFindings: "Apical bullae.",
        complicationsSeriousAlternatives: "Cor pulmonale.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "COLONIC STRICTURES",
    itemNumber: "6.23",
    problemCluster: "colonic narrowing",
    seriousAlternatives: ["Adenocarcinoma", "Diverticulitis", "Crohn's Colitis", "Ischaemic Colitis"],
    differentials: [
      {
        diagnosis: "Colonic Adenocarcinoma",
        dominantImagingFinding: "Short-segment (<5cm), asymmetric stricture with SHOULDERED MARGINS ('Apple-core' lesion).",
        distributionLocation: "Sigmoid (most common), Caecum, or Rectum.",
        demographicsClinicalContext: "Older adults. Altered bowel habit, weight loss, or iron deficiency anaemia.",
        discriminatingKeyFeature: "APPLE-CORE appearance: Short, abrupt narrowing with mucosal destruction. Malignant until proven otherwise.",
        associatedFindings: "Proximal colonic dilatation. Liver metastases.",
        complicationsSeriousAlternatives: "Large bowel obstruction (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Diverticular Stricture",
        dominantImagingFinding: "Long-segment (often >10cm), smooth stricture with PRESERVED MUCOSA. Multiple diverticula.",
        distributionLocation: "Sigmoid colon (95%).",
        demographicsClinicalContext: "Elderly. Chronic constipation. History of acute diverticulitis.",
        discriminatingKeyFeature: "LONG SEGMENT and PRESERVED mucosa. Associated with a 'sawtooth' appearance of the bowel wall.",
        associatedFindings: "Pericolic fat stranding or abscess (if acute).",
        complicationsSeriousAlternatives: "Fistula (Colovesical).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Crohn's Colitis",
        dominantImagingFinding: "Eccentric strictures with skip lesions. Cobblestone mucosa and deep fissuring ulcers.",
        distributionLocation: "Can involve any part of the colon. Spares the rectum (unlike UC).",
        demographicsClinicalContext: "Young adults. Diarrhea, pain, and perianal disease.",
        discriminatingKeyFeature: "SKIP LESIONS and asymmetric involvement. Associated with Terminal Ileitis (90%).",
        associatedFindings: "Creeping fat and fistulae.",
        complicationsSeriousAlternatives: "Toxic megacolon (rare).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Ischaemic Colitis",
        dominantImagingFinding: "Mural thickening and stricture focused at the 'WATERSHED' areas.",
        distributionLocation: "SPLENIC FLEXURE (Griffith point) and Sudek's point (Rectosigmoid).",
        demographicsClinicalContext: "Elderly with AF/vascular disease. History of sudden severe pain.",
        discriminatingKeyFeature: "WATERSHED distribution and history of an acute episode. Thumbprinting (oedema) in the acute phase.",
        associatedFindings: "Vascular calcification.",
        complicationsSeriousAlternatives: "Gangrene.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "C ROSS-SECTIONAL IMAGING SIGNS OF APPENDICITIS",
    itemNumber: "6.30",
    problemCluster: "acute RLQ pain",
    seriousAlternatives: ["Acute Appendicitis", "Epiploic Appendagitis", "Meckel's Diverticulitis", "Mesenteric Adenitis"],
    differentials: [
      {
        diagnosis: "Acute Appendicitis",
        dominantImagingFinding: "Dilated appendix (>6mm diameter) with WALL THICKENING (>3mm) and intense enhancement. Periappendiceal stranding.",
        distributionLocation: "RLQ (centered on the caecal base). Position varies (Retrocaecal 65%).",
        demographicsClinicalContext: "Children and young adults. Migratory pain (Periumbilical to RLQ). Fever and high CRP.",
        discriminatingKeyFeature: "APPENDICOLITH (30%): A dense calcified stone at the base is highly suggestive. Wall thickening and stranding.",
        associatedFindings: "Free fluid and phlegmon.",
        complicationsSeriousAlternatives: "Perforation and abscess formation (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Epiploic Appendagitis",
        dominantImagingFinding: "Small (2-3cm) fat-density nodule with a HYPERDENSE RIM and central dot (vessel).",
        distributionLocation: "Adjacent to the colon (usually Sigmoid or Descending colon).",
        demographicsClinicalContext: "Acute focal pain but patient is CLINICALLY WELL (no fever/leukocytosis).",
        discriminatingKeyFeature: "CLINICALLY WELL and FAT-DENSITY nodule. The appendix itself is normal. Self-limiting (no surgery).",
        associatedFindings: "Focal stranding.",
        complicationsSeriousAlternatives: "None (MIMIC).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mesenteric Adenitis",
        dominantImagingFinding: "Cluster of enlarged mesenteric lymph nodes (>8mm short axis) in the RLQ. Normal appendix.",
        distributionLocation: "RLQ mesentery.",
        demographicsClinicalContext: "Children. Recent URTI (Viral). Mimics appendicitis clinically.",
        discriminatingKeyFeature: "NORMAL APPENDIX: Innumerable enlarged nodes with a perfectly normal appendix is diagnostic. Nodes are often >3 in a cluster.",
        associatedFindings: "Terminal ileal wall thickening.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C YSTIC PANCREATIC LESION",
    itemNumber: "7.30",
    problemCluster: "pancreatic cyst",
    seriousAlternatives: ["Pseudocyst", "Serous Cystadenoma", "Mucinous Cystic Neoplasm", "IPMN"],
    differentials: [
      {
        diagnosis: "Pancreatic Pseudocyst",
        dominantImagingFinding: "Unilocular fluid collection with a thick, well-defined fibrous wall. No solid components.",
        distributionLocation: "Anywhere in or adjacent to the pancreas. Often in the lesser sac.",
        demographicsClinicalContext: "History of ACUTE PANCREATITIS (>4 weeks prior) or chronic pancreatitis (alcohol).",
        discriminatingKeyFeature: "HISTORY: Clear prior episode of pancreatitis. Unlike neoplasms, it lacks internal septations or nodularity. High amylase in fluid.",
        associatedFindings: "Chronic pancreatitis signs: Calcification and ductal dilatation.",
        complicationsSeriousAlternatives: "Infection or haemorrhage.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Serous Cystadenoma (SCA)",
        dominantImagingFinding: "Cluster of multiple tiny cysts (<2cm) giving a 'HONEYCOMB' appearance. CENTRAL STELLATE SCAR.",
        distributionLocation: "Pancreatic head focus.",
        demographicsClinicalContext: "Older females (>60y). Almost always BENIGN.",
        discriminatingKeyFeature: "CENTRAL CALCIFIED SCAR (30%) and honeycomb (microcystic) appearance. No communication with the pancreatic duct.",
        associatedFindings: "Sunburst calcification.",
        complicationsSeriousAlternatives: "Mass effect.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mucinous Cystic Neoplasm (MCN)",
        dominantImagingFinding: "Large, unilocular or multilocular cyst with internal septations. PERIPHERAL CALCIFICATION (Eggshell).",
        distributionLocation: "Pancreatic BODY or TAIL (95%).",
        demographicsClinicalContext: "Middle-aged females (95% - 'Mother tumor'). Malignant potential.",
        discriminatingKeyFeature: "BODY/TAIL location and EGGSHELL calcification of the wall. Does not communicate with the duct.",
        associatedFindings: "Internal nodularity (suggests malignancy).",
        complicationsSeriousAlternatives: "Invasive adenocarcinoma.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Intraductal Papillary Mucinous Neoplasm (IPMN)",
        dominantImagingFinding: "Cystic lesion that COMMUNICATES with the main pancreatic duct or branch ducts.",
        distributionLocation: "Head (Main duct) or Body (Branch duct).",
        demographicsClinicalContext: "Elderly patients. Chronic recurrent pancreatitis.",
        discriminatingKeyFeature: "DUCTAL COMMUNICATION: On MRCP, the cyst is clearly seen connecting to the pancreatic duct. Main duct >10mm is high risk.",
        associatedFindings: "Fish-mouth appearance of the ampulla.",
        complicationsSeriousAlternatives: "Pancreatic cancer.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "R ENAL NEOPLASMS IN AN ADULT",
    itemNumber: "8.22",
    problemCluster: "adult renal mass",
    seriousAlternatives: ["Renal Cell Carcinoma (RCC)", "Transitional Cell Carcinoma (TCC)", "Oncocytoma", "Renal Lymphoma"],
    differentials: [
      {
        diagnosis: "Renal Cell Carcinoma (RCC)",
        dominantImagingFinding: "Solid, intensely enhancing mass. Exophytic (70%). Areas of necrosis or calcification (30%).",
        distributionLocation: "Renal cortex. Characteristically DISPLACES the collecting system.",
        demographicsClinicalContext: "Adults >50y. Smokers. Triad: Pain, haematuria, palpable mass (10%).",
        discriminatingKeyFeature: "EXOPHYTIC growth and INTENSE enhancement. Associated with renal vein thrombus. Most common primary renal tumor.",
        associatedFindings: "Lung, bone, and liver metastases.",
        complicationsSeriousAlternatives: "Vascular invasion (IVC thrombus).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Transitional Cell Carcinoma (TCC)",
        dominantImagingFinding: "Poorly enhancing mass within the collecting system. Centripetal growth.",
        distributionLocation: "Renal PELVIS (10%). Often multiple (Ureters/Bladder).",
        demographicsClinicalContext: "Painless haematuria. Older adults. History of aniline dye or chemical exposure.",
        discriminatingKeyFeature: "CENTRAL (Infiltrative) growth: TCC invades and expands the sinus rather than pushing it like RCC. Preserves kidney shape.",
        associatedFindings: "Hydronephrosis.",
        complicationsSeriousAlternatives: "Multifocal disease.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Oncocytoma",
        dominantImagingFinding: "Well-circumscribed mass with a CENTRAL STELLATE SCAR. Spoke-wheel enhancement on Angio.",
        distributionLocation: "Cortex.",
        demographicsClinicalContext: "Incidental finding. BENIGN mimic of RCC.",
        discriminatingKeyFeature: "CENTRAL SCAR: While suggestive, it is indistinguishable from RCC on imaging alone. Needs pathology.",
        associatedFindings: "Uniform enhancement.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Renal Lymphoma",
        dominantImagingFinding: "Multiple bilateral poorly-enhancing nodules or diffuse renal enlargement.",
        distributionLocation: "Bilateral (usually).",
        demographicsClinicalContext: "Systemic Lymphoma (NHL). B-symptoms.",
        discriminatingKeyFeature: "BILATERALITY and systemic disease. Renal lymphoma is rarely primary; usually secondary to nodal disease.",
        associatedFindings: "Bulky retroperitoneal nodes.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "D IFFERENTIAL DIAGNOSIS OF a SOLITARY INTRACEREBRAL MASS",
    itemNumber: "12.17",
    problemCluster: "solitary brain mass",
    seriousAlternatives: ["Glioblastoma (GBM)", "Solitary Metastasis", "Abscess", "Primary CNS Lymphoma"],
    differentials: [
      {
        diagnosis: "Glioblastoma (GBM)",
        dominantImagingFinding: "Thick, irregular, 'SHAGGY' ring enhancement with a necrotic center. Profound mass effect.",
        distributionLocation: "Supratentorial (Frontal/Temporal). CROSSES the Corpus Callosum (Butterfly Glioma).",
        demographicsClinicalContext: "Adults (50-70y). Rapidly progressive deficit and seizures.",
        discriminatingKeyFeature: "MIDLINE CROSSING and shaggy wall. MRS shows high choline, low NAA, and high lactate.",
        associatedFindings: "Vaseogenic oedema.",
        complicationsSeriousAlternatives: "Rapid recurrence.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Solitary Metastasis",
        dominantImagingFinding: "Well-circumscribed, thin-walled ring-enhancing lesion. DISPROPORTIONATE oedema.",
        distributionLocation: "GREY-WHITE junction (Watershed). Supratentorial common.",
        demographicsClinicalContext: "Older adults. Known primary (Lung, Breast, Melanoma).",
        discriminatingKeyFeature: "GREY-WHITE location and minimal infiltrative growth compared to GBM. Oedema is massive relative to tumor size.",
        associatedFindings: "Haemorrhagic primary (Melanoma/RCC).",
        complicationsSeriousAlternatives: "Herniation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Brain Abscess",
        dominantImagingFinding: "Thin, smooth, uniform ring enhancement. The wall is often THINNER on the ventricular side.",
        distributionLocation: "Variable lobes. Frontal/Temporal common.",
        demographicsClinicalContext: "Acute fever and headache. Septic source (Dental/Sinus).",
        discriminatingKeyFeature: "CENTRAL RESTRICTED DIFFUSION (DWI High): 100% specific. Necrotic GBM/Met rarely restricts centrally.",
        associatedFindings: "Satellite lesions.",
        complicationsSeriousAlternatives: "Ventriculitis (if ruptured).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Primary CNS Lymphoma",
        dominantImagingFinding: "Intensely and UNIFORMLY enhancing solid mass. Characteristically periventricular.",
        distributionLocation: "Periventricular or Basal Ganglia.",
        demographicsClinicalContext: "Immunocompromised (HIV) or elderly. Rapid response to steroids ('Ghost tumor').",
        discriminatingKeyFeature: "UNIFORM ENHANCEMENT and periventricular focus. Lacks necrosis early on. Restricted diffusion (Hypercellular).",
        associatedFindings: "Subependymal spread.",
        complicationsSeriousAlternatives: "Rapid progression.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "INTRAVENTRICULAR MASS IN ADULTS",
    itemNumber: "12.40",
    problemCluster: "intraventricular mass",
    seriousAlternatives: ["Colloid Cyst", "Central Neurocytoma", "Intraventricular Meningioma", "Ependymoma"],
    differentials: [
      {
        diagnosis: "Colloid Cyst",
        dominantImagingFinding: "Small, well-circumscribed, ROUND mass at the Foramen of Monro. Characteristically HIGH ATTENUATION on CT.",
        distributionLocation: "FORAMEN OF MONRO (Anterior 3rd ventricle).",
        demographicsClinicalContext: "Young adults. Sudden onset 'positional' headache and sudden death.",
        discriminatingKeyFeature: "FORAMEN OF MONRO location and HIGH DENSITY on CT. Causes obstructive hydrocephalus of both lateral ventricles.",
        associatedFindings: "Bilateral ventricular dilatation.",
        complicationsSeriousAlternatives: "Sudden death from acute hydrocephalus (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Central Neurocytoma",
        dominantImagingFinding: "Large, 'BUBBLY' heterogeneous mass attached to the Septum Pellucidum.",
        distributionLocation: "Body of the Lateral Ventricle (Frontal horn).",
        demographicsClinicalContext: "Young adults (20-40y).",
        discriminatingKeyFeature: "BUBBLY appearance (due to tiny cysts) and attachment to the SEPTUM PELLUCIDUM. Calcification in 50%.",
        associatedFindings: "Moderate hydrocephalus.",
        complicationsSeriousAlternatives: "Visual loss.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Intraventricular Meningioma",
        dominantImagingFinding: "Well-circumscribed, solid mass with intense uniform enhancement.",
        distributionLocation: "TRIGONE (Atrium) of the Lateral Ventricle (80%).",
        demographicsClinicalContext: "Middle-aged females.",
        discriminatingKeyFeature: "ATRIAL location and uniform enhancement. Most common intraventricular mass in the atrium in adults.",
        associatedFindings: "Punctate calcifications.",
        complicationsSeriousAlternatives: "Mass effect.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Subependymoma",
        dominantImagingFinding: "Lobulated, non-enhancing or minimally enhancing mass. 'Cold' tumor.",
        distributionLocation: "Floor of the 4th ventricle or near Foramen of Monro.",
        demographicsClinicalContext: "Elderly males. Often incidental.",
        discriminatingKeyFeature: "LACK OF ENHANCEMENT and location in the 4th ventricle. Unlike ependymoma, it does not typically enhance.",
        associatedFindings: "Hydrocephalus.",
        complicationsSeriousAlternatives: "Obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "N EONATAL RESPIRATORY DISTRESS",
    itemNumber: "14.33",
    problemCluster: "neonatal lung distress",
    seriousAlternatives: ["Hyaline Membrane Disease (HMD)", "TTN", "Meconium Aspiration", "Congenital Diaphragmatic Hernia"],
    differentials: [
      {
        diagnosis: "Hyaline Membrane Disease (Surfactant Deficiency)",
        dominantImagingFinding: "Diffuse fine GRANULAR opacities (Ground-glass) and AIR BRONCHOGRAMS. LOW lung volumes.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "PREMATURE neonates (<34 weeks). Diabetic mothers.",
        discriminatingKeyFeature: "LOW LUNG VOLUMES and diffuse granular pattern in a PREMIE. Clearing indicates surfactant treatment.",
        associatedFindings: "PDA and Germinal Matrix Haemorrhage.",
        complicationsSeriousAlternatives: "Pneumothorax and BPD.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Transient Tachypnoea of the Newborn (TTN)",
        dominantImagingFinding: "Streaky perihilar densities, fluid in the fissures, and NORMAL to HIGH lung volumes.",
        distributionLocation: "Perihilar and symmetric.",
        demographicsClinicalContext: "TERM neonates following C-section or rapid delivery. 'Wet lung'.",
        discriminatingKeyFeature: "HIGH LUNG VOLUMES and rapid clearing (24-48h). Follows a TERM C-section delivery.",
        associatedFindings: "Small pleural effusions.",
        complicationsSeriousAlternatives: "None (Self-limiting).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Meconium Aspiration Syndrome (MAS)",
        dominantImagingFinding: "COARSE, ROPE-LIKE patchy opacities and areas of hyperinflation (Air trapping).",
        distributionLocation: "Diffuse and patchy.",
        demographicsClinicalContext: "POST-TERM neonates. Stained amniotic fluid. Fetal distress.",
        discriminatingKeyFeature: "ROPE-LIKE opacities and POST-TERM delivery. Lacks the fine granularity of HMD.",
        associatedFindings: "High risk of pneumothorax (Check-valve).",
        complicationsSeriousAlternatives: "Persistent Pulmonary Hypertension of the Newborn (PPHN).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Congenital Diaphragmatic Hernia (Bochdalek)",
        dominantImagingFinding: "Bowel loops (air-filled) seen in the hemithorax. Gasless abdomen.",
        distributionLocation: "Typically LEFT side (80%).",
        demographicsClinicalContext: "Neonates with scaphoid abdomen and immediate severe distress.",
        discriminatingKeyFeature: "BOWEL IN THE CHEST and SCAPHOID ABDOMEN. Mediastinal shift away.",
        associatedFindings: "Pulmonary hypoplasia (Ipsilateral).",
        complicationsSeriousAlternatives: "Life-threatening hypoxia (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "R ENAL MASS IN THE NEWBORN AND YOUNG INFANT",
    itemNumber: "14.53",
    problemCluster: "neonatal renal mass",
    seriousAlternatives: ["Hydronephrosis (Most common)", "MCDK", "Mesoblastic Nephroma", "Wilms (Older)"],
    differentials: [
      {
        diagnosis: "Hydronephrosis",
        dominantImagingFinding: "Cystic dilatation of the renal pelvis and calyces. Identifiable communication between cysts.",
        distributionLocation: "Renal focus. PUJ or VUJ obstruction.",
        demographicsClinicalContext: "Most common neonatal abdominal mass. Prenatal US detection.",
        discriminatingKeyFeature: "COMMUNICATING CYSTS: In hydronephrosis, the calyces connect to the central pelvis. In MCDK, they do not.",
        associatedFindings: "Dilated ureter (if VUJ).",
        complicationsSeriousAlternatives: "Renal failure (if bilateral).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multicystic Dysplastic Kidney (MCDK)",
        dominantImagingFinding: "Innumerable non-communicating cysts of varying sizes. No identifiable normal renal parenchyma.",
        distributionLocation: "Typically unilateral.",
        demographicsClinicalContext: "Second most common neonatal renal mass. Often incidentally found on US.",
        discriminatingKeyFeature: "NON-COMMUNICATING cysts and lack of normal parenchyma. Solitary functional kidney on contralateral side.",
        associatedFindings: "VUR in the contralateral kidney (30%).",
        complicationsSeriousAlternatives: "Hypertension (rare).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Congenital Mesoblastic Nephroma",
        dominantImagingFinding: "Solid, intra-renal mass. Indistinguishable from Wilms by imaging alone.",
        distributionLocation: "Renal parenchyma.",
        demographicsClinicalContext: "NEONATES (<3 months). Most common solid renal neoplasm in this age group.",
        discriminatingKeyFeature: "AGE: Any solid renal mass in a neonate is a Mesoblastic Nephroma. Wilms is rare before 12 months.",
        associatedFindings: "Polyhydramnios in utero.",
        complicationsSeriousAlternatives: "Rupture.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Infantile Polycystic Kidney Disease (ARPKD)",
        dominantImagingFinding: "MASSIVELY ENLARGED, highly echogenic kidneys. Poor differentiation of the corticomedullary junction.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Neonates with Potter sequence or infants with portal hypertension.",
        discriminatingKeyFeature: "BILATERAL ENLARGEMENT and loss of normal architecture. Associated with congenital hepatic fibrosis.",
        associatedFindings: "Portal hypertension and liver fibrosis later.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "N ECK MASSES IN INFANTS AND CHILDREN",
    itemNumber: "14.62",
    problemCluster: "paediatric neck mass",
    seriousAlternatives: ["Thyroglossal Duct Cyst", "Branchial Cleft Cyst", "Cystic Hygroma", "Lymphadenopathy"],
    differentials: [
      {
        diagnosis: "Thyroglossal Duct Cyst",
        dominantImagingFinding: "Well-circumscribed, midline cyst. Embedded within or adjacent to the strap muscles.",
        distributionLocation: "STRICT MIDLINE. Typically infra-hyoid (65%) or at the level of the hyoid.",
        demographicsClinicalContext: "Most common congenital neck mass. Moves upwards with tongue protrusion.",
        discriminatingKeyFeature: "MIDLINE location and relation to the hyoid bone. Moves with swallowing.",
        associatedFindings: "Absence of normal thyroid in the neck (Ectopic thyroid) in 1-2%.",
        complicationsSeriousAlternatives: "Infection and abscess.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Branchial Cleft Cyst (Second)",
        dominantImagingFinding: "Well-defined cyst located at the angle of the mandible.",
        distributionLocation: "LATERAL neck. Anterior to the SCM muscle and lateral to the carotid space.",
        demographicsClinicalContext: "Young adults or older children. Often following a URTI.",
        discriminatingKeyFeature: "LATERAL location at the carotid bifurcation ('Beak sign' between vessels).",
        associatedFindings: "Can be infected (thick wall).",
        complicationsSeriousAlternatives: "Fistula formation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Cystic Hygroma (Lymphangioma)",
        dominantImagingFinding: "Multilocular, thin-walled cystic mass. ENCASES and surrounds normal structures without displacing them.",
        distributionLocation: "Posterior triangle of the neck (80%). Can be massive.",
        demographicsClinicalContext: "Infants. Associated with Turner and Down syndromes.",
        discriminatingKeyFeature: "ENCASEMENT: Unlike other cysts, hygromas 'creep' between vessels and muscles. Fluid-fluid levels suggest hemorrhage.",
        associatedFindings: "Mediastinal extension.",
        complicationsSeriousAlternatives: "Airway obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Fibromatosis Colli",
        dominantImagingFinding: "Focal, spindle-shaped enlargement of the Sternocleidomastoid (SCM) muscle.",
        distributionLocation: "Within the SCM muscle belly. Unilateral.",
        demographicsClinicalContext: "Neonates (2-4 weeks). Torticollis. History of traumatic birth.",
        discriminatingKeyFeature: "INTRA-MUSCULAR location. The mass is the muscle itself. Self-limiting; no surgery needed.",
        associatedFindings: "Normal thyroid and nodes.",
        complicationsSeriousAlternatives: "Permanent torticollis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "UTERINE MYOMETRIUM",
    itemNumber: "13.4",
    problemCluster: "myometrial mass",
    seriousAlternatives: ["Leiomyoma (Fibroid)", "Adenomyosis", "Uterine Sarcoma"],
    differentials: [
      {
        diagnosis: "Leiomyoma (Fibroid)",
        dominantImagingFinding: "Well-circumscribed solid mass. CHARACTERISTICALLY LOW T2 signal. Popcorn calcification on CT.",
        distributionLocation: "Intramural, subserosal, or submucosal. Displaces the myometrium.",
        demographicsClinicalContext: "Premenopausal women. Menorrhagia, pelvic pain, and infertility.",
        discriminatingKeyFeature: "LOW T2 SIGNAL and well-defined CAPSULE. Unlike adenomyosis, it pushes rather than infiltrates.",
        associatedFindings: "Cystic or hyaline degeneration. Calcification.",
        complicationsSeriousAlternatives: "Red degeneration (in pregnancy).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Adenomyosis",
        dominantImagingFinding: "Diffuse globular enlargement of the uterus. Thinned and asymmetric junctional zone (>12mm).",
        distributionLocation: "Myometrium focus (characteristically the posterior wall).",
        demographicsClinicalContext: "Multiparous women. Chronic pelvic pain and dysmenorrhoea.",
        discriminatingKeyFeature: "JUNCTIONAL ZONE THICKENING (>12mm) and small high T2 'cystic' spaces within the muscle. No capsule.",
        associatedFindings: "Tender, globular uterus on palpation.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Uterine Leiomyosarcoma",
        dominantImagingFinding: "Aggressive, heterogeneous mass with irregular borders. Central necrosis and high T2 signal.",
        distributionLocation: "Uterine body.",
        demographicsClinicalContext: "Post-menopausal women presenting with a 'rapidly growing fibroid'.",
        discriminatingKeyFeature: "RAPID GROWTH in a post-menopausal patient. Restricted diffusion (DWI) and infiltrative margins.",
        associatedFindings: "Metastatic nodes.",
        complicationsSeriousAlternatives: "Early metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C ARDIAC CALCIFICATION",
    itemNumber: "5.6",
    problemCluster: "heart calcification",
    seriousAlternatives: ["Coronary Calcification", "Valvular Calcification", "Pericardial Calcification", "Myocardial Calcification"],
    differentials: [
      {
        diagnosis: "Coronary Artery Calcification",
        dominantImagingFinding: "Linear or punctate calcification following the course of the coronary vessels (LAD, RCA, LCx).",
        distributionLocation: "Epicardial surface. LAD is the most common site.",
        demographicsClinicalContext: "Adults with cardiovascular risk factors. Marker of atherosclerosis.",
        discriminatingKeyFeature: "LINEAR/TRACK-LIKE pattern along the coronary grooves. Best seen on non-contrast CT (Agatston score).",
        associatedFindings: "Aortic arch calcification.",
        complicationsSeriousAlternatives: "Myocardial infarction.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pericardial Calcification",
        dominantImagingFinding: "Sheet-like or 'EGG-SHELL' calcification outlining the cardiac silhouette.",
        distributionLocation: "Pericardium. Typically involves the RIGHT side of the heart (RA/RV) and AV groove.",
        demographicsClinicalContext: "History of prior TB, viral pericarditis, or surgery. Signs of constriction (Raised JVP).",
        discriminatingKeyFeature: "PERIPHERAL distribution and associated signs of CONSTRICTIVE PERICARDITIS (tubular RV, enlarged RA).",
        associatedFindings: "Ascites and hepatomegaly.",
        complicationsSeriousAlternatives: "Constrictive pericarditis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Valvular Calcification (Aortic/Mitral)",
        dominantImagingFinding: "Dense, nodular calcification at the site of the heart valves.",
        distributionLocation: "Intra-cardiac. Below the carina. Aortic (Superior/Posterior) or Mitral (Inferior/Posterior).",
        demographicsClinicalContext: "Elderly (degenerative) or young (rheumatic/bicuspid).",
        discriminatingKeyFeature: "NODULAR pattern. Location: Aortic valve is above a line from the carina to the apex; Mitral is below.",
        associatedFindings: "Specific chamber enlargement (LA or LV).",
        complicationsSeriousAlternatives: "Valvular stenosis/regurgitation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Myocardial Calcification",
        dominantImagingFinding: "Calcification WITHIN the myocardial wall. Often linear or curvilinear.",
        distributionLocation: "Left ventricle apex (post-MI) or Left Atrium wall (post-rheumatic).",
        demographicsClinicalContext: "History of prior large MI (aneurysm) or severe Rheumatic Fever.",
        discriminatingKeyFeature: "WALL location. If in the LV apex, it represents a calcified aneurysm. If in the LA wall, it's the 'Porcelain Atrium'.",
        associatedFindings: "Regional wall motion abnormality.",
        complicationsSeriousAlternatives: "Ventricular rupture or systemic embolism (from mural thrombus).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "MADELUNG DEFORMITY",
    itemNumber: "1.37",
    problemCluster: "wrist deformity",
    seriousAlternatives: ["Turner Syndrome", "Dyschondrosteosis (Léri-Weill)", "Post-traumatic"],
    differentials: [
      {
        diagnosis: "Léri-Weill Dyschondrosteosis",
        dominantImagingFinding: "Bilateral Madelung deformity: Shortened radius with volar/ulnar tilt of the articular surface. Dorsal subluxation of the ulna.",
        distributionLocation: "Bilateral and symmetric wrists.",
        demographicsClinicalContext: "AD inheritance. Short stature (mesomelic dwarfism).",
        discriminatingKeyFeature: "BILATERALITY and SHORT STATURE. Most common cause of Madelung deformity. V-shaped proximal carpal row.",
        associatedFindings: "V-shaped proximal carpal row.",
        complicationsSeriousAlternatives: "Chronic wrist pain.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Turner Syndrome (45,X)",
        dominantImagingFinding: "Madelung-like deformity with SHORT 4th METACARPALS. Positive metacarpal sign.",
        distributionLocation: "Bilateral. Wrists and hands.",
        demographicsClinicalContext: "Females. Webbed neck and primary amenorrhoea.",
        discriminatingKeyFeature: "SHORT 4th METACARPAL and Turner clinical features. Osteoporosis and horseshoe kidney.",
        associatedFindings: "Horseshoe kidney and coarctation of the aorta.",
        complicationsSeriousAlternatives: "Aortic dissection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Post-Traumatic (Physeal Injury)",
        dominantImagingFinding: "UNILATERAL Madelung deformity. Bony bar crossing the physis.",
        distributionLocation: "Unilateral (affected wrist).",
        demographicsClinicalContext: "History of distal radial fracture (Salter-Harris) in childhood.",
        discriminatingKeyFeature: "UNILATERALITY and history of trauma. Lacks the systemic short stature of Léri-Weill.",
        associatedFindings: "Evidence of old fracture.",
        complicationsSeriousAlternatives: "Growth arrest.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 8 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_8_DATA) {
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
  console.log("Batch 8 Complete!");
}

main().catch(console.error);