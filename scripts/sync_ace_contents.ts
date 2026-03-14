import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const ACE_MAPPING = [
  {
    pattern: "G ENERALIZED INCREASED BONE DENSITY",
    itemNumber: "1.1",
    differentials: [
      { 
        diagnosis: "Renal osteodystrophy", 
        dominantImagingFinding: "RUGGER-JERSEY SPINE. Endplate sclerosis.", 
        distributionLocation: "Axial skeleton.", 
        demographicsClinicalContext: "Chronic renal failure.", 
        discriminatingKeyFeature: "Subperiosteal resorption + Rugger-Jersey pattern.", 
        associatedFindings: "Brown tumors.", 
        complicationsSeriousAlternatives: "Fractures.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Osteoblastic metastases", 
        dominantImagingFinding: "Patchy or diffuse sclerosis. Common in prostate and breast CA.", 
        distributionLocation: "Axial skeleton.", 
        demographicsClinicalContext: "Older adults. Known primary.", 
        discriminatingKeyFeature: "Known primary and Hot Bone Scan.", 
        associatedFindings: "Lymphadenopathy.", 
        complicationsSeriousAlternatives: "Cord compression.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Lymphoma", 
        dominantImagingFinding: "Diffuse marrow sclerosis. IVORY VERTEBRA.", 
        distributionLocation: "Spine, Pelvis.", 
        demographicsClinicalContext: "B-symptoms (fever, weight loss).", 
        discriminatingKeyFeature: "IVORY VERTEBRA and associated bulky nodal disease.", 
        associatedFindings: "Splenomegaly.", 
        complicationsSeriousAlternatives: "Marrow failure.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Mastocytosis", 
        dominantImagingFinding: "Sclerosis of marrow containing skeleton with patchy radiolucency.", 
        distributionLocation: "Diffuse marrow-bearing skeleton.", 
        demographicsClinicalContext: "URTICARIA PIGMENTOSA (skin rash). Symptoms of carcinoid syndrome.", 
        discriminatingKeyFeature: "PATCHY RADIOLUCENCY within sclerosis + SKIN RASH.", 
        associatedFindings: "Hepatosplenomegaly.", 
        complicationsSeriousAlternatives: "Anaphylaxis.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "SOLITARY SCLEROTIC BONE LESION",
    itemNumber: "1.2",
    differentials: [
      { 
        diagnosis: "Metastasis", 
        dominantImagingFinding: "Focal sclerosis. Often prostate or breast.", 
        distributionLocation: "Axial skeleton common.", 
        demographicsClinicalContext: "Older adults.", 
        discriminatingKeyFeature: "Known primary.", 
        associatedFindings: "Elevated tumor markers.", 
        complicationsSeriousAlternatives: "Fracture.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Lymphoma", 
        dominantImagingFinding: "Solitary IVORY VERTEBRA.", 
        distributionLocation: "Spine.", 
        demographicsClinicalContext: "Systemic symptoms.", 
        discriminatingKeyFeature: "Ivory vertebra without expansion.", 
        associatedFindings: "Nodes.", 
        complicationsSeriousAlternatives: "Compression.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Osteoma / Osteoid Osteoma", 
        dominantImagingFinding: "Nidus <1.5cm with massive reactive sclerosis.", 
        distributionLocation: "Cortex of long bones.", 
        demographicsClinicalContext: "Young adults. Night pain.", 
        discriminatingKeyFeature: "Dramatic response to aspirin.", 
        associatedFindings: "Synovitis if intra-articular.", 
        complicationsSeriousAlternatives: "Growth delay.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Healed/Healing Bone Lesion", 
        dominantImagingFinding: "Sclerotic filling of a prior lucent lesion (e.g. NOF).", 
        distributionLocation: "Diaphysis.", 
        demographicsClinicalContext: "Adults.", 
        discriminatingKeyFeature: "Stability on old films.", 
        associatedFindings: "Scalloped margin.", 
        complicationsSeriousAlternatives: "None.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Primary bone sarcoma", 
        dominantImagingFinding: "Aggressive sclerosis. Osteoid matrix.", 
        distributionLocation: "Metaphysis around knee.", 
        demographicsClinicalContext: "Adolescents.", 
        discriminatingKeyFeature: "Sunburst periosteal reaction.", 
        associatedFindings: "Soft tissue mass.", 
        complicationsSeriousAlternatives: "Lung mets.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Bone infarct", 
        dominantImagingFinding: "Serpiginous sclerotic border.", 
        distributionLocation: "Metadiaphysis.", 
        demographicsClinicalContext: "Steroids, Alcohol, Sickle cell.", 
        discriminatingKeyFeature: "SERPIGINOUS border and central lucency/calcification.", 
        associatedFindings: "AVN of joint.", 
        complicationsSeriousAlternatives: "Malignant transformation (rare).", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Callus", 
        dominantImagingFinding: "Transverse density around a healing stress fracture.", 
        distributionLocation: "Tibia, Metatarsals.", 
        demographicsClinicalContext: "Athletes, military recruits.", 
        discriminatingKeyFeature: "Transverse orientation and history of activity change.", 
        associatedFindings: "Linear lucency.", 
        complicationsSeriousAlternatives: "Non-union.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Sclerosing osteomyelitis of Garré", 
        dominantImagingFinding: "Diffuse cortical thickening and sclerosis.", 
        distributionLocation: "Mandible, Tibia.", 
        demographicsClinicalContext: "Children/Young adults.", 
        discriminatingKeyFeature: "Intense sclerosis WITHOUT sequester/abscess.", 
        associatedFindings: "Low grade pain.", 
        complicationsSeriousAlternatives: "None.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Paget's disease", 
        dominantImagingFinding: "Trabecular coarsening and bone enlargement.", 
        distributionLocation: "Pelvis, Skull, Spine.", 
        demographicsClinicalContext: "Older adults.", 
        discriminatingKeyFeature: "BONE ENLARGEMENT.", 
        associatedFindings: "High Alk Phos.", 
        complicationsSeriousAlternatives: "Sarcoma transformation.", 
        isCorrectDiagnosis: false 
      }
    ]
  }
];

async function main() {
  console.log("Updating ACE Discriminators to match exact DDx contents...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of ACE_MAPPING) {
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
      });
    } else {
      console.log(`Creating ${update.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: differentialsWithSort,
      });
    }
  }
  console.log("ACE content sync complete!");
}

main().catch(console.error);