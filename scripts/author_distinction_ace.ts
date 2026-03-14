import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const HIGH_YIELD_ACE = [
  {
    pattern: "G ENERALIZED INCREASED BONE DENSITY",
    problemCluster: "generalized sclerosis",
    seriousAlternatives: ["Metastatic Prostate CA", "Mastocytosis", "Renal Osteodystrophy"],
    differentials: [
      {
        diagnosis: "Renal Osteodystrophy",
        dominantImagingFinding: "RUGGER-JERSEY SPINE (100% specific). Subperiosteal resorption (90%).",
        distributionLocation: "Axial skeleton and distal long bones.",
        demographicsClinicalContext: "Chronic Renal Failure. High PTH and Low Calcium.",
        discriminatingKeyFeature: "PATHOGNOMONIC subperiosteal resorption on the radial side of 2nd/3rd middle phalanges.",
        associatedFindings: "Brown tumours and soft tissue calcification.",
        complicationsSeriousAlternatives: "Pathological fractures.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Osteoblastic Metastases",
        dominantImagingFinding: "Patchy or diffuse sclerosis. PEDICLE INVOLVEMENT (90%).",
        distributionLocation: "Axial skeleton (Spine, Pelvis, Ribs).",
        demographicsClinicalContext: "Older adults. Known PROSTATE or BREAST primary (80%).",
        discriminatingKeyFeature: "KNOWN PRIMARY CANCER and intensely HOT bone scan (95%).",
        associatedFindings: "Elevated PSA or Alk Phos.",
        complicationsSeriousAlternatives: "Spinal cord compression (URGENT).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Myelofibrosis",
        dominantImagingFinding: "Diffuse ground-glass sclerosis. BLURRED trabeculae.",
        distributionLocation: "Axial skeleton and proximal long bones.",
        demographicsClinicalContext: "Adults >50y. MASSIVE SPLENOMEGALY (100%). Dry marrow tap.",
        discriminatingKeyFeature: "MASSIVE SPLENOMEGALY and extramedullary haematopoiesis (paraspinal masses).",
        associatedFindings: "Tear-drop RBCs on smear.",
        complicationsSeriousAlternatives: "Leukaemic transformation.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Mastocytosis",
        dominantImagingFinding: "Patchy areas of radiolucency within a sclerotic marrow-containing skeleton.",
        distributionLocation: "Diffuse marrow-bearing bones.",
        demographicsClinicalContext: "URTICARIA PIGMENTOSA (skin rash). Flushing and tachycardia (Carcinoid-like).",
        discriminatingKeyFeature: "SKIN RASH (Darier sign) and episodic histamine release symptoms.",
        associatedFindings: "Hepatosplenomegaly and peptic ulcers.",
        complicationsSeriousAlternatives: "Anaphylactic shock.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Osteopetrosis",
        dominantImagingFinding: "Extreme uniform sclerosis. BONE-IN-BONE (90%) and SANDWICH vertebrae.",
        distributionLocation: "Diffuse. Entire skeleton.",
        demographicsClinicalContext: "Failure to thrive (AR) or asymptomatic (AD). Marrow failure.",
        discriminatingKeyFeature: "BONE-IN-BONE appearance and Erlenmeyer flask deformity.",
        associatedFindings: "Skull base thickening and cranial nerve palsies.",
        complicationsSeriousAlternatives: "Pancytopenia.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "SOLITARY SCLEROTIC BONE LESION",
    problemCluster: "solitary sclerosis",
    seriousAlternatives: ["Sclerotic Metastasis", "Osteosarcoma", "Infection"],
    differentials: [
      {
        diagnosis: "Bone Island (Enostosis)",
        dominantImagingFinding: "Dense, homogeneous, cortical-like nodule. THORNY MARGINS (100%).",
        distributionLocation: "Epiphysis or metaphysis. No bone expansion.",
        demographicsClinicalContext: "Any age. Completely ASYMPTOMATIC incidental finding.",
        discriminatingKeyFeature: "THORNY/BRUSH-LIKE MARGINS that blend into normal trabeculae. COLD on bone scan.",
        associatedFindings: "Normal surrounding bone architecture.",
        complicationsSeriousAlternatives: "None (STABLE).",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Osteoid Osteoma",
        dominantImagingFinding: "Lucent NIDUS <1.5cm with massive surrounding reactive sclerosis.",
        distributionLocation: "Cortical location. Long bone diaphysis common.",
        demographicsClinicalContext: "Young adults (10-25y). Nocturnal pain relieved by Aspirin (90%).",
        discriminatingKeyFeature: "NIDUS <1.5cm and dramatic response to NSAIDs. Double density sign on bone scan.",
        associatedFindings: "Painful scoliosis if in spine.",
        complicationsSeriousAlternatives: "Growth disturbance.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Sclerotic Metastasis",
        dominantImagingFinding: "Focal ill-defined nodular sclerosis. Destroys normal trabeculae.",
        distributionLocation: "Axial skeleton or proximal appendicular.",
        demographicsClinicalContext: "Older adults. Known PROSTATE primary.",
        discriminatingKeyFeature: "KNOWN PRIMARY and HOT bone scan. Stability is rare.",
        associatedFindings: "Elevated tumor markers.",
        complicationsSeriousAlternatives: "Fracture.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Bone Infarct",
        dominantImagingFinding: "Focal sclerosis with a SERPIGINOUS border (100% specific).",
        distributionLocation: "Metadiaphysis of long bones.",
        demographicsClinicalContext: "Steroids, Alcohol, Sickle Cell history.",
        discriminatingKeyFeature: "SERPIGINOUS sclerotic margin and history of systemic risk factors.",
        associatedFindings: "AVN of adjacent joint.",
        complicationsSeriousAlternatives: "Rarely, malignant transformation to Sarcoma.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Paget Disease (Monostotic)",
        dominantImagingFinding: "Bone ENLARGEMENT, cortical thickening, and trabecular coarsening.",
        distributionLocation: "Pelvis, Skull, or long bone.",
        demographicsClinicalContext: "Older adults (>55y). High Alk Phos.",
        discriminatingKeyFeature: "BONE ENLARGEMENT (Expansion) and V-shaped leading edge (Blade of Grass).",
        associatedFindings: "Picture-frame vertebra.",
        complicationsSeriousAlternatives: "Osteosarcoma transformation (<1%).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "M ULTIPLE SCLEROTIC BONE LESIONS",
    problemCluster: "multiple sclerosis",
    seriousAlternatives: ["Metastases", "Lymphoma", "Mastocytosis"],
    differentials: [
      {
        diagnosis: "Osteoblastic Metastases",
        dominantImagingFinding: "Multiple ill-defined sclerotic foci. VARYING SIZES.",
        distributionLocation: "Axial skeleton (Spine, Pelvis, Ribs).",
        demographicsClinicalContext: "Older adults. Prostate (males) or Breast (females) primary.",
        discriminatingKeyFeature: "KNOWN PRIMARY and multiple 'Hot' spots on bone scan.",
        associatedFindings: "Pedicle involvement.",
        complicationsSeriousAlternatives: "Cord compression.",
        isCorrectDiagnosis: true
      },
      {
        diagnosis: "Mastocytosis",
        dominantImagingFinding: "Multiple small sclerotic nodules interspersed with patchy lucency.",
        distributionLocation: "Marrow-containing skeleton.",
        demographicsClinicalContext: "URTICARIA PIGMENTOSA (skin rash). Tachycardia.",
        discriminatingKeyFeature: "SKIN RASH and histamine release. Sclerosis without bone expansion.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "Systemic anaphylaxis.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Osteopoikilosis",
        dominantImagingFinding: "Multiple small (1-10mm) dense nodules ('Spotted bone disease').",
        distributionLocation: "Peri-articular clustering (Epiphyses/Metaphyses). Spares the axial skeleton.",
        demographicsClinicalContext: "Asymptomatic. Autosomal Dominant.",
        discriminatingKeyFeature: "PERI-ARTICULAR distribution and COLD bone scan (95%).",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "None (BENIGN).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Tuberous Sclerosis",
        dominantImagingFinding: "Multiple dense bone islands and thickened calvaria.",
        distributionLocation: "Pelvis, Spine, Skull.",
        demographicsClinicalContext: "Seizures, mental retardation, and adenoma sebaceum.",
        discriminatingKeyFeature: "CNS TUBERS and Renal AMLs (90%).",
        associatedFindings: "Subependymal nodules.",
        complicationsSeriousAlternatives: "AML haemorrhage.",
        isCorrectDiagnosis: false
      }
    ]
  }
];

async function main() {
  console.log("Authoring distinction-quality ACE discriminators...");
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
      console.log(`Updating ${entry.pattern} with A-star data`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: differentialsWithSort,
        seriousAlternatives: entry.seriousAlternatives,
        problemCluster: entry.problemCluster
      });
    } else {
      console.log(`Creating ${entry.pattern} with A-star data`);
      await client.mutation(api.discriminators.create as any, {
        pattern: entry.pattern,
        differentials: differentialsWithSort,
        seriousAlternatives: entry.seriousAlternatives,
        problemCluster: entry.problemCluster
      });
    }
  }
  console.log("Distinction quality sync complete!");
}

main().catch(console.error);