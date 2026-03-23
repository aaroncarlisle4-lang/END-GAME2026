import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_5_DATA = [
  {
    pattern: "A IR-SPACE OPACIFICATION",
    itemNumber: "4.11",
    problemCluster: "alveolar filling",
    seriousAlternatives: ["Acute Pulmonary Oedema", "Severe Pneumonia", "Alveolar Haemorrhage"],
    differentials: [
      {
        diagnosis: "Pulmonary Oedema",
        dominantImagingFinding: "Perihilar BAT-WING consolidation. Kerley B lines and peribronchial cuffing. Pleural effusions.",
        distributionLocation: "Perihilar and basal. Characteristically symmetric.",
        demographicsClinicalContext: "Heart failure or acute fluid overload. Rapid onset dyspnoea.",
        discriminatingKeyFeature: "CARDIOMEGALY and rapid resolution with diuretics (<48h). Perihilar distribution.",
        associatedFindings: "Cephalisation of vessels and pleural effusions.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pneumonia (Bacterial)",
        dominantImagingFinding: "Homogeneous consolidation with AIR BRONCHOGRAMS. Lacks volume loss (unlike collapse).",
        distributionLocation: "Lobar or segmental. Non-migratory.",
        demographicsClinicalContext: "Fever, cough, and leukocytosis. Acute presentation.",
        discriminatingKeyFeature: "ABENCE OF CARDIOMEGALY and focal distribution. Delayed resolution (weeks).",
        associatedFindings: "Parapneumonic effusion.",
        complicationsSeriousAlternatives: "Lung abscess or empyema.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Alveolar Proteinosis",
        dominantImagingFinding: "Diffuse ground-glass opacities with superimposed septal thickening (CRAZY-PAVING).",
        distributionLocation: "Diffuse but with GEOGRAPHIC SPARING of lobules.",
        demographicsClinicalContext: "Adults (30-50y). Indolent course. BAL shows 'milky' fluid.",
        discriminatingKeyFeature: "GEOGRAPHIC SPARING and crazy-paving pattern without heart failure signs.",
        associatedFindings: "PAS-positive material in alveoli.",
        complicationsSeriousAlternatives: "Secondary infection (Nocardia).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "R ETICULAR PATTERN (WITH OR WITHOUT HONEYCOMBING)",
    itemNumber: "4.15",
    problemCluster: "interstitial fibrosis",
    seriousAlternatives: ["UIP / IPF", "NSIP", "Asbestosis", "Chronic HP"],
    differentials: [
      {
        diagnosis: "Usual Interstitial Pneumonia (UIP/IPF)",
        dominantImagingFinding: "Subpleural, basal predominant reticulation and HONEYCOMBING (100% for definite UIP). Traction bronchiectasis.",
        distributionLocation: "Basal and peripheral (Subpleural). APICAL SPARING.",
        demographicsClinicalContext: "Adults >60y. Progressive dyspnoea and Velcro crackles on auscultation.",
        discriminatingKeyFeature: "HONEYCOMBING (clustered subpleural cysts) and absence of ground-glass (GG is minimal).",
        associatedFindings: "Reduced lung volumes.",
        complicationsSeriousAlternatives: "Acute exacerbation of IPF (High mortality).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Non-Specific Interstitial Pneumonia (NSIP)",
        dominantImagingFinding: "Diffuse ground-glass opacities and fine reticulation. Spares the subpleural space.",
        distributionLocation: "Diffuse and basal. SUBPLEURAL SPARING (60-90%).",
        demographicsClinicalContext: "Associated with Scleroderma or other connective tissue diseases (CTD).",
        discriminatingKeyFeature: "SUBPLEURAL SPARING and predominance of GROUND-GLASS over honeycombing (Honeycombing is rare).",
        associatedFindings: "Oesophageal dilatation (if Scleroderma).",
        complicationsSeriousAlternatives: "Progression to fibrosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Asbestosis",
        dominantImagingFinding: "Pattern identical to UIP (Basal reticulation/honeycombing) but with PLEURAL PLAQUES.",
        distributionLocation: "Basal and subpleural.",
        demographicsClinicalContext: "Occupational asbestos exposure (Construction, Shipyards) 20+ years prior.",
        discriminatingKeyFeature: "PLETHORAL PLAQUES: Calcified or non-calcified diaphragmatic and chest wall plaques are diagnostic.",
        associatedFindings: "Subpleural curvilinear lines and parenchymal bands.",
        complicationsSeriousAlternatives: "Increased risk of Bronchogenic Carcinoma and Mesothelioma.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M ULTIPLE PULMONARY",
    itemNumber: "4.18",
    problemCluster: "multiple nodules",
    seriousAlternatives: ["Metastases", "Septic Emboli", "Granulomatosis with Polyangiitis (GPA)"],
    differentials: [
      {
        diagnosis: "Metastases",
        dominantImagingFinding: "Multiple, well-defined nodules of DISPARATE SIZES ('Cannonball' if large). Lower lobe predominance.",
        distributionLocation: "Peripheral and Basal (due to higher blood flow). Random distribution.",
        demographicsClinicalContext: "Known primary (RCC, Thyroid, Colon, Breast). Often asymptomatic.",
        discriminatingKeyFeature: "DISPARATE SIZES and random peripheral distribution. Absence of cavitation (unless RCC/SCC).",
        associatedFindings: "Lymphangitis carcinomatosa and pleural effusions.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Septic Emboli",
        dominantImagingFinding: "Multiple small nodules, many showing CAVITATION (50%). FEEDING VESSEL SIGN.",
        distributionLocation: "Peripheral and basal. Subpleural.",
        demographicsClinicalContext: "IVDU, indwelling catheters, or tricuspid endocarditis. Sepsis symptoms.",
        discriminatingKeyFeature: "FEEDING VESSEL sign and RAPID CHANGE on serial films (<48h). Sepsis context.",
        associatedFindings: "Peripheral wedge-shaped opacities (infarcts).",
        complicationsSeriousAlternatives: "Pneumothorax and empyema.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Granulomatosis with Polyangiitis (GPA)",
        dominantImagingFinding: "Multiple nodules or masses, often LARGE (>2cm). High frequency of CAVITATION (50%).",
        distributionLocation: "Random. No zonal predilection.",
        demographicsClinicalContext: "Adults. Sinusitis, epistaxis, and renal disease (Haematuria). c-ANCA positive.",
        discriminatingKeyFeature: "THICK-WALLED CAVITIES and associated systemic disease (Sinus/Kidney). Lacks sepsis symptoms of emboli.",
        associatedFindings: "Subglottic stenosis and alveolar haemorrhage.",
        complicationsSeriousAlternatives: "Renal failure (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "T HICKENED FOLDS IN NON-DILATED",
    itemNumber: "6.16",
    problemCluster: "thickened jejunal folds",
    seriousAlternatives: ["Giardiasis", "Hypoproteinaemia", "Lymphoma", "Whipple's Disease"],
    differentials: [
      {
        diagnosis: "Giardiasis",
        dominantImagingFinding: "Irregular thickening of the jejunal folds with hypersecretion and rapid transit.",
        distributionLocation: "Duodenum and Jejunum. Characteristically SPARES THE ILEUM.",
        demographicsClinicalContext: "Traveller or childcare worker. Watery diarrhea and malabsorption.",
        discriminatingKeyFeature: "JEJUNAL focus and irritability (spasm). Unlike Whipple's, there is no lymphadenopathy.",
        associatedFindings: "Increased secretions (dilution of barium).",
        complicationsSeriousAlternatives: "Chronic malabsorption.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hypoproteinaemia (e.g. Nephrotic/Cirrhosis)",
        dominantImagingFinding: "Smooth, regular, symmetric thickening of the folds ('STACK-OF-COINS').",
        distributionLocation: "Diffuse small bowel (Jejunum and Ileum).",
        demographicsClinicalContext: "Renal failure, Liver failure, or Protein-losing enteropathy. Generalised oedema (Anasarca).",
        discriminatingKeyFeature: "REGULAR SYMMETRIC thickening without mucosal ulceration or nodularity. Associated with ASCITES.",
        associatedFindings: "Anasarca and low serum albumin.",
        complicationsSeriousAlternatives: "Intestinal wall oedema.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Whipple's Disease",
        dominantImagingFinding: "Thickened, distorted, 'sand-like' mucosal nodularity. Massive mesenteric lymphadenopathy.",
        distributionLocation: "Jejunum predominance.",
        demographicsClinicalContext: "Middle-aged males. Triad: Malabsorption, arthralgia, and hyperpigmentation.",
        discriminatingKeyFeature: "LOW-DENSITY (Fatty) Mesenteric Nodes: Pathognomonic node appearance on CT. PAS-positive macrophages on biopsy.",
        associatedFindings: "CNS and cardiac involvement.",
        complicationsSeriousAlternatives: "Neurological decline.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "R ENAL PAPILLARY NECROSIS",
    itemNumber: "7.15",
    problemCluster: "papillary necrosis",
    seriousAlternatives: ["Analgesic Nephropathy", "Sickle Cell Disease", "Diabetes Mellitus", "TB"],
    differentials: [
      {
        diagnosis: "Analgesic Nephropathy",
        dominantImagingFinding: "Bilateral SMALL, shrunken kidneys. PAPILLARY CALCIFICATION (90% specific).",
        distributionLocation: "Bilateral. Generalised papillary involvement.",
        demographicsClinicalContext: "Chronic use of NSAIDs/Phenacetin. Middle-aged females. Chronic back pain.",
        discriminatingKeyFeature: "PAPILLARY CALCIFICATION (Garland of stones) and small kidneys. Most common cause of chronic PN.",
        associatedFindings: "Increased risk of Transitional Cell Carcinoma (TCC).",
        complicationsSeriousAlternatives: "End-stage renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Sickle Cell Disease (SCD)",
        dominantImagingFinding: "Papillary necrosis often with LOBSTER-CLAW or BALL-ON-TEE appearance. Normal kidney size early on.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "African descent. History of bone crises. Microscopic haematuria.",
        discriminatingKeyFeature: "H-SHAPED VERTEBRAE and Autosplenectomy (small calcified spleen) on same scan.",
        associatedFindings: "Medullary sclerosis and gallstones.",
        complicationsSeriousAlternatives: "Renal medullary carcinoma (rare but fatal).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Diabetes Mellitus",
        dominantImagingFinding: "Sloughed papillae causing filling defects in the calyces. RING SHADOW on IVP.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Diabetic patient with acute UTI/pyelonephritis. Sepsis.",
        discriminatingKeyFeature: "ACUTE presentation with sepsis. Unlike analgesics, kidneys are often enlarged (diabetic nephropathy).",
        associatedFindings: "Emphysematous pyelonephritis (gas).",
        complicationsSeriousAlternatives: "Urosepsis (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L EFT VENTRICULAR ENLARGEMENT",
    itemNumber: "5.5",
    problemCluster: "left heart enlargement",
    seriousAlternatives: ["Aortic Regurgitation", "Aortic Stenosis (Late)", "Hypertension", "Mitral Regurgitation"],
    differentials: [
      {
        diagnosis: "Aortic Regurgitation (AR)",
        dominantImagingFinding: "MASSIVE LV enlargement. The cardiac apex is displaced downwards and to the left, often below the diaphragm.",
        distributionLocation: "Left ventricle focus. Dilated Ascending Aorta.",
        demographicsClinicalContext: "Collapsing pulse (Corrigan). Wide pulse pressure. Murmur.",
        discriminatingKeyFeature: "DOWNWARD apex and PROMINENT ASCENDING AORTA. The LV is much larger in AR than in pure Stenosis.",
        associatedFindings: "Aortic root dilatation (Marfan/Aortitis).",
        complicationsSeriousAlternatives: "Left heart failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Aortic Stenosis (AS)",
        dominantImagingFinding: "Normal heart size early (Concentric hypertrophy). LV enlargement only occurs in late-stage failure.",
        distributionLocation: "Ascending Aorta (Post-stenotic dilatation).",
        demographicsClinicalContext: "Triad: Angina, Syncope, Dyspnoea. Calcified aortic valve.",
        discriminatingKeyFeature: "POST-STENOTIC DILATATION of the ascending aorta with a normal heart size (unless failing).",
        associatedFindings: "Aortic valve calcification.",
        complicationsSeriousAlternatives: "Sudden cardiac death.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mitral Regurgitation (MR)",
        dominantImagingFinding: "LV enlargement COMBINED with Left Atrial (LA) enlargement.",
        distributionLocation: "LA and LV focus.",
        demographicsClinicalContext: "Pansystolic murmur at apex. Rheumatic or degenerative.",
        discriminatingKeyFeature: "LA ENLARGEMENT: Pure aortic disease spares the LA. MR always involves both chambers.",
        associatedFindings: "Pulmonary venous congestion.",
        complicationsSeriousAlternatives: "Atrial fibrillation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L ATE GADOLINIUM ENHANCEMENT ON CARDIAC MRI",
    itemNumber: "5.10",
    problemCluster: "myocardial enhancement",
    seriousAlternatives: ["Myocardial Infarction", "Myocarditis", "Hypertrophic Cardiomyopathy (HCM)", "Amyloidosis"],
    differentials: [
      {
        diagnosis: "Myocardial Infarction (Ischaemic)",
        dominantImagingFinding: "SUBENDOCARDIAL or Transmural enhancement. Follows a VASCULAR TERRITORY (e.g. LAD).",
        distributionLocation: "Vascular territory. Always involves the subendocardium.",
        demographicsClinicalContext: "Chest pain, elevated Troponin, and ECG changes. Risk factors.",
        discriminatingKeyFeature: "SUBENDOCARDIAL involvement. Non-ischaemic causes (myocarditis/amyloid) characteristically SPARE the subendocardium.",
        associatedFindings: "Regional wall motion abnormality.",
        complicationsSeriousAlternatives: "Ventricular aneurysm and thrombus.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Myocarditis",
        dominantImagingFinding: "EPICARDIAL or Mid-wall enhancement. Does not follow a vascular territory.",
        distributionLocation: "Characteristically Lateral wall. Epicardial focus.",
        demographicsClinicalContext: "Young patient, post-viral illness. Flu-like symptoms and chest pain.",
        discriminatingKeyFeature: "EPICARDIAL distribution. Sparing of the subendocardium is the hallmark of non-ischaemic pathology.",
        associatedFindings: "Global dysfunction and T2 oedema.",
        complicationsSeriousAlternatives: "Dilated cardiomyopathy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Cardiac Amyloidosis",
        dominantImagingFinding: "DIFFUSE SUBENDOCARDIAL enhancement (circumferential). Poor nulling of the myocardium.",
        distributionLocation: "Global and diffuse. Symmetrical.",
        demographicsClinicalContext: "Heart failure with thickened walls but low voltage ECG. Systemic amyloid.",
        discriminatingKeyFeature: "DIFFUSE CIRCUMFERENTIAL pattern and difficulty finding the 'Null point' for the myocardium.",
        associatedFindings: "Thickened atrial septum and pleural effusions.",
        complicationsSeriousAlternatives: "Restrictive cardiomyopathy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "HCM (Hypertrophic Cardiomyopathy)",
        dominantImagingFinding: "Patchy MID-WALL enhancement localized to the JUNCTION POINTS (septal-free wall junctions).",
        distributionLocation: "Junction points and areas of maximum hypertrophy.",
        demographicsClinicalContext: "Young athlete with syncope. Family history. Asymmetric septal thickening.",
        discriminatingKeyFeature: "JUNCTION POINT enhancement and asymmetric septal hypertrophy (>15mm).",
        associatedFindings: "SAM (Systolic Anterior Motion of mitral valve).",
        complicationsSeriousAlternatives: "Sudden cardiac death.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "JUGULAR FORAMEN MASSES",
    itemNumber: "10.37",
    problemCluster: "jugular foramen expansion",
    seriousAlternatives: ["Glomus Jugulare", "Schwannoma", "Meningioma", "Asymmetric Jugular Bulb (Mimic)"],
    differentials: [
      {
        diagnosis: "Glomus Jugulare (Paraganglioma)",
        dominantImagingFinding: "Intensely enhancing mass with 'SALT-AND-PEPPER' appearance (High T2/T1 dots). Permeative bone destruction.",
        distributionLocation: "Jugular foramen. Characteristically invades the middle ear (Glomus Jugulotympanicum).",
        demographicsClinicalContext: "Middle-aged females. Pulsatile tinnitus and conductive hearing loss.",
        discriminatingKeyFeature: "SALT-AND-PEPPER pattern (representing flow voids and haemorrhage) and PERMEATIVE (moth-eaten) bone destruction.",
        associatedFindings: "Pulsatile red mass behind the TM on otoscopy.",
        complicationsSeriousAlternatives: "Cranial nerve palsies (IX-XI).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Schwannoma (CN IX-XI)",
        dominantImagingFinding: "Well-circumscribed, dumbbell-shaped mass. SMOOTH BONY REMODELING (Pressure erosion).",
        distributionLocation: "Jugular foramen. Can extend into the cistern or neck.",
        demographicsClinicalContext: "Adults. Slow progression of cranial nerve deficits.",
        discriminatingKeyFeature: "SMOOTH MARGINS: Unlike Glomus, Schwannomas cause smooth cortical expansion of the foramen without permeative destruction.",
        associatedFindings: "Target sign on T2 (central high signal).",
        complicationsSeriousAlternatives: "Lower cranial nerve palsy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Meningioma (Jugular Foramen)",
        dominantImagingFinding: "Dural-based mass with intense enhancement. HYPEROSTOSIS of the adjacent bone.",
        distributionLocation: "Centered on the foramen with a dural tail.",
        demographicsClinicalContext: "Middle-aged females.",
        discriminatingKeyFeature: "HYPEROSTOSIS: Reactive thickening of the petrous bone is characteristic. Lacks the flow-voids of Glomus.",
        associatedFindings: "Dural tail and calcification.",
        complicationsSeriousAlternatives: "Venous sinus narrowing.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "H YDRONEPHROSIS IN A CHILD",
    itemNumber: "14.52",
    problemCluster: "paediatric renal dilatation",
    seriousAlternatives: ["PUJ Obstruction", "Posterior Urethral Valves (PUV)", "VUR"],
    differentials: [
      {
        diagnosis: "PUJ Obstruction (Pelviureteric Junction)",
        dominantImagingFinding: "Dilated renal pelvis and calyces with a NORMAL calibre ureter. Sudden transition at the PUJ.",
        distributionLocation: "Unilateral (usually). Left side > Right side.",
        demographicsClinicalContext: "Most common cause of neonatal hydronephrosis. Detected on prenatal US.",
        discriminatingKeyFeature: "NORMAL CALIBRE URETER: If the ureter is dilated, the block is distal or due to reflux. PUJ is purely renal/pelvic.",
        associatedFindings: "Reduced cortical thickness if chronic.",
        complicationsSeriousAlternatives: "Renal atrophy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Posterior Urethral Valves (PUV)",
        dominantImagingFinding: "Bilateral hydronephrosis and hydroureter. Thick-walled, trabeculated bladder. 'KEYHOLE' sign.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "MALES only. Poor urinary stream and palpable bladder.",
        discriminatingKeyFeature: "KEYHOLE SIGN: Dilated posterior urethra above the valves. Bilateral disease in a male neonate is PUV until proven otherwise.",
        associatedFindings: "Ascites (Urinary) and renal dysplasia (High echogenicity).",
        complicationsSeriousAlternatives: "Pulmonary hypoplasia (Potter sequence) and renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Vesicoureteric Reflux (VUR)",
        dominantImagingFinding: "Intermittent dilatation of the ureter and pelvis. Blunted calyces and renal scarring.",
        distributionLocation: "Unilateral or bilateral. Often asymmetric.",
        demographicsClinicalContext: "Children with recurrent UTIs.",
        discriminatingKeyFeature: "VOIDING CYSTOURETHROGRAM (VCUG) is the gold standard for diagnosis. Dilatation increases during micturition.",
        associatedFindings: "Renal scars at the poles.",
        complicationsSeriousAlternatives: "Reflux nephropathy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "MULTIPLE NODULES IN THE SMALL BOWEL",
    itemNumber: "6.20",
    problemCluster: "small bowel nodules",
    seriousAlternatives: ["Lymphoid Hyperplasia", "Lymphoma", "Polyposis Syndromes", "Mastocytosis"],
    differentials: [
      {
        diagnosis: "Benign Lymphoid Hyperplasia",
        dominantImagingFinding: "Innumerable small (1-3mm), uniform, well-defined nodules. Symmetrical distribution.",
        distributionLocation: "TERMINAL ILEUM (90%).",
        demographicsClinicalContext: "Children and young adults. Usually asymptomatic. Associated with GI infection or immunodeficiency.",
        discriminatingKeyFeature: "UNIFORMITY and small size. Unlike lymphoma, the nodules are tiny and the bowel wall remains thin.",
        associatedFindings: "Normal transit and normal folds.",
        complicationsSeriousAlternatives: "None (usually regresses).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Small Bowel Lymphoma",
        dominantImagingFinding: "Large (>1cm), irregular nodules or masses. Mural thickening and aneurysmal dilatation.",
        distributionLocation: "Ileum focus.",
        demographicsClinicalContext: "Adults. B-symptoms and malabsorption.",
        discriminatingKeyFeature: "ANEURYSMAL DILATATION and larger, irregular nodules. Associated with bulky mesenteric lymphadenopathy.",
        associatedFindings: "Thickened folds and mucosal ulceration.",
        complicationsSeriousAlternatives: "Intussusception.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Peutz-Jeghers Syndrome",
        dominantImagingFinding: "Multiple large, hamartomatous polyps. Often pedunculated.",
        distributionLocation: "Small bowel (Jejunum common).",
        demographicsClinicalContext: "Mucocutaneous pigmentation (lips/buccal mucosa) and family history.",
        discriminatingKeyFeature: "LARGE SIZE (>1-3cm) and mucocutaneous pigmentation. High risk of intussusception.",
        associatedFindings: "Extra-intestinal malignancies (Breast, Ovary, Pancreas).",
        complicationsSeriousAlternatives: "Intussusception (Surgical emergency).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "‘MOTH-EATEN BONE’ IN AN ADULT",
    itemNumber: "1.18",
    problemCluster: "moth-eaten bone",
    seriousAlternatives: ["Osteomyelitis", "Multiple Myeloma", "Metastasis", "Lymphoma"],
    differentials: [
      {
        diagnosis: "Lytic Metastasis",
        dominantImagingFinding: "Multiple, poorly defined lucent areas. CORTICAL DESTRUCTION and pathological fractures common.",
        distributionLocation: "Axial skeleton and proximal appendicular. Characteristically involves the pedicles.",
        demographicsClinicalContext: "Adults >50y. Known primary (Lung, Breast, Renal). Progressive pain.",
        discriminatingKeyFeature: "PEDICLE DESTRUCTION and multiple disparate lesions. Intensely hot on bone scan (unless RCC/Thyroid).",
        associatedFindings: "Large soft tissue mass if aggressive.",
        complicationsSeriousAlternatives: "Spinal cord compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multiple Myeloma",
        dominantImagingFinding: "Innumerable, small, well-defined 'PUNCHED-OUT' lucencies. Discretely marginated.",
        distributionLocation: "Skull (Raindrop), Spine, Pelvis. Spares pedicles early.",
        demographicsClinicalContext: "Elderly. Anaemia, hypercalcaemia, and renal failure.",
        discriminatingKeyFeature: "PUNCHED-OUT appearance and COLD bone scan (70%). Marrow replacement on MRI (Low T1).",
        associatedFindings: "Diffuse osteopenia.",
        complicationsSeriousAlternatives: "Amyloidosis and renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Acute Osteomyelitis",
        dominantImagingFinding: "Rapidly progressive moth-eaten destruction. Lacks significant sclerosis early on.",
        distributionLocation: "Variable. Often post-traumatic or near a joint.",
        demographicsClinicalContext: "Acute fever, focal pain, and high CRP. IVDU or diabetic.",
        discriminatingKeyFeature: "RAPID CHANGE (<48-72h) and SEQUESTRA (dead bone). Unlike tumors, crosses the joint space if septic arthritis co-exists.",
        associatedFindings: "Soft tissue swelling and blurring of fat planes.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Primary Bone Lymphoma",
        dominantImagingFinding: "Extensive moth-eaten or permeative destruction with a HUGE soft tissue mass but MINIMAL cortical destruction.",
        distributionLocation: "Long bone diaphysis (Femur common).",
        demographicsClinicalContext: "Adults 40-60y. Systemically well despite extensive bone involvement.",
        discriminatingKeyFeature: "HUGE SOFT TISSUE MASS with preserved cortex. The 'Sequestrum' of lymphoma is rare.",
        associatedFindings: "Regional lymphadenopathy.",
        complicationsSeriousAlternatives: "Systemic NHL.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "FOCAL RIB LESION (SOLITARY OR MULTIPLE)",
    itemNumber: "1.33",
    problemCluster: "rib lesion",
    seriousAlternatives: ["Metastasis", "Multiple Myeloma", "Fibrous Dysplasia", "Fracture"],
    differentials: [
      {
        diagnosis: "Rib Metastasis",
        dominantImagingFinding: "Aggressive lytic destruction of a rib segment. Associated soft tissue mass. Expansion if RCC/Thyroid.",
        distributionLocation: "Any rib. Often multiple.",
        demographicsClinicalContext: "Older adults. Known primary cancer.",
        discriminatingKeyFeature: "CORTICAL DESTRUCTION and 'Hot' bone scan. Disparate sizes.",
        associatedFindings: "Pleural effusion.",
        complicationsSeriousAlternatives: "Pain and pathological fracture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multiple Myeloma",
        dominantImagingFinding: "Multiple expansile lytic lesions. 'Soap-bubble' appearance in the ribs.",
        distributionLocation: "Multiple ribs. Bilateral.",
        demographicsClinicalContext: "Elderly. Bence-Jones proteinuria.",
        discriminatingKeyFeature: "SOAP-BUBBLE expansion and lack of hot spots on bone scan.",
        associatedFindings: "Generalized osteopenia.",
        complicationsSeriousAlternatives: "Respiratory failure from multiple fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Fibrous Dysplasia (Monostotic)",
        dominantImagingFinding: "Well-defined, GROUND-GLASS expansile lesion. Thin sclerotic rim.",
        distributionLocation: "Typically involves a long segment of a single rib.",
        demographicsClinicalContext: "Young adults. Often asymptomatic incidental finding.",
        discriminatingKeyFeature: "GROUND-GLASS matrix and smooth expansion. No soft tissue mass or periosteal reaction.",
        associatedFindings: "McCune-Albright syndrome if polyostotic.",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Healing Rib Fracture",
        dominantImagingFinding: "Focal expansion due to CALLUS formation. Linear lucent fracture line may be visible.",
        distributionLocation: "Often 4th-9th ribs, lateral or posterior.",
        demographicsClinicalContext: "History of trauma or chronic cough. Sequential ribs.",
        discriminatingKeyFeature: "LINEAR alignment: Multiple fractures in a line (vertical) are characteristic of trauma. Presence of callus.",
        associatedFindings: "Pleural thickening.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "I NTRA-ABDOMINAL CALCIFICATIONS IN THE NEWBORN",
    itemNumber: "14.48",
    problemCluster: "neonatal abdominal calcification",
    seriousAlternatives: ["Meconium Peritonitis", "Neuroblastoma", "Hepatoblastoma"],
    differentials: [
      {
        diagnosis: "Meconium Peritonitis",
        dominantImagingFinding: "Scattered punctate or linear calcifications throughout the peritoneum. Scrotal calcification.",
        distributionLocation: "Diffuse peritoneal or localized (pseudocyst).",
        demographicsClinicalContext: "Neonates. History of in-utero bowel perforation (often secondary to CF).",
        discriminatingKeyFeature: "SCROTAL CALCIFICATION (100% specific): Meconium tracks through the patent processus vaginalis.",
        associatedFindings: "Dilated bowel loops (obstruction) and ascites.",
        complicationsSeriousAlternatives: "Bowel obstruction.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Neuroblastoma (Adrenal)",
        dominantImagingFinding: "Large adrenal mass with fine, stippled calcifications (90%).",
        distributionLocation: "Adrenal gland. Retroperitoneum.",
        demographicsClinicalContext: "Infants. Most common neonatal malignancy.",
        discriminatingKeyFeature: "MASS-LIKE calcification and vessel encasement. Displaces the kidney.",
        associatedFindings: "High urinary catecholamines.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Portal Vein Thrombus (Healing)",
        dominantImagingFinding: "Linear branching calcification in the expected position of the portal vein.",
        distributionLocation: "Porta hepatis and liver intrahepatic branches.",
        demographicsClinicalContext: "History of umbilical vein catheterization in the NICU.",
        discriminatingKeyFeature: "LINEAR BRANCHING pattern following the portal vessels. Lacks a soft tissue mass.",
        associatedFindings: "Portal hypertension signs later in life.",
        complicationsSeriousAlternatives: "Cavernous transformation of the portal vein.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "A BNORMALITIES OF BOWEL ROTATION",
    itemNumber: "14.49",
    problemCluster: "malrotation",
    seriousAlternatives: ["Midgut Volvulus (EMERGENCY)", "Non-rotation", "Internal Hernia"],
    differentials: [
      {
        diagnosis: "Midgut Volvulus",
        dominantImagingFinding: "CORKSCREW appearance of the distal duodenum. Gasless abdomen.",
        distributionLocation: "Midgut.",
        demographicsClinicalContext: "Neonates with bilious vomiting. 75% occur in the first month.",
        discriminatingKeyFeature: "WHIRLPOOL SIGN on Doppler US: SMA and SMV are twisted. DJ flexure is displaced.",
        associatedFindings: "Right-sided caecum.",
        complicationsSeriousAlternatives: "Total midgut necrosis (FATAL).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Non-rotation",
        dominantImagingFinding: "Small bowel is entirely on the RIGHT; colon is entirely on the LEFT.",
        distributionLocation: "Generalised.",
        demographicsClinicalContext: "Usually an asymptomatic incidental finding in adults.",
        discriminatingKeyFeature: "STRICT LATERALIZATION: The bowel is simply on the wrong side, but not twisted or obstructed.",
        associatedFindings: "Incidental finding on CT.",
        complicationsSeriousAlternatives: "None usually.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Congenital Ladd's Bands",
        dominantImagingFinding: "Extrinsic obstruction of the second part of the duodenum.",
        distributionLocation: "Duodenum.",
        demographicsClinicalContext: "Infants with intermittent vomiting.",
        discriminatingKeyFeature: "FOCAL DUODENAL OBSTRUCTION by peritoneal bands (Ladd's bands) crossing from the malpositioned caecum.",
        associatedFindings: "High-positioned caecum.",
        complicationsSeriousAlternatives: "Volvulus risk.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "URETERIC FILLING DEFECTS",
    itemNumber: "7.32",
    problemCluster: "ureteric filling defect",
    seriousAlternatives: ["Transitional Cell Carcinoma (TCC)", "Calculus (Non-opaque)", "Blood Clot"],
    differentials: [
      {
        diagnosis: "Transitional Cell Carcinoma (TCC)",
        dominantImagingFinding: "Irregular filling defect with GOBLET SIGN (dilatation below the lesion).",
        distributionLocation: "Usually distal third of the ureter.",
        demographicsClinicalContext: "Older adults. Smokers. Painless haematuria.",
        discriminatingKeyFeature: "GOBLET SIGN: The ureter is dilated below the mass because the tumor slowly expands the wall. Calculi typically show narrowing below.",
        associatedFindings: "Synchronous bladder tumors (40%).",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ureteric Calculus (Non-opaque)",
        dominantImagingFinding: "Smooth filling defect. Narrowed ureter below the stone. Rim sign on CT.",
        distributionLocation: "Point of narrowing (VUJ, Pelvic brim).",
        demographicsClinicalContext: "Acute loin-to-groin pain and microscopic haematuria.",
        discriminatingKeyFeature: "ABRUPT transition and absence of the goblet sign. Highly dense on CT (>400 HU) even if non-opaque on X-ray.",
        associatedFindings: "Hydronephrosis.",
        complicationsSeriousAlternatives: "Pyonephrosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Blood Clot",
        dominantImagingFinding: "Malleable, changing filling defect on sequential films.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "Post-biopsy, trauma, or associated with a proximal renal tumor.",
        discriminatingKeyFeature: "CHANGEABILITY: Clots move and change shape between views. No enhancement on CT.",
        associatedFindings: "Renal mass (if clot is from a tumor).",
        complicationsSeriousAlternatives: "Ureteric obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "THICKENED FOLDS IN NON-DILATED",
    itemNumber: "6.17",
    problemCluster: "thickened ileal folds",
    seriousAlternatives: ["Crohn's Disease", "Lymphoma", "Infectious Ileitis (Yersinia)"],
    differentials: [
      {
        diagnosis: "Crohn's Disease (Active)",
        dominantImagingFinding: "Irregular thickening of the ileal folds with mucosal ulceration. COBBLESTONE appearance.",
        distributionLocation: "Terminal Ileum focus. Skip lesions.",
        demographicsClinicalContext: "Young adults. Diarrhea and weight loss.",
        discriminatingKeyFeature: "SKIP LESIONS and asymmetric involvement. Associated with 'Creeping Fat' on CT.",
        associatedFindings: "Fistulae and abscesses.",
        complicationsSeriousAlternatives: "Stricture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Infectious Ileitis (Yersinia/TB)",
        dominantImagingFinding: "Symmetric thickening of the folds. Enlarged mesenteric nodes.",
        distributionLocation: "Terminal ileum.",
        demographicsClinicalContext: "Acute onset diarrhea and RLQ pain (pseudo-appendicitis).",
        discriminatingKeyFeature: "ACUTE presentation and resolution on follow-up. Nodes are often smaller than in lymphoma.",
        associatedFindings: "Normal DJ flexure (unlike Crohn's).",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Small Bowel Lymphoma",
        dominantImagingFinding: "Massive mural thickening (>2cm) with ANEURYSMAL DILATATION.",
        distributionLocation: "Ileum.",
        demographicsClinicalContext: "Adults. B-symptoms.",
        discriminatingKeyFeature: "ANEURYSMAL DILATATION: Unlike the narrowing of Crohn's, lymphoma widens the lumen.",
        associatedFindings: "Massive mesenteric nodes.",
        complicationsSeriousAlternatives: "Perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 5 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_5_DATA) {
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
  console.log("Batch 5 Complete!");
}

main().catch(console.error);