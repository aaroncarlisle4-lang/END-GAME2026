import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) throw new Error("Missing CONVEX_URL");

const client = new ConvexHttpClient(CONVEX_URL);

// Batch 2: MSK, Neuro, Paeds remaining A-star Dahnert data
const updates = [
  {
    pattern: "Diffuse osteosclerosis",
    newDiffs: [
      {
        diagnosis: "Paget's Disease (Osteitis Deformans)",
        dominantImagingFinding: "Cortical thickening, trabecular coarsening, and bone enlargement (100% specific).",
        distributionLocation: "Asymmetric. Pelvis, skull, spine (picture frame vertebra), and femur.",
        demographicsClinicalContext: "Older adults (>55y). Elevated Alkaline Phosphatase with normal Calcium/Phosphate.",
        discriminatingKeyFeature: "BONE ENLARGEMENT (unlike metastases or myelofibrosis). Cotton-wool skull.",
        associatedFindings: "Bowing deformities (e.g. Shepherd's crook).",
        complicationsSeriousAlternatives: "Osteosarcomatous transformation (<1%).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Fluorosis",
        dominantImagingFinding: "DENSE osteosclerosis with extensive calcification of ligaments and interosseous membranes.",
        distributionLocation: "Axial skeleton (Spine, Pelvis). Spares the skull usually.",
        demographicsClinicalContext: "History of chronic high fluoride ingestion (well water, industrial exposure).",
        discriminatingKeyFeature: "LIGAMENTOUS CALCIFICATION (sacrotuberous/sacrospinous) accompanying dense bones.",
        associatedFindings: "Osteophytes and enthesophytes.",
        complicationsSeriousAlternatives: "Severe joint stiffness and restricted mobility.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Multiple lucent bone lesions",
    newDiffs: [
      {
        diagnosis: "Langerhans Cell Histiocytosis (LCH)",
        dominantImagingFinding: "Punched-out lytic lesions without a sclerotic rim. Bevelled edge sign in the skull.",
        distributionLocation: "Skull, pelvis, femur. Can be monostotic (EG) or polyostotic.",
        demographicsClinicalContext: "Children and young adults (Peak 5-15y). Bone pain.",
        discriminatingKeyFeature: "BEVELLED EDGE in skull (unequal inner/outer table destruction) and BUTTON SEQUESTRUM.",
        associatedFindings: "Vertebra plana in the spine.",
        complicationsSeriousAlternatives: "Systemic involvement (Hand-Schüller-Christian disease).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Enchondromatosis (Ollier's Disease)",
        dominantImagingFinding: "Multiple radiolucent expansile lesions with internal 'Rings and Arcs' calcification (100% specific matrix).",
        distributionLocation: "Metaphyseal/Diaphyseal. Prominent in hands and feet. Often unilateral predominance.",
        demographicsClinicalContext: "Children. Presents with painless swelling and shortening of affected limbs.",
        discriminatingKeyFeature: "CHONDROID MATRIX calcification within multiple expansile hand/foot lesions.",
        associatedFindings: "Bone shortening and bowing.",
        complicationsSeriousAlternatives: "Chondrosarcoma transformation (10-30% lifetime risk).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Expansile lytic lesion",
    newDiffs: [
      {
        diagnosis: "Chondromyxoid Fibroma (CMF)",
        dominantImagingFinding: "Eccentric, expansile lytic lesion. Scalloped sclerotic margin (bite-like). No internal calcification (unlike other cartilage tumors).",
        distributionLocation: "Metaphyseal. Proximal tibia is the classic site (50%).",
        demographicsClinicalContext: "Young adults (10-30y). Mild chronic pain.",
        discriminatingKeyFeature: "ECCENTRIC, heavily scalloped sclerotic border in the metaphysis of the tibia.",
        associatedFindings: "Cortical expansion but intact periosteum.",
        complicationsSeriousAlternatives: "Can mimic ABC or GCT but lacks fluid levels or subarticular extension.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Solitary Bone Cyst (SBC / UBC)",
        dominantImagingFinding: "Centrally located, well-defined lytic lesion. Mildly expansile. Truncated cone shape.",
        distributionLocation: "Metaphyseal, migrating to diaphysis as the child grows. Proximal humerus or femur.",
        demographicsClinicalContext: "Children and adolescents (Peak 5-15y). Often asymptomatic until fracture.",
        discriminatingKeyFeature: "FALLEN FRAGMENT SIGN (100% specific): A piece of fractured cortex falls to the dependent portion of the fluid-filled cyst.",
        associatedFindings: "Pathological fracture is the most common presentation.",
        complicationsSeriousAlternatives: "Recurrent fractures.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Aggressive lytic lesion in child",
    newDiffs: [
      {
        diagnosis: "Lymphoma (Primary Bone)",
        dominantImagingFinding: "Permeative or moth-eaten bone destruction. Mild or absent periosteal reaction.",
        distributionLocation: "Metadiaphyseal region of long bones.",
        demographicsClinicalContext: "Adolescents to adults. Localised pain and swelling.",
        discriminatingKeyFeature: "LACK OF EXTENSIVE PERIOSTITIS despite permeative aggressive destruction (unlike Ewing's).",
        associatedFindings: "Pathological fracture and large soft tissue mass on MRI.",
        complicationsSeriousAlternatives: "Systemic lymphoma spread.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Epiphyseal lucent lesion",
    newDiffs: [
      {
        diagnosis: "Clear Cell Chondrosarcoma",
        dominantImagingFinding: "Lytic, slightly expansile epiphyseal lesion. Chondroid calcification in 30%.",
        distributionLocation: "Epiphyseal. Proximal femur (head/neck) is the classic site.",
        demographicsClinicalContext: "Adults (30-50y). Slow-growing, chronic pain.",
        discriminatingKeyFeature: "EPIPHYSEAL location with malignant features in a middle-aged adult (mimics GCT but has calcification).",
        associatedFindings: "Cortical breakthrough and soft tissue extension.",
        complicationsSeriousAlternatives: "Metastatic spread to lungs.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Intraosseous Ganglion",
        dominantImagingFinding: "Well-defined, solitary lytic lesion with a sclerotic rim. No matrix calcification.",
        distributionLocation: "Subarticular (Epiphyseal). Adjacent to a joint, commonly the ankle (medial malleolus) or carpal bones.",
        demographicsClinicalContext: "Adults. Mild chronic pain. Normal joint space (unlike a geode).",
        discriminatingKeyFeature: "NORMAL ADJACENT JOINT SPACE (differentiates from degenerative subchondral cyst/geode).",
        associatedFindings: "May communicate with the adjacent joint capsule on MRI.",
        complicationsSeriousAlternatives: "Pathological fracture (rare).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Diffuse marrow infiltration MRI",
    newDiffs: [
      {
        diagnosis: "Marrow Hyperplasia (Reconversion)",
        dominantImagingFinding: "Bilateral, symmetric low T1 signal (red marrow). Typically slightly hyperintense or isointense to muscle/disc.",
        distributionLocation: "Metaphyseal or diaphysis of long bones. Expands centrally from the axial skeleton.",
        demographicsClinicalContext: "Severe chronic anaemia (Sickle cell, Thalassemia), high-altitude athletes, or heavy smokers.",
        discriminatingKeyFeature: "SYMMETRICAL distribution and T1 signal that remains SLIGHTLY BRIGHTER than adjacent intervertebral discs (unlike metastases).",
        associatedFindings: "No cortical destruction or soft tissue mass.",
        complicationsSeriousAlternatives: "Masking of underlying true infiltrative disease.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Posterior vertebral scalloping",
    newDiffs: [
      {
        diagnosis: "Communicating Hydrocephalus",
        dominantImagingFinding: "Mild to moderate posterior scalloping of the lumbar vertebrae. Widened spinal canal.",
        distributionLocation: "Lumbosacral spine due to increased CSF pulsation pressure.",
        demographicsClinicalContext: "History of chronic hydrocephalus or elevated ICP.",
        discriminatingKeyFeature: "DILATED THECAL SAC and empty sella, without neurofibromas or connective tissue stigmata.",
        associatedFindings: "Prominent nerve root sheaths.",
        complicationsSeriousAlternatives: "Syringomyelia.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Lateral clavicle resorption",
    newDiffs: [
      {
        diagnosis: "Post-Traumatic Osteolysis",
        dominantImagingFinding: "Focal resorption of the distal 1-2 cm of the clavicle. Subchondral cysts and sclerosis.",
        distributionLocation: "UNILATERAL. Localised strictly to the AC joint of the affected shoulder.",
        demographicsClinicalContext: "Weightlifters, repetitive overhead workers, or history of direct AC joint trauma.",
        discriminatingKeyFeature: "UNILATERALITY and history of specific mechanical stress or trauma.",
        associatedFindings: "AC joint widening and hypertrophic spurring.",
        complicationsSeriousAlternatives: "Chronic debilitating shoulder pain.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Short metacarpals",
    newDiffs: [
      {
        diagnosis: "Hereditary Multiple Exostoses (HME)",
        dominantImagingFinding: "Shortening and deformity of the metacarpals secondary to broad-based osteochondromas.",
        distributionLocation: "Multiple bones involved. Typically affects the metaphyses.",
        demographicsClinicalContext: "Autosomal Dominant. Presents in childhood with multiple hard painless lumps.",
        discriminatingKeyFeature: "BONY OUTGROWTHS (Exostoses) pointing away from the joint, causing secondary shortening of the affected bone.",
        associatedFindings: "Madelung-like deformity of the wrist.",
        complicationsSeriousAlternatives: "Malignant transformation to chondrosarcoma (1-5%).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Acro-osteolysis",
    newDiffs: [
      {
        diagnosis: "Vinyl Chloride Exposure",
        dominantImagingFinding: "Transverse band-like osteolysis across the distal phalangeal tuft.",
        distributionLocation: "Bilateral hands. Classic 'band' pattern sparing the very tip and the base of the tuft.",
        demographicsClinicalContext: "Occupational exposure to PVC/Vinyl chloride manufacturing. Raynaud's-like symptoms.",
        discriminatingKeyFeature: "OCCUPATIONAL HISTORY and the unique BAND-LIKE central lucency across the tuft.",
        associatedFindings: "Hepatic angiosarcoma is a known severe complication of the same exposure.",
        complicationsSeriousAlternatives: "Liver angiosarcoma.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Osteonecrosis of the hips",
    newDiffs: [
      {
        diagnosis: "Gaucher Disease",
        dominantImagingFinding: "Avascular necrosis of the femoral heads. Erlenmeyer flask deformity of the distal femora.",
        distributionLocation: "Bilateral. Affects the hips and knees prominently.",
        demographicsClinicalContext: "Ashkenazi Jewish descent. Hepatosplenomegaly, anaemia, and bone pain.",
        discriminatingKeyFeature: "ERLENMEYER FLASK deformity (failure of metaphyseal modeling) and massive organomegaly.",
        associatedFindings: "H-shaped vertebrae (similar to sickle cell) and diffuse marrow infiltration (low T1/T2).",
        complicationsSeriousAlternatives: "Severe disabling joint destruction and bone crises.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Dysbarism (Caisson Disease)",
        dominantImagingFinding: "Medullary bone infarcts (serpiginous calcified rings) and subchondral AVN.",
        distributionLocation: "Bilateral. Shoulders (Humerus) and Hips (Femur).",
        demographicsClinicalContext: "Deep-sea divers or caisson workers. 'The Bends'.",
        discriminatingKeyFeature: "OCCUPATIONAL HISTORY of decompression sickness and heavily calcified medullary infarcts.",
        associatedFindings: "Multiple calcified medullary lesions in the diametaphyseal regions.",
        complicationsSeriousAlternatives: "Neurological decompression sickness.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Ring enhancing lesion",
    newDiffs: [
      {
        diagnosis: "Toxoplasmosis",
        dominantImagingFinding: "Multiple ring or nodular enhancing lesions. ECCENTRIC TARGET SIGN (100% specific if seen).",
        distributionLocation: "BASAL GANGLIA and corticomedullary junction.",
        demographicsClinicalContext: "IMMUNOSUPPRESSED (HIV+ with CD4 <100). Fever, headache, focal deficits.",
        discriminatingKeyFeature: "BASAL GANGLIA location and Eccentric Target Sign (a small enhancing nodule along the wall of the ring).",
        associatedFindings: "Extensive vasogenic oedema. Rapid response to anti-toxo therapy (2 weeks).",
        complicationsSeriousAlternatives: "Primary CNS Lymphoma (if no response to toxo treatment).",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Lymphoma (Immunocompromised)",
        dominantImagingFinding: "Ring-enhancing lesions (central necrosis is common in HIV+ patients, unlike immunocompetent where it is solid).",
        distributionLocation: "Periventricular white matter and Corpus Callosum. Often crosses midline.",
        demographicsClinicalContext: "HIV+ (CD4 <50) or post-transplant. EBV co-infection.",
        discriminatingKeyFeature: "THICK EPENDYMAL ENHANCEMENT along the ventricles and subependymal spread.",
        associatedFindings: "Thallium SPECT positive (Toxoplasmosis is negative).",
        complicationsSeriousAlternatives: "Rapidly fatal if untreated.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Radiation Necrosis",
        dominantImagingFinding: "SWISS CHEESE or 'Soap-bubble' irregular ring enhancement. Marked surrounding oedema.",
        distributionLocation: "Strictly confined to the previous high-dose radiation field. White matter > Grey matter.",
        demographicsClinicalContext: "History of brain tumor treatment (typically 6-24 months post-radiotherapy).",
        discriminatingKeyFeature: "REDUCED PERFUSION (low rCBV) on MR perfusion and NO CHOLINE PEAK on MR spectroscopy (differentiates from recurrent tumor).",
        associatedFindings: "Volume loss and white matter T2 hyperintensity in the radiation field.",
        complicationsSeriousAlternatives: "Recurrent Glioblastoma (the main mimic).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "CPA mass",
    newDiffs: [
      {
        diagnosis: "Arachnoid Cyst",
        dominantImagingFinding: "Well-defined, smooth, non-enhancing cystic lesion. Follows CSF signal exactly on all sequences.",
        distributionLocation: "CPA cistern. Displaces adjacent nerves and brainstem smoothly.",
        demographicsClinicalContext: "Usually incidental and asymptomatic. May cause mild mass effect symptoms.",
        discriminatingKeyFeature: "SUPPRESSES COMPLETELY ON FLAIR and shows NO RESTRICTED DIFFUSION on DWI (100% specific vs Epidermoid).",
        associatedFindings: "Scalloping of the adjacent inner table of the skull.",
        complicationsSeriousAlternatives: "Hemorrhage into the cyst following minor trauma.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Pituitary region mass",
    newDiffs: [
      {
        diagnosis: "Hypothalamic / Optic Chiasm Glioma",
        dominantImagingFinding: "Tubular or fusiform enlargement of the optic nerves and chiasm. Variable enhancement.",
        distributionLocation: "Follows the optic pathways (Suprasellar).",
        demographicsClinicalContext: "Children (Peak <10y). High association with NEUROFIBROMATOSIS Type 1 (NF1).",
        discriminatingKeyFeature: "TRAM-TRACK appearance of the optic nerves and clinical stigmata of NF1.",
        associatedFindings: "Other focal areas of signal intensity (FASI) in the basal ganglia on T2 (NF1 marker).",
        complicationsSeriousAlternatives: "Progressive blindness and diencephalic syndrome (emaciation).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Basal ganglia calcification",
    newDiffs: [
      {
        diagnosis: "Congenital Infection (Toxoplasmosis/CMV)",
        dominantImagingFinding: "Punctate or nodular calcifications. Often linear along the ventricles (CMV) or scattered (Toxo).",
        distributionLocation: "PERIVENTRICULAR (classic for CMV) or diffuse including basal ganglia (Toxo).",
        demographicsClinicalContext: "Neonate or infant (TORCH infections). Microcephaly, seizures, developmental delay.",
        discriminatingKeyFeature: "NEONATAL presentation, microcephaly, and associated polymicrogyria or white matter volume loss.",
        associatedFindings: "Chorioretinitis and hearing loss.",
        complicationsSeriousAlternatives: "Severe permanent neurological disability.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Intra-axial haemorrhage",
    newDiffs: [
      {
        diagnosis: "Cavernous Malformation (Cavernoma)",
        dominantImagingFinding: "POPCORN appearance (100% classic) on T2. Complete low-signal HAEMOSIDERIN RIM.",
        distributionLocation: "Random distribution. Supratentorial > Infratentorial.",
        demographicsClinicalContext: "Young adults. Presents with seizures or incidental finding. Familial forms have multiple lesions.",
        discriminatingKeyFeature: "POPCORN morphology with blooming artifact on SWI/GRE and ABSENCE OF OEDEMA (unless acutely bleeding).",
        associatedFindings: "Associated Developmental Venous Anomaly (DVA) in 20%.",
        complicationsSeriousAlternatives: "Recurrent clinically significant seizures or bleeding.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Restricted diffusion in brain",
    newDiffs: [
      {
        diagnosis: "Creutzfeldt-Jakob Disease (CJD)",
        dominantImagingFinding: "CORTICAL RIBBONING (Restricted diffusion along the cortex). Bright signal in Basal Ganglia.",
        distributionLocation: "Cerebral cortex (asymmetric), Caudate nucleus, and Putamen. 'Pulvinar sign' or 'Hockey stick sign' in variant CJD.",
        demographicsClinicalContext: "Rapidly progressive dementia, myoclonus, and ataxia over months. Prion disease.",
        discriminatingKeyFeature: "CORTICAL RIBBONING + Basal ganglia restriction in the setting of rapid fatal dementia.",
        associatedFindings: "Progressive brain atrophy. No enhancement.",
        complicationsSeriousAlternatives: "Universally fatal within a year.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Hypercellular Tumour (Lymphoma/Medulloblastoma)",
        dominantImagingFinding: "Solid mass with uniform RESTRICTED DIFFUSION due to dense cellular packing.",
        distributionLocation: "Lymphoma (Periventricular/Basal Ganglia). Medulloblastoma (4th Ventricle).",
        demographicsClinicalContext: "Variable (HIV for Lymphoma, Children for Medulloblastoma).",
        discriminatingKeyFeature: "SOLID enhancement matching the area of restriction (unlike the ring of an abscess).",
        associatedFindings: "Peritumoral oedema and mass effect.",
        complicationsSeriousAlternatives: "Rapid CNS dissemination.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Extramedullary intradural spinal mass",
    newDiffs: [
      {
        diagnosis: "Myxopapillary Ependymoma",
        dominantImagingFinding: "Sausage-shaped mass expanding the spinal canal. Intensely enhancing and highly vascular.",
        distributionLocation: "Exclusively arises from the FILUM TERMINALE (Conus / Cauda Equina region).",
        demographicsClinicalContext: "Young adults (Peak 30y). Lower back pain, sciatica, and cauda equina symptoms.",
        discriminatingKeyFeature: "FILUM TERMINALE location and a tendency to haemorrhage (T2 dark margins from haemosiderin).",
        associatedFindings: "Scalloping of the sacral vertebrae due to chronic slow growth.",
        complicationsSeriousAlternatives: "Subarachnoid haemorrhage within the spinal canal.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Dermoid / Epidermoid Cyst",
        dominantImagingFinding: "Dermoid: Fat signal (High T1). Epidermoid: Restricted diffusion (Bright DWI).",
        distributionLocation: "Lumbar and sacral spine most common.",
        demographicsClinicalContext: "Children and young adults. Often associated with spinal dysraphism.",
        discriminatingKeyFeature: "FAT SIGNAL (Dermoid) or RESTRICTED DIFFUSION (Epidermoid) and congenital stigmata.",
        associatedFindings: "Dermal sinus tract and tethered cord (100% association).",
        complicationsSeriousAlternatives: "Chemical meningitis from cyst rupture.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Extradural spinal mass",
    newDiffs: [
      {
        diagnosis: "Epidural Haematoma",
        dominantImagingFinding: "Biconvex (lentiform) collection compressing the cord. Signal depends on blood age (T1 high if subacute).",
        distributionLocation: "Posterior epidural space (most venous plexuses are here).",
        demographicsClinicalContext: "History of trauma, lumbar puncture/epidural, or coagulopathy (Warfarin). Sudden severe pain.",
        discriminatingKeyFeature: "ACUTE ONSET following a procedure and absence of fever/sepsis (differentiates from abscess).",
        associatedFindings: "Compression of the thecal sac and cord.",
        complicationsSeriousAlternatives: "Irreversible paralysis (Surgical Emergency).",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Diffuse periosteal reaction child",
    newDiffs: [
      {
        diagnosis: "Multifocal Osteomyelitis",
        dominantImagingFinding: "Lytic bone destruction with aggressive periosteal reaction. Sequestrum/Involucrum formation.",
        distributionLocation: "Metaphyseal. Can be multifocal in neonates or immunocompromised.",
        demographicsClinicalContext: "Febrile, septic child. Refusal to move limb (pseudoparalysis).",
        discriminatingKeyFeature: "BONE DESTRUCTION (lytic areas) and clinical sepsis (unlike physiological or PGE1).",
        associatedFindings: "Adjacent soft tissue abscess and joint effusions.",
        complicationsSeriousAlternatives: "Sepsis and permanent growth plate arrest.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Scurvy (Vitamin C Deficiency)",
        dominantImagingFinding: "Subperiosteal haemorrhage causing profound periosteal elevation as it calcifies.",
        distributionLocation: "Diffuse, bilateral. Most prominent around the knees.",
        demographicsClinicalContext: "Infants (6-24 months) on unsupplemented diets. Irritable and bleeding gums.",
        discriminatingKeyFeature: "FRANKEL LINE (dense zone of provisional calcification) and TRUMMERFELD ZONE (lucent band beneath it). Wimberger ring sign (calcified ring around epiphysis).",
        associatedFindings: "Pelkan spur (metaphyseal corner fracture).",
        complicationsSeriousAlternatives: "Severe bleeding diathesis.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Vertebra plana",
    newDiffs: [
      {
        diagnosis: "Ewing Sarcoma",
        dominantImagingFinding: "Permeative destruction leading to collapse. Large associated soft tissue mass.",
        distributionLocation: "Can involve the vertebral body and posterior elements.",
        demographicsClinicalContext: "Children and teenagers (5-20y). Pain and fever.",
        discriminatingKeyFeature: "MASSIVE SOFT TISSUE COMPONENT and permeative destruction, often without disc involvement.",
        associatedFindings: "Sclerotic reactive bone formation may be present.",
        complicationsSeriousAlternatives: "Spinal cord compression and pulmonary metastases.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Steroid-induced Osteoporosis",
        dominantImagingFinding: "Collapse of multiple vertebral bodies. Diffuse severe osteopenia.",
        distributionLocation: "Thoracolumbar spine. Multiple levels.",
        demographicsClinicalContext: "History of chronic high-dose corticosteroid use. Often asymptomatic until fracture.",
        discriminatingKeyFeature: "CORTICAL THINNING and 'picture-frame' appearance of vertebrae prior to collapse. No soft tissue mass.",
        associatedFindings: "Schmorl's nodes and wedge-compression fractures.",
        complicationsSeriousAlternatives: "Debilitating chronic back pain and kyphosis.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Multiple wormian bones",
    newDiffs: [
      {
        diagnosis: "Down Syndrome (Trisomy 21)",
        dominantImagingFinding: "Wormian bones. Hypoplastic nasal bone. 11 pairs of ribs.",
        distributionLocation: "Skull and axial skeleton.",
        demographicsClinicalContext: "Classic facial features, hypotonia, developmental delay.",
        discriminatingKeyFeature: "DOUBLE BUBBLE sign (duodenal atresia) and ENDOCARDIAL CUSHION defects (AVSD).",
        associatedFindings: "Atlantoaxial instability (increased ADI >5mm). Flared iliac wings.",
        complicationsSeriousAlternatives: "Spinal cord compression from AA subluxation.",
        isCorrectDiagnosis: false
      },
      {
        diagnosis: "Rickets",
        dominantImagingFinding: "Wormian bones and profound osteopenia. Craniotabes (thinning of skull).",
        distributionLocation: "Diffuse. Widened metaphyses at knees/wrists.",
        demographicsClinicalContext: "Infant/Toddler with Vitamin D deficiency. Bowing of legs.",
        discriminatingKeyFeature: "METAPHYSEAL CUPPING and FRAYING (100% specific).",
        associatedFindings: "Rachitic rosary (ribs). Delayed bone age.",
        complicationsSeriousAlternatives: "Permanent bone deformity.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Posterior fossa mass in child",
    newDiffs: [
      {
        diagnosis: "Atypical Teratoid/Rhabdoid Tumour (ATRT)",
        dominantImagingFinding: "Large, aggressive, heterogeneous solid mass. Haemorrhage and necrosis are extremely common.",
        distributionLocation: "Off-midline (Cerebellar hemisphere or CPA) is most common. Can be anywhere in CNS.",
        demographicsClinicalContext: "INFANTS (Peak <3 years old - 100% classic). Highly aggressive.",
        discriminatingKeyFeature: "VERY YOUNG AGE (<3y) and highly aggressive destructive appearance with early leptomeningeal spread.",
        associatedFindings: "Loss of INI1 (SMARCB1) protein expression on pathology. Drop metastases.",
        complicationsSeriousAlternatives: "Rapidly fatal despite aggressive treatment.",
        isCorrectDiagnosis: false
      }
    ]
  },
  {
    pattern: "Large abdominal mass in child",
    newDiffs: [
      {
        diagnosis: "Burkitt Lymphoma",
        dominantImagingFinding: "Bulky, homogeneous, multi-lobulated mesenteric and retroperitoneal masses.",
        distributionLocation: "Bowel wall (terminal ileum) and mesentery. Encases vessels without obstruction (Sandwich sign).",
        demographicsClinicalContext: "Peak age 5-10y. Most common paediatric GI malignancy. Jaw involvement in endemic (African) form.",
        discriminatingKeyFeature: "MASSIVE BOWEL WALL THICKENING causing aneurysmal dilatation and intussusception.",
        associatedFindings: "Rapid growth (doubling time 24h). Ovarian involvement.",
        complicationsSeriousAlternatives: "Tumor Lysis Syndrome during treatment.",
        isCorrectDiagnosis: false
      }
    ]
  }
];

async function main() {
  console.log("Fetching discriminators...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of updates) {
    const disc = discriminators.find((d: any) => d.pattern === update.pattern);
    if (!disc) {
      console.log(`Could not find ${update.pattern}`);
      continue;
    }
    
    const existingDiagnoses = new Set(disc.differentials.map((d: any) => d.diagnosis.toLowerCase()));
    const toAdd = update.newDiffs.filter(d => !existingDiagnoses.has(d.diagnosis.toLowerCase()));
    
    if (toAdd.length > 0) {
      const merged = [...disc.differentials, ...toAdd];
      await client.mutation(api.discriminators.update as any, {
        id: disc._id,
        differentials: merged
      });
      console.log(`✅ Updated ${update.pattern} with ${toAdd.length} new differentials.`);
    } else {
      console.log(`No new differentials needed for ${update.pattern}`);
    }
  }
}

main().catch(console.error);