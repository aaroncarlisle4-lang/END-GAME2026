import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) throw new Error("Missing CONVEX_URL");

const client = new ConvexHttpClient(CONVEX_URL);

// Batch 1: Chest, GI, GU, Paeds (A-star Dahnert quality)
const updates = [
  {
    pattern: "Upper lobe fibrosis",
    newDiffs: [
      {
        diagnosis: "Radiation Fibrosis",
        dominantImagingFinding: "GEOMETRIC opacification and severe volume loss. Traction bronchiectasis. Onset 6-12 months post-radiotherapy (100%).",
        distributionLocation: "Strictly confined to the RADIATION PORTAL. Does not respect lobar or segmental boundaries.",
        demographicsClinicalContext: "History of radiotherapy for breast cancer, lung cancer, or lymphoma.",
        discriminatingKeyFeature: "SHARP NON-ANATOMIC MARGIN corresponding to the treatment field edge. Significant volume loss.",
        associatedFindings: "Ipsilateral mediastinal shift and tenting of the diaphragm.",
        complicationsSeriousAlternatives: "Radiation-induced secondary malignancy (e.g. sarcoma) after a long latency.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Ankylosing Spondylitis",
        dominantImagingFinding: "APICAL fibrobullous disease (1-2% of AS patients). Thin-walled upper lobe cysts and progressive fibrosis.",
        distributionLocation: "Strictly APICAL and bilateral. Very similar in appearance to severe post-primary TB.",
        demographicsClinicalContext: "Young adult males (HLA-B27 positive). Chronic inflammatory back pain improving with exercise.",
        discriminatingKeyFeature: "BAMBOO SPINE (syndesmophytes) and bilateral sacroiliitis visible on the scout film or lower cuts.",
        associatedFindings: "Aortitis and uveitis. Restrictive lung pattern due to costovertebral joint fusion.",
        complicationsSeriousAlternatives: "Aspergilloma formation within the apical cavities.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Berylliosis",
        dominantImagingFinding: "Granulomatous disease indistinguishable from Sarcoidosis on imaging. Hilar nodes + nodules.",
        distributionLocation: "Upper lobe predominant fibrosis. Perilymphatic nodules.",
        demographicsClinicalContext: "OCCUPATIONAL HISTORY (100% specific): Aerospace, electronics, nuclear, or fluorescent lamp industries.",
        discriminatingKeyFeature: "OCCUPATIONAL EXPOSURE history and a positive Beryllium Lymphocyte Proliferation Test (BeLPT).",
        associatedFindings: "Hypercalcaemia and restrictive lung disease.",
        complicationsSeriousAlternatives: "Increased risk of lung cancer.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Coal worker's pneumoconiosis",
        dominantImagingFinding: "Coal macules (1-5mm) and progressive massive fibrosis (PMF).",
        distributionLocation: "Upper and posterior segments. Similar to silicosis.",
        demographicsClinicalContext: "History of coal mining. Often asymptomatic until PMF develops.",
        discriminatingKeyFeature: "LACK OF EGGSHELL CALCIFICATION (which is more typical of silicosis) but clinically identical PMF.",
        associatedFindings: "Caplan syndrome (if RA positive).",
        complicationsSeriousAlternatives: "Cor pulmonale in advanced disease.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Neonatal low bowel obstruction",
    newDiffs: [
      {
        diagnosis: "Meconium Plug Syndrome",
        dominantImagingFinding: "MULTIPLE filling defects (meconium plugs) within the colon. Contrast enema outlines the plugs.",
        distributionLocation: "LEFT COLON. Transition zone is characteristically at the SPLENIC FLEXURE.",
        demographicsClinicalContext: "High association with MATERNAL DIABETES (50%) or maternal use of magnesium sulfate.",
        discriminatingKeyFeature: "TRANSITION ZONE at splenic flexure (proximal colon dilated, descending colon small) and therapeutic resolution with enema.",
        associatedFindings: "Unlike Hirschsprung's, the rectum is of normal calibre relative to the distal colon.",
        complicationsSeriousAlternatives: "Failure to differentiate from Hirschsprung's disease (which requires biopsy to rule out).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Diffuse cystic ILD",
    newDiffs: [
      {
        diagnosis: "Neurofibromatosis (Type 1)",
        dominantImagingFinding: "UPPER LOBE BULLAE and thin-walled cysts. Bibasilar reticular opacities (fibrosis).",
        distributionLocation: "Asymmetric. Bullae in apices; fibrosis in the bases.",
        demographicsClinicalContext: "Diagnosis of NF1 (Café-au-lait spots, neurofibromas).",
        discriminatingKeyFeature: "Presence of posterior mediastinal masses (neurofibromas) or RIB NOTCHING/TWISTING on the same scan.",
        associatedFindings: "SKELETAL DEFORMITIES (scoliosis) and cutaneous neurofibromas seen on the chest wall.",
        complicationsSeriousAlternatives: "Malignant peripheral nerve sheath tumor (MPNST) transformation.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Reticulonodular shadowing",
    newDiffs: [
      {
        diagnosis: "Idiopathic pulmonary fibrosis",
        dominantImagingFinding: "HONEYCOMBING and traction bronchiectasis (100% specific for end-stage fibrosis). Reticular opacities.",
        distributionLocation: "BASAL and SUBPLEURAL predominance. Symmetrical.",
        demographicsClinicalContext: "Older adults (>60y). Progressive dyspnoea and fine end-inspiratory crackles.",
        discriminatingKeyFeature: "HONEYCOMB cysts in a basal/subpleural distribution. Absence of significant GGO or micronodules.",
        associatedFindings: "Volume loss in the lower lobes. Cor pulmonale in late stages.",
        complicationsSeriousAlternatives: "Progressive respiratory failure. Increased risk of lung cancer.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Vasculitis (GPA)",
        dominantImagingFinding: "Multiple nodules or masses, often CAVITATING. Ground-glass opacities (alveolar haemorrhage).",
        distributionLocation: "Random, bilateral distribution. Subpleural sparing can occur.",
        demographicsClinicalContext: "Sinusitis, renal disease (GN), and lung nodules (Triad). C-ANCA positive.",
        discriminatingKeyFeature: "CAVITATING nodules and concurrent renal/sinus disease. Rapid radiographic changes.",
        associatedFindings: "Air-space opacification if diffuse alveolar haemorrhage occurs.",
        complicationsSeriousAlternatives: "Diffuse alveolar haemorrhage (Medical Emergency).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Miliary nodules",
    newDiffs: [
      {
        diagnosis: "Miliary fungal infection",
        dominantImagingFinding: "Randomly distributed micronodules. Can resemble miliary TB exactly.",
        distributionLocation: "Diffuse, random. No zonal predilection.",
        demographicsClinicalContext: "Immunocompromised or endemic exposure (Histoplasmosis, Coccidioidomycosis).",
        discriminatingKeyFeature: "GEOGRAPHIC EXPOSURE history and negative TB cultures. Often calcifies rapidly as it heals.",
        associatedFindings: "Hepatosplenic calcified granulomas.",
        complicationsSeriousAlternatives: "Disseminated systemic fungal disease.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Calcified lung nodules",
    newDiffs: [
      {
        diagnosis: "Sarcoidosis",
        dominantImagingFinding: "PERILYMPHATIC micronodules. Can calcify in chronic stages (Stage IV).",
        distributionLocation: "UPPER/MID-ZONE predominance. Fissural and subpleural distribution.",
        demographicsClinicalContext: "Young adults. Erythema nodosum. Often asymptomatic.",
        discriminatingKeyFeature: "GALAXY SIGN and symmetric hilar/mediastinal lymphadenopathy (which may show eggshell calcification).",
        associatedFindings: "Outward hilar displacement (fibrosis).",
        complicationsSeriousAlternatives: "Pulmonary hypertension.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Mitral Stenosis (Pulmonary Ossification)",
        dominantImagingFinding: "DENDIRFORM or nodular pulmonary ossification (bone formation in the lungs).",
        distributionLocation: "LOWER LOBE predominance. Diffuse, tiny densely calcified nodules.",
        demographicsClinicalContext: "Chronic severe MITRAL STENOSIS (Rheumatic heart disease).",
        discriminatingKeyFeature: "Enlarged LEFT ATRIUM (splaying the carina) and signs of chronic pulmonary venous hypertension.",
        associatedFindings: "Mitral valve calcification. Kerley B lines.",
        complicationsSeriousAlternatives: "Severe right heart failure and atrial fibrillation.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Large cavitating lesion",
    newDiffs: [
      {
        diagnosis: "Cavitating Metastasis",
        dominantImagingFinding: "THICK or irregular walled cavities. Often MULTIPLE.",
        distributionLocation: "Random distribution, often subpleural or basal.",
        demographicsClinicalContext: "Known primary SQUAMOUS CELL CA (Head/Neck, Cervix) or GI tract.",
        discriminatingKeyFeature: "MULTIPLE cavitating lesions in a patient with a known squamous cell primary.",
        associatedFindings: "Lung nodules of disparate sizes. Pleural effusions.",
        complicationsSeriousAlternatives: "Pneumothorax if a subpleural cavity ruptures.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Pleural lesions",
    newDiffs: [
      {
        diagnosis: "Solitary Fibrous Tumour (SFT)",
        dominantImagingFinding: "LARGE, well-defined solid pleural mass. Often lobulated.",
        distributionLocation: "Arises from the visceral pleura. Can be highly mobile (pedunculated).",
        demographicsClinicalContext: "Adults. Often incidental. Can cause hypoglycaemia (Doege-Potter syndrome).",
        discriminatingKeyFeature: "SOLITARY, massive size without significant pleural effusion or rib destruction. 'Wandering' mass on positional films.",
        associatedFindings: "Intense enhancement on CT. Hypertrophic osteoarthropathy (HOA).",
        complicationsSeriousAlternatives: "Malignant transformation (10-20% are malignant).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Hyperlucent hemithorax",
    newDiffs: [
      {
        diagnosis: "Airway Obstruction (Endobronchial)",
        dominantImagingFinding: "UNILATERAL hyperlucency due to air-trapping (Check-valve mechanism).",
        distributionLocation: "Affects the entire lung or a single lobe distal to the obstruction.",
        demographicsClinicalContext: "Child (Foreign body aspiration) or Adult (Endobronchial tumor/carcinoid).",
        discriminatingKeyFeature: "MEDIASTINAL SHIFT AWAY from the lucent lung on EXPIRATION. Normal volume on inspiration.",
        associatedFindings: "Visible endobronchial lesion on CT. Attenuation of pulmonary vessels due to hypoxic vasoconstriction.",
        complicationsSeriousAlternatives: "Complete obstruction leading to total lung collapse.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Opacified hemithorax",
    newDiffs: [
      {
        diagnosis: "Lung Agenesis / Hypoplasia",
        dominantImagingFinding: "TOTAL opacification with EXTREME volume loss. Absence of lung parenchyma and bronchi.",
        distributionLocation: "Unilateral. Compensatory hyperinflation of the contralateral lung crossing the midline.",
        demographicsClinicalContext: "Congenital. Often diagnosed in infancy. Can be asymptomatic if isolated.",
        discriminatingKeyFeature: "ABSENT ipsilateral pulmonary artery and main bronchus on CT.",
        associatedFindings: "Associated with VACTERL anomalies or congenital heart disease.",
        complicationsSeriousAlternatives: "Pulmonary hypertension in the single functioning lung.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Peripheral consolidation",
    newDiffs: [
      {
        diagnosis: "Vasculitis (e.g. Churg-Strauss)",
        dominantImagingFinding: "PATCHY, transient peripheral consolidation. Ground-glass opacities.",
        distributionLocation: "Peripheral predominance. Often migrating on serial imaging.",
        demographicsClinicalContext: "Adults. History of ASTHMA (100%), allergic rhinitis, and eosinophilia. P-ANCA positive.",
        discriminatingKeyFeature: "ASTHMA history combined with migrating peripheral opacities and systemic vasculitis.",
        associatedFindings: "Eosinophilic myocarditis or neuropathy.",
        complicationsSeriousAlternatives: "Cardiac involvement (major cause of mortality).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Bilateral consolidation",
    newDiffs: [
      {
        diagnosis: "ARDS (Acute Respiratory Distress Syndrome)",
        dominantImagingFinding: "DIFFUSE, bilateral alveolar opacities. Often heterogeneous or patchy initially, becoming confluent.",
        distributionLocation: "Diffuse but often shows a DEPENDENT gradient (worse in posterior/basal lungs). SPARING of the costophrenic angles.",
        demographicsClinicalContext: "Critically ill patient (Sepsis, Trauma, Pancreatitis, Aspiration). Severe refractory hypoxaemia.",
        discriminatingKeyFeature: "NORMAL HEART SIZE and ABSENCE of significant pleural effusions (unlike cardiogenic oedema). Non-compliant lungs.",
        associatedFindings: "Air bronchograms are prominent. Fibroproliferative phase follows after 1-2 weeks.",
        complicationsSeriousAlternatives: "Multi-organ failure and ventilator-induced barotrauma (pneumothorax).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Bilateral hilar enlargement",
    newDiffs: [
      {
        diagnosis: "Pulmonary Arterial Hypertension",
        dominantImagingFinding: "ENLARGED central pulmonary arteries mimicking hilar lymphadenopathy. Rapid peripheral tapering.",
        distributionLocation: "Bilateral hila. The 'masses' are strictly vascular.",
        demographicsClinicalContext: "Dyspnoea, syncope, right heart failure. Can be primary (idiopathic) or secondary (COPD, PE).",
        discriminatingKeyFeature: "TUBULAR shape of the enlargement that enhances intensely (matches blood pool) on CT. Enlarged right ventricle.",
        associatedFindings: "Main pulmonary artery diameter >29mm. Right ventricular hypertrophy.",
        complicationsSeriousAlternatives: "Cor pulmonale and sudden cardiac death.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Infection (Mycobacterial/Fungal)",
        dominantImagingFinding: "ASYMMETRICAL or symmetrical bulky hilar lymphadenopathy. Often with central necrosis.",
        distributionLocation: "Hilar and mediastinal compartments.",
        demographicsClinicalContext: "Immunocompromised (HIV+) or endemic exposure (Histoplasmosis, Coccidioidomycosis).",
        discriminatingKeyFeature: "CENTRAL NECROSIS (Low density center with rim enhancement on CT).",
        associatedFindings: "Cavitating lung nodules or miliary pattern.",
        complicationsSeriousAlternatives: "Disseminated systemic infection.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Inferior rib notching",
    newDiffs: [
      {
        diagnosis: "Subclavian Artery Stenosis",
        dominantImagingFinding: "UNILATERAL rib notching. Involves the upper ribs (3rd to 8th).",
        distributionLocation: "Ipsilateral to the stenosis. Collateral flow bypasses the block.",
        demographicsClinicalContext: "Atherosclerosis or Takayasu's arteritis. Arm claudication or Subclavian Steal Syndrome.",
        discriminatingKeyFeature: "UNILATERALITY and absent/weak radial pulse on the affected side. Reversal of flow in vertebral artery.",
        associatedFindings: "Aortic arch atheroma or vasculitis.",
        complicationsSeriousAlternatives: "Posterior circulation stroke (vertebrobasilar insufficiency).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Enhancing liver lesion",
    newDiffs: [
      {
        diagnosis: "Hypervascular Metastasis",
        dominantImagingFinding: "MULTIPLE intensely enhancing solid lesions in the arterial phase. Rapid wash-out.",
        distributionLocation: "Random, diffuse distribution throughout the liver.",
        demographicsClinicalContext: "Known primary: Neuroendocrine (Carcinoid), Renal Cell, Thyroid, or Melanoma.",
        discriminatingKeyFeature: "MULTIPLICITY and presence of a highly vascular primary tumor. Often show a 'target' sign in portal venous phase.",
        associatedFindings: "Primary tumor evident elsewhere. Lymphadenopathy.",
        complicationsSeriousAlternatives: "Liver failure due to massive replacement.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Pyogenic Liver Abscess",
        dominantImagingFinding: "CLUSTER SIGN: Multiple small cystic lesions coalescing into a larger cavity. Thick, irregular RIM ENHANCEMENT.",
        distributionLocation: "Right lobe is most common. Often subcapsular.",
        demographicsClinicalContext: "Acute sepsis: Fever, RUQ pain, leukocytosis. History of biliary disease or appendicitis.",
        discriminatingKeyFeature: "DOUBLE TARGET SIGN on CT (enhancing inner rim, hypodense outer rim of oedema) and RESTRICTED DIFFUSION.",
        associatedFindings: "Gas within the lesion (20%). Right pleural effusion.",
        complicationsSeriousAlternatives: "Rupture into the peritoneum or thorax.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Pneumobilia",
    newDiffs: [
      {
        diagnosis: "Incompetent Sphincter of Oddi",
        dominantImagingFinding: "Small amount of air in the common bile duct or central intrahepatic ducts.",
        distributionLocation: "Central biliary tree.",
        demographicsClinicalContext: "Older adults. Often asymptomatic. Can be age-related or secondary to passed stones.",
        discriminatingKeyFeature: "ABSENCE of surgical history, biliary intervention, or bowel obstruction.",
        associatedFindings: "Patulous (wide) common bile duct.",
        complicationsSeriousAlternatives: "Ascending cholangitis (rare if just incompetent).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Perforated Duodenal Ulcer",
        dominantImagingFinding: "FREE AIR in the peritoneal cavity (Pneumoperitoneum) mimicking pneumobilia. Subdiaphragmatic gas.",
        distributionLocation: "Anterior to the liver, rather than within the branching bile ducts.",
        demographicsClinicalContext: "Acute surgical abdomen. Sudden severe epigastric pain. History of NSAID use or H. pylori.",
        discriminatingKeyFeature: "Air outlines the OUTSIDE of the liver and bowel (Rigler's sign of double-wall) rather than branching centrally.",
        associatedFindings: "Fluid in the Morrison's pouch. Focal defect in the duodenal bulb on CT.",
        complicationsSeriousAlternatives: "Bacterial peritonitis and septic shock.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Terminal ileal mass/stricture",
    newDiffs: [
      {
        diagnosis: "Adenocarcinoma (Small Bowel)",
        dominantImagingFinding: "SHORT, irregular, asymmetric stricture (Apple-core lesion). Shouldered margins.",
        distributionLocation: "Duodenum > Jejunum > Ileum. Less common in the terminal ileum compared to Crohn's.",
        demographicsClinicalContext: "Older adults. Associated with long-standing Crohn's disease, Coeliac disease, or FAP.",
        discriminatingKeyFeature: "SHORT segment involvement with abrupt 'shouldered' edges, unlike the long tapered stricture of Crohn's.",
        associatedFindings: "Proximal bowel dilatation (obstruction). Regional lymphadenopathy.",
        complicationsSeriousAlternatives: "High-grade bowel obstruction and metastatic spread.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Colitis",
    newDiffs: [
      {
        diagnosis: "Cytomegalovirus (CMV) Colitis",
        dominantImagingFinding: "Deep, discrete ulcers. Wall thickening and mucosal enhancement.",
        distributionLocation: "Pancolitis or right-sided predominance (Caecum/Ascending colon).",
        demographicsClinicalContext: "Severely IMMUNOSUPPRESSED (HIV+ with CD4 <50, transplant recipients). Severe watery diarrhoea.",
        discriminatingKeyFeature: "Deep ulcerations in a highly immunocompromised patient without C. diff exposure.",
        associatedFindings: "CMV retinitis or pneumonitis. Toxic megacolon.",
        complicationsSeriousAlternatives: "Colonic perforation (surgical emergency).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Behçet Disease",
        dominantImagingFinding: "Focal, deep, 'punched-out' ulcers. Can mimic Crohn's disease.",
        distributionLocation: "ILEOCAECAL region is the most common site. Segmental.",
        demographicsClinicalContext: "Young adults (Silk Road descent). Triad: Oral aphthous ulcers, Genital ulcers, Uveitis.",
        discriminatingKeyFeature: "CLINICAL TRIAD of oral/genital ulcers + uveitis. Deep focal colonic ulcers.",
        associatedFindings: "Pulmonary artery aneurysms. Deep vein thrombosis.",
        complicationsSeriousAlternatives: "Massive GI bleeding or perforation.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Solid mesenteric/peritoneal mass",
    newDiffs: [
      {
        diagnosis: "Peritoneal Carcinomatosis",
        dominantImagingFinding: "Multiple soft tissue nodules and plaques studding the peritoneum and omentum (Omental Caking).",
        distributionLocation: "Diffuse peritoneal spread. Pouch of Douglas, right paracolic gutter, and subdiaphragmatic spaces.",
        demographicsClinicalContext: "Known primary adenocarcinoma: OVARIAN (most common), STOMACH, COLON, or PANCREAS.",
        discriminatingKeyFeature: "OMENTAL CAKING and massive ascites. Nodules enhance intensely.",
        associatedFindings: "Scalloping of the liver/spleen surface (implants). Loculated ascites.",
        complicationsSeriousAlternatives: "Small bowel obstruction (frozen abdomen).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Renal papillary necrosis",
    newDiffs: [
      {
        diagnosis: "Tuberculosis (Renal)",
        dominantImagingFinding: "Papillary necrosis leading to MOTH-EATEN calyces. PUTTY KIDNEY (autonephrectomy) in end-stage.",
        distributionLocation: "Unilateral or bilateral. Often multi-focal within the kidney.",
        demographicsClinicalContext: "History of pulmonary TB. Sterile pyuria (WBCs in urine but negative standard culture).",
        discriminatingKeyFeature: "STRICTURES of the infundibula, renal pelvis, or ureter (Pipestem ureter). Amorphous calcification.",
        associatedFindings: "Calcified granulomas in the liver/spleen. Bladder contracture (Thimble bladder).",
        complicationsSeriousAlternatives: "End-stage renal failure and disseminated TB.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Obstructive Uropathy",
        dominantImagingFinding: "BLUNTING and clubbing of the calyces. Thinning of the renal cortex/medulla.",
        distributionLocation: "Unilateral (if ureteric stone/tumor) or bilateral (if bladder/prostate issue).",
        demographicsClinicalContext: "Flank pain or anuria. History of stones, BPH, or pelvic malignancy.",
        discriminatingKeyFeature: "DILATATION of the renal pelvis and ureter proximal to a visible obstructing lesion.",
        associatedFindings: "Perinephric fluid (stranding) if acute obstruction.",
        complicationsSeriousAlternatives: "Irreversible loss of renal function and pyonephrosis (infected urine).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Renal Vein Thrombosis",
        dominantImagingFinding: "ENLARGED, oedematous kidney. Prolonged corticomedullary phase. Filling defect in the renal vein.",
        distributionLocation: "Unilateral or bilateral. Thrombus may extend into the IVC.",
        demographicsClinicalContext: "Nephrotic syndrome, severe dehydration (infants), trauma, or hypercoagulable state.",
        discriminatingKeyFeature: "FILLING DEFECT in the renal vein on contrast CT. Reversal of arterial diastolic flow on Doppler US.",
        associatedFindings: "Prominent capsular collateral veins. Retroperitoneal haemorrhage.",
        complicationsSeriousAlternatives: "Pulmonary embolism and renal infarction.",
        isCorrectDiagnosis: false
      }
    ]
  }
];

async function main() {
  console.log("Fetching discriminators...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of updates) {
    const disc = discriminators.find((d: any) => d.pattern === update.pattern);
    if (!disc) {
      console.log(`Could not find ${update.pattern}`);
      continue;
    }
    
    const existingDiagnoses = new Set(disc.differentials.map((d: any) => d.diagnosis.toLowerCase()));
    const toAdd = update.newDiffs.filter(d => !existingDiagnoses.has(d.diagnosis.toLowerCase()));
    
    if (toAdd.length > 0) {
      const merged = [...disc.differentials, ...toAdd];
      await client.mutation(api.discriminators.update as any, {
        id: disc._id,
        differentials: merged
      });
      console.log(`✅ Updated ${update.pattern} with ${toAdd.length} new differentials.`);
    } else {
      console.log(`No new differentials needed for ${update.pattern}`);
    }
  }
}

main().catch(console.error);
