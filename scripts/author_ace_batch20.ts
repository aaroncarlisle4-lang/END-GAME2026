import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_20_DATA = [
  {
    pattern: "P OLYARTHRITIS",
    itemNumber: "3.2",
    problemCluster: "multiple joint disease",
    seriousAlternatives: ["Rheumatoid Arthritis", "Osteoarthritis", "Psoriatic Arthritis", "CPPD"],
    differentials: [
      {
        diagnosis: "Rheumatoid Arthritis (RA)",
        dominantImagingFinding: "Symmetric marginal EROSIONS and profound periarticular OSTEOPOROSIS. Symmetric joint space narrowing.",
        distributionLocation: "MCP, PIP, and Carpal joints. Bilateral and STRICTLY SYMMETRIC. Spares DIPs.",
        demographicsClinicalContext: "Middle-aged females. Positive RF/Anti-CCP. Morning stiffness.",
        discriminatingKeyFeature: "SYMMETRY and OSTEOPOROSIS. Absence of bone proliferation (unlike Psoriasis) and sparing of the DIP joints.",
        associatedFindings: "Ulnar deviation and carpal crowding.",
        complicationsSeriousAlternatives: "Atlanto-axial subluxation (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteoarthritis (Nodal)",
        dominantImagingFinding: "Joint space narrowing, SUBCHONDRAL SCLEROSIS, and OSTEOPHYTES. Central 'Gull-wing' erosions.",
        distributionLocation: "DIP and PIP joints. 1st CMC joint. Weight-bearing joints (Hip/Knee).",
        demographicsClinicalContext: "Elderly. Mechanical pain. Heberden (DIP) and Bouchard (PIP) nodes.",
        discriminatingKeyFeature: "OSTEOPHYTES and SCLEROSIS. Unlike RA, the bone density is preserved and DIPs are characteristically involved.",
        associatedFindings: "Subchondral cysts.",
        complicationsSeriousAlternatives: "Joint instability.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Psoriatic Arthritis (Polyarticular)",
        dominantImagingFinding: "Marginal erosions with BONE PROLIFERATION (fluffy periostitis). PENCIL-IN-CUP deformity.",
        distributionLocation: "DIP joints common. Asymmetric distribution across hands.",
        demographicsClinicalContext: "Skin psoriasis. Dactylitis (Sausage digit).",
        discriminatingKeyFeature: "BONE PROLIFERATION and DIP involvement. Absence of periarticular osteoporosis. 'Mouse-ear' erosions.",
        associatedFindings: "Sacroiliitis and syndesmophytes.",
        complicationsSeriousAlternatives: "Arthritis mutilans.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P LEURAL NODULES",
    itemNumber: "4.36",
    problemCluster: "pleural mass",
    seriousAlternatives: ["Pleural Metastases", "Mesothelioma", "Splenosis (Mimic)", "Focal Pleural Plaque"],
    differentials: [
      {
        diagnosis: "Pleural Metastases",
        dominantImagingFinding: "Multiple discrete nodules or masses along the costal or diaphragmatic pleura. Large effusion.",
        distributionLocation: "Bilateral or unilateral. Dependent locations.",
        demographicsClinicalContext: "Known primary (Lung, Breast, GI).",
        discriminatingKeyFeature: "MULTIPLICITY and primary CA history. Spares the mediastinal pleura compared to Mesothelioma.",
        associatedFindings: "Malignant pleural effusion.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Mesothelioma",
        dominantImagingFinding: "Nodular, circumferential pleural RIND (>1cm). Involvement of the mediastinal pleura.",
        distributionLocation: "Entire hemithorax space. Ipsilateral volume loss.",
        demographicsClinicalContext: "Occupational ASBESTOS exposure. Chest wall pain.",
        discriminatingKeyFeature: "MEDIASTINAL PLEURA involvement: 100% specific for mesothelioma vs benign disease. Circumferential thickening.",
        associatedFindings: "Pleural plaques (asbestos history).",
        complicationsSeriousAlternatives: "Direct invasion of the heart or chest wall.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Thoracic Splenosis",
        dominantImagingFinding: "Multiple pleural nodules in a patient with normal lung volumes. NO effusion.",
        distributionLocation: "Left hemithorax focus.",
        demographicsClinicalContext: "History of prior SPLENECTOMY and DIAPHRAGMATIC RUPTURE (Trauma).",
        discriminatingKeyFeature: "HISTORY: Prior splenic trauma. Nodules show uptake on heat-damaged RBC scan. Lacks effusion or growth.",
        associatedFindings: "Absent spleen in the abdomen.",
        complicationsSeriousAlternatives: "None (MIMIC).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "OESOPHAGEAL FILLING DEFECTS",
    itemNumber: "6.6",
    problemCluster: "oesophageal opacity",
    seriousAlternatives: ["Oesophageal Carcinoma", "Varices", "Leiomyoma", "Impacted Foreign Body"],
    differentials: [
      {
        diagnosis: "Oesophageal Carcinoma",
        dominantImagingFinding: "Irregular filling defect with MUCOSAL DESTRUCTION and shouldered margins ('Apple-core').",
        distributionLocation: "Mid or Distal oesophagus common.",
        demographicsClinicalContext: "Adult smokers/drinkers. Progressive dysphagia and weight loss.",
        discriminatingKeyFeature: "MUCOSAL DESTRUCTION: The mass is fixed and destroys the normal folds. Malignant until proven otherwise.",
        associatedFindings: "Mediastinal adenopathy.",
        complicationsSeriousAlternatives: "Perforation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Oesophageal Varices",
        dominantImagingFinding: "Multiple, tortuous, 'serpentine' filling defects. 'Worm-like' appearance.",
        distributionLocation: "Distal third of the oesophagus.",
        demographicsClinicalContext: "Chronic liver disease/Cirrhosis. Portal hypertension.",
        discriminatingKeyFeature: "CHANGING SHAPE: Filling defects change with respiration or Valsalva. Smooth overlying mucosa (unlike cancer).",
        associatedFindings: "Splenomegaly and ascites.",
        complicationsSeriousAlternatives: "Massive upper GI bleed (EMERGENCY).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Leiomyoma (Oesophageal)",
        dominantImagingFinding: "Smooth, submucosal filling defect with OBTUSE angles to the wall.",
        distributionLocation: "Any level.",
        demographicsClinicalContext: "Adults. Often asymptomatic.",
        discriminatingKeyFeature: "SUBMUCOSAL: Intact overlying mucosa and obtuse angles. Unlike cancer, it does not destroy the folds.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Obstruction (if large).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "R ENAL CORTICAL CALCIFICATION",
    itemNumber: "8.15",
    problemCluster: "renal shell calcification",
    seriousAlternatives: ["Acute Cortical Necrosis", "Chronic Glomerulonephritis", "Primary Oxalosis", "TRAM-TRACK Calcification"],
    differentials: [
      {
        diagnosis: "Acute Cortical Necrosis",
        dominantImagingFinding: "Fine, linear 'TRAM-TRACK' calcification outlining the renal cortex. Spares the medulla.",
        distributionLocation: "Peripheral cortex. Bilateral.",
        demographicsClinicalContext: "Follows severe systemic insult (Abruptio placentae, Septic shock, Poisoning). Acute renal failure.",
        discriminatingKeyFeature: "TRAM-TRACK pattern and history of ACUTE CATASTROPHE. Pathognomonic for cortical necrosis.",
        associatedFindings: "Small, shrunken kidneys later.",
        complicationsSeriousAlternatives: "End-stage renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Primary Oxalosis",
        dominantImagingFinding: "Extremely dense, uniform calcification of BOTH the cortex and medulla.",
        distributionLocation: "Global renal focus.",
        demographicsClinicalContext: "Children. AR inheritance.",
        discriminatingKeyFeature: "CORTICAL AND MEDULLARY: Unlike cortical necrosis (which spares medulla), oxalosis involves the whole kidney uniformly.",
        associatedFindings: "Extra-renal calcifications (Heart/Vessels).",
        complicationsSeriousAlternatives: "Early childhood renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Chronic Glomerulonephritis",
        dominantImagingFinding: "Faint, punctate or granular cortical calcification. SMALL shrunken kidneys.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Long-standing history of renal disease.",
        discriminatingKeyFeature: "GRANULARity and small size. Lacks the crisp linear pattern of acute cortical necrosis.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "MASS IN THE CEREBELLAR HEMISPHERE",
    itemNumber: "12.43",
    problemCluster: "cerebellar mass",
    seriousAlternatives: ["Haemangioblastoma", "Metastasis", "Pilocytic Astrocytoma", "Medulloblastoma (Lateral)"],
    differentials: [
      {
        diagnosis: "Haemangioblastoma",
        dominantImagingFinding: "Large CYST with an intensely ENHANCING MURAL NODULE. The nodule typically abuts the pial surface.",
        distributionLocation: "Cerebellar hemisphere (80%).",
        demographicsClinicalContext: "Adults (30-50y). 25% associated with VON HIPPEL-LINDAU (VHL) syndrome.",
        discriminatingKeyFeature: "MURAL NODULE and CYST: MRI shows a nodule that is bright on T2 and enhances intensely. Associated with VHL (Renal AMLs/Cysts).",
        associatedFindings: "Polycythaemia (tumor secretes EPO).",
        complicationsSeriousAlternatives: "Hydrocephalus.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Cerebellar Metastasis",
        dominantImagingFinding: "Solid or cystic enhancing mass. DISPROPORTIONATE vaseogenic oedema.",
        distributionLocation: "Cerebellar hemisphere focus.",
        demographicsClinicalContext: "Older adults. Known primary (Lung, Breast, Renal).",
        discriminatingKeyFeature: "OEDEMA: The amount of swelling is often much larger than the tumor itself. Often multiple disparate lesions.",
        associatedFindings: "Primary cancer signs.",
        complicationsSeriousAlternatives: "Tonsillar herniation (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pilocytic Astrocytoma",
        dominantImagingFinding: "Large cyst with an enhancing mural nodule. Indistinguishable from haemangioblastoma by imaging.",
        distributionLocation: "Cerebellum.",
        demographicsClinicalContext: "CHILDREN and young adults (<20y).",
        discriminatingKeyFeature: "AGE: In a child, it is a Pilocytic Astrocytoma. In an adult, it is a Haemangioblastoma. 100% specific differentiator.",
        associatedFindings: "NF1 association.",
        complicationsSeriousAlternatives: "Hydrocephalus.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "AXILLARY LYMPHADENOPATHY",
    itemNumber: "10.9",
    problemCluster: "axillary nodes",
    seriousAlternatives: ["Breast Metastasis (Most common)", "Lymphoma", "Infection (Cat Scratch)", "Silicone Adenopathy"],
    differentials: [
      {
        diagnosis: "Breast Cancer Metastasis",
        dominantImagingFinding: "Enlarged, ROUND, dense node with LOSS of the normal fatty hilum.",
        distributionLocation: "Ipsilateral axilla.",
        demographicsClinicalContext: "Adult female. Often associated with a breast mass (IDC).",
        discriminatingKeyFeature: "HILAR OBLITERATION: Loss of the central echogenic/fatty hilum is highly suspicious for malignancy.",
        associatedFindings: "Breast mass or architectural distortion.",
        complicationsSeriousAlternatives: "Lymphoedema of the arm.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Silicone Adenopathy",
        dominantImagingFinding: "Intensely hyperdense ('SNOWSTORM' on US) nodes. High T2 signal on MRI.",
        distributionLocation: "Ipsilateral axilla.",
        demographicsClinicalContext: "Prior history of silicone breast implants (rupture or bleed).",
        discriminatingKeyFeature: "SNOWSTORM appearance on US: Extravasated silicone within the node causes intense acoustic shadowing. Clinical history of implants.",
        associatedFindings: "Intracapsular or extracapsular implant rupture.",
        complicationsSeriousAlternatives: "None (Inflammatory).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Cat Scratch Disease (Bartonella)",
        dominantImagingFinding: "Large, tender, reactive nodes with intense PERINODAL OEDEMA.",
        distributionLocation: "Unilateral axilla.",
        demographicsClinicalContext: "Children/Adults. History of cat scratch. Fever and malaise.",
        discriminatingKeyFeature: "PERINODAL OEDEMA: Significant inflammatory swelling around the nodes. Response to antibiotics.",
        associatedFindings: "Skin papule at the scratch site.",
        complicationsSeriousAlternatives: "Abscess.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PELVIC CALCIFICATION IN a FEMALE",
    itemNumber: "13.12",
    problemCluster: "female pelvic density",
    seriousAlternatives: ["Phleboliths (Normal)", "Leiomyoma (Fibroid)", "Dermoid (Teeth)", "Ovarian Serous CA"],
    differentials: [
      {
        diagnosis: "Pelvic Phleboliths",
        dominantImagingFinding: "Multiple small (3-5mm), round calcifications with a RADIOLUCENT CENTER.",
        distributionLocation: "Lateral pelvis, below the level of the ischial spines.",
        demographicsClinicalContext: "Extremely common incidental finding in adults.",
        discriminatingKeyFeature: "LUCENT CENTER: Phleboliths (calcified venous thrombi) have a characteristic central hole. Located in the line of the pelvic veins.",
        associatedFindings: "Normal AXR.",
        complicationsSeriousAlternatives: "Mistaken for ureteric stones.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Leiomyoma (Fibroid) - Calcified",
        dominantImagingFinding: "Large, 'POPCORN' or mulberry-like coarse calcification.",
        distributionLocation: "Midline (Uterus). Can be very large.",
        demographicsClinicalContext: "Older females (Post-menopausal degeneration).",
        discriminatingKeyFeature: "POPCORN appearance: Large, clumped calcification. Diagnostic of a degenerating leiomyoma.",
        associatedFindings: "Uterine enlargement.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Ovarian Serous Carcinoma (Psammoma bodies)",
        dominantImagingFinding: "Fine, cloud-like or 'SAND-LIKE' calcification throughout the pelvis.",
        distributionLocation: "Adnexal regions and peritoneum.",
        demographicsClinicalContext: "Post-menopausal bleeding or abdominal distension. CA-125 positive.",
        discriminatingKeyFeature: "DIFFUSE PERITONEAL SEEDING: Calcification follows the peritoneal surfaces (Psammomatous calcification). Associated with ASCITES.",
        associatedFindings: "Omental caking.",
        complicationsSeriousAlternatives: "Death.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "O PAQUE PARANASAL SINUSES",
    itemNumber: "11.9",
    problemCluster: "sinus opacification",
    seriousAlternatives: ["Acute Sinusitis", "Antrochoanal Polyp", "Inverting Papilloma", "Sinonasal Carcinoma"],
    differentials: [
      {
        diagnosis: "Acute Sinusitis",
        dominantImagingFinding: "Air-fluid level and mucosal thickening. NO bone destruction.",
        distributionLocation: "Maxillary, Ethmoid focus common.",
        demographicsClinicalContext: "Fever, facial pain, purulent discharge.",
        discriminatingKeyFeature: "AIR-FLUID LEVEL and acute presentation. Lack of bone destruction distinguishes from cancer.",
        associatedFindings: "Pansinusitis.",
        complicationsSeriousAlternatives: "Orbital cellulitis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Inverting Papilloma",
        dominantImagingFinding: "Soft tissue mass focused on the LATERAL NASAL WALL. Associated focal HYPEROSTOSIS.",
        distributionLocation: "Lateral nasal wall/Middle meatus extending into the maxillary sinus.",
        demographicsClinicalContext: "Middle-aged adults. Unilateral nasal obstruction.",
        discriminatingKeyFeature: "FOCAL HYPEROSTOSIS: MRI shows a 'convoluted cerebriform pattern' (CCP). Focal thickening of the bone at the tumor origin.",
        associatedFindings: "Bony remodeling.",
        complicationsSeriousAlternatives: "Squamous Cell Carcinoma (10%).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sinonasal Carcinoma (SCC)",
        dominantImagingFinding: "Solid mass associated with AGGRESSIVE bone destruction.",
        distributionLocation: "Maxillary antrum common.",
        demographicsClinicalContext: "Elderly. Chronic smoking or occupational wood-dust exposure.",
        discriminatingKeyFeature: "BONE DESTRUCTION: Moth-eaten destruction of the sinus walls is pathognomonic for malignancy or aggressive fungal disease.",
        associatedFindings: "Nodal metastases.",
        complicationsSeriousAlternatives: "Intracranial invasion.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 20 (PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_20_DATA) {
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