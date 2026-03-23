import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_26_DATA = [
  {
    pattern: "Solitary pulmonary nodule",
    itemNumber: "4.1",
    problemCluster: "SPN",
    seriousAlternatives: ["Bronchogenic Carcinoma", "Hamartoma", "Granuloma", "Solitary Metastasis"],
    differentials: [
      {
        diagnosis: "Bronchogenic Carcinoma (SPN)",
        dominantImagingFinding: "Solid nodule with SPICULATED margins and corona radiata. Doubling time 20-400 days.",
        distributionLocation: "Upper lobes common (70%).",
        demographicsClinicalContext: "Adult smokers. Age >50y is a high-risk factor.",
        discriminatingKeyFeature: "SPICULATION and ECCENTRIC calcification. Malignant calcification is typically stippled or eccentric. Benign is central/popcorn.",
        associatedFindings: "Hilar nodes or rib destruction.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Granuloma (Healed Infection)",
        dominantImagingFinding: "Small (<3cm), smooth, well-defined nodule. BENIGN calcification (Central, Diffuse, or Laminar).",
        distributionLocation: "Anywhere.",
        demographicsClinicalContext: "Asymptomatic. Prior TB or Histoplasmosis.",
        discriminatingKeyFeature: "BENIGN CALCIFICATION: Central dense dot or laminar 'onion-skin' calcification is 100% specific for a benign granuloma.",
        associatedFindings: "Calcified hilar nodes.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pulmonary Hamartoma",
        dominantImagingFinding: "Well-circumscribed nodule with 'POPCORN' calcification and internal MACROSCOPIC FAT.",
        distributionLocation: "Peripheral common.",
        demographicsClinicalContext: "Adults. Most common benign lung tumor.",
        discriminatingKeyFeature: "POPCORN calcification and FAT (-60 to -100 HU) are diagnostic. Stability on old films.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "CONSOLIDATION WITH BULGING OF FISSURES",
    itemNumber: "4.9",
    problemCluster: "bulging fissure",
    seriousAlternatives: ["Klebsiella Pneumonia", "Mucinous Adenocarcinoma", "Abscess", "Haemorrhage"],
    differentials: [
      {
        diagnosis: "Klebsiella Pneumonia",
        dominantImagingFinding: "Dense lobar consolidation characteristically involving the RUL. Fissure is displaced downwards (Bulging).",
        distributionLocation: "Right Upper Lobe common.",
        demographicsClinicalContext: "Debilitated patients, alcoholics, or elderly. 'Currant jelly' sputum.",
        discriminatingKeyFeature: "BULGING FISSURE: Represents a high-volume inflammatory exudate that expands the lobe. Highly aggressive with early necrosis.",
        associatedFindings: "Early cavitation.",
        complicationsSeriousAlternatives: "Pulmonary gangrene (FATAL).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Mucinous Adenocarcinoma (Adenocarcinoma in situ)",
        dominantImagingFinding: "Indolent lobar consolidation with preserved or expanded volume. Bulging fissure sign.",
        distributionLocation: "Lower lobes focus.",
        demographicsClinicalContext: "Non-smokers. Copious watery sputum (Bronchorrhea).",
        discriminatingKeyFeature: "CHRONICITY: Unlike Klebsiella, the consolidation is chronic and non-responsive to antibiotics. CT angiogram sign present.",
        associatedFindings: "Multi-focal ground-glass.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "S ACRO-ILIAC JOINT WIDENING",
    itemNumber: "3.15",
    problemCluster: "widened SIJ",
    seriousAlternatives: ["Hyperparathyroidism (Pseudowidening)", "Infection (Septic)", "Trauma (Diastasis)"],
    differentials: [
      {
        diagnosis: "Hyperparathyroidism (Subperiosteal Resorption)",
        dominantImagingFinding: "Apparent joint widening due to extensive resorption of the subchondral bone. 'PSEUDO-WIDENING'.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Renal failure patients. High PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION: Look for resorption on the radial side of the phalanges. Lacks true joint space destruction.",
        associatedFindings: "Brown tumors and rugger-jersey spine.",
        complicationsSeriousAlternatives: "None (related to joint).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Septic Sacroiliitis",
        dominantImagingFinding: "True widening due to cartilage destruction and large joint effusion/abscess.",
        distributionLocation: "Strictly UNILATERAL.",
        demographicsClinicalContext: "Acute onset fever and severe buttock pain. IVDU or post-partum.",
        discriminatingKeyFeature: "UNILATERALITY and ACUTE fever. MRI shows massive marrow oedema and fluid.",
        associatedFindings: "Ipsiacus abscess.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Traumatic Diastasis (Open Book Pelvis)",
        dominantImagingFinding: "Massive widening of the SI joint and pubic symphysis. Displaced fractures.",
        distributionLocation: "Anterior and posterior pelvic ring.",
        demographicsClinicalContext: "High-energy trauma (MVA).",
        discriminatingKeyFeature: "HISTORY: Clear traumatic event. Associated with pubic symphysis diastasis >2.5cm.",
        associatedFindings: "Retroperitoneal haemorrhage.",
        complicationsSeriousAlternatives: "Life-threatening haemorrhage (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "GYRIFORM ENHANCEMENT",
    itemNumber: "12.23",
    problemCluster: "cortical enhancement",
    seriousAlternatives: ["Subacute Infarct", "Herpes Encephalitis", "PRES", "Post-ictal Change"],
    differentials: [
      {
        diagnosis: "Subacute Infarct (Reperfusion)",
        dominantImagingFinding: "Gyriform enhancement appearing 1-3 weeks after an acute event. 'FOGGING' effect.",
        distributionLocation: "VASCULAR territory focus (e.g. MCA). Grey matter.",
        demographicsClinicalContext: "Adults. Sudden onset deficit 7-14 days prior.",
        discriminatingKeyFeature: "VASCULAR TERRITORY: Enhancement is strictly limited to an arterial distribution. Represents breakdown of the blood-brain barrier.",
        associatedFindings: "Underlying parenchymal loss/atrophy.",
        complicationsSeriousAlternatives: "Haemorrhagic transformation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Herpes Simplex Encephalitis (HSV)",
        dominantImagingFinding: "Gyriform enhancement and T2-bright signal involving the TEMPORAL lobes and INSULA.",
        distributionLocation: "Limbic system focus. Bilateral but asymmetric. Spares the basal ganglia.",
        demographicsClinicalContext: "Acute fever, headache, and psychiatric symptoms. Rapid decline.",
        discriminatingKeyFeature: "TEMPORAL Predilection: Involvement of the temporal lobes and insula is pathognomonic. Spares the lentiform nuclei.",
        associatedFindings: "Haemorrhage (SWI).",
        complicationsSeriousAlternatives: "Death (FATAL if untreated).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "PRES (Posterior Reversible Encephalopathy)",
        dominantImagingFinding: "Gyriform enhancement (rarely) or T2 signal characteristically in the OCCIPITAL lobes.",
        distributionLocation: "Posterior circulation focus. Occipital and Parietal lobes.",
        demographicsClinicalContext: "Hypertensive crisis, pre-eclampsia, or chemotherapy.",
        discriminatingKeyFeature: "POSTERIOR distribution and clinical REVERSIBILITY. Associated with severe hypertension.",
        associatedFindings: "Subcortical vasogenic oedema.",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "OESOPHAGEAL DIVERTICULA",
    itemNumber: "6.3",
    problemCluster: "oesophageal pouches",
    seriousAlternatives: ["Zenker Diverticulum", "Traction Diverticulum", "Epiphrenic Diverticulum", "Killian-Jamieson"],
    differentials: [
      {
        diagnosis: "Zenker Diverticulum (Pulsion)",
        dominantImagingFinding: "Out-pouching from the posterior wall at the level of C5-C6. Above the cricopharyngeus.",
        distributionLocation: "Posterior midline. KILLIAN TRIANGLE.",
        demographicsClinicalContext: "Elderly. Dysphagia, halitosis, and regurgitation of undigested food.",
        discriminatingKeyFeature: "POSTERIOR location above the cricopharyngeus muscle. Most common oesophageal diverticulum.",
        associatedFindings: "Air-fluid level within the pouch.",
        complicationsSeriousAlternatives: "Aspiration pneumonia.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Traction Diverticulum",
        dominantImagingFinding: "Mid-oesophageal diverticulum with a characteristic 'TRIANGULAR' or tented shape.",
        distributionLocation: "Mid-oesophagus at the level of the carina.",
        demographicsClinicalContext: "History of granulomatous disease (TB or Histoplasmosis).",
        discriminatingKeyFeature: "TRIANGULAR shape: Represents scarring/pulling from adjacent infected lymph nodes. Broad-necked.",
        associatedFindings: "Calcified subcarinal nodes.",
        complicationsSeriousAlternatives: "Fistula formation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Epiphrenic Diverticulum",
        dominantImagingFinding: "Large out-pouching in the distal 10cm of the oesophagus. Above the diaphragm.",
        distributionLocation: "Distal oesophagus. Right side common.",
        demographicsClinicalContext: "Associated with motility disorders (Achalasia or Spasm).",
        discriminatingKeyFeature: "DISTAL location and association with a MOTILITY disorder. Usually large and broad-necked.",
        associatedFindings: "Atonic or spastic oesophagus.",
        complicationsSeriousAlternatives: "Perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 26 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_26_DATA) {
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
  console.log("Batch 26 Complete!");
}

main().catch(console.error);