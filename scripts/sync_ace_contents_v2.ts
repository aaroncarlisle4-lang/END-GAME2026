import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const ACE_MAPPING = [
  {
    pattern: "M ULTIPLE SCLEROTIC BONE LESIONS",
    itemNumber: "1.3",
    differentials: [
      { diagnosis: "Metastases", dominantImagingFinding: "Multiple ill-defined sclerotic foci.", distributionLocation: "Axial skeleton.", demographicsClinicalContext: "Older adults.", discriminatingKeyFeature: "Known primary CA.", associatedFindings: "Hot bone scan.", complicationsSeriousAlternatives: "Cord compression.", isCorrectDiagnosis: true },
      { diagnosis: "Lymphoma", dominantImagingFinding: "Multiple ivory vertebrae or patchy sclerosis.", distributionLocation: "Axial skeleton.", demographicsClinicalContext: "Systemic symptoms.", discriminatingKeyFeature: "Ivory vertebrae without expansion.", associatedFindings: "Adenopathy.", complicationsSeriousAlternatives: "Marrow failure.", isCorrectDiagnosis: false },
      { diagnosis: "Mastocytosis", dominantImagingFinding: "Sclerosis with patchy areas of radiolucency.", distributionLocation: "Marrow-bearing skeleton.", demographicsClinicalContext: "Urticaria pigmentosa.", discriminatingKeyFeature: "Skin rash and carcinoid-like symptoms.", associatedFindings: "Splenomegaly.", complicationsSeriousAlternatives: "Anaphylaxis.", isCorrectDiagnosis: false },
      { diagnosis: "Multiple Myeloma", dominantImagingFinding: "Sclerotic myeloma (POEMS syndrome).", distributionLocation: "Diffuse.", demographicsClinicalContext: "Older adults.", discriminatingKeyFeature: "Associated polyneuropathy and organomegaly.", associatedFindings: "M-protein peak.", complicationsSeriousAlternatives: "Renal failure.", isCorrectDiagnosis: false },
      { diagnosis: "Osteomata", dominantImagingFinding: "Dense, well-defined bony protuberances.", distributionLocation: "Skull, Sinuses.", demographicsClinicalContext: "Gardner syndrome history.", discriminatingKeyFeature: "Association with soft tissue tumors and polyposis.", associatedFindings: "Dental anomalies.", complicationsSeriousAlternatives: "Sinus obstruction.", isCorrectDiagnosis: false },
      { diagnosis: "Paget’s disease", dominantImagingFinding: "Bone enlargement and trabecular coarsening.", distributionLocation: "Asymmetric.", demographicsClinicalContext: "Older adults.", discriminatingKeyFeature: "BONE EXPANSION.", associatedFindings: "High Alk Phos.", complicationsSeriousAlternatives: "Sarcoma.", isCorrectDiagnosis: false },
      { diagnosis: "Bone infarcts", dominantImagingFinding: "Multiple lesions with serpiginous borders.", distributionLocation: "Metadiaphyses.", demographicsClinicalContext: "Steroids, Alcohol.", discriminatingKeyFeature: "Serpiginous sclerotic rim.", associatedFindings: "Joint AVN.", complicationsSeriousAlternatives: "Malignant transformation.", isCorrectDiagnosis: false }
    ]
  },
  {
    pattern: "B ONE SCLEROSIS WITH A PERIOSTEAL REACTION",
    itemNumber: "1.4",
    differentials: [
      { diagnosis: "Metastasis", dominantImagingFinding: "Aggressive sclerosis with periosteal reaction.", distributionLocation: "Random.", demographicsClinicalContext: "Older adults.", discriminatingKeyFeature: "Known primary.", associatedFindings: "Hot bone scan.", complicationsSeriousAlternatives: "Fracture.", isCorrectDiagnosis: true },
      { diagnosis: "Osteosarcoma", dominantImagingFinding: "Aggressive sclerosis with SUNBURST or CODMAN TRIANGLE.", distributionLocation: "Metaphysis around knee.", demographicsClinicalContext: "Adolescents.", discriminatingKeyFeature: "Aggressive periostitis and osteoid matrix.", associatedFindings: "Soft tissue mass.", complicationsSeriousAlternatives: "Mets.", isCorrectDiagnosis: false },
      { diagnosis: "Ewing’s sarcoma", dominantImagingFinding: "Permeative sclerosis with ONION-SKIN reaction.", distributionLocation: "Diaphysis.", demographicsClinicalContext: "Children.", discriminatingKeyFeature: "Onion-skin layers and huge soft tissue mass.", associatedFindings: "Fever.", complicationsSeriousAlternatives: "Death.", isCorrectDiagnosis: false },
      { diagnosis: "Osteomyelitis", dominantImagingFinding: "Medullary sclerosis with thick regular/irregular reaction.", distributionLocation: "Long bones.", demographicsClinicalContext: "Acute pain and fever.", discriminatingKeyFeature: "Sequestrum and involucrum.", associatedFindings: "Sinus tract.", complicationsSeriousAlternatives: "Sepsis.", isCorrectDiagnosis: false },
      { diagnosis: "Melorheostosis", dominantImagingFinding: "MOLTEN WAX flowing down a candle appearance.", distributionLocation: "Monostotic or monomelic.", demographicsClinicalContext: "Any age.", discriminatingKeyFeature: "Flowing cortical hyperostosis extending across joints.", associatedFindings: "Joint contractures.", complicationsSeriousAlternatives: "Pain.", isCorrectDiagnosis: false }
    ]
  },
  {
    pattern: "SOLITARY SCLEROTIC BONE LESION WITH A LUCENT CENTRE",
    itemNumber: "1.5",
    differentials: [
      { diagnosis: "Brodie’s abscess", dominantImagingFinding: "Lucent lesion with thick sclerotic rim.", distributionLocation: "Metaphysis.", demographicsClinicalContext: "Children.", discriminatingKeyFeature: "Serpentine tract crossing physis.", associatedFindings: "Penumbra sign.", complicationsSeriousAlternatives: "Chronic infection.", isCorrectDiagnosis: true },
      { diagnosis: "Osteoid osteoma", dominantImagingFinding: "Tiny nidus <1.5cm with massive sclerosis.", distributionLocation: "Cortex.", demographicsClinicalContext: "Young adults.", discriminatingKeyFeature: "Dramatic response to aspirin.", associatedFindings: "Intense focal uptake.", complicationsSeriousAlternatives: "None.", isCorrectDiagnosis: false },
      { diagnosis: "Syphilis / Yaws", dominantImagingFinding: "Gummatous lesions with central lucency and surrounding sclerosis.", distributionLocation: "Tibia common.", demographicsClinicalContext: "Endemic areas or relevant history.", discriminatingKeyFeature: "Sabre tibia and positive serology.", associatedFindings: "Skin lesions.", complicationsSeriousAlternatives: "Neurological involvement.", isCorrectDiagnosis: false }
    ]
  }
];

async function main() {
  console.log("Updating ACE Discriminators Batch 2...");
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
  console.log("Batch 2 complete!");
}

main().catch(console.error);