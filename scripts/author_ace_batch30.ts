import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_30_DATA = [
  {
    pattern: "OSTEOPOROSIS",
    itemNumber: "1.21",
    problemCluster: "generalized bone loss",
    seriousAlternatives: ["Post-menopausal", "Senile", "Steroid-induced", "Hyperparathyroidism"],
    differentials: [
      {
        diagnosis: "Post-menopausal Osteoporosis",
        dominantImagingFinding: "Thinning of the cortex and sparse, sharp trabeculae. Accentuation of primary weight-bearing trabeculae.",
        distributionLocation: "Generalized. Spine and Pelvis focus.",
        demographicsClinicalContext: "Females >50y. Low oestrogen levels.",
        discriminatingKeyFeature: "SHARP TRABECULAE and normal mineralization. Unlike osteomalacia, the bone is simply 'less' in quantity, but normal in quality.",
        associatedFindings: "Vertebral wedge fractures.",
        complicationsSeriousAlternatives: "Hip and Colles fractures.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Steroid-induced Osteoporosis",
        dominantImagingFinding: "Severe generalized osteopenia with redundant CALLUS formation around fractures.",
        distributionLocation: "Axial skeleton and ribs focus.",
        demographicsClinicalContext: "Patients on chronic high-dose corticosteroids (e.g. Asthma, RA).",
        discriminatingKeyFeature: "PUFFY CALLUS: Exuberant but poorly mineralized callus around insufficiency fractures (especially ribs).",
        associatedFindings: "AVN of the femoral head (Double-line sign).",
        complicationsSeriousAlternatives: "Multiple insufficiency fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "E NLARGED VERTEBRAL BODY",
    itemNumber: "2.6",
    problemCluster: "vertebral expansion",
    seriousAlternatives: ["Paget's Disease", "Haemangioma", "Acromegaly"],
    differentials: [
      {
        diagnosis: "Paget's Disease (Expansion)",
        dominantImagingFinding: "Increase in the overall dimensions of the vertebral body. Cortical thickening.",
        distributionLocation: "Any spinal level.",
        demographicsClinicalContext: "Elderly. High Alk Phos.",
        discriminatingKeyFeature: "TRUE EXPANSION: The bone is physically larger than adjacent levels. Associated with picture-frame appearance.",
        associatedFindings: "Ivory vertebra phase.",
        complicationsSeriousAlternatives: "Spinal stenosis.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Vertebral Haemangioma",
        dominantImagingFinding: "Prominent vertical striations ('Corduroy'). NO true bone enlargement.",
        distributionLocation: "Thoracolumbar spine.",
        demographicsClinicalContext: "Incidental in adults.",
        discriminatingKeyFeature: "LACK OF ENLARGEMENT: Unlike Paget's, the overall dimensions of the vertebra remain normal. Bright on T1/T2.",
        associatedFindings: "Polka-dot sign on CT.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "W IDENED INTERPEDICULAR DISTANCE",
    itemNumber: "2.12",
    problemCluster: "spinal canal widening",
    seriousAlternatives: ["Intradural Mass (Tumor)", "Dural Ectasia (NF1)", "Syringomyelia", "Diastematomyelia"],
    differentials: [
      {
        diagnosis: "Intradural Tumor (e.g. Ependymoma)",
        dominantImagingFinding: "Focal widening of the interpedicular distance. Thinning or flattening of the pedicles.",
        distributionLocation: "Localized to the level of the mass.",
        demographicsClinicalContext: "Adults with progressive neurological signs.",
        discriminatingKeyFeature: "FOCAL WIDENING and associated solid enhancing mass on MRI. Pedicles are 'scalloped' from the inside.",
        associatedFindings: "Posterior vertebral scalloping.",
        complicationsSeriousAlternatives: "Paraplegia.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Dural Ectasia (NF1 / Marfan)",
        dominantImagingFinding: "Diffuse multilevel widening of the interpedicular distance. Associated scalloping.",
        distributionLocation: "Lumbar and Sacral spine predominates.",
        demographicsClinicalContext: "NF1 (café-au-lait) or Marfan syndrome (tall/limber).",
        discriminatingKeyFeature: "MULTILEVEL involvement and lack of a solid mass. MRI shows an expanded CSF sac.",
        associatedFindings: "Lateral meningocoeles.",
        complicationsSeriousAlternatives: "Chronic back pain.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Syringomyelia",
        dominantImagingFinding: "Widening of the cervical or thoracic canal. Central spinal cord cavity.",
        distributionLocation: "Cervical and Upper Thoracic spine focus.",
        demographicsClinicalContext: "Associated with Chiari I malformation. Suspended sensory loss.",
        discriminatingKeyFeature: "CORD CAVITY: MRI shows a central fluid-filled syrinx. Canal widening occurs if the syrinx is long-standing.",
        associatedFindings: "Chiari I malformation.",
        complicationsSeriousAlternatives: "Neurological deficit.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ARTHRITIS WITH OSTEOPOROSIS",
    itemNumber: "3.3",
    problemCluster: "lucent arthritis",
    seriousAlternatives: ["Rheumatoid Arthritis", "Juvenile Idiopathic Arthritis", "Septic Arthritis", "TB Arthritis"],
    differentials: [
      {
        diagnosis: "Rheumatoid Arthritis (RA)",
        dominantImagingFinding: "Symmetric marginal erosions and PROFOUND juxta-articular osteoporosis.",
        distributionLocation: "MCP, PIP, and Carpal joints. Symmetrical.",
        demographicsClinicalContext: "Middle-aged females. Positive RF.",
        discriminatingKeyFeature: "SYMMETRY and OSTEOPOROSIS. RA is the hallmark of 'lucent' destructive arthritis. Lacks bone proliferation.",
        associatedFindings: "Joint subluxations.",
        complicationsSeriousAlternatives: "Atlanto-axial subluxation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Septic Arthritis",
        dominantImagingFinding: "Rapid joint space narrowing and juxta-articular osteoporosis. Focal erosions.",
        distributionLocation: "Monarticular common.",
        demographicsClinicalContext: "Acute fever and joint pain.",
        discriminatingKeyFeature: "RAPID DESTRUCTION: Cartilage loss occurs over days. Unlike RA, it is typically monarticular and acute.",
        associatedFindings: "Soft tissue swelling.",
        complicationsSeriousAlternatives: "Bone destruction (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      }
    ]
  },
  {
    pattern: "ARTHRITIS WITH PRESERVATION OF BONE DENSITY",
    itemNumber: "3.4",
    problemCluster: "sclerotic arthritis",
    seriousAlternatives: ["Osteoarthritis", "Psoriatic Arthritis", "Gout", "CPPD", "Reactive Arthritis"],
    differentials: [
      {
        diagnosis: "Osteoarthritis (OA)",
        dominantImagingFinding: "Joint space narrowing, subchondral SCLEROSIS, and OSTEOPHYTES. Normal bone density.",
        distributionLocation: "DIPs, PIPs, 1st CMC, and weight-bearing joints.",
        demographicsClinicalContext: "Elderly. Mechanical pain.",
        discriminatingKeyFeature: "SCLEROSIS and OSTEOPHYTES. Bone density is characteristically preserved or increased at the joint margins.",
        associatedFindings: "Subchondral cysts.",
        complicationsSeriousAlternatives: "Loss of function.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Psoriatic Arthritis (Bone Density)",
        dominantImagingFinding: "Marginal erosions with significant BONE PROLIFERATION. Normal bone density.",
        distributionLocation: "DIP joints common.",
        demographicsClinicalContext: "Skin psoriasis history.",
        discriminatingKeyFeature: "BONE PROLIFERATION: Fluffy periostitis and lack of osteoporosis despite severe erosions. 'Mouse-ear' signs.",
        associatedFindings: "Sacroiliitis.",
        complicationsSeriousAlternatives: "Arthritis mutilans.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Gouty Arthritis",
        dominantImagingFinding: "Sharply marginated 'PUNCHED-OUT' erosions with OVERHANGING EDGES. Normal bone density.",
        distributionLocation: "1st MTP joint common (Podagra).",
        demographicsClinicalContext: "Middle-aged males. High uric acid.",
        discriminatingKeyFeature: "OVERHANGING EDGES and preservation of bone density until very late. Tophi may be visible.",
        associatedFindings: "Eccentric soft tissue masses.",
        complicationsSeriousAlternatives: "Joint deformity.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "PROTRUSIO ACETABULI",
    itemNumber: "3.13",
    problemCluster: "medial hip displacement",
    seriousAlternatives: ["Rheumatoid Arthritis", "Paget's Disease", "Osteomalacia", "Ankylosing Spondylitis", "Idiopathic (Otto Pelvis)"],
    differentials: [
      {
        diagnosis: "Rheumatoid Arthritis (Protrusio)",
        dominantImagingFinding: "Bilateral medial displacement of the femoral heads. Symmetric joint narrowing.",
        distributionLocation: "Bilateral hips.",
        demographicsClinicalContext: "Adults with chronic RA. Severe hip pain.",
        discriminatingKeyFeature: "JOINT NARROWING and OSTEOPOROSIS. Associated with symmetric erosions elsewhere. Most common secondary cause.",
        associatedFindings: "Acetabular erosions.",
        complicationsSeriousAlternatives: "Limited mobility.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paget's Disease (Protrusio)",
        dominantImagingFinding: "Protrusio acetabuli associated with BONE ENLARGEMENT and cortical thickening of the pelvis.",
        distributionLocation: "Asymmetric or bilateral pelvis.",
        demographicsClinicalContext: "Elderly.",
        discriminatingKeyFeature: "BONE EXPANSION: Unlike RA, the pelvic bones are thickened and larger. Associated with high Alk Phos.",
        associatedFindings: "Picture-frame vertebrae.",
        complicationsSeriousAlternatives: "Pathological fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Osteomalacia",
        dominantImagingFinding: "Protrusio acetabuli associated with a 'TRIRADIATE' pelvic configuration. Poorly mineralized bone.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Vitamin D deficiency. Bowed legs.",
        discriminatingKeyFeature: "TRIRADIATE PELVIS: Softening of the pelvic bones leads to an inward collapse. Associated with Looser's zones.",
        associatedFindings: "Pseudofractures.",
        complicationsSeriousAlternatives: "Fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "WIDENING OF THE SYMPHYSIS PUBIS",
    itemNumber: "3.16",
    problemCluster: "pelvic widening",
    seriousAlternatives: ["Trauma (Diastasis)", "Pregnancy (Physiological)", "Hyperparathyroidism", "Cleidocranial Dysostosis", "Extrophy of Bladder"],
    differentials: [
      {
        diagnosis: "Traumatic Diastasis (Open Book)",
        dominantImagingFinding: "Massive widening (>2.5cm) of the pubic symphysis. Associated with SI joint injury.",
        distributionLocation: "Anterior pelvic ring.",
        demographicsClinicalContext: "High-energy trauma (MVA). Sudden onset.",
        discriminatingKeyFeature: "HISTORY and severity (>2.5cm). Associated with large retroperitoneal haematoma.",
        associatedFindings: "SI joint widening.",
        complicationsSeriousAlternatives: "Life-threatening haemorrhage (URGENT).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hyperparathyroidism (Erosions)",
        dominantImagingFinding: "Apparent widening due to subchondral bone resorption. NO history of trauma.",
        distributionLocation: "Bilateral and symmetric.",
        demographicsClinicalContext: "Renal failure patients.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION: Look for the pathognomonic signs in the hands. Lacks the acute history of trauma.",
        associatedFindings: "Brown tumors.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Cleidocranial Dysostosis",
        dominantImagingFinding: "Widely open pubic symphysis in a patient with ABSENT CLAVICLES.",
        distributionLocation: "Generalized skeleton. Pelvis and Clavicles.",
        demographicsClinicalContext: "Children with short stature. Wormian bones.",
        discriminatingKeyFeature: "ABSENT CLAVICLES: 100% specific association. Delayed ossification of the pelvic bones.",
        associatedFindings: "Multiple Wormian bones.",
        complicationsSeriousAlternatives: "Dental anomalies.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 30 (20 items - PART 1)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_30_DATA) {
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
  console.log("Part 1 complete!");
}

main().catch(console.error);