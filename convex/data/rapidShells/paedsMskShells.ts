// Paeds-MSK Rapid Shells — ~40 shells grouped by DDx problem type
// Case numbers start at 401
export const paedsMskShells = [
  // ============================================================
  // PACKET 1: Paediatric Orthopaedic & Congenital
  // ============================================================

  // --- Subsection: Paediatric hip ---
  { caseNumber: 401, title: "DDH — subluxation (Hilgenreiner/Perkin lines)", modality: "Pelvis X-ray AP", diagnosis: "Developmental dysplasia of the hip — subluxation", difficulty: "core", subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 1 },
  { caseNumber: 402, title: "DDH — complete dislocation", modality: "Pelvis X-ray AP", diagnosis: "DDH — complete dislocation with acetabular dysplasia", difficulty: "intermediate", subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 2 },
  { caseNumber: 403, title: "Perthes disease — fragmentation stage", modality: "Hip X-ray AP and frog-leg lateral", diagnosis: "Legg-Calve-Perthes disease — fragmentation stage", difficulty: "intermediate", subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 3 },
  { caseNumber: 404, title: "SUFE — subtle slip", modality: "Hip X-ray AP and frog-leg lateral", diagnosis: "SUFE — Klein line fails to intersect epiphysis", difficulty: "intermediate", subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 4 },
  { caseNumber: 405, title: "SUFE — severe slip", modality: "Hip X-ray AP and frog-leg lateral", diagnosis: "Severe SUFE — >50% epiphyseal displacement", difficulty: "intermediate", subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 5 },
  { caseNumber: 406, title: "Transient synovitis vs septic arthritis", modality: "Hip X-ray AP", diagnosis: "Hip effusion — widened medial joint space; US-guided aspiration needed to exclude septic arthritis", difficulty: "core", subsection: "Paediatric hip", parentGroup: "Lower limb", packet: 1, packetOrder: 6 },

  // --- Subsection: Paediatric elbow ---
  { caseNumber: 407, title: "Supracondylar fracture — Type II", modality: "Elbow X-ray AP and lateral", diagnosis: "Gartland Type II supracondylar fracture — posterior fat pad sign, anterior humeral line fails to intersect capitellum", difficulty: "core", subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 7 },
  { caseNumber: 408, title: "Supracondylar fracture — Type III", modality: "Elbow X-ray AP and lateral", diagnosis: "Gartland Type III supracondylar fracture — fully displaced with rotation", difficulty: "intermediate", subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 8 },
  { caseNumber: 409, title: "Lateral condyle fracture", modality: "Elbow X-ray AP and lateral", diagnosis: "Lateral condyle fracture — Milch classification, risk of non-union", difficulty: "intermediate", subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 9 },
  { caseNumber: 410, title: "Medial epicondyle avulsion — CRITOE", modality: "Elbow X-ray AP", diagnosis: "Medial epicondyle avulsion — check CRITOE ossification sequence", difficulty: "intermediate", subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 10 },
  { caseNumber: 411, title: "Pulled elbow (nursemaid's elbow)", modality: "Elbow X-ray AP and lateral", diagnosis: "Radial head subluxation (pulled elbow) — normal X-ray, clinical diagnosis", difficulty: "core", subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 11 },
  { caseNumber: 412, title: "Olecranon fracture — paediatric", modality: "Elbow X-ray AP and lateral", diagnosis: "Olecranon fracture in child — assess triceps continuity", difficulty: "core", subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 12 },
  { caseNumber: 413, title: "Monteggia equivalent — paediatric", modality: "Forearm and elbow X-ray", diagnosis: "Monteggia equivalent — proximal ulna fracture with radial head dislocation", difficulty: "intermediate", subsection: "Paediatric elbow", parentGroup: "Upper limb", packet: 1, packetOrder: 13 },

  // --- Subsection: Growth plate injury ---
  { caseNumber: 414, title: "Salter-Harris Type I — distal fibula", modality: "Ankle X-ray AP and lateral", diagnosis: "Salter-Harris Type I distal fibula — normal X-ray, clinical diagnosis with physis tenderness", difficulty: "core", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 14 },
  { caseNumber: 415, title: "Salter-Harris Type II — distal radius", modality: "Wrist X-ray AP and lateral", diagnosis: "Salter-Harris Type II distal radius — fracture through metaphysis + physis", difficulty: "core", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 15 },
  { caseNumber: 416, title: "Salter-Harris Type III — distal tibia (Tillaux)", modality: "Ankle X-ray AP and lateral", diagnosis: "Tillaux fracture — SH Type III of anterolateral distal tibial epiphysis", difficulty: "intermediate", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 16 },
  { caseNumber: 417, title: "Salter-Harris Type IV — distal tibia (triplane)", modality: "Ankle X-ray AP and lateral", diagnosis: "Triplane fracture — SH Type IV equivalent with fracture in 3 planes", difficulty: "advanced", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 17 },
  { caseNumber: 418, title: "Toddler's fracture — tibial spiral", modality: "Tibia/fibula X-ray AP and lateral", diagnosis: "Toddler's fracture — non-displaced spiral fracture of tibial shaft", difficulty: "core", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 18 },
  { caseNumber: 419, title: "Greenstick fracture — forearm", modality: "Forearm X-ray AP and lateral", diagnosis: "Greenstick fracture of distal radius and ulna — incomplete fracture", difficulty: "core", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 19 },
  { caseNumber: 420, title: "Torus (buckle) fracture — distal radius", modality: "Wrist X-ray AP and lateral", diagnosis: "Torus fracture — cortical buckling of distal radius without complete break", difficulty: "core", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 20 },
  { caseNumber: 421, title: "Plastic bowing fracture — forearm", modality: "Forearm X-ray AP and lateral", diagnosis: "Plastic bowing deformity of ulna — no discrete fracture line", difficulty: "intermediate", subsection: "Growth plate injury", parentGroup: "Growth plate", packet: 1, packetOrder: 21 },

  // ============================================================
  // PACKET 2: Dysplasia, Metabolic, NAI, Tumour
  // ============================================================

  // --- Subsection: Skeletal dysplasia ---
  { caseNumber: 422, title: "Achondroplasia — classic findings", modality: "Skeletal survey", diagnosis: "Achondroplasia — rhizomelic shortening, narrowing interpedicular distance, trident hand", difficulty: "intermediate", subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 1 },
  { caseNumber: 423, title: "Osteogenesis imperfecta — Type I", modality: "Skeletal survey", diagnosis: "OI Type I — osteopenia, gracile bones, wormian bones, multiple fractures", difficulty: "intermediate", subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 2 },
  { caseNumber: 424, title: "Thanatophoric dysplasia", modality: "Skeletal survey (neonatal)", diagnosis: "Thanatophoric dysplasia — telephone-receiver femora, platyspondyly, narrow thorax", difficulty: "advanced", subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 3 },
  { caseNumber: 425, title: "Morquio syndrome (MPS IV)", modality: "Spine and skeletal X-rays", diagnosis: "Morquio syndrome — platyspondyly with anterior vertebral beaking, odontoid hypoplasia", difficulty: "advanced", subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 4 },
  { caseNumber: 426, title: "Congenital talipes equinovarus (clubfoot)", modality: "Foot X-ray AP and lateral", diagnosis: "Clubfoot — parallel talus and calcaneus, forefoot adductus", difficulty: "intermediate", subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 5 },
  { caseNumber: 427, title: "Down syndrome — skeletal features", modality: "Pelvis X-ray AP and hand", diagnosis: "Down syndrome — hypoplastic iliac wings, 11 rib pairs, clinodactyly, sandal gap", difficulty: "intermediate", subsection: "Skeletal dysplasia", parentGroup: "Dysplasia", packet: 2, packetOrder: 6 },

  // --- Subsection: Metabolic bone — paediatric ---
  { caseNumber: 428, title: "Rickets — wrist findings", modality: "Wrist X-ray AP", diagnosis: "Rickets — metaphyseal cupping, fraying, splaying with widened physis", difficulty: "core", subsection: "Metabolic bone paediatric", parentGroup: "Metabolic", packet: 2, packetOrder: 7 },
  { caseNumber: 429, title: "Scurvy — Frankel line and Trummerfeld zone", modality: "Knee X-ray AP", diagnosis: "Scurvy — dense zone of provisional calcification (Frankel line), Trummerfeld zone, corner sign", difficulty: "advanced", subsection: "Metabolic bone paediatric", parentGroup: "Metabolic", packet: 2, packetOrder: 8 },
  { caseNumber: 430, title: "Lead poisoning — dense metaphyseal bands", modality: "Knee X-ray AP", diagnosis: "Lead poisoning — dense metaphyseal bands (lead lines) in growing child", difficulty: "intermediate", subsection: "Metabolic bone paediatric", parentGroup: "Metabolic", packet: 2, packetOrder: 9 },

  // --- Subsection: NAI skeletal ---
  { caseNumber: 431, title: "Classic metaphyseal lesion (CML) — corner fracture", modality: "Knee X-ray (skeletal survey)", diagnosis: "CML / bucket-handle fracture — highly specific for NAI", difficulty: "intermediate", subsection: "NAI skeletal", parentGroup: "NAI", packet: 2, packetOrder: 10 },
  { caseNumber: 432, title: "Multiple fractures of varying ages — NAI", modality: "Skeletal survey", diagnosis: "NAI — fractures at different healing stages in non-ambulatory child", difficulty: "intermediate", subsection: "NAI skeletal", parentGroup: "NAI", packet: 2, packetOrder: 11 },
  { caseNumber: 433, title: "Periosteal reaction — non-accidental", modality: "Limb X-rays (skeletal survey)", diagnosis: "Extensive periosteal new bone formation in infant — NAI until proven otherwise", difficulty: "intermediate", subsection: "NAI skeletal", parentGroup: "NAI", packet: 2, packetOrder: 12 },
  { caseNumber: 434, title: "Skull fracture — complex (NAI)", modality: "Skull X-ray AP and lateral", diagnosis: "Complex skull fracture — bilateral, crossing sutures, depressed — NAI pattern", difficulty: "intermediate", subsection: "NAI skeletal", parentGroup: "NAI", packet: 2, packetOrder: 13 },

  // --- Subsection: Paediatric tumour ---
  { caseNumber: 435, title: "Wilms tumour — flank mass displacing bowel", modality: "AXR", diagnosis: "Wilms tumour — large intrarenal mass displacing bowel centrally", difficulty: "intermediate", subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 14 },
  { caseNumber: 436, title: "Neuroblastoma — calcified suprarenal mass", modality: "AXR and CXR", diagnosis: "Neuroblastoma — calcified adrenal mass crossing midline", difficulty: "intermediate", subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 15 },
  { caseNumber: 437, title: "Ewing sarcoma — permeative bone lesion (child)", modality: "Femur X-ray", diagnosis: "Ewing sarcoma — diaphyseal permeative lesion with lamellated periosteal reaction", difficulty: "advanced", subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 16 },
  { caseNumber: 438, title: "Langerhans cell histiocytosis — skull", modality: "Skull X-ray AP and lateral", diagnosis: "LCH — punched-out lytic skull lesion with bevelled edge", difficulty: "intermediate", subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 17 },
  { caseNumber: 439, title: "Osteosarcoma — paediatric proximal tibia", modality: "Knee X-ray AP and lateral", diagnosis: "Osteosarcoma — aggressive metaphyseal lesion with Codman triangle", difficulty: "intermediate", subsection: "Paediatric tumour", parentGroup: "Tumour", packet: 2, packetOrder: 18 },

  // --- Subsection: Congenital spine ---
  { caseNumber: 440, title: "Butterfly vertebra", modality: "Spine X-ray AP", diagnosis: "Butterfly vertebra — failure of fusion of lateral chondrification centres (incidental)", difficulty: "core", subsection: "Congenital spine", parentGroup: "Spine", packet: 2, packetOrder: 19 },
  { caseNumber: 441, title: "Hemivertebra — scoliosis", modality: "Spine X-ray AP", diagnosis: "Hemivertebra with congenital scoliosis — fully segmented lateral hemivertebra", difficulty: "intermediate", subsection: "Congenital spine", parentGroup: "Spine", packet: 2, packetOrder: 20 },
  { caseNumber: 442, title: "Block vertebra — Klippel-Feil", modality: "C-spine X-ray lateral", diagnosis: "Klippel-Feil syndrome — congenital cervical vertebral fusion (block vertebra)", difficulty: "advanced", subsection: "Congenital spine", parentGroup: "Spine", packet: 2, packetOrder: 21 },
];
