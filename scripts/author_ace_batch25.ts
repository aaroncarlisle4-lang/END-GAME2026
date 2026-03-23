import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_25_DATA = [
  {
    pattern: "SCOLIOSIS",
    itemNumber: "2.1",
    problemCluster: "spinal curvature",
    seriousAlternatives: ["Idiopathic (Most common)", "Neuromuscular", "Congenital", "Neurofibromatosis"],
    differentials: [
      {
        diagnosis: "Idiopathic Scoliosis",
        dominantImagingFinding: "Lateral curvature of the spine without identifiable vertebral anomalies. R-thoracic focus (90%).",
        distributionLocation: "Thoracic spine focus. Curvature convex to the RIGHT (90%).",
        demographicsClinicalContext: "Adolescent females (8:1). Healthy children. Risser stage used for maturity.",
        discriminatingKeyFeature: "CONVEX TO RIGHT and normal vertebral morphology. If convex to LEFT, must suspect underlying syrinx or tumor (MRI needed).",
        associatedFindings: "Rotation of the vertebrae (Rib hump).",
        complicationsSeriousAlternatives: "Respiratory compromise if severe (>60-70 degrees).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Congenital Scoliosis",
        dominantImagingFinding: "Curvature associated with vertebral anomalies: HEMIVERTEBRAE, Butterfly vertebrae, or Block vertebrae.",
        distributionLocation: "Localized to the site of the anomaly.",
        demographicsClinicalContext: "Infants/Children. Associated with VACTERL anomalies.",
        discriminatingKeyFeature: "VERTEBRAL ANOMALIES: Presence of developmental vertebral defects. High risk of progressive deformity.",
        associatedFindings: "Renal and cardiac anomalies.",
        complicationsSeriousAlternatives: "Diastematomyelia.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Neurofibromatosis (Scoliosis)",
        dominantImagingFinding: "Sharp, short-segment curve ('DYSTROPHIC' scoliosis). RIBBON-LIKE RIBS.",
        distributionLocation: "Typically mid-thoracic spine.",
        demographicsClinicalContext: "NF1 diagnosis. Skin café-au-lait spots.",
        discriminatingKeyFeature: "SHARP/ANGULAR curve involving 4-6 segments. Associated with posterior vertebral scalloping and enlarged neural foramina.",
        associatedFindings: "Lateral meningocoele.",
        complicationsSeriousAlternatives: "Rapid progression.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M EGACOLON IN AN ADULT",
    itemNumber: "6.26",
    problemCluster: "dilated colon",
    seriousAlternatives: ["Toxic Megacolon (URGENT)", "Ogilvie Syndrome", "Mechanical Obstruction", "Hirschsprung (Adult)"],
    differentials: [
      {
        diagnosis: "Toxic Megacolon",
        dominantImagingFinding: "Massive colonic dilatation (>6cm) with LOSS of normal haustral markings. MUCOSAL ISLANDS.",
        distributionLocation: "Transverse colon focus (anterior).",
        demographicsClinicalContext: "Acute severe colitis (UC or C. diff). Sepsis, fever, and tachycardia.",
        discriminatingKeyFeature: "MUCOSAL ISLANDS and systemic toxicity. Represents full-thickness inflammation and imminent perforation. URGENT.",
        associatedFindings: "Pneumatosis intestinalis (rare).",
        complicationsSeriousAlternatives: "Perforation and death.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ogilvie Syndrome (Acute Pseudo-obstruction)",
        dominantImagingFinding: "Massive dilatation of the entire colon, including the RECTUM. No transition point.",
        distributionLocation: "Generalised colonic dilatation.",
        demographicsClinicalContext: "Elderly, bed-bound patients or post-surgical (Orthopedic). Clinically stable early on.",
        discriminatingKeyFeature: "LACK OF TOXICITY and absence of a mechanical block. Bowel is dilated due to autonomic dysfunction. Gas reaches the rectum.",
        associatedFindings: "Normal mucosal pattern.",
        complicationsSeriousAlternatives: "Caecal perforation (if >10-12cm).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mechanical Large Bowel Obstruction",
        dominantImagingFinding: "Dilated proximal colon with collapsed distal segment. TRANSITION POINT.",
        distributionLocation: "Proximal to the site of obstruction (e.g. Sigmoid tumor).",
        demographicsClinicalContext: "Elderly. Altered bowel habit. Hard abdomen.",
        discriminatingKeyFeature: "TRANSITION POINT on CT: Identifiable mass (e.g. Apple-core lesion) or volvulus. Distal colon/rectum is gasless.",
        associatedFindings: "Faecalization of small bowel.",
        complicationsSeriousAlternatives: "Strangulation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "BREAST MASS IN a MALE",
    itemNumber: "10.15",
    problemCluster: "male breast mass",
    seriousAlternatives: ["Gynaecomastia", "Male Breast Carcinoma", "Epidermoid Cyst"],
    differentials: [
      {
        diagnosis: "Gynaecomastia",
        dominantImagingFinding: "Subareolar, flame-shaped or dendritic soft tissue density. Symmetrical or asymmetric.",
        distributionLocation: "Strictly SUBAREOLAR (behind the nipple).",
        demographicsClinicalContext: "Puberty, elderly, or drugs (Spironolactone). Cirrhosis.",
        discriminatingKeyFeature: "SUBAREOLAR location and symmetry. Most common male breast mass. Smooth margins.",
        associatedFindings: "Testicular atrophy (if systemic).",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Male Breast Carcinoma",
        dominantImagingFinding: "ECCENTRIC, irregular solid mass. Spiculation and skin thickening common.",
        distributionLocation: "Typically eccentric to the nipple (unlike gynaecomastia).",
        demographicsClinicalContext: "Older males (>60y). Hard fixed lump. Associated with BRCA2.",
        discriminatingKeyFeature: "ECCENTRIC location and spiculation. Gynaecomastia is characteristically centered. 1% of all breast cancers.",
        associatedFindings: "Axillary adenopathy.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "NASAL OBSTRUCTION",
    itemNumber: "11.14",
    problemCluster: "nasal narrowing",
    seriousAlternatives: ["Septal Deviation", "Nasal Polyps", "Antrochoanal Polyp", "Inverting Papilloma", "SCC"],
    differentials: [
      {
        diagnosis: "Nasal Polyps",
        dominantImagingFinding: "Multiple soft tissue masses in the nasal passages. Widening of the nasal cavity.",
        distributionLocation: "Bilateral and symmetric common. Middle meatus.",
        demographicsClinicalContext: "Adults with asthma and aspirin sensitivity (Samter Triad). Chronic sinusitis.",
        discriminatingKeyFeature: "BILATERALITY and 'Bubbly' appearance on CT. No bone destruction (though can cause pressure erosion).",
        associatedFindings: "Pansinusitis.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Antrochoanal Polyp",
        dominantImagingFinding: "Solitary mass extending from the maxillary sinus through a WIDENED OSTIUM into the choana.",
        distributionLocation: "Unilateral. Maxillary antrum to Nasopharynx.",
        demographicsClinicalContext: "Young adults. Unilateral obstruction.",
        discriminatingKeyFeature: "UNILATERALITY and origin from the MAXILLARY sinus. Passes through the accessory ostium.",
        associatedFindings: "Opacified maxillary sinus.",
        complicationsSeriousAlternatives: "Airway obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Septal Deviation",
        dominantImagingFinding: "Bony and cartilaginous deviation of the midline septum.",
        distributionLocation: "Midline nasal cavity.",
        demographicsClinicalContext: "History of nasal trauma.",
        discriminatingKeyFeature: "BONY ANATOMY: No soft tissue mass. The obstruction is purely due to the warped septum.",
        associatedFindings: "Compensatory turbinate hypertrophy.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "D ILATED URETER",
    itemNumber: "8.31",
    problemCluster: "ureteromegaly",
    seriousAlternatives: ["Distal Calculus", "VUR", "Primary Megaureter", "Ureteric TCC"],
    differentials: [
      {
        diagnosis: "Distal Ureteric Calculus",
        dominantImagingFinding: "Hydroureter and hydronephrosis proximal to a dense stone. Perinephric stranding.",
        distributionLocation: "Point of narrowing (VUJ, Pelvic brim).",
        demographicsClinicalContext: "Acute severe loin pain. Haematuria.",
        discriminatingKeyFeature: "FOCAL STONE and acute onset. 90% of symptomatic stones are radio-opaque on CT (>400 HU).",
        associatedFindings: "Rim sign (ureteric wall oedema around stone).",
        complicationsSeriousAlternatives: "Pyonephrosis (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Vesicoureteric Reflux (VUR)",
        dominantImagingFinding: "Intermittent ureteric dilatation. Associated with renal scarring.",
        distributionLocation: "Bilateral or unilateral. Continuous with the bladder.",
        demographicsClinicalContext: "Children with UTIs.",
        discriminatingKeyFeature: "VCUG: Contrast refluxes from the bladder into the ureter during voiding. No transition point.",
        associatedFindings: "Renal polar scars.",
        complicationsSeriousAlternatives: "Reflux nephropathy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Primary Megaureter",
        dominantImagingFinding: "Fusiform dilatation of the distal ureter. ADYNAMIC juxtavesical segment.",
        distributionLocation: "Distal third of the ureter.",
        demographicsClinicalContext: "Infants/Children. Prenatal diagnosis.",
        discriminatingKeyFeature: "ADYNAMIC SEGMENT: Short narrowed segment at the VUJ without stone or reflux. Normal bladder.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "Stones from stasis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 25 (Final Push)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_25_DATA) {
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
  console.log("Batch 25 Complete!");
}

main().catch(console.error);