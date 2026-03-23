import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_14_DATA = [
  {
    pattern: "SYNDROMES AND BONE DYSPLASIAS ASSOCIATED WITH SHORT STATURE",
    itemNumber: "1.39",
    problemCluster: "dwarfism",
    seriousAlternatives: ["Achondroplasia", "Thanatophoric Dysplasia", "Hypochondroplasia", "OI Type II"],
    differentials: [
      {
        diagnosis: "Achondroplasia",
        dominantImagingFinding: "Rhizomelic (proximal) shortening. NARROWING interpedicular distance caudally. Trident hands.",
        distributionLocation: "Generalized. Long bones and spine.",
        demographicsClinicalContext: "Most common non-lethal skeletal dysplasia. AD inheritance (80% de novo). Normal IQ.",
        discriminatingKeyFeature: "SPINAL NARROWING: The interpedicular distance decreases from L1 to L5. Normal spines WIDEN. Bullet-shaped vertebrae.",
        associatedFindings: "Frontal bossing and midface hypoplasia.",
        complicationsSeriousAlternatives: "Spinal stenosis and Foramen Magnum stenosis (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Thanatophoric Dysplasia",
        dominantImagingFinding: "Extreme rhizomelic shortening with 'TELEPHONE-RECEIVER' femora. Wafer-like platyspondyly.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Neonates. Lethal. Narrow chest.",
        discriminatingKeyFeature: "TELEPHONE RECEIVER femora: Extreme bowing of the long bones. Type II has a Cloverleaf skull.",
        associatedFindings: "Marked polyhydramnios.",
        complicationsSeriousAlternatives: "Early neonatal death from respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Cleidocranial Dysostosis",
        dominantImagingFinding: "Absent or hypoplastic CLAVICLES. Multiple Wormian bones. Supernumerary teeth.",
        distributionLocation: "Skull, Clavicles, and Pelvis.",
        demographicsClinicalContext: "AD inheritance. Short stature.",
        discriminatingKeyFeature: "ABSENT CLAVICLES (85% bilateral) and wide-open fontanelles. Drooping shoulders.",
        associatedFindings: "Supernumerary teeth.",
        complicationsSeriousAlternatives: "Dental crowding.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S ACRO-ILIAC JOINT ANKYLOSIS",
    itemNumber: "3.14",
    problemCluster: "fused SI joints",
    seriousAlternatives: ["Ankylosing Spondylitis", "Enteropathic Arthritis", "Juvenile Idiopathic Arthritis (JIA)", "Prior Infection"],
    differentials: [
      {
        diagnosis: "Ankylosing Spondylitis",
        dominantImagingFinding: "Bilateral, strictly symmetric SI joint fusion. Complete obliteration of the joint space.",
        distributionLocation: "Bilateral and symmetric SIJs.",
        demographicsClinicalContext: "Young males. HLA-B27 positive (95%). Ascending spinal involvement.",
        discriminatingKeyFeature: "STRICT SYMMETRY and BAMBOO SPINE (marginal syndesmophytes). Most common cause of SIJ ankylosis.",
        associatedFindings: "Uveitis and Apical lung fibrosis.",
        complicationsSeriousAlternatives: "Spinal fractures (Pseudoarthrosis).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Juvenile Idiopathic Arthritis (JIA)",
        dominantImagingFinding: "SI joint fusion in a young patient. Often associated with fusion of the cervical spine facets.",
        distributionLocation: "SI joints and Cervical Spine (C2-C4).",
        demographicsClinicalContext: "Children/Adolescents. Growth disturbance.",
        discriminatingKeyFeature: "CERVICAL FUSION: Ankylosis of the cervical facet joints is highly suggestive of JIA over adult AS.",
        associatedFindings: "Micrognathia.",
        complicationsSeriousAlternatives: "Blindness (Uveitis).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Ochronosis (Alkaptonuria)",
        dominantImagingFinding: "SI joint ankylosis with diffuse intervertebral DISC CALCIFICATION.",
        distributionLocation: "Generalized spine and SIJs.",
        demographicsClinicalContext: "Black urine upon standing. Connective tissue pigmentation.",
        discriminatingKeyFeature: "DISC CALCIFICATION: Every intervertebral disc is calcified. This is extremely rare in AS or JIA.",
        associatedFindings: "Large joint OA.",
        complicationsSeriousAlternatives: "Valvular heart disease.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "G ASTRIC FOLDS",
    itemNumber: "6.13",
    problemCluster: "thickened gastric folds",
    seriousAlternatives: ["Ménétrier Disease", "Zollinger-Ellison Syndrome", "Gastric Lymphoma", "Gastritis"],
    differentials: [
      {
        diagnosis: "Ménétrier Disease",
        dominantImagingFinding: "Massive, tortuous gastric folds characteristically involving the FUNDUS and BODY. Spares the antrum.",
        distributionLocation: "Fundus and Body focus.",
        demographicsClinicalContext: "Adults. Hypoproteinaemia (oedema) and epigastric pain.",
        discriminatingKeyFeature: "ANTRAL SPARING: The folds in the antrum are typically normal. Associated with protein-losing enteropathy.",
        associatedFindings: "Anasarca.",
        complicationsSeriousAlternatives: "Gastric adenocarcinoma (10-15%).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Zollinger-Ellison Syndrome (Gastrinoma)",
        dominantImagingFinding: "Thickened gastric folds with hypersecretion. Multiple peptic ulcers in ATYPICAL locations.",
        distributionLocation: "Stomach, Duodenum, and Jejunum.",
        demographicsClinicalContext: "Recurrent severe PUD. Diarrhea. High serum gastrin.",
        discriminatingKeyFeature: "ATYPICAL ULCERS: Ulcers in the distal duodenum or jejunum combined with thick gastric folds and fluid.",
        associatedFindings: "Pancreatic NET (Gastrinoma).",
        complicationsSeriousAlternatives: "Perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Gastric Lymphoma",
        dominantImagingFinding: "Massive mural thickening and folds. Can cross the pylorus into the duodenum.",
        distributionLocation: "Diffuse or segmental.",
        demographicsClinicalContext: "B-symptoms. H. pylori association.",
        discriminatingKeyFeature: "CROSSES PYLORUS: Unlike gastric cancer, lymphoma frequently crosses into the duodenum (30%). Extremely thick folds.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "Perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P INEAL REGION MASS",
    itemNumber: "12.39",
    problemCluster: "pineal tumor",
    seriousAlternatives: ["Germinoma", "Pineoblastoma", "Pineocytoma", "Tectal Glioma"],
    differentials: [
      {
        diagnosis: "Germinoma",
        dominantImagingFinding: "Solid, intensely enhancing mass. Characteristically ENVELOPS the pineal calcification.",
        distributionLocation: "Pineal gland (Most common) and Suprasellar space.",
        demographicsClinicalContext: "Adolescent males (10:1). Parinaud Syndrome (Upward gaze palsy).",
        discriminatingKeyFeature: "ENVELOPED CALCIFICATION: The normal pineal gland is engulfed by the tumor. Highly radiosensitive.",
        associatedFindings: "CSF seeding.",
        complicationsSeriousAlternatives: "Hydrocephalus.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pineoblastoma",
        dominantImagingFinding: "Large, aggressive mass with 'EXPLODED' pineal calcification. Restricted diffusion.",
        distributionLocation: "Pineal gland focus.",
        demographicsClinicalContext: "Children (<5y). Highly malignant.",
        discriminatingKeyFeature: "EXPLODED CALCIFICATION: The pineal calcification is pushed to the periphery of the mass. Very young age.",
        associatedFindings: "Bilateral retinoblastomas (Trilateral retinoblastoma).",
        complicationsSeriousAlternatives: "Early CSF spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pineal Cyst",
        dominantImagingFinding: "Simple, thin-walled cyst. Often shows rim-calcification.",
        distributionLocation: "Pineal gland.",
        demographicsClinicalContext: "Common incidental finding in adults.",
        discriminatingKeyFeature: "SIMPLE CYSTIC appearance. Wall thickness <2mm. If >10mm or thick-walled, needs follow-up.",
        associatedFindings: "Normal flow in aqueduct.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "O STEOSCLEROSIS IN CHILDHOOD",
    itemNumber: "14.16",
    problemCluster: "paediatric sclerosis",
    seriousAlternatives: ["Osteopetrosis", "Pyknodysostosis", "Renal Osteodystrophy", "Heavy Metal (Lead)"],
    differentials: [
      {
        diagnosis: "Osteopetrosis (Infantile AR type)",
        dominantImagingFinding: "Diffuse extreme sclerosis. BONE-IN-BONE (Endobone) and SANDWICH vertebrae.",
        distributionLocation: "Generalized skeleton.",
        demographicsClinicalContext: "Infants. Hepatosplenomegaly and marrow failure (anaemia).",
        discriminatingKeyFeature: "BONE-IN-BONE and lack of medullary spaces. Erlenmeyer flask deformity. Most severe sclerosis.",
        associatedFindings: "Cranial nerve palsies (from foraminal narrowing).",
        complicationsSeriousAlternatives: "Death from marrow failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pyknodysostosis",
        dominantImagingFinding: "Diffuse sclerosis with associated ACRO-OSTEOLYSIS and Wormian bones.",
        distributionLocation: "Generalized. Hands focus.",
        demographicsClinicalContext: "Children. Short stature and persistent open fontanelles.",
        discriminatingKeyFeature: "ACRO-OSTEOLYSIS: Unlike osteopetrosis, there is resorption of the distal phalanges. Open fontanelles.",
        associatedFindings: "Obtuse mandibular angle.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Lead Poisoning (Lead Lines)",
        dominantImagingFinding: "Thick dense bands at the metaphyses (Zone of provisional calcification).",
        distributionLocation: "Metaphyses of knees and wrists.",
        demographicsClinicalContext: "Children with pica. Irritability.",
        discriminatingKeyFeature: "METAPHYSEAL BANDS: Sclerosis is limited to the growth plates, not the whole bone (unlike petrosis).",
        associatedFindings: "Opaque material in the GI tract.",
        complicationsSeriousAlternatives: "Encephalopathy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "O VARIAN MASS IN a CHILD",
    itemNumber: "14.57",
    problemCluster: "paediatric adnexa",
    seriousAlternatives: ["Mature Teratoma (Dermoid)", "Ovarian Torsion", "Dysgerminoma"],
    differentials: [
      {
        diagnosis: "Mature Cystic Teratoma (Dermoid)",
        dominantImagingFinding: "Complex cystic and solid mass containing MACROSCOPIC FAT and calcification (teeth).",
        distributionLocation: "Ovary focus.",
        demographicsClinicalContext: "Most common ovarian tumor in children. Often asymptomatic.",
        discriminatingKeyFeature: "FAT and TEETH: Presence of fat (-100 HU) or dental elements is diagnostic. 10% are bilateral.",
        associatedFindings: "Rokitansky nodule.",
        complicationsSeriousAlternatives: "Ovarian torsion (most common complication).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ovarian Torsion (Acute)",
        dominantImagingFinding: "Enlarged, edematous ovary (>4cm) with multiple PERIPHERAL FOLLICLES.",
        distributionLocation: "Unilateral ovary.",
        demographicsClinicalContext: "Acute severe pelvic pain. Vomiting.",
        discriminatingKeyFeature: "PERIPHERAL FOLLICLES: Small follicles are pushed to the edge by central edema. Lack of venous flow on Doppler.",
        associatedFindings: "Free pelvic fluid.",
        complicationsSeriousAlternatives: "Ovarian necrosis (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Dysgerminoma",
        dominantImagingFinding: "Large, solid, multilobulated mass with thin internal septations.",
        distributionLocation: "Unilateral (85%).",
        demographicsClinicalContext: "Adolescents. Most common malignant germ cell tumor.",
        discriminatingKeyFeature: "SOLID mass with FIBROVASCULAR SEPTA (enhancing). Normal AFP (unlike yolk sac tumor).",
        associatedFindings: "Elevated LDH.",
        complicationsSeriousAlternatives: "Metastases.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "O PAQUE SPHENOID SINUS",
    itemNumber: "11.13",
    problemCluster: "sphenoid density",
    seriousAlternatives: ["Acute Sphenoid Sinusitis", "Mucocele", "Sphenoid Inverting Papilloma", "Meningioma (Mimic)"],
    differentials: [
      {
        diagnosis: "Acute Sphenoid Sinusitis",
        dominantImagingFinding: "Air-fluid level or complete opacification. No bone destruction.",
        distributionLocation: "Sphenoid sinus. Unilateral or bilateral.",
        demographicsClinicalContext: "Headache (Vertex or Retro-orbital). Fever.",
        discriminatingKeyFeature: "AIR-FLUID LEVEL and acute clinical symptoms. High risk of intracranial spread due to proximity to ICA/Sinus.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "Cavernous sinus thrombosis (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Sphenoid Mucocele",
        dominantImagingFinding: "Fluid-filled sinus with SMOOTH bony expansion. Thinned walls.",
        distributionLocation: "Sphenoid sinus.",
        demographicsClinicalContext: "Chronic headache and visual field defects.",
        discriminatingKeyFeature: "SMOOTH EXPANSION and lack of central enhancement. Can compress the optic nerves or pituitary.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "Blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Invasive Fungal Sinusitis",
        dominantImagingFinding: "Aggressive, permeative bone destruction crossing boundaries into the cavernous sinus or orbit.",
        distributionLocation: "Sphenoid/Ethmoid focus.",
        demographicsClinicalContext: "Immunocompromised (Diabetics). Severe pain.",
        discriminatingKeyFeature: "BONE DESTRUCTION and rapid clinical course. Black eschar on physical exam.",
        associatedFindings: "Cavernous sinus narrowing.",
        complicationsSeriousAlternatives: "Death (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "THYROID MASS",
    itemNumber: "11.18",
    problemCluster: "thyroid nodule",
    seriousAlternatives: ["Papillary Carcinoma", "Colloid Nodule", "Follicular Adenoma", "Anaplastic Carcinoma"],
    differentials: [
      {
        diagnosis: "Papillary Carcinoma (Most common)",
        dominantImagingFinding: "Solid, HYPOECHOIC nodule with tiny punctate MICROCALCIFICATIONS (Psammoma bodies).",
        distributionLocation: "Thyroid lobe.",
        demographicsClinicalContext: "Adults. Prior neck radiation. Asymptomatic lump.",
        discriminatingKeyFeature: "MICROCALCIFICATIONS and 'TALLER-THAN-WIDE' shape on US. Most specific US signs for malignancy.",
        associatedFindings: "Cystic level VI lymph nodes with internal calcification.",
        complicationsSeriousAlternatives: "Lymph node metastases (common).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Benign Colloid Nodule",
        dominantImagingFinding: "Isoechoic or hyperechoic nodule with internal cystic spaces and 'COMET-TAIL' artifacts.",
        distributionLocation: "Diffuse or focal (Goitre).",
        demographicsClinicalContext: "Extremely common in adults.",
        discriminatingKeyFeature: "COMET-TAIL ARTIFACT: Represents concentrated colloid. Highly suggestive of a benign lesion.",
        associatedFindings: "Halo sign (peripheral thin lucent rim).",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Anaplastic Carcinoma",
        dominantImagingFinding: "MASSIVE, aggressive, infiltrative mass. Rapidly destroys the thyroid and invades the neck.",
        distributionLocation: "Global thyroid involvement.",
        demographicsClinicalContext: "Elderly patients. Rapidly enlarging hard neck mass causing stridor.",
        discriminatingKeyFeature: "RAPID GROWTH and invasion: Unlike other thyroid cancers, this is extremely aggressive and fatal within months.",
        associatedFindings: "Tracheal compression.",
        complicationsSeriousAlternatives: "Airway obstruction (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "I NCREASED UPTAKE ON BONE SCANS",
    itemNumber: "1.43",
    problemCluster: "hot bone scan",
    seriousAlternatives: ["Osteoblastic Metastases", "Paget's Disease", "Fracture", "Osteomyelitis"],
    differentials: [
      {
        diagnosis: "Osteoblastic Metastases",
        dominantImagingFinding: "Multiple, disparate 'Hot' spots of varying intensity. Pedicle involvement.",
        distributionLocation: "Random distribution. Axial skeleton predominance.",
        demographicsClinicalContext: "Older adults. Known primary (Prostate/Breast).",
        discriminatingKeyFeature: "RANDOM distribution and disparate sizes. Unlike Paget's, it does not typically involve the entire bone.",
        associatedFindings: "Elevated PSA.",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paget's Disease (Scan)",
        dominantImagingFinding: "INTENSE, uniform uptake involving the entire bone (e.g. whole femur or pelvis half).",
        distributionLocation: "Polyostotic common. Pelvis, Skull, Spine, Long bones.",
        demographicsClinicalContext: "Elderly. High Alk Phos.",
        discriminatingKeyFeature: "UNIFORM/EXPANSILE: The entire bone is 'hot', matching the enlargement on X-ray. Follows the bone contour perfectly.",
        associatedFindings: "Enlarged bone on X-ray.",
        complicationsSeriousAlternatives: "None (related to scan).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Superscan (Diffuse Mets / HPT)",
        dominantImagingFinding: "Intense, uniform uptake throughout the entire axial skeleton. CHARACTERISTIC ABSENCE OF RENAL UPTAKE.",
        distributionLocation: "Generalized axial and proximal appendicular.",
        demographicsClinicalContext: "Metastatic Prostate CA or Renal Osteodystrophy.",
        discriminatingKeyFeature: "ABSENT KIDNEYS: The bones take up so much tracer that the kidneys are not visualized. High bone-to-soft tissue ratio.",
        associatedFindings: "Minimal soft tissue background.",
        complicationsSeriousAlternatives: "Marrow failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 14 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_14_DATA) {
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
  console.log("Batch 14 Complete!");
}

main().catch(console.error);