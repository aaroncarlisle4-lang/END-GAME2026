import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const BATCH_4_DATA = [
  {
    pattern: "UNILATERAL HYPERTRANSRADIANT HEMITHORAX",
    itemNumber: "4.1",
    problemCluster: "unilateral hyperlucency",
    seriousAlternatives: ["Tension Pneumothorax (URGENT)", "Endobronchial Carcinoma", "Foreign Body Aspiration"],
    differentials: [
      {
        diagnosis: "Swyer-James (Macleod) Syndrome",
        dominantImagingFinding: "SMALL LUNG (100% specific) showing hyperlucency. Small hilum and attenuated pulmonary vessels. No mass effect.",
        distributionLocation: "Unilateral lung or lobe. Contralateral lung is normal or hyperinflated.",
        demographicsClinicalContext: "History of severe childhood viral pneumonia (Adenovirus) or bronchiolitis obliterans. Often asymptomatic in adults.",
        discriminatingKeyFeature: "AIR TRAPPING on expiratory films (100% diagnostic) and a characteristic SMALL HILUM on the lucent side.",
        associatedFindings: "Bronchiectasis on HRCT (60-80%). Normal inspiratory mediastinal position.",
        complicationsSeriousAlternatives: "Recurrent secondary pulmonary infections.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Pneumothorax",
        dominantImagingFinding: "VISCERAL PLEURAL LINE visible. Absolute absence of lung markings (vessels) peripheral to the line.",
        distributionLocation: "Apical (erect) or lateral sulcus (supine). Hemithorax volume may be normal or increased.",
        demographicsClinicalContext: "Acute onset pleuritic pain and dyspnoea. Young tall males (Primary) or elderly with COPD (Secondary).",
        discriminatingKeyFeature: "VISIBLE PLEURAL LINE and peripheral lucency devoid of any lung structure. Unlike bullae, it follows the chest wall contour.",
        associatedFindings: "Mediastinal shift AWAY from the lucent side (suggests TENSION - EMERGENCY).",
        complicationsSeriousAlternatives: "Tension pneumothorax causing cardiac arrest.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Mastectomy",
        dominantImagingFinding: "Unilateral hyperlucency due to reduced soft tissue density. Lung markings are perfectly normal.",
        distributionLocation: "Entire hemithorax field.",
        demographicsClinicalContext: "Prior history of breast cancer surgery. Visible surgical scar.",
        discriminatingKeyFeature: "ABSENT AXILLARY FOLD and loss of the inferior breast contour. Normal pulmonary vascularity and no air trapping.",
        associatedFindings: "Surgical clips in the axilla or chest wall.",
        complicationsSeriousAlternatives: "Recurrence of malignancy.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Endobronchial Obstruction (Check-valve)",
        dominantImagingFinding: "Unilateral hyperlucency due to air-trapping. The lung may appear normal or slightly increased in volume.",
        distributionLocation: "Lobar or whole lung depending on the site of obstruction.",
        demographicsClinicalContext: "Adult smoker (Bronchogenic CA) or Child (Foreign body aspiration).",
        discriminatingKeyFeature: "EXPIRATORY MEDIASTINAL SHIFT away from the lucent side. The obstructed side fails to deflate on expiration.",
        associatedFindings: "Visible endobronchial lesion or mucus plug on CT.",
        complicationsSeriousAlternatives: "Complete lung collapse or post-obstructive pneumonia.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "INCREASED DENSITY OF ONE HEMITHORAX",
    itemNumber: "4.4",
    problemCluster: "opaque hemithorax",
    seriousAlternatives: ["Massive Pleural Effusion", "Total Lung Collapse", "Pneumonectomy"],
    differentials: [
      {
        diagnosis: "Massive Pleural Effusion",
        dominantImagingFinding: "Dense, homogeneous opacification of the hemithorax. Classic meniscus sign if not completely full.",
        distributionLocation: "Pleural space. Unilateral.",
        demographicsClinicalContext: "Malignancy (Breast, Lung), severe infection (Empyema), or Congestive Heart Failure.",
        discriminatingKeyFeature: "MEDIASTINAL SHIFT AWAY from the side of the density. Displacement of the heart and trachea to the contralateral side.",
        associatedFindings: "Loss of the diaphragmatic contour and blunting of the costophrenic angle.",
        complicationsSeriousAlternatives: "Respiratory compromise and underlying malignancy.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Total Lung Collapse (Atelectasis)",
        dominantImagingFinding: "Homogeneous opacification associated with PROFOUND volume loss.",
        distributionLocation: "Lobar or whole lung.",
        demographicsClinicalContext: "Endobronchial obstruction (Bronchogenic carcinoma in adults, Mucus plug in ventilated patients).",
        discriminatingKeyFeature: "MEDIASTINAL SHIFT TOWARDS the side of the density. Crowding of ribs and elevation of the ipsilateral diaphragm.",
        associatedFindings: "Golden S sign if RUL collapse due to a central mass.",
        complicationsSeriousAlternatives: "Post-obstructive pneumonia and sepsis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pneumonectomy",
        dominantImagingFinding: "Opaque hemithorax with extreme volume loss. Often shows architectural evidence of surgery.",
        distributionLocation: "Unilateral.",
        demographicsClinicalContext: "History of lung cancer or severe chronic infection (TB).",
        discriminatingKeyFeature: "SURGICAL CLIPS at the hilum and RESECTED RIBS (usually 5th or 6th). Mediastinal shift is extreme.",
        associatedFindings: "Herniation of the normal contralateral lung across the midline.",
        complicationsSeriousAlternatives: "Bronchopleural fistula (suggested by new air-fluid level).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Diaphragmatic Rupture",
        dominantImagingFinding: "Mixed density in the hemithorax (air and soft tissue) representing herniated abdominal contents.",
        distributionLocation: "Usually LEFT side (80-90%).",
        demographicsClinicalContext: "Severe blunt or penetrating trauma (MVA).",
        discriminatingKeyFeature: "BOWEL LOOPS or STOMACH visible in the chest. Nasogastric tube tip seen above the diaphragm level.",
        associatedFindings: "Associated rib fractures and splenic/liver injury.",
        complicationsSeriousAlternatives: "Bowel strangulation (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "PNEUMOPERITONEUM",
    itemNumber: "6.1",
    problemCluster: "free gas",
    seriousAlternatives: ["Perforated Peptic Ulcer (URGENT)", "Perforated Sigmoid Diverticulitis", "Ischaemic Bowel Perforation"],
    differentials: [
      {
        diagnosis: "Perforated Peptic Ulcer",
        dominantImagingFinding: "LARGE VOLUME free gas. RIGLER SIGN (100% specific on supine AXR) where both sides of the bowel wall are visible.",
        distributionLocation: "Subdiaphragmatic (Erect CXR) or Anterior (Supine AXR - Football sign).",
        demographicsClinicalContext: "Acute onset 'board-like' rigid abdomen. History of NSAID, steroid use, or known PUD.",
        discriminatingKeyFeature: "LARGE VOLUME of gas and associated fluid in MORRISON'S POUCH. Focal wall thickening of the duodenum/stomach.",
        associatedFindings: "Falciform ligament sign (outlined by gas).",
        complicationsSeriousAlternatives: "Septic peritonitis and multi-organ failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Perforated Diverticulitis",
        dominantImagingFinding: "FOCAL BUBBLES of extraluminal gas adjacent to a thick-walled colonic segment.",
        distributionLocation: "Left Lower Quadrant / Pelvis (Sigmoid colon).",
        demographicsClinicalContext: "Elderly patients with chronic constipation. Presents with LIF pain and fever.",
        discriminatingKeyFeature: "SMALL VOLUME of gas localized to the sigmoid. Presence of diverticula and pericolic fat stranding.",
        associatedFindings: "Pelvic abscess or inflammatory phlegmon.",
        complicationsSeriousAlternatives: "Faecal peritonitis (high mortality).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Post-Operative Gas",
        dominantImagingFinding: "Varying volumes of free gas. Characteristically DECREASES on serial imaging.",
        distributionLocation: "Anterior abdomen.",
        demographicsClinicalContext: "Prior Laparotomy or Laparoscopy within the last 7-10 days.",
        discriminatingKeyFeature: "STABLE or decreasing volume over time without clinical signs of peritonitis. Presence of surgical clips/drains.",
        associatedFindings: "Anastomotic site clips.",
        complicationsSeriousAlternatives: "Anastomotic leak (if gas increases or new fluid appears).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "G ASLESS ABDOMEN",
    itemNumber: "6.2",
    problemCluster: "absent bowel gas",
    seriousAlternatives: ["High Small Bowel Obstruction", "Acute Pancreatitis", "Massive Ascites"],
    differentials: [
      {
        diagnosis: "High Small Bowel Obstruction",
        dominantImagingFinding: "Minimal or absent gas in the distal small and large bowel. Stomach and proximal duodenum are often dilated.",
        distributionLocation: "Proximal to the Ligament of Treitz or early jejunum.",
        demographicsClinicalContext: "Profuse vomiting (bilious or non-bilious). Minimal abdominal distension on exam.",
        discriminatingKeyFeature: "ISOLATED GASTRIC DISTENSION and lack of distal gas. Transition point is very proximal.",
        associatedFindings: "Fluid-filled loops on US or CT.",
        complicationsSeriousAlternatives: "Severe dehydration and electrolyte imbalance.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acute Pancreatitis (Severe)",
        dominantImagingFinding: "Diffuse lack of gas ('Opaque' abdomen) due to widespread inflammatory fluid/exudate.",
        distributionLocation: "Generalised or focused in the epigastrium.",
        demographicsClinicalContext: "Alcohol abuse or gallstones. Severe epigastric pain radiating to the back. High lipase.",
        discriminatingKeyFeature: "SENTINEL LOOP (focal ileus of a jejunal loop) and COLON CUT-OFF SIGN (gas ending abruptly at the splenic flexure).",
        associatedFindings: "Peripancreatic fluid and pancreatic necrosis on CT.",
        complicationsSeriousAlternatives: "Necrotising pancreatitis and pseudocyst formation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Massive Ascites",
        dominantImagingFinding: "Diffuse increased density. Bowel loops are displaced centrally and grouped together.",
        distributionLocation: "Flanks and pelvis (Dog-ear sign).",
        demographicsClinicalContext: "Cirrhosis (portal HTN), heart failure, or peritoneal carcinomatosis.",
        discriminatingKeyFeature: "BULGING FLANKS and medial displacement of the ascending/descending colon (Hellmer's Sign).",
        associatedFindings: "Loss of the psoas shadow and hepatic angle.",
        complicationsSeriousAlternatives: "Spontaneous bacterial peritonitis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "OESOPHAGEAL ULCERATION",
    itemNumber: "6.4",
    problemCluster: "oesophageal ulcers",
    seriousAlternatives: ["CMV Oesophagitis", "HSV Oesophagitis", "Candida Oesophagitis", "Reflux"],
    differentials: [
      {
        diagnosis: "CMV Oesophagitis",
        dominantImagingFinding: "LARGE, flat, superficial ulcers. Can be ovoid or linear. Background mucosa is often normal.",
        distributionLocation: "Mid-to-distal oesophagus.",
        demographicsClinicalContext: "Immunocompromised (HIV with CD4 <50, post-transplant). Severe odynophagia.",
        discriminatingKeyFeature: "GIANT shallow ulcers (>1-2cm). In HIV, these are the most common cause of giant ulcers.",
        associatedFindings: "CMV Colitis or Retinitis.",
        complicationsSeriousAlternatives: "Perforation or massive haemorrhage.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Herpes Simplex (HSV) Oesophagitis",
        dominantImagingFinding: "Multiple small, discrete, punched-out ulcers. Often targetoid with a radiolucent halo ('VOLCANO ULCERS').",
        distributionLocation: "Diffuse or segmental.",
        demographicsClinicalContext: "Immunocompromised or debilitated patients.",
        discriminatingKeyFeature: "SMALL PUNCHED-OUT ulcers on a normal background. Unlike CMV, these are typically small (<1cm).",
        associatedFindings: "Concurrent oral/labial herpes.",
        complicationsSeriousAlternatives: "Disseminated HSV infection.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Candida Oesophagitis",
        dominantImagingFinding: "SHAGGY, irregular mucosa. Numerous longitudinal plaques and tiny ulcers giving a 'COBBLESTONE' appearance.",
        distributionLocation: "Diffuse involvement.",
        demographicsClinicalContext: "HIV (CD4 <200), diabetes, or inhaled steroid use.",
        discriminatingKeyFeature: "SHAGGY appearance (due to pseudomembranes). Lacks the discrete large ulcers of viral causes.",
        associatedFindings: "Oral thrush (90%).",
        complicationsSeriousAlternatives: "Long-term stricture formation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Reflux Oesophagitis",
        dominantImagingFinding: "Fine mucosal granularity progressing to deep ulceration and stricture.",
        distributionLocation: "Distal third, starting exactly at the Gastro-oesophageal Junction (GOJ).",
        demographicsClinicalContext: "Chronic heartburn and acid regurgitation. Hiatus hernia.",
        discriminatingKeyFeature: "CONTIGUITY with the GOJ. Viral ulcers are often separated from the junction by normal mucosa.",
        associatedFindings: "Hiatus hernia and Barrett's Oesophagus (reticular mucosal pattern).",
        complicationsSeriousAlternatives: "Adenocarcinoma transformation.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "RIGHT VENTRICULAR ENLARGEMENT",
    itemNumber: "5.3",
    problemCluster: "right heart enlargement",
    seriousAlternatives: ["Pulmonary Hypertension", "Tricuspid Regurgitation", "ASD"],
    differentials: [
      {
        diagnosis: "Pulmonary Hypertension (PAH)",
        dominantImagingFinding: "Prominent central pulmonary arteries with rapid peripheral pruning. RV enlargement (apex lifted).",
        distributionLocation: "Central pulmonary trunk and proximal arteries.",
        demographicsClinicalContext: "COPD, chronic PE (CTEPH), or primary PAH. Progressive dyspnoea.",
        discriminatingKeyFeature: "PRUNING: Large central vessels and small peripheral vessels. RA and RV enlargement.",
        associatedFindings: "Right-sided heart failure (distended IVC/SVC).",
        complicationsSeriousAlternatives: "Cor pulmonale.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Atrial Septal Defect (ASD)",
        dominantImagingFinding: "RV and RA enlargement with INCREASED pulmonary vascularity (Plethora). Small Aorta.",
        distributionLocation: "Global pulmonary plethora.",
        demographicsClinicalContext: "Often asymptomatic until adulthood. Fixed split S2 murmur.",
        discriminatingKeyFeature: "PLETHORA: Peripheral vessels are enlarged (unlike PAH pruning). Small aortic knob.",
        associatedFindings: "Enlarged pulmonary trunk.",
        complicationsSeriousAlternatives: "Eisenmenger syndrome (Late).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Tricuspid Regurgitation",
        dominantImagingFinding: "Massive RA and RV enlargement. Distended SVC/IVC and pulsatile liver.",
        distributionLocation: "Right heart focus.",
        demographicsClinicalContext: "Secondary to RV failure or endocarditis (IVDU).",
        discriminatingKeyFeature: "MASSIVE RA: The right heart border is extremely prominent. Contrast reflux into hepatic veins on CT.",
        associatedFindings: "Pleural effusions and ascites.",
        complicationsSeriousAlternatives: "Refractory right heart failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "AORTIC ARCH ANOMALIES",
    itemNumber: "5.14",
    problemCluster: "arch variants",
    seriousAlternatives: ["Right Aortic Arch", "Double Aortic Arch", "Aberrant Right Subclavian"],
    differentials: [
      {
        diagnosis: "Right Aortic Arch (Mirror Image)",
        dominantImagingFinding: "Aortic arch and knob on the RIGHT side. Indents the right side of the trachea.",
        distributionLocation: "Right-sided arch.",
        demographicsClinicalContext: "High association with Cyanotic Heart Disease (Tetralogy 25%, Truncus 35%).",
        discriminatingKeyFeature: "MIRROR IMAGE: The vessels arise in reverse order. Usually forms a vascular ring with a left ligamentum arteriosum.",
        associatedFindings: "Cyanotic CHD.",
        complicationsSeriousAlternatives: "Tracheo-oesophageal compression.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Double Aortic Arch",
        dominantImagingFinding: "Arch splits into two branches that encircle the trachea and oesophagus.",
        distributionLocation: "Bilateral arch components.",
        demographicsClinicalContext: "Infants with stridor and dysphagia ('Dysphagia Lusoria').",
        discriminatingKeyFeature: "VASCULAR RING: Most common symptomatic vascular ring. The right arch is usually higher and larger than the left.",
        associatedFindings: "Bilateral indentations on barium swallow.",
        complicationsSeriousAlternatives: "Life-threatening stridor.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Aberrant Right Subclavian Artery",
        dominantImagingFinding: "Artery arises as the last branch of a normal left arch and crosses behind the oesophagus.",
        distributionLocation: "Retro-oesophageal.",
        demographicsClinicalContext: "Common variant (1%). Usually asymptomatic.",
        discriminatingKeyFeature: "BAYONET SIGN: Olique posterior indentation on the oesophagus on lateral view. Diverticulum of Kommerell at origin.",
        associatedFindings: "Diverticulum of Kommerell.",
        complicationsSeriousAlternatives: "Dysphagia lusoria.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "G AS IN THE PORTAL VEINS",
    itemNumber: "7.5",
    problemCluster: "portal gas",
    seriousAlternatives: ["Mesenteric Ischaemia (Adult)", "Necrotising Enterocolitis (Neonate)", "Pneumobilia (Mimic)"],
    differentials: [
      {
        diagnosis: "Acute Mesenteric Ischaemia",
        dominantImagingFinding: "Branching gas lucencies extending to the PERIPHERY of the liver (within 2cm of the capsule).",
        distributionLocation: "Peripheral liver (Portal flow carries gas to the edge).",
        demographicsClinicalContext: "Adults with AF, vascular disease, or sudden severe pain. High mortality.",
        discriminatingKeyFeature: "PERIPHERAL distribution and associated PNEUMATOSIS INTESTINALIS (bowel wall gas). Highly URGENT.",
        associatedFindings: "Mesenteric venous/arterial thrombus and thickened bowel wall.",
        complicationsSeriousAlternatives: "Bowel gangrene and death.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Necrotising Enterocolitis (NEC)",
        dominantImagingFinding: "Portal venous gas in a premature infant. Bubbly or linear bowel wall gas.",
        distributionLocation: "Liver periphery and bowel wall.",
        demographicsClinicalContext: "Premature neonates with distended abdomen and sepsis.",
        discriminatingKeyFeature: "NEONATAL context and associated NEC signs. Portal gas is a marker of severe disease (Stage III).",
        associatedFindings: "Pneumoperitoneum.",
        complicationsSeriousAlternatives: "Perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Pneumobilia (Mimic)",
        dominantImagingFinding: "Branching gas lucencies in the liver, characteristically CENTRAL.",
        distributionLocation: "Central liver (Hilar region). Near the porta hepatis.",
        demographicsClinicalContext: "Prior ERCP, sphincterotomy, or gallstone ileus.",
        discriminatingKeyFeature: "CENTRAL distribution: Bile flow is centrifugal, so gas stays central. Lacks pneumatosis intestinalis.",
        associatedFindings: "Gallstone ileus (SBO + stone).",
        complicationsSeriousAlternatives: "None (usually iatrogenic).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "R ENAL CYSTIC DISEASE",
    itemNumber: "7.14",
    problemCluster: "multiple renal cysts",
    seriousAlternatives: ["ADPKD", "Acquired Cystic Disease (Dialysis)", "Von Hippel-Lindau"],
    differentials: [
      {
        diagnosis: "Autosomal Dominant Polycystic Kidney Disease (ADPKD)",
        dominantImagingFinding: "MASSIVELY ENLARGED kidneys bilaterally, replaced by innumerable cysts of varying sizes.",
        distributionLocation: "Bilateral. Entire parenchyma.",
        demographicsClinicalContext: "Adults (30-50y). Family history of renal failure. Hypertension.",
        discriminatingKeyFeature: "MASSIVE RENAL ENLARGEMENT and presence of LIVER CYSTS (70%). Progressive.",
        associatedFindings: "Berry aneurysms (Circle of Willis) and pancreatic cysts.",
        complicationsSeriousAlternatives: "Haemorrhage into cysts and renal failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Acquired Cystic Kidney Disease (ACKD)",
        dominantImagingFinding: "Multiple small cysts in SMALL, ATROPHIC kidneys.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Patients on chronic DIALYSIS (>3 years).",
        discriminatingKeyFeature: "SMALL ATROPHIC kidneys. ADPKD always has large kidneys. Dialysis history is key.",
        associatedFindings: "Increased risk of Renal Cell Carcinoma (100x).",
        complicationsSeriousAlternatives: "RCC transformation (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Von Hippel-Lindau (VHL) Syndrome",
        dominantImagingFinding: "Simple renal cysts and solid enhancing RENAL CELL CARCINOMAS.",
        distributionLocation: "Bilateral.",
        demographicsClinicalContext: "Young adults. AD inheritance.",
        discriminatingKeyFeature: "ASSOCIATED NEOPLASMS: Pancreatic neuroendocrine tumors and CNS haemangioblastomas.",
        associatedFindings: "Phaeochromocytoma.",
        complicationsSeriousAlternatives: "Metastatic RCC.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "VENOUS INFARCTS",
    itemNumber: "10.2",
    problemCluster: "dural sinus thrombosis",
    seriousAlternatives: ["Superior Sagittal Sinus Thrombosis", "Deep Venous Thrombosis (Internal Cerebral)", "Arterial Infarct (Mimic)"],
    differentials: [
      {
        diagnosis: "Superior Sagittal Sinus Thrombosis",
        dominantImagingFinding: "Oedema and haemorrhage characteristically involving the PARASAGITTAL cortex. Often bilateral.",
        distributionLocation: "Bilateral parasagittal frontal and parietal lobes. Crossing arterial territories.",
        demographicsClinicalContext: "Pregnancy, dehydration, hypercoagulable states, or local infection.",
        discriminatingKeyFeature: "EMPTY DELTA SIGN: Triangular filling defect in the posterior sagittal sinus on contrast CT/MRI.",
        associatedFindings: "Dense sinus sign on non-contrast CT.",
        complicationsSeriousAlternatives: "Herniation from massive haemorrhagic transform.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Deep Venous Thrombosis",
        dominantImagingFinding: "Bilateral THALAMIC oedema and haemorrhage. Expansion of the thalami.",
        distributionLocation: "Bilateral Thalami and Basal Ganglia.",
        demographicsClinicalContext: "Severe dehydration or oral contraceptive pill (OCP) use.",
        discriminatingKeyFeature: "BILATERAL THALAMIC involvement. Arterial infarct (top-of-basilar) is a key mimic but venous is usually more haemorrhagic.",
        associatedFindings: "Internal cerebral vein thrombus.",
        complicationsSeriousAlternatives: "Coma and death.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Transverse Sinus Thrombosis",
        dominantImagingFinding: "Haemorrhagic infarct in the TEMPORAL LOBE. Mimics HSV encephalitis.",
        distributionLocation: "Unilateral temporal or occipital lobe.",
        demographicsClinicalContext: "Associated with Mastoiditis or Otitis Media.",
        discriminatingKeyFeature: "UNILATERAL TEMPORAL haemorrhage and filling defect in the transverse/sigmoid sinus.",
        associatedFindings: "Mastoid air cell opacification.",
        complicationsSeriousAlternatives: "Septic thrombosis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "L UCENT BONE LESION IN THE",
    itemNumber: "1.12",
    problemCluster: "medullary lucency",
    seriousAlternatives: ["Lytic Metastasis", "Multiple Myeloma", "Osteomyelitis"],
    differentials: [
      {
        diagnosis: "Lytic Metastasis",
        dominantImagingFinding: "Ill-defined, moth-eaten or permeative bone destruction. Cortical destruction. No sclerotic rim.",
        distributionLocation: "Axial skeleton and proximal appendicular. Characteristically involves the pedicles.",
        demographicsClinicalContext: "Adults >50y. Known primary: Lung, Kidney, Thyroid.",
        discriminatingKeyFeature: "PEDICLE DESTRUCTION and absence of a sclerotic margin. Often multiple and disparate.",
        associatedFindings: "Pathological fracture. High T2 signal on MRI.",
        complicationsSeriousAlternatives: "Cord compression or skeletal collapse.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Multiple Myeloma",
        dominantImagingFinding: "Multiple small, sharply defined 'PUNCHED-OUT' lucencies. Uniform size.",
        distributionLocation: "Skull, Spine, and Pelvis. CHARACTERISTICALLY SPARES THE PEDICLES early on.",
        demographicsClinicalContext: "Elderly patients. Bence-Jones protein in urine. Anaemia and bone pain.",
        discriminatingKeyFeature: "PUNCHED-OUT lesions and PEDICLE SPARING. COLD on bone scan (70%).",
        associatedFindings: "Raindrop skull and diffuse osteopenia.",
        complicationsSeriousAlternatives: "Renal failure and amyloidosis.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Fibrous Dysplasia",
        dominantImagingFinding: "GROUND-GLASS matrix. Well-defined lesion with a thick sclerotic 'RIND' sign.",
        distributionLocation: "Long bones (Femur/Tibia), Ribs, and Skull.",
        demographicsClinicalContext: "Young adults. Often incidental. Associated with McCune-Albright (Skin/Endocrine).",
        discriminatingKeyFeature: "GROUND-GLASS matrix and RIND sign. No periosteal reaction unless fractured.",
        associatedFindings: "Shepherd's crook deformity of the femur.",
        complicationsSeriousAlternatives: "Sarcomatous transformation (<1%).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Simple Bone Cyst (SBC)",
        dominantImagingFinding: "Well-defined, central, geographic lucency. Does not exceed the width of the growth plate.",
        distributionLocation: "Proximal Humerus (50%) or Proximal Femur. Metadiaphysis.",
        demographicsClinicalContext: "Children/Adolescents. Often found after pathological fracture.",
        discriminatingKeyFeature: "FALLEN FRAGMENT SIGN: A cortical fragment sinks to the bottom of the fluid-filled cyst after fracture. PATHOGNOMONIC.",
        associatedFindings: "Central location (unlike ABC which is eccentric).",
        complicationsSeriousAlternatives: "Recurrent fractures.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "INTESTINAL OBSTRUCTION IN A NEONATE",
    itemNumber: "14.47",
    problemCluster: "neonatal bowel obstruction",
    seriousAlternatives: ["Malrotation with Volvulus (URGENT)", "Hirschsprung Disease", "Meconium Ileus"],
    differentials: [
      {
        diagnosis: "Midgut Volvulus",
        dominantImagingFinding: "Gasless abdomen or isolated gastric distension. CORKSCREW appearance of the distal duodenum.",
        distributionLocation: "Midgut (centered on the SMA).",
        demographicsClinicalContext: "Neonate with sudden onset BILE-STAINED vomiting. Surgical emergency.",
        discriminatingKeyFeature: "WHIRLPOOL SIGN on Doppler US: SMA and SMV are twisted. DJ flexure is displaced to the right.",
        associatedFindings: "Right-sided caecum (Malrotation).",
        complicationsSeriousAlternatives: "Bowel gangrene and death (FATAL within hours).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hirschsprung Disease",
        dominantImagingFinding: "Multiple dilated loops of bowel. Low bowel obstruction.",
        distributionLocation: "Rectosigmoid (80%) or long segment.",
        demographicsClinicalContext: "Neonate with failure to pass meconium within 48 hours. Distended abdomen.",
        discriminatingKeyFeature: "RECTOSIGMOID RATIO <1: The rectum is narrower than the sigmoid on contrast enema. Sawtooth mucosal irregularitiy.",
        associatedFindings: "Delayed clearance of contrast (>24h).",
        complicationsSeriousAlternatives: "Hirschsprung enterocolitis (URGENT).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Meconium Ileus",
        dominantImagingFinding: "Distended small bowel loops without air-fluid levels. BUBBLY (Soap-bubble) appearance in the RLQ.",
        distributionLocation: "Distal ileum.",
        demographicsClinicalContext: "Neonate with CYSTIC FIBROSIS (90%). Neuhauser sign (bubbly meconium).",
        discriminatingKeyFeature: "SOAP-BUBBLE appearance and MICROCOLON on contrast enema. Gastrografin enema is often therapeutic.",
        associatedFindings: "Family history of CF.",
        complicationsSeriousAlternatives: "Meconium peritonitis (calcifications).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Duodenal Atresia",
        dominantImagingFinding: "DOUBLE BUBBLE sign (Gas in stomach and first part of duodenum). No distal gas.",
        distributionLocation: "Duodenum.",
        demographicsClinicalContext: "Neonates. Associated with DOWN SYNDROME (30%).",
        discriminatingKeyFeature: "DOUBLE BUBBLE and absolute lack of distal gas. Prenatal polyhydramnios.",
        associatedFindings: "Annular pancreas.",
        complicationsSeriousAlternatives: "Aspiration.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "A DRENAL MASS IN CHILDHOOD",
    itemNumber: "14.50",
    problemCluster: "paediatric adrenal mass",
    seriousAlternatives: ["Neuroblastoma", "Adrenal Haemorrhage", "Ganglioneuroblastoma"],
    differentials: [
      {
        diagnosis: "Neuroblastoma",
        dominantImagingFinding: "Large, irregular solid mass with CALCIFICATION (90%). CROSSES THE MIDLINE.",
        distributionLocation: "Adrenal gland / Retroperitoneum.",
        demographicsClinicalContext: "Infants and young children (<2y). High VMA/HVA in urine.",
        discriminatingKeyFeature: "MIDLINE CROSSING and vessel encasement. Displaces the kidney inferiorly and laterally.",
        associatedFindings: "Opsoclonus-myoclonus and Raccoon eyes (Orbital mets).",
        complicationsSeriousAlternatives: "Metastatic bone marrow spread.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Adrenal Haemorrhage",
        dominantImagingFinding: "Ovoid, non-enhancing mass. Becomes progressively smaller and more cystic on follow-up.",
        distributionLocation: "Adrenal gland. Often bilateral.",
        demographicsClinicalContext: "Neonates post-traumatic delivery or sepsis. Scrotal bruising.",
        discriminatingKeyFeature: "RAPID DECREASE IN SIZE: Neuroblastoma grows; haemorrhage shrinks and may calcify peripherally over weeks.",
        associatedFindings: "Normal VMA/HVA. Jaundice.",
        complicationsSeriousAlternatives: "Adrenal insufficiency (if bilateral).",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Ganglioneuroma",
        dominantImagingFinding: "Well-circumscribed, vertically elongated mass. Minimal or no calcification.",
        distributionLocation: "Paravertebral region.",
        demographicsClinicalContext: "Older children and adolescents. Often asymptomatic.",
        discriminatingKeyFeature: "OLDER AGE and benign biological behavior. Does not encase vessels aggressively like neuroblastoma.",
        associatedFindings: "Extension through the neural foramina.",
        complicationsSeriousAlternatives: "Mass effect on adjacent structures.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "B ILATERAL HYPERTRANSRADIANT HEMITHORACES",
    itemNumber: "4.2",
    problemCluster: "bilateral hyperlucency",
    seriousAlternatives: ["Emphysema (COPD)", "Acute Asthma", "Bilateral Pneumothoraces"],
    differentials: [
      {
        diagnosis: "Emphysema",
        dominantImagingFinding: "Hyperinflation (Flat diaphragms below 10th posterior rib). Attenuated vascular markings.",
        distributionLocation: "Upper lobes (Centrilobular) or Lower lobes (Panacinar).",
        demographicsClinicalContext: "Older adults. Heavy smoking history or Alpha-1 Antitrypsin deficiency.",
        discriminatingKeyFeature: "MACROSCOPIC TISSUE DESTRUCTION (Bullae) and increased retrosternal airspace (>2.5cm).",
        associatedFindings: "Saber-sheath trachea and pulmonary hypertension.",
        complicationsSeriousAlternatives: "Cor pulmonale.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Asthma (Acute)",
        dominantImagingFinding: "Hyperinflation without destruction of the lung parenchyma. Normal vascular markings.",
        distributionLocation: "Diffuse and symmetric.",
        demographicsClinicalContext: "Children or young adults. Acute wheeze and dyspnoea.",
        discriminatingKeyFeature: "NORMAL PULMONARY VASCULARITY and lack of bullae. Bronchial wall thickening.",
        associatedFindings: "Mucus plugging and dynamic hyperinflation.",
        complicationsSeriousAlternatives: "Status Asthmaticus.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Bronchiolitis Obliterans",
        dominantImagingFinding: "Mosaic attenuation on CT. Hyperlucency due to air trapping.",
        distributionLocation: "Diffuse or geographic.",
        demographicsClinicalContext: "Post-infectious (Children) or post-transplant (GVHD).",
        discriminatingKeyFeature: "AIR TRAPPING on expiratory CT. Small lungs or normal lungs with mosaic perfusion.",
        associatedFindings: "Small hilar vessels.",
        complicationsSeriousAlternatives: "Respiratory failure.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "EROSIONS OF THE MEDIAL METAPHYSIS OF THE PROXIMAL HUMERUS",
    itemNumber: "1.31",
    problemCluster: "proximal humerus erosion",
    seriousAlternatives: ["Hyperparathyroidism", "Leukaemia (Child)", "Normal Variant (Mimic)"],
    differentials: [
      {
        diagnosis: "Leukaemia (Paediatric)",
        dominantImagingFinding: "Metaphyseal lucent bands and focal cortical erosions. Symmetric.",
        distributionLocation: "Proximal humerus, distal femur, proximal tibia.",
        demographicsClinicalContext: "Children (2-5y). Bone pain, pallor, and bruising.",
        discriminatingKeyFeature: "METAPHYSEAL LUCENT BANDS: A classic early sign of childhood ALL. Associated with systemic symptoms.",
        associatedFindings: "Hepatosplenomegaly and generalized lymphadenopathy.",
        complicationsSeriousAlternatives: "Marrow failure.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Hyperparathyroidism",
        dominantImagingFinding: "Subperiosteal resorption of the medial humeral neck. Aggressive-looking erosion.",
        distributionLocation: "Medial metaphysis. Often bilateral.",
        demographicsClinicalContext: "Renal failure patients. High PTH.",
        discriminatingKeyFeature: "SUBPERIOSTEAL RESORPTION in the hands (Middle phalanges) and Salt-and-pepper skull.",
        associatedFindings: "Brown tumors.",
        complicationsSeriousAlternatives: "Fracture.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Physiological Subarticular Lucency (Mimic)",
        dominantImagingFinding: "Apparent lucency at the site of the anatomical neck insertion. Normal cortex.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Adolescents. Asymptomatic.",
        discriminatingKeyFeature: "NORMAL CORTEX: The trabeculae are sparse but the cortical margin is intact. Lacks the bands of leukaemia.",
        associatedFindings: "None.",
        complicationsSeriousAlternatives: "None.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  },
  {
    pattern: "ENLARGED OPTIC FORAMEN",
    itemNumber: "11.5",
    problemCluster: "optic canal widening",
    seriousAlternatives: ["Optic Nerve Glioma (NF1)", "Optic Nerve Meningioma", "Orbital Haemangioma"],
    differentials: [
      {
        diagnosis: "Optic Nerve Glioma (Pilocytic)",
        dominantImagingFinding: "Fusiform enlargement of the optic nerve. Often associated with optic canal widening (>7mm).",
        distributionLocation: "Optic nerve and foramen.",
        demographicsClinicalContext: "Children (<10y). Strong association with NEUROFIBROMATOSIS TYPE 1 (25-50%).",
        discriminatingKeyFeature: "FUSIFORM ENLARGEMENT and association with NF1. Low grade (Pilocytic astrocytoma).",
        associatedFindings: "Kinking of the optic nerve. Intracranial extension to the chiasm.",
        complicationsSeriousAlternatives: "Vision loss.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Optic Nerve Sheath Meningioma",
        dominantImagingFinding: "TRAM-TRACK CALCIFICATION along the optic nerve. Tubular enhancement.",
        distributionLocation: "Optic nerve sheath.",
        demographicsClinicalContext: "Middle-aged females. Progressive vision loss.",
        discriminatingKeyFeature: "TRAM-TRACK SIGN on axial imaging (calcified/enhancing sheath with non-enhancing nerve).",
        associatedFindings: "Orbital hyperostosis.",
        complicationsSeriousAlternatives: "Blindness.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Intracranial Aneurysm (Ophthalmic)",
        dominantImagingFinding: "Smooth widening of the optic foramen by a pulsatile mass.",
        distributionLocation: "Apex of the orbit.",
        demographicsClinicalContext: "Adults. Sudden onset deficit.",
        discriminatingKeyFeature: "VASCULAR flow on MRA/CTA. Smooth bony remodeling.",
        associatedFindings: "Subarachnoid haemorrhage risk.",
        complicationsSeriousAlternatives: "Rupture (FATAL).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      }
    ]
  }
];

async function main() {
  console.log("Authoring GOLD STANDARD Batch 4 (20 items)...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of BATCH_4_DATA) {
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
  console.log("Batch 4 Complete!");
}

main().catch(console.error);