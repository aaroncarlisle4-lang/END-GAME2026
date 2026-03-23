import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_31_DATA = [
  {
    pattern: "P NEUMOTHORAX",
    itemNumber: "4.29",
    problemCluster: "air in pleura",
    seriousAlternatives: ["Tension Pneumothorax (EMERGENCY)", "Bulla", "Skin Fold (Mimic)"],
    differentials: [
      {
        diagnosis: "Simple Pneumothorax",
        dominantImagingFinding: "Visible VISCERAL PLEURAL LINE. Absolute absence of lung markings peripheral to the line.",
        distributionLocation: "Apical (erect) or lateral sulcus (supine).",
        demographicsClinicalContext: "Young tall males (Primary) or smokers with COPD (Secondary). Sudden chest pain.",
        discriminatingKeyFeature: "VISIBLE VISCERAL PLEURA: This line is thin and sharp. Unlike a skin fold, lung markings stop abruptly at the line.",
        associatedFindings: "Deep sulcus sign on supine films.",
        complicationsSeriousAlternatives: "Progression to tension.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Tension Pneumothorax",
        dominantImagingFinding: "Large pneumothorax with CONTRALATERAL MEDIASTINAL SHIFT and depression of the diaphragm.",
        distributionLocation: "Entire hemithorax focus.",
        demographicsClinicalContext: "Acute respiratory and cardiovascular collapse. EMERGENCY.",
        discriminatingKeyFeature: "MEDIASTINAL SHIFT: Displacement of the heart and trachea AWAY from the pneumothorax. Requires immediate needle decompression.",
        associatedFindings: "Flattening or inversion of the hemidiaphragm.",
        complicationsSeriousAlternatives: "Cardiac arrest (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Large Emphysematous Bulla",
        dominantImagingFinding: "Large air-filled space with a thin, concave wall. Lung markings may be seen through it.",
        distributionLocation: "Apical focus common.",
        demographicsClinicalContext: "Elderly smokers with COPD.",
        discriminatingKeyFeature: "CONCAVE WALL: Bullae usually have a wall that is concave towards the chest wall. Pneumothorax visceral line is convex.",
        associatedFindings: "Generalized emphysema.",
        complicationsSeriousAlternatives: "Rupture (causing pneumothorax).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "Renal artery stenosis",
    itemNumber: "8.16", // Corrected mapping
    problemCluster: "renal narrowing",
    seriousAlternatives: ["Atherosclerosis (90%)", "Fibromuscular Dysplasia (FMD)", "Vasculitis"],
    differentials: [
      {
        diagnosis: "Atherosclerotic RAS",
        dominantImagingFinding: "Narrowing at the RENAL ARTERY OSTIUM. Small, shrunken kidney (<9cm).",
        distributionLocation: "Proximal 1cm of the renal artery.",
        demographicsClinicalContext: "Older adults with systemic vascular disease. Refractory hypertension.",
        discriminatingKeyFeature: "OSTIAL location: Occurs exactly at the origin from the aorta. Associated with calcified aortic plaques.",
        associatedFindings: "Delayed nephrogram and parvus-tardus waveform on Doppler.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Fibromuscular Dysplasia (FMD)",
        dominantImagingFinding: "Alternating segments of narrowing and dilatation ('STRING-OF-BEADS').",
        distributionLocation: "MID and DISTAL segments. Characteristically spares the ostium.",
        demographicsClinicalContext: "Young females. Sudden onset hypertension.",
        discriminatingKeyFeature: "STRING-OF-BEADS appearance and distal location. No significant calcification.",
        associatedFindings: "Carotid artery beads.",
        complicationsSeriousAlternatives: "Arterial dissection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "A RTHRITIS WITH PRESERVED OR WIDENED JOINT SPACE",
    itemNumber: "3.6",
    problemCluster: "non-narrowed arthritis",
    seriousAlternatives: ["Gout", "PVNS", "Primary Synovial Chondromatosis", "Neuropathic Joint (Early)"],
    differentials: [
      {
        diagnosis: "Gouty Arthritis",
        dominantImagingFinding: "Punched-out erosions with OVERHANGING EDGES (Martel sign). PRESERVED joint space until late.",
        distributionLocation: "1st MTP (Podagra), Hands, and Ankle.",
        demographicsClinicalContext: "Middle-aged males. High uric acid. Recurrent acute flares.",
        discriminatingKeyFeature: "OVERHANGING EDGES and preservation of the joint space despite severe erosions. Dense soft tissue tophi.",
        associatedFindings: "Normal bone density (No osteoporosis).",
        complicationsSeriousAlternatives: "Joint deformity.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "PVNS (Pigmented Villonodular Synovitis)",
        dominantImagingFinding: "Well-defined erosions on both sides of the joint. PRESERVED joint space. Nodular synovium.",
        distributionLocation: "Knee (80%). Monarticular focus.",
        demographicsClinicalContext: "Young adults. Recurrent swelling and bloody joint fluid.",
        discriminatingKeyFeature: "BLOOMING ON SWI/GRE: Presence of hemosiderin causing low signal areas that bloom on MRI. 100% diagnostic.",
        associatedFindings: "Nodular synovial masses.",
        complicationsSeriousAlternatives: "Articular destruction (late).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Primary Synovial Chondromatosis",
        dominantImagingFinding: "Multiple small uniform calcified bodies. PRESERVED joint space early on.",
        distributionLocation: "Large weight-bearing joints (Knee/Hip). Monarticular.",
        demographicsClinicalContext: "Young adults. Joint locking.",
        discriminatingKeyFeature: "MULTIPLE UNIFORM BODIES: Innumerable small 'joint mice' of the same size. Pressure erosions on both sides.",
        associatedFindings: "Joint effusion.",
        complicationsSeriousAlternatives: "Secondary OA.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "CONGENITAL CNS INFECTIONS",
    itemNumber: "12.12",
    problemCluster: "TORCH brain",
    seriousAlternatives: ["CMV (Most common)", "Toxoplasmosis", "Rubella", "HSV-2"],
    differentials: [
      {
        diagnosis: "Congenital CMV",
        dominantImagingFinding: "PERIVENTRICULAR (Subependymal) calcification. Microcephaly and ventriculomegaly.",
        distributionLocation: "Strictly PERIVENTRICULAR focus.",
        demographicsClinicalContext: "Neonates with intrauterine growth restriction, jaundice, and hearing loss.",
        discriminatingKeyFeature: "PERIVENTRICULAR calcification: CMV characteristically involves the germinal matrix lining the ventricles. Associated with polymicrogyria.",
        associatedFindings: "Sensorineural hearing loss (SNHL).",
        complicationsSeriousAlternatives: "Severe developmental delay.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Congenital Toxoplasmosis",
        dominantImagingFinding: "DIFFUSE parenchymal calcifications. Basal ganglia and cortex. Hydrocephalus.",
        distributionLocation: "Diffuse and random parenchymal focus.",
        demographicsClinicalContext: "Neonates. Classic triad: Chorioretinitis, Hydrocephalus, and Calcification.",
        discriminatingKeyFeature: "DIFFUSE distribution: Unlike CMV, Toxo calcification is scattered throughout the brain, not just periventricular.",
        associatedFindings: "Chorioretinitis.",
        complicationsSeriousAlternatives: "Visual loss.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Congenital HSV-2 Encephalitis",
        dominantImagingFinding: "Massive encephalomalacia and multicystic brain destruction. Cortical calcification.",
        distributionLocation: "Global parenchymal destruction.",
        demographicsClinicalContext: "Neonates presenting 1-3 weeks after birth. Severe seizures.",
        discriminatingKeyFeature: "BRAIN DESTRUCTION: HSV-2 causes catastrophic 'melting' of the brain. High T1 signal (haemorrhage) early on.",
        associatedFindings: "Skin vesicles.",
        complicationsSeriousAlternatives: "Death (90% morbidity/mortality).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C OLITIS ON CROSS-SECTIONAL IMAGING",
    itemNumber: "6.24",
    problemCluster: "inflamed colon",
    seriousAlternatives: ["Ulcerative Colitis", "Crohn's Colitis", "Ischaemic Colitis", "Pseudomembranous Colitis"],
    differentials: [
      {
        diagnosis: "Ulcerative Colitis (UC)",
        dominantImagingFinding: "CONTINUOUS, symmetric wall thickening. Rectal involvement (95%). Loss of haustra ('Lead-pipe').",
        distributionLocation: "Rectum extending proximally. Strictly continuous.",
        demographicsClinicalContext: "Young adults. Bloody diarrhea.",
        discriminatingKeyFeature: "RECTAL INVOLVEMENT and CONTINUITY. Spares the small bowel (except for backwash ileitis).",
        associatedFindings: "Sclerosing cholangitis (PSC) and Toxic megacolon.",
        complicationsSeriousAlternatives: "Colorectal cancer risk (10% after 20y).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Crohn's Colitis",
        dominantImagingFinding: "Asymmetric wall thickening with SKIP LESIONS. Characteristically spares the rectum (50%).",
        distributionLocation: "Any part of the colon. Segmental focus.",
        demographicsClinicalContext: "Young adults. Perianal disease and fistulae.",
        discriminatingKeyFeature: "SKIP LESIONS and RECTAL SPARING. Associated with Terminal Ileitis (90%) and creeping fat.",
        associatedFindings: "Abscesses and fistulae.",
        complicationsSeriousAlternatives: "Strictures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pseudomembranous Colitis (C. diff)",
        dominantImagingFinding: "MASSIVE mural thickening (>15mm). 'ACCORDION SIGN' on CT.",
        distributionLocation: "Diffuse colonic focus.",
        demographicsClinicalContext: "History of recent ANTIBIOTIC use. Profuse watery diarrhea.",
        discriminatingKeyFeature: "ACCORDION SIGN: Contrast trapped between thickened edematous haustral folds. Most severe wall thickening of all colitis causes.",
        associatedFindings: "Ascites.",
        complicationsSeriousAlternatives: "Toxic megacolon.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "E RLENMEYER FLASK DEFORMITY",
    itemNumber: "14.23",
    problemCluster: "metaphyseal expansion",
    seriousAlternatives: ["Gaucher Disease", "Osteopetrosis", "Pyle Disease", "Thalassaemia"],
    differentials: [
      {
        diagnosis: "Gaucher Disease",
        dominantImagingFinding: "Erlenmeyer flask metaphyses with associated medullary INFARCTION and H-shaped vertebrae.",
        distributionLocation: "Distal femur and proximal tibia.",
        demographicsClinicalContext: "Ashkenazi Jewish common. Splenomegaly and bone crises.",
        discriminatingKeyFeature: "MEDULLARY INFARCT: Presence of serpiginous sclerosis and massive splenomegaly. Bone marrow is dark on T1.",
        associatedFindings: "AVN of the femoral head.",
        complicationsSeriousAlternatives: "Pathological fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteopetrosis (Infantile)",
        dominantImagingFinding: "Erlenmeyer flask metaphyses with EXTREME uniform bone sclerosis. BONE-IN-BONE.",
        distributionLocation: "Generalized skeleton.",
        demographicsClinicalContext: "Infants with marrow failure. Cranial nerve palsies.",
        discriminatingKeyFeature: "DIFFUSE SCLEROSIS: The whole skeleton is uniformly chalk-white. Gaucher is typically osteopenic with focal sclerosis.",
        associatedFindings: "Sandwich vertebrae.",
        complicationsSeriousAlternatives: "Pancytopenia.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pyle Disease (Metaphyseal Dysplasia)",
        dominantImagingFinding: "The MOST SEVERE Erlenmeyer flask deformity. Lacks sclerosis or organomegaly.",
        distributionLocation: "Metaphyses focus.",
        demographicsClinicalContext: "Asymptomatic incidental finding in children/adults.",
        discriminatingKeyFeature: "NORMAL BONE DENSITY: Unlike Gaucher or petrosis, the bone mineralization and marrow are normal. No systemic signs.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "V ESICOURETERIC REFLUX",
    itemNumber: "8.40", // Also 14.55 in paeds
    problemCluster: "VUR",
    seriousAlternatives: ["Primary VUR", "Secondary (PUV)", "Neurogenic Bladder"],
    differentials: [
      {
        diagnosis: "Primary VUR (Congenital)",
        dominantImagingFinding: "Retrograde flow of urine from bladder to ureter on VCUG. Ureteric dilatation (Grades I-V).",
        distributionLocation: "Unilateral or bilateral. Continuous with the bladder.",
        demographicsClinicalContext: "Children with recurrent UTIs.",
        discriminatingKeyFeature: "VCUG: High-grade reflux shows tortuous dilated ureters and blunted calyces. Grade IV/V usually requires surgery.",
        associatedFindings: "Renal scarring at the upper/lower poles.",
        complicationsSeriousAlternatives: "Reflux nephropathy and renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Secondary VUR (PUV)",
        dominantImagingFinding: "Bilateral reflux associated with a thick-walled TRABECULATED bladder and dilated posterior urethra.",
        distributionLocation: "Bilateral. Male neonates.",
        demographicsClinicalContext: "Male infants with poor urinary stream.",
        discriminatingKeyFeature: "POSTERIOR URETHRA: Dilation of the posterior urethra (Keyhole sign) identifies PUV as the cause of secondary VUR.",
        associatedFindings: "Renal dysplasia (High echogenicity).",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "APPEARANCES AND FEATURES OF FIBROADENOMAS",
    itemNumber: "10.12",
    problemCluster: "benign breast mass",
    seriousAlternatives: ["Fibroadenoma", "Breast Cyst", "Phyllodes Tumor", "Medullary Carcinoma"],
    differentials: [
      {
        diagnosis: "Fibroadenoma",
        dominantImagingFinding: "Well-circumscribed, smooth, oval mass. Wider-than-tall. POPCORN calcification if old.",
        distributionLocation: "Anywhere.",
        demographicsClinicalContext: "Young women (15-35y). Highly mobile 'Breast Mouse'.",
        discriminatingKeyFeature: "INTERNAL DARK SEPTATIONS: On MRI, non-enhancing dark internal septa are highly specific for fibroadenoma. US shows gentle lobulations.",
        associatedFindings: "Stability on serial imaging.",
        complicationsSeriousAlternatives: "Giant fibroadenoma (>5cm).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Phyllodes Tumor",
        dominantImagingFinding: "Large, rapidly growing well-circumscribed mass. Often contains cystic clefts.",
        distributionLocation: "Typically large (>4cm).",
        demographicsClinicalContext: "Older women (40-50y). Rapid size increase.",
        discriminatingKeyFeature: "RAPID GROWTH and internal CYSTIC CLEFT-LIKE spaces on US. Indistinguishable from FA on a single mammogram.",
        associatedFindings: "High mitotic index on biopsy.",
        complicationsSeriousAlternatives: "Malignancy (25%).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "J-SHAPED SELLA",
    itemNumber: "12.34",
    problemCluster: "sella variants",
    seriousAlternatives: ["Optic Chiasm Glioma", "Mucopolysaccharidosis (Hurler)", "Normal Variant (5%)", "Chronic Hydrocephalus"],
    differentials: [
      {
        diagnosis: "Optic Chiasm Glioma",
        dominantImagingFinding: "J-shaped sella due to erosion of the tuberculum sellae by a suprasellar mass.",
        distributionLocation: "Suprasellar space extending into the sella.",
        demographicsClinicalContext: "Children. Strong association with NF1 (50%).",
        discriminatingKeyFeature: "SUPRASELLAR MASS: Presence of a solid enhancing mass centered on the optic chiasm. MRI is diagnostic.",
        associatedFindings: "Widened optic foramen.",
        complicationsSeriousAlternatives: "Vision loss.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hurler Syndrome (MPS I)",
        dominantImagingFinding: "J-shaped (Bovine) sella associated with dysostosis multiplex.",
        distributionLocation: "Sella turcica and generalized skeleton.",
        demographicsClinicalContext: "Infants with coarse facies and developmental delay.",
        discriminatingKeyFeature: "OAR-SHAPED RIBS and anterior vertebral beaking. The sella shape is due to a primary bone dysplasia.",
        associatedFindings: "Macrocephaly.",
        complicationsSeriousAlternatives: "Early death.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "UTERINE CERVIX",
    itemNumber: "13.3",
    problemCluster: "cervical mass",
    seriousAlternatives: ["Cervical Carcinoma (SCC)", "Nabothian Cyst (Benign)", "Cervical Polyp", "Leiomyoma"],
    differentials: [
      {
        diagnosis: "Cervical Carcinoma",
        dominantImagingFinding: "Solid, infiltrative mass in the cervix. High T2 signal relative to normal fibrous cervical stroma (which is dark).",
        distributionLocation: "Uterine cervix.",
        demographicsClinicalContext: "Post-coital bleeding. HPV history. Abnormal smear.",
        discriminatingKeyFeature: "T2-BRIGHT mass: The hallmark of carcinoma is a mass that is brighter than the normal dark cervical stroma. Parametrial invasion.",
        associatedFindings: "Hydronephrosis (from ureteric invasion).",
        complicationsSeriousAlternatives: "Bladder/Rectal invasion.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Nabothian Cyst",
        dominantImagingFinding: "Small (often <1cm) simple cyst within the cervical wall. No solid component.",
        distributionLocation: "Cervical stroma.",
        demographicsClinicalContext: "Asymptomatic incidental finding in adults.",
        discriminatingKeyFeature: "SIMPLE CYSTIC appearance: Identical to a simple cyst elsewhere (T2 bright, no enhancement). Benign.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "P ULMONARY HYPERTENSION",
    itemNumber: "5.19",
    problemCluster: "high PA pressure",
    seriousAlternatives: ["Chronic PE (CTEPH)", "COPD", "Primary PAH", "Left Heart Failure"],
    differentials: [
      {
        diagnosis: "Chronic Thromboembolic Pulmonary HTN (CTEPH)",
        dominantImagingFinding: "Main PA >29mm. MOSAIC ATTENUATION on CT. Web-like bands in pulmonary arteries.",
        distributionLocation: "Pulmonary arteries and main PA.",
        demographicsClinicalContext: "Prior history of DVT/PE. Progressive dyspnoea.",
        discriminatingKeyFeature: "MOSAIC PERFUSION and filling defects (webs) in arteries on CTPA. Potentially curable by endarterectomy.",
        associatedFindings: "Right heart enlargement.",
        complicationsSeriousAlternatives: "Cor pulmonale.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Primary PAH",
        dominantImagingFinding: "MASSIVE enlargement of the main PA with RAPID PERIPHERAL PRUNING.",
        distributionLocation: "Central arteries focus.",
        demographicsClinicalContext: "Young females (20-40y). Syncope and DOE.",
        discriminatingKeyFeature: "PRUNING: Extreme discrepancy between large central and tiny peripheral vessels. No history of prior PE.",
        associatedFindings: "RV hypertrophy.",
        complicationsSeriousAlternatives: "Right heart failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "O PTIC NERVE GLIOMA VERSUS OPTIC",
    itemNumber: "11.2",
    problemCluster: "optic nerve mass",
    seriousAlternatives: ["Optic Nerve Glioma (NF1)", "Optic Nerve Sheath Meningioma"],
    differentials: [
      {
        diagnosis: "Optic Nerve Glioma (Pilocytic Astrocytoma)",
        dominantImagingFinding: "Fusiform enlargement of the nerve itself. Nerve cannot be separated from the mass.",
        distributionLocation: "Optic nerve and chiasm.",
        demographicsClinicalContext: "Children (<10y). 25-50% have NF1.",
        discriminatingKeyFeature: "NERVE ENLARGEMENT: The nerve is the mass. High association with NF1. Lacks the tram-track calcification of meningioma.",
        associatedFindings: "Kinking of the optic nerve.",
        complicationsSeriousAlternatives: "Visual loss.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Optic Nerve Sheath Meningioma",
        dominantImagingFinding: "Mass surrounding a NORMAL-SIZED optic nerve. TRAM-TRACK sign.",
        distributionLocation: "Optic nerve sheath.",
        demographicsClinicalContext: "Middle-aged females. Vision loss.",
        discriminatingKeyFeature: "TRAM-TRACK SIGN: Enhancing or calcified sheath with a non-enhancing, preserved nerve in the center. Nerve is separate from mass.",
        associatedFindings: "Orbital hyperostosis.",
        complicationsSeriousAlternatives: "Blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "D RUG-INDUCED LUNG DISEASE",
    itemNumber: "4.38",
    problemCluster: "toxic lung",
    seriousAlternatives: ["Amiodarone Toxicity", "Methotrexate Lung", "Nitrofurantoin", "Bleomycin"],
    differentials: [
      {
        diagnosis: "Amiodarone Toxicity",
        dominantImagingFinding: "Diffuse ground-glass opacities or consolidation. CHARACTERISTICALLY HIGH ATTENUATION (>100 HU).",
        distributionLocation: "Lower lobes common.",
        demographicsClinicalContext: "Cardiac patients on long-term amiodarone. Subacute dyspnoea.",
        discriminatingKeyFeature: "HIGH ATTENUATION: Consolidation is denser than normal muscle/liver on CT due to iodine content. Foamy macrophages on BAL.",
        associatedFindings: "High attenuation in the liver and spleen (Iodine accumulation).",
        complicationsSeriousAlternatives: "Fibrosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Methotrexate Lung",
        dominantImagingFinding: "Diffuse ground-glass opacities and EOSINOPHILIA. Hypersensitivity pneumonitis pattern.",
        distributionLocation: "Diffuse.",
        demographicsClinicalContext: "RA patients on methotrexate. Acute fever and cough.",
        discriminatingKeyFeature: "PERIPHERAL EOSINOPHILIA and acute onset. Unlike amiodarone, it does not show high CT density.",
        associatedFindings: "Hilar nodes.",
        complicationsSeriousAlternatives: "Acute respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "L IVER LESIONS CAUSING CAPSULAR RETRACTION",
    itemNumber: "7.25",
    problemCluster: "liver surface distortion",
    seriousAlternatives: ["Cholangiocarcinoma", "Fibrolamellar HCC", "Metastasis (Treated)", "Hepatic Epithelioid Haemangioendothelioma (EHE)"],
    differentials: [
      {
        diagnosis: "Intrahepatic Cholangiocarcinoma",
        dominantImagingFinding: "Massively desmoplastic mass causing CAP SULAR RETRACTION. Delayed enhancement.",
        distributionLocation: "Peripheral liver lobe.",
        demographicsClinicalContext: "Older adults. Associated with PSC or biliary stones.",
        discriminatingKeyFeature: "CAPSULAR RETRACTION: The intense fibrous stroma pulls the liver surface inwards. Delayed peripheral-to-central enhancement.",
        associatedFindings: "Dilated peripheral bile ducts (Satellite).",
        complicationsSeriousAlternatives: "Biliary obstruction.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hepatic EHE",
        dominantImagingFinding: "Multiple peripheral nodular masses causing 'FLATTENING' or retraction of the capsule.",
        distributionLocation: "Peripheral subcapsular focus. Multicentric.",
        demographicsClinicalContext: "Young females. Asymptomatic incidental finding.",
        discriminatingKeyFeature: "PERIPHERAL location and multicentricity. Associated with 'lollipop' sign (portal vein/hepatic vein taper at the mass).",
        associatedFindings: "Calcification (20%).",
        complicationsSeriousAlternatives: "Liver failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "R ENAL VEIN THROMBOSIS",
    itemNumber: "8.30",
    problemCluster: "renal vein defect",
    seriousAlternatives: ["Nephrotic Syndrome (Adult)", "Dehydration (Neonate)", "Renal Cell Carcinoma (Tumor Thrombus)"],
    differentials: [
      {
        diagnosis: "Adult RVT (Nephrotic Syndrome)",
        dominantImagingFinding: "Large, congested kidney. Filling defect in the renal vein on CT/MRI. Delayed nephrogram.",
        distributionLocation: "Renal vein extending to IVC. Unilateral or bilateral.",
        demographicsClinicalContext: "Adults with Membranous Nephropathy. Sudden loin pain and haematuria.",
        discriminatingKeyFeature: "NEPHROTIC SYNDROME: 30% of MN patients develop RVT. High risk of PE.",
        associatedFindings: "Varicocele (if left side).",
        complicationsSeriousAlternatives: "Pulmonary embolism (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "RCC Tumor Thrombus",
        dominantImagingFinding: "Solid enhancing mass in the renal vein. Continuous with a renal cortex tumor.",
        distributionLocation: "Renal vein and IVC.",
        demographicsClinicalContext: "Adults with RCC.",
        discriminatingKeyFeature: "SOLID ENHANCEMENT: Tumor thrombus enhances like the primary RCC. Simple clot thrombus does not.",
        associatedFindings: "Renal mass (RCC).",
        complicationsSeriousAlternatives: "RA involvement (Stage IV).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "THE NORMAL THYMUS",
    itemNumber: "14.36",
    problemCluster: "normal childhood thymus",
    seriousAlternatives: ["Normal Thymus", "Thymic Rebound", "Thymic Hyperplasia"],
    differentials: [
      {
        diagnosis: "Normal Childhood Thymus",
        dominantImagingFinding: "Quadrilateral, soft soft tissue mass. WAVY BORDER (Sign of Mulder). No mass effect.",
        distributionLocation: "Anterior mediastinum.",
        demographicsClinicalContext: "Infants and children (<10y).",
        discriminatingKeyFeature: "WAVY BORDER and SOFTNESS: It takes the shape of the ribs and does not displace vessels. Lacks calcification.",
        associatedFindings: "Sail sign on CXR.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Thymic Rebound (Post-Stress)",
        dominantImagingFinding: "Rapid enlargement of the thymus following recovery from illness or chemotherapy.",
        distributionLocation: "Thymic bed.",
        demographicsClinicalContext: "Children recovering from treatment for lymphoma/leukaemia.",
        discriminatingKeyFeature: "PRIOR STRESS history and signal loss on OUT-OF-PHASE MRI (Chemical shift). Hyperplasia contains microscopic fat.",
        associatedFindings: "Stable follow-up.",
        complicationsSeriousAlternatives: "Mistaken for tumor recurrence.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 31 (Final High-Yield Push)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_31_DATA) {
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
  console.log("Batch 31 Complete!");
}

main().catch(console.error);