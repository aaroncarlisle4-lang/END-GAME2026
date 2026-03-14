/**
 * Radiopaedia Curated Playlist Guide
 * ====================================
 * Reference document for sourcing rapid case images from Radiopaedia.
 * NOT seeded to the database — used as a manual lookup during the sourcing phase.
 *
 * Strategy: Match shells to existing curated Radiopaedia playlists/collections first,
 * then fill gaps with individual case searches.
 *
 * All Radiopaedia cases are CC-BY-NC-SA 3.0 unless otherwise noted.
 * Always attribute: author, case URL, and licence.
 */

export const radiopaediaPlaylistGuide = {
  // ============================================================
  // CXR — Adult Chest X-ray
  // ============================================================
  CXR: {
    recommendedPlaylists: [
      {
        name: "Chest X-ray — Lines and Tubes",
        authorName: "Frank Gaillard",
        profileUrl: "https://radiopaedia.org/users/frank-gaillard",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 15,
        mapsToSubsections: ["Line/tube malposition"],
        notes: "Gaillard is the founder of Radiopaedia; his CXR collections are comprehensive. Search his contributed cases filtered by 'lines and tubes'.",
      },
      {
        name: "Chest X-ray Interpretation",
        authorName: "Andrew Dixon",
        profileUrl: "https://radiopaedia.org/users/andrew-dixon",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 50,
        mapsToSubsections: [
          "Pneumothorax",
          "White-out hemithorax",
          "Consolidation pattern",
          "Lobar collapse",
          "Pulmonary oedema",
          "Lung mass/nodule",
        ],
        notes: "Dixon's chest collection is one of the largest on Radiopaedia. Filter by pathology tag to match specific subsections.",
      },
      {
        name: "Mediastinal Masses",
        authorName: "Matt Skalski",
        profileUrl: "https://radiopaedia.org/users/matt-skalski",
        playlistUrl: "TBD — search Radiopaedia articles + cases",
        estimatedCaseCount: 10,
        mapsToSubsections: ["Mediastinal mass", "Bilateral hilar lymphadenopathy"],
        notes: "Skalski has excellent annotated cases for anterior/middle/posterior mediastinal compartments.",
      },
      {
        name: "Occupational Lung Disease",
        authorName: "Various",
        profileUrl: "N/A",
        playlistUrl: "TBD — search by diagnosis tag",
        estimatedCaseCount: 8,
        mapsToSubsections: ["Occupational lung"],
        notes: "No single playlist — search by diagnosis: asbestosis, silicosis, pleural plaques. Craig Hacking and Jeremy Jones have contributed several cases.",
      },
      {
        name: "Post-surgical CXR",
        authorName: "Various",
        profileUrl: "N/A",
        playlistUrl: "TBD — search by diagnosis tag",
        estimatedCaseCount: 10,
        mapsToSubsections: ["Post-surgical CXR"],
        notes: "Search: pneumonectomy, lobectomy, CABG, lung transplant. Henry Knipe has contributed well-annotated surgical cases.",
      },
    ],
    unmatchedSubsections: [
      {
        subsection: "Acute aortic syndrome",
        strategy: "Individual case search by 'widened mediastinum', 'aortic dissection CXR'. Limited CXR-only examples exist — most cases jump straight to CT. May need to source from CXR-with-CT-correlation cases.",
      },
      {
        subsection: "Rib and chest wall",
        strategy: "Search 'rib fracture', 'flail chest', 'pathological fracture rib'. Jeremy Jones has contributed several trauma CXR cases.",
      },
    ],
  },

  // ============================================================
  // MSK-Rapid — Adult MSK Plain Film
  // ============================================================
  "MSK-Rapid": {
    recommendedPlaylists: [
      {
        name: "MSK Trauma Cases",
        authorName: "Matt Skalski",
        profileUrl: "https://radiopaedia.org/users/matt-skalski",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 40,
        mapsToSubsections: [
          "Wrist/hand fracture-dislocation",
          "Shoulder pathology",
          "Elbow injury",
          "Ankle/foot injury",
          "Hip fracture",
          "Knee injury",
        ],
        notes: "Skalski's MSK collection is particularly strong on upper and lower limb trauma with annotated images.",
      },
      {
        name: "Spine Trauma",
        authorName: "Jeremy Jones",
        profileUrl: "https://radiopaedia.org/users/jeremy-jones",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 15,
        mapsToSubsections: ["Spine injury"],
        notes: "Jones has extensive spine radiology contributions. Search by specific fracture types: Jefferson, Hangman, burst, Chance.",
      },
      {
        name: "Arthropathy Collection",
        authorName: "Andrew Dixon",
        profileUrl: "https://radiopaedia.org/users/andrew-dixon",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 20,
        mapsToSubsections: ["Arthropathy"],
        notes: "Dixon has RA, gout, CPPD, psoriatic arthritis cases. Also search Craig Hacking's contributions.",
      },
      {
        name: "Bone Tumour Cases",
        authorName: "Various",
        profileUrl: "N/A",
        playlistUrl: "TBD — search by diagnosis tag",
        estimatedCaseCount: 15,
        mapsToSubsections: ["Bone tumour"],
        notes: "Search by specific tumour: GCT, osteosarcoma, Ewing, enchondroma. Radiopaedia's quiz cases often have excellent plain film examples.",
      },
    ],
    unmatchedSubsections: [
      {
        subsection: "Metabolic bone",
        strategy: "Search: Paget disease, osteomalacia, AVN, hyperparathyroidism. Relatively well-represented on Radiopaedia but scattered across multiple authors.",
      },
    ],
  },

  // ============================================================
  // Paeds-CXR — Paediatric Chest X-ray
  // ============================================================
  "Paeds-CXR": {
    recommendedPlaylists: [
      {
        name: "Paediatric Radiology Cases",
        authorName: "Henry Knipe",
        profileUrl: "https://radiopaedia.org/users/henry-knipe",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 30,
        mapsToSubsections: [
          "Neonatal respiratory distress",
          "Congenital thoracic",
          "Paediatric airway",
          "Paediatric cardiac",
          "Neonatal lines",
        ],
        notes: "Knipe is the primary contributor for paediatric radiology on Radiopaedia. His neonatal CXR collection is extensive.",
      },
      {
        name: "Neonatal Chest Cases",
        authorName: "Frank Gaillard",
        profileUrl: "https://radiopaedia.org/users/frank-gaillard",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 10,
        mapsToSubsections: ["Neonatal respiratory distress", "Congenital thoracic"],
        notes: "Gaillard has classic neonatal CXR cases: RDS, TTN, CDH, CPAM.",
      },
      {
        name: "Paediatric Cardiac",
        authorName: "Various",
        profileUrl: "N/A",
        playlistUrl: "TBD — search by diagnosis tag",
        estimatedCaseCount: 8,
        mapsToSubsections: ["Paediatric cardiac"],
        notes: "Search: Tetralogy of Fallot CXR, TGA egg-on-string, TAPVR snowman, coarctation rib notching. Plain CXR examples are fewer than CT/echo — may need to curate from multi-modality cases.",
      },
    ],
    unmatchedSubsections: [
      {
        subsection: "NAI thoracic",
        strategy: "NAI cases are sensitive and less commonly published on Radiopaedia. Search 'non-accidental injury rib fractures'. May need to source from textbook illustrations or simulated cases.",
      },
      {
        subsection: "Paediatric pneumonia",
        strategy: "Search: round pneumonia child, staphylococcal pneumonia pneumatoceles, viral bronchiolitis. Well-represented on Radiopaedia.",
      },
      {
        subsection: "Thymus and normal variants",
        strategy: "Search: thymic sail sign, normal thymus infant. Henry Knipe has several normal variant cases.",
      },
    ],
  },

  // ============================================================
  // Paeds-MSK — Paediatric MSK Plain Film
  // ============================================================
  "Paeds-MSK": {
    recommendedPlaylists: [
      {
        name: "Paediatric MSK Cases",
        authorName: "Henry Knipe",
        profileUrl: "https://radiopaedia.org/users/henry-knipe",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 25,
        mapsToSubsections: [
          "Paediatric hip",
          "Paediatric elbow",
          "Growth plate injury",
          "Skeletal dysplasia",
        ],
        notes: "Knipe's paediatric MSK collection covers DDH, Perthes, SUFE, supracondylar fractures, and Salter-Harris injuries.",
      },
      {
        name: "Skeletal Dysplasia",
        authorName: "Frank Gaillard",
        profileUrl: "https://radiopaedia.org/users/frank-gaillard",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 10,
        mapsToSubsections: ["Skeletal dysplasia"],
        notes: "Search: achondroplasia, OI, thanatophoric dysplasia. Radiopaedia articles have excellent image galleries.",
      },
    ],
    unmatchedSubsections: [
      {
        subsection: "NAI skeletal",
        strategy: "As with NAI thoracic — sensitive content. Search 'classic metaphyseal lesion', 'bucket handle fracture NAI'. Limited public image availability.",
      },
      {
        subsection: "Metabolic bone paediatric",
        strategy: "Search: rickets wrist, scurvy child, lead poisoning metaphyseal bands. Well-illustrated on Radiopaedia.",
      },
      {
        subsection: "Paediatric tumour",
        strategy: "Search by specific tumour: Wilms, neuroblastoma AXR, Ewing sarcoma, LCH skull. Many have plain film examples.",
      },
      {
        subsection: "Congenital spine",
        strategy: "Search: butterfly vertebra, hemivertebra, Klippel-Feil. Good representation on Radiopaedia.",
      },
    ],
  },

  // ============================================================
  // AXR — Abdominal X-ray
  // ============================================================
  AXR: {
    recommendedPlaylists: [
      {
        name: "Abdominal X-ray Interpretation",
        authorName: "Craig Hacking",
        profileUrl: "https://radiopaedia.org/users/craig-hacking",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 30,
        mapsToSubsections: [
          "Small bowel obstruction",
          "Large bowel obstruction",
          "Pneumoperitoneum",
          "Toxic megacolon",
          "Calcification pattern",
        ],
        notes: "Hacking has an extensive abdominal radiology collection. His AXR cases are well-annotated with classic signs.",
      },
      {
        name: "Bowel Obstruction Cases",
        authorName: "Andrew Dixon",
        profileUrl: "https://radiopaedia.org/users/andrew-dixon",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 15,
        mapsToSubsections: ["Small bowel obstruction", "Large bowel obstruction"],
        notes: "Dixon has SBO, sigmoid volvulus, caecal volvulus, and Ogilvie syndrome cases.",
      },
      {
        name: "Neonatal Abdominal Cases",
        authorName: "Henry Knipe",
        profileUrl: "https://radiopaedia.org/users/henry-knipe",
        playlistUrl: "TBD — search Radiopaedia playlists",
        estimatedCaseCount: 15,
        mapsToSubsections: ["Neonatal bowel"],
        notes: "Knipe covers duodenal atresia, NEC, meconium ileus, Hirschsprung. Also search Frank Gaillard's neonatal contributions.",
      },
    ],
    unmatchedSubsections: [
      {
        subsection: "Foreign body / iatrogenic",
        strategy: "Search: ingested coin, button battery oesophagus, body packing, retained surgical swab. Well-represented as individual cases on Radiopaedia.",
      },
      {
        subsection: "Abdominal wall / hernia",
        strategy: "Search: inguinal hernia AXR, obturator hernia. Plain film examples are less common than CT — may need multi-modality cases.",
      },
      {
        subsection: "Pneumatosis / portal gas",
        strategy: "Search: pneumatosis intestinalis AXR, portal venous gas AXR. Many cases have CT correlation but some have plain film.",
      },
      {
        subsection: "Post-surgical abdomen",
        strategy: "Search: post-laparotomy ileus, biliary stent AXR, DJ stent AXR. Well-represented.",
      },
      {
        subsection: "Miscellaneous AXR",
        strategy: "Search: ascites AXR, splenomegaly AXR, hepatomegaly. These are often incidental findings on plain film.",
      },
    ],
  },

  // ============================================================
  // Sourcing Workflow
  // ============================================================
  sourcingWorkflow: {
    step1: "For each shell, search Radiopaedia by diagnosis name (e.g. 'sigmoid volvulus')",
    step2: "Filter results by modality (X-ray/plain film) to match the shell's modality",
    step3: "Prefer cases with CC-BY-NC-SA licence and clear annotations",
    step4: "Record: caseId, caseUrl, author, licence in the radiopaediaSource field",
    step5: "Update shellStatus from 'shell' → 'sourced'",
    step6: "In Phase 3, download images and upload to Convex file storage",
    notes: [
      "Radiopaedia API is available at https://radiopaedia.org/api/v1 for programmatic access",
      "Rate-limit respectfully: max 1 request per second",
      "Some cases have multiple images — select the single best image for rapid review",
      "For NAI cases, consider using simulated/teaching images if Radiopaedia cases are insufficient",
    ],
  },
};
