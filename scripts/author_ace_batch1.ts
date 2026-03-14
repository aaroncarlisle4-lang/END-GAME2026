import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const ACE_UPDATES = [
  {
    pattern: "G ENERALIZED INCREASED BONE DENSITY",
    problemCluster: "generalized sclerosis",
    differentials: [
      { 
        diagnosis: "Renal Osteodystrophy", 
        dominantImagingFinding: "RUGGER-JERSEY SPINE (100% classic). Endplate sclerosis with central lucency.", 
        distributionLocation: "Axial skeleton and long bone metaphyses.", 
        demographicsClinicalContext: "Chronic renal failure. High PTH, low Calcium.", 
        discriminatingKeyFeature: "Subperiosteal resorption (radial side of middle phalanges) + Rugger-Jersey spine.", 
        associatedFindings: "Brown tumors. Vascular calcification.", 
        complicationsSeriousAlternatives: "Pathological fractures.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Osteopetrosis", 
        dominantImagingFinding: "Extreme uniform sclerosis ('Marble bone'). BONE-IN-BONE (90%) and SANDWICH vertebrae.", 
        distributionLocation: "Diffuse entire skeleton. Skull base thickening (100%).", 
        demographicsClinicalContext: "AR (Infantile) or AD (Adult). Asymptomatic or severe failure to thrive.", 
        discriminatingKeyFeature: "BONE-IN-BONE (Endobone) appearance and complete loss of medullary space.", 
        associatedFindings: "Erlenmeyer flask deformity of distal femora.", 
        complicationsSeriousAlternatives: "Pancytopenia (marrow failure).", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Myelofibrosis", 
        dominantImagingFinding: "Diffuse ground-glass osteosclerosis. Bone is dense but trabeculae are blurred.", 
        distributionLocation: "Axial skeleton and proximal long bones.", 
        demographicsClinicalContext: "Adults (>50y). Massive SPLENOMEGALY (100%). Dry marrow tap.", 
        discriminatingKeyFeature: "MASSIVE SPLENOMEGALY and diffuse axial sclerosis without bone expansion.", 
        associatedFindings: "Extramedullary haematopoiesis (paraspinal masses).", 
        complicationsSeriousAlternatives: "Leukaemic transformation.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Fluorosis", 
        dominantImagingFinding: "Dense osteosclerosis with extensive calcification of ligaments/interosseous membranes.", 
        distributionLocation: "Axial skeleton (Spine, Pelvis). Spares the skull usually.", 
        demographicsClinicalContext: "Chronic high fluoride ingestion (well water, industry).", 
        discriminatingKeyFeature: "LIGAMENTOUS CALCIFICATION (sacrotuberous/sacrospinous) accompanying dense bones.", 
        associatedFindings: "Osteophytes and enthesophytes.", 
        complicationsSeriousAlternatives: "Severe joint stiffness.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "SOLITARY SCLEROTIC BONE LESION",
    problemCluster: "solitary sclerosis",
    differentials: [
      { 
        diagnosis: "Bone Island (Enostosis)", 
        dominantImagingFinding: "Homogeneous, very dense (cortical-like) sclerotic nodule. Brush-like 'thorny' margins (100%).", 
        distributionLocation: "Epiphysis or metaphysis. Common in pelvis and proximal femur.", 
        demographicsClinicalContext: "Any age. Completely asymptomatic (incidental finding).", 
        discriminatingKeyFeature: "THORNY MARGINS that blend with trabeculae. Cold or minimally warm on bone scan.", 
        associatedFindings: "Normal surrounding bone.", 
        complicationsSeriousAlternatives: "None (benign).", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Osteoid Osteoma", 
        dominantImagingFinding: "Intense solid reactive sclerosis surrounding a small (<1.5cm) radiolucent NIDUS.", 
        distributionLocation: "Cortical (diaphysis) of long bones (femur, tibia).", 
        demographicsClinicalContext: "Young adults (10-25y). Nocturnal pain dramatically relieved by Aspirin/NSAIDs (90%).", 
        discriminatingKeyFeature: "CENTRAL LUCENT NIDUS (often with a tiny calcified dot) and massive surrounding reactive bone.", 
        associatedFindings: "Intense focal uptake on bone scan (double density sign).", 
        complicationsSeriousAlternatives: "Bone deformity or growth disturbance.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Sclerotic Metastasis", 
        dominantImagingFinding: "Focal, ill-defined nodular sclerosis. Destroys normal trabecular architecture.", 
        distributionLocation: "Axial skeleton (Spine, Pelvis) and proximal appendicular skeleton.", 
        demographicsClinicalContext: "Older adult (>50y). Known primary: PROSTATE (males) or BREAST (females).", 
        discriminatingKeyFeature: "KNOWN PRIMARY CANCER and hot bone scan. Often multiple, but can present solitary.", 
        associatedFindings: "Elevated PSA or Alk Phos.", 
        complicationsSeriousAlternatives: "Pathological fracture or cord compression.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Healed Fibrous Defect", 
        dominantImagingFinding: "Sclerotic focus replacing a previously lucent Non-Ossifying Fibroma (NOF).", 
        distributionLocation: "Diaphysis of long bones (migrated from metaphysis as child grew).", 
        demographicsClinicalContext: "Adults. History of prior x-rays showing a lucent defect.", 
        discriminatingKeyFeature: "SCLEROSIS FILLING IN a previously characteristic scalloped cortical defect.", 
        associatedFindings: "Often somewhat elongated parallel to the bone shaft.", 
        complicationsSeriousAlternatives: "None.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "UNILATERAL HYPERTRANSRADIANT HEMITHORAX",
    problemCluster: "unilateral hyperlucency",
    differentials: [
      { 
        diagnosis: "Swyer-James (Macleod) Syndrome", 
        dominantImagingFinding: "SMALL LUNG (100%) showing hyperlucency. Small hilum and attenuated pulmonary vessels.", 
        distributionLocation: "Unilateral lung or lobe. Contralateral lung is normal or hyperinflated.", 
        demographicsClinicalContext: "History of severe childhood viral pneumonia (Adenovirus) or bronchiolitis obliterans.", 
        discriminatingKeyFeature: "AIR TRAPPING on expiratory films (100%) and a characteristic SMALL HILUM on the lucent side.", 
        associatedFindings: "Bronchiectasis on HRCT (60-80%).", 
        complicationsSeriousAlternatives: "Recurrent pulmonary infections.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Pneumothorax", 
        dominantImagingFinding: "VISCERAL PLEURAL LINE visible. Absolute absence of lung markings peripherally.", 
        distributionLocation: "Apical (erect) or lateral sulcus (supine).", 
        demographicsClinicalContext: "Acute onset pleuritic pain and dyspnoea. Trauma or spontaneous.", 
        discriminatingKeyFeature: "VISIBLE PLEURAL LINE and peripheral lucency devoid of vessels.", 
        associatedFindings: "Mediastinal shift if tension.", 
        complicationsSeriousAlternatives: "Tension pneumothorax (Emergency).", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Mastectomy", 
        dominantImagingFinding: "Unilateral hyperlucency. Loss of soft tissue density.", 
        distributionLocation: "Hemithorax. Uniform lucency across the field.", 
        demographicsClinicalContext: "History of breast cancer surgery.", 
        discriminatingKeyFeature: "ABSENT AXILLARY FOLD and loss of the inferior breast contour. Normal lung markings.", 
        associatedFindings: "Surgical clips in the axilla.", 
        complicationsSeriousAlternatives: "Chest wall recurrence.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Endobronchial Obstruction (Foreign Body/Tumor)", 
        dominantImagingFinding: "Hyperlucency due to air-trapping (Check-valve). Normal lung volume on inspiration.", 
        distributionLocation: "Lobar or whole lung depending on obstruction site.", 
        demographicsClinicalContext: "Child (choking history) or Adult (smoker with SCC/Carcinoid).", 
        discriminatingKeyFeature: "EXPIRATORY MEDIASTINAL SHIFT away from the lucent side.", 
        associatedFindings: "Visible endobronchial lesion on CT.", 
        complicationsSeriousAlternatives: "Total collapse/atelectasis.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "GROSS CARDIOMEGALY ON CHEST X-RAY",
    problemCluster: "cardiomegaly",
    differentials: [
      { 
        diagnosis: "Pericardial Effusion", 
        dominantImagingFinding: "WATER-BOTTLE HEART or flask-shaped cardiac silhouette (100% classic for large, chronic effusion).", 
        distributionLocation: "Global, symmetrical enlargement of the cardiac shadow. Sharp margins.", 
        demographicsClinicalContext: "History of uraemia, malignancy, hypothyroidism, or recent viral illness.", 
        discriminatingKeyFeature: "RAPID CHANGE in heart size on serial films and absence of specific chamber enlargement (e.g. no left atrial appendage bulge).", 
        associatedFindings: "Epicardial fat pad sign (separation of epicardial and pericardial fat stripes >2mm).", 
        complicationsSeriousAlternatives: "Cardiac Tamponade (clinical emergency).", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Dilated Cardiomyopathy", 
        dominantImagingFinding: "Globular enlargement of the heart involving all chambers. Often biventricular.", 
        distributionLocation: "Global enlargement, but left ventricular contour is often prominent (apex points down/left).", 
        demographicsClinicalContext: "Progressive heart failure, fatigue, orthopnoea. Ischaemic (post-MI) or idiopathic.", 
        discriminatingKeyFeature: "PULMONARY OEDEMA (venous congestion, Kerley B lines, pleural effusions) accompanies the enlarged heart.", 
        associatedFindings: "Cephalisation of pulmonary vessels.", 
        complicationsSeriousAlternatives: "Congestive heart failure and sudden cardiac death.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Ebstein Anomaly", 
        dominantImagingFinding: "MASSIVE enlargement of the right atrium causing a 'box-shaped' heart.", 
        distributionLocation: "Right-sided enlargement (bulging right heart border).", 
        demographicsClinicalContext: "Cyanotic congenital heart disease. Often presents in infancy, but mild forms survive to adulthood.", 
        discriminatingKeyFeature: "DECREASED pulmonary vascularity (oligemia) combined with massive cardiomegaly (classic for Ebstein).", 
        associatedFindings: "Apical displacement of the tricuspid valve on echo.", 
        complicationsSeriousAlternatives: "Right heart failure and arrhythmias.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Severe Valvular Disease (e.g., Aortic/Mitral Regurgitation)", 
        dominantImagingFinding: "Specific chamber enlargement (e.g., massive Left Ventricle in AR, or massive Left Atrium in MR).", 
        distributionLocation: "Left-sided predominance.", 
        demographicsClinicalContext: "History of rheumatic fever or endocarditis. Murmur on auscultation.", 
        discriminatingKeyFeature: "SPECIFIC CHAMBER ENLARGEMENT (e.g. double density sign for LA, downward extending apex for LV) rather than global 'water-bottle' shape.", 
        associatedFindings: "Valvular calcification.", 
        complicationsSeriousAlternatives: "Irreversible ventricular failure.", 
        isCorrectDiagnosis: false 
      }
    ]
  }
];

async function main() {
  console.log("Seeding ACE Differentials (Chapman) Batch 1...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of ACE_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    // Add sortOrder to ensure consistent display
    const differentialsWithSort = update.differentials.map((d, idx) => ({
      ...d,
      sortOrder: idx
    }));
    
    if (matches.length > 0) {
      console.log(`Updating ${update.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    } else {
      console.log(`Creating ${update.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    }
  }
  console.log("ACE Batch 1 complete!");
}

main().catch(console.error);