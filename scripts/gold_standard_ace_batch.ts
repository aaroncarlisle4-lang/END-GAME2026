import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const GOLD_STANDARD_UPDATES = [
  {
    pattern: "COARSE TRABECULAR PATTERN",
    itemNumber: "1.7",
    problemCluster: "abnormal bone trabeculation",
    seriousAlternatives: ["Osteosarcomatous transformation (Paget's)", "Bone Infarct / Crisis (Sickle)", "Vertebral collapse (Haemangioma)"],
    differentials: [
      {
        diagnosis: "Paget's Disease (Osteitis Deformans)",
        dominantImagingFinding: "Cortical thickening (up to 2-3x normal) with profound trabecular coarsening and disorganization. V-shaped radiolucent leading edge in long bones (Blade of Grass / Flame sign) during active lytic phase.",
        distributionLocation: "Asymmetric and polyostotic (65-90%). Pelvis (70%), Skull (40%), Spine (Picture-frame vertebrae), Femur. Almost always involves the epiphysis if in a long bone.",
        demographicsClinicalContext: "Patients >55 years old (prevalence increases with age, up to 10% in >80y). Usually of European descent. Often asymptomatic. Markedly elevated serum Alkaline Phosphatase with normal Calcium/Phosphate.",
        discriminatingKeyFeature: "BONE ENLARGEMENT (expansion of the bone contour) coupled with thickened trabeculae. Osteoporosis/Haemangioma do NOT expand the bone (unless extremely aggressive).",
        associatedFindings: "Cotton-wool skull (sclerotic phase), osteoporosis circumscripta (lytic phase). Secondary osteoarthritis of adjacent joints (e.g., hip joint space narrowing). Bowing deformities (Shepherd's crook femur).",
        complicationsSeriousAlternatives: "Malignant transformation to Osteosarcoma (<1%, suggested by cortical destruction and soft tissue mass). High-output cardiac failure if widespread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Thalassaemia Major",
        dominantImagingFinding: "Extreme marrow hyperplasia leading to profound diffuse osteopenia, thinned cortices, and sparse but thickened remaining secondary trabeculae. 'Hair-on-end' spiculated periosteal reaction in the skull vault.",
        distributionLocation: "Diffuse marrow-containing skeleton. Skull, facial bones, ribs, and metacarpals (especially in children).",
        demographicsClinicalContext: "Mediterranean, Middle Eastern, or Asian descent. Presents in early childhood with severe haemolytic anaemia requiring chronic transfusions.",
        discriminatingKeyFeature: "RODENT FACIES (massive expansion of the maxillary antra obliterating the sinuses) and HAIR-ON-END skull. Does not typically cause focal long-bone enlargement like Paget's.",
        associatedFindings: "Extramedullary haematopoiesis (paravertebral soft tissue masses). Haemosiderosis (very dark liver/spleen on T2 MRI due to iron overload).",
        complicationsSeriousAlternatives: "Heart failure and endocrine dysfunction secondary to iron overload (haemochromatosis).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Vertebral Haemangioma",
        dominantImagingFinding: "Prominent vertical striations ('Corduroy cloth' or 'Jailhouse' striations) on plain radiograph/sagittal CT. On axial CT, appears as a 'Polka-dot' pattern representing thickened primary trabeculae surrounded by fat.",
        distributionLocation: "Spine (Thoracic > Lumbar). Usually involves the vertebral body, occasionally extending to the pedicles.",
        demographicsClinicalContext: "Extremely common incidental finding in adults (10-12% of the population). Completely asymptomatic in 99% of cases.",
        discriminatingKeyFeature: "POLKA-DOT SIGN on axial CT. On MRI, the lesion is BRIGHT on T1 and BRIGHT on T2 (due to fat and slow-flowing blood). Does NOT expand the vertebral body outline.",
        associatedFindings: "Usually isolated without adjacent soft tissue mass or cortical destruction.",
        complicationsSeriousAlternatives: "Aggressive haemangioma (rare) can cause extra-osseous soft tissue extension and spinal cord compression (neurological deficit).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Gaucher Disease",
        dominantImagingFinding: "Diffuse patchy osteopenia with a 'honeycomb' or severely coarse trabecular pattern. Areas of medullary infarction resulting in serpiginous sclerosis.",
        distributionLocation: "Distal femora, proximal tibiae, humeri, and axial skeleton. Tends to be bilateral and symmetric.",
        demographicsClinicalContext: "Ashkenazi Jewish descent (Type 1 is most common). Deficiency of glucocerebrosidase leading to lipid-laden macrophage accumulation. Splenomegaly.",
        discriminatingKeyFeature: "ERLENMEYER FLASK DEFORMITY (failure of normal diaphyseal modeling/constriction of the distal femur) combined with massive organomegaly.",
        associatedFindings: "H-shaped vertebrae (central endplate depression from micro-infarcts, identical to Sickle Cell). Diffuse low T1/T2 marrow signal on MRI.",
        complicationsSeriousAlternatives: "Severe avascular necrosis (AVN) of the femoral heads and debilitating bone crises.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "S OLITARY COLLAPSED VERTEBRA",
    itemNumber: "2.2",
    problemCluster: "vertebra plana",
    seriousAlternatives: ["Metastatic Cord Compression", "Tuberculous Spondylitis (Pott's)", "Multiple Myeloma"],
    differentials: [
      {
        diagnosis: "Metastasis",
        dominantImagingFinding: "Vertebral body collapse with ill-defined, moth-eaten or permeative bone destruction. Cortical breakthrough and associated epidural soft tissue mass.",
        distributionLocation: "Thoracic > Lumbar spine. Often involves the POSTERIOR ELEMENTS (pedicles) first due to high red marrow content.",
        demographicsClinicalContext: "Older adults (>50y). Known primary cancer (Breast, Lung, Prostate, Renal, Thyroid). Severe, unremitting back pain.",
        discriminatingKeyFeature: "PEDICLE DESTRUCTION ('Winking Owl' sign on AP radiograph) and presence of a paraspinal/epidural soft tissue mass on MRI.",
        associatedFindings: "Convex posterior vertebral body border bulging into the spinal canal. Marrow replacement (Low T1, High T2/STIR).",
        complicationsSeriousAlternatives: "Acute spinal cord compression requiring urgent neurosurgical decompression or radiotherapy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Osteoporotic Compression Fracture",
        dominantImagingFinding: "Wedge-shaped anterior collapse or central endplate depression. The trabecular pattern is sparse but without focal destructive lysis. Preserved cortical outlines.",
        distributionLocation: "Thoracolumbar junction (T11-L2). Typically multiple, but can present as a solitary acute collapse.",
        demographicsClinicalContext: "Post-menopausal females or patients on chronic corticosteroids. Pain often relates to an acute minor trauma (e.g., coughing, lifting).",
        discriminatingKeyFeature: "RETROPULSED BONE FRAGMENT (often seen at the posterior superior corner) with a CONCAVE or straight posterior vertebral margin. NO epidural mass.",
        associatedFindings: "Diffuse severe osteopenia. 'Fluid sign' on MRI (linear T2 hyperintensity representing acute fracture oedema). Normal pedicles.",
        complicationsSeriousAlternatives: "Progressive kyphotic deformity (Dowager's hump). Does not typically cause cord compression unless severe retropulsion occurs.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Eosinophilic Granuloma (LCH)",
        dominantImagingFinding: "VERTEBRA PLANA: Symmetrical, uniform flattening of the entire vertebral body ('Pancake vertebra'). The bone is compressed to a thin dense disc.",
        distributionLocation: "Thoracic or Lumbar spine. Almost exclusively a solitary lesion in the spine.",
        demographicsClinicalContext: "Children and young adolescents (peak age 5-10y). Localised back pain without systemic illness.",
        discriminatingKeyFeature: "EXTREME SYMMETRIC FLATTENING with completely PRESERVED INTERVERTEBRAL DISC SPACES above and below the lesion. No associated soft tissue abscess.",
        associatedFindings: "May reconstitute height partially over months/years ('bone-within-bone' appearance during healing phase).",
        complicationsSeriousAlternatives: "Spinal instability. Must evaluate for systemic Langerhans Cell Histiocytosis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Infectious Spondylodiscitis",
        dominantImagingFinding: "Destruction of the vertebral endplates with loss of vertebral height and severe destruction of the adjacent intervertebral disc.",
        distributionLocation: "Lumbar > Thoracic spine. Characteristically crosses the disc space to involve two adjacent vertebral bodies.",
        demographicsClinicalContext: "Fever, elevated CRP/ESR, and exquisite focal spinal tenderness. IVDU, diabetic, or post-procedural.",
        discriminatingKeyFeature: "DISC SPACE DESTRUCTION. Tumours almost always spare the avascular disc space; infections rapidly destroy it.",
        associatedFindings: "Paraspinal or epidural fluid collections with RIM ENHANCEMENT. Psoas muscle abscesses (especially in TB/Pott's disease).",
        complicationsSeriousAlternatives: "Epidural abscess causing irreversible ischaemic cord injury.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "M ONOARTHRITIS",
    itemNumber: "3.1",
    problemCluster: "single joint disease",
    seriousAlternatives: ["Septic Arthritis (Surgical Emergency)", "Tuberculous Arthritis"],
    differentials: [
      {
        diagnosis: "Septic Arthritis",
        dominantImagingFinding: "Rapid joint space narrowing (cartilage destruction), aggressive subchondral bone erosions without sclerotic margins, and massive joint effusion.",
        distributionLocation: "Large weight-bearing joints (Knee, Hip) or joints with prior intervention/trauma. Unilateral.",
        demographicsClinicalContext: "Acute onset (hours/days). Exquisitely painful, hot, swollen joint. Fever, high WBC, high CRP. Pain on micromovement.",
        discriminatingKeyFeature: "RAPID DESTRUCTION of cartilage and bone over days. Contrast MRI shows intense thick synovial enhancement and joint effusion.",
        associatedFindings: "Soft tissue oedema and blurring of adjacent fat planes. May lead to secondary osteomyelitis.",
        complicationsSeriousAlternatives: "Irreversible joint destruction within 48 hours and systemic sepsis. Requires urgent washout.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Tuberculous Arthritis",
        dominantImagingFinding: "Phemister Triad: 1) Slow progressive joint space narrowing, 2) Juxta-articular osteoporosis, 3) Peripheral osseous erosions. Lacks profound sclerosis.",
        distributionLocation: "Weight-bearing joints (Hip, Knee) and Spine (Pott's disease). Monarticular.",
        demographicsClinicalContext: "Insidious onset over months. Low-grade fever, night sweats. Often immunocompromised or endemic exposure.",
        discriminatingKeyFeature: "PRESERVATION OF JOINT SPACE until late in the disease process (unlike pyogenic septic arthritis which destroys it rapidly).",
        associatedFindings: "Large 'cold' soft-tissue abscesses with calcifications. Minimal reactive sclerosis.",
        complicationsSeriousAlternatives: "Fibrous ankylosis of the joint leading to permanent severe stiffness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Gouty Arthritis",
        dominantImagingFinding: "Sharply marginated, 'punched-out' juxta-articular erosions with OVERHANGING EDGES (Martel sign). PRESERVED joint space until late.",
        distributionLocation: "1st Metatarsophalangeal (MTP) joint (Podagra) is classic. Also ankle, knee, elbow.",
        demographicsClinicalContext: "Middle-aged males. High serum uric acid. Sudden severe pain attacks, often resolving entirely between flares.",
        discriminatingKeyFeature: "OVERHANGING EDGES of erosions with dense, eccentric soft-tissue masses (Tophi) that may show amorphous calcification.",
        associatedFindings: "Absence of periarticular osteoporosis (bone density is normal). Double-contour sign on ultrasound.",
        complicationsSeriousAlternatives: "Joint deformity and chronic tophaceous gout.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Pigmented Villonodular Synovitis (PVNS)",
        dominantImagingFinding: "Well-defined, non-calcified periarticular erosions on both sides of the joint. PRESERVED joint space. Nodular synovial thickening.",
        distributionLocation: "Knee (80%). Almost exclusively monarticular.",
        demographicsClinicalContext: "Young adults (20-40y). Chronic, recurrent joint swelling, stiffness, and bloody joint aspiration.",
        discriminatingKeyFeature: "BLOOMING ARTIFACT on MRI (Gradient Echo/SWI) due to massive haemosiderin deposition in the hypertrophic synovium.",
        associatedFindings: "Dense (high attenuation) joint effusion on CT due to recurrent haemarthrosis. No osteoporosis.",
        complicationsSeriousAlternatives: "Recurrence post-synovectomy and secondary severe osteoarthritis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "N ON-RESOLVING OR RECURRENT CONSOLIDATION",
    itemNumber: "4.6",
    problemCluster: "chronic consolidation",
    seriousAlternatives: ["Invasive Mucinous Adenocarcinoma", "Pulmonary Lymphoma", "Chronic Eosinophilic Pneumonia"],
    differentials: [
      {
        diagnosis: "Mucinous Adenocarcinoma (Formerly BAC)",
        dominantImagingFinding: "Chronic, indolent consolidation or multi-focal ground-glass opacities. Prominent air bronchograms. Lung volume is preserved or expanded.",
        distributionLocation: "Lobar (pneumonic form) or multi-focal. Often shows lower lobe predominance.",
        demographicsClinicalContext: "Older adults. Characteristically NON-SMOKERS. Presents with copious watery sputum (Bronchorrhea) in 25%.",
        discriminatingKeyFeature: "CT ANGIOGRAM SIGN: Enhancing pulmonary vessels are visibly coursing through low-attenuation mucin-filled airspaces. Bulging fissures.",
        associatedFindings: "Crazy-paving pattern. Does not respond to multiple courses of antibiotics.",
        complicationsSeriousAlternatives: "Progressive respiratory failure and aggressive multi-lobar metastatic spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Cryptogenic Organising Pneumonia (COP)",
        dominantImagingFinding: "Patchy, asymmetric consolidation and ground-glass opacities. Often sharply demarcated.",
        distributionLocation: "Peripheral and subpleural distribution (90%). Characteristically MIGRATORY over weeks to months.",
        demographicsClinicalContext: "Subacute onset of flu-like illness, dry cough, and mild dyspnoea. Refractory to antibiotics.",
        discriminatingKeyFeature: "ATOLL SIGN (Reverse Halo Sign): Central ground-glass opacity surrounded by a denser ring of consolidation (highly specific).",
        associatedFindings: "Rapid and dramatic clinical and radiological clearing with systemic corticosteroid therapy.",
        complicationsSeriousAlternatives: "Progression to fibrotic NSIP if left untreated.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Chronic Eosinophilic Pneumonia",
        dominantImagingFinding: "Dense, homogeneous air-space consolidation without significant loss of volume.",
        distributionLocation: "Strict PERIPHERAL predominance. Bilateral and symmetric. 'Photographic negative of pulmonary oedema'.",
        demographicsClinicalContext: "Middle-aged females (2:1). High association with asthma (50%) and atopy. Markedly elevated blood eosinophils.",
        discriminatingKeyFeature: "REVERSE BAT-WING APPEARANCE: Dense peripheral consolidation sparing the perihilar/central regions. Rapid clearance (<48h) on steroids.",
        associatedFindings: "Peripheral upper lobe predilection. Usually no pleural effusions or lymphadenopathy.",
        complicationsSeriousAlternatives: "Severe relapse upon steroid tapering.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Pulmonary MALT Lymphoma",
        dominantImagingFinding: "Chronic airspace consolidation with air bronchograms. Very slow growing.",
        distributionLocation: "Can cross anatomical fissures. Often solitary or a few dominant lesions.",
        demographicsClinicalContext: "Adults (50-60y). Extremely indolent course. Many patients are asymptomatic at presentation.",
        discriminatingKeyFeature: "PRESERVATION OF LUNG ARCHITECTURE: Air bronchograms are stretched but not destroyed. Absence of significant reactive hilar adenopathy.",
        associatedFindings: "Ground-glass 'halo' around the consolidation (representing neoplastic infiltration into adjacent alveoli).",
        complicationsSeriousAlternatives: "Transformation to high-grade large B-cell lymphoma.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "D ILATED SMALL BOWEL",
    itemNumber: "6.14",
    problemCluster: "small bowel obstruction",
    seriousAlternatives: ["Strangulated Small Bowel", "Closed-loop Obstruction", "Ischaemic Bowel"],
    differentials: [
      {
        diagnosis: "Mechanical Small Bowel Obstruction",
        dominantImagingFinding: "Massively dilated small bowel loops (>3cm diameter) with multiple, prominent air-fluid levels. Valvulae conniventes stretch across the entire lumen.",
        distributionLocation: "Central abdomen. The bowel distal to the obstruction (colon) is entirely collapsed and gasless.",
        demographicsClinicalContext: "Prior abdominal surgery (Adhesions account for 70-80%). Colicky central abdominal pain, bilious vomiting, and absolute constipation.",
        discriminatingKeyFeature: "TRANSITION POINT on CT: Sharp caliber change from dilated proximal bowel to collapsed distal bowel, identifying the site of mechanical block.",
        associatedFindings: "STRING OF PEARLS SIGN: Small bubbles of gas trapped between valvulae conniventes in predominantly fluid-filled loops.",
        complicationsSeriousAlternatives: "Closed-loop obstruction (U-shaped loop, radial vessels) leading to venous infarction and strangulation.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Paralytic Ileus",
        dominantImagingFinding: "Dilatation of BOTH the small bowel and the large bowel (including the rectum). Long, smooth air-fluid levels.",
        distributionLocation: "Generalised across the entire abdomen and pelvis.",
        demographicsClinicalContext: "Post-operative state (first 48-72 hours), severe hypokalaemia, peritoneal sepsis, or retroperitoneal haemorrhage.",
        discriminatingKeyFeature: "PROPORTIONATE DILATATION of small and large bowel WITHOUT a discrete transition point. Gas reaches the rectum.",
        associatedFindings: "Lack of active peristalsis (silent abdomen on auscultation). No string of pearls sign.",
        complicationsSeriousAlternatives: "Masking an underlying severe intra-abdominal catastrophe (e.g., perforated viscus or abscess).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Coeliac Disease (Sprue)",
        dominantImagingFinding: "Dilated, fluid-filled small bowel loops with hypersecretion. Flocculation and segmentation of barium on fluoroscopy.",
        distributionLocation: "Predominantly involves the jejunum and proximal ileum.",
        demographicsClinicalContext: "Chronic diarrhea, steatorrhoea, weight loss, and iron deficiency anaemia. Positive anti-TTG antibodies.",
        discriminatingKeyFeature: "JEJUNISATION OF THE ILEUM (Moulage Sign): Reversal of the normal fold pattern where the jejunum becomes smooth and featureless, while the ileum develops prominent folds.",
        associatedFindings: "Cavitating mesenteric lymph node syndrome (low density nodes). Transient intussusceptions (often non-obstructing).",
        complicationsSeriousAlternatives: "Enteropathy-Associated T-Cell Lymphoma (EATL) or small bowel adenocarcinoma.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Scleroderma (Systemic Sclerosis)",
        dominantImagingFinding: "Dilated small bowel loops with closely packed, thickened valvulae conniventes.",
        distributionLocation: "Diffuse small bowel involvement, particularly the duodenum and jejunum.",
        demographicsClinicalContext: "Female with Raynaud's phenomenon, tight skin (sclerodactyly), and dysphagia.",
        discriminatingKeyFeature: "HIDE-BOUND BOWEL SIGN on fluoroscopy: The bowel is dilated, but the folds remain extremely close together due to fibrosis. Extreme transit delay.",
        associatedFindings: "Pneumatosis cystoides intestinalis (benign gas cysts in the bowel wall). Dilated, atonic oesophagus.",
        complicationsSeriousAlternatives: "Bacterial overgrowth syndrome and severe malabsorption.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  }
];

async function main() {
  console.log("Seeding GOLD STANDARD Quality ACE Batch...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of GOLD_STANDARD_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      console.log(`Updating ${update.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives
      });
    } else {
      console.log(`Creating ${update.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: update.differentials,
        problemCluster: update.problemCluster,
        seriousAlternatives: update.seriousAlternatives
      });
    }
  }
  console.log("Gold Standard ACE Batch Complete!");
}

main().catch(console.error);