import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_18_DATA = [
  {
    pattern: "LOCALIZED OSTEOSCLEROSIS",
    itemNumber: "1.21",
    problemCluster: "solitary sclerosis",
    seriousAlternatives: ["Bone Island (Stable)", "Osteoid Osteoma", "Sclerotic Metastasis", "Primary Bone Sarcoma"],
    differentials: [
      {
        diagnosis: "Bone Island (Enostosis)",
        dominantImagingFinding: "Dense, homogeneous, cortical-like nodule. THORNY MARGINS (100% specific).",
        distributionLocation: "Anywhere. Common in the pelvis and proximal femur.",
        demographicsClinicalContext: "Asymptomatic incidental finding. Any age.",
        discriminatingKeyFeature: "THORNY/BRUSH-LIKE MARGINS that blend with normal trabeculae. Cold on bone scan. Absolutely stable.",
        associatedFindings: "Normal surrounding bone.",
        complicationsSeriousAlternatives: "None (Benign).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteoid Osteoma",
        dominantImagingFinding: "Intense reactive sclerosis surrounding a small (<1.5cm) radiolucent NIDUS.",
        distributionLocation: "Cortical location in long bones.",
        demographicsClinicalContext: "Young adults. Nocturnal pain relieved by Aspirin (90%).",
        discriminatingKeyFeature: "LUCENT NIDUS <1.5cm and dramatic clinical response to NSAIDs. Double-density sign on bone scan.",
        associatedFindings: "Focal hot spot on bone scan.",
        complicationsSeriousAlternatives: "Growth disturbance.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Sclerotic Metastasis (Solitary)",
        dominantImagingFinding: "Focal, ill-defined nodular sclerosis. Destroys normal trabecular architecture.",
        distributionLocation: "Axial skeleton (Spine/Pelvis).",
        demographicsClinicalContext: "Older adults. Known PROSTATE or BREAST primary.",
        discriminatingKeyFeature: "KNOWN PRIMARY CANCER and intensely hot bone scan. Often multiple, but can present solitary.",
        associatedFindings: "Elevated tumor markers.",
        complicationsSeriousAlternatives: "Fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "A SYMMETRICAL MATURATION",
    itemNumber: "14.4",
    problemCluster: "asymmetric bone age",
    seriousAlternatives: ["Hyperaemia (Infection/RA)", "Arteriovenous Malformation", "Prior Fracture"],
    differentials: [
      {
        diagnosis: "Regional Hyperaemia (Chronic Inflammation)",
        dominantImagingFinding: "Accelerated bone maturation in a single limb or joint area.",
        distributionLocation: "Localized to an inflamed joint (e.g. Juvenile Arthritis or Haemophilia).",
        demographicsClinicalContext: "Children with chronic joint swelling.",
        discriminatingKeyFeature: "LOCALIZED acceleration: Unlike CAH, only the involved limb is advanced. Associated with joint space narrowing or effusion.",
        associatedFindings: "Overgrowth of epiphyses (e.g. Ballooning of the femoral condyles).",
        complicationsSeriousAlternatives: "Limb length discrepancy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Arteriovenous Malformation (AVM)",
        dominantImagingFinding: "Regional acceleration of bone age associated with SOFT TISSUE HYPERTROPHY.",
        distributionLocation: "Single limb focus.",
        demographicsClinicalContext: "Children. Visible vascular birthmark or limb enlargement.",
        discriminatingKeyFeature: "SOFT TISSUE mass and vascular bruits. Bone age is advanced due to increased blood flow to the growth plates.",
        associatedFindings: "Klippel-Trenaunay syndrome.",
        complicationsSeriousAlternatives: "Heart failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "DESTRUCTION OF THE ORBITAL WALLS",
    itemNumber: "11.7",
    problemCluster: "aggressive orbital bone",
    seriousAlternatives: ["Orbital Malignancy (SCC/Lacrimal)", "Invasive Sinusitis", "Metastasis (Neuroblastoma in child)"],
    differentials: [
      {
        diagnosis: "Lacrimal Gland Carcinoma",
        dominantImagingFinding: "Soft tissue mass in the superior-lateral orbit with AGGRESSIVE BONE DESTRUCTION.",
        distributionLocation: "Superior-lateral quadrant focus.",
        demographicsClinicalContext: "Older adults. Hard, fixed mass. Proptosis.",
        discriminatingKeyFeature: "LOCATION: Mass centered on the lacrimal gland fossa with frank cortical destruction.",
        associatedFindings: "Nodal metastases.",
        complicationsSeriousAlternatives: "Intracranial invasion.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Metastatic Neuroblastoma (Orbit)",
        dominantImagingFinding: "Aggressive, moth-eaten bone destruction of the orbital walls with large soft tissue masses.",
        distributionLocation: "Lateral orbital wall/Sphenoid wing common. Bilateral (40%).",
        demographicsClinicalContext: "Children (<2y). 'Raccoon Eyes' (periorbital bruising).",
        discriminatingKeyFeature: "CHILDHOOD context and RACCOON EYES. High urinary catecholamines. Spiculated periosteal reaction.",
        associatedFindings: "Abdominal mass (Adrenal primary).",
        complicationsSeriousAlternatives: "Blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Invasive Sinusitis (Mucor/Aspergillus)",
        dominantImagingFinding: "Destruction of the medial orbital wall (Lamina papyracea) originating from the sinuses.",
        distributionLocation: "Medial orbital wall focus.",
        demographicsClinicalContext: "Immunocompromised or diabetic patients.",
        discriminatingKeyFeature: "IMMUNOCOMPROMISE and AIR-FLUID LEVEL in the adjacent sinuses. Rapidly progressive.",
        associatedFindings: "Cavernous sinus thrombosis.",
        complicationsSeriousAlternatives: "Death (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L ARYNGEAL MASS",
    itemNumber: "11.22",
    problemCluster: "laryngeal narrowing",
    seriousAlternatives: ["Laryngeal Carcinoma (SCC)", "Laryngocoele", "Vocal Cord Paralysis (Mimic)"],
    differentials: [
      {
        diagnosis: "Laryngeal SCC (Glottic/Supraglottic)",
        dominantImagingFinding: "Solid, enhancing soft tissue mass causing distortion of the larynx. CARTILAGE DESTRUCTION.",
        distributionLocation: "True vocal cords (Glottic 65%) or Epiglottis (Supraglottic).",
        demographicsClinicalContext: "Adult smokers. Hoarseness and weight loss.",
        discriminatingKeyFeature: "SOLID ENHANCEMENT and aggressive behavior. Glottic type is most common and presents early with hoarseness.",
        associatedFindings: "Necrotic Level II/III neck nodes.",
        complicationsSeriousAlternatives: "Airway obstruction (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Laryngocoele",
        dominantImagingFinding: "Fluid or air-filled mass arising from the laryngeal ventricle. Smooth expansion.",
        distributionLocation: "Paraglottic space. Internal or external extension.",
        demographicsClinicalContext: "Glassblowers or trumpet players. Chronic hoarseness.",
        discriminatingKeyFeature: "AIR or FLUID density: Lacks solid enhancement. If filled with pus, it's a Laryngopyocoele (Sepsis).",
        associatedFindings: "Dilated laryngeal ventricle.",
        complicationsSeriousAlternatives: "Infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Vocal Cord Paralysis",
        dominantImagingFinding: "Paramedian position of one vocal cord. DILATED Ipsi-lateral Pyriform Sinus.",
        distributionLocation: "Unilateral cord focus.",
        demographicsClinicalContext: "History of neck surgery (Thyroid) or recurrent laryngeal nerve invasion (Lung CA).",
        discriminatingKeyFeature: "NO MASS: The cord is paralyzed, not replaced by a tumor. Antero-medial rotation of the arytenoid cartilage.",
        associatedFindings: "Ipsilateral thyroid/hilar mass (causing palsy).",
        complicationsSeriousAlternatives: "Aspiration.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "I NCREASED UPTAKE ON BONE SCANS NOT DUE TO SKELETAL ABNORMALITY",
    itemNumber: "1.44",
    problemCluster: "soft tissue uptake",
    seriousAlternatives: ["Renal Uptake (Normal)", "Soft Tissue Calcification", "Injection Site Artifact", "Free Pertechnetate"],
    differentials: [
      {
        diagnosis: "Soft Tissue Calcification / Necrosis",
        dominantImagingFinding: "Focal 'hot' spot in the soft tissues (e.g. Myositis Ossificans, Dermatomyositis).",
        distributionLocation: "Muscles or skin. Extra-skeletal.",
        demographicsClinicalContext: "Prior trauma or known systemic sclerosis.",
        discriminatingKeyFeature: "EXTRA-SKELETAL location on lateral or oblique views. Matches area of calcinosis on X-ray.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Free Pertechnetate (Artifact)",
        dominantImagingFinding: "Uptake in the THYROID and STOMACH.",
        distributionLocation: "Neck (Thyroid) and Upper Abdomen (Stomach).",
        demographicsClinicalContext: "Technical artifact due to radiopharmaceutical breakdown.",
        discriminatingKeyFeature: "THYROID/STOMACH distribution: The tracer is not bound to MDP and accumulates in free-iodine-trapping organs.",
        associatedFindings: "Salivary gland uptake.",
        complicationsSeriousAlternatives: "None (scan quality only).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 18 (20 items - PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_18_DATA) {
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
  console.log("Part 1 complete!");
}

main().catch(console.error);