import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_28_DATA = [
  {
    pattern: "HILAR DISPLACEMENT",
    itemNumber: "4.25",
    problemCluster: "hilar position",
    seriousAlternatives: ["Volume Loss (Collapse)", "Fibrosis", "Mass Effect (Push)"],
    differentials: [
      {
        diagnosis: "Lobar Collapse (Atelectasis)",
        dominantImagingFinding: "Elevation (Upper lobe) or depression (Lower lobe) of the hilum. Sharp, opaque lobe.",
        distributionLocation: "Ipsilateral to the collapse.",
        demographicsClinicalContext: "Adults (Bronchogenic CA) or Child (Foreign body).",
        discriminatingKeyFeature: "MEDIASTINAL SHIFT: The hilum is PULLED towards the area of collapse. Associated with elevated diaphragm and crowded ribs.",
        associatedFindings: "Golden S sign if RUL.",
        complicationsSeriousAlternatives: "Post-obstructive pneumonia.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Upper Lobe Fibrosis (TB/Radiation)",
        dominantImagingFinding: "Chronic, smooth elevation of the hila. Reticular opacities and volume loss.",
        distributionLocation: "Bilateral (TB/Sarcoid) or Unilateral (Radiation).",
        demographicsClinicalContext: "History of prior TB or radiotherapy.",
        discriminatingKeyFeature: "CHRONICITY and FIBROSIS: Longstanding elevation with architectural distortion and traction bronchiectasis. No acute mass.",
        associatedFindings: "Apical capping.",
        complicationsSeriousAlternatives: "Reactivation of TB.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Large Mediastinal Mass (Pushing)",
        dominantImagingFinding: "Lateral or inferior displacement of the hilum by an adjacent large mass.",
        distributionLocation: "Hilar region focus.",
        demographicsClinicalContext: "Adults. Large aortic aneurysm or bulky lymphadenopathy.",
        discriminatingKeyFeature: "PUSH vs PULL: The hilum is displaced AWAY from the mass. Lacks the volume loss markers of collapse.",
        associatedFindings: "Tracheal deviation away from the mass.",
        complicationsSeriousAlternatives: "SVC syndrome.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "P ANCREATIC DUCTAL IRREGULARITY",
    itemNumber: "7.33",
    problemCluster: "irregular pancreatic duct",
    seriousAlternatives: ["Chronic Pancreatitis", "Pancreatic Adenocarcinoma", "IPMN"],
    differentials: [
      {
        diagnosis: "Chronic Pancreatitis (Chain-of-Lakes)",
        dominantImagingFinding: "Alternating segments of dilatation and narrowing ('BEADED' appearance). Intraductal calculi.",
        distributionLocation: "Diffuse main pancreatic duct involvement.",
        demographicsClinicalContext: "Chronic alcohol use. Recurrent abdominal pain and steatorrhoea.",
        discriminatingKeyFeature: "INTRADUCTAL STONES and beading. The duct is tortuous. Associated with parenchymal calcification.",
        associatedFindings: "Pseudocysts.",
        complicationsSeriousAlternatives: "Pancreatic failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pancreatic Adenocarcinoma",
        dominantImagingFinding: "Abrupt, high-grade CUT-OFF of the duct. Pre-stenotic dilatation.",
        distributionLocation: "Head of pancreas common.",
        demographicsClinicalContext: "Elderly. Painless jaundice. Weight loss.",
        discriminatingKeyFeature: "ABRUPT CUT-OFF and hypovascular solid mass. Double-duct sign (if head tumor). Lacks the diffuse beading of chronic pancreatitis.",
        associatedFindings: "Liver metastases.",
        complicationsSeriousAlternatives: "Vascular invasion.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "IPMN (Side-branch)",
        dominantImagingFinding: "Cluster of multiple cystic spaces that COMMUNICATE with the main duct.",
        distributionLocation: "Head (Uncinate process) common.",
        demographicsClinicalContext: "Older adults.",
        discriminatingKeyFeature: "DUCTAL COMMUNICATION on MRCP. Represents mucinous neoplasm within the side branches. Main duct may be normal.",
        associatedFindings: "Mucin globules.",
        complicationsSeriousAlternatives: "Malignancy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PLATYSPONDYLY",
    itemNumber: "2.16",
    problemCluster: "flat vertebrae",
    seriousAlternatives: ["Thanatophoric Dysplasia", "Morquio Syndrome", "Osteogenesis Imperfecta"],
    differentials: [
      {
        diagnosis: "Thanatophoric Dysplasia",
        dominantImagingFinding: "Severe wafer-like flattening of all vertebral bodies (Platyspondyly). Telephone-receiver femora.",
        distributionLocation: "Generalized spinal focus.",
        demographicsClinicalContext: "Neonates. Lethal skeletal dysplasia.",
        discriminatingKeyFeature: "WAFER-LIKE vertebrae and cloverleaf skull (Type II). Most severe form of platyspondyly in a neonate.",
        associatedFindings: "Narrow thorax.",
        complicationsSeriousAlternatives: "Early neonatal death.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Morquio Syndrome (MPS IV)",
        dominantImagingFinding: "Generalized platyspondyly with a CENTRAL ANTERIOR BEAKING of the vertebrae.",
        distributionLocation: "Thoracolumbar spine focus.",
        demographicsClinicalContext: "Children. Short stature and corneal clouding. Normal IQ.",
        discriminatingKeyFeature: "CENTRAL BEAK: Unlike Hurler (inferior beak), Morquio has a central anterior projection. Universal platyspondyly.",
        associatedFindings: "Odontoid hypoplasia.",
        complicationsSeriousAlternatives: "AA instability (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Osteogenesis Imperfecta (Severe)",
        dominantImagingFinding: "Multiple biconcave (Codfish) vertebrae and platyspondyly. Profound osteopenia.",
        distributionLocation: "Generalized.",
        demographicsClinicalContext: "Children. Blue sclerae and multiple fractures.",
        discriminatingKeyFeature: "OSTEOPENIA and multiplicity of fractures. Unlike Morquio, there is no specific anterior beak.",
        associatedFindings: "Wormian bones.",
        complicationsSeriousAlternatives: "Severe kyphoscoliosis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L UCENT BONE LESION IN THE MEDULLA",
    itemNumber: "1.13", // ILL-DEFINED MEDICULLARY
    problemCluster: "aggressive medullary lesion",
    seriousAlternatives: ["Osteomyelitis", "Ewing Sarcoma", "Fibrosarcoma", "Metastasis"],
    differentials: [
      {
        diagnosis: "Acute Osteomyelitis",
        dominantImagingFinding: "Moth-eaten or permeative medullary destruction. Rapidly progressive (<48h).",
        distributionLocation: "Metaphysis of long bones common.",
        demographicsClinicalContext: "Acute fever, high CRP, and localized pain. IVDU/Diabetic.",
        discriminatingKeyFeature: "RAPID CHANGE and SEQUESTRUM formation. Crosses the joint (unlike tumor). No tumor matrix.",
        associatedFindings: "Soft tissue swelling.",
        complicationsSeriousAlternatives: "Sepsis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ewing Sarcoma",
        dominantImagingFinding: "Permeative bone destruction with HUGE soft tissue mass and onion-skin reaction.",
        distributionLocation: "Diaphysis of long bones or pelvis.",
        demographicsClinicalContext: "Children (5-20y). Mimics infection clinically.",
        discriminatingKeyFeature: "ONION-SKIN reaction and HUGE soft tissue mass. No osteoid matrix (unlike osteosarcoma).",
        associatedFindings: "Extra-osseous components.",
        complicationsSeriousAlternatives: "Metastatic spread.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Primary Fibrosarcoma of Bone",
        dominantImagingFinding: "Highly aggressive lytic destruction with NO mineralization. 'Cold' matrix.",
        distributionLocation: "Metadiaphysis of long bones.",
        demographicsClinicalContext: "Adults (30-50y). Pain and mass.",
        discriminatingKeyFeature: "LACK OF MATRIX: Purely lytic destruction. Unlike osteosarcoma, it produces no bone or cartilage matrix.",
        associatedFindings: "Large soft tissue mass.",
        complicationsSeriousAlternatives: "Lung metastases.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "MRI IN BREAST DISEASE",
    itemNumber: "10.11",
    problemCluster: "breast MRI enhancement",
    seriousAlternatives: ["Invasive Carcinoma", "DCIS", "Benign (Fibroadenoma)", "Post-surgical Change"],
    differentials: [
      {
        diagnosis: "Malignant Enhancement (IDC)",
        dominantImagingFinding: "Irregular mass with 'WASH-OUT' kinetics (Type III curve). Heterogeneous internal enhancement.",
        distributionLocation: "Anywhere in the breast.",
        demographicsClinicalContext: "Adult females. Suspicious mammogram.",
        discriminatingKeyFeature: "WASH-OUT KINETICS: Rapid initial rise followed by rapid decline. High T2 signal if high grade.",
        associatedFindings: "Spiculation and skin thickening.",
        complicationsSeriousAlternatives: "Nodal metastases.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Ductal Carcinoma in Situ (DCIS)",
        dominantImagingFinding: "Non-mass enhancement (NME). Characteristically SEGMENTAL or LINEAR following a duct.",
        distributionLocation: "Ductal distribution.",
        demographicsClinicalContext: "Asymptomatic. Grouped microcalcifications on mammogram.",
        discriminatingKeyFeature: "SEGMENTAL distribution and clumped or 'cobblestone' enhancement pattern. No discrete mass.",
        associatedFindings: "Microcalcifications.",
        complicationsSeriousAlternatives: "Invasion.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Benign Enhancement (Fibroadenoma)",
        dominantImagingFinding: "Well-circumscribed mass with smooth lobulations. 'PERSISTENT' kinetics (Type I curve).",
        distributionLocation: "Anywhere.",
        demographicsClinicalContext: "Younger females.",
        discriminatingKeyFeature: "PERSISTENT curve and INTERNAL DARK SEPTATIONS (pathognomonic for FA on MRI). Wide margins.",
        associatedFindings: "Low T2 signal usually.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 28 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_28_DATA) {
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
  console.log("Batch 28 Complete!");
}

main().catch(console.error);