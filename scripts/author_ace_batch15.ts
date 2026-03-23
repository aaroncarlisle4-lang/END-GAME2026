import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_15_DATA = [
  {
    pattern: "EXCESSIVE CALLUS FORMATION",
    itemNumber: "1.28",
    problemCluster: "excessive callus",
    seriousAlternatives: ["Osteogenesis Imperfecta (Type V)", "Neuropathic Fracture", "Cushing Syndrome", "Infection"],
    differentials: [
      {
        diagnosis: "Osteogenesis Imperfecta (Type V)",
        dominantImagingFinding: "Hypertrophic, exuberant callus formation following minor fractures or surgery. 'Cloud-like' appearance.",
        distributionLocation: "Typically long bones (Femur/Radius).",
        demographicsClinicalContext: "Children. Specific OI subtype characterized by hyperplastic callus. Normal sclerae.",
        discriminatingKeyFeature: "EXUBERANT CALLUS and calcification of the interosseous membranes (e.g. Radius/Ulna). High risk of pseudo-sarcoma appearance.",
        associatedFindings: "Generalized osteopenia and prior fracture scars.",
        complicationsSeriousAlternatives: "Functional impairment.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Neuropathic (Charcot) Fracture",
        dominantImagingFinding: "Massive, disorganized callus around a fracture in a joint with sensory loss.",
        distributionLocation: "Foot/Ankle (Diabetes) or Knee.",
        demographicsClinicalContext: "Adults with diabetic neuropathy or syringomyelia.",
        discriminatingKeyFeature: "DISORGANIZATION: Extreme amounts of bone debris and callus. Patient feels minimal pain despite severe destruction.",
        associatedFindings: "Joint dislocation and sclerosis.",
        complicationsSeriousAlternatives: "Superimposed infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Cushing Syndrome / Steroid Use",
        dominantImagingFinding: "Abundant, 'Puffy' or exuberant callus around insufficiency fractures (e.g. Ribs/Pelvis).",
        distributionLocation: "Ribs and Pelvis (insufficiency sites).",
        demographicsClinicalContext: "Endogenous Cushing's or chronic high-dose corticosteroid therapy.",
        discriminatingKeyFeature: "PUFFY CALLUS and diffuse profound OSTEOPOROSIS. Fractures are often painless or minimally painful.",
        associatedFindings: "Centripetal obesity and skin striae.",
        complicationsSeriousAlternatives: "Multiple fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "RETARDED SKELETAL MATURATION",
    itemNumber: "14.1",
    problemCluster: "delayed bone age",
    seriousAlternatives: ["Hypothyroidism", "Growth Hormone Deficiency", "Chronic Systemic Disease", "Constitutional Delay"],
    differentials: [
      {
        diagnosis: "Hypothyroidism (Cretinism)",
        dominantImagingFinding: "SEVERE delay in bone age. STIPPLED or fragmented epiphyses (Dysgenesis).",
        distributionLocation: "Generalized. Most evident in the femoral heads and carpals.",
        demographicsClinicalContext: "Infants. Intellectual disability, coarse hair, and large tongue.",
        discriminatingKeyFeature: "EPIPHYSEAL DYSGENESIS: Fragmented, multiple centers of ossification within a single epiphysis. Bone age is the most severely retarded of all causes.",
        associatedFindings: "Wormian bones and widened sutures.",
        complicationsSeriousAlternatives: "Permanent intellectual disability.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Constitutional Delay",
        dominantImagingFinding: "Moderate delay in bone age. Epiphyses are morphologically NORMAL.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Late bloomers. Family history of late puberty. Child is short but growing at a normal rate.",
        discriminatingKeyFeature: "NORMAL MORPHOLOGY: Bone age matches the height age. Predicted adult height is usually normal. No systemic illness.",
        associatedFindings: "Delayed puberty.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Growth Hormone Deficiency (Pituitary Dwarfism)",
        dominantImagingFinding: "Marked delay in bone age. Epiphyses are normal in shape but small.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Proportionate short stature. 'Chubby' appearance with high-pitched voice.",
        discriminatingKeyFeature: "PROPORTIONATE dwarfism and normal IQ. Unlike hypothyroidism, the epiphyses are not stippled.",
        associatedFindings: "Small sella turcica or pituitary abnormalities on MRI.",
        complicationsSeriousAlternatives: "Hypoglycaemia.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "G ENERALIZED ACCELERATED SKELETAL MATURATION",
    itemNumber: "14.2",
    problemCluster: "advanced bone age",
    seriousAlternatives: ["Precocious Puberty", "Hyperthyroidism", "Adrenogenital Syndrome", "McCune-Albright"],
    differentials: [
      {
        diagnosis: "Precocious Puberty (Central)",
        dominantImagingFinding: "Advanced bone age. Early fusion of the epiphyses leading to short adult height.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Children (<8y girls, <9y boys). Early development of secondary sexual characteristics.",
        discriminatingKeyFeature: "EARLY FUSION: Bone age is significantly ahead of chronological age. Tall as a child, short as an adult.",
        associatedFindings: "Hamartoma of the tuber cinereum (MRI).",
        complicationsSeriousAlternatives: "Premature growth arrest.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Adrenogenital Syndrome (CAH)",
        dominantImagingFinding: "Marked acceleration of bone age. Virilization.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Infants with ambiguous genitalia or young boys with early pubic hair. Salt-wasting.",
        discriminatingKeyFeature: "VIRILIZATION and advanced bone age. High 17-OH progesterone.",
        associatedFindings: "Adrenal hyperplasia (US/CT).",
        complicationsSeriousAlternatives: "Adrenal crisis (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Hyperthyroidism (Paediatric)",
        dominantImagingFinding: "Accelerated bone age. Generalized osteopenia.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Children with tachycardia, tremor, and weight loss.",
        discriminatingKeyFeature: "SYSTEMIC HYPERMETABOLISM: Tachycardia and high T4 levels. Bone age is advanced but less so than in CAH.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "Thyroid storm.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ENLARGED SUPERIOR ORBITAL FISSURE",
    itemNumber: "11.6",
    problemCluster: "orbital fissure expansion",
    seriousAlternatives: ["Cavernous Sinus Aneurysm", "Meningioma", "Pituitary Adenoma", "Carotid-Cavernous Fistula"],
    differentials: [
      {
        diagnosis: "Internal Carotid Artery Aneurysm (Cavernous segment)",
        dominantImagingFinding: "Smooth, well-circumscribed expansion of the superior orbital fissure. Bony remodeling.",
        distributionLocation: "Superior orbital fissure extending from the cavernous sinus.",
        demographicsClinicalContext: "Older adults. Ophthalmoplegia (CN III, IV, VI).",
        discriminatingKeyFeature: "VASCULAR flow: MRI/CTA shows a pulsatile aneurysm. Most common cause of smooth fissure expansion.",
        associatedFindings: "Calcified aneurysm wall.",
        complicationsSeriousAlternatives: "Rupture (CCF).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Cavernous Sinus Meningioma",
        dominantImagingFinding: "Expansion of the fissure with an associated intensely ENHANCING soft tissue mass.",
        distributionLocation: "Cavernous sinus focus.",
        demographicsClinicalContext: "Middle-aged females.",
        discriminatingKeyFeature: "SOLID ENHANCEMENT: Unlike an aneurysm, the mass is solid and often has a dural tail. Hyperostosis of the sphenoid.",
        associatedFindings: "ICA narrowing (encasement).",
        complicationsSeriousAlternatives: "Visual loss.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Superior Orbital Fissure Syndrome (Tolosa-Hunt)",
        dominantImagingFinding: "Normal or slightly widened fissure. FOCAL ENHANCEMENT/thickening of the cavernous sinus.",
        distributionLocation: "Superior orbital fissure and cavernous sinus.",
        demographicsClinicalContext: "Adults. PAINFUL ophthalmoplegia. Dramatic response to steroids.",
        discriminatingKeyFeature: "STEROID RESPONSE and pain. Lacks the bony remodeling of a chronic aneurysm.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "Recurrence.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L IVER ENLARGEMENT",
    itemNumber: "7.1",
    problemCluster: "hepatomegaly",
    seriousAlternatives: ["Congestive Heart Failure", "Cirrhosis (Early)", "Fatty Liver", "Metastases", "Lymphoma"],
    differentials: [
      {
        diagnosis: "Congestive Heart Failure (Passive Congestion)",
        dominantImagingFinding: "Enlarged, smooth liver. DILATED IVC and hepatic veins ('NUTMEG LIVER' on CT).",
        distributionLocation: "Diffuse liver enlargement.",
        demographicsClinicalContext: "Heart failure symptoms. JVD and peripheral oedema.",
        discriminatingKeyFeature: "VASCULAR DILATATION: IVC >2cm and dilated hepatic veins. Rapid response to diuretics.",
        associatedFindings: "Pleural effusions and cardiomegaly.",
        complicationsSeriousAlternatives: "Cardiac cirrhosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Diffuse Fatty Infiltration (Steatosis)",
        dominantImagingFinding: "Liver is diffuse LOW ATTENUATION (<40 HU or >10 HU less than spleen). US shows increased echogenicity.",
        distributionLocation: "Diffuse or geographic.",
        demographicsClinicalContext: "Obesity, alcohol, or diabetes. Metabolic syndrome.",
        discriminatingKeyFeature: "LOW DENSITY on CT: Liver is darker than the spleen. Vessels stand out as hyperdense lines.",
        associatedFindings: "Focal fatty sparing near the GB or portal vein.",
        complicationsSeriousAlternatives: "NASH and cirrhosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Metastatic Disease (Diffuse)",
        dominantImagingFinding: "Massively enlarged liver with multiple HYPODENSE nodules or masses.",
        distributionLocation: "Random. Disparate sizes.",
        demographicsClinicalContext: "Known primary (Colon, Breast, Lung). Cachexia.",
        discriminatingKeyFeature: "NODULARITY and heterogeneous enhancement. Unlike simple congestion, the liver contour is often irregular.",
        associatedFindings: "Hilar nodes and primary CA.",
        complicationsSeriousAlternatives: "Liver failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 15 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_15_DATA) {
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
  console.log("Batch 15 Complete!");
}

main().catch(console.error);