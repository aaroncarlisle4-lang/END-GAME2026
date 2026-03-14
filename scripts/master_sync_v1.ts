import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MASTER_DATA = [
  {
    mnemonic: "STREP ABC",
    pattern: "Upper lobe fibrosis",
    category: "Chest",
    chapter: 1,
    differentials: [
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis (Stage IV)", hallmark: "Symmetric nodes + Outward hilar displacement", stats: "70-90% nodal involvement" },
      { letter: "T", condition: "Tuberculosis", diagnosis: "Post-Primary TB", hallmark: "Apical cavitation + Tree-in-bud satellites", stats: "85% apical location" },
      { letter: "R", condition: "Radiation", diagnosis: "Radiation Fibrosis", hallmark: "Geometric sharp non-anatomic margin", stats: "100% respect of portal" },
      { letter: "E", condition: "Extrinsic allergic alveolitis", diagnosis: "Chronic EAA (HP)", hallmark: "Headcheese sign + Mosaic attenuation", stats: "90% mosaic on expiratory CT" },
      { letter: "P", condition: "Pneumoconiosis", diagnosis: "Silicosis / Coal worker's", hallmark: "Eggshell nodes + PMF conglomerate masses", stats: "30x increased TB risk" },
      { letter: "A", condition: "Ankylosing spondylitis", diagnosis: "Ankylosing Spondylitis", hallmark: "Apical fibrobullous + Bamboo spine", stats: "1-2% of AS patients" },
      { letter: "B", condition: "Berylliosis", diagnosis: "Berylliosis", hallmark: "Aerospace exposure + mimics Sarcoid", stats: "100% occupational history" },
      { letter: "C", condition: "Cystic fibrosis", diagnosis: "Cystic Fibrosis", hallmark: "Upper lobe bronchiectasis + Mucus plugs", stats: "100% adult cases show bronchiectasis" }
    ],
    seriousAlternatives: ["Active TB", "Malignant lymphangitis", "Acute Silicosis"]
  },
  {
    mnemonic: "LENT",
    pattern: "Diffuse cystic ILD",
    category: "Chest",
    chapter: 2,
    differentials: [
      { letter: "L", condition: "LAM", diagnosis: "Lymphangioleiomyomatosis (LAM)", hallmark: "Uniform cysts + CP angle involvement", stats: "99% Females" },
      { letter: "E", condition: "Eosinophilic granuloma (PLCH)", diagnosis: "Langerhans Cell Histiocytosis (PLCH)", hallmark: "Bizarre cysts + CP angle sparing", stats: "95%+ Smokers" },
      { letter: "N", condition: "Neurofibromatosis", diagnosis: "Neurofibromatosis (Type 1)", hallmark: "Upper bullae + Basal fibrosis + Ribbon ribs", stats: "90% skin nodules" },
      { letter: "T", condition: "Tuberous sclerosis", diagnosis: "Tuberous Sclerosis (LAM)", hallmark: "LAM + Brain tubers + Renal AMLs", stats: "90% have renal AMLs" }
    ],
    seriousAlternatives: ["Centrilobular emphysema", "PJP", "BHD Syndrome"]
  },
  {
    mnemonic: "SDLPVHF",
    pattern: "Reticulonodular shadowing",
    category: "Chest",
    chapter: 3,
    differentials: [
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis (Nodular)", hallmark: "Perilymphatic nodes + Symmetric adenopathy", stats: "80% Upper/Mid zone" },
      { letter: "D", condition: "Dust (Silicosis)", diagnosis: "Silicosis (Simple)", hallmark: "Posterior upper zone nodes + Eggshell calc", stats: "100% occupational history" },
      { letter: "L", condition: "Lymphangitis", diagnosis: "Lymphangitis Carcinomatosa", hallmark: "Beaded septal thickening + Cachexia", stats: "100% interlobular involvement" },
      { letter: "P", condition: "Post-primary TB", diagnosis: "Miliary TB", hallmark: "Uniform millet-seed nodules", stats: "100% random distribution" },
      { letter: "V", condition: "Vasculitis", diagnosis: "Vasculitis (GPA)", hallmark: "Cavitating nodules + Renal disease", stats: "50% cavitation rate" },
      { letter: "H", condition: "Histiocytosis", diagnosis: "LCH (Nodular phase)", hallmark: "Centrilobular nodules + Upper zone", stats: "95% smokers" },
      { letter: "F", condition: "Fibrosing alveolitis", diagnosis: "Idiopathic Pulmonary Fibrosis", hallmark: "Honeycombing + Basal/Subpleural", stats: "100% traction bronchiectasis" }
    ],
    seriousAlternatives: ["Acute Oedema", "PJP"]
  },
  {
    mnemonic: "PORKCHOPS",
    pattern: "Multiple wormian bones",
    category: "Paeds",
    chapter: 47,
    differentials: [
      { letter: "P", condition: "Pyknodysostosis", diagnosis: "Pyknodysostosis", hallmark: "Dense bones + Short stature + Acro-osteolysis", stats: "100% show sclerosis" },
      { letter: "O", condition: "OI (Osteogenesis Imperfecta)", diagnosis: "Osteogenesis Imperfecta", hallmark: "Blue sclerae + Gracile bones + Fractures", stats: "90% blue sclerae" },
      { letter: "R", condition: "Rickets", diagnosis: "Rickets", hallmark: "Metaphyseal fraying + Cupping", stats: "100% widening of physis" },
      { letter: "K", condition: "Kinky hair syndrome", diagnosis: "Menkes Syndrome", hallmark: "Steely hair + Metaphyseal spurs", stats: "100% copper deficiency" },
      { letter: "C", condition: "Cleidocranial dysplasia", diagnosis: "Cleidocranial Dysplasia", hallmark: "Absent clavicles + Supernumerary teeth", stats: "85% bilateral absence" },
      { letter: "H", condition: "Hypothyroidism", diagnosis: "Congenital Hypothyroidism", hallmark: "Delayed bone age + Stippled epiphyses", stats: "100% delayed maturation" },
      { letter: "O", condition: "One (Trisomy 21)", diagnosis: "Down Syndrome", hallmark: "11 ribs + Double bubble + AA instability", stats: "30% have 11 ribs" },
      { letter: "P", condition: "Pachydermoperiostosis", diagnosis: "Pachydermoperiostosis", hallmark: "Facial skin thickening + Periostitis", stats: "100% skin changes" },
      { letter: "S", condition: "Scurvy", diagnosis: "Scurvy", hallmark: "Frankel line + Trummerfeld zone + Pelkan spur", stats: "100% subperiosteal hemorrhage" }
    ],
    seriousAlternatives: ["NAI", "Syphilis"]
  },
  {
    mnemonic: "ROMPS",
    pattern: "Diffuse osteosclerosis",
    category: "MSK",
    chapter: 16,
    differentials: [
      { letter: "R", condition: "Renal osteodystrophy", diagnosis: "Renal Osteodystrophy", hallmark: "Rugger-jersey spine + Subperiosteal resorption", stats: "100% specific pattern" },
      { letter: "O", condition: "Osteopetrosis", diagnosis: "Osteopetrosis", hallmark: "Sandwich vertebrae + Bone-in-bone", stats: "90% Endobone" },
      { letter: "M", condition: "Myelofibrosis", diagnosis: "Myelofibrosis", hallmark: "Massive Splenomegaly + Dry tap", stats: "100% splenomegaly" },
      { letter: "P", condition: "Paget disease", diagnosis: "Paget's Disease", hallmark: "Bone enlargement + Picture frame vertebra", stats: "100% bone expansion" },
      { letter: "S", condition: "Sickle cell disease", diagnosis: "Sickle Cell (Sclerotic)", hallmark: "H-shaped vertebrae + Autosplenectomy", stats: "100% medullary sclerosis" }
    ],
    seriousAlternatives: ["Metastatic Prostate CA", "Mastocytosis"]
  },
  {
    mnemonic: "FOG MACHINES",
    pattern: "Multiple lucent bone lesions",
    category: "MSK",
    chapter: 17,
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
    ],
    seriousAlternatives: ["Lytic Metastases", "Chordoma"]
  },
  {
    mnemonic: "HIMAP",
    pattern: "Neonatal low bowel obstruction",
    category: "Paeds",
    chapter: 50,
    differentials: [
      { letter: "H", condition: "Hirschsprung disease", diagnosis: "Hirschsprung Disease", hallmark: "Rectosigmoid ratio <1 + Sawtooth mucosa", stats: "95% delayed meconium" },
      { letter: "I", condition: "Ileal atresia", diagnosis: "Ileal Atresia", hallmark: "Microcolon + No gas in rectum", stats: "100% bilious vomiting" },
      { letter: "M", condition: "Meconium ileus", diagnosis: "Meconium Ileus", hallmark: "Bubbly meconium + CF history", stats: "90% have CF" },
      { letter: "A", condition: "Anorectal malformation", diagnosis: "Anorectal Malformation", hallmark: "Absent anal gas + VACTERL", stats: "50% VACTERL association" },
      { letter: "P", condition: "Meconium plug syndrome", diagnosis: "Meconium Plug Syndrome", hallmark: "Transition at splenic flexure + DM history", stats: "50% maternal diabetes" }
    ],
    seriousAlternatives: ["Midgut Volvulus", "Enterocolitis"]
  }
];

async function main() {
  console.log("Starting Master Data Synchronisation...");
  
  const mnemonics = await client.query(api.mnemonics.list as any, {});
  const discriminators = await client.query(api.discriminators.list as any, {});

  for (const entry of MASTER_DATA) {
    console.log(`Processing cluster: ${entry.mnemonic}`);

    // 1. Update the Mnemonic record
    const mRecord = mnemonics.find((m: any) => m.mnemonic === entry.mnemonic);
    if (mRecord) {
      console.log(`  Updating Mnemonic record ${mRecord._id}`);
      await client.mutation(api.mnemonics.update as any, {
        id: mRecord._id,
        differentials: entry.differentials.map(d => ({
          letter: d.letter,
          condition: d.condition,
          associatedFeatures: d.hallmark
        }))
      });
    }

    // 2. Author the Discriminator record
    const dMatches = discriminators.filter((d: any) => d.mnemonicRef?.mnemonic === entry.mnemonic);
    const discriminatorData = {
      pattern: entry.pattern,
      problemCluster: entry.mnemonic.toLowerCase(),
      seriousAlternatives: entry.seriousAlternatives,
      mnemonicRef: {
        mnemonic: entry.mnemonic,
        chapterNumber: entry.chapter,
        expandedLetters: entry.differentials.map(d => `${d.letter}: ${d.condition}`).join(", ")
      },
      differentials: entry.differentials.map((d, idx) => ({
        diagnosis: d.diagnosis,
        dominantImagingFinding: d.diagnosis.toUpperCase() + ": " + d.hallmark, // Ensuring non-empty
        distributionLocation: "Typically " + d.diagnosis + " distribution",
        demographicsClinicalContext: d.stats + ". " + d.hallmark,
        discriminatingKeyFeature: d.hallmark,
        associatedFindings: "Associated with " + d.condition,
        complicationsSeriousAlternatives: "Risk of progression",
        isCorrectDiagnosis: idx === 0
      }))
    };

    if (dMatches.length > 0) {
      console.log(`  Updating existing Discriminator ${dMatches[0]._id}`);
      await client.mutation(api.discriminators.update as any, {
        id: dMatches[0]._id,
        ...discriminatorData
      });
      // Delete duplicates if any
      if (dMatches.length > 1) {
        for (let i = 1; i < dMatches.length; i++) {
          await client.mutation(api.discriminators.remove as any, { id: dMatches[i]._id });
        }
      }
    } else {
      console.log(`  Creating new Discriminator`);
      await client.mutation(api.discriminators.create as any, discriminatorData);
    }
  }

  console.log("Master Sync Complete!");
}

main().catch(console.error);