import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_27_DATA = [
  {
    pattern: "M AMMOGRAPHIC FEATURES OF BREAST LESIONS",
    itemNumber: "10.1",
    problemCluster: "mammographic mass",
    seriousAlternatives: ["Malignant (IDC/ILC)", "Benign (Cyst/Fibroadenoma)", "Radial Scar"],
    differentials: [
      {
        diagnosis: "Malignant Features (IDC)",
        dominantImagingFinding: "High-density mass with SPICULATED margins. Pleomorphic or branching microcalcifications. Architectural distortion.",
        distributionLocation: "Anywhere in the breast.",
        demographicsClinicalContext: "Hard, fixed lump on palpation. Skin or nipple retraction.",
        discriminatingKeyFeature: "SPICULATION and PLEOMORPHIC calcification. Malignant spicules are typically short and thick. High density.",
        associatedFindings: "Axillary lymphadenopathy.",
        complicationsSeriousAlternatives: "Systemic metastases.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Benign Features (Cyst/Fibroadenoma)",
        dominantImagingFinding: "Well-circumscribed, round or oval mass. HALO SIGN (thin lucent rim). Popcorn calcification (if old).",
        distributionLocation: "Anywhere.",
        demographicsClinicalContext: "Younger women. Mobile 'Breast Mouse' (Fibroadenoma).",
        discriminatingKeyFeature: "HALO SIGN and smooth margins. Low or neutral density. US shows anechoic (Cyst) or hypoechoic wider-than-tall (FA).",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "Infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "C ALCIFICATION",
    itemNumber: "10.2",
    problemCluster: "breast calcification",
    seriousAlternatives: ["Malignant (Pleomorphic)", "Benign (Secretory/Popcorn)", "Amorphous"],
    differentials: [
      {
        diagnosis: "Malignant Calcification (DCIS)",
        dominantImagingFinding: "Fine PLEOMORPHIC, linear, or branching (casting) calcifications. Grouped or segmental distribution.",
        distributionLocation: "Segmental or linear following a ductal distribution.",
        demographicsClinicalContext: "Asymptomatic. Screen-detected.",
        discriminatingKeyFeature: "PLEOMORPHISM and DUCTAL distribution. Casting calcifications (crushed stone appearance) are highly suspicious.",
        associatedFindings: "Architectural distortion.",
        complicationsSeriousAlternatives: "Invasive ductal carcinoma.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Benign Calcification (Secretory)",
        dominantImagingFinding: "Large, smooth, hollow 'ROD-LIKE' calcifications. Pointing towards the nipple.",
        distributionLocation: "Retroareolar. Bilateral and symmetric.",
        demographicsClinicalContext: "Post-menopausal women. Plasma cell mastitis.",
        discriminatingKeyFeature: "ROD-LIKE appearance and ductal direction. Lacks the pleomorphism of DCIS. Symmetric.",
        associatedFindings: "Duct ectasia.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Popcorn Calcification (Degenerating FA)",
        dominantImagingFinding: "Large, coarse, clumped 'POPCORN' calcifications.",
        distributionLocation: "Within a known or stable mass.",
        demographicsClinicalContext: "Older women.",
        discriminatingKeyFeature: "POPCORN appearance: Very dense and clumped. 100% specific for a degenerating fibroadenoma.",
        associatedFindings: "Well-defined mass.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "F ETAL HYDROPS",
    itemNumber: "13.15",
    problemCluster: "fetal fluid",
    seriousAlternatives: ["Immune (Rh)", "Non-Immune (Cardiac/Infection/Chromosomal)"],
    differentials: [
      {
        diagnosis: "Non-Immune Hydrops (Cardiac)",
        dominantImagingFinding: "Generalised fetal soft tissue oedema (>5mm) and fluid in >2 compartments (Ascites, Pleural, Pericardial).",
        distributionLocation: "Global fetal skin and body cavities.",
        demographicsClinicalContext: "Prenatal US. Most common cause of hydrops (90%). Causes: SVT, Structural CHD.",
        discriminatingKeyFeature: "CARDIAC ANOMALY: Fetal echo reveals structural heart disease or sustained arrhythmia. Normal mother Rh status.",
        associatedFindings: "Polyhydramnios and placental thickening.",
        complicationsSeriousAlternatives: "Intrauterine fetal death (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Immune Hydrops (Rh Isoimmunization)",
        dominantImagingFinding: "Generalised hydrops associated with signs of severe fetal anaemia.",
        distributionLocation: "Global.",
        demographicsClinicalContext: "Rh-negative mother with Rh-positive fetus. Positive antibody screen.",
        discriminatingKeyFeature: "MOTHER Rh status and high Peak Systolic Velocity (PSV) in the Middle Cerebral Artery (MCA) on Doppler.",
        associatedFindings: "Splenomegaly and hepatomegaly.",
        complicationsSeriousAlternatives: "Fetal death.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Twin-Twin Transfusion Syndrome (TTTS)",
        dominantImagingFinding: "Hydrops in the RECIPIENT twin. Oligohydramnios/Polyhydramnios sequence.",
        distributionLocation: "Monochorionic diamniotic twins.",
        demographicsClinicalContext: "Twins.",
        discriminatingKeyFeature: "ASYMMETRY: One twin is hydropic and large (Recipient), the other is small and stuck (Donor). Single placenta.",
        associatedFindings: "Bladder enlargement in the recipient twin.",
        complicationsSeriousAlternatives: "Fetal demise of both twins.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "LEPTOMENINGEAL ENHANCEMENT",
    itemNumber: "12.24",
    problemCluster: "pial enhancement",
    seriousAlternatives: ["Meningitis (Infection)", "Leptomeningeal Carcinomatosis", "Neurosarcoidosis", "Sturge-Weber"],
    differentials: [
      {
        diagnosis: "Infectious Meningitis (Pyogenic/TB)",
        dominantImagingFinding: "Linear or thick enhancement of the pial surface. Follows the gyri and basal cisterns.",
        distributionLocation: "Basal cisterns focus (TB) or diffuse (Pyogenic).",
        demographicsClinicalContext: "Acute fever, headache, and neck stiffness. High CRP.",
        discriminatingKeyFeature: "ACUTE presentation and basal cistern predilection (in TB). Associated with hydrocephalus and vasculitic infarcts.",
        associatedFindings: "Hydrocephalus and ventriculitis.",
        complicationsSeriousAlternatives: "Brain abscess or death.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Leptomeningeal Carcinomatosis (Mets)",
        dominantImagingFinding: "Nodular or irregular enhancement of the pial surface and cranial nerves.",
        distributionLocation: "Diffuse. Predilection for the dependent cisterns and CAUDA EQUINA.",
        demographicsClinicalContext: "Known primary (Breast, Lung, Melanoma). Progressive neurological deficit.",
        discriminatingKeyFeature: "NODULARITY: Enhancement is characteristically nodular rather than purely linear. Associated with known cancer.",
        associatedFindings: "Drop metastases in the spine.",
        complicationsSeriousAlternatives: "Rapid neurological decline.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sturge-Weber Syndrome",
        dominantImagingFinding: "Intense gyriform leptomeningeal enhancement with underlying brain atrophy and TRAM-TRACK calcification.",
        distributionLocation: "Unilateral (80%). Occipital lobe focus.",
        demographicsClinicalContext: "Port-wine stain on the face. Seizures.",
        discriminatingKeyFeature: "GYRIFORM enhancement and ipsilateral PORT-WINE STAIN. Associated with enlarged choroid plexus.",
        associatedFindings: "Calvarial thickening.",
        complicationsSeriousAlternatives: "Intractable epilepsy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "R ENAL ARTERY STENOSIS",
    itemNumber: "8.16",
    problemCluster: "renal narrowing",
    seriousAlternatives: ["Atherosclerosis (90%)", "Fibromuscular Dysplasia (FMD)", "Vasculitis (Takayasu)"],
    differentials: [
      {
        diagnosis: "Atherosclerotic RAS",
        dominantImagingFinding: "Narrowing of the renal artery origin. Associated with a SMALL, shrunken kidney.",
        distributionLocation: "OSTIUM (Origin) of the renal artery.",
        demographicsClinicalContext: "Older adults with systemic vascular disease. Smoking and HTN.",
        discriminatingKeyFeature: "OSTIAL location: Stenosis occurs within 1cm of the aorta. Most common cause of RAS (90%).",
        associatedFindings: "Abdominal aortic aneurysm or plaques.",
        complicationsSeriousAlternatives: "Renovascular hypertension and renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Fibromuscular Dysplasia (FMD)",
        dominantImagingFinding: "Alternating areas of narrowing and dilatation ('STRING-OF-BEADS' appearance).",
        distributionLocation: "MID and DISTAL segments of the renal artery. Characteristically spares the ostium.",
        demographicsClinicalContext: "Young females (20-40y). Sudden onset hypertension.",
        discriminatingKeyFeature: "STRING-OF-BEADS pattern and DISTAL location. Does not cause significant renal atrophy early on.",
        associatedFindings: "Carotid artery FMD.",
        complicationsSeriousAlternatives: "Arterial dissection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Takayasu Arteritis",
        dominantImagingFinding: "Smooth, long-segment narrowing of the renal artery and Aorta.",
        distributionLocation: "Proximal renal artery and abdominal aorta.",
        demographicsClinicalContext: "Young females. Asian descent. Weak pulses and raised inflammatory markers.",
        discriminatingKeyFeature: "LONG SEGMENT narrowing and AORTIC WALL thickening. Lacks the beads of FMD.",
        associatedFindings: "Coarctation of the abdominal aorta.",
        complicationsSeriousAlternatives: "Multi-organ ischaemia.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 27 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_27_DATA) {
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
  console.log("Batch 27 Complete!");
}

main().catch(console.error);