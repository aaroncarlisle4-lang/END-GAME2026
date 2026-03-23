import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_34_DATA = [
  {
    pattern: "PLEURAL EFFUSION DUE TO EXTRATHORACIC DISEASE",
    itemNumber: "4.27",
    problemCluster: "systemic effusion",
    seriousAlternatives: ["Congestive Heart Failure", "Hypoproteinaemia (Liver/Renal)", "Subphrenic Abscess", "Meigs Syndrome"],
    differentials: [
      {
        diagnosis: "Congestive Heart Failure (CHF)",
        dominantImagingFinding: "Bilateral effusions, often asymmetric (RIGHT > LEFT). Cardiomegaly and venous congestion.",
        distributionLocation: "Bilateral pleural spaces. Dependent.",
        demographicsClinicalContext: "Elderly. Orthopnoea and peripheral oedema.",
        discriminatingKeyFeature: "CARDIOMEGALY and rapid resolution with diuretics (<48h). Symmetrical nature.",
        associatedFindings: "Kerley B lines.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Liver Cirrhosis / Nephrotic Syndrome",
        dominantImagingFinding: "Bilateral symmetric effusions. NO cardiomegaly. Normal pulmonary vascularity.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Anasarca, ascites, and history of liver/renal failure.",
        discriminatingKeyFeature: "NORMAL HEART SIZE and presence of massive ASCITES. Transudate due to low oncotic pressure.",
        associatedFindings: "Ascites.",
        complicationsSeriousAlternatives: "Hepatic hydrothorax (usually right-sided).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Meigs Syndrome",
        dominantImagingFinding: "Right-sided pleural effusion associated with a pelvic mass and ascites.",
        distributionLocation: "RIGHT side (70%).",
        demographicsClinicalContext: "Post-menopausal females. Pelvic mass (Ovarian Fibroma).",
        discriminatingKeyFeature: "PELVIC MASS: Presence of a solid ovarian fibroma. Triad: Benign ovarian tumor, Ascites, and Right effusion.",
        associatedFindings: "Ascites.",
        complicationsSeriousAlternatives: "None (Resolves after mass removal).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "CHEST RADIOGRAPH FOLLOWING CHEST TRAUMA",
    itemNumber: "4.37",
    problemCluster: "trauma chest",
    seriousAlternatives: ["Pneumothorax", "Haemothorax", "Pulmonary Contusion", "Aortic Rupture"],
    differentials: [
      {
        diagnosis: "Pulmonary Contusion",
        dominantImagingFinding: "Patchy, non-segmental consolidation appearing within 6h of trauma. DOES NOT respect anatomical boundaries.",
        distributionLocation: "Localized to the site of impact. Peripheral.",
        demographicsClinicalContext: "Acute trauma (MVA/Fall). Severe chest pain and hypoxia.",
        discriminatingKeyFeature: "RAPID ONSET (<6h) and non-segmental distribution. Clears within 3-7 days (unlike pneumonia).",
        associatedFindings: "Rib fractures.",
        complicationsSeriousAlternatives: "ARDS.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Traumatic Haemothorax",
        dominantImagingFinding: "Homogeneous opacification of the dependent pleural space. High HU on CT (>35-70 HU).",
        distributionLocation: "Unilateral pleural space.",
        demographicsClinicalContext: "Trauma. Signs of hypovolemic shock.",
        discriminatingKeyFeature: "HIGH DENSITY fluid: Presence of blood in the pleura. Associated with rib fractures and volume expansion (shift away).",
        associatedFindings: "Pneumothorax (Haemopneumothorax).",
        complicationsSeriousAlternatives: "Hemorrhagic shock (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Aortic Rupture (Traumatic)",
        dominantImagingFinding: "WIDENED MEDIASTINUM (>8cm). Obliteration of the aortic knob. Left apical cap.",
        distributionLocation: "Superior mediastinum focus.",
        demographicsClinicalContext: "High-speed deceleration injury (MVA). Immediate collapse.",
        discriminatingKeyFeature: "MEDIASTINAL WIDENING and deviation of NG tube to the right. 90% occur at the AORTIC ISTHMUS.",
        associatedFindings: "Left pleural effusion (haemothorax).",
        complicationsSeriousAlternatives: "Death (FATAL within minutes).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P ULMONARY VENOUS ENLARGEMENT",
    itemNumber: "5.20",
    problemCluster: "venous congestion",
    seriousAlternatives: ["Left Heart Failure", "Mitral Valve Disease", "VSD (Plethora - Mimic)"],
    differentials: [
      {
        diagnosis: "Left Heart Failure (CHF)",
        dominantImagingFinding: "CEPHALISATION of vessels (Dilation of upper lobe veins). Perihilar haze and Kerley B lines.",
        distributionLocation: "Upper lobes (Cephalisation) and Basal (Kerley lines).",
        demographicsClinicalContext: "Acute or chronic heart failure. DOE.",
        discriminatingKeyFeature: "CEPHALISATION: Upper lobe vessels become larger than lower lobe vessels. Associated with cardiomegaly.",
        associatedFindings: "Pleural effusions.",
        complicationsSeriousAlternatives: "Alveolar oedema.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Mitral Stenosis",
        dominantImagingFinding: "Marked cephalisation with a NORMAL sized Left Ventricle. Left Atrial appendage bulge.",
        distributionLocation: "Upper lobe veins focus.",
        demographicsClinicalContext: "History of Rheumatic Fever. Diastolic murmur.",
        discriminatingKeyFeature: "SMALL LV: Unlike cardiomyopathy, the LV remains normal in size. Massive LA enlargement and splayed carina.",
        associatedFindings: "Double-density sign.",
        complicationsSeriousAlternatives: "Pulmonary haemosiderosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 34 (Chest Final)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_34_DATA) {
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
  console.log("Batch 34 Complete!");
}

main().catch(console.error);