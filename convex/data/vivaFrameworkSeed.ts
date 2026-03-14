/**
 * Comprehensive Viva Framework Seed Data
 *
 * ~50 records covering all viva scenarios for the FRCR 2B exam.
 * Sources: Viva Survival Guide [15], 100 Cases [13], Mnemonics book [16]
 */

type VivaFrameworkEntry = {
  category: string;
  context: string;
  phrases: string[];
  examples: string[];
  subcategory: string;
  specialty?: string;
  sourceRef: string;
};

export const vivaFrameworkSeed: VivaFrameworkEntry[] = [
  // ============================================================
  // GENERIC STRUCTURE (10 records)
  // ============================================================
  {
    category: "Structure",
    subcategory: "opening",
    context: "How to open your presentation of a long case",
    phrases: [
      "This is a [modality] of [body part] in a [age/sex] patient presenting with [clinical history].",
      "The most striking abnormality is...",
      "There are several findings. I will describe the most significant first.",
    ],
    examples: [
      "This is an MRI of the knee in a 25-year-old male presenting with acute knee injury following a football tackle.",
      "This is a CT of the abdomen and pelvis with IV contrast in a 65-year-old female presenting with abdominal pain and weight loss.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Structure",
    subcategory: "presenting",
    context: "How to present findings systematically",
    phrases: [
      "The key findings are as follows...",
      "In addition to the primary abnormality, I note...",
      "Important negative findings include...",
      "The normal structures I would specifically comment on are...",
    ],
    examples: [
      "The key findings are a large destructive lesion of the distal femur with periosteal reaction and soft tissue mass. In addition, there is no pathological fracture. Important negatives include intact cortex proximally and no skip lesions.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Structure",
    subcategory: "interpretation",
    context: "How to synthesise findings into an interpretation",
    phrases: [
      "Taken together, these findings are in keeping with...",
      "The combination of [finding A] and [finding B] is most consistent with...",
      "This pattern of abnormality suggests...",
      "In the context of the clinical history, the most likely diagnosis is...",
    ],
    examples: [
      "Taken together, the permeative bone destruction, periosteal reaction, and soft tissue mass in a patient under 20 are most consistent with an aggressive primary bone tumour such as Ewing sarcoma.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Structure",
    subcategory: "differentials",
    context: "How to present differential diagnoses",
    phrases: [
      "My primary diagnosis is [X]. I would consider the following differentials:",
      "The main differential is [Y], which I would distinguish by...",
      "A must-not-miss alternative is [Z] because...",
      "I would differentiate these based on...",
    ],
    examples: [
      "My primary diagnosis is osteosarcoma. The main differential is Ewing sarcoma, which I would distinguish by the patient's age, diaphyseal location, and permeative rather than geographic destruction. A must-not-miss alternative is osteomyelitis, which may present similarly but would have clinical features of infection.",
    ],
    sourceRef: "100 Cases [13]",
  },
  {
    category: "Structure",
    subcategory: "management",
    context: "How to discuss further investigation and management",
    phrases: [
      "I would recommend...",
      "The next step would be...",
      "This patient should be discussed at MDT.",
      "Urgent referral to [specialty] is indicated.",
      "Further imaging with [modality] would help to...",
    ],
    examples: [
      "I would recommend urgent orthopaedic oncology referral, staging CT of the chest, and whole-body MRI. This case should be discussed at the bone and soft tissue MDT.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Structure",
    subcategory: "closing",
    context: "How to close your case presentation",
    phrases: [
      "In summary, this is a [diagnosis] in a [patient], and I would recommend [next steps].",
      "To summarise, the key findings are [A, B, C] consistent with [diagnosis].",
      "Is there anything specific you would like me to comment on further?",
    ],
    examples: [
      "In summary, this is a case of osteosarcoma of the distal femur in a 14-year-old. I would recommend urgent orthopaedic oncology referral and staging imaging.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Structure",
    subcategory: "transitioning",
    context: "How to transition between sections of your answer",
    phrases: [
      "Moving on to the differential diagnosis...",
      "Regarding further management...",
      "I would now like to comment on the important negatives...",
      "Before discussing management, I should mention...",
    ],
    examples: [
      "Having described the primary findings and my likely diagnosis, I would now like to discuss the differential diagnoses and how I would distinguish between them.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Structure",
    subcategory: "modality-specific",
    context: "Modality-specific opening and systematic approach phrases",
    phrases: [
      "On this CT, I am using soft tissue/bone/lung windows...",
      "On this MRI, the sequences available are...",
      "On this plain film, I note the projection is [AP/lateral]...",
      "On this nuclear medicine study, the tracer used is...",
    ],
    examples: [
      "On this MRI of the knee, sequences available include sagittal T1, sagittal PD fat-sat, coronal PD fat-sat, and axial PD. I will assess the ligaments, menisci, articular cartilage, and bone marrow systematically.",
    ],
    sourceRef: "Long Cases Survival [14]",
  },
  {
    category: "Structure",
    subcategory: "scoring-awareness",
    context: "Understanding the marking scheme to maximise your score",
    phrases: [
      "Remember: 5/8 key bullets = score 7 (pass), 7/8 = score 8 (clear pass)",
      "Always mention important normal structures — this pushes you from 6 to 7",
      "A structured answer with clear diagnosis and 3 differentials is the minimum for a pass",
    ],
    examples: [
      "Even if you identify the primary diagnosis correctly, failing to mention important negatives (intact PCL, intact collateral ligaments) will limit your score to 6.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Structure",
    subcategory: "timing",
    context: "Time management during the viva",
    phrases: [
      "You have approximately 5 minutes per long case.",
      "Spend 2 minutes on findings, 1 minute on interpretation/diagnosis, 2 minutes on differentials and management.",
      "If running short, prioritise diagnosis and differentials over exhaustive findings.",
    ],
    examples: [
      "If you are running out of time, give your diagnosis first, then your top 3 differentials, and then fill in the findings that support your diagnosis.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },

  // ============================================================
  // RECOVERY & RESILIENCE (8 records)
  // ============================================================
  {
    category: "Recovery",
    subcategory: "dont-know",
    context: "What to do when you do not know the diagnosis",
    phrases: [
      "I am not certain of the specific diagnosis, but I can describe the pattern I see...",
      "The imaging pattern is [aggressive/indolent/inflammatory], which narrows the differential to...",
      "Based on the findings, I would approach this as a [pattern] and my working differential includes...",
    ],
    examples: [
      "I am not certain of the specific diagnosis, but this appears to be an aggressive bone lesion with permeative destruction and periosteal reaction. In a patient of this age, my differential would include Ewing sarcoma, osteomyelitis, and lymphoma.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Recovery",
    subcategory: "examiner-challenge",
    context: "When the examiner challenges your diagnosis",
    phrases: [
      "Thank you for that. On reflection, the features that might favour [alternative] include...",
      "You raise a good point. If I reconsider the [specific finding], this could also be consistent with...",
      "I appreciate the challenge. The discriminating feature between my diagnosis and [alternative] would be...",
    ],
    examples: [
      "Thank you for that. On reflection, the preserved disc spaces and ivory vertebra pattern might favour Paget disease rather than metastatic disease. I would look for cortical thickening and expansion as further discriminators.",
    ],
    sourceRef: "100 Cases [13]",
  },
  {
    category: "Recovery",
    subcategory: "realise-error",
    context: "When you realise you have made an error mid-presentation",
    phrases: [
      "Actually, on further reflection, I would like to revise my interpretation...",
      "I should correct myself — I initially said [X] but on closer review this is more consistent with [Y]...",
      "Having now considered the full picture, I think [revised diagnosis] is more likely because...",
    ],
    examples: [
      "Actually, on further reflection, I initially described this as a simple effusion but the loculated morphology and pleural thickening suggest empyema rather than a simple parapneumonic effusion.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Recovery",
    subcategory: "additional-images",
    context: "When the examiner shows additional images",
    phrases: [
      "Thank you. This additional image shows...",
      "This confirms my initial diagnosis of [X] because...",
      "This additional information changes my leading diagnosis to [Y] because...",
      "With this additional sequence/view, I can now see...",
    ],
    examples: [
      "Thank you. This post-contrast sequence confirms the diagnosis as the lesion shows peripheral rim enhancement consistent with an abscess rather than a solid tumour.",
    ],
    sourceRef: "100 Cases [13]",
  },
  {
    category: "Recovery",
    subcategory: "unfamiliar-topic",
    context: "When faced with an unfamiliar or rare diagnosis",
    phrases: [
      "This is not a diagnosis I encounter frequently, but based on the imaging pattern...",
      "I would describe this systematically even though the specific entity is unfamiliar to me...",
      "The key principle here is pattern recognition — this [pattern] narrows my differential to...",
    ],
    examples: [
      "This is not a diagnosis I encounter frequently, but the ground-glass matrix within an expansile rib lesion in a young patient suggests fibrous dysplasia. The key discriminator from a simple bone cyst would be the ground-glass density.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Recovery",
    subcategory: "disagree-with-examiner",
    context: "When you believe the examiner is leading you incorrectly",
    phrases: [
      "I understand your suggestion, but the features I see that support my diagnosis include...",
      "That is certainly possible. However, the key finding of [X] makes me more confident in [my diagnosis]...",
      "I would respectfully maintain my diagnosis because of [specific finding], though I acknowledge [alternative] is in the differential.",
    ],
    examples: [
      "I understand your suggestion of sarcoidosis, but the unilateral hilar lymphadenopathy with lung mass makes me more confident in lung carcinoma with hilar nodal involvement. Sarcoidosis typically causes bilateral symmetric hilar lymphadenopathy.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Recovery",
    subcategory: "silence-management",
    context: "When there is an awkward silence or you need time to think",
    phrases: [
      "Let me take a moment to review the images systematically...",
      "I would like to look at this more carefully before committing to a diagnosis...",
      "While I gather my thoughts, I can describe what I see in more detail...",
    ],
    examples: [
      "Let me take a moment to review the images systematically. I can see an abnormality in the [region] and I want to characterise it fully before giving my interpretation.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Recovery",
    subcategory: "partial-answer",
    context: "When you can only partially answer the question",
    phrases: [
      "I can confidently describe the following findings, though I am less certain about the specific diagnosis...",
      "My systematic review reveals [findings], and while I cannot give a definitive diagnosis, my approach would be...",
      "I would focus on what I can be confident about and recommend further investigation to clarify...",
    ],
    examples: [
      "I can confidently describe a destructive lesion with soft tissue extension, but I cannot distinguish between the top two differentials on imaging alone. I would recommend biopsy to establish the tissue diagnosis.",
    ],
    sourceRef: "100 Cases [13]",
  },

  // ============================================================
  // SAFETY NETTING (5 records)
  // ============================================================
  {
    category: "Safety",
    subcategory: "critical-findings",
    context: "How to handle critical/urgent findings",
    phrases: [
      "This is a critical finding that requires immediate communication to the referring clinician.",
      "I would ensure this is flagged as an urgent/unexpected finding per RCR guidelines.",
      "This requires immediate escalation because...",
    ],
    examples: [
      "The cauda equina compression seen here is a surgical emergency. I would immediately contact the on-call neurosurgical team and ensure the patient is seen urgently.",
    ],
    sourceRef: "On Call Radiology [10]",
  },
  {
    category: "Safety",
    subcategory: "incidental-findings",
    context: "How to handle incidental findings",
    phrases: [
      "I note an incidental finding of [X] which would warrant...",
      "There is an incidental [finding] which should be followed up according to [guideline]...",
      "While not related to the primary clinical question, I would also flag...",
    ],
    examples: [
      "I note an incidental 2cm adrenal nodule. This would warrant characterisation with dedicated adrenal CT or chemical shift MRI to exclude a functioning adenoma or metastasis.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Safety",
    subcategory: "escalation",
    context: "When and how to escalate findings",
    phrases: [
      "I would discuss this with my consultant before reporting.",
      "This warrants discussion at the next MDT meeting.",
      "Given the complexity, I would recommend a double-read/second opinion.",
      "I would contact the referring team directly to ensure timely clinical correlation.",
    ],
    examples: [
      "Given the equivocal findings, I would discuss with my consultant and recommend the case be reviewed at MDT. In the meantime, I would issue a preliminary report noting the key findings.",
    ],
    sourceRef: "Viva Survival Guide [15]",
  },
  {
    category: "Safety",
    subcategory: "limitations",
    context: "How to acknowledge limitations of imaging",
    phrases: [
      "I should note the limitations of this study, including...",
      "This modality is limited in its ability to assess [X] — I would recommend [Y] for further evaluation.",
      "Motion artefact/suboptimal technique limits assessment of [region].",
    ],
    examples: [
      "This non-contrast CT is limited in its ability to assess for subtle liver metastases. I would recommend contrast-enhanced CT or MRI with hepatocyte-specific contrast for full staging.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Safety",
    subcategory: "follow-up",
    context: "How to recommend appropriate follow-up",
    phrases: [
      "I would recommend follow-up imaging in [timeframe] to assess...",
      "According to [guideline], this finding warrants surveillance with...",
      "If clinical concern persists despite normal imaging, I would recommend...",
    ],
    examples: [
      "According to the Fleischner Society guidelines, this 6mm solid pulmonary nodule in a high-risk patient warrants follow-up CT at 6-12 months.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },

  // ============================================================
  // DIFFERENTIAL DISCUSSION (5 records)
  // ============================================================
  {
    category: "Differentials",
    subcategory: "structuring",
    context: "How to structure your differential discussion",
    phrases: [
      "I would structure my differential by considering [congenital/inflammatory/neoplastic/traumatic/vascular]...",
      "Using a surgical sieve approach: congenital, traumatic, inflammatory, neoplastic, degenerative, vascular...",
      "My differentials in order of likelihood are...",
    ],
    examples: [
      "For a lytic bone lesion in this age group, I would structure my differential as: neoplastic (primary bone tumour vs metastasis), infective (osteomyelitis), and inflammatory (giant cell lesion).",
    ],
    sourceRef: "Mnemonics [16]",
  },
  {
    category: "Differentials",
    subcategory: "discriminating-features",
    context: "How to discuss discriminating features between differentials",
    phrases: [
      "The key discriminator between [A] and [B] is...",
      "What makes [X] more likely than [Y] in this case is...",
      "I can narrow the differential by noting [specific finding]...",
      "The presence/absence of [finding] effectively excludes [diagnosis]...",
    ],
    examples: [
      "The key discriminator between osteosarcoma and Ewing sarcoma is the tumour matrix: osteosarcoma produces osteoid (dense/cloud-like), while Ewing typically shows permeative destruction without matrix. The patient's age (under 10 favours Ewing, 10-25 could be either) is also relevant.",
    ],
    sourceRef: "Chapman's [1]",
  },
  {
    category: "Differentials",
    subcategory: "must-not-miss",
    context: "How to present must-not-miss diagnoses",
    phrases: [
      "A must-not-miss diagnosis in this context would be...",
      "Even though [X] is most likely, I must exclude [Y] because the consequences of missing it are...",
      "The most dangerous alternative diagnosis is [Z], which I would exclude by...",
    ],
    examples: [
      "Although the most likely diagnosis is a benign enchondroma, a must-not-miss alternative is low-grade chondrosarcoma. I would look for endosteal scalloping >2/3 cortical thickness, size >5cm, and periosteal reaction as red flags for malignancy.",
    ],
    sourceRef: "100 Cases [13]",
  },
  {
    category: "Differentials",
    subcategory: "age-based",
    context: "Using patient age to refine differentials",
    phrases: [
      "In this age group, the most common causes of [pattern] are...",
      "The patient's age is a key discriminator here because...",
      "In a paediatric patient, I would prioritise [X] over [Y]...",
    ],
    examples: [
      "In a patient under 5, the most common posterior fossa tumours are pilocytic astrocytoma (midline, cystic with enhancing mural nodule) and ependymoma (arising from floor of 4th ventricle). In an older child, medulloblastoma becomes more common.",
    ],
    sourceRef: "Chapman's [1]",
  },
  {
    category: "Differentials",
    subcategory: "pattern-based",
    context: "Using imaging patterns to generate differentials",
    phrases: [
      "This [pattern] narrows my differential to...",
      "The combination of [pattern A] with [pattern B] is characteristic of...",
      "This is a classic pattern that I recognise as...",
    ],
    examples: [
      "The combination of bilateral symmetric sacroiliitis with syndesmophytes and bamboo spine is the classic pattern of ankylosing spondylitis. Differentials for bilateral sacroiliitis include inflammatory bowel disease-related arthropathy and reactive arthritis.",
    ],
    sourceRef: "Aunt Minnie's [3]",
  },

  // ============================================================
  // SPECIALTY-SPECIFIC (24 records — 4 per specialty)
  // ============================================================

  // --- MSK (4) ---
  {
    category: "Specialty",
    subcategory: "bone-lesion-approach",
    specialty: "MSK",
    context: "Systematic approach to a bone lesion",
    phrases: [
      "I would characterise this bone lesion by: location (epiphyseal/metaphyseal/diaphyseal), zone of transition, matrix, periosteal reaction, and soft tissue mass.",
      "The zone of transition is [narrow/wide], suggesting [indolent/aggressive] behaviour.",
      "The matrix is [osteoid/chondroid/fibrous/absent], which helps narrow the differential.",
    ],
    examples: [
      "This is a metaphyseal lesion with a wide zone of transition, aggressive periosteal reaction (sunburst pattern), and osteoid matrix. In a 14-year-old, this is classical for osteosarcoma.",
    ],
    sourceRef: "Helms MSK [4]",
  },
  {
    category: "Specialty",
    subcategory: "arthropathy-approach",
    specialty: "MSK",
    context: "Systematic approach to an arthropathy",
    phrases: [
      "I would characterise this arthropathy by: distribution (mono/oligo/polyarticular), erosion pattern, joint space, soft tissue changes, and bone density.",
      "The distribution pattern helps distinguish inflammatory from degenerative arthropathy.",
      "Key features to distinguish RA from psoriatic arthritis include...",
    ],
    examples: [
      "This polyarticular erosive arthropathy with periarticular osteoporosis, MCP and PIP joint involvement, and ulnar deviation is consistent with rheumatoid arthritis. Key negatives include absence of DIP involvement (which would suggest psoriatic arthritis) and absence of tophi (which would suggest gout).",
    ],
    sourceRef: "Chapman's [1]",
  },
  {
    category: "Specialty",
    subcategory: "fracture-description",
    specialty: "MSK",
    context: "How to systematically describe a fracture",
    phrases: [
      "I would describe this fracture by: bone, location, orientation, displacement, angulation, and associated injuries.",
      "This is a [transverse/oblique/spiral/comminuted] fracture of the [bone] at the [location].",
      "I would specifically assess for associated [ligamentous/neurovascular/joint] injury.",
    ],
    examples: [
      "This is a comminuted burst fracture of L1 with retropulsion of the posterior vertebral body fragment into the spinal canal. There is approximately 40% canal compromise. I would assess for posterior ligamentous complex integrity to classify this using the TLICS system.",
    ],
    sourceRef: "Helms MSK [4]",
  },
  {
    category: "Specialty",
    subcategory: "nuclear-medicine-msk",
    specialty: "MSK",
    context: "Approach to MSK nuclear medicine studies",
    phrases: [
      "On this bone scan, I note [focal/multifocal/diffuse] areas of increased tracer uptake...",
      "The three-phase bone scan shows [perfusion/blood pool/delayed] phase findings consistent with...",
      "The pattern of uptake helps distinguish [X] from [Y]...",
    ],
    examples: [
      "This bone scan shows multiple foci of increased tracer uptake in the axial skeleton, ribs, and proximal femora. In a patient with known prostate cancer, this pattern is consistent with widespread osteoblastic bone metastases. The 'superscan' appearance with absent renal activity confirms extensive skeletal involvement.",
    ],
    sourceRef: "100 Cases [13]",
  },

  // --- HN (4) ---
  {
    category: "Specialty",
    subcategory: "brain-tumour-approach",
    specialty: "Neuro",
    context: "Systematic approach to a brain tumour",
    phrases: [
      "I would characterise this lesion by: location (intra/extra-axial), signal characteristics, enhancement pattern, mass effect, and surrounding oedema.",
      "The location is key: intra-axial suggests glioma or metastasis; extra-axial suggests meningioma or schwannoma.",
      "I would assess for midline shift, herniation, and hydrocephalus.",
    ],
    examples: [
      "This is an intra-axial lesion in the left temporal lobe with heterogeneous enhancement, central necrosis, and surrounding vasogenic oedema. In a patient over 50, the leading diagnosis is glioblastoma. I would look for butterfly pattern crossing the corpus callosum and multifocality.",
    ],
    sourceRef: "Osborn's Brain [8]",
  },
  {
    category: "Specialty",
    subcategory: "stroke-approach",
    specialty: "Neuro",
    context: "Systematic approach to stroke imaging",
    phrases: [
      "On this CT, I would assess for early ischaemic signs using the ASPECTS scoring system.",
      "Key findings in acute ischaemia include: loss of grey-white differentiation, sulcal effacement, hyperdense vessel sign.",
      "I would also exclude haemorrhage and assess the posterior fossa.",
    ],
    examples: [
      "This non-contrast CT shows loss of the insular ribbon and lentiform nucleus obscuration on the right, consistent with an acute right MCA territory infarct. The ASPECTS score is approximately 7. There is no haemorrhagic transformation. I would recommend urgent CT angiography and CT perfusion if within the treatment window.",
    ],
    sourceRef: "Osborn's Brain [8]",
  },
  {
    category: "Specialty",
    subcategory: "neck-mass-approach",
    specialty: "Neuro",
    context: "Systematic approach to a neck mass",
    phrases: [
      "I would localise this neck mass to: the correct cervical space (parapharyngeal, masticator, carotid, posterior cervical, etc.)",
      "The key spaces to identify are parapharyngeal, masticator, parotid, carotid, retropharyngeal, and posterior cervical.",
      "The space of origin determines the differential.",
    ],
    examples: [
      "This well-defined cystic lesion posterior to the submandibular gland and lateral to the carotid space is in the expected location for a second branchial cleft cyst. It displaces the sternocleidomastoid posterolaterally and the carotid sheath medially, which is the classic 'beak sign'.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Specialty",
    subcategory: "demyelination-approach",
    specialty: "Neuro",
    context: "Approach to white matter lesions and demyelination",
    phrases: [
      "I would characterise these white matter lesions by: distribution, morphology, enhancement pattern, and associated features.",
      "The key question is whether these lesions fulfil the McDonald criteria for MS (dissemination in space and time).",
      "I would assess for periventricular, juxtacortical, infratentorial, and spinal cord lesions.",
    ],
    examples: [
      "These ovoid periventricular lesions oriented perpendicular to the ventricles (Dawson fingers), with additional juxtacortical and infratentorial lesions, fulfil the dissemination in space criteria for MS. The presence of both enhancing and non-enhancing lesions suggests dissemination in time.",
    ],
    sourceRef: "Osborn's Brain [8]",
  },

  // --- Paeds (4) ---
  {
    category: "Specialty",
    subcategory: "neonatal-chest-approach",
    specialty: "Paeds",
    context: "Systematic approach to a neonatal chest radiograph",
    phrases: [
      "On this neonatal chest radiograph, I would assess: lung volumes, opacification pattern, air leak, lines/tubes, and cardiac silhouette.",
      "The key differential for a white-out neonate depends on gestational age and clinical context.",
      "I would specifically assess for malposition of the ET tube, NG tube, and umbilical lines.",
    ],
    examples: [
      "This is a chest radiograph of a premature neonate showing diffuse ground-glass opacification with air bronchograms and low lung volumes. In a preterm infant, this is the classic appearance of respiratory distress syndrome (surfactant deficiency). I would also note the UAC tip at T8 and UVC tip at the diaphragm.",
    ],
    sourceRef: "Paeds Rapid Reporting [19]",
  },
  {
    category: "Specialty",
    subcategory: "paediatric-abdomen-approach",
    specialty: "Paeds",
    context: "Approach to paediatric abdominal mass or obstruction",
    phrases: [
      "For a paediatric abdominal mass, age is the most important discriminator.",
      "In a neonate, I would consider: neuroblastoma, mesoblastic nephroma, or hydronephrosis.",
      "In a child 1-5 years, the key differential is Wilms tumour vs neuroblastoma.",
    ],
    examples: [
      "This large intrarenal mass with a claw sign of normal renal parenchyma in a 3-year-old is most consistent with Wilms tumour. Key features distinguishing it from neuroblastoma include: intrarenal origin, lack of calcification, and lack of vascular encasement. I would assess for bilateral disease, renal vein/IVC extension, and lung metastases.",
    ],
    sourceRef: "Chapman's [1]",
  },
  {
    category: "Specialty",
    subcategory: "nai-approach",
    specialty: "Paeds",
    context: "Approach to suspected non-accidental injury",
    phrases: [
      "In suspected NAI, I would specifically assess for: metaphyseal corner fractures, posterior rib fractures, multiple fractures of different ages, and SDH.",
      "The presence of [finding] is highly specific for NAI.",
      "I would recommend a full skeletal survey according to RCR/RCPCH guidelines.",
    ],
    examples: [
      "This skeletal survey in a 6-month-old shows bilateral posterior rib fractures, a classic metaphyseal lesion of the distal tibia, and a healing fracture of the left humeral shaft. The combination of highly specific injuries (CMLs, posterior rib fractures) with fractures of different ages is very concerning for non-accidental injury.",
    ],
    sourceRef: "100 Cases [13]",
  },
  {
    category: "Specialty",
    subcategory: "paediatric-hip-approach",
    specialty: "Paeds",
    context: "Approach to paediatric hip pathology",
    phrases: [
      "For a paediatric hip, the key diagnoses to consider vary by age: DDH (neonate), Perthes (4-8), SUFE (10-15).",
      "On ultrasound, I would measure the alpha and beta angles using the Graf method.",
      "For Perthes disease, I would assess the stage using the Catterall or Herring classification.",
    ],
    examples: [
      "This hip ultrasound shows an alpha angle of 50 degrees and a beta angle of 70 degrees, classified as Graf type IIc (critically immature). The femoral head is partially uncovered with the labrum displaced superiorly. Pavlik harness treatment is indicated.",
    ],
    sourceRef: "Paeds Rapid Reporting [19]",
  },

  // --- WHGU (4) ---
  {
    category: "Specialty",
    subcategory: "renal-mass-approach",
    specialty: "GU",
    context: "Systematic approach to a renal mass",
    phrases: [
      "I would characterise this renal mass by: size, enhancement (>20 HU increase), internal architecture, and invasion.",
      "The Bosniak classification helps grade cystic renal lesions (I, II, IIF, III, IV).",
      "Key features suggesting RCC include: solid enhancing mass, heterogeneous enhancement, and renal vein invasion.",
    ],
    examples: [
      "This is a 6cm solid heterogeneously enhancing mass arising from the left kidney with clear cell enhancement pattern (avid arterial phase, rapid washout). There is extension into the left renal vein but not the IVC. This is consistent with clear cell renal cell carcinoma. I would stage with CT chest and assess the contralateral kidney.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Specialty",
    subcategory: "ovarian-mass-approach",
    specialty: "GU",
    context: "Approach to an ovarian mass",
    phrases: [
      "I would characterise this ovarian mass by: size, solid/cystic, enhancement, internal features, and peritoneal involvement.",
      "O-RADS classification helps risk-stratify ovarian lesions on ultrasound and MRI.",
      "Fat and calcification within a cystic ovarian mass suggest dermoid cyst.",
    ],
    examples: [
      "This is a 12cm complex cystic-solid mass arising from the right ovary with thick septations, solid enhancing nodules, and ascites. There is omental caking and peritoneal deposits. This is consistent with ovarian carcinoma, FIGO stage IIIC. I would assess for lymphadenopathy and liver surface metastases.",
    ],
    sourceRef: "100 Cases [13]",
  },
  {
    category: "Specialty",
    subcategory: "breast-imaging-approach",
    specialty: "GU",
    context: "Approach to breast imaging findings",
    phrases: [
      "I would use the BI-RADS lexicon to describe this finding: shape, margin, density/signal, enhancement pattern.",
      "The key features suggesting malignancy include: spiculated margin, irregular shape, and associated calcifications.",
      "I would classify this as BI-RADS [category] and recommend [action].",
    ],
    examples: [
      "This is a 2.5cm spiculated mass in the upper outer quadrant of the left breast, with associated pleomorphic microcalcifications. The mass shows type III washout kinetics on MRI. This is BI-RADS 5 (highly suggestive of malignancy) and I would recommend tissue diagnosis with core biopsy.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Specialty",
    subcategory: "obstetric-approach",
    specialty: "GU",
    context: "Approach to obstetric imaging findings",
    phrases: [
      "I would assess: placental position, fetal lie and presentation, amniotic fluid volume, and any focal abnormality.",
      "For placenta praevia, I would assess the relationship to the internal os and look for signs of accreta spectrum.",
      "Key emergency findings include: placental abruption, cord prolapse, and uterine rupture.",
    ],
    examples: [
      "This MRI shows a low-lying anterior placenta covering the internal os (placenta praevia) with loss of the normal hypointense myometrial-placental interface and abnormal vascularity at the bladder interface, suggesting placenta accreta. This patient requires planning for delivery at a specialist centre.",
    ],
    sourceRef: "100 Cases [13]",
  },

  // --- CT (Cardiothoracics) (4) ---
  {
    category: "Specialty",
    subcategory: "ild-approach",
    specialty: "Chest",
    context: "Systematic approach to interstitial lung disease on HRCT",
    phrases: [
      "I would characterise this ILD by: distribution (upper/lower, central/peripheral), pattern (reticular/nodular/GGO/consolidation), and associated features.",
      "The UIP pattern is defined by: basal-predominant reticulation, honeycombing, traction bronchiectasis, and absence of features suggesting an alternative.",
      "I would classify this as a definite/probable/indeterminate UIP pattern according to current guidelines.",
    ],
    examples: [
      "This HRCT shows basal-predominant, subpleural reticulation with honeycombing, traction bronchiectasis, and minimal ground-glass opacity. There are no features to suggest an alternative diagnosis. This is a definite UIP pattern, and in the appropriate clinical context (age >60, insidious onset), a confident diagnosis of IPF can be made without biopsy.",
    ],
    sourceRef: "Chapman's [1]",
  },
  {
    category: "Specialty",
    subcategory: "lung-cancer-staging",
    specialty: "Chest",
    context: "Approach to lung cancer staging",
    phrases: [
      "I would stage this lung cancer using TNM 8th edition, assessing: tumour size and local invasion (T), nodal involvement (N), and distant metastases (M).",
      "Key findings that upstage include: mediastinal invasion, contralateral nodal involvement, and distant metastases.",
      "PET-CT findings should be correlated with CT appearances.",
    ],
    examples: [
      "This is a 5cm right upper lobe mass invading the chest wall (T3). There is ipsilateral mediastinal lymphadenopathy at station 4R (N2). PET-CT shows FDG avidity in the primary and nodes with no distant metastases (M0). This is stage IIIA (T3N2M0). MDT discussion is required for treatment planning.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Specialty",
    subcategory: "pe-approach",
    specialty: "Chest",
    context: "Approach to pulmonary embolism on CTPA",
    phrases: [
      "I would systematically assess: central/segmental/subsegmental pulmonary arteries for filling defects.",
      "Signs of right heart strain include: RV/LV ratio >1, bowing of the interventricular septum, and contrast reflux into the IVC.",
      "I would also assess for an alternative diagnosis if no PE is found.",
    ],
    examples: [
      "This CTPA shows a saddle embolus straddling the main pulmonary artery bifurcation with extensive bilateral lobar and segmental clot burden. There is right ventricular dilatation with an RV/LV ratio of 1.5 and contrast reflux into the hepatic veins, indicating right heart strain. This is a massive PE and I would alert the clinical team immediately.",
    ],
    sourceRef: "CXR Survival Guide [12]",
  },
  {
    category: "Specialty",
    subcategory: "aortic-approach",
    specialty: "Chest",
    context: "Approach to aortic pathology",
    phrases: [
      "I would classify aortic dissection by Stanford (A involves ascending, B does not) and DeBakey systems.",
      "Key features to report: extent of dissection, branch vessel involvement, malperfusion, and pericardial effusion.",
      "For aortic aneurysm, I would measure maximum diameter and assess for complications.",
    ],
    examples: [
      "This CT angiogram shows an intimal flap extending from the aortic root to the descending thoracic aorta — this is a Stanford type A dissection. There is a moderate pericardial effusion concerning for haemopericardium. The coeliac axis and SMA arise from the true lumen. This is a surgical emergency.",
    ],
    sourceRef: "On Call Radiology [10]",
  },

  // --- GV (Gastro & Vascular) (4) ---
  {
    category: "Specialty",
    subcategory: "liver-lesion-approach",
    specialty: "GI",
    context: "Systematic approach to a liver lesion",
    phrases: [
      "I would characterise this liver lesion by: enhancement pattern on arterial/portal venous/delayed phases, T2 signal, and diffusion characteristics.",
      "In a cirrhotic liver, the LI-RADS classification helps grade hepatocellular lesions (LR-1 to LR-5).",
      "Key arterial-phase hyperenhancing lesions in a non-cirrhotic liver: haemangioma, FNH, hepatic adenoma, and hypervascular metastasis.",
    ],
    examples: [
      "This CT shows a 3cm lesion in segment 6 of a cirrhotic liver with arterial-phase hyperenhancement and portal venous washout. Using LI-RADS, the arterial hyperenhancement, washout, and threshold growth make this LR-5 (definite HCC). I would also assess for portal vein tumour thrombus and extrahepatic disease.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Specialty",
    subcategory: "bowel-obstruction-approach",
    specialty: "GI",
    context: "Approach to bowel obstruction on CT",
    phrases: [
      "I would identify: the transition point, cause of obstruction, proximal dilatation, and complications (closed loop, strangulation, perforation).",
      "Key signs of strangulation include: mesenteric haziness, bowel wall thickening, reduced enhancement, and pneumatosis.",
      "Small bowel is dilated if >3cm, large bowel if >6cm (>9cm for caecum).",
    ],
    examples: [
      "This CT shows dilated small bowel loops up to 4.5cm with a clear transition point in the right iliac fossa where loops converge on an adhesive band. There is a C-shaped loop with converging mesenteric vessels (whirl sign) suggesting a closed-loop obstruction. The affected loop shows reduced wall enhancement, raising concern for strangulation.",
    ],
    sourceRef: "On Call Radiology [10]",
  },
  {
    category: "Specialty",
    subcategory: "pancreatic-approach",
    specialty: "GI",
    context: "Approach to pancreatic pathology",
    phrases: [
      "For a pancreatic mass, I would assess: location, relationship to SMA/SMV/coeliac axis, and duct dilatation.",
      "Resectability assessment: contact with SMA/coeliac axis <180° (borderline) vs >180° (unresectable).",
      "For cystic pancreatic lesions, I would classify by morphology: branch-duct IPMN, main-duct IPMN, MCN, SCN.",
    ],
    examples: [
      "This CT shows a hypodense mass in the pancreatic head with upstream pancreatic duct and common bile duct dilatation (double-duct sign). The mass encases the SMA by >180° and occludes the SMV. This is an unresectable pancreatic head adenocarcinoma. I would assess for liver metastases and peritoneal disease.",
    ],
    sourceRef: "Complete Guide 2B [2]",
  },
  {
    category: "Specialty",
    subcategory: "mesenteric-ischaemia-approach",
    specialty: "GI",
    context: "Approach to mesenteric ischaemia",
    phrases: [
      "I would assess: SMA/SMV patency, bowel wall enhancement and thickness, mesenteric fat stranding, and pneumatosis/portal venous gas.",
      "Acute SMA embolism typically lodges just beyond the origin of the middle colic artery.",
      "The 'paper-thin wall' sign and pneumatosis are late findings suggesting infarction.",
    ],
    examples: [
      "This CT shows an abrupt filling defect in the SMA just beyond the origin of the middle colic artery, consistent with an embolic occlusion. There is reduced enhancement and thinning of the jejunal and ileal walls with mesenteric fat stranding. I would alert the vascular surgery team for consideration of emergency embolectomy or endovascular intervention.",
    ],
    sourceRef: "On Call Radiology [10]",
  },
];
