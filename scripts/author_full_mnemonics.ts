import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const CHEST_UPDATES = [
  {
    mnemonic: "STREP ABC",
    pattern: "Upper lobe fibrosis",
    expanded: "S: Sarcoidosis, T: TB, R: Radiation, E: EAA, P: Pneumoconiosis, A: Ankylosing spondylitis, B: Beryllium, C: CF",
    problemCluster: "upper zone fibrosis",
    seriousAlternatives: ["Active TB (Public Health)", "Malignant lymphangitis", "PJP"],
    differentials: [
      {
        diagnosis: "Sarcoidosis (Stage IV)",
        dominantImagingFinding: "SYMMETRIC UPPER ZONE fibrosis. LYMPHADENOPATHY in 70–90% (Garland Triad). OUTWARD displacement of hila. GALAXAY SIGN in 15%.",
        distributionLocation: "UPPER/MID-ZONE predominance (80%). Symmetrical. Subpleural and fissural nodules (PERILYMPHATIC distribution).",
        demographicsClinicalContext: "Bimodal age peaks (25-35y and 45-65y). LOFGREN SYNDROME: Erythema nodosum, hilar nodes, arthralgia. HEERFORDT SYNDROME: Uveoparotid fever.",
        discriminatingKeyFeature: "OUTWARD HILAR DISPLACEMENT and symmetric nodal calcification. BI-BASAL SPARING is common in Stage IV.",
        associatedFindings: "1-2-3 SIGN (Garland triad). Nephrocalcinosis (hypercalcaemia). Splenomegaly (25%). Bone cysts (lace-like) in 5%.",
        complicationsSeriousAlternatives: "Pulmonary Hypertension. Aspergillus fungus ball in pre-existing fibrotic cavities (Stage IV).",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Post-Primary Tuberculosis",
        dominantImagingFinding: "THICK-WALLED CAVITATION (50%). TREE-IN-BUD satellites (95% of active disease). Volume loss with UPWARD hilar retraction.",
        distributionLocation: "APICAL and POSTERIOR segments of upper lobes (85%). Superior segment of lower lobes (10%).",
        demographicsClinicalContext: "History of Reactivation (Immunosuppression, Steroids, Diabetes). Night sweats, weight loss, fever. Productive cough.",
        discriminatingKeyFeature: "APICAL CAVITATION with satellite nodules. Stability on old films is the 'Gold Standard' for inactivity.",
        associatedFindings: "SIMON FOCUS (calcified apical scar). Calcified mediastinal nodes. RASMUSSEN ANEURYSM.",
        complicationsSeriousAlternatives: "Bronchopleural fistula. Bronchogenic carcinoma risk (scar cancer). Massive hemoptysis.",
        isCorrectDiagnosis: false
      },
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
        diagnosis: "Chronic EAA (Hypersensitivity Pneumonitis)",
        dominantImagingFinding: "HEADCHEESE SIGN: Coexistence of GGO, Air-trapping, and normal lung. MOSAIC ATTENUATION on expiratory CT (90%).",
        distributionLocation: "MID-TO-UPPER zone predominance. SPARING of extreme apices and bases (costophrenic angles).",
        demographicsClinicalContext: "EXPOSURE (100%): Bird fancier's (pigeons/parrots), Farmer's lung (Actinomycetes), Air-conditioner lung.",
        discriminatingKeyFeature: "HEADCHEESE SIGN and Mosaic attenuation with air-trapping. Absence of significant lymphadenopathy.",
        associatedFindings: "Ill-defined centrilobular GGO nodules. Traction bronchiectasis in chronic stage.",
        complicationsSeriousAlternatives: "End-stage fibrosis (Honeycombing). Right-heart failure.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Pneumoconiosis (Silicosis / CWP)",
        dominantImagingFinding: "PMF (Progressive Massive Fibrosis): Symmetric conglomerate masses ( >1cm) with radiating strands. Fine discrete nodules (2-5mm) in 100%.",
        distributionLocation: "POSTERIOR UPPER ZONE predominance (90%). Masses migrate towards hila, leaving peripheral compensatory emphysema.",
        demographicsClinicalContext: "OCCUPATIONAL: Quarrying, sandblasting, mining. Chronic exposure (usually >10 years).",
        discriminatingKeyFeature: "EGGSHELL CALCIFICATION of hilar/mediastinal nodes (5%). 30x increased risk of TB (Silicotuberculosis).",
        associatedFindings: "CAPLAN SYNDROME (RA + pneumoconiosis nodules). Spontaneous pneumothorax.",
        complicationsSeriousAlternatives: "SILICOTUBERCULOSIS (high risk). Cor pulmonale. Increased lung CA risk.",
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
        diagnosis: "Cystic Fibrosis",
        dominantImagingFinding: "CYSTIC BRONCHIECTASIS (100% of adult cases). Mucus plugging causing 'finger-in-glove' opacities. Hyperinflation.",
        distributionLocation: "UPPER LOBE predominance. Diffuse but most severe in the apices.",
        demographicsClinicalContext: "Autosomal recessive (CFTR mutation). Recurrent severe respiratory infections (Pseudomonas). Pancreatic insufficiency.",
        discriminatingKeyFeature: "UPPER LOBE CYSTIC BRONCHIECTASIS in a young patient. Positive Sweat Chloride test.",
        associatedFindings: "Meconium ileus equivalent (DIOS) in the abdomen. Fatty replacement of the pancreas.",
        complicationsSeriousAlternatives: "Massive hemoptysis (from hypertrophied bronchial arteries) and respiratory failure.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    mnemonic: "LENT",
    pattern: "Diffuse cystic ILD",
    expanded: "L: LAM, E: Eosinophilic granuloma (PLCH), N: Neurofibromatosis, T: Tuberous sclerosis",
    problemCluster: "diffuse cystic lung disease",
    seriousAlternatives: ["Centrilobular Emphysema", "PJP", "Pneumatocele"],
    differentials: [
      {
        diagnosis: "Lymphangioleiomyomatosis (LAM)",
        dominantImagingFinding: "UNIFORM, thin-walled ( <2mm), round cysts (2mm-2cm) in 100%. DIFFUSE ground-glass opacities (25-30%) due to haemorrhage.",
        distributionLocation: "DIFFUSE and SYMMETRIC. CHARACTERISTIC involvement of the costophrenic angles (95%+).",
        demographicsClinicalContext: "Almost exclusively FEMALES (99%). Linked to TSC1/TSC2 mutations.",
        discriminatingKeyFeature: "CP ANGLE INVOLVEMENT in a young woman. Association with renal ANGIOMYOLIPOMAS (50% sporadic, 90% TSC).",
        associatedFindings: "CHYLOTHORAX (pleural effusion) in 20%. Recurrent pneumothorax (40%). Retroperitoneal lymphangioleiomyomas.",
        complicationsSeriousAlternatives: "Progressive respiratory failure. Catastrophic pneumothorax. AML haemorrhage.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Langerhans Cell Histiocytosis (PLCH)",
        dominantImagingFinding: "BIZARRE-SHAPED or cloverleaf cysts (80%). Evolution from CENTRILOBULAR NODULES (60%) to thick-walled then thin-walled cysts.",
        distributionLocation: "UPPER and MID-ZONE predominance (90%). CHARACTERISTIC SPARING of the costophrenic angles (95%).",
        demographicsClinicalContext: "Strong association with SMOKING (95%+). Young adults (peak 20-40y). Male = Female.",
        discriminatingKeyFeature: "COSTOPHRENIC ANGLE SPARING and presence of bizarre/joining cysts in a smoker.",
        associatedFindings: "Lung volumes preserved or INCREASED (100%). Bone lesions (rare in lung-only LCH).",
        complicationsSeriousAlternatives: "High risk of pneumothorax (25%). Permanent fibrotic lung disease.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Neurofibromatosis (Type 1)",
        dominantImagingFinding: "UPPER LOBE BULLAE and thin-walled cysts. Bibasilar reticular opacities (fibrosis).",
        distributionLocation: "Asymmetric. Bullae in apices; fibrosis in the bases.",
        demographicsClinicalContext: "Diagnosis of NF1 (Café-au-lait spots, neurofibromas).",
        discriminatingKeyFeature: "Presence of posterior mediastinal masses (neurofibromas) or RIB NOTCHING/TWISTING on the same scan.",
        associatedFindings: "SKELETAL DEFORMITIES (scoliosis) and cutaneous neurofibromas seen on the chest wall.",
        complicationsSeriousAlternatives: "Malignant peripheral nerve sheath tumor (MPNST) transformation.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Tuberous Sclerosis (Pulmonary LAM)",
        dominantImagingFinding: "Identical to sporadic LAM: UNIFORM thin-walled cysts. Extensive multiorgan involvement.",
        distributionLocation: "DIFFUSE and symmetric. Characteristically involves the CP angles.",
        demographicsClinicalContext: "Skin angiofibromas, ASH-LEAF spots, Shagreen patch. Seizures and cognitive disability.",
        discriminatingKeyFeature: "SUBEPENDYMAL NODULES (95%) and cortical tubers on brain CT/MRI. Multiple renal AMLs (90%).",
        associatedFindings: "Sclerotic bone lesions and subungual fibromas.",
        complicationsSeriousAlternatives: "Giant cell astrocytoma (SEGA) and renal failure.",
        isCorrectDiagnosis: false
      }
    ]
  }
];

async function main() {
  console.log("Cleaning up and upgrading discriminators...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of CHEST_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.mnemonicRef?.mnemonic === update.mnemonic || 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      console.log(`Updating existing record for ${update.mnemonic}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 1, 
          expandedLetters: update.expanded
        }
      });
    } else {
      console.log(`Creating new record for ${update.mnemonic}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives,
        mnemonicRef: {
          mnemonic: update.mnemonic,
          chapterNumber: 1,
          expandedLetters: update.expanded
        }
      });
    }
  }
}

main().catch(console.error);