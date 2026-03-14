import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const UPDATES = [
  {
    mnemonic: "SCALD",
    pattern: "Solid mesenteric/peritoneal mass",
    expanded: "S: Sclerosing mesenteritis, C: Carcinoid, A: Adenocarcinoma (Mets), L: Lymphoma, D: Desmoid",
    problemCluster: "mesenteric mass",
    seriousAlternatives: ["Metastatic Carcinoid", "Desmoid Tumor", "Mesenteric Lymphoma"],
    differentials: [
      {
        diagnosis: "Carcinoid (Metastatic)",
        dominantImagingFinding: "SPICULATED soft tissue mass with DESMOPLASTIC reaction (100% specific).",
        distributionLocation: "Root of the mesentery.",
        demographicsClinicalContext: "Adults. Carcinoid syndrome in 10%.",
        discriminatingKeyFeature": "STIPPLED CALCIFICATION (70%) and bright arterial enhancement.",
        associatedFindings": "Kinking of bowel loops.",
        complicationsSeriousAlternatives": "Bowel ischaemia.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Desmoid Tumor",
        dominantImagingFinding: "SOLID, homogeneous mass. ABSENCE of calcification.",
        distributionLocation: "Mesentery or abdominal wall. Surgical scar site.",
        demographicsClinicalContext: "Post-surgical (90%) or Gardner Syndrome.",
        discriminatingKeyFeature": "LACK of calcification or desmoplastic reaction.",
        associatedFindings": "Gardner Syndrome markers.",
        complicationsSeriousAlternatives": "Ureteric obstruction.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Sclerosing Mesenteritis",
        dominantImagingFinding: "MISTY MESENTERY: Increased attenuation (100%). FAT-RING SIGN.",
        distributionLocation: "Small bowel mesentery.",
        demographicsClinicalContext: "Older males. Asymptomatic.",
        discriminatingKeyFeature": "FAT-RING SIGN: Preservation of fat around vessels (Pathognomonic).",
        associatedFindings": "Small mesenteric nodes.",
        complicationsSeriousAlternatives": "Bowel obstruction.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Mesenteric Lymphoma",
        dominantImagingFinding: "BULKY masses. SANDWICH SIGN (100% classic).",
        distributionLocation: "Mesentery and retroperitoneum.",
        demographicsClinicalContext: "Adults. B-symptoms.",
        discriminatingKeyFeature": "SANDWICH SIGN: Vessels encased but not narrowed.",
        associatedFindings": "Splenomegaly.",
        complicationsSeriousAlternatives": "Perforation during chemo.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Adenocarcinoma (Metastatic)",
        dominantImagingFinding: "Multiple soft tissue nodules and plaques studding the peritoneum (Omental Caking).",
        distributionLocation: "Diffuse peritoneal spread.",
        demographicsClinicalContext: "Known primary adenocarcinoma: OVARIAN, STOMACH, or COLON.",
        discriminatingKeyFeature": "OMENTAL CAKING and massive ascites. Nodules enhance intensely.",
        associatedFindings": "Scalloping of the liver/spleen surface.",
        complicationsSeriousAlternatives": "Small bowel obstruction.",
        isCorrectDiagnosis": false
      }
    ]
  },
  {
    mnemonic: "PAGES",
    pattern: "Pneumobilia",
    expanded: "P: Perforated ulcer, A: Anastomosis (biliary-enteric), G: Gallstone ileus, E: ERCP / Emphysematous cholecystitis, S: Sphincterotomy",
    problemCluster: "biliary gas",
    seriousAlternatives: ["Gallstone Ileus", "Emphysematous Cholecystitis", "Perforated Ulcer"],
    differentials: [
      {
        diagnosis: "Gallstone Ileus",
        dominantImagingFinding: "RIGLER TRIAD (100% specific): SBO, Pneumobilia, Ectopic stone.",
        distributionLocation: "Ileocaecal valve (60%).",
        demographicsClinicalContext: "Older females. Cholelithiasis history.",
        discriminatingKeyFeature": "RIGLER TRIAD and small bowel obstruction.",
        associatedFindings": "Small bowel air-fluid levels.",
        complicationsSeriousAlternatives": "Perforation.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Emphysematous Cholecystitis",
        dominantImagingFinding: "GAS IN WALL (100% specific) or lumen.",
        distributionLocation: "Gallbladder fossa.",
        demographicsClinicalContext: "DIABETES (40%). Sepsis.",
        discriminatingKeyFeature": "INTRAMURAL GAS and clinical sepsis.",
        associatedFindings": "Wall thickening.",
        complicationsSeriousAlternatives": "Perforation (5x risk).",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Recent ERCP / Sphincterotomy",
        dominantImagingFinding: "Linear air in CBD.",
        distributionLocation: "Central ducts.",
        demographicsClinicalContext: "Recent procedure (100%).",
        discriminatingKeyFeature": "PROCEDURAL HISTORY and absence of sepsis.",
        associatedFindings": "Biliary stent.",
        complicationsSeriousAlternatives": "Pancreatitis.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Perforated Duodenal Ulcer",
        dominantImagingFinding: "FREE AIR (Pneumoperitoneum).",
        distributionLocation: "Subdiaphragmatic.",
        demographicsClinicalContext: "Acute surgical abdomen.",
        discriminatingKeyFeature": "RIGLER SIGN (double wall) and lack of biliary branching.",
        associatedFindings": "Morrison's pouch fluid.",
        complicationsSeriousAlternatives": "Septic shock.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Biliary-Enteric Anastomosis",
        dominantImagingFinding: "Permanent diffuse pneumobilia.",
        distributionLocation: "Diffuse intrahepatic ducts.",
        demographicsClinicalContext: "History of Whipple's or hepaticojejunostomy.",
        discriminatingKeyFeature": "SURGICAL HISTORY and absence of the gallbladder.",
        associatedFindings": "Surgical clips.",
        complicationsSeriousAlternatives": "Anastomotic stricture.",
        isCorrectDiagnosis": false
      }
    ]
  },
  {
    mnemonic: "MARSH",
    pattern: "Nephrocalcinosis",
    expanded: "M: Medullary sponge kidney, A: Acidosis (Renal tubular), R: Rare (Oxalosis), S: Sarcoidosis, H: Hyperparathyroidism",
    problemCluster: "renal calcification",
    seriousAlternatives: ["Type 1 RTA", "Oxalosis", "HPT"],
    differentials: [
      {
        diagnosis: "Medullary Sponge Kidney",
        dominantImagingFinding: "BOUQUET OF FLOWERS (100% classic).",
        distributionLocation: "Medullary pyramids.",
        demographicsClinicalContext: "Adults. Incidental.",
        discriminatingKeyFeature": "BOUQUET pattern and normal function.",
        associatedFindings": "Nephrolithiasis.",
        complicationsSeriousAlternatives": "UTIs.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Renal Tubular Acidosis (Type 1)",
        dominantImagingFinding: "DENSE medullary calcification (90%).",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Hypokalaemia. ALKALINE URINE (pH >5.5).",
        discriminatingKeyFeature": "SEVERE nephrocalcinosis and alkaline urine.",
        associatedFindings": "Osteomalacia.",
        complicationsSeriousAlternatives": "Chronic renal failure.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Primary Oxalosis",
        dominantImagingFinding: "CORTICAL + Medullary calcification (100% specific).",
        distributionLocation: "Bilateral. Entire kidney.",
        demographicsClinicalContext: "Children. Severe renal failure.",
        discriminatingKeyFeature": "CORTICAL CALCIFICATION (unique to oxalosis).",
        associatedFindings": "Systemic deposits.",
        complicationsSeriousAlternatives": "ESRD.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Hyperparathyroidism (Primary)",
        dominantImagingFinding: "Diffuse medullary stippling.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "High Calcium, High PTH.",
        discriminatingKeyFeature": "SUBPERIOSTEAL RESORPTION (phalanges) and Salt-and-pepper skull.",
        associatedFindings": "Brown tumors.",
        complicationsSeriousAlternatives": "Renal failure.",
        isCorrectDiagnosis": false
      },
      {
        diagnosis: "Sarcoidosis (Renal)",
        dominantImagingFinding: "Nephrocalcinosis and occasional renal masses.",
        distributionLocation: "Diffuse medullary calcification.",
        demographicsClinicalContext: "Known systemic sarcoidosis. Hypercalciuria.",
        discriminatingKeyFeature": "SYMMETRIC HILAR NODES and elevated ACE levels.",
        associatedFindings": "Hypercalcaemia.",
        complicationsSeriousAlternatives": "Interstitial nephritis.",
        isCorrectDiagnosis": false
      }
    ]
  }
];

async function main() {
  console.log("Seeding final A-star completion batch...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.mnemonicRef?.mnemonic === update.mnemonic || 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      console.log(`Updating ${update.mnemonic}`);
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
      console.log(`Creating ${update.mnemonic}`);
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