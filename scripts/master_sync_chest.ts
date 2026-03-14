import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MASTER_DATA = [
  {
    mnemonic: "STREP ABC",
    pattern: "Upper lobe fibrosis",
    differentials: [
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis (Stage IV)", hallmark: "Hilar nodes + Outward hilar displacement", stats: "70-90% nodal calcification" },
      { letter: "T", condition: "Tuberculosis", diagnosis: "Post-Primary TB", hallmark: "Apical cavitation + satellites", stats: "85% apical location" },
      { letter: "R", condition: "Radiation", diagnosis: "Radiation Fibrosis", hallmark: "Geometric sharp margin", stats: "100% portal respect" },
      { letter: "E", condition: "Extrinsic allergic alveolitis", diagnosis: "Chronic EAA (HP)", hallmark: "Headcheese sign + Mosaic", stats: "90% mosaic pattern" },
      { letter: "P", condition: "Pneumoconiosis", diagnosis: "Silicosis / Coal worker's", hallmark: "Eggshell nodes + PMF masses", stats: "30x increased TB risk" },
      { letter: "A", condition: "Ankylosing spondylitis", diagnosis: "Ankylosing Spondylitis", hallmark: "Apical fibrobullous disease", stats: "1-2% of AS patients" },
      { letter: "B", condition: "Berylliosis", diagnosis: "Berylliosis", hallmark: "Aerospace exposure + mimics Sarcoid", stats: "100% occupational history" },
      { letter: "C", condition: "Cystic fibrosis", diagnosis: "Cystic Fibrosis", hallmark: "Upper lobe bronchiectasis", stats: "100% specific pattern" }
    ]
  },
  {
    mnemonic: "LENT",
    pattern: "Diffuse cystic ILD",
    differentials: [
      { letter: "L", condition: "LAM", diagnosis: "Lymphangioleiomyomatosis (LAM)", hallmark: "Uniform cysts + CP angle involvement", stats: "99% Females" },
      { letter: "E", condition: "Eosinophilic granuloma (PLCH)", diagnosis: "Langerhans Cell Histiocytosis (PLCH)", hallmark: "Bizarre cysts + CP angle sparing", stats: "95%+ Smokers" },
      { letter: "N", condition: "Neurofibromatosis", diagnosis: "Neurofibromatosis (Type 1)", hallmark: "Upper bullae + Basal fibrosis", stats: "90% skin nodules" },
      { letter: "T", condition: "Tuberous sclerosis", diagnosis: "Tuberous Sclerosis (LAM)", hallmark: "LAM + Brain tubers + Renal AMLs", stats: "90% have renal AMLs" }
    ]
  },
  {
    mnemonic: "SDLPVHF",
    pattern: "Reticulonodular shadowing",
    differentials: [
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis (Nodular)", hallmark: "Perilymphatic nodes + Symmetric adenopathy", stats: "80% Mid zone" },
      { letter: "D", condition: "Dust (Silicosis)", diagnosis: "Silicosis (Simple)", hallmark: "Posterior upper zone nodes", stats: "100% occupational" },
      { letter: "L", condition: "Lymphangitis", diagnosis: "Lymphangitis Carcinomatosa", hallmark: "Beaded septal thickening", stats: "100% interlobular" },
      { letter: "P", condition: "Post-primary TB", diagnosis: "Miliary TB", hallmark: "Uniform millet-seed nodules", stats: "100% random" },
      { letter: "V", condition: "Vasculitis", diagnosis: "Vasculitis (GPA)", hallmark: "Cavitating nodules", stats: "50% cavitation" },
      { letter: "H", condition: "Histiocytosis", diagnosis: "LCH (Nodular phase)", hallmark: "Centrilobular nodules", stats: "95% smokers" },
      { letter: "F", condition: "Fibrosing alveolitis", diagnosis: "Idiopathic Pulmonary Fibrosis", hallmark: "Honeycombing + Basal/Subpleural", stats: "100% traction bronchiectasis" }
    ]
  },
  {
    mnemonic: "CAVITIES",
    pattern: "Multiple pulmonary nodules",
    differentials: [
      { letter: "C", condition: "Cancer (Mets)", diagnosis: "Metastases", hallmark: "Disparate sized nodules", stats: "Basal predominance" },
      { letter: "A", condition: "Autoimmune (GPA)", diagnosis: "GPA (Wegener's)", hallmark: "Multiple cavitating nodules", stats: "50% cavitate" },
      { letter: "V", condition: "Vascular (Septic emboli)", diagnosis: "Septic Emboli", hallmark: "Feeding vessel sign + sepsis", stats: "Peripheral predominance" },
      { letter: "I", condition: "Infection (TB/Fungal)", diagnosis: "TB / Fungal", hallmark: "Cavitating + Tree-in-bud satellites", stats: "Apical location" },
      { letter: "T", condition: "Trauma", diagnosis: "Traumatic Lung Cysts", hallmark: "Lucent areas within consolidation", stats: "Post-major trauma" },
      { letter: "I", condition: "Inhalational", diagnosis: "Silicosis", hallmark: "Eggshell nodes + upper zone nodules", stats: "Occupational history" },
      { letter: "E", condition: "Eosinophilic", diagnosis: "Eosinophilic Pneumonia", hallmark: "Peripheral opacities", stats: "Asthma history" },
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis", hallmark: "Perilymphatic micronodules", stats: "Symmetric hilar nodes" }
    ]
  },
  {
    mnemonic: "Test Match Special",
    pattern: "Miliary nodules",
    differentials: [
      { letter: "T", condition: "TB (Miliary)", diagnosis: "Miliary TB", hallmark: "Random uniform micronodules", stats: "100% random distribution" },
      { letter: "M", condition: "Metastases", diagnosis: "Miliary Metastases", hallmark: "Disparate sizes + Basal predominance", stats: "Thyroid/Renal primary" },
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis (Miliary)", hallmark: "Perilymphatic + Symmetric nodes", stats: "90% symmetric nodes" }
    ]
  },
  {
    mnemonic: "CHASM",
    pattern: "Calcified lung nodules",
    differentials: [
      { letter: "C", condition: "Calcified metastases", diagnosis: "Calcified Metastases", hallmark: "Multiple basal nodules", stats: "Osteosarcoma primary" },
      { letter: "H", condition: "Hamartoma", diagnosis: "Hamartoma", hallmark: "Popcorn calcification + Internal fat", stats: "60% internal fat" },
      { letter: "A", condition: "Amyloid", diagnosis: "Amyloidosis", hallmark: "Irregular amorphous calcification", stats: "Plasma cell dyscrasia" },
      { letter: "S", condition: "Sarcoid", diagnosis: "Sarcoidosis", hallmark: "Calcified perilymphatic nodules", stats: "Eggshell nodal calc" },
      { letter: "M", condition: "Mitral stenosis", diagnosis: "Mitral Stenosis (Ossification)", hallmark: "Dendriform ossification in bases", stats: "Rheumatic heart disease" }
    ]
  },
  {
    mnemonic: "CAT",
    pattern: "Large cavitating lesion",
    differentials: [
      { letter: "C", condition: "Cavitating neoplasm", diagnosis: "Squamous Cell CA", hallmark: "Thick irregular wall (>15mm)", stats: "95% smokers" },
      { letter: "A", condition: "Abscess", diagnosis: "Lung Abscess", hallmark: "Thick wall + Air-fluid level", stats: "Aspiration history" },
      { letter: "T", condition: "TB / Wegener's", diagnosis: "TB / GPA", hallmark: "Apical (TB) or Random (GPA)", stats: "95% tree-in-bud satellites" }
    ]
  },
  {
    mnemonic: "4 Ts",
    pattern: "Anterior mediastinal mass",
    differentials: [
      { letter: "T", condition: "Thymoma", diagnosis: "Thymoma", hallmark: "Solid + Myasthenia Gravis (35%)", stats: "40-60y adults" },
      { letter: "T", condition: "Teratoma", diagnosis: "Teratoma", hallmark: "Complex + Fat/Calc (90%)", stats: "Young adults" },
      { letter: "T", condition: "Terrible lymphoma", diagnosis: "Lymphoma", hallmark: "Bulky + Multi-compartment nodes", stats: "B-symptoms" },
      { letter: "T", condition: "Thyroid", diagnosis: "Thyroid (Goitre)", hallmark: "Continuity with cervical gland", stats: "Intense enhancement" }
    ]
  },
  {
    mnemonic: "METAL",
    pattern: "Pleural lesions",
    differentials: [
      { letter: "M", condition: "Mesothelioma", diagnosis: "Mesothelioma", hallmark: "Circumferential rind + Mediastinal pleura", stats: "90% asbestos history" },
      { letter: "E", condition: "Empyema", diagnosis: "Empyema", hallmark: "Split pleura sign + sepsis", stats: "50% post-pneumonia" },
      { letter: "T", condition: "TB", diagnosis: "TB Pleurisy", hallmark: "Effusion + Nodular thickening", stats: "Chronic course" },
      { letter: "A", condition: "Asbestos", diagnosis: "Pleural Plaques", hallmark: "Flat plateau plaques + Apical sparing", stats: "95% apical sparing" },
      { letter: "L", condition: "Lung cancer", diagnosis: "Metastatic Pleural Disease", hallmark: "Large effusion + Nodules", stats: "Breast/Lung primary" }
    ]
  },
  {
    mnemonic: "PSALM",
    pattern: "Hyperlucent hemithorax",
    differentials: [
      { letter: "P", condition: "Pneumothorax", diagnosis: "Pneumothorax", hallmark: "Visceral pleural line + No markings", stats: "100% specific sign" },
      { letter: "S", condition: "Swyer-James syndrome", diagnosis: "Swyer-James Syndrome", hallmark: "Small lung + Air trapping", stats: "Childhood bronchiolitis" },
      { letter: "A", condition: "Airway (obstruction)", diagnosis: "Endobronchial Obstruction", hallmark: "Expiratory mediastinal shift", stats: "Check-valve mechanism" },
      { letter: "L", condition: "Lung (bulla/emphysema)", diagnosis: "Large Bulla", hallmark: "Thin curvilinear wall", stats: "90% apical location" },
      { letter: "M", condition: "Mastectomy", diagnosis: "Mastectomy", hallmark: "Absent breast shadow + axillary fold", stats: "100% specific" }
    ]
  },
  {
    mnemonic: "CLAMP",
    pattern: "Opacified hemithorax",
    differentials: [
      { letter: "C", condition: "Collapse (total)", diagnosis: "Total Lung Collapse", hallmark: "Homogeneous + Shift TOWARDS", stats: "Obstructive CA common" },
      { letter: "L", condition: "Large pleural effusion", diagnosis: "Large Effusion", hallmark: "Homogeneous + Shift AWAY", stats: "50% malignant" },
      { letter: "A", condition: "Agenicity (lung)", diagnosis: "Lung Agenesis", hallmark: "Absent bronchus/artery", stats: "Extreme volume loss" },
      { letter: "M", condition: "Mesothelioma", diagnosis: "Mesothelioma", hallmark: "Nodular rind + Mediastinal pleura", stats: "Shift TOWARDS" },
      { letter: "P", condition: "Pneumonectomy", diagnosis: "Pneumonectomy", hallmark: "Hilar clips + Absent rib", stats: "Known surgical history" }
    ]
  },
  {
    mnemonic: "CEPI",
    pattern: "Peripheral consolidation",
    differentials: [
      { letter: "C", condition: "COP", diagnosis: "Organising Pneumonia (COP)", hallmark: "Atoll sign + Migratory pattern", stats: "90% peripheral" },
      { letter: "E", condition: "Eosinophilic pneumonia", diagnosis: "Chronic Eosinophilic Pneumonia", hallmark: "Reverse bat-wing + Steroid response", stats: "100% steroid response" },
      { letter: "P", condition: "Pulmonary infarct", diagnosis: "Pulmonary Infarct", hallmark: "Hampton's Hump + Wedge shape", stats: "PE/DVT history" },
      { letter: "I", condition: "Inflammatory", diagnosis: "Vasculitis / Sarcoid", hallmark: "Nodules or consolidation", stats: "Systemic markers" }
    ]
  },
  {
    mnemonic: "HAPPY",
    pattern: "Bilateral consolidation",
    differentials: [
      { letter: "H", condition: "Heart failure", diagnosis: "Pulmonary Oedema", hallmark: "Bat-wing + Cardiomegaly", stats: "Rapid diuretic response" },
      { letter: "A", condition: "Alveolar proteinosis", diagnosis: "Alveolar Proteinosis", hallmark: "Crazy paving + Geographic sparing", stats: "Whole lung lavage therapy" },
      { letter: "P", condition: "PJP", diagnosis: "Pneumocystis Pneumonia", hallmark: "Perihilar GGO + Pneumatoceles", stats: "Profound hypoxia" },
      { letter: "P", condition: "Phlebitis (Vasculitis)", diagnosis: "Vasculitis / ARDS", hallmark: "Diffuse consolidation", stats: "Normal heart size" },
      { letter: "Y", condition: "Y-haemorrhage", diagnosis: "Alveolar Haemorrhage", hallmark: "Rapid clearing + Hb drop", stats: "48-72h clear-out" }
    ]
  },
  {
    mnemonic: "SLIPS",
    pattern: "Bilateral hilar enlargement",
    differentials: [
      { letter: "S", condition: "Sarcoidosis / Silicosis", diagnosis: "Sarcoidosis", hallmark: "Striking symmetry + Garland Triad", stats: "95% symmetrical" },
      { letter: "L", condition: "Lymphoma / Leukaemia", diagnosis: "Lymphoma", hallmark: "Asymmetrical + Bulky anterior", stats: "B-symptoms" },
      { letter: "I", condition: "Infection (TB/Viral)", diagnosis: "Primary TB", hallmark: "Unilateral hilar (95%)", stats: "Children/Immigrants" },
      { letter: "P", condition: "Pneumoconiosis", diagnosis: "Silicosis", hallmark: "Eggshell calcification + Upper zone", stats: "5% eggshell calc" },
      { letter: "S", condition: "Secondary (Mets)", diagnosis: "Metastatic Adenopathy", hallmark: "Bulky + Disparate growth", stats: "Known primary CA" }
    ]
  },
  {
    mnemonic: "CUBS",
    pattern: "Inferior rib notching",
    differentials: [
      { letter: "C", condition: "Coarctation / Collaterals", diagnosis: "Coarctation of Aorta", hallmark: "Bilateral 3-8 ribs + 3-Sign", stats: "Spares 1-2 ribs" },
      { letter: "U", condition: "Upper limb shunt", diagnosis: "Blalock-Taussig Shunt", hallmark: "Unilateral side of surgery", stats: "100% specific side" },
      { letter: "B", condition: "Bone (NF1)", diagnosis: "Neurofibromatosis 1", hallmark: "Ribbon-like ribs + spinal masses", stats: "100% specific morphology" },
      { letter: "S", condition: "Subclavian artery stenosis", diagnosis: "Subclavian Stenosis", hallmark: "Unilateral + Weak radial pulse", stats: "Vascular claudication" }
    ]
  }
];

async function main() {
  console.log("Master Sync Batch 1: Chest...");
  
  const mnemonics = await client.query(api.mnemonics.list as any, {});
  const discriminators = await client.query(api.discriminators.list as any, {});

  for (const entry of MASTER_DATA) {
    console.log(`Processing: ${entry.mnemonic}`);

    // Update Mnemonic
    const mRecord = mnemonics.find((m: any) => m.mnemonic === entry.mnemonic);
    if (mRecord) {
      await client.mutation(api.mnemonics.update as any, {
        id: mRecord._id,
        differentials: entry.differentials.map(d => ({
          letter: d.letter,
          condition: d.condition,
          associatedFeatures: d.hallmark
        }))
      });
    }

    // Update Discriminator
    const dMatch = discriminators.find((d: any) => d.mnemonicRef?.mnemonic === entry.mnemonic);
    if (dMatch) {
      await client.mutation(api.discriminators.update as any, {
        id: dMatch._id,
        mnemonicRef: {
          mnemonic: entry.mnemonic,
          chapterNumber: dMatch.mnemonicRef.chapterNumber,
          expandedLetters: entry.differentials.map(d => `${d.letter}: ${d.condition}`).join(", ")
        },
        differentials: entry.differentials.map((d, idx) => ({
          diagnosis: d.diagnosis,
          mnemonicLetter: d.letter,
          sortOrder: idx,
          dominantImagingFinding: d.diagnosis.toUpperCase() + ": " + d.hallmark,
          distributionLocation: "Typically " + d.diagnosis + " distribution",
          demographicsClinicalContext: d.stats + ". " + d.hallmark,
          discriminatingKeyFeature: d.hallmark,
          associatedFindings: "Associated with " + d.condition,
          complicationsSeriousAlternatives: "Risk of progression",
          isCorrectDiagnosis: idx === 0
        }))
      });
    }
  }
  console.log("Chest batch complete!");
}

main().catch(console.error);