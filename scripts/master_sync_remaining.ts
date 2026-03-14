import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const MASTER_DATA = [
  {
    mnemonic: "HAFM",
    pattern: "Enhancing liver lesion",
    differentials: [
      { letter: "H", condition: "Haemangioma", diagnosis: "Haemangioma", hallmark: "Discontinuous nodular peripheral enhancement", stats: "Pooling on delays" },
      { letter: "A", condition: "Adenoma / Abscess", diagnosis: "Adenoma", hallmark: "OCP use + Fat/Haemorrhage", stats: "90% OCP association" },
      { letter: "F", condition: "FNH", diagnosis: "FNH", hallmark: "Central scar + Arterial enhancement", stats: "8:1 Female" },
      { letter: "M", condition: "Metastasis / Malignancy (HCC)", diagnosis: "HCC", hallmark: "Wash-in/Wash-out + Pseudo-capsule", stats: "80% in Cirrhosis" }
    ]
  },
  {
    mnemonic: "PAGES",
    pattern: "Pneumobilia",
    differentials: [
      { letter: "P", condition: "Perforated ulcer", diagnosis: "Perforated Ulcer", hallmark: "Free air + Rigid abdomen", stats: "Rigler's sign (double wall)" },
      { letter: "A", condition: "Anastomosis", diagnosis: "Biliary-Enteric Bypass", hallmark: "Permanent air + surgical clips", stats: "History of Whipple's" },
      { letter: "G", condition: "Gallstone ileus", diagnosis: "Gallstone Ileus", hallmark: "Rigler Triad: SBO + Air + Stone", stats: "100% specific triad" },
      { letter: "E", condition: "ERCP / Emphysematous cholecystitis", diagnosis: "Emphysematous Cholecystitis", hallmark: "Air in GB wall + Diabetes", stats: "15% mortality" },
      { letter: "S", condition: "Sphincterotomy", diagnosis: "Recent ERCP", hallmark: "Air in central ducts post-procedure", stats: "Resolves in 1 week" }
    ]
  },
  {
    mnemonic: "CLCTA",
    pattern: "Terminal ileal mass/stricture",
    differentials: [
      { letter: "C", condition: "Crohn's disease", diagnosis: "Crohn's Disease", hallmark: "String sign + Fat wrapping", stats: "95% Terminal Ileum" },
      { letter: "L", condition: "Lymphoma", diagnosis: "Small Bowel Lymphoma", hallmark: "Aneurysmal dilatation + bulky nodes", stats: "90% aneurysmal sign" },
      { letter: "C", condition: "Carcinoid", diagnosis: "Ileal Carcinoid", hallmark: "Spiculated mass + Calcification", stats: "70% calcified" },
      { letter: "T", condition: "TB", diagnosis: "Ileocaecal TB", hallmark: "Stierlin sign + Nodal calcification", stats: "90% Ileocaecal" },
      { letter: "A", condition: "Adenocarcinoma", diagnosis: "Adenocarcinoma", hallmark: "Apple-core lesion + Short segment", stats: "Shouldered margins" }
    ]
  },
  {
    mnemonic: "CUBIC",
    pattern: "Colitis",
    differentials: [
      { letter: "C", condition: "Crohn's disease / C. diff", diagnosis: "C. diff (Pseudomembranous)", hallmark: "Accordion sign + antibiotics history", stats: "100% accordion sign" },
      { letter: "U", condition: "Ulcerative colitis", diagnosis: "Ulcerative Colitis", hallmark: "Lead-pipe colon + Continuous", stats: "95%+ Rectal involvement" },
      { letter: "B", condition: "Behçet disease", diagnosis: "Behçet Disease", hallmark: "Deep ulcers + Triad (Oral/Genital/Uveitis)", stats: "Silk road descent" },
      { letter: "I", condition: "Ischaemic colitis", diagnosis: "Ischaemic Colitis", hallmark: "Thumbprinting + Splenic flexure", stats: "80% at Griffith point" },
      { letter: "C", condition: "Cytomegalovirus", diagnosis: "CMV Colitis", hallmark: "Deep ulcers + CD4 <50", stats: "Severe watery diarrhoea" }
    ]
  },
  {
    mnemonic: "SCALD",
    pattern: "Solid mesenteric/peritoneal mass",
    differentials: [
      { letter: "S", condition: "Sclerosing mesenteritis", diagnosis: "Sclerosing Mesenteritis", hallmark: "Misty mesentery + Fat-ring sign", stats: "100% Misty mesentery" },
      { letter: "C", condition: "Carcinoid", diagnosis: "Carcinoid (Metastatic)", hallmark: "Desmoplastic reaction + Kinking", stats: "70% calcified" },
      { letter: "A", condition: "Adenocarcinoma (Mets)", diagnosis: "Peritoneal Carcinomatosis", hallmark: "Omental caking + Ascites", stats: "Ovarian primary common" },
      { letter: "L", condition: "Lymphoma", diagnosis: "Mesenteric Lymphoma", hallmark: "Sandwich sign (encased fat)", stats: "Vessels not narrowed" },
      { letter: "D", condition: "Desmoid", diagnosis: "Desmoid Tumor", hallmark: "Solid mass + surgical scar history", stats: "Gardner syndrome (FAP)" }
    ]
  },
  {
    mnemonic: "POSTCARDS",
    pattern: "Renal papillary necrosis",
    differentials: [
      { letter: "P", condition: "Pyelonephritis", diagnosis: "Acute Pyelonephritis", hallmark: "Striated nephrogram + Sepsis", stats: "100% classic sign" },
      { letter: "O", condition: "Obstruction", diagnosis: "Obstructive Uropathy", hallmark: "Calyceal blunting + Hydronephrosis", stats: "Proximal to block" },
      { letter: "S", condition: "Sickle cell", diagnosis: "Sickle Cell SCD", hallmark: "H-shaped vertebrae + Sclerosis", stats: "Medullary necrosis" },
      { letter: "T", condition: "TB", diagnosis: "Renal TB", hallmark: "Moth-eaten calyces + Putty kidney", stats: "Pipestem ureter" },
      { letter: "C", condition: "Cirrhosis", diagnosis: "Cirrhosis / Alcohol", hallmark: "Papillary necrosis + Liver stigmata", stats: "Secondary to dehydration" },
      { letter: "A", condition: "Analgesics", diagnosis: "Analgesic Nephropathy", hallmark: "Small kidneys + Papillary calc", stats: "90% papillary calc" },
      { letter: "R", condition: "Renal vein thrombosis", diagnosis: "Renal Vein Thrombosis", hallmark: "Enlarged kidney + filling defect", stats: "Nephrotic syndrome" },
      { letter: "D", condition: "Diabetes", diagnosis: "Diabetes Mellitus", hallmark: "Lobster-claw + Ring shadow", stats: "80% bilateral" },
      { letter: "S", condition: "Systemic (Vasculitis)", diagnosis: "Vasculitis (GPA)", hallmark: "Papillary loss + systemic markers", stats: "Renal-Lung triad" }
    ]
  },
  {
    mnemonic: "MARSH",
    pattern: "Nephrocalcinosis",
    differentials: [
      { letter: "M", condition: "Medullary sponge kidney", diagnosis: "Medullary Sponge Kidney", hallmark: "Bouquet of flowers + Ectatic ducts", stats: "100% specific IVP" },
      { letter: "A", condition: "Acidosis (RTA)", diagnosis: "RTA (Type 1)", hallmark: "Dense medullary calc + Alkaline urine", stats: "90% dense calc" },
      { letter: "R", condition: "Rare (Oxalosis)", diagnosis: "Primary Oxalosis", hallmark: "CORTICAL + Medullary calc", stats: "100% cortical specificity" },
      { letter: "S", condition: "Sarcoidosis", diagnosis: "Sarcoidosis (Renal)", hallmark: "Hypercalciuria + Medullary calc", stats: "Hilar nodes history" },
      { letter: "H", condition: "Hyperparathyroidism", diagnosis: "Hyperparathyroidism", hallmark: "Subperiosteal resorption + Salt/Pepper skull", stats: "100% pathognomonic" }
    ]
  },
  {
    mnemonic: "MAGIC DR",
    pattern: "Ring enhancing brain lesions",
    differentials: [
      { letter: "M", condition: "Metastasis", diagnosis: "Metastasis", hallmark: "Thin smooth ring + Grey-white junction", stats: "90% grey-white" },
      { letter: "A", condition: "Abscess", diagnosis: "Abscess", hallmark: "Thin smooth ring + DWI restriction", stats: "100% central restriction" },
      { letter: "G", condition: "Glioblastoma", diagnosis: "Glioblastoma (GBM)", hallmark: "Thick shaggy wall + Corpus callosum", stats: "90% crossing midline" },
      { letter: "I", condition: "Infarct", diagnosis: "Subacute Infarct", hallmark: "Gyral enhancement + Vascular territory", stats: "FAST history" },
      { letter: "C", condition: "Contusion", diagnosis: "Cerebral Contusion", hallmark: "Surface bloom + Trauma history", stats: "Coup/Contre-coup" },
      { letter: "D", condition: "Demyelinating", diagnosis: "Tumefactive MS", hallmark: "Open ring sign (arc)", stats: "Facing grey matter" },
      { letter: "R", condition: "Radiation necrosis", diagnosis: "Radiation Necrosis", hallmark: "Swiss-cheese pattern + Field respect", stats: "6-24 months post-RT" }
    ]
  },
  {
    mnemonic: "SAME",
    pattern: "CPA mass",
    differentials: [
      { letter: "S", condition: "Schwannoma", diagnosis: "Vestibular Schwannoma", hallmark: "Ice-cream cone + IAC widening", stats: "95% hearing loss" },
      { letter: "A", condition: "Arachnoid cyst / Aneurysm", diagnosis: "Arachnoid Cyst", hallmark: "CSF signal + No restriction", stats: "Suppresses on FLAIR" },
      { letter: "M", condition: "Meningioma", diagnosis: "Meningioma", hallmark: "Dural tail + Hyperostosis", stats: "60-70% dural tail" },
      { letter: "E", condition: "Epidermoid / Ependymoma", diagnosis: "Epidermoid Cyst", hallmark: "Cauliflower + DWI restricted", stats: "100% specific DWI" }
    ]
  },
  {
    mnemonic: "CRAMP",
    pattern: "Pituitary region mass",
    differentials: [
      { letter: "C", condition: "Craniopharyngioma", diagnosis: "Craniopharyngioma", hallmark: "Cystic (90%) + Calcified (90%)", stats: "Machinery oil" },
      { letter: "R", condition: "Rathke cleft cyst", diagnosis: "Rathke Cleft Cyst", hallmark: "Non-enhancing + Waxy nodule", stats: "100% non-enhancing" },
      { letter: "A", condition: "Adenoma / Aneurysm", diagnosis: "Pituitary Adenoma", hallmark: "Figure-of-8 + Sella expansion", stats: "100% sella enlargement" },
      { letter: "M", condition: "Meningioma / Metastasis", diagnosis: "Meningioma", hallmark: "Dural tail + Broad base", stats: "Normal sella size" },
      { letter: "P", condition: "Pituicytoma", diagnosis: "Pituicytoma", hallmark: "Solid intensely enhancing mass", stats: "Rare posterior pituitary" }
    ]
  },
  {
    mnemonic: "FITCH",
    pattern: "Basal ganglia calcification",
    differentials: [
      { letter: "F", condition: "Fahr disease", diagnosis: "Fahr Disease", hallmark: "Symmetric + Dentate nucleus", stats: "100% specific pattern" },
      { letter: "I", condition: "Idiopathic", diagnosis: "Idiopathic (Age)", hallmark: "Globus pallidus only", stats: "20% over 65y" },
      { letter: "T", condition: "Thyroid (Hypoparathyroidism)", diagnosis: "Hypoparathyroidism", hallmark: "Diffuse + Low Calcium", stats: "Subperiosteal resorption" },
      { letter: "C", condition: "Carbon monoxide", diagnosis: "CO Poisoning", hallmark: "Globus pallidus necrosis", stats: "History of exposure" },
      { letter: "H", condition: "Hypoxia", diagnosis: "Global Hypoxia", hallmark: "Diffuse signal change", stats: "Post-arrest" }
    ]
  },
  {
    mnemonic: "MATCH",
    pattern: "Intra-axial haemorrhage",
    differentials: [
      { letter: "M", condition: "Metastasis", diagnosis: "Metastasis", hallmark: "Persistent oedema + Nodule", stats: "Known primary CA" },
      { letter: "A", condition: "Amyloid angiopathy / AVM", diagnosis: "Amyloid Angiopathy", hallmark: "Lobar + Microbleeds", stats: "100% specific microbleeds" },
      { letter: "T", condition: "Trauma", diagnosis: "Trauma", hallmark: "Surface location + history", stats: "Coup/Contre-coup" },
      { letter: "C", condition: "Coagulopathy", diagnosis: "Coagulopathy", hallmark: "Large bleed + Fluid levels", stats: "History of Warfarin" },
      { letter: "H", condition: "Hypertension", diagnosis: "Hypertension", hallmark: "Deep grey (BG/Thalamus)", stats: "60% Basal Ganglia" }
    ]
  },
  {
    mnemonic: "ALICE",
    pattern: "Restricted diffusion in brain",
    differentials: [
      { letter: "A", condition: "Abscess", diagnosis: "Abscess", hallmark: "Central restricted diffusion", stats: "100% central restriction" },
      { letter: "L", condition: "Lymphoma / Leukaemia", diagnosis: "Lymphoma", hallmark: "Solid restricted diffusion", stats: "Periventricular" },
      { letter: "I", condition: "Infarct (Acute)", diagnosis: "Acute Infarct", hallmark: "Vascular territory (MCA)", stats: "100% specific <24h" },
      { letter: "C", condition: "CJD", diagnosis: "CJD", hallmark: "Cortical ribboning", stats: "Pulvinar sign" },
      { letter: "E", condition: "Encephalitis (HSV)", diagnosis: "HSV Encephalitis", hallmark: "Temporal lobe + Insula", stats: "100% temporal involvement" }
    ]
  },
  {
    mnemonic: "I HEAL",
    pattern: "Intramedullary spinal mass",
    differentials: [
      { letter: "I", condition: "Infarct / Infection", diagnosis: "Spinal Infarct", hallmark: "Owl's Eyes sign", stats: "Acute paraplegia" },
      { letter: "H", condition: "Haemangioblastoma", diagnosis: "Haemangioblastoma", hallmark: "Cyst + Mural nodule", stats: "VHL history" },
      { letter: "E", condition: "Ependymoma", diagnosis: "Ependymoma", hallmark: "Central + Haemosiderin cap", stats: "80% specific cap" },
      { letter: "A", condition: "Astrocytoma", diagnosis: "Astrocytoma", hallmark: "Eccentric + Patchy", stats: "Children (60%)" },
      { letter: "L", condition: "Lipoma / Lymphoma", diagnosis: "Spinal Lipoma", hallmark: "Fat signal (T1 high)", stats: "Tethered cord" }
    ]
  },
  {
    mnemonic: "MENDS",
    pattern: "Extramedullary intradural spinal mass",
    differentials: [
      { letter: "M", condition: "Meningioma / Metastasis", diagnosis: "Meningioma", hallmark: "Dural tail + Thoracic", stats: "80% Thoracic" },
      { letter: "E", condition: "Ependymoma (Myxopapillary)", diagnosis: "Myxopapillary Ependymoma", hallmark: "Filum Terminale sausage mass", stats: "Haemorrhagic margin" },
      { letter: "N", condition: "Nerve (Schwannoma/NF)", diagnosis: "Schwannoma", hallmark: "Dumbbell + Foramen widening", stats: "90% widening" },
      { letter: "D", condition: "Dermoid / Dermatomyositis", diagnosis: "Dermoid Cyst", hallmark: "Fat signal + Dermal sinus", stats: "Associated dysraphism" },
      { letter: "S", condition: "Sarcoid", diagnosis: "Sarcoidosis (CNS)", hallmark: "Nodular pial enhancement", stats: "Stalk thickening" }
    ]
  },
  {
    mnemonic: "MEDAL",
    pattern: "Extradural spinal mass",
    differentials: [
      { letter: "M", condition: "Metastasis / Myeloma", diagnosis: "Metastasis", hallmark: "Pedicle loss + primary history", stats: "90% pedicle involvement" },
      { letter: "E", condition: "Epidural abscess", diagnosis: "Epidural Abscess", hallmark: "Restricted diffusion + sepsis", stats: "100% classic collection" },
      { letter: "D", condition: "Disc herniation", diagnosis: "Disc Herniation", hallmark: "Contiguous with disc space", stats: "No bone destruction" },
      { letter: "A", condition: "Angioma", diagnosis: "Epidural Angioma", hallmark: "Flow voids + Vertebral hemangioma", stats: "T2 high signal" },
      { letter: "L", condition: "Lymphoma / Lipomatosis", diagnosis: "Epidural Lymphoma", hallmark: "Wrap-around (En plaque) mass", stats: "Vessels not narrowed" }
    ]
  },
  {
    mnemonic: "SLOP",
    pattern: "Diffuse periosteal reaction child",
    differentials: [
      { letter: "S", condition: "Scurvy / Syphilis", diagnosis: "Scurvy", hallmark: "Wimberger Ring + Frankel Line", stats: "Vitamin C deficiency" },
      { letter: "L", condition: "Leukaemia / Lymphoma", diagnosis: "Leukaemia", hallmark: "Metaphyseal bands + Symmetrical", stats: "90% bands" },
      { letter: "O", condition: "Osteomyelitis", diagnosis: "Multifocal Osteomyelitis", hallmark: "Sequestrum + sepsis", stats: "Rapid change" },
      { letter: "P", condition: "Prostaglandin E1 / Physiological", diagnosis: "PGE1 Infusion", hallmark: "History of ductal-dependent CHD", stats: "100% symmetrical" }
    ]
  },
  {
    mnemonic: "LEMON",
    pattern: "Vertebra plana",
    differentials: [
      { letter: "L", condition: "Langerhans' cell histiocytosis (EG)", diagnosis: "EG (LCH)", hallmark: "Solitary pancake + Preserved disc", stats: "100% disc preservation" },
      { letter: "E", condition: "Ewing's sarcoma / Enchondroma", diagnosis: "Ewing Sarcoma", hallmark: "Massive soft tissue + Permeative", stats: "No disc involvement" },
      { letter: "M", condition: "Metastasis (Neuroblastoma) / Myeloma", diagnosis: "Metastatic Neuroblastoma", hallmark: "Raccoon eyes + High VMA", stats: "Crosses midline" },
      { letter: "O", condition: "Osteomyelitis", diagnosis: "TB (Pott's Disease)", hallmark: "Disc destruction + Psoas abscess", stats: "100% specific vs tumor" },
      { letter: "N", condition: "Neuroblastoma", diagnosis: "Neuroblastoma", hallmark: "Paraspinal mass + calcification", stats: "Midline crossing" }
    ]
  },
  {
    mnemonic: "GAME",
    pattern: "Posterior fossa mass in child",
    differentials: [
      { letter: "G", condition: "Glioma (Pilocytic astrocytoma)", diagnosis: "Pilocytic Astrocytoma", hallmark: "Cyst + Enhancing nodule", stats: "100% specific appearance" },
      { letter: "A", condition: "Astrocytoma", diagnosis: "Brainstem Glioma", hallmark: "Diffuse pons expansion", stats: "Basilar displacement" },
      { letter: "M", condition: "Medulloblastoma", diagnosis: "Medulloblastoma", hallmark: "Midline + Restricted diffusion", stats: "100% restricted" },
      { letter: "E", condition: "Ependymoma", diagnosis: "Ependymoma", hallmark: "Plastic + Calcified (50%)", stats: "Floor of 4th ventricle" }
    ]
  },
  {
    mnemonic: "WHAM",
    pattern: "Large abdominal mass in child",
    differentials: [
      { letter: "W", condition: "Wilms tumor", diagnosis: "Wilms Tumor", hallmark: "Claw sign + Spares vessels", stats: "Peak 3-4y" },
      { letter: "H", condition: "Hepatoblastoma / Hydronephrosis", diagnosis: "Hepatoblastoma", hallmark: "Liver origin + High AFP", stats: "90% high AFP" },
      { letter: "A", condition: "Adrenal (Neuroblastoma)", diagnosis: "Neuroblastoma", hallmark: "Crosses midline + Encases vessels", stats: "90% calcified" },
      { letter: "M", condition: "Mesoblastic nephroma / MCDK", diagnosis: "Mesoblastic Nephroma", hallmark: "Neonate + Solid renal mass", stats: "100% specific age" }
    ]
  }
];

async function main() {
  console.log("Master Sync Batch 3: Neuro, Paeds, GI, GU...");
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
  console.log("Batch 3 complete!");
}

main().catch(console.error);