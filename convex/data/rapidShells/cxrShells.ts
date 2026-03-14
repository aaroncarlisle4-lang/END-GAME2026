// CXR Rapid Shells — ~50 shells grouped by DDx problem type
// Case numbers start at 101 to avoid collision with existing 1-30
export const cxrShells = [
  // ============================================================
  // PACKET 1: Lines, Tubes & Emergency CXR
  // ============================================================

  // --- Subsection: Line/tube malposition ---
  { caseNumber: 101, title: "Right subclavian CVC — tip in right atrium", modality: "CXR AP", diagnosis: "Low-lying CVC — tip in right atrium", difficulty: "core", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 1 },
  { caseNumber: 102, title: "Left PICC line — tip in left subclavian vein", modality: "CXR AP", diagnosis: "Malpositioned PICC — tip in left subclavian vein", difficulty: "core", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 2 },
  { caseNumber: 103, title: "Nasogastric tube — coiled in oesophagus", modality: "CXR AP", diagnosis: "Malpositioned NG tube — coiled in oesophagus, not in stomach", difficulty: "core", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 3 },
  { caseNumber: 104, title: "NG tube in right main bronchus", modality: "CXR AP", diagnosis: "Misplaced NG tube — in right main bronchus", difficulty: "core", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 4 },
  { caseNumber: 105, title: "Chest drain — tip in fissure", modality: "CXR AP", diagnosis: "Suboptimal chest drain position — tip in oblique fissure", difficulty: "intermediate", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 5 },
  { caseNumber: 106, title: "Pacemaker — lead dislodgement", modality: "CXR PA", diagnosis: "Pacemaker lead dislodgement — RV lead retracted into SVC", difficulty: "intermediate", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 6 },
  { caseNumber: 107, title: "Swan-Ganz catheter — too distal", modality: "CXR AP", diagnosis: "Pulmonary artery catheter tip too distal — risk of infarction", difficulty: "intermediate", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 7 },
  { caseNumber: 108, title: "Tracheostomy tube — low position", modality: "CXR AP", diagnosis: "Low-lying tracheostomy tube abutting the carina", difficulty: "core", subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 8 },

  // --- Subsection: Pneumothorax ---
  { caseNumber: 109, title: "Large left pneumothorax", modality: "CXR erect PA", diagnosis: "Large left-sided pneumothorax", difficulty: "core", subsection: "Pneumothorax", parentGroup: "Pleura", packet: 1, packetOrder: 9 },
  { caseNumber: 110, title: "Tension pneumothorax — mediastinal shift", modality: "CXR AP supine", diagnosis: "Right tension pneumothorax with mediastinal shift", difficulty: "core", subsection: "Pneumothorax", parentGroup: "Pleura", packet: 1, packetOrder: 10 },
  { caseNumber: 111, title: "Loculated pneumothorax post chest drain", modality: "CXR AP", diagnosis: "Loculated pneumothorax — persistent after chest drain insertion", difficulty: "intermediate", subsection: "Pneumothorax", parentGroup: "Pleura", packet: 1, packetOrder: 11 },
  { caseNumber: 112, title: "Supine pneumothorax — deep sulcus sign", modality: "CXR AP supine", diagnosis: "Right pneumothorax on supine film — deep sulcus sign", difficulty: "intermediate", subsection: "Pneumothorax", parentGroup: "Pleura", packet: 1, packetOrder: 12 },
  { caseNumber: 113, title: "Pneumomediastinum", modality: "CXR PA", diagnosis: "Pneumomediastinum — continuous diaphragm sign", difficulty: "intermediate", subsection: "Pneumothorax", parentGroup: "Mediastinum", packet: 1, packetOrder: 13 },

  // --- Subsection: Acute aortic syndrome ---
  { caseNumber: 114, title: "Widened mediastinum — aortic dissection", modality: "CXR PA", diagnosis: "Widened mediastinum — urgent CT aortogram for suspected aortic dissection", difficulty: "intermediate", subsection: "Acute aortic syndrome", parentGroup: "Mediastinum", packet: 1, packetOrder: 14 },
  { caseNumber: 115, title: "Traumatic aortic injury — loss of aortic knob", modality: "CXR AP", diagnosis: "Mediastinal widening with loss of aortic knob contour — traumatic aortic injury", difficulty: "advanced", subsection: "Acute aortic syndrome", parentGroup: "Mediastinum", packet: 1, packetOrder: 15 },
  { caseNumber: 116, title: "Aortic aneurysm — tortuous descending aorta", modality: "CXR PA", diagnosis: "Thoracic aortic aneurysm — ectatic descending aorta", difficulty: "intermediate", subsection: "Acute aortic syndrome", parentGroup: "Mediastinum", packet: 1, packetOrder: 16 },

  // --- Subsection: White-out hemithorax ---
  { caseNumber: 117, title: "Massive left pleural effusion", modality: "CXR PA", diagnosis: "Complete left hemithorax opacification — massive pleural effusion with contralateral mediastinal shift", difficulty: "core", subsection: "White-out hemithorax", parentGroup: "Pleura", packet: 1, packetOrder: 17 },
  { caseNumber: 118, title: "Complete left lung collapse", modality: "CXR PA", diagnosis: "Left lung collapse — complete opacification with ipsilateral mediastinal shift", difficulty: "core", subsection: "White-out hemithorax", parentGroup: "Airways", packet: 1, packetOrder: 18 },
  { caseNumber: 119, title: "Post-pneumonectomy — right", modality: "CXR PA", diagnosis: "Right pneumonectomy — opacified right hemithorax with ipsilateral shift, absent right lung markings", difficulty: "intermediate", subsection: "White-out hemithorax", parentGroup: "Post-surgical", packet: 1, packetOrder: 19 },
  { caseNumber: 120, title: "Mesothelioma — encasing effusion", modality: "CXR PA", diagnosis: "Right pleural thickening with effusion and volume loss — mesothelioma", difficulty: "advanced", subsection: "White-out hemithorax", parentGroup: "Pleura", packet: 1, packetOrder: 20 },

  // --- Subsection: Pulmonary oedema ---
  { caseNumber: 121, title: "Acute pulmonary oedema", modality: "CXR AP", diagnosis: "Acute pulmonary oedema — bilateral perihilar bat-wing opacification", difficulty: "core", subsection: "Pulmonary oedema", parentGroup: "Diffuse lung", packet: 1, packetOrder: 21 },
  { caseNumber: 122, title: "Fluid overload — upper lobe diversion", modality: "CXR PA", diagnosis: "Fluid overload with upper lobe pulmonary venous distension and Kerley B lines", difficulty: "core", subsection: "Pulmonary oedema", parentGroup: "Diffuse lung", packet: 1, packetOrder: 22 },
  { caseNumber: 123, title: "Unilateral pulmonary oedema — dependent", modality: "CXR AP", diagnosis: "Unilateral pulmonary oedema — right lung (dependent side)", difficulty: "advanced", subsection: "Pulmonary oedema", parentGroup: "Diffuse lung", packet: 1, packetOrder: 23 },

  // ============================================================
  // PACKET 2: Parenchymal & Mediastinal
  // ============================================================

  // --- Subsection: Consolidation pattern ---
  { caseNumber: 124, title: "Right upper lobe consolidation", modality: "CXR PA and lateral", diagnosis: "Right upper lobe pneumonia", difficulty: "core", subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 1 },
  { caseNumber: 125, title: "Left lower lobe collapse-consolidation", modality: "CXR PA", diagnosis: "Left lower lobe collapse — sail sign behind the heart", difficulty: "core", subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 2 },
  { caseNumber: 126, title: "Right middle lobe consolidation", modality: "CXR PA and lateral", diagnosis: "Right middle lobe pneumonia — loss of right heart border silhouette", difficulty: "core", subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 3 },
  { caseNumber: 127, title: "Round pneumonia — adult", modality: "CXR PA", diagnosis: "Round pneumonia mimicking a lung mass", difficulty: "intermediate", subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 4 },
  { caseNumber: 128, title: "Aspiration pneumonia — right lower lobe", modality: "CXR AP", diagnosis: "Right lower lobe aspiration pneumonia", difficulty: "core", subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 5 },
  { caseNumber: 129, title: "Cavitating pneumonia", modality: "CXR PA", diagnosis: "Cavitating pneumonia — thick-walled cavity with air-fluid level", difficulty: "intermediate", subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 6 },
  { caseNumber: 130, title: "Lingular consolidation", modality: "CXR PA", diagnosis: "Lingular pneumonia — loss of left heart border silhouette", difficulty: "core", subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 7 },

  // --- Subsection: Lobar collapse ---
  { caseNumber: 131, title: "Right upper lobe collapse", modality: "CXR PA", diagnosis: "Right upper lobe collapse — elevated horizontal fissure", difficulty: "core", subsection: "Lobar collapse", parentGroup: "Airways", packet: 2, packetOrder: 8 },
  { caseNumber: 132, title: "Right middle lobe collapse", modality: "CXR PA and lateral", diagnosis: "Right middle lobe collapse — loss of right heart border, wedge on lateral", difficulty: "intermediate", subsection: "Lobar collapse", parentGroup: "Airways", packet: 2, packetOrder: 9 },
  { caseNumber: 133, title: "Left upper lobe collapse — veil sign", modality: "CXR PA", diagnosis: "Left upper lobe collapse — veil sign with luftsichel", difficulty: "intermediate", subsection: "Lobar collapse", parentGroup: "Airways", packet: 2, packetOrder: 10 },

  // --- Subsection: Mediastinal mass ---
  { caseNumber: 134, title: "Anterior mediastinal mass — thymoma", modality: "CXR PA and lateral", diagnosis: "Anterior mediastinal mass — thymoma (4 Ts differential)", difficulty: "intermediate", subsection: "Mediastinal mass", parentGroup: "Mediastinum", packet: 2, packetOrder: 11 },
  { caseNumber: 135, title: "Retrosternal goitre", modality: "CXR PA", diagnosis: "Retrosternal goitre — superior mediastinal mass with tracheal deviation", difficulty: "intermediate", subsection: "Mediastinal mass", parentGroup: "Mediastinum", packet: 2, packetOrder: 12 },
  { caseNumber: 136, title: "Posterior mediastinal mass — neurogenic tumour", modality: "CXR PA and lateral", diagnosis: "Posterior mediastinal mass — schwannoma/neurofibroma", difficulty: "advanced", subsection: "Mediastinal mass", parentGroup: "Mediastinum", packet: 2, packetOrder: 13 },
  { caseNumber: 137, title: "Middle mediastinal lymphadenopathy", modality: "CXR PA", diagnosis: "Middle mediastinal lymphadenopathy — subcarinal and bilateral hilar", difficulty: "intermediate", subsection: "Mediastinal mass", parentGroup: "Mediastinum", packet: 2, packetOrder: 14 },

  // --- Subsection: Bilateral hilar lymphadenopathy ---
  { caseNumber: 138, title: "Bilateral hilar lymphadenopathy — sarcoidosis", modality: "CXR PA", diagnosis: "Bilateral hilar lymphadenopathy — sarcoidosis (Garland triad: 1-2-3 sign)", difficulty: "intermediate", subsection: "Bilateral hilar lymphadenopathy", parentGroup: "Hilum", packet: 2, packetOrder: 15 },
  { caseNumber: 139, title: "Bilateral hilar lymphadenopathy — lymphoma", modality: "CXR PA", diagnosis: "Bilateral hilar and mediastinal lymphadenopathy — lymphoma", difficulty: "intermediate", subsection: "Bilateral hilar lymphadenopathy", parentGroup: "Hilum", packet: 2, packetOrder: 16 },

  // --- Subsection: Post-surgical CXR ---
  { caseNumber: 140, title: "Post-CABG sternotomy", modality: "CXR PA", diagnosis: "Post-CABG — sternotomy wires, mediastinal drains, small bilateral effusions", difficulty: "core", subsection: "Post-surgical CXR", parentGroup: "Post-surgical", packet: 2, packetOrder: 17 },
  { caseNumber: 141, title: "Post-lobectomy — right upper", modality: "CXR PA", diagnosis: "Right upper lobectomy — elevated right hilum with compensatory hyperinflation", difficulty: "intermediate", subsection: "Post-surgical CXR", parentGroup: "Post-surgical", packet: 2, packetOrder: 18 },
  { caseNumber: 142, title: "Post-lung transplant — reimplantation response", modality: "CXR PA", diagnosis: "Bilateral lung transplant with reimplantation response — perihilar oedema", difficulty: "advanced", subsection: "Post-surgical CXR", parentGroup: "Post-surgical", packet: 2, packetOrder: 19 },

  // --- Subsection: Occupational/environmental lung ---
  { caseNumber: 143, title: "Asbestosis — bilateral lower zone fibrosis", modality: "CXR PA", diagnosis: "Asbestosis — bilateral lower zone reticular opacities with pleural plaques", difficulty: "intermediate", subsection: "Occupational lung", parentGroup: "Diffuse lung", packet: 2, packetOrder: 20 },
  { caseNumber: 144, title: "Silicosis — progressive massive fibrosis", modality: "CXR PA", diagnosis: "Silicosis — bilateral upper zone masses (PMF) with eggshell calcification of hilar nodes", difficulty: "advanced", subsection: "Occupational lung", parentGroup: "Diffuse lung", packet: 2, packetOrder: 21 },
  { caseNumber: 145, title: "Pleural plaques — calcified", modality: "CXR PA", diagnosis: "Bilateral calcified diaphragmatic pleural plaques — asbestos exposure", difficulty: "core", subsection: "Occupational lung", parentGroup: "Pleura", packet: 2, packetOrder: 22 },

  // --- Subsection: Lung mass / nodule ---
  { caseNumber: 146, title: "Solitary pulmonary nodule — spiculated", modality: "CXR PA", diagnosis: "Spiculated right upper lobe pulmonary nodule — primary lung malignancy until proven otherwise", difficulty: "intermediate", subsection: "Lung mass/nodule", parentGroup: "Parenchyma", packet: 2, packetOrder: 23 },
  { caseNumber: 147, title: "Pancoast tumour — apical mass with rib destruction", modality: "CXR PA", diagnosis: "Right apical mass with posterior rib destruction — Pancoast tumour", difficulty: "advanced", subsection: "Lung mass/nodule", parentGroup: "Parenchyma", packet: 2, packetOrder: 24 },
  { caseNumber: 148, title: "Cannonball metastases", modality: "CXR PA", diagnosis: "Multiple bilateral well-defined pulmonary nodules — cannonball metastases", difficulty: "intermediate", subsection: "Lung mass/nodule", parentGroup: "Parenchyma", packet: 2, packetOrder: 25 },
  { caseNumber: 149, title: "Miliary pattern", modality: "CXR PA", diagnosis: "Miliary pattern — diffuse 1-3mm nodules throughout both lungs (TB/metastases)", difficulty: "advanced", subsection: "Lung mass/nodule", parentGroup: "Diffuse lung", packet: 2, packetOrder: 26 },

  // --- Subsection: Rib / chest wall ---
  { caseNumber: 150, title: "Multiple rib fractures — flail segment", modality: "CXR PA", diagnosis: "Left-sided flail segment — multiple contiguous rib fractures with underlying contusion", difficulty: "intermediate", subsection: "Rib and chest wall", parentGroup: "Chest wall", packet: 2, packetOrder: 27 },
  { caseNumber: 151, title: "Pathological rib fracture — lytic metastasis", modality: "CXR PA", diagnosis: "Pathological fracture of right 7th rib through lytic metastasis", difficulty: "intermediate", subsection: "Rib and chest wall", parentGroup: "Chest wall", packet: 2, packetOrder: 28 },
];
