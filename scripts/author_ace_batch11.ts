import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_11_DATA = [
  {
    pattern: "SOLITARY EXPANSILE BONE LESION",
    itemNumber: "1.34",
    problemCluster: "expansile bone mass",
    seriousAlternatives: ["Aneurysmal Bone Cyst (ABC)", "Giant Cell Tumor (GCT)", "Metastasis (RCC/Thyroid)", "Plasmacytoma"],
    differentials: [
      {
        diagnosis: "Aneurysmal Bone Cyst (ABC)",
        dominantImagingFinding: "Geographic lytic lesion with extreme cortical 'BLOW-OUT'. FLUID-FLUID LEVELS (100% on MRI).",
        distributionLocation: "Metaphysis of long bones (80%) or posterior elements of the spine.",
        demographicsClinicalContext: "Children and young adults (<20y). Pain and rapid swelling.",
        discriminatingKeyFeature: "FLUID-FLUID LEVELS and blow-out expansion in a SKELETALLY IMMATURE patient.",
        associatedFindings: "Thin eggshell-like subperiosteal bone shell.",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Giant Cell Tumor (GCT)",
        dominantImagingFinding: "Expansile lytic lesion extending to the SUBARTICULAR surface. Non-sclerotic margins.",
        distributionLocation: "Epiphysis/Metaphysis of long bones (Knee common).",
        demographicsClinicalContext: "Young adults (20-40y). SKELETALLY MATURE (closed physis).",
        discriminatingKeyFeature: "SUBARTICULAR extension and CLOSED PHYSIS. 20% also show fluid-fluid levels (secondary ABC).",
        associatedFindings: "No sclerotic rim (unlike chondroblastoma).",
        complicationsSeriousAlternatives: "Malignant GCT (rare).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Plasmacytoma",
        dominantImagingFinding: "Highly expansile, 'SOAP-BUBBLE' lytic lesion. No matrix calcification.",
        distributionLocation: "Axial skeleton (Spine, Pelvis) or Ribs.",
        demographicsClinicalContext: "Older adults (>50y). Solitary focus of Multiple Myeloma.",
        discriminatingKeyFeature: "AGE and SOAP-BUBBLE appearance in the axial skeleton. Lacks the red-hot uptake of a metastasis on bone scan.",
        associatedFindings: "M-protein peak.",
        complicationsSeriousAlternatives: "Progression to Multiple Myeloma.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Renal / Thyroid Metastasis",
        dominantImagingFinding: "Aggressively expansile lytic mass. Destruction of the cortex.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "Adults. Known primary RCC or Thyroid CA.",
        discriminatingKeyFeature: "HYPERVASCULAR: Extreme enhancement on CT/MRI. Known primary malignancy. Intensely hot on bone scan.",
        associatedFindings: "Pulsatile mass on exam.",
        complicationsSeriousAlternatives: "Massive haemorrhage during biopsy.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "C ALCIFIED LOOSE BODY (SINGLE OR MULTIPLE) IN a JOINT",
    itemNumber: "3.10",
    problemCluster: "joint loose bodies",
    seriousAlternatives: ["Synovial Chondromatosis", "Osteochondritis Dissecans (OCD)", "Osteoarthritis (Detached Osteophyte)"],
    differentials: [
      {
        diagnosis: "Primary Synovial Chondromatosis",
        dominantImagingFinding: "INNUMERABLE (dozens), uniform-sized, small calcified bodies within the joint and its recesses.",
        distributionLocation: "Knee (70%), Hip, Shoulder. Characteristically monarticular.",
        demographicsClinicalContext: "Young adults. Recurrent swelling and locking of the joint.",
        discriminatingKeyFeature: "MULTIPLICITY and UNIFORMITY: All bodies are roughly the same size. Lacks significant OA early on.",
        associatedFindings: "Pressure erosions on both sides of the joint.",
        complicationsSeriousAlternatives: "Secondary osteoarthritis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteochondritis Dissecans (OCD)",
        dominantImagingFinding: "Focal subchondral bone defect with a matching calcified body ('Joint Mouse') in the joint space.",
        distributionLocation: "LATERAL aspect of the MEDIAL FEMORAL CONDYLE (85%).",
        demographicsClinicalContext: "Adolescents or young athletes. Focal pain and locking.",
        discriminatingKeyFeature: "FOCAL DEFECT: Presence of a parent crater in the subchondral bone. Usually solitary or 2-3 bodies.",
        associatedFindings: "T2-bright fluid rim around the fragment (sign of instability).",
        complicationsSeriousAlternatives: "Articular collapse.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Osteoarthritis (Secondary Chondromatosis)",
        dominantImagingFinding: "Few (usually <5), VARYING SIZED loose bodies. Significant joint space narrowing and osteophytes.",
        distributionLocation: "Any joint with severe OA.",
        demographicsClinicalContext: "Elderly patients with mechanical pain.",
        discriminatingKeyFeature: "ASSOCIATED OA: Presence of osteophytes, sclerosis, and joint narrowing. Bodies represent detached osteophytes.",
        associatedFindings: "Subchondral cysts.",
        complicationsSeriousAlternatives: "Joint locking.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "N ON-THROMBOTIC PULMONARY EMBOLI",
    itemNumber: "4.20",
    problemCluster: "atypical PE",
    seriousAlternatives: ["Fat Embolism", "Air Embolism", "Septic Embolism", "Amniotic Fluid Embolism"],
    differentials: [
      {
        diagnosis: "Fat Embolism Syndrome",
        dominantImagingFinding: "Diffuse ground-glass opacities or fine 'snowstorm' nodules appearing 24-72h after injury. Normal pulmonary arteries.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Classic triad: 1) Respiratory distress, 2) Cerebral signs (confusion), 3) PETECHIAL RASH. Follows LONG BONE FRACTURE (Femur).",
        discriminatingKeyFeature: "TEMPORAL RELATION: Occurs 1-3 days after major orthopedic trauma. CT Angio is typically NEGATIVE for macro-thrombi.",
        associatedFindings: "Lipiduria.",
        complicationsSeriousAlternatives: "ARDS.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Air Embolism",
        dominantImagingFinding: "Gas lucencies within the RIGHT HEART or pulmonary artery trunk. Patchy consolidation.",
        distributionLocation: "Right ventricle and main pulmonary arteries.",
        demographicsClinicalContext: "Iatrogenic (Central line insertion/removal), trauma, or diving (Bends).",
        discriminatingKeyFeature: "GAS LUCENCY: CT shows air bubbles in the vascular system. Mill-wheel murmur on auscultation.",
        associatedFindings: "Pneumothorax.",
        complicationsSeriousAlternatives: "Acute right heart failure and death (EMERGENCY).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Septic Embolism",
        dominantImagingFinding: "Multiple small, peripheral nodules with CAVITATION (50%). FEEDING VESSEL SIGN.",
        distributionLocation: "Peripheral and basal predominance (Subpleural).",
        demographicsClinicalContext: "IVDU, indwelling catheters, or tricuspid endocarditis. Sepsis.",
        discriminatingKeyFeature: "FEEDING VESSEL sign and RAPID cavitation. Sepsis context differentiates from cancer metastases.",
        associatedFindings: "Tricuspid valve vegetations on echo.",
        complicationsSeriousAlternatives: "Empyema and pneumothorax.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "OESOPHAGEAL NARROWING",
    itemNumber: "6.5",
    problemCluster: "oesophageal stricture",
    seriousAlternatives: ["Achalasia", "Oesophageal Carcinoma", "Peptic Stricture", "Pharyngeal Pouch"],
    differentials: [
      {
        diagnosis: "Oesophageal Carcinoma (SCC/Adeno)",
        dominantImagingFinding: "Short-segment, irregular stricture with SHOULDERED MARGINS ('Apple-core'). Mucosal destruction.",
        distributionLocation: "Upper/Mid (SCC - smokers) or Distal (Adeno - Barrett's).",
        demographicsClinicalContext: "Elderly. Progressive dysphagia (solids then liquids) and weight loss.",
        discriminatingKeyFeature: "SHOULDERED MARGINS and abrupt transition. Malignant until proven otherwise. Lacks the smooth 'bird-beak' of achalasia.",
        associatedFindings: "Tracheo-oesophageal fistula and nodal metastases.",
        complicationsSeriousAlternatives: "Aspiration.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Achalasia (Primary)",
        dominantImagingFinding: "Smooth, tapered narrowing of the distal oesophagus ('BIRD-BEAK' sign). Massive proximal dilatation (Mega-oesophagus).",
        distributionLocation: "Lower oesophageal sphincter (LOS).",
        demographicsClinicalContext: "Young to middle-aged. Intermittent dysphagia (liquids may be worse than solids). Regurgitation.",
        discriminatingKeyFeature: "BIRD-BEAK appearance and ABSENT primary peristalsis. Retained food/fluid level. No mucosal destruction.",
        associatedFindings: "Absent gastric air bubble.",
        complicationsSeriousAlternatives: "Aspiration pneumonia.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Peptic Stricture (Reflux)",
        dominantImagingFinding: "Smooth, concentric, tapered stricture. Usually 1-4cm long.",
        distributionLocation: "Distal third, always starting at the GOJ.",
        demographicsClinicalContext: "Chronic GORD history. Heartburn.",
        discriminatingKeyFeature: "CONTIGUITY with the GOJ and associated Hiatus Hernia. Lacks the irregularity of carcinoma.",
        associatedFindings: "Barrett's oesophagus.",
        complicationsSeriousAlternatives: "Complete obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Oesophageal Web / Ring (Schatzki)",
        dominantImagingFinding: "Thin (1-2mm) shelf-like diaphragm crossing the lumen. 'B-ring'.",
        distributionLocation: "Lower oesophagus (Schatzki) or Upper (Plummer-Vinson).",
        demographicsClinicalContext: "Sudden onset dysphagia with a large bolus ('Steakhouse Syndrome').",
        discriminatingKeyFeature: "THINNESS: A sharp, thin ring. Lacks the long-segment narrowing of other strictures.",
        associatedFindings: "Iron deficiency anaemia (Plummer-Vinson).",
        complicationsSeriousAlternatives: "Bolus obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "BLADDER FILLING DEFECTS",
    itemNumber: "8.4",
    problemCluster: "bladder opacity",
    seriousAlternatives: ["Bladder Carcinoma (TCC)", "Calculus", "Blood Clot", "Prostate Enlargement"],
    differentials: [
      {
        diagnosis: "Transitional Cell Carcinoma (TCC)",
        dominantImagingFinding: "Irregular, lobulated filling defect fixed to the wall. 'FROSTED-FLAKES' or 'CAULIFLOWER' appearance.",
        distributionLocation: "Variable. Trigone and lateral walls common.",
        demographicsClinicalContext: "Older adults. Smokers. Painless haematuria.",
        discriminatingKeyFeature: "FIXED position: The mass does not move when the patient's position is changed. Shows internal flow on Doppler US.",
        associatedFindings: "Hydronephrosis (from VUJ obstruction).",
        complicationsSeriousAlternatives: "Local invasion.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Bladder Calculus",
        dominantImagingFinding: "Mobile, highly dense filling defect. Often faceted or 'JACKSTONE' appearance.",
        distributionLocation: "Dependent part of the bladder.",
        demographicsClinicalContext: "Elderly males with urinary stasis (BPH). Chronic cystitis.",
        discriminatingKeyFeature: "MOBILITY: The stone moves to the dependent wall on decubitus views. Highly dense on CT (>500 HU).",
        associatedFindings: "Bladder wall trabeculation.",
        complicationsSeriousAlternatives: "Haematuria and infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Blood Clot",
        dominantImagingFinding: "Irregular, 'shaggy' filling defect. Malleable shape.",
        distributionLocation: "Variable. Often settles in the dependent portion.",
        demographicsClinicalContext: "Recent trauma, biopsy, or associated renal tumor. Gross haematuria.",
        discriminatingKeyFeature: "MALLEABILITY: The clot changes shape between views and lacks internal flow on Doppler. No enhancement on CT.",
        associatedFindings: "Renal mass (source of bleed).",
        complicationsSeriousAlternatives: "Clot retention (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Prostate Enlargement (Median Lobe)",
        dominantImagingFinding: "Smooth filling defect at the bladder base. 'J-shaped' or 'Fish-hook' ureters.",
        distributionLocation: "Bladder base (Trigone).",
        demographicsClinicalContext: "Elderly males with hesitancy.",
        discriminatingKeyFeature: "LOCATION: Centered exactly at the bladder neck. Continuous with the prostate on US/MRI.",
        associatedFindings: "Thickened bladder wall.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "SOLITARY RING-ENHANCING LESION",
    itemNumber: "12.1",
    problemCluster: "brain ring mass",
    seriousAlternatives: ["Abscess (URGENT)", "Glioblastoma", "Solitary Metastasis", "Tumefactive MS"],
    differentials: [
      {
        diagnosis: "Cerebral Abscess",
        dominantImagingFinding: "Thin, smooth, uniform ring enhancement. The wall is characteristically THINNER ON THE VENTRICULAR SIDE.",
        distributionLocation: "Variable. Often frontal or temporal lobes.",
        demographicsClinicalContext: "Acute fever, headache, and focal deficit. Sepsis source.",
        discriminatingKeyFeature: "CENTRAL RESTRICTED DIFFUSION (DWI High, ADC Dark): 100% specific for pyogenic abscess. Double-rim sign on SWI.",
        associatedFindings: "Satellite lesions and ventriculitis.",
        complicationsSeriousAlternatives: "Rupture into the ventricle (FATAL).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Glioblastoma (GBM)",
        dominantImagingFinding: "Thick, irregular, 'SHAGGY' ring enhancement with a necrotic center. Profound mass effect.",
        distributionLocation: "Supratentorial. Invades across the corpus callosum (Butterfly Glioma).",
        demographicsClinicalContext: "Adults (50-70y). Rapid decline.",
        discriminatingKeyFeature: "THICK SHAGGY WALL and crossing of midline. High choline and high lactate on MRS. Peripheral DWI restriction only.",
        associatedFindings: "Vaseogenic oedema.",
        complicationsSeriousAlternatives: "Herniation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Tumefactive MS",
        dominantImagingFinding: "Large (>2cm) white matter lesion with an 'OPEN RING' sign (Incomplete ring).",
        distributionLocation: "Subcortical white matter.",
        demographicsClinicalContext: "Young adults. Mimics tumor clinically.",
        discriminatingKeyFeature: "OPEN RING sign: The ring of enhancement is incomplete, with the gap characteristically facing the grey matter/cortex.",
        associatedFindings: "Other MS plaques.",
        complicationsSeriousAlternatives: "Neurological deficit.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "H YPERECHOIC LESIONS IN THE BASAL GANGLIA ON CRANIAL ULTRASOUND OF NEONATES AND INFANTS",
    itemNumber: "14.66",
    problemCluster: "neonatal US deep grey",
    seriousAlternatives: ["Hypoxic-Ischaemic Encephalopathy (HIE)", "TORCH Infections", "Thalamic Haemorrhage"],
    differentials: [
      {
        diagnosis: "Hypoxic-Ischaemic Encephalopathy (HIE)",
        dominantImagingFinding: "Diffuse increased echogenicity of the basal ganglia and thalami. Loss of normal structural detail.",
        distributionLocation: "Bilateral and symmetric. BG and Thalamus.",
        demographicsClinicalContext: "TERM neonates with perinatal asphyxia (Low Apgars).",
        discriminatingKeyFeature: "SYMMETRY and lack of calcification (initially). US shows slit-like ventricles (oedema) and global brain density.",
        associatedFindings: "Reversal of flow on Doppler (high RI).",
        complicationsSeriousAlternatives: "Cerebral palsy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Congenital CMV (Infection)",
        dominantImagingFinding: "Bright branching echogenic lines in the basal ganglia ('LENTICULOSTRIATE VASCULOPATHY').",
        distributionLocation: "Basal ganglia and thalami.",
        demographicsClinicalContext: "Neonates with microcephaly and jaundice.",
        discriminatingKeyFeature: "BRANCHING VASCULOPATHY: The echogenicity follows the vessels. Associated with PERIVENTRICULAR calcifications.",
        associatedFindings: "Germinolytic cysts and polymicrogyria.",
        complicationsSeriousAlternatives: "Hearing loss.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Thalamic Haemorrhage",
        dominantImagingFinding: "Focal, intensely hyperechoic mass within the thalamus.",
        distributionLocation: "Thalamus. Often UNILATERAL.",
        demographicsClinicalContext: "Preterm or Term neonates. Sudden neurological drop.",
        discriminatingKeyFeature: "UNILATERALITY and focal mass-like appearance. Shrinks and becomes cystic over time.",
        associatedFindings: "Intraventricular extension.",
        complicationsSeriousAlternatives: "Hydrocephalus.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "VAGINA",
    itemNumber: "13.1",
    problemCluster: "vaginal mass",
    seriousAlternatives: ["Gartner Duct Cyst", "Vaginal Rhabdomyosarcoma (Child)", "Vaginal Carcinoma (Adult)", "Müllerian Agenesis"],
    differentials: [
      {
        diagnosis: "Gartner Duct Cyst",
        dominantImagingFinding: "Simple, thin-walled cyst within the vaginal wall. Usually <2cm.",
        distributionLocation: "ANTEROLATERAL wall of the vagina, ABOVE the level of the pubic symphysis.",
        demographicsClinicalContext: "Asymptomatic incidental finding in adults.",
        discriminatingKeyFeature: "ANTEROLATERAL location. Represents a remnant of the Wolffian (Mesonephric) duct.",
        associatedFindings: "Associated with renal anomalies (ipsilateral agenesis).",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Rhabdomyosarcoma (Sarcoma Botryoides)",
        dominantImagingFinding: "Multiple 'GRAPE-LIKE' solid masses filling and distending the vagina.",
        distributionLocation: "Vagina focus. Invades the bladder base/rectum.",
        demographicsClinicalContext: "Young girls (<5 years). Bloody vaginal discharge or protruding mass.",
        discriminatingKeyFeature: "GRAPE-LIKE appearance and CHILDHOOD context. Most common vaginal malignancy in children.",
        associatedFindings: "Massive local invasion.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Müllerian Agenesis (MRKH Syndrome)",
        dominantImagingFinding: "Absolute absence of the vagina and uterus. Normal ovaries.",
        distributionLocation: "Pelvis.",
        demographicsClinicalContext: "Young females with primary amenorrhoea. Normal secondary sexual features.",
        discriminatingKeyFeature: "ABSENCE of uterus/vagina with NORMAL OVARIES (which are non-Müllerian).",
        associatedFindings: "Renal agenesis (40%) and skeletal defects.",
        complicationsSeriousAlternatives: "Infertility.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "T EMPORAL BONE SCLEROSIS",
    itemNumber: "12.45",
    problemCluster: "dense temporal bone",
    seriousAlternatives: ["Chronic Mastoiditis", "Paget's Disease", "Osteopetrosis", "Fibrous Dysplasia"],
    differentials: [
      {
        diagnosis: "Chronic Mastoiditis",
        dominantImagingFinding: "Increased density and opacification of the mastoid air cells. LOSS of normal septations (Sclerosis).",
        distributionLocation: "Mastoid process. Often associated with middle ear disease.",
        demographicsClinicalContext: "Recurrent ear infections and discharge. Hearing loss.",
        discriminatingKeyFeature: "LOSS OF SEPTATIONS: Chronic infection leads to bony remodeling and obliteration of the air cells. Lacks bone expansion.",
        associatedFindings: "Cholesteatoma (bone erosion).",
        complicationsSeriousAlternatives: "Transverse sinus thrombosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paget's Disease (Temporal)",
        dominantImagingFinding: "Profound cortical thickening and trabecular coarsening. BONE ENLARGEMENT.",
        distributionLocation: "Petrous temporal bone. Bilateral and symmetric common.",
        demographicsClinicalContext: "Elderly. Progressive sensorineural hearing loss.",
        discriminatingKeyFeature: "BONE ENLARGEMENT: Unlike mastoiditis, Paget's expands the bone outline and narrows the IAC/EAC.",
        associatedFindings: "Cotton-wool skull.",
        complicationsSeriousAlternatives: "Deafness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Osteopetrosis (Marble Bone)",
        dominantImagingFinding: "EXTREME uniform sclerosis of the entire temporal bone. Loss of medullary space.",
        distributionLocation: "Bilateral and symmetric. Generalized skull base focus.",
        demographicsClinicalContext: "Failure to thrive (AR) or asymptomatic (AD).",
        discriminatingKeyFeature: "EXTREME DENSITY: The bone is uniformly chalk-white. Associated with a 'Bone-in-Bone' appearance elsewhere.",
        associatedFindings: "Cranial nerve palsies.",
        complicationsSeriousAlternatives: "Pancytopenia.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "H YPERLUCENT HEMITHORAX",
    itemNumber: "4.3",
    problemCluster: "hypertransradiant lung",
    seriousAlternatives: ["Pneumothorax (Visceral Line)", "Swyer-James (Small Hilum)", "Mastectomy (Absent fold)", "Large Bulla"],
    differentials: [
      {
        diagnosis: "Pneumothorax",
        dominantImagingFinding: "VISCERAL PLEURAL LINE visible. Absolute absence of lung markings (vessels) beyond the line.",
        distributionLocation: "Apical or lateral. Hemithorax volume may be normal or increased.",
        demographicsClinicalContext: "Acute onset pleuritic pain and dyspnoea. Trauma or spontaneous.",
        discriminatingKeyFeature: "VISIBLE VISCERAL PLEURA: This is the most specific sign. Bullae have a curvilinear wall but usually don't follow the chest wall perfectly.",
        associatedFindings: "Contralateral shift if TENSION (EMERGENCY).",
        complicationsSeriousAlternatives: "Cardiovascular collapse.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Swyer-James (Macleod) Syndrome",
        dominantImagingFinding: "SMALL LUNG (100% specific) showing hyperlucency. Characteristically small hilum.",
        distributionLocation: "Unilateral lung or lobe.",
        demographicsClinicalContext: "Childhood bronchiolitis history. Often asymptomatic adult.",
        discriminatingKeyFeature: "AIR TRAPPING on expiration and a SMALL HILUM. Pneumothorax doesn't show air trapping in this specific pattern.",
        associatedFindings: "Bronchiectasis.",
        complicationsSeriousAlternatives: "Infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mastectomy",
        dominantImagingFinding: "Apparent hyperlucency due to loss of soft tissue density. Normal lung markings.",
        distributionLocation: "Entire hemithorax field.",
        demographicsClinicalContext: "Prior Breast Cancer surgery.",
        discriminatingKeyFeature: "ABSENT AXILLARY FOLD: Comparing the two sides, the axillary fold is missing on the lucent side. Lung vascularity is normal.",
        associatedFindings: "Surgical clips.",
        complicationsSeriousAlternatives: "Recurrence.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 11 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_11_DATA) {
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
  console.log("Batch 11 Complete!");
}

main().catch(console.error);