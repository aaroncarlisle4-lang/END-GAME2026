import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const ACE_UPDATES = [
  {
    pattern: "B ILATERAL HYPERTRANSRADIANT HEMITHORACES",
    problemCluster: "bilateral hyperlucency",
    differentials: [
      { 
        diagnosis: "Emphysema (COPD)", 
        dominantImagingFinding: "Hyperinflation (flat diaphragms >10th posterior rib) and attenuated vascular markings.", 
        distributionLocation: "Upper lobe predominant (centrilobular) or lower lobe predominant (panacinar).", 
        demographicsClinicalContext: "Older adults. Heavy smoking history or Alpha-1 Antitrypsin deficiency.", 
        discriminatingKeyFeature: "BULLAE formation and macroscopic tissue destruction with flat diaphragms.", 
        associatedFindings: "Saber-sheath trachea, prominent central pulmonary arteries (PAH).", 
        complicationsSeriousAlternatives: "Cor pulmonale.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Asthma", 
        dominantImagingFinding: "Hyperinflation without destruction of the pulmonary vascular bed.", 
        distributionLocation: "Diffuse and symmetric.", 
        demographicsClinicalContext: "Younger patients. Reversible airflow obstruction.", 
        discriminatingKeyFeature: "PRESERVED VASCULAR MARKINGS (unlike emphysema) and bronchial wall thickening.", 
        associatedFindings: "Mucus plugging.", 
        complicationsSeriousAlternatives: "Acute severe asthma (status asthmaticus).", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Bilateral Pneumothoraces", 
        dominantImagingFinding: "Visceral pleural line visible bilaterally with absent peripheral markings.", 
        distributionLocation: "Apical and lateral.", 
        demographicsClinicalContext: "Major trauma or severe underlying cystic lung disease (LAM, LCH).", 
        discriminatingKeyFeature: "VISIBLE VISCERAL PLEURA bilaterally.", 
        associatedFindings: "Pneumomediastinum or surgical emphysema.", 
        complicationsSeriousAlternatives: "Tension pneumothorax.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "INCREASED DENSITY OF ONE HEMITHORAX",
    problemCluster: "opaque hemithorax",
    differentials: [
      { 
        diagnosis: "Total Lung Collapse", 
        dominantImagingFinding: "Homogeneous opacification of the entire hemithorax.", 
        distributionLocation: "Unilateral.", 
        demographicsClinicalContext: "Endobronchial obstruction (tumor, mucus plug, foreign body).", 
        discriminatingKeyFeature: "MEDIASTINAL SHIFT TOWARDS the side of the opacity (volume loss).", 
        associatedFindings: "Elevated hemidiaphragm, crowded ribs.", 
        complicationsSeriousAlternatives: "Post-obstructive pneumonia.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Massive Pleural Effusion", 
        dominantImagingFinding: "Dense opacification, often with a meniscus at the apex.", 
        distributionLocation: "Unilateral.", 
        demographicsClinicalContext: "Malignancy (breast, lung, mesothelioma) or severe infection.", 
        discriminatingKeyFeature: "MEDIASTINAL SHIFT AWAY from the side of the opacity (volume expansion).", 
        associatedFindings: "Loss of diaphragm contour.", 
        complicationsSeriousAlternatives: "Respiratory compromise.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Pneumonectomy", 
        dominantImagingFinding: "Opaque hemithorax with extreme volume loss.", 
        distributionLocation: "Unilateral.", 
        demographicsClinicalContext: "History of lung cancer surgery.", 
        discriminatingKeyFeature: "SURGICAL CLIPS at the hilum and RESECTED RIBS (usually 5th or 6th).", 
        associatedFindings: "Herniation of the normal contralateral lung across the midline.", 
        complicationsSeriousAlternatives: "Bronchopleural fistula.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "N ON-RESOLVING OR RECURRENT CONSOLIDATION",
    problemCluster: "chronic consolidation",
    differentials: [
      { 
        diagnosis: "Bronchoalveolar Carcinoma (Mucinous Adenocarcinoma)", 
        dominantImagingFinding: "Lobar consolidation with prominent air bronchograms (angiogram sign on CT).", 
        distributionLocation: "Lobar or multi-lobar.", 
        demographicsClinicalContext: "Non-smoker or light smoker. Copious watery sputum (bronchorrhea).", 
        discriminatingKeyFeature: "BULGING FISSURE (from mucin) and lack of response to antibiotics.", 
        associatedFindings: "CT angiogram sign (enhancing vessels traversing low density mucin).", 
        complicationsSeriousAlternatives: "Rapid metastatic spread.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Organising Pneumonia (COP)", 
        dominantImagingFinding: "Patchy, migratory peripheral consolidation.", 
        distributionLocation: "Peripheral and basal predominance.", 
        demographicsClinicalContext: "Subacute onset (weeks). Mild fever, dry cough.", 
        discriminatingKeyFeature: "ATOLL SIGN / REVERSE HALO SIGN (central ground-glass surrounded by dense rim).", 
        associatedFindings: "Rapid response to steroids.", 
        complicationsSeriousAlternatives: "Progression to fibrosis.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Lymphoma (MALT / Pulmonary NHL)", 
        dominantImagingFinding: "Chronic consolidation with air bronchograms.", 
        distributionLocation: "Can cross fissures.", 
        demographicsClinicalContext: "Indolent course. Often asymptomatic.", 
        discriminatingKeyFeature: "Lack of volume loss and lack of significant hilar adenopathy (in MALT).", 
        associatedFindings: "Halo of ground-glass.", 
        complicationsSeriousAlternatives: "Systemic lymphoma.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "C ONSOLIDATION WITH AN ENLARGED HILUM",
    problemCluster: "consolidation and hilar node",
    differentials: [
      { 
        diagnosis: "Primary Tuberculosis", 
        dominantImagingFinding: "Focal consolidation (Ghon focus) + prominent ipsilateral hilar lymphadenopathy.", 
        distributionLocation: "Any lobe, often mid/lower.", 
        demographicsClinicalContext: "Children or newly exposed adults.", 
        discriminatingKeyFeature: "GHON COMPLEX (parenchymal focus + draining enlarged hilar node).", 
        associatedFindings: "Pleural effusion.", 
        complicationsSeriousAlternatives: "Miliary dissemination.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Bronchogenic Carcinoma (Central)", 
        dominantImagingFinding: "Post-obstructive consolidation/atelectasis distal to a central hilar mass.", 
        distributionLocation: "Lobar or segmental.", 
        demographicsClinicalContext: "Older adults, smokers.", 
        discriminatingKeyFeature: "GOLDEN S SIGN (collapse of RUL around a central mass).", 
        associatedFindings: "Mediastinal adenopathy.", 
        complicationsSeriousAlternatives: "Invasion of mediastinal structures.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "PULMONARY OEDEMA",
    problemCluster: "alveolar opacification",
    differentials: [
      { 
        diagnosis: "Cardiogenic Pulmonary Oedema", 
        dominantImagingFinding: "Bilateral perihilar consolidation (Bat-wing appearance) with Kerley B lines.", 
        distributionLocation: "Central / Perihilar and basal.", 
        demographicsClinicalContext: "Heart failure, acute MI, fluid overload.", 
        discriminatingKeyFeature: "CARDIOMEGALY, pleural effusions, and cephalisation of pulmonary vessels.", 
        associatedFindings: "Rapid resolution with diuretics.", 
        complicationsSeriousAlternatives: "Respiratory failure.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "ARDS / Non-Cardiogenic Oedema", 
        dominantImagingFinding: "Diffuse patchy or confluent bilateral consolidation.", 
        distributionLocation: "Peripheral sparing is less common; often diffuse.", 
        demographicsClinicalContext: "Sepsis, trauma, aspiration, severe pneumonia.", 
        discriminatingKeyFeature: "NORMAL HEART SIZE, absence of pleural effusions, and absence of Kerley B lines.", 
        associatedFindings: "Delayed resolution compared to cardiogenic.", 
        complicationsSeriousAlternatives: "Refractory hypoxia and fibrosis.", 
        isCorrectDiagnosis: false 
      }
    ]
  }
];

async function main() {
  console.log("Seeding ACE Differentials (Chapman) Batch 3...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of ACE_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    const differentialsWithSort = update.differentials.map((d, idx) => ({
      ...d,
      sortOrder: idx
    }));
    
    if (matches.length > 0) {
      console.log(`Updating ${update.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    } else {
      console.log(`Creating ${update.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    }
  }
  console.log("ACE Batch 3 complete!");
}

main().catch(console.error);