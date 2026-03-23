import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_22_DATA = [
  {
    pattern: "L UCENT BONE LESION IN THE",
    itemNumber: "1.16",
    problemCluster: "subarticular lucency",
    seriousAlternatives: ["Geode (Subchondral Cyst)", "Intraosseous Ganglion", "Giant Cell Tumor", "Chondroblastoma"],
    differentials: [
      {
        diagnosis: "Geode (Subchondral Cyst)",
        dominantImagingFinding: "Small, well-defined lucency immediately beneath the articular surface. Sclerotic margin.",
        distributionLocation: "Subchondral bone of weight-bearing joints (Hip, Knee, Shoulder).",
        demographicsClinicalContext: "Older adults with Osteoarthritis (OA) or Rheumatoid Arthritis (RA).",
        discriminatingKeyFeature: "ASSOCIATED ARTHRITIS: Look for joint space narrowing, subchondral sclerosis, and osteophytes. Pathognomonic for degenerative joint disease.",
        associatedFindings: "Joint space narrowing.",
        complicationsSeriousAlternatives: "Articular surface collapse.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Intraosseous Ganglion",
        dominantImagingFinding: "Well-defined lytic lesion with a thin sclerotic rim. Articular surface is INTACT.",
        distributionLocation: "Subarticular bone (often non-weight bearing surfaces).",
        demographicsClinicalContext: "Middle-aged adults. Asymptomatic or mild pain. Lacks associated OA.",
        discriminatingKeyFeature: "INTACT JOINT: Unlike geodes, ganglions occur in joints with NORMAL joint space and no sclerosis.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Giant Cell Tumor (GCT)",
        dominantImagingFinding: "Expansile lytic lesion extending directly to the SUBARTICULAR cortex. No sclerotic rim.",
        distributionLocation: "Epiphysis/Metaphysis of long bones (Distal Femur common).",
        demographicsClinicalContext: "Young adults (20-40y). Skeletally mature.",
        discriminatingKeyFeature: "LACK OF RIM and subarticular extension. GCTs are much larger and more aggressive than geodes/ganglions.",
        associatedFindings: "Cortical thinning.",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "M EDIASTINAL LYMPHADENOPATHY",
    itemNumber: "4.41",
    problemCluster: "mediastinal nodes",
    seriousAlternatives: ["Sarcoidosis", "Lymphoma", "Metastatic Adenopathy", "Primary TB"],
    differentials: [
      {
        diagnosis: "Sarcoidosis (Stage I)",
        dominantImagingFinding: "Strikingly SYMMETRICAL hilar and paratracheal adenopathy. GARLAND TRIAD (1-2-3 sign).",
        distributionLocation: "Right hilar, Left hilar, and Right paratracheal nodes.",
        demographicsClinicalContext: "Young adults (20-40y). Often asymptomatic. High serum ACE level.",
        discriminatingKeyFeature: "STRIKING SYMMETRY and presence of the RIGHT paratracheal node. Usually spares the anterior (pre-vascular) space.",
        associatedFindings: "Skin erythema nodosum and perilymphatic lung nodules.",
        complicationsSeriousAlternatives: "Pulmonary fibrosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Lymphoma",
        dominantImagingFinding: "ASYMMETRICAL bulky adenopathy. Involvement of the ANTERIOR MEDIASTINUM (Pre-vascular).",
        distributionLocation: "Multiple compartments. Characteristically wraps around vessels.",
        demographicsClinicalContext: "Young adults (Hodgkin) or older (NHL). B-symptoms (Fever, sweats).",
        discriminatingKeyFeature: "ANTERIOR MEDIASTINAL involvement and asymmetry. Sarcoid rarely involves the pre-vascular space.",
        associatedFindings: "Splenomegaly.",
        complicationsSeriousAlternatives: "SVC obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Metastatic Adenopathy",
        dominantImagingFinding: "Asymmetrical adenopathy with NECROTIC centers (low attenuation). Disparate growth.",
        distributionLocation: "Tracheobronchial and hilar nodes.",
        demographicsClinicalContext: "Older adults. Known primary (Lung, Breast, GI).",
        discriminatingKeyFeature: "NODAL NECROSIS and known primary CA. Necrosis is common in lung CA and TB nodes.",
        associatedFindings: "Primary lung mass.",
        complicationsSeriousAlternatives: "Bronchial obstruction.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "S OLITARY NODULE IN THE SMALL BOWEL",
    itemNumber: "6.19",
    problemCluster: "small bowel mass",
    seriousAlternatives: ["Carcinoid Tumor", "Gastrointestinal Stromal Tumor (GIST)", "Adenocarcinoma", "Metastasis (Melanoma)"],
    differentials: [
      {
        diagnosis: "Carcinoid Tumor",
        dominantImagingFinding: "Small submucosal nodule with an intense DESMOPLASTIC reaction in the mesentery. Calcification common (70%).",
        distributionLocation: "Distal ILEUM (most common site).",
        demographicsClinicalContext: "Adults. Carcinoid Syndrome (flushing, diarrhea) if liver metastases are present.",
        discriminatingKeyFeature: "MESENTERIC DESMOPLASIA: A spiculated mesenteric mass with radiating 'sunburst' bands is diagnostic.",
        associatedFindings: "Kinking of bowel loops and liver metastases.",
        complicationsSeriousAlternatives: "Bowel ischaemia.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "GIST (Gastrointestinal Stromal Tumor)",
        dominantImagingFinding: "Large, exophytic, HYPERVASCULAR mass. Often contains a central ulcer or cavity.",
        distributionLocation: "Stomach (most common) or Jejunum.",
        demographicsClinicalContext: "Older adults. Occult bleeding or large palpable mass.",
        discriminatingKeyFeature: "EXOPHYTIC growth and extreme enhancement. Lacks the mesenteric desmoplasia of carcinoid.",
        associatedFindings: "Central air/contrast within the mass (ulcer).",
        complicationsSeriousAlternatives: "Haemorrhage.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Small Bowel Metastasis (Melanoma)",
        dominantImagingFinding: "Submucosal 'TARGET' or 'BULL'S EYE' lesion. Intussusception common.",
        distributionLocation: "Variable.",
        demographicsClinicalContext: "Known primary melanoma.",
        discriminatingKeyFeature: "TARGET SIGN: Ulcerated nodule on barium or CT. Melanoma is the most common primary to metastasize to the small bowel.",
        associatedFindings: "Multiple lesions.",
        complicationsSeriousAlternatives: "Intussusception.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "GESTATIONAL TROPHOBLASTIC DISEASE",
    itemNumber: "13.14",
    problemCluster: "molar pregnancy",
    seriousAlternatives: ["Complete Hydatidiform Mole", "Partial Mole", "Choriocarcinoma"],
    differentials: [
      {
        diagnosis: "Complete Hydatidiform Mole",
        dominantImagingFinding: "Uterus filled with multiple tiny cysts ('SNOWSTORM' or 'BUNCH-OF-GRAPES'). NO fetal parts.",
        distributionLocation: "Endometrial cavity.",
        demographicsClinicalContext: "Extremely high b-hCG (>100,000). Hyperemesis. Large-for-dates uterus.",
        discriminatingKeyFeature: "SNOWSTORM appearance and ABSENCE of fetal parts or gestational sac. 46,XX (all paternal).",
        associatedFindings: "Bilateral THECA LUTEIN CYSTS (ovarian enlargement) in 25-50%.",
        complicationsSeriousAlternatives: "Invasive mole and choriocarcinoma.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Partial Hydatidiform Mole",
        dominantImagingFinding: "Thickened placenta with cystic spaces. FETAL PARTS or gestational sac are PRESENT.",
        distributionLocation: "Endometrial cavity.",
        demographicsClinicalContext: "Moderately high b-hCG. Triploid (69,XXX/XXY).",
        discriminatingKeyFeature: "PRESENCE OF FETAL PARTS: Unlike a complete mole, a partial mole has identifiable fetal tissues or a sac.",
        associatedFindings: "Small-for-dates gestational sac.",
        complicationsSeriousAlternatives: "Miscarriage.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Choriocarcinoma",
        dominantImagingFinding: "Highly vascular, infiltrative mass invading the myometrium. Profuse haemorrhage.",
        distributionLocation: "Uterus and Lungs (metastases).",
        demographicsClinicalContext: "Follows a molar pregnancy (50%) or normal delivery. Markedly elevated b-hCG.",
        discriminatingKeyFeature: "MYOMETRIAL INVASION and extreme vascularity. High propensity for 'Cannonball' LUNG metastases.",
        associatedFindings: "Haemorrhagic brain metastases.",
        complicationsSeriousAlternatives: "Metastatic death (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "C ALCIFICATION IN THE CHIASTIC REGION",
    itemNumber: "12.21",
    problemCluster: "suprasellar density",
    seriousAlternatives: ["Craniopharyngioma (90%)", "Suprasellar Meningioma", "Aneurysm (Wall)", "Optic Nerve Glioma (Rare)"],
    differentials: [
      {
        diagnosis: "Craniopharyngioma",
        dominantImagingFinding: "Complex cystic and solid mass. Coarse, chunky calcification in 90% of children.",
        distributionLocation: "Suprasellar space focus.",
        demographicsClinicalContext: "Children (<15y). Visual field loss and Diabetes Insipidus.",
        discriminatingKeyFeature: "CYSTIC components and chunky calcification. In a child, any suprasellar calcified mass is a craniopharyngioma until proven otherwise.",
        associatedFindings: "Machinery-oil cyst fluid.",
        complicationsSeriousAlternatives: "Hydrocephalus.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Suprasellar Meningioma",
        dominantImagingFinding: "Solid, intensely enhancing mass. Punctate or PSAMMOMATOUS calcification.",
        distributionLocation: "Planum sphenoidale or tuberculum sellae.",
        demographicsClinicalContext: "Adult females.",
        discriminatingKeyFeature: "DURAL TAIL and HYPEROSTOSIS of the planum. Calcification is usually fine and punctate (unlike the chunky calc of craniopharyngioma).",
        associatedFindings: "Normal sella size.",
        complicationsSeriousAlternatives: "Blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Calcified Aneurysm (ACom/ICA)",
        dominantImagingFinding: "CURVILINEAR, rim-like calcification. Lacks a solid soft tissue component.",
        distributionLocation: "Expected course of the circle of Willis.",
        demographicsClinicalContext: "Adults with vascular risk factors.",
        discriminatingKeyFeature: "CURVILINEAR pattern and internal flow on MRA/CTA. Calcification is strictly in the vessel wall.",
        associatedFindings: "SAH risk.",
        complicationsSeriousAlternatives: "Rupture (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 22 (Completing high-yields)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_22_DATA) {
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
  console.log("Batch 22 Complete!");
}

main().catch(console.error);