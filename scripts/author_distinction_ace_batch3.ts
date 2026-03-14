import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const HIGH_YIELD_ACE = [
  {
    pattern: "PNEUMOPERITONEUM",
    problemCluster: "free gas",
    seriousAlternatives: ["Perforated Peptic Ulcer", "Perforated Diverticulitis", "Ischaemic Bowel"],
    differentials: [
      {
        diagnosis: "Perforated Peptic Ulcer",
        dominantImagingFinding: "LARGE VOLUME free gas. RIGLER SIGN (100% specific on supine AXR).",
        distributionLocation: "Subdiaphragmatic (Erect CXR) or Anterior (Supine AXR).",
        demographicsClinicalContext: "Sudden onset severe epigastric pain. NSAID or Steroid use.",
        discriminatingKeyFeature: "RIGLER SIGN (Gas on both sides of bowel wall) and gas in MORRISON'S POUCH.",
        associatedFindings: "Fluid in the upper quadrants.",
        complicationsSeriousAlternatives: "Septic Shock (URGENT).",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Post-Operative Gas",
        dominantImagingFinding: "Small volumes of free gas. Decreases on serial films.",
        distributionLocation: "Anterior abdomen.",
        demographicsClinicalContext: "Prior Laparotomy or Laparoscopy (within 7-10 days).",
        discriminatingKeyFeature: "STABLE or decreasing volume without peritonism.",
        associatedFindings: "Surgical clips or drains.",
        complicationsSeriousAlternatives: "Anastomotic leak (if gas increases).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Perforated Diverticulitis",
        dominantImagingFinding: "Focal bubbles of extraluminal gas adjacent to sigmoid colon.",
        distributionLocation: "Left Lower Quadrant / Pelvis.",
        demographicsClinicalContext: "Elderly. Chronic constipation and LIF pain.",
        discriminatingKeyFeature: "SIGMOID WALL THICKENING and associated abscess/bubbles.",
        associatedFindings: "Diverticula presence.",
        complicationsSeriousAlternatives: "Faecal peritonitis.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "D ILATED SMALL BOWEL",
    problemCluster: "dilated small bowel",
    seriousAlternatives: ["Strangulated Hernia", "Bowel Infarction", "Closed-loop Obstruction"],
    differentials: [
      {
        diagnosis: "Mechanical SBO",
        dominantImagingFinding: "Dilated loops (>3cm). Multiple air-fluid levels. STRING OF PEARLS sign.",
        distributionLocation: "Central abdomen.",
        demographicsClinicalContext: "Prior surgery (adhesions 70%) or known Hernia.",
        discriminatingKeyFeature: "DISCRETE TRANSITION POINT on CT and collapsed distal bowel.",
        associatedFindings: "Feculent small bowel content (Small Bowel Faeces sign).",
        complicationsSeriousAlternatives: "Strangulation (Ischaemia).",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Paralytic Ileus",
        dominantImagingFinding: "Dilatation of BOTH small and large bowel. Gas in Rectum.",
        distributionLocation: "Generalised.",
        demographicsClinicalContext: "Post-operative (within 48h) or Hypokalaemia.",
        discriminatingKeyFeature: "PROPORTIONATE dilatation without a transition point.",
        associatedFindings: "Generalised abdominal density.",
        complicationsSeriousAlternatives: "Underlying Sepsis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Coeliac Disease",
        dominantImagingFinding: "MOULAGE SIGN (clumping of barium). FOLD REVERSAL (Jejunisation of Ileum).",
        distributionLocation: "Diffuse small bowel.",
        demographicsClinicalContext: "Malabsorption and steatorrhoea.",
        discriminatingKeyFeature: "FOLD REVERSAL (Jeunal folds < Ileal folds) and dilated loops.",
        associatedFindings: "Cavitating mesenteric lymph nodes.",
        complicationsSeriousAlternatives: "EATL (Lymphoma).",
        isCorrectDiagnosis: false
      }
    ]
  }
];

async function main() {
  console.log("Authoring distinction-quality ACE Batch 3 (GI)...");
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
  console.log("Batch 3 complete!");
}

main().catch(console.error);