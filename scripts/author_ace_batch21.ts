import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_21_DATA = [
  {
    pattern: "L UCENT BONE LESION IN THE",
    itemNumber: "1.15",
    problemCluster: "cortical lucency",
    seriousAlternatives: ["Osteoid Osteoma", "Non-Ossifying Fibroma (NOF)", "Brodie Abscess", "Glomus Tumor"],
    differentials: [
      {
        diagnosis: "Osteoid Osteoma (Cortical)",
        dominantImagingFinding: "Tiny lucent NIDUS (<1.5cm) with surrounding MASSIVE reactive sclerosis.",
        distributionLocation: "Cortical location in long bone diaphyses (Femur/Tibia).",
        demographicsClinicalContext: "Young adults (10-25y). Intense nocturnal pain relieved by Aspirin.",
        discriminatingKeyFeature: "NIDUS size <1.5cm and dramatic clinical response to NSAIDs. Double-density sign on bone scan.",
        associatedFindings: "Focal hot spot on bone scan.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Non-Ossifying Fibroma (NOF)",
        dominantImagingFinding: "Well-defined eccentric lucency with a thin SCLEROTIC SCALLOPED MARGIN.",
        distributionLocation: "Metaphysis of long bones (Tibia/Femur).",
        demographicsClinicalContext: "Children/Adolescents. Asymptomatic incidental finding.",
        discriminatingKeyFeature: "SCALLOPED SCLEROTIC border and absence of pain or reactive sclerosis (unlike osteoid osteoma).",
        associatedFindings: "Migrates away from physis with growth.",
        complicationsSeriousAlternatives: "Pathological fracture (if >50% width).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Brodie Abscess (Cortical)",
        dominantImagingFinding: "Elongated serpentine lucency with a thick sclerotic rim. 'PENUMBRA SIGN' on MRI.",
        distributionLocation: "Metaphysis or cortex.",
        demographicsClinicalContext: "Children or IVDU. Chronic localized pain. No systemic fever.",
        discriminatingKeyFeature: "PENUMBRA SIGN (T1 hyperintense rim) and serpentine tract crossing the physis.",
        associatedFindings: "Cloaca (draining sinus).",
        complicationsSeriousAlternatives: "Chronic osteomyelitis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "LOCALIZED PERIOSTEAL REACTION",
    itemNumber: "1.25",
    problemCluster: "focal periostitis",
    seriousAlternatives: ["Osteosarcoma", "Stress Fracture", "Osteomyelitis", "Healing Fracture"],
    differentials: [
      {
        diagnosis: "Osteosarcoma",
        dominantImagingFinding: "Aggressive cloud-like osteoid matrix. SUNBURST or CODMAN TRIANGLE periosteal reaction.",
        distributionLocation: "Metaphysis around the knee (Distal Femur/Proximal Tibia).",
        demographicsClinicalContext: "Adolescents. Pain and soft tissue mass.",
        discriminatingKeyFeature: "SUNBURST reaction and large soft tissue mass. Presence of cloud-like tumor osteoid.",
        associatedFindings: "Cortical destruction.",
        complicationsSeriousAlternatives: "Early pulmonary metastases.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Stress Fracture (Healing)",
        dominantImagingFinding: "Solid, benign periosteal reaction with a matching linear lucency (fracture line).",
        distributionLocation: "Tibia diaphysis or Metatarsals.",
        demographicsClinicalContext: "Athletes or military recruits. Sudden change in activity.",
        discriminatingKeyFeature: "LINEAR lucency and solid mature periostitis. Patient history of overuse.",
        associatedFindings: "Endosteal thickening.",
        complicationsSeriousAlternatives: "Complete fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Osteoid Osteoma (Reaction)",
        dominantImagingFinding: "Massive solid periosteal reaction surrounding a tiny nidus. Mimics a stress fracture.",
        distributionLocation: "Cortex of long bones.",
        demographicsClinicalContext: "Young adults. Night pain.",
        discriminatingKeyFeature: "NIDUS size and dramatic response to Aspirin. CT reveals the small central nidus.",
        associatedFindings: "Intense focal uptake on scan.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "G ALLBLADDER CALCULI",
    itemNumber: "7.4",
    problemCluster: "gallstones",
    seriousAlternatives: ["Cholesterol Stones (80%)", "Pigment Stones", "Porcelain GB (Mimic)", "Emphysematous Cholecystitis"],
    differentials: [
      {
        diagnosis: "Cholesterol Gallstones",
        dominantImagingFinding: "Mobile, echogenic foci with POSTERIOR ACOUSTIC SHADOWING on US. Often radiolucent on X-ray.",
        distributionLocation: "Dependent part of the gallbladder.",
        demographicsClinicalContext: "Adult females. Obesity. Asymptomatic or biliary colic.",
        discriminatingKeyFeature: "POSTERIOR SHADOWING and mobility. 80% are cholesterol-predominant and not seen on plain film.",
        associatedFindings: "WES sign (Wall-Echo-Shadow) if GB is full of stones.",
        complicationsSeriousAlternatives: "Acute cholecystitis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pigment Stones (Black/Brown)",
        dominantImagingFinding: "Multiple small stones. Characteristically RADIO-OPAQUE on X-ray (50%).",
        distributionLocation: "Gallbladder.",
        demographicsClinicalContext: "Sickle Cell Disease or chronic haemolysis (Black stones). Biliary stasis/Infection (Brown stones).",
        discriminatingKeyFeature: "RADIO-OPACITY: 50% of pigment stones contain enough calcium to be seen on plain film or CT.",
        associatedFindings: "Small, calcified spleen (Autosplenectomy).",
        complicationsSeriousAlternatives: "Choledocholithiasis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Gallbladder Polyps (Mimic)",
        dominantImagingFinding: "Echogenic wall-based nodules. NO posterior shadowing.",
        distributionLocation: "Fixed to the GB wall.",
        demographicsClinicalContext: "Incidental finding.",
        discriminatingKeyFeature: "NON-MOBILE and NO SHADOWING: Unlike stones, polyps do not fall to the dependent wall and don't shadow.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Malignancy (if >10mm).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "D ENSE METAPHYSEAL BANDS",
    itemNumber: "14.19",
    problemCluster: "white metaphyseal lines",
    seriousAlternatives: ["Growth Arrest Lines", "Lead Poisoning", "Healing Rickets", "Syphilis"],
    differentials: [
      {
        diagnosis: "Lead Poisoning (Lead Lines)",
        dominantImagingFinding: "VERY DENSE, thick transverse bands at the zone of provisional calcification. Denser than the cortex.",
        distributionLocation: "Metaphyses of knees and wrists. Bilateral and symmetric.",
        demographicsClinicalContext: "Children with pica or old housing. Irritability.",
        discriminatingKeyFeature: "DENSITY: The lines are pathologically dense. Associated with 'Lead flakes' in the GI tract.",
        associatedFindings: "Opaque material in the bowel.",
        complicationsSeriousAlternatives: "Encephalopathy (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Growth Arrest Lines (Harris Lines)",
        dominantImagingFinding: "Multiple, thin, faint transverse dense lines. Normal cortical density.",
        distributionLocation: "Metaphyses. Symmetrical.",
        demographicsClinicalContext: "Follows recovery from systemic illness or starvation.",
        discriminatingKeyFeature: "THINNESS and multiplicity. Represents intermittent growth recovery. Lacks the extreme density of lead.",
        associatedFindings: "Normal bone density.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Healing Rickets",
        dominantImagingFinding: "Dense bands at the metaphyses as the growth plate 'fills in' with minerals.",
        distributionLocation: "Knee and wrist.",
        demographicsClinicalContext: "Children undergoing treatment for Vitamin D deficiency.",
        discriminatingKeyFeature: "RESORPTION OF FRAYING: The dense band appears as the frayed metaphysis becomes well-defined again. History of treatment.",
        associatedFindings: "Residual bowing.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Congenital Syphilis",
        dominantImagingFinding: "Dense bands associated with METAPHYSEAL EROSIONS (Wimberger sign of the tibia).",
        distributionLocation: "Medial proximal tibia (Wimberger Sign).",
        demographicsClinicalContext: "Neonates with hepatosplenomegaly and rash.",
        discriminatingKeyFeature: "WIMBERGER SIGN: Focal erosion of the medial aspect of the proximal tibia is pathognomonic.",
        associatedFindings: "Periostitis.",
        complicationsSeriousAlternatives: "Early death.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "P ULMONARY ARTERY DILATATION",
    itemNumber: "5.18",
    problemCluster: "dilated PA",
    seriousAlternatives: ["Pulmonary Hypertension", "Left-to-Right Shunt (ASD/VSD)", "Post-stenotic Dilatation"],
    differentials: [
      {
        diagnosis: "Pulmonary Hypertension (PAH)",
        dominantImagingFinding: "MAIN PULMONARY ARTERY >29mm. Rapid peripheral pruning of vessels.",
        distributionLocation: "Central pulmonary arteries focus.",
        demographicsClinicalContext: "COPD, chronic PE, or primary PAH. Progressive dyspnoea.",
        discriminatingKeyFeature: "PRUNING: Large central vessels and small/absent peripheral vessels. Associated with RV enlargement.",
        associatedFindings: "Right heart failure.",
        complicationsSeriousAlternatives: "Cor pulmonale.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "ASD / VSD (Left-to-Right Shunt)",
        dominantImagingFinding: "Dilated Main PA with INCREASED peripheral vascularity (Plethora).",
        distributionLocation: "Global pulmonary plethora.",
        demographicsClinicalContext: "Children or young adults. Murmur.",
        discriminatingKeyFeature: "PLETHORA: Peripheral vessels are large and visible to the outer third of the lung (unlike PAH).",
        associatedFindings: "Enlarged LA/LV.",
        complicationsSeriousAlternatives: "Eisenmenger syndrome.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pulmonary Valve Stenosis (Post-stenotic)",
        dominantImagingFinding: "Dilatation of the LEFT PULMONARY ARTERY only. Normal right PA.",
        distributionLocation: "Left pulmonary artery focus.",
        demographicsClinicalContext: "Children or young adults with a systolic murmur.",
        discriminatingKeyFeature: "ASYMMETRY: Only the left PA is dilated due to the direction of the stenotic jet. Normal pulmonary vascularity.",
        associatedFindings: "Calcified pulmonary valve.",
        complicationsSeriousAlternatives: "RV failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PELVIC MASS IN THE NEWBORN FEMALE",
    itemNumber: "13.13",
    problemCluster: "neonatal pelvis",
    seriousAlternatives: ["Hydrometrocolpos", "Ovarian Cyst", "Sacrococcygeal Teratoma"],
    differentials: [
      {
        diagnosis: "Hydrometrocolpos",
        dominantImagingFinding: "Large, fluid-filled midline pelvic mass behind the bladder. DISPLACES the bladder anteriorly.",
        distributionLocation: "Midline pelvis (Vagina/Uterus).",
        demographicsClinicalContext: "Newborn girls. Associated with imperforate hymen or vaginal atresia.",
        discriminatingKeyFeature: "MIDLINE and POST-BLADDER: The mass is the dilated vagina. Associated with neonatal hydronephrosis.",
        associatedFindings: "Hydro-ureter.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Neonatal Ovarian Cyst",
        dominantImagingFinding: "Simple cyst, often large (>4cm). Characteristically lateral to the midline.",
        distributionLocation: "Lateral adnexal focus.",
        demographicsClinicalContext: "Newborn girls. Secondary to maternal hormone stimulation.",
        discriminatingKeyFeature: "LATERAL location and simple cystic appearance. Typically resolves spontaneously in 3-6 months.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Ovarian torsion.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sacrococcygeal Teratoma (SCT)",
        dominantImagingFinding: "Large complex mass containing fat, fluid, and CALCIFICATION. Arises from the coccyx.",
        distributionLocation: "Presacral space extending externally.",
        demographicsClinicalContext: "Most common neonatal tumor. Visible external mass (Type I).",
        discriminatingKeyFeature: "ORIGIN: Arises from the coccyx. Contains internal fat and calcified elements. High risk of malignancy if predominantly internal.",
        associatedFindings: "Elevated AFP.",
        complicationsSeriousAlternatives: "High-output cardiac failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 21 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_21_DATA) {
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
  console.log("Batch 21 Complete!");
}

main().catch(console.error);