import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_13_DATA = [
  {
    pattern: "G ASTRIC OUTLET OBSTRUCTION",
    itemNumber: "6.12",
    problemCluster: "distended stomach",
    seriousAlternatives: ["Peptic Ulcer Disease (Stricture)", "Antral Carcinoma", "Adult Hypertrophic Pyloric Stenosis"],
    differentials: [
      {
        diagnosis: "Antral Adenocarcinoma",
        dominantImagingFinding: "Irregular, asymmetric wall thickening of the pyloric antrum. Abrupt narrowing.",
        distributionLocation: "Gastric antrum.",
        demographicsClinicalContext: "Elderly smokers. Weight loss and anorexia.",
        discriminatingKeyFeature: "MUCOSAL DESTRUCTION and abrupt transition. Malignant until proven otherwise.",
        associatedFindings: "Regional lymphadenopathy.",
        complicationsSeriousAlternatives: "Complete obstruction.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Chronic Peptic Ulcer Stricture",
        dominantImagingFinding: "Smooth, tapered narrowing of the pyloric canal. PRESERVED MUCOSA.",
        distributionLocation: "Pylorus or Duodenal bulb.",
        demographicsClinicalContext: "Long history of PUD or NSAID use.",
        discriminatingKeyFeature: "SMOOTH NARROWING and lack of a solid mass. History of prior ulcer disease.",
        associatedFindings: "Scarring of the duodenal bulb (Clover-leaf deformity).",
        complicationsSeriousAlternatives: "Dehydration.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Adult Hypertrophic Pyloric Stenosis",
        dominantImagingFinding: "Marked elongation and narrowing of the pyloric canal (>2-3cm). Smooth margins.",
        distributionLocation: "Pylorus.",
        demographicsClinicalContext: "Usually secondary to chronic gastritis/ulcers in adults.",
        discriminatingKeyFeature: "ELONGATED pyloric canal. Similar to neonatal but in an adult context.",
        associatedFindings: "Massive gastric distension.",
        complicationsSeriousAlternatives: "Vomiting.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P ANCREATIC DUCTAL DILATATION",
    itemNumber: "7.32",
    problemCluster: "dilated pancreatic duct",
    seriousAlternatives: ["Pancreatic Adenocarcinoma", "Chronic Pancreatitis", "IPMN", "Ampullary Carcinoma"],
    differentials: [
      {
        diagnosis: "Pancreatic Adenocarcinoma (Head)",
        dominantImagingFinding: "Abrupt cut-off of the main pancreatic duct with DISTAL atrophy.",
        distributionLocation: "Pancreatic head focus.",
        demographicsClinicalContext: "Elderly. Painless jaundice. Courvoisier law.",
        discriminatingKeyFeature: "DOUBLE-DUCT SIGN: Concurrent dilatation of the CBD and Pancreatic duct. Focal hypovascular mass.",
        associatedFindings: "Vascular encasement (SMA).",
        complicationsSeriousAlternatives: "Liver metastases.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Chronic Pancreatitis",
        dominantImagingFinding: "Irregular, 'BEADED' or tortuous ductal dilatation. Internal intraductal calculi.",
        distributionLocation: "Diffuse ductal involvement.",
        demographicsClinicalContext: "Chronic alcohol use. Malabsorption.",
        discriminatingKeyFeature: "INTRADUCTAL CALCULI: Dense calcifications within the dilated duct are diagnostic. Duct is 'beaded' rather than smoothly dilated.",
        associatedFindings: "Gland atrophy and pseudocysts.",
        complicationsSeriousAlternatives: "Pancreatic failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Main-duct IPMN",
        dominantImagingFinding: "Diffuse, massive dilatation of the main pancreatic duct (>10mm). Segmental or diffuse.",
        distributionLocation: "Entire main pancreatic duct.",
        demographicsClinicalContext: "Elderly patients. Chronic abdominal pain.",
        discriminatingKeyFeature: "MASSIVE DILATATION and 'fish-mouth' ampulla. Lacks the calcifications of chronic pancreatitis.",
        associatedFindings: "Mucin globules seen on MRI.",
        complicationsSeriousAlternatives: "Malignant transformation (High risk).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "BLADDER WALL CALCIFICATION",
    itemNumber: "8.33",
    problemCluster: "calcified bladder",
    seriousAlternatives: ["Schistosomiasis (Bilharzia)", "Bladder Tuberculosis", "Bladder Carcinoma (SCC)", "Cytoxan Cystitis"],
    differentials: [
      {
        diagnosis: "Schistosomiasis",
        dominantImagingFinding: "Fine, linear, 'EGG-SHELL' calcification outlining the entire bladder wall.",
        distributionLocation: "Entire bladder wall. Often involves the ureters.",
        demographicsClinicalContext: "History of travel to endemic areas (Africa/Middle East). Haematuria.",
        discriminatingKeyFeature: "LINEAR/CIRCUMFERENTIAL calcification. High risk of developing Squamous Cell Carcinoma (SCC) of the bladder.",
        associatedFindings: "Distal ureteric calcification.",
        complicationsSeriousAlternatives: "Bladder SCC (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Bladder Tuberculosis",
        dominantImagingFinding: "Thick, irregular, cloud-like calcification. Small, contracted 'THIMBLE' bladder.",
        distributionLocation: "Diffuse wall thickening and calcification.",
        demographicsClinicalContext: "History of renal/systemic TB.",
        discriminatingKeyFeature: "SMALL CONTRACTED bladder (Thimble bladder). Unlike Schisto, the bladder capacity is severely reduced.",
        associatedFindings: "Renal 'putty' kidney or papillary necrosis.",
        complicationsSeriousAlternatives: "Renal failure.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Encrusted Cystitis",
        dominantImagingFinding: "Irregular, plaques of calcification on the mucosal surface.",
        distributionLocation: "Mucosal surface.",
        demographicsClinicalContext: "Chronic infection with urea-splitting organisms (Proteus). Alkaline urine.",
        discriminatingKeyFeature: "ALKALINE URINE and irregular plaques. Lacks the uniform linear appearance of Schistosomiasis.",
        associatedFindings: "Stones.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "CALCIFICATION IN THE POSTERIOR FOSSA",
    itemNumber: "12.20",
    problemCluster: "posterior fossa density",
    seriousAlternatives: ["Ependymoma", "Medulloblastoma (Rarely)", "Oligodendroglioma", "Arteriovenous Malformation (AVM)"],
    differentials: [
      {
        diagnosis: "Ependymoma (4th Ventricle)",
        dominantImagingFinding: "Heterogeneous mass in the 4th ventricle. CALCIFICATION in 50%. Extends through the Foramina of Luschka/Magendie.",
        distributionLocation: "Floor of the 4th ventricle. Extends into the CPA cisterns.",
        demographicsClinicalContext: "Children (<5y). Symptoms of hydrocephalus.",
        discriminatingKeyFeature: "PLASTIC TUMOR: Ependymoma 'squeezes' through the outlet foramina. CALCIFICATION is very common (unlike medulloblastoma).",
        associatedFindings: "Hydrocephalus.",
        complicationsSeriousAlternatives: "Recurrence.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Medulloblastoma",
        dominantImagingFinding: "Solid mass arising from the Cerebellar Vermis. CALCIFICATION is UNCOMMON (10-20%).",
        distributionLocation: "Roof of the 4th ventricle (Vermis). Midline.",
        demographicsClinicalContext: "Children. Highly aggressive.",
        discriminatingKeyFeature: "MIDLINE and HYPERDENSE on non-contrast CT. Restricted diffusion (DWI High). Usually LACKS coarse calcification.",
        associatedFindings: "Leptomeningeal seeding (Drop mets).",
        complicationsSeriousAlternatives: "CSF spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "AVM (Posterior Fossa)",
        dominantImagingFinding: "Clumped, irregular calcification associated with FLOW VOIDS on MRI.",
        distributionLocation: "Cerebellar hemisphere or brainstem.",
        demographicsClinicalContext: "Young adults. Sudden onset SAH or focal deficit.",
        discriminatingKeyFeature: "FLOW VOIDS and snake-like vascular enhancement. No solid tumor mass.",
        associatedFindings: "Adjacent haemorrhage.",
        complicationsSeriousAlternatives: "Haemorrhage (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "O STEOPENIA IN CHILDHOOD",
    itemNumber: "14.15",
    problemCluster: "paediatric bone loss",
    seriousAlternatives: ["Leukaemia", "Rickets", "Juvenile Osteoporosis", "Hyperparathyroidism"],
    differentials: [
      {
        diagnosis: "Childhood Leukaemia (ALL)",
        dominantImagingFinding: "Diffuse severe osteopenia with METAPHYSEAL LUCENT BANDS. Focal bone destruction.",
        distributionLocation: "Generalized. Symmetrical metaphyseal bands.",
        demographicsClinicalContext: "Children (2-5y). Bone pain, fever, and bruising.",
        discriminatingKeyFeature: "METAPHYSEAL LUCENT BANDS: A classic early sign. Osteopenia is often much more severe than expected for age.",
        associatedFindings: "Hepatosplenomegaly.",
        complicationsSeriousAlternatives: "Marrow failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Rickets (Active)",
        dominantImagingFinding: "Osteopenia associated with FRAYING and CUPPING of the metaphyses. Widened physis.",
        distributionLocation: "Growing metaphyses (Wrist/Knee).",
        demographicsClinicalContext: "Children. Vitamin D deficiency. Bowed legs.",
        discriminatingKeyFeature: "WIDENED PHYSIS and cupping. Unlike leukaemia, there are no discrete lucent bands; the whole physis is abnormal.",
        associatedFindings: "Rachitic rosary.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Idiopathic Juvenile Osteoporosis",
        dominantImagingFinding: "Profound diffuse osteopenia and multiple vertebral collapses. Normal metaphyses.",
        distributionLocation: "Generalized skeleton. Spine focus.",
        demographicsClinicalContext: "Pre-pubertal children (8-12y). Sudden onset bone pain.",
        discriminatingKeyFeature: "NORMAL METAPHYSES: Unlike rickets or leukaemia, the growth plates and metaphyses are structurally normal. Self-limiting post-puberty.",
        associatedFindings: "Multiple fractures.",
        complicationsSeriousAlternatives: "Permanent deformity.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "TESTICULAR MASS IN a CHILD",
    itemNumber: "14.56",
    problemCluster: "paediatric scrotum",
    seriousAlternatives: ["Yolk Sac Tumor", "Teratoma", "Testicular Torsion (Mimic)", "Epididymo-orchitis"],
    differentials: [
      {
        diagnosis: "Yolk Sac Tumor",
        dominantImagingFinding: "Solid, heterogeneous mass. Often huge. Markedly elevated ALPHA-FETOPROTEIN (AFP).",
        distributionLocation: "Testis focus.",
        demographicsClinicalContext: "Infants and young children (<2y). Most common primary testicular malignancy in children.",
        discriminatingKeyFeature: "AFP ELEVATION: Extreme elevation of AFP is diagnostic. Lacks the fat/calcification of teratoma.",
        associatedFindings: "Hydrocele.",
        complicationsSeriousAlternatives: "Metastatic spread to nodes.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Mature Teratoma (Testicular)",
        dominantImagingFinding: "Complex mass containing FAT, FLUID, and CALCIFICATION.",
        distributionLocation: "Testis.",
        demographicsClinicalContext: "Infants. Benign in this age group (unlike adults).",
        discriminatingKeyFeature: "FAT and TEETH: Presence of macroscopic fat or bone/teeth within the mass is diagnostic.",
        associatedFindings: "None usually.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Testicular Torsion (Acute)",
        dominantImagingFinding: "Enlarged, HYPOECHOIC testis with absolute ABSENCE of flow on Doppler.",
        distributionLocation: "Unilateral testis.",
        demographicsClinicalContext: "Acute severe scrotal pain. High-riding testis. Teenage boys.",
        discriminatingKeyFeature: "ABSENCE OF FLOW: Doppler US shows no internal flow. Malignant tumors always have internal vascularity. EMERGENCY.",
        associatedFindings: "Whirlpool sign of the cord.",
        complicationsSeriousAlternatives: "Testicular necrosis (FATAL to testis within 6h).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "SKIN THICKENING (Non-inflammatory)",
    itemNumber: "10.5",
    problemCluster: "breast skin",
    seriousAlternatives: ["Lymphatic Obstruction", "Congestive Heart Failure", "Post-Radiation", "Anasarca"],
    differentials: [
      {
        diagnosis: "Lymphatic Obstruction (Axillary nodes)",
        dominantImagingFinding: "Diffuse skin thickening (>2mm) and trabecular coarsening. No discrete mass.",
        distributionLocation: "Unilateral or bilateral. Dependent focus.",
        demographicsClinicalContext: "Prior axillary surgery or known nodal metastases.",
        discriminatingKeyFeature: "AXILLARY NODES: US shows massive, replaced, or abnormal nodes. No breast warmth (unlike inflammatory CA).",
        associatedFindings: "Arm oedema.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Congestive Heart Failure",
        dominantImagingFinding: "Bilateral, symmetric skin thickening. Dependent portion of the breast.",
        distributionLocation: "BILATERAL and SYMMETRIC.",
        demographicsClinicalContext: "Elderly with CHF or renal failure.",
        discriminatingKeyFeature: "BILATERALITY and symmetry. Absence of nodes. Rapid response to diuretics.",
        associatedFindings: "Pleural effusions and cardiomegaly.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Post-Radiation Change",
        dominantImagingFinding: "Diffuse skin thickening and increased density. Surgical clips.",
        distributionLocation: "Unilateral (treated side).",
        demographicsClinicalContext: "History of radiotherapy for breast CA.",
        discriminatingKeyFeature: "STABILITY: Thickening is maximal at 6-12 months and then progressively decreases. Normal nodes.",
        associatedFindings: "Surgical scar.",
        complicationsSeriousAlternatives: "Radiation-induced sarcoma (late).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ORBITAL CALCIFICATION",
    itemNumber: "11.4",
    problemCluster: "orbital density",
    seriousAlternatives: ["Retinoblastoma (Child)", "Optic Nerve Sheath Meningioma", "Trochlear Calcification (Mimic)", "Phthisis Bulbi"],
    differentials: [
      {
        diagnosis: "Retinoblastoma",
        dominantImagingFinding: "Solid intra-ocular mass with CHUNKY, speck-like calcification (95%).",
        distributionLocation: "Within the globe (Retina).",
        demographicsClinicalContext: "Infants and young children (<3y). Leukocoria (White reflex).",
        discriminatingKeyFeature: "CHUNKY CALCIFICATION: Any intra-ocular mass with calcification in an infant is retinoblastoma until proven otherwise.",
        associatedFindings: "Bilateral in 30% (hereditary).",
        complicationsSeriousAlternatives: "Intracranial spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Optic Nerve Sheath Meningioma",
        dominantImagingFinding: "TRAM-TRACK calcification along the course of the optic nerve.",
        distributionLocation: "Optic nerve sheath. Retro-ocular.",
        demographicsClinicalContext: "Middle-aged females. Vision loss.",
        discriminatingKeyFeature: "TRAM-TRACK SIGN: High density sheath with non-calcified nerve in the center. External to the globe.",
        associatedFindings: "Orbital hyperostosis.",
        complicationsSeriousAlternatives: "Blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Phthisis Bulbi",
        dominantImagingFinding: "Small, shrunken, and massively calcified globe.",
        distributionLocation: "Entire globe.",
        demographicsClinicalContext: "History of severe trauma or endophthalmitis.",
        discriminatingKeyFeature: "SHRUNKEN GLOBE: The eye is small and non-functional. Calcification is usually a late stage of end-organ failure.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Trochlear Calcification (Mimic)",
        dominantImagingFinding: "Tiny, comma-shaped calcification in the superior-medial orbit.",
        distributionLocation: "Superior-medial orbit (Trochlear apparatus).",
        demographicsClinicalContext: "Asymptomatic incidental finding in adults.",
        discriminatingKeyFeature: "SPECIFIC LOCATION: Strictly superior-medial. No associated mass. Mistaken for a foreign body.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "EXPANSILE LESION OF THE MAXILLARY SINUS",
    itemNumber: "11.12",
    problemCluster: "maxillary expansion",
    seriousAlternatives: ["Mucocele", "Ameloblastoma", "Dentigerous Cyst", "Antrochoanal Polyp"],
    differentials: [
      {
        diagnosis: "Maxillary Mucocele",
        dominantImagingFinding: "Fluid-filled sinus with SMOOTH, thin-walled bony expansion. Lacks internal flow.",
        distributionLocation: "Entire maxillary sinus.",
        demographicsClinicalContext: "Chronic sinusitis or prior trauma. Facial pressure.",
        discriminatingKeyFeature: "SMOOTH EXPANSION: Unlike cancer, the bone is not destroyed but thinned and pushed. Does not enhance centrally.",
        associatedFindings: "Obliteration of the sinus ostium.",
        complicationsSeriousAlternatives: "Pyocoele (infection).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ameloblastoma",
        dominantImagingFinding: "Multilocular 'SOAP-BUBBLE' mass expanding the floor of the sinus. Root resorption.",
        distributionLocation: "Inferior maxillary wall (Alveolar ridge).",
        demographicsClinicalContext: "Adults (20-40y). Painless jaw expansion.",
        discriminatingKeyFeature: "SOAP-BUBBLE appearance and relation to teeth. Expands the mandible/maxilla aggressively.",
        associatedFindings: "Displaced teeth.",
        complicationsSeriousAlternatives: "Local recurrence.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Dentigerous Cyst",
        dominantImagingFinding: "Unilocular cyst containing the CROWN OF AN UNERUPTED TOOTH.",
        distributionLocation: "Alveolar ridge, usually 3rd molar.",
        demographicsClinicalContext: "Young adults.",
        discriminatingKeyFeature: "UNERUPTED TOOTH: Presence of a tooth crown within the cyst is pathognomonic.",
        associatedFindings: "Thin sclerotic margin.",
        complicationsSeriousAlternatives: "Ameloblastoma transformation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 13 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_13_DATA) {
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
  console.log("Batch 13 Complete!");
}

main().catch(console.error);