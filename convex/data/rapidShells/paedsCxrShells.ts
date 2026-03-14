// Paeds-CXR Rapid Shells — ~40 shells grouped by DDx problem type
// Case numbers start at 301
export const paedsCxrShells = [
  // ============================================================
  // PACKET 1: Neonatal Respiratory & Congenital Thoracic
  // ============================================================

  // --- Subsection: Neonatal respiratory distress ---
  { caseNumber: 301, title: "RDS (surfactant deficiency) — Grade I", modality: "Neonatal CXR AP", diagnosis: "Respiratory distress syndrome Grade I — bilateral granular opacification", difficulty: "core", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 1 },
  { caseNumber: 302, title: "RDS Grade IV — white-out", modality: "Neonatal CXR AP", diagnosis: "RDS Grade IV — complete bilateral opacification (white-out)", difficulty: "intermediate", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 2 },
  { caseNumber: 303, title: "Transient tachypnoea of the newborn (TTN)", modality: "Neonatal CXR AP", diagnosis: "TTN — hyperinflation with perihilar streaky opacities and fissural fluid", difficulty: "core", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 3 },
  { caseNumber: 304, title: "Meconium aspiration syndrome", modality: "Neonatal CXR AP", diagnosis: "Meconium aspiration — hyperinflation with coarse bilateral asymmetric opacities", difficulty: "intermediate", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 4 },
  { caseNumber: 305, title: "Neonatal pneumonia — Group B Streptococcus", modality: "Neonatal CXR AP", diagnosis: "Neonatal GBS pneumonia — bilateral patchy consolidation (mimics RDS)", difficulty: "intermediate", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 5 },
  { caseNumber: 306, title: "Bronchopulmonary dysplasia (BPD)", modality: "Neonatal CXR AP", diagnosis: "BPD — coarse interstitial pattern with cystic changes and hyperinflation in ex-premature infant", difficulty: "intermediate", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 6 },
  { caseNumber: 307, title: "Persistent pulmonary hypertension (PPHN)", modality: "Neonatal CXR AP", diagnosis: "PPHN — clear lungs with reduced pulmonary vascularity and cardiomegaly in term neonate", difficulty: "advanced", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 7 },
  { caseNumber: 308, title: "Pneumothorax — neonatal", modality: "Neonatal CXR AP supine", diagnosis: "Right-sided neonatal pneumothorax — hyperlucent right hemithorax on supine film", difficulty: "core", subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 8 },

  // --- Subsection: Congenital thoracic ---
  { caseNumber: 309, title: "Congenital diaphragmatic hernia — Bochdalek", modality: "Neonatal CXR AP", diagnosis: "Left Bochdalek CDH — bowel loops in left hemithorax with mediastinal shift", difficulty: "core", subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 1, packetOrder: 9 },
  { caseNumber: 310, title: "CPAM — congenital pulmonary airway malformation", modality: "Neonatal CXR AP", diagnosis: "CPAM (type 1) — large cysts in left lower lobe with mass effect", difficulty: "intermediate", subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 1, packetOrder: 10 },
  { caseNumber: 311, title: "Congenital lobar overinflation", modality: "CXR AP (infant)", diagnosis: "Congenital lobar overinflation — hyperinflated left upper lobe with contralateral shift", difficulty: "intermediate", subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 1, packetOrder: 11 },
  { caseNumber: 312, title: "Oesophageal atresia with TOF — Type C", modality: "Neonatal CXR with NG tube", diagnosis: "Oesophageal atresia with distal TOF — coiled NG tube in upper pouch, gas in bowel", difficulty: "core", subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 1, packetOrder: 12 },
  { caseNumber: 313, title: "H-type tracheo-oesophageal fistula", modality: "CXR and contrast swallow", diagnosis: "H-type TOF (Type E) — recurrent aspiration, no atresia", difficulty: "advanced", subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 1, packetOrder: 13 },
  { caseNumber: 314, title: "Eventration of diaphragm", modality: "CXR PA (child)", diagnosis: "Right hemidiaphragm eventration — elevated hemidiaphragm without herniation", difficulty: "intermediate", subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 1, packetOrder: 14 },

  // --- Subsection: Paediatric airway ---
  { caseNumber: 315, title: "Croup — steeple sign", modality: "Neck X-ray AP", diagnosis: "Croup — symmetrical subglottic narrowing (steeple sign)", difficulty: "core", subsection: "Paediatric airway", parentGroup: "Airway", packet: 1, packetOrder: 15 },
  { caseNumber: 316, title: "Epiglottitis — thumb sign", modality: "Neck X-ray lateral", diagnosis: "Acute epiglottitis — swollen epiglottis (thumb sign)", difficulty: "intermediate", subsection: "Paediatric airway", parentGroup: "Airway", packet: 1, packetOrder: 16 },
  { caseNumber: 317, title: "Inhaled foreign body — right bronchus", modality: "CXR PA inspiratory and expiratory", diagnosis: "Right main bronchus foreign body — air trapping on expiratory film", difficulty: "core", subsection: "Paediatric airway", parentGroup: "Airway", packet: 1, packetOrder: 17 },
  { caseNumber: 318, title: "Retropharyngeal abscess", modality: "Neck X-ray lateral", diagnosis: "Retropharyngeal abscess — widened prevertebral soft tissues >7mm at C2", difficulty: "intermediate", subsection: "Paediatric airway", parentGroup: "Airway", packet: 1, packetOrder: 18 },
  { caseNumber: 319, title: "Subglottic haemangioma", modality: "Neck X-ray AP", diagnosis: "Subglottic haemangioma — asymmetric subglottic narrowing in infant", difficulty: "advanced", subsection: "Paediatric airway", parentGroup: "Airway", packet: 1, packetOrder: 19 },

  // --- Subsection: Paediatric cardiac silhouette ---
  { caseNumber: 320, title: "Tetralogy of Fallot — boot-shaped heart", modality: "CXR PA (child)", diagnosis: "Tetralogy of Fallot — boot-shaped heart (coeur en sabot) with oligaemic lungs", difficulty: "intermediate", subsection: "Paediatric cardiac", parentGroup: "Cardiac", packet: 1, packetOrder: 20 },
  { caseNumber: 321, title: "TGA — egg-on-a-string", modality: "Neonatal CXR AP", diagnosis: "Transposition of great arteries — egg-on-a-string configuration with plethoric lungs", difficulty: "intermediate", subsection: "Paediatric cardiac", parentGroup: "Cardiac", packet: 1, packetOrder: 21 },
  { caseNumber: 322, title: "Total anomalous pulmonary venous return — snowman sign", modality: "CXR PA (infant)", diagnosis: "TAPVR (supracardiac type) — figure-of-8 / snowman sign", difficulty: "advanced", subsection: "Paediatric cardiac", parentGroup: "Cardiac", packet: 1, packetOrder: 22 },
  { caseNumber: 323, title: "Coarctation of aorta — rib notching", modality: "CXR PA (child/teen)", diagnosis: "Coarctation of aorta — 3 sign with bilateral inferior rib notching", difficulty: "intermediate", subsection: "Paediatric cardiac", parentGroup: "Cardiac", packet: 1, packetOrder: 23 },
  { caseNumber: 324, title: "Large VSD with pulmonary plethora", modality: "CXR PA (infant)", diagnosis: "Large VSD — cardiomegaly with pulmonary plethora (shunt vascularity)", difficulty: "core", subsection: "Paediatric cardiac", parentGroup: "Cardiac", packet: 1, packetOrder: 24 },

  // --- Subsection: NAI thoracic ---
  { caseNumber: 325, title: "Posterior rib fractures — NAI", modality: "CXR and skeletal survey", diagnosis: "Multiple posterior rib fractures of varying ages — highly specific for NAI", difficulty: "intermediate", subsection: "NAI thoracic", parentGroup: "NAI", packet: 1, packetOrder: 25 },
  { caseNumber: 326, title: "Healing rib fractures with callus — NAI", modality: "Chest and rib detail (skeletal survey)", diagnosis: "Healing lateral and posterior rib fractures with callus — NAI in non-ambulatory child", difficulty: "intermediate", subsection: "NAI thoracic", parentGroup: "NAI", packet: 1, packetOrder: 26 },

  // ============================================================
  // PACKET 2: Paediatric Infections & Misc Thoracic
  // ============================================================

  // --- Subsection: Paediatric pneumonia ---
  { caseNumber: 327, title: "Round pneumonia — child", modality: "CXR PA (child)", diagnosis: "Round pneumonia — well-defined rounded consolidation (paediatric phenomenon)", difficulty: "intermediate", subsection: "Paediatric pneumonia", parentGroup: "Parenchyma", packet: 2, packetOrder: 1 },
  { caseNumber: 328, title: "Staphylococcal pneumonia with pneumatoceles", modality: "CXR PA (child)", diagnosis: "Staphylococcal pneumonia — consolidation with thin-walled pneumatoceles", difficulty: "intermediate", subsection: "Paediatric pneumonia", parentGroup: "Parenchyma", packet: 2, packetOrder: 2 },
  { caseNumber: 329, title: "Viral bronchiolitis — hyperinflation", modality: "CXR AP (infant)", diagnosis: "Viral bronchiolitis — hyperinflation with peribronchial thickening and streaky perihilar opacities", difficulty: "core", subsection: "Paediatric pneumonia", parentGroup: "Parenchyma", packet: 2, packetOrder: 3 },
  { caseNumber: 330, title: "TB — primary complex with hilar lymphadenopathy", modality: "CXR PA (child)", diagnosis: "Primary TB — Ghon focus with unilateral hilar lymphadenopathy (Ranke complex)", difficulty: "intermediate", subsection: "Paediatric pneumonia", parentGroup: "Parenchyma", packet: 2, packetOrder: 4 },
  { caseNumber: 331, title: "Complicated parapneumonic effusion", modality: "CXR PA (child)", diagnosis: "Right-sided parapneumonic effusion — empyema requiring drainage", difficulty: "intermediate", subsection: "Paediatric pneumonia", parentGroup: "Parenchyma", packet: 2, packetOrder: 5 },

  // --- Subsection: VACTERL and associations ---
  { caseNumber: 332, title: "VACTERL — vertebral and rib anomalies", modality: "CXR and AXR (neonate)", diagnosis: "VACTERL association — vertebral anomaly, radial ray anomaly, coiled NG tube (OA)", difficulty: "advanced", subsection: "VACTERL and associations", parentGroup: "Congenital", packet: 2, packetOrder: 6 },
  { caseNumber: 333, title: "Poland syndrome — absent pectoralis", modality: "CXR PA (child)", diagnosis: "Poland syndrome — unilateral hyperlucent hemithorax with absent pectoralis major", difficulty: "advanced", subsection: "VACTERL and associations", parentGroup: "Congenital", packet: 2, packetOrder: 7 },

  // --- Subsection: Paediatric mediastinal mass ---
  { caseNumber: 334, title: "Anterior mediastinal mass — lymphoma (child)", modality: "CXR PA (child)", diagnosis: "Anterior mediastinal mass — T-cell lymphoblastic lymphoma with tracheal compression", difficulty: "intermediate", subsection: "Paediatric mediastinal mass", parentGroup: "Mediastinum", packet: 2, packetOrder: 8 },
  { caseNumber: 335, title: "Posterior mediastinal mass — neuroblastoma", modality: "CXR PA (infant)", diagnosis: "Posterior mediastinal mass with calcification — neuroblastoma/ganglioneuroma", difficulty: "intermediate", subsection: "Paediatric mediastinal mass", parentGroup: "Mediastinum", packet: 2, packetOrder: 9 },

  // --- Subsection: Neonatal lines ---
  { caseNumber: 336, title: "UAC — high position (T6-T10)", modality: "Neonatal CXR/AXR", diagnosis: "High umbilical arterial catheter — tip at T6-T10 (above coeliac axis)", difficulty: "core", subsection: "Neonatal lines", parentGroup: "Lines", packet: 2, packetOrder: 10 },
  { caseNumber: 337, title: "UVC — tip at IVC-RA junction", modality: "Neonatal CXR/AXR", diagnosis: "Umbilical venous catheter — ideal position at IVC-RA junction", difficulty: "core", subsection: "Neonatal lines", parentGroup: "Lines", packet: 2, packetOrder: 11 },
  { caseNumber: 338, title: "UVC malpositioned in portal vein", modality: "Neonatal AXR", diagnosis: "UVC malpositioned — tip in portal vein (courses laterally into liver)", difficulty: "intermediate", subsection: "Neonatal lines", parentGroup: "Lines", packet: 2, packetOrder: 12 },
  { caseNumber: 339, title: "ETT — neonatal ideal position", modality: "Neonatal CXR AP", diagnosis: "ETT in correct position — tip at T1-T2 level, midway between cords and carina", difficulty: "core", subsection: "Neonatal lines", parentGroup: "Lines", packet: 2, packetOrder: 13 },

  // --- Subsection: Thymus and normal variants ---
  { caseNumber: 340, title: "Thymic sail sign — normal variant", modality: "CXR AP (infant)", diagnosis: "Normal thymus — sail sign / wave sign, no pathology", difficulty: "core", subsection: "Thymus and normal variants", parentGroup: "Normal variant", packet: 2, packetOrder: 14 },
];
