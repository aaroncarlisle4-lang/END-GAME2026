import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const HIGH_YIELD_ACE = [
  {
    pattern: "UNILATERAL HYPERTRANSRADIANT HEMITHORAX",
    problemCluster: "unilateral hyperlucency",
    seriousAlternatives: ["Tension Pneumothorax", "Endobronchial Cancer", "Foreign Body"],
    differentials: [
      {
        diagnosis: "Swyer-James (Macleod) Syndrome",
        dominantImagingFinding: "SMALL LUNG (100% specific). Hyperlucency due to reduced perfusion.",
        distributionLocation: "Unilateral. Contralateral lung is normal or hyperinflated.",
        demographicsClinicalContext: "History of severe childhood Adenovirus pneumonia or bronchiolitis.",
        discriminatingKeyFeature: "AIR TRAPPING on expiratory films and a characteristic SMALL HILUM.",
        associatedFindings: "Bronchiectasis on CT (80%).",
        complicationsSeriousAlternatives: "Recurrent infection.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Pneumothorax",
        dominantImagingFinding: "VISCERAL PLEURAL LINE. Absolute absence of peripheral markings.",
        distributionLocation: "Apical or lateral sulcus.",
        demographicsClinicalContext: "Acute pleuritic pain and dyspnoea. Trauma or spontaneous.",
        discriminatingKeyFeature: "VISIBLE VISCERAL PLEURA line and volume loss of the lung.",
        associatedFindings: "Mediastinal shift if TENSION (EMERGENCY).",
        complicationsSeriousAlternatives: "Tension collapse.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Endobronchial Obstruction",
        dominantImagingFinding: "Hyperlucency due to check-valve AIR TRAPPING.",
        distributionLocation: "Lobar or whole lung.",
        demographicsClinicalContext: "Adult (Cancer) or Child (Foreign body).",
        discriminatingKeyFeature: "EXPIRATORY MEDIASTINAL SHIFT away from the lucent side.",
        associatedFindings: "Visible obstructing mass on CT.",
        complicationsSeriousAlternatives: "Post-obstructive pneumonia.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Mastectomy",
        dominantImagingFinding: "Apparent hyperlucency due to loss of soft tissue attenuation.",
        distributionLocation: "Hemithorax field.",
        demographicsClinicalContext: "Prior Breast Cancer surgery.",
        discriminatingKeyFeature: "ABSENT AXILLARY FOLD and absent breast shadow. Normal lung markings.",
        associatedFindings: "Surgical clips in axilla.",
        complicationsSeriousAlternatives: "Recurrence.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "PULMONARY OEDEMA",
    problemCluster: "alveolar opacification",
    seriousAlternatives: ["ARDS", "Severe Pneumonia", "Alveolar Haemorrhage"],
    differentials: [
      {
        diagnosis: "Cardiogenic Oedema",
        dominantImagingFinding: "Perihilar Bat-wing consolidation. KERLEY B LINES (100%).",
        distributionLocation: "Central and Basal predominance.",
        demographicsClinicalContext: "Heart failure or acute MI.",
        discriminatingKeyFeature: "CARDIOMEGALY and rapid response to Diuretics (48h).",
        associatedFindings: "Pleural effusions and cephalisation of vessels.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "ARDS",
        dominantImagingFinding: "Patchy or confluent bilateral consolidation.",
        distributionLocation: "Peripheral involvement is common.",
        demographicsClinicalContext: "Sepsis, trauma, or severe illness.",
        discriminatingKeyFeature: "NORMAL HEART SIZE and absence of pleural effusions/Kerley lines.",
        associatedFindings: "Delayed resolution (weeks).",
        complicationsSeriousAlternatives: "Fibrosis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Alveolar Haemorrhage",
        dominantImagingFinding: "Diffuse consolidation. Rapid clearing (72h).",
        distributionLocation: "Diffuse.",
        demographicsClinicalContext: "Vasculitis (GPA/Goodpasture).",
        discriminatingKeyFeature: "RAPID CLEARING and significant drop in Haemoglobin.",
        associatedFindings: "Haemoptysis and renal disease.",
        complicationsSeriousAlternatives: "Death from asphyxiation.",
        isCorrectDiagnosis: false
      }
    ]
  }
];

async function main() {
  console.log("Authoring distinction-quality ACE Batch 2 (Chest)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of HIGH_YIELD_ACE) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === entry.pattern.toLowerCase().trim()
    );
    
    const differentialsWithSort = entry.differentials.map((d, idx) => ({
      ...d,
      sortOrder: idx
    }));
    
    if (matches.length > 0) {
      console.log(`Updating ${entry.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: differentialsWithSort,
        seriousAlternatives: entry.seriousAlternatives
      });
    } else {
      console.log(`Creating ${entry.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: entry.pattern,
        differentials: differentialsWithSort,
        seriousAlternatives: entry.seriousAlternatives
      });
    }
  }
  console.log("Batch 2 complete!");
}

main().catch(console.error);