import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MASTER_DATA = [
  {
    mnemonic: "ROMPS",
    pattern: "Diffuse osteosclerosis",
    differentials: [
      { letter: "R", condition: "Renal osteodystrophy", diagnosis: "Renal Osteodystrophy", hallmark: "Rugger-jersey spine + Subperiosteal resorption", stats: "100% specific pattern" },
      { letter: "O", condition: "Osteopetrosis", diagnosis: "Osteopetrosis", hallmark: "Sandwich vertebrae + Bone-in-bone", stats: "90% Endobone" },
      { letter: "M", condition: "Myelofibrosis", diagnosis: "Myelofibrosis", hallmark: "Massive Splenomegaly + Dry tap", stats: "100% splenomegaly" },
      { letter: "P", condition: "Paget disease", diagnosis: "Paget's Disease", hallmark: "Bone enlargement + Picture frame vertebra", stats: "100% bone expansion" },
      { letter: "S", condition: "Sickle cell disease", diagnosis: "Sickle Cell (Sclerotic)", hallmark: "H-shaped vertebrae + Autosplenectomy", stats: "100% medullary sclerosis" }
    ]
  },
  {
    mnemonic: "FOG MACHINES",
    pattern: "Multiple lucent bone lesions",
    differentials: [
      { letter: "F", condition: "Fibrous dysplasia", diagnosis: "Fibrous Dysplasia", hallmark: "Ground-glass matrix + Rind sign", stats: "100% specific matrix" },
      { letter: "O", condition: "Osteomyelitis", diagnosis: "Multifocal Osteomyelitis", hallmark: "Sequestrum + Involucrum", stats: "Rapid change <48h" },
      { letter: "G", condition: "GCT", diagnosis: "Giant Cell Tumor", hallmark: "Epiphyseal + Subarticular + No rim", stats: "100% closed physis" },
      { letter: "M", condition: "Myeloma / Metastasis", diagnosis: "Multiple Myeloma", hallmark: "Pedicle sparing + Punched out", stats: "70% cold bone scan" },
      { letter: "A", condition: "ABC", diagnosis: "Aneurysmal Bone Cyst", hallmark: "Blow-out + Fluid-fluid levels", stats: "80% <20y" },
      { letter: "C", condition: "Chondroblastoma", diagnosis: "Chondroblastoma", hallmark: "Epiphyseal + Open physis", stats: "90% open physis" },
      { letter: "H", condition: "Hyperparathyroidism", diagnosis: "Brown Tumours (HPT)", hallmark: "Subperiosteal resorption + Radial MCs", stats: "100% pathognomonic" },
      { letter: "I", condition: "Infection", diagnosis: "Brodie Abscess", hallmark: "Penumbra sign on T1 MRI", stats: "100% serpentine tract" },
      { letter: "N", condition: "Non-ossifying fibroma", diagnosis: "Non-Ossifying Fibroma", hallmark: "Scalloped sclerotic border + Metaphyseal", stats: "100% incidental" },
      { letter: "E", condition: "Enchondroma", diagnosis: "Enchondromatosis (Ollier)", hallmark: "Rings and arcs calcification", stats: "100% chondroid matrix" },
      { letter: "S", condition: "Simple bone cyst", diagnosis: "Simple Bone Cyst", hallmark: "Fallen fragment sign", stats: "100% central location" }
    ]
  },
  {
    mnemonic: "FEGNOMASHIC",
    pattern: "Expansile lytic lesion",
    differentials: [
      { letter: "F", condition: "Fibrous dysplasia", diagnosis: "Fibrous Dysplasia", hallmark: "Ground-glass + Rind sign", stats: "100% specific matrix" },
      { letter: "E", condition: "EG (LCH)", diagnosis: "Eosinophilic Granuloma (LCH)", hallmark: "Punched-out + Bevelled edge (Skull)", stats: "Peak 5-10y" },
      { letter: "G", condition: "GCT", diagnosis: "Giant Cell Tumor", hallmark: "Subarticular + Closed physis", stats: "Adults 20-40y" },
      { letter: "N", condition: "NOF", diagnosis: "Non-Ossifying Fibroma", hallmark: "Metaphyseal + Sclerotic margin", stats: "Asymptomatic child" },
      { letter: "O", condition: "Osteoblastoma", diagnosis: "Osteoblastoma", hallmark: "Posterior elements spine + >2cm", stats: "Pain not relieved by aspirin" },
      { letter: "M", condition: "Myeloma/Metastasis", diagnosis: "Metastasis (RCC/Thyroid)", hallmark: "Hypervascular + aggressive", stats: "Older adults" },
      { letter: "A", condition: "ABC", diagnosis: "Aneurysmal Bone Cyst", hallmark: "Blow-out + Fluid-fluid levels", stats: "Skeletally immature" },
      { letter: "S", condition: "Simple bone cyst", diagnosis: "Simple Bone Cyst", hallmark: "Central + Fallen fragment sign", stats: "Proximal humerus common" },
      { letter: "H", condition: "Hyperparathyroidism", diagnosis: "Brown Tumor (HPT)", hallmark: "No rim + Subperiosteal resorption", stats: "High PTH" },
      { letter: "I", condition: "Infection", diagnosis: "Brodie Abscess", hallmark: "Tract crossing physis", stats: "Penumbra sign" },
      { letter: "C", condition: "Chondromyxoid fibroma", diagnosis: "Chondromyxoid Fibroma (CMF)", hallmark: "Eccentric + Scalloped margin", stats: "Proximal tibia 50%" }
    ]
  },
  {
    mnemonic: "LOSE ME",
    pattern: "Aggressive lytic lesion in child",
    differentials: [
      { letter: "L", condition: "Leukaemia / Lymphoma", diagnosis: "Leukaemia", hallmark: "Metaphyseal bands + Symmetrical", stats: "Peak 2-5y" },
      { letter: "O", condition: "Osteomyelitis", diagnosis: "Osteomyelitis", hallmark: "Sequestrum + Involucrum", stats: "Acute fever/high CRP" },
      { letter: "S", condition: "Sarcoma (Ewing)", diagnosis: "Ewing Sarcoma", hallmark: "Diaphyseal + Large soft tissue mass", stats: "Peak 5-20y" },
      { letter: "E", condition: "EG (LCH)", diagnosis: "Eosinophilic Granuloma", hallmark: "Punched out + Bevelled edge", stats: "Solitary lesion common" },
      { letter: "M", condition: "Metastasis (Neuroblastoma)", diagnosis: "Metastatic Neuroblastoma", hallmark: "Raccoon eyes + Paraspinal mass", stats: "Peak 2y" },
      { letter: "E", condition: "Osteosarcoma", diagnosis: "Osteosarcoma", hallmark: "Sunburst reaction + Osteoid matrix", stats: "Adolescents" }
    ]
  },
  {
    mnemonic: "GOCCI",
    pattern: "Epiphyseal lucent lesion",
    differentials: [
      { letter: "G", condition: "GCT", diagnosis: "Giant Cell Tumor", hallmark: "Subarticular + Closed physis", stats: "20-40y" },
      { letter: "O", condition: "Osteoblastoma", diagnosis: "Osteoblastoma", hallmark: "Posterior elements + >2cm", stats: "Spine involvement" },
      { letter: "C", condition: "Chondroblastoma", diagnosis: "Chondroblastoma", hallmark: "Open physis + stippled calc", stats: "Peak 15y" },
      { letter: "C", condition: "Clear cell chondrosarcoma", diagnosis: "Clear Cell Chondrosarcoma", hallmark: "Malignant epiphyseal mass", stats: "30-50y adults" },
      { letter: "I", condition: "Infection", diagnosis: "Brodie Abscess", hallmark: "Tract crossing physis", stats: "Sclerotic rim" },
      { letter: "G", condition: "Intraosseous ganglion", diagnosis: "Intraosseous Ganglion", hallmark: "Subarticular + normal joint space", stats: "Adults" }
    ]
  },
  {
    mnemonic: "Five Ms",
    pattern: "Diffuse marrow infiltration MRI",
    differentials: [
      { letter: "M", condition: "Myeloma", diagnosis: "Multiple Myeloma", hallmark: "Low T1 + Spares pedicles", stats: "70% cold bone scan" },
      { letter: "M", condition: "Metastases", diagnosis: "Metastases", hallmark: "Low T1 + Involves pedicles", stats: "90% hot bone scan" },
      { letter: "M", condition: "Mastocytosis", diagnosis: "Mastocytosis", hallmark: "Low T1/T2 + Skin lesions", stats: "Urticaria pigmentosa" },
      { letter: "M", condition: "Myelofibrosis", diagnosis: "Myelofibrosis", hallmark: "Low T1/T2 + Massive Splenomegaly", stats: "Dry marrow tap" },
      { letter: "M", condition: "Marrow hyperplasia", diagnosis: "Marrow Reconversion", hallmark: "Symmetric T1 brighter than disc", stats: "Chronic anaemia" }
    ]
  },
  {
    mnemonic: "AMEND",
    pattern: "Posterior vertebral scalloping",
    differentials: [
      { letter: "A", condition: "Acromegaly / Achondroplasia", diagnosis: "Acromegaly", hallmark: "Heel pad >25mm + Concave bodies", stats: "Increased sagittal diameter" },
      { letter: "M", condition: "Marfan syndrome", diagnosis: "Marfan Syndrome", hallmark: "Arachnodactyly + Dural ectasia", stats: "Aortic root dilatation" },
      { letter: "E", condition: "Ehlers-Danlos", diagnosis: "Ehlers-Danlos", hallmark: "Hypermobility + Scalloping", stats: "Skin hyperextensibility" },
      { letter: "N", condition: "NF1 (Dural ectasia)", diagnosis: "Neurofibromatosis 1", hallmark: "Dumbbell neurofibromas + Scalloping", stats: "Ribbon-like ribs" },
      { letter: "D", condition: "Dwarfism", diagnosis: "Achondroplasia", hallmark: "Narrowing interpedicular distance", stats: "Rhizomelic short limbs" }
    ]
  },
  {
    mnemonic: "SHIRT",
    pattern: "Lateral clavicle resorption",
    differentials: [
      { letter: "S", condition: "Scleroderma", diagnosis: "Scleroderma", hallmark: "Acro-osteolysis + Calcinosis", stats: "Raynaud's 95%" },
      { letter: "H", condition: "Hyperparathyroidism", diagnosis: "Hyperparathyroidism", hallmark: "Subperiosteal resorption (Radial MC)", stats: "100% specific finding" },
      { letter: "I", condition: "Iatrogenic", diagnosis: "Iatrogenic", hallmark: "Post-surgical history", stats: "Clips or scars" },
      { letter: "R", condition: "RA", diagnosis: "Rheumatoid Arthritis", hallmark: "Symmetric erosions + Anti-CCP", stats: "AC joint widening" },
      { letter: "T", condition: "Trauma", diagnosis: "Post-traumatic Osteolysis", hallmark: "Unilateral focal loss", stats: "Weightlifters" }
    ]
  },
  {
    mnemonic: "TIPS",
    pattern: "Short metacarpals",
    differentials: [
      { letter: "T", condition: "Turner syndrome", diagnosis: "Turner Syndrome", hallmark: "Archibald Sign (4th MC) + 45X", stats: "Females (100%)" },
      { letter: "I", condition: "Idiopathic", diagnosis: "Idiopathic (Benign)", hallmark: "Isolated short 4th MC", stats: "Asymptomatic variant" },
      { letter: "P", condition: "Pseudohypoparathyroidism (PHP)", diagnosis: "PHP Type 1a", hallmark: "Multiple short MCs + Round facies", stats: "Low calcium/High PTH" },
      { letter: "S", condition: "Sickle cell (infarction)", diagnosis: "Sickle Cell Anaemia", hallmark: "Post-dactylitis epiphyseal fusion", stats: "H-shaped vertebrae" }
    ]
  },
  {
    mnemonic: "PINCH FO",
    pattern: "Acro-osteolysis",
    differentials: [
      { letter: "P", condition: "Psoriasis / PVC exposure", diagnosis: "Psoriatic Arthritis", hallmark: "Pencil-in-cup + No osteopenia", stats: "Skin psoriasis 90%" },
      { letter: "I", condition: "Injury (Frostbite/Burn)", diagnosis: "Thermal Injury", hallmark: "Amputation-like + Preserved joint", stats: "Exposure history" },
      { letter: "N", condition: "Neuropathy (Diabetes/Leprosy)", diagnosis: "Neuropathic (Charcot)", hallmark: "Tuft loss + Joint destruction", stats: "Sensory deficit" },
      { letter: "C", condition: "Collagen vascular (Scleroderma)", diagnosis: "Scleroderma", hallmark: "Tapered tufts + Soft tissue loss", stats: "100% pathognomonic" },
      { letter: "H", condition: "Hyperparathyroidism", diagnosis: "Hyperparathyroidism", hallmark: "Subperiosteal resorption", stats: "Renal failure history" },
      { letter: "F", condition: "Familial", diagnosis: "Hadju-Cheney Syndrome", hallmark: "Generalized loss + Wormian bones", stats: "Autosomal dominant" },
      { letter: "O", condition: "Osteolysis", diagnosis: "PVC Exposure", hallmark: "Transverse band-like lucency", stats: "Occupational history" }
    ]
  },
  {
    mnemonic: "PRION",
    pattern: "Bowed tibia",
    differentials: [
      { letter: "P", condition: "Paget disease", diagnosis: "Paget's Disease", hallmark: "Enlarged bone + Cortical thickening", stats: "100% specific expansion" },
      { letter: "R", condition: "Rickets", diagnosis: "Rickets", hallmark: "Metaphyseal cupping + Widened physis", stats: "100% widening" },
      { letter: "I", condition: "Injury", diagnosis: "Physiological Bowing", hallmark: "Symmetric + Resolves by age 2", stats: "Normal development" },
      { letter: "O", condition: "OI", diagnosis: "Osteogenesis Imperfecta", hallmark: "Multiple fractures + Blue sclerae", stats: "90% blue sclerae" },
      { letter: "N", condition: "Neurofibromatosis", diagnosis: "NF1 (Pseudoarthrosis)", hallmark: "Anterolateral bowing + Non-union", stats: "100% specific NF1" }
    ]
  },
  {
    mnemonic: "SAD GITS",
    pattern: "Osteonecrosis of the hips",
    differentials: [
      { letter: "S", condition: "Steroids / Sickle cell", diagnosis: "Steroid-induced AVN", hallmark: "Double line sign + Crescent sign", stats: "Bilateral 80%" },
      { letter: "A", condition: "Alcohol", diagnosis: "Alcoholic AVN", hallmark: "Subchondral collapse + Elevated GGT", stats: "Bilateral 75%" },
      { letter: "D", condition: "Dysbarism", diagnosis: "Caisson Disease", hallmark: "Medullary infarcts + Bends history", stats: "Occupational divers" },
      { letter: "G", condition: "Gaucher disease", diagnosis: "Gaucher Disease", hallmark: "Erlenmeyer flask + massive spleen", stats: "Ashkenazi Jewish" },
      { letter: "I", condition: "Infection / Idiopathic", diagnosis: "Idiopathic (Perthes-like)", hallmark: "Isolated subchondral fracture", stats: "No systemic markers" },
      { letter: "T", condition: "Trauma", diagnosis: "Post-Traumatic AVN", hallmark: "Unilateral + Surgical hardware", stats: "100% specific unilateral" },
      { letter: "S", condition: "Storage disease", diagnosis: "Metabolic Storage", hallmark: "Diffuse marrow changes", stats: "Organomegaly" }
    ]
  }
];

async function main() {
  console.log("Master Sync Batch 2: MSK...");
  const mnemonics = await client.query(api.mnemonics.list as any, {});
  const discriminators = await client.query(api.discriminators.list as any, {});

  for (const entry of MASTER_DATA) {
    console.log(`Processing: ${entry.mnemonic}`);
    const mRecord = mnemonics.find((m: any) => m.mnemonic === entry.mnemonic);
    if (mRecord) {
      await client.mutation(api.mnemonics.update as any, {
        id: mRecord._id,
        differentials: entry.differentials.map(d => ({
          letter: d.letter,
          condition: d.condition,
          associatedFeatures: d.hallmark
        }))
      });
    }
    const dMatch = discriminators.find((d: any) => d.mnemonicRef?.mnemonic === entry.mnemonic);
    if (dMatch) {
      await client.mutation(api.discriminators.update as any, {
        id: dMatch._id,
        mnemonicRef: {
          mnemonic: entry.mnemonic,
          chapterNumber: dMatch.mnemonicRef.chapterNumber,
          expandedLetters: entry.differentials.map(d => `${d.letter}: ${d.condition}`).join(", ")
        },
        differentials: entry.differentials.map((d, idx) => ({
          diagnosis: d.diagnosis,
          mnemonicLetter: d.letter,
          sortOrder: idx,
          dominantImagingFinding: d.diagnosis.toUpperCase() + ": " + d.hallmark,
          distributionLocation: "Typically " + d.diagnosis + " distribution",
          demographicsClinicalContext: d.stats + ". " + d.hallmark,
          discriminatingKeyFeature: d.hallmark,
          associatedFindings: "Associated with " + d.condition,
          complicationsSeriousAlternatives: "Risk of progression",
          isCorrectDiagnosis: idx === 0
        }))
      });
    }
  }
  console.log("MSK batch complete!");
}

main().catch(console.error);