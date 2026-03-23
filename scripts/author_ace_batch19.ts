import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_19_DATA = [
  {
    pattern: "GENERALIZED PERIOSTEAL REACTION IN AN ADULT",
    itemNumber: "1.23",
    problemCluster: "diffuse adult periostitis",
    seriousAlternatives: ["HPOA", "Thyroid Acropachy", "Venous Stasis", "Vascular Insufficiency"],
    differentials: [
      {
        diagnosis: "HPOA (Hypertrophic Pulmonary Osteoarthropathy)",
        dominantImagingFinding: "Symmetric, linear, single or multilayered periosteal reaction along the diaphyses of long bones.",
        distributionLocation: "Bilateral and symmetric. Tibia, Fibula, Radius, and Ulna focus.",
        demographicsClinicalContext: "Adults. Digital clubbing (95%). Secondary to LUNG CANCER (90%) or pleural mesothelioma.",
        discriminatingKeyFeature: "SYMMETRY and LUNG MASS: 90% of cases are secondary to intrathoracic malignancy. Painful joints.",
        associatedFindings: "Hilar adenopathy and digital clubbing.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Thyroid Acropachy",
        dominantImagingFinding: "Symmetric, 'FEATHERY' or spicuated periosteal reaction. Characteristically involves the hands and feet.",
        distributionLocation: "Metacarpal and phalangeal shafts focus. Strictly symmetric.",
        demographicsClinicalContext: "History of Graves' disease treated with RAI or surgery. Exophthalmos and pretibial myxoedema.",
        discriminatingKeyFeature: "FEATHERY PERIOSTITIS: The spicuated appearance in the hands is highly specific. Patient usually post-thyroidectomy.",
        associatedFindings: "Soft tissue swelling.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Venous Stasis (Chronic)",
        dominantImagingFinding: "Thick, mature, undulating periosteal reaction. Limited to the lower limbs.",
        distributionLocation: "Lower limbs (Tibia/Fibula) only. Unilateral or bilateral.",
        demographicsClinicalContext: "Elderly with varicose veins, chronic oedema, or prior DVT.",
        discriminatingKeyFeature: "LOCALIZATION: Limited to the calves. Associated with phleboliths and significant soft tissue swelling.",
        associatedFindings: "Subcutaneous ossification.",
        complicationsSeriousAlternatives: "Venous ulcers.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "GENERALIZED PERIOSTEAL REACTION IN a CHILD",
    itemNumber: "1.24",
    problemCluster: "diffuse paediatric periostitis",
    seriousAlternatives: ["Caffey Disease", "Physiological (Normal)", "Leukaemia", "Scurvy", "NAI"],
    differentials: [
      {
        diagnosis: "Physiological Periostitis of the Newborn",
        dominantImagingFinding: "Fine, single-layered periosteal reaction along the diaphyses. Normal underlying bone.",
        distributionLocation: "Bilateral and symmetric. Femur and Tibia common.",
        demographicsClinicalContext: "Infants aged 1-6 months. Clinically well.",
        discriminatingKeyFeature: "CLINICALLY WELL: Unlike Caffey or Leukaemia, the infant is asymptomatic and bone density is normal. Resolves by 6 months.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Caffey Disease (Infantile Cortical Hyperostosis)",
        dominantImagingFinding: "Massive, exuberant subperiosteal bone formation. MANDIBULAR involvement (95%).",
        distributionLocation: "Mandible, Clavicles, and Long bones (Ulna).",
        demographicsClinicalContext: "Infants <6 months. Fever, irritability, and soft tissue swelling.",
        discriminatingKeyFeature: "MANDIBULAR involvement: Extreme cortical thickening of the mandible is pathognomonic. Child is systemically unwell.",
        associatedFindings: "High ESR and CRP.",
        complicationsSeriousAlternatives: "Bone deformity.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Leukaemia (Paediatric)",
        dominantImagingFinding: "Symmetric periosteal reaction associated with METAPHYSEAL LUCENT BANDS.",
        distributionLocation: "Generalized. Symmetrical.",
        demographicsClinicalContext: "Children (2-5y). Bone pain, pallor, and bruising.",
        discriminatingKeyFeature: "LUCENT BANDS: Presence of transverse metaphyseal bands and diffuse osteopenia. Lacks the mandibular focus of Caffey.",
        associatedFindings: "Hepatosplenomegaly.",
        complicationsSeriousAlternatives: "Marrow failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Scurvy",
        dominantImagingFinding: "Subperiosteal haemorrhage causing massive, thick periosteal new bone during the HEALING phase.",
        distributionLocation: "Knee focus.",
        demographicsClinicalContext: "Malnourished infants. Painful, pseudo-paralysis.",
        discriminatingKeyFeature: "WIMBERGER'S RING and FRANKEL LINE: Associated with classic ricket-like signs but with normal physis width.",
        associatedFindings: "Pelkan spurs.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "C ROSS-SECTIONAL IMAGING SIGNS OF DIVERTICULITIS",
    itemNumber: "6.31",
    problemCluster: "acute colonic pain",
    seriousAlternatives: ["Acute Diverticulitis", "Colonic Adenocarcinoma (Mimic)", "Ischaemic Colitis"],
    differentials: [
      {
        diagnosis: "Acute Diverticulitis",
        dominantImagingFinding: "Segmental wall thickening (>3mm) with PERICOLIC FAT STRANDING and presence of diverticula.",
        distributionLocation: "Sigmoid colon (95%) focus.",
        demographicsClinicalContext: "Elderly patients with LIF pain and fever. High CRP.",
        discriminatingKeyFeature: "DIVERTICULA and PERICOLIC STRANDING: Presence of focal gas bubbles or small abscesses. Lacks the abrupt 'apple-core' transition of cancer.",
        associatedFindings: "Abscess or free gas (perforation).",
        complicationsSeriousAlternatives: "Faecal peritonitis (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Colonic Adenocarcinoma (Perforated)",
        dominantImagingFinding: "Irregular, asymmetric wall thickening with abrupt transition. SHOULDERED MARGINS.",
        distributionLocation: "Sigmoid common.",
        demographicsClinicalContext: "Altered bowel habit and weight loss. Chronic bleeding.",
        discriminatingKeyFeature: "SHOULDERED MARGINS and regional lymphadenopathy. Diverticulitis typically lacks the bulky nodes of cancer.",
        associatedFindings: "Liver metastases.",
        complicationsSeriousAlternatives: "Obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Ischaemic Colitis",
        dominantImagingFinding: "Diffuse mural thickening focused at the WATERSHED regions. Preserved pericolic fat early on.",
        distributionLocation: "Splenic flexure (Griffith point).",
        demographicsClinicalContext: "Elderly with sudden onset pain out of proportion. Vascular risk factors.",
        discriminatingKeyFeature: "WATERSHED distribution and normal pericolic fat (unlike the intense stranding of diverticulitis).",
        associatedFindings: "Vascular calcification.",
        complicationsSeriousAlternatives: "Gangrene.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "MASS IN THE REGION OF THE FORAMEN MAGNUM",
    itemNumber: "12.42",
    problemCluster: "foramen magnum mass",
    seriousAlternatives: ["Meningioma", "Schwannoma", "Chordoma", "Chiari Malformation"],
    differentials: [
      {
        diagnosis: "Meningioma (Foramen Magnum)",
        dominantImagingFinding: "Broad-based dural mass. Intense uniform enhancement. DURAL TAIL (60%).",
        distributionLocation: "Anterolateral aspect of the foramen magnum common.",
        demographicsClinicalContext: "Middle-aged females. Progressive lower cranial nerve signs.",
        discriminatingKeyFeature: "DURAL TAIL and normal-sized vertebral arteries. Displaces the medulla. Most common solid mass in this region.",
        associatedFindings: "Hyperostosis of the occipital bone.",
        complicationsSeriousAlternatives: "Hydrocephalus.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Nerve Sheath Tumor (Schwannoma)",
        dominantImagingFinding: "Well-circumscribed, ovoid mass. Characteristically widens the adjacent bone (Remodeling).",
        distributionLocation: "C1 or C2 nerve roots. Lateral.",
        demographicsClinicalContext: "Adults. Progressive weakness.",
        discriminatingKeyFeature: "BONY REMODELING: Unlike meningioma, schwannomas cause smooth pressure erosion of the adjacent bone. Eccentric.",
        associatedFindings: "Target sign on T2 (central high signal).",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Chordoma (Clival)",
        dominantImagingFinding: "Aggressive, destructive mass arising from the clivus. HIGH T2 signal.",
        distributionLocation: "Midline. Clivus focus.",
        demographicsClinicalContext: "Adults (30-50y). Headache and diplopia.",
        discriminatingKeyFeature: "MIDLINE and CLIVAL DESTRUCTION: Frank bone destruction is the hallmark. Intensely bright on T2 MRI.",
        associatedFindings: "Sequestra of bone within the mass.",
        complicationsSeriousAlternatives: "Brainstem invasion.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "NIPPLE DISCHARGE",
    itemNumber: "10.8",
    problemCluster: "breast discharge",
    seriousAlternatives: ["Duct Papilloma (Most common)", "Duct Ectasia", "Ductal Carcinoma in Situ (DCIS)"],
    differentials: [
      {
        diagnosis: "Duct Papilloma",
        dominantImagingFinding: "Small, well-circumscribed mass within a dilated duct. FOCAL FILLING DEFECT on galactography.",
        distributionLocation: "Subareolar focus.",
        demographicsClinicalContext: "Premenopausal women. SEROSANGUINOUS (bloody) discharge from a single duct.",
        discriminatingKeyFeature: "SINGLE DUCT discharge and bloody appearance. Galactography shows a 'filling defect' with smooth margins.",
        associatedFindings: "Localized ductal dilatation.",
        complicationsSeriousAlternatives: "Malignant transformation (rare).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Duct Ectasia",
        dominantImagingFinding: "Dilated retroareolar ducts. Characteristically bilateral. Subareolar CALCIFICATIONS (Rod-like).",
        distributionLocation: "Bilateral and symmetric. Subareolar.",
        demographicsClinicalContext: "Perimenopausal/Post-menopausal women. Thick, greenish or multicolored discharge.",
        discriminatingKeyFeature: "BILATERALITY and THICK discharge. Galactography shows smooth, tubular dilatation of multiple ducts.",
        associatedFindings: "Rod-like (secretory) calcifications.",
        complicationsSeriousAlternatives: "Mastitis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "DCIS / Paget’s Disease of the Breast",
        dominantImagingFinding: "Pleomorphic microcalcifications following a ductal distribution. No mass in DCIS early.",
        distributionLocation: "Segmental or linear ductal distribution.",
        demographicsClinicalContext: "Post-menopausal common. Single duct discharge.",
        discriminatingKeyFeature: "PLEOMORPHIC CALCIFICATIONS and eccentric discharge. If the nipple is eczematous, Paget's must be suspected.",
        associatedFindings: "Architechtural distortion.",
        complicationsSeriousAlternatives: "Invasive carcinoma.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PELVIC MASS IN a FEMALE",
    itemNumber: "13.11",
    problemCluster: "female pelvic opacity",
    seriousAlternatives: ["Leiomyoma (Uterine)", "Ovarian Neoplasm", "Endometrioma", "Dermoid"],
    differentials: [
      {
        diagnosis: "Uterine Leiomyoma (Fibroid)",
        dominantImagingFinding: "Solid mass arising from the uterus. CHARACTERISTICALLY LOW T2 signal. Popcorn calcification.",
        distributionLocation: "Midline (Uterus). Can be subserosal and mimic an adnexal mass.",
        demographicsClinicalContext: "Premenopausal women. Menorrhagia and pressure.",
        discriminatingKeyFeature: "CONTINUITY WITH MYOMETRIUM: The 'bridging vessel sign' or direct connection to the uterus. Low T2 signal.",
        associatedFindings: "Uterine enlargement.",
        complicationsSeriousAlternatives: "Torsion (pedunculated).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ovarian Cystadenocarcinoma",
        dominantImagingFinding: "Large complex mass with solid components and thick septations.",
        distributionLocation: "Lateral (Adnexa). Bilateral in 50%.",
        demographicsClinicalContext: "Post-menopausal women. Elevated CA-125.",
        discriminatingKeyFeature: "SOLID COMPONENTS and ASCITES: Malignant ovarian masses characteristically have large solid areas and peritoneal fluid.",
        associatedFindings: "Omental caking.",
        complicationsSeriousAlternatives: "Peritoneal spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mature Cystic Teratoma (Dermoid)",
        dominantImagingFinding: "Unilocular or multilocular mass containing MACROSCOPIC FAT.",
        distributionLocation: "Adnexa.",
        demographicsClinicalContext: "Young females (20-30y). Most common benign ovarian mass.",
        discriminatingKeyFeature: "MACROSCOPIC FAT (-100 HU): Fat-fluid level is pathognomonic. Presence of teeth/bone.",
        associatedFindings: "Rokitansky nodule.",
        complicationsSeriousAlternatives: "Torsion.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S ALIVARY GLAND MASS",
    itemNumber: "11.23",
    problemCluster: "salivary opacity",
    seriousAlternatives: ["Pleomorphic Adenoma", "Warthin Tumor", "Mucoepidermoid Carcinoma", "Sjögren's"],
    differentials: [
      {
        diagnosis: "Pleomorphic Adenoma (Benign Mixed Tumor)",
        dominantImagingFinding: "Well-circumscribed, lobulated mass. CHARACTERISTICALLY BRIGHT on T2 MRI.",
        distributionLocation: "PAROTID gland (80%), typically the superficial lobe.",
        demographicsClinicalContext: "Most common salivary tumor. Slow-growing painless lump.",
        discriminatingKeyFeature: "T2 BRIGHT signal and well-defined margin. 80% are in the parotid. Slow growth (years).",
        associatedFindings: "Lobulated margins.",
        complicationsSeriousAlternatives: "Malignant transformation (Carcinoma ex-pleomorphic adenoma) if longstanding.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Warthin Tumor (Cystadenolymphoma)",
        dominantImagingFinding: "Well-circumscribed cystic/solid mass. Characteristically shows uptake on Tc-99m PERTECHNETATE scan.",
        distributionLocation: "Parotid TAIL focus. Bilateral in 10-15%.",
        demographicsClinicalContext: "Older MALES who smoke (>90% smokers).",
        discriminatingKeyFeature: "SMOKING history and HOT on pertechnetate scan. Bilateral or multifocal lesions are highly suggestive.",
        associatedFindings: "Cystic components.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mucoepidermoid Carcinoma",
        dominantImagingFinding: "Solid mass with ill-defined margins. Low T2 signal (if high-grade).",
        distributionLocation: "Parotid or Minor salivary glands.",
        demographicsClinicalContext: "Most common malignant salivary tumor in children and adults.",
        discriminatingKeyFeature: "INFILTRATIVE: Poorly defined margins and rapid growth. Pain or facial nerve palsy (sign of malignancy).",
        associatedFindings: "Nodal metastases.",
        complicationsSeriousAlternatives: "Facial nerve paralysis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 19 (PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_19_DATA) {
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
  console.log("Batch 19 Part 1 Complete!");
}

main().catch(console.error);