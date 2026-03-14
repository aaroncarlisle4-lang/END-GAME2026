import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MNEMONIC_FIXES = [
  {
    mnemonic: "PORKCHOPS",
    differentials: [
      { letter: "P", condition: "Pyknodysostosis", associatedFeatures: "Dense bones, short stature, acro-osteolysis" },
      { letter: "O", condition: "Osteogenesis imperfecta", associatedFeatures: "Multiple fractures, blue sclerae, wormian bones" },
      { letter: "R", condition: "Rickets", associatedFeatures: "Metaphyseal fraying, bowing, osteopenia" },
      { letter: "K", condition: "Kinky hair syndrome (Menkes)", associatedFeatures: "Metaphyseal spurs, copper deficiency" },
      { letter: "C", condition: "Cleidocranial dysplasia", associatedFeatures: "Absent clavicles, supernumerary teeth" },
      { letter: "H", condition: "Hypothyroidism", associatedFeatures: "Delayed bone age, stippled epiphyses" },
      { letter: "O", condition: "One (Trisomy 21)", associatedFeatures: "Double bubble, 11 ribs, AA instability" },
      { letter: "P", condition: "Pachydermoperiostosis", associatedFeatures: "Periosteal reaction, skin thickening" },
      { letter: "S", condition: "Scurvy", associatedFeatures: "Wimberger ring, Frankel line, Pelkan spur" }
    ]
  },
  {
    mnemonic: "STREP ABC",
    differentials: [
      { letter: "S", condition: "Sarcoidosis", associatedFeatures: "Hilar nodes, perilymphatic nodules" },
      { letter: "T", condition: "Tuberculosis", associatedFeatures: "Apical cavitation, satellite nodules" },
      { letter: "R", condition: "Radiation", associatedFeatures: "Geometric, sharp margin" },
      { letter: "E", condition: "Extrinsic allergic alveolitis", associatedFeatures: "Mosaic, headcheese sign" },
      { letter: "P", condition: "Pneumoconiosis", associatedFeatures: "Eggshell nodes, PMF masses" },
      { letter: "A", condition: "Ankylosing spondylitis", associatedFeatures: "Apical fibrobullous, bamboo spine" },
      { letter: "B", condition: "Berylliosis", associatedFeatures: "Aerospace exposure, mimics sarcoid" },
      { letter: "C", condition: "Cystic fibrosis", associatedFeatures: "Upper lobe bronchiectasis, hyperinflation" }
    ]
  },
  {
    mnemonic: "FEGNOMASHIC",
    differentials: [
      { letter: "F", condition: "Fibrous dysplasia", associatedFeatures: "Ground glass matrix, rind sign" },
      { letter: "E", condition: "Enchondroma", associatedFeatures: "Rings and arcs calcification" },
      { letter: "G", condition: "Giant cell tumour", associatedFeatures: "Epiphyseal, subarticular, adult" },
      { letter: "N", condition: "Non-ossifying fibroma", associatedFeatures: "Eccentric, sclerotic margin, child" },
      { letter: "O", condition: "Osteoblastoma", associatedFeatures: "Posterior elements spine, >2cm" },
      { letter: "M", condition: "Metastasis / Myeloma", associatedFeatures: "Aggressive lytic, older patient" },
      { letter: "A", condition: "Aneurysmal bone cyst", associatedFeatures: "Blow-out, fluid-fluid levels" },
      { letter: "S", condition: "Simple bone cyst", associatedFeatures: "Central, fallen fragment sign" },
      { letter: "H", condition: "Hyperparathyroidism (Brown tumor)", associatedFeatures: "Subperiosteal resorption" },
      { letter: "I", condition: "Infection (Brodie abscess)", associatedFeatures: "Penumbra sign on MRI" },
      { letter: "C", condition: "Chondromyxoid fibroma", associatedFeatures: "Eccentric, scalloped margin" }
    ]
  }
];

async function main() {
  console.log("Fixing mnemonic definitions...");
  const mnemonics = await client.query(api.mnemonics.list as any, {});
  
  for (const fix of MNEMONIC_FIXES) {
    const target = mnemonics.find((m: any) => m.mnemonic === fix.mnemonic);
    if (target) {
      console.log(`Updating mnemonic: ${fix.mnemonic}`);
      await client.mutation(api.mnemonics.update as any, {
        id: target._id,
        differentials: fix.differentials
      });
    }
  }
  console.log("Mnemonic fix complete!");
}

main().catch(console.error);