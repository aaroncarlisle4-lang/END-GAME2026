/**
 * Backfill data for existing 90 rapid cases (cases 1-90).
 * Maps each case to its DDx problem-type subsection, parentGroup, packet, and packetOrder.
 */

// ============================================================
// CXR existing cases 1-30
// ============================================================
export const cxrBackfill = [
  // Lines and tubes (cases 1-4, 19-20, 30)
  { caseNumber: 1, subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 1 },
  { caseNumber: 2, subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 2 },
  { caseNumber: 3, subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 3 },
  { caseNumber: 4, subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 4 },
  { caseNumber: 19, subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 5 },
  { caseNumber: 20, subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 6 },
  { caseNumber: 30, subsection: "Line/tube malposition", parentGroup: "Lines and tubes", packet: 1, packetOrder: 7 },

  // Pneumothorax (cases 5-6, 17)
  { caseNumber: 5, subsection: "Pneumothorax", parentGroup: "Pleura", packet: 1, packetOrder: 8 },
  { caseNumber: 6, subsection: "Pneumothorax", parentGroup: "Pleura", packet: 1, packetOrder: 9 },
  { caseNumber: 17, subsection: "Pneumothorax", parentGroup: "Mediastinum", packet: 1, packetOrder: 10 },

  // White-out hemithorax / effusion (cases 9, 25)
  { caseNumber: 9, subsection: "White-out hemithorax", parentGroup: "Pleura", packet: 1, packetOrder: 11 },
  { caseNumber: 25, subsection: "White-out hemithorax", parentGroup: "Post-surgical", packet: 1, packetOrder: 12 },

  // Pulmonary oedema (case 13)
  { caseNumber: 13, subsection: "Pulmonary oedema", parentGroup: "Diffuse lung", packet: 1, packetOrder: 13 },

  // Acute aortic syndrome (case 14, 18)
  { caseNumber: 14, subsection: "Acute aortic syndrome", parentGroup: "Mediastinum", packet: 1, packetOrder: 14 },
  { caseNumber: 18, subsection: "Acute aortic syndrome", parentGroup: "Mediastinum", packet: 1, packetOrder: 15 },

  // Consolidation pattern (cases 7-8)
  { caseNumber: 7, subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 1 },
  { caseNumber: 8, subsection: "Consolidation pattern", parentGroup: "Parenchyma", packet: 2, packetOrder: 2 },

  // Lobar collapse (cases 11-12, 15)
  { caseNumber: 11, subsection: "Lobar collapse", parentGroup: "Airways", packet: 2, packetOrder: 3 },
  { caseNumber: 12, subsection: "Lobar collapse", parentGroup: "Airways", packet: 2, packetOrder: 4 },
  { caseNumber: 15, subsection: "Lobar collapse", parentGroup: "Airways", packet: 2, packetOrder: 5 },

  // Bilateral hilar lymphadenopathy (case 10)
  { caseNumber: 10, subsection: "Bilateral hilar lymphadenopathy", parentGroup: "Hilum", packet: 2, packetOrder: 6 },

  // Mediastinal mass (case 28)
  { caseNumber: 28, subsection: "Mediastinal mass", parentGroup: "Mediastinum", packet: 2, packetOrder: 7 },

  // Lung mass/nodule (cases 16, 21, 24)
  { caseNumber: 16, subsection: "Lung mass/nodule", parentGroup: "Diffuse lung", packet: 2, packetOrder: 8 },
  { caseNumber: 21, subsection: "Lung mass/nodule", parentGroup: "Parenchyma", packet: 2, packetOrder: 9 },
  { caseNumber: 24, subsection: "Lung mass/nodule", parentGroup: "Parenchyma", packet: 2, packetOrder: 10 },

  // Occupational lung (cases 26-27)
  { caseNumber: 26, subsection: "Occupational lung", parentGroup: "Diffuse lung", packet: 2, packetOrder: 11 },
  { caseNumber: 27, subsection: "Occupational lung", parentGroup: "Diffuse lung", packet: 2, packetOrder: 12 },

  // Post-surgical CXR (case 25 already above)

  // Rib and chest wall (case 29)
  { caseNumber: 29, subsection: "Rib and chest wall", parentGroup: "Chest wall", packet: 2, packetOrder: 13 },

  // Pneumoperitoneum on CXR (case 22) — maps to CXR but cross-references AXR
  { caseNumber: 22, subsection: "Pneumoperitoneum", parentGroup: "Free air", packet: 2, packetOrder: 14 },

  // Congenital thoracic (case 23)
  { caseNumber: 23, subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 2, packetOrder: 15 },
];

// ============================================================
// MSK-Rapid existing cases 31-60
// ============================================================
export const mskBackfill = [
  // Wrist/hand fracture-dislocation (31-32, 59)
  { caseNumber: 31, subsection: "Wrist/hand fracture-dislocation", parentGroup: "Upper limb", packet: 1, packetOrder: 1 },
  { caseNumber: 32, subsection: "Wrist/hand fracture-dislocation", parentGroup: "Upper limb", packet: 1, packetOrder: 2 },
  { caseNumber: 59, subsection: "Wrist/hand fracture-dislocation", parentGroup: "Upper limb", packet: 1, packetOrder: 3 },

  // Shoulder pathology (33, 55)
  { caseNumber: 33, subsection: "Shoulder pathology", parentGroup: "Upper limb", packet: 1, packetOrder: 4 },
  { caseNumber: 55, subsection: "Shoulder pathology", parentGroup: "Upper limb", packet: 1, packetOrder: 5 },

  // Elbow injury (34-35)
  { caseNumber: 34, subsection: "Elbow injury", parentGroup: "Upper limb", packet: 1, packetOrder: 6 },
  { caseNumber: 35, subsection: "Elbow injury", parentGroup: "Upper limb", packet: 1, packetOrder: 7 },

  // Hip fracture/dislocation (36)
  { caseNumber: 36, subsection: "Hip fracture", parentGroup: "Lower limb", packet: 1, packetOrder: 8 },

  // Ankle/foot injury (37-38, 57)
  { caseNumber: 37, subsection: "Ankle/foot injury", parentGroup: "Lower limb", packet: 1, packetOrder: 9 },
  { caseNumber: 38, subsection: "Ankle/foot injury", parentGroup: "Lower limb", packet: 1, packetOrder: 10 },
  { caseNumber: 57, subsection: "Ankle/foot injury", parentGroup: "Lower limb", packet: 1, packetOrder: 11 },

  // Knee injury (58)
  { caseNumber: 58, subsection: "Knee injury", parentGroup: "Lower limb", packet: 1, packetOrder: 12 },

  // Spine injury (39-40)
  { caseNumber: 39, subsection: "Spine injury", parentGroup: "Spine", packet: 2, packetOrder: 1 },
  { caseNumber: 40, subsection: "Spine injury", parentGroup: "Spine", packet: 2, packetOrder: 2 },

  // Arthropathy (41-45, 54, 60)
  { caseNumber: 41, subsection: "Arthropathy", parentGroup: "Joints", packet: 2, packetOrder: 3 },
  { caseNumber: 42, subsection: "Arthropathy", parentGroup: "Joints", packet: 2, packetOrder: 4 },
  { caseNumber: 43, subsection: "Arthropathy", parentGroup: "Joints", packet: 2, packetOrder: 5 },
  { caseNumber: 44, subsection: "Arthropathy", parentGroup: "Spine", packet: 2, packetOrder: 6 },
  { caseNumber: 45, subsection: "Arthropathy", parentGroup: "Joints", packet: 2, packetOrder: 7 },
  { caseNumber: 54, subsection: "Arthropathy", parentGroup: "Joints", packet: 2, packetOrder: 8 },
  { caseNumber: 60, subsection: "Arthropathy", parentGroup: "Joints", packet: 2, packetOrder: 9 },

  // Bone tumour (47-50)
  { caseNumber: 47, subsection: "Bone tumour", parentGroup: "Tumour", packet: 2, packetOrder: 10 },
  { caseNumber: 48, subsection: "Bone tumour", parentGroup: "Tumour", packet: 2, packetOrder: 11 },
  { caseNumber: 49, subsection: "Bone tumour", parentGroup: "Tumour", packet: 2, packetOrder: 12 },
  { caseNumber: 50, subsection: "Bone tumour", parentGroup: "Tumour", packet: 2, packetOrder: 13 },

  // Metabolic bone (46, 51-53)
  { caseNumber: 46, subsection: "Metabolic bone", parentGroup: "Metabolic", packet: 2, packetOrder: 14 },
  { caseNumber: 51, subsection: "Metabolic bone", parentGroup: "Metabolic", packet: 2, packetOrder: 15 },
  { caseNumber: 52, subsection: "Metabolic bone", parentGroup: "Metabolic", packet: 2, packetOrder: 16 },
  { caseNumber: 53, subsection: "Metabolic bone", parentGroup: "Metabolic", packet: 2, packetOrder: 17 },

  // Soft tissue (56)
  { caseNumber: 56, subsection: "Soft tissue", parentGroup: "Soft tissue", packet: 2, packetOrder: 18 },
];

// ============================================================
// Paeds-MSK existing cases 61-90
// (Paeds-Rapid renamed to Paeds-MSK; some cases will stay here,
//  CXR/AXR content stays in Paeds-MSK since they're already seeded there)
// ============================================================
export const paedsMskBackfill = [
  // NAI skeletal (61-62)
  { caseNumber: 61, subsection: "NAI skeletal", parentGroup: "NAI", packet: 1, packetOrder: 1 },
  { caseNumber: 62, subsection: "NAI skeletal", parentGroup: "NAI", packet: 1, packetOrder: 2 },

  // Paediatric elbow (63)
  { caseNumber: 63, subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 3 },

  // Growth plate injury (64-65)
  { caseNumber: 64, subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 4 },
  { caseNumber: 65, subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 5 },

  // Congenital thoracic (66) — CDH in paeds context
  { caseNumber: 66, subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 1, packetOrder: 6 },

  // Neonatal respiratory distress (67-69)
  { caseNumber: 67, subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 7 },
  { caseNumber: 68, subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 8 },
  { caseNumber: 69, subsection: "Neonatal respiratory distress", parentGroup: "Neonatal chest", packet: 1, packetOrder: 9 },

  // Neonatal bowel (70-71)
  { caseNumber: 70, subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 1, packetOrder: 10 },
  { caseNumber: 71, subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 1, packetOrder: 11 },

  // Paediatric hip (72-74)
  { caseNumber: 72, subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 12 },
  { caseNumber: 73, subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 13 },
  { caseNumber: 74, subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 14 },

  // Skeletal dysplasia (75-76, 78, 87)
  { caseNumber: 75, subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 1 },
  { caseNumber: 76, subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 2 },
  { caseNumber: 78, subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 3 },
  { caseNumber: 87, subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 4 },

  // Metabolic bone paediatric (77)
  { caseNumber: 77, subsection: "Metabolic bone paediatric", parentGroup: "Metabolic", packet: 2, packetOrder: 5 },

  // Paediatric tumour (79-80, 90)
  { caseNumber: 79, subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 6 },
  { caseNumber: 80, subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 7 },
  { caseNumber: 90, subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 8 },

  // Neonatal bowel (81-82)
  { caseNumber: 81, subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 9 },
  { caseNumber: 82, subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 10 },

  // Paediatric airway (83-86)
  { caseNumber: 83, subsection: "Paediatric airway", parentGroup: "Airway", packet: 2, packetOrder: 11 },
  { caseNumber: 84, subsection: "Paediatric airway", parentGroup: "Airway", packet: 2, packetOrder: 12 },
  { caseNumber: 85, subsection: "Paediatric airway", parentGroup: "Airway", packet: 2, packetOrder: 13 },
  { caseNumber: 86, subsection: "Paediatric pneumonia", parentGroup: "Parenchyma", packet: 2, packetOrder: 14 },

  // VACTERL / congenital (88-89)
  { caseNumber: 88, subsection: "VACTERL and associations", parentGroup: "Congenital", packet: 2, packetOrder: 15 },
  { caseNumber: 89, subsection: "Congenital thoracic", parentGroup: "Congenital", packet: 2, packetOrder: 16 },
];

// Combined for easy export
export const allBackfillUpdates = [
  ...cxrBackfill,
  ...mskBackfill,
  ...paedsMskBackfill,
];
