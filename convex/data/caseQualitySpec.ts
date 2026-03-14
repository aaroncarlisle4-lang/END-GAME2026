/**
 * FRCR 2B Long Case Quality Specification
 *
 * Gold-standard format derived from Radiopaedia FRCR 2B practice cases,
 * Final FRCR 2B Viva 100 Cases book, and Practice Long Cases (MasterPass).
 *
 * All populated long cases must conform to this spec before scaling.
 *
 * See also: /Knowledge source/question-refinement-framework.md
 * for the full iterative refinement guide and examiner blueprint.
 */

/**
 * EXAMINER BLUEPRINT — The 6-Step Case Arc
 *
 * Every long case must follow this structural formula:
 *
 * 1. ANCHOR ABNORMALITY — Not trivial, not a zebra. Forces pattern recognition.
 * 2. COMPARTMENT-BASED DIFFERENTIAL CLUSTERING — Location-based reasoning.
 * 3. MODALITY ESCALATION — Cases tell a story across imaging modalities.
 * 4. CLINICAL INFLECTION POINT — Something shifts probability (age, markers, immune status).
 * 5. FORCE PRIORITISATION — Ranked differentials, not a flat list.
 * 6. MANAGEMENT LAYER — Specific referral, staging, biopsy, MDT.
 */

/**
 * CASE ARCHETYPES
 *
 * Each case should fit one of these patterns:
 *
 * A: Multi-Modality Escalation  — Plain film/US → CT/MRI (e.g. CXR widened mediastinum → CT anterior mass)
 * B: Staging Journey            — Known primary → Cross-sectional staging (e.g. biopsy-proven SCC → PET-CT)
 * C: Incidental Characterisation — Incidental finding → Dedicated characterisation (e.g. US liver lesion → MRI Primovist)
 * D: Acute with Complexity       — Emergency presentation → Emergency cross-sectional (e.g. acute abdomen + Crohn's → CT)
 * E: Multi-System Disease        — Systemic symptoms → Multi-system imaging (e.g. TB: discitis + empyema + septic emboli)
 * F: Nuclear Medicine Correlation — NM study + anatomical correlation (e.g. CT pelvis + Tc-99m sestamibi SPECT)
 */

export const CASE_QUALITY_SPEC = {
  clinicalHistory: {
    description:
      "Deliberately designed clinical context that creates a diagnostic journey, NOT throwaway text.",
    rules: [
      "Must include age and sex — always shifts differential probability",
      "Must include presenting complaint and duration (acute vs chronic)",
      "Must include one clinical inflection point that shifts probability (e.g. immunosuppression, known malignancy, raised markers, risk factors)",
      "Should reference prior/initial imaging where applicable to create modality escalation ('Surveillance US shows... MRI for characterisation')",
      "Should include referral context where relevant ('Referred for staging prior to surgical planning')",
      "Must NOT contain the diagnosis or make it trivially obvious",
      "Must NOT include irrelevant clinical detail",
      "Must use age-appropriate clinical scenarios",
    ],
    inflectionPoints: [
      "Age (child vs adult vs elderly)",
      "Immunosuppression (HIV, transplant, chemotherapy, neutropenia)",
      "Trauma history",
      "Known primary malignancy",
      "Constitutional symptoms (weight loss, night sweats, fever)",
      "Raised tumour markers (AFP, CEA, CA-125, beta-hCG, PSA)",
      "TB risk factors (travel, immunocompromise)",
      "Post-surgical/post-treatment history",
      "OCP use, pregnancy/post-partum",
      "Occupational exposure (asbestos, silica)",
      "Autoimmune/inflammatory background",
    ],
    example:
      "62-year-old male with hepatitis C cirrhosis. AFP rising to 450 ng/mL. Surveillance ultrasound shows a 4cm hypoechoic lesion in segment VI. MRI liver with Primovist for characterisation.",
  },

  findings: {
    format: "bullet-point",
    description:
      "Bullet-point style (not prose). Each bullet is a terse radiological observation using standard reporting language. For multi-modality cases, findings MUST be separated by modality heading.",
    minBullets: 5,
    maxBullets: 15,
    rules: [
      "Each bullet is a single finding or observation",
      "Use terse radiological language — no full sentences",
      "Must include at least 2 important normal/intact structures (e.g. 'PCL intact', 'no fracture') — these earn marks in the real exam",
      "Order: primary abnormality first, then secondary findings, then associated/incidental findings, then important negatives",
      "No prose paragraphs — line-separated bullets",
      "For multi-modality cases, separate findings under modality headings (e.g. 'CXR\\n- finding\\n\\nCT\\n- finding')",
      "Use correct modality terminology: density (plain film), attenuation (CT), signal intensity (MRI), reflectivity (US), tracer uptake (NM)",
      "Include 1-2 incidental findings where clinically relevant — these earn marks (e.g. 'paraseptal emphysema', 'extensive vascular calcification')",
      "Describe what you SEE, not what you think it is — interpretation comes later",
    ],
    example:
      "CXR\nright pleural effusion with non-uniform/lobulated distribution\nT11/12 loss of intervertebral disc space/endplates\nwidening of the lower thoracic paravertebral soft tissues\n\nCT chest\nloculated right pleural effusion with areas of subtle pleural thickening/enhancement\nbilateral patchy peripheral areas of consolidation/ground glass opacity\nT11/12 disc and endplate destruction with associated paravertebral soft-tissue thickening/phlegmon\nfocal kyphosis\nsuspicion of epidural component\nprominent/reactive mediastinal lymph nodes\nparaseptal emphysema/subpleural blebs",
  },

  interpretation: {
    description:
      "2-3 sentences linking the findings to the likely diagnosis. Should synthesise multiple components into a unifying clinical picture.",
    minSentences: 2,
    maxSentences: 3,
    rules: [
      "Summarise the key findings and their significance",
      "Link findings to a unifying diagnosis — must connect the dots across all findings",
      "For multi-component diagnoses, list all components (e.g. 'lower thoracic infection centred on the disc with soft-tissue extension, loculated pleural collection and parenchymal airspace filling')",
      "May include textbook references in [n] format where relevant",
    ],
  },

  diagnosis: {
    description:
      "Concise, specific diagnosis. For complex cases, must include multiple diagnostic components.",
    minLength: 30,
    maxLength: 150,
    rules: [
      "Specific — not 'bone tumour' but 'osteosarcoma of the distal femur'",
      "Include location where relevant",
      "Use standard radiological/pathological terminology",
      "For multi-component cases, list all components (e.g. 'T11/12 discitis osteomyelitis with phlegmon/abscess, right pleural empyema, multifocal lung infection/septic emboli')",
      "For cases with both primary and incidental diagnoses, list the primary first",
    ],
  },

  differentials: {
    count: 3,
    rules: [
      "Exactly 3 differentials",
      "Each includes a discriminating feature in parentheses",
      "Include one 'must-not-miss' differential (e.g. malignancy, infection)",
      "Format: 'Diagnosis (discriminating feature)'",
      "Differentials must require compartment-based reasoning — not a random list",
      "Should reflect conditional thinking: 'If the patient is X, then Y' (from 100 Cases book approach)",
    ],
    example: [
      "Ewing sarcoma (permeative destruction with periosteal reaction in patient <20)",
      "Osteomyelitis (clinical context of fever/elevated inflammatory markers)",
      "Lymphoma of bone (soft tissue mass without matrix mineralisation)",
    ],
  },

  nextSteps: {
    description:
      "3-4 sentences covering referral pathway, further imaging, and initial management. Must be specific, not generic.",
    minSentences: 3,
    maxSentences: 4,
    rules: [
      "Include SPECIFIC specialist referral (not just 'refer to specialist' but 'urgent neurosurgical referral')",
      "Mention further imaging with specific modality and reason (e.g. 'urgent MRI spine to assess for epidural abscess/cord compression')",
      "Include initial management considerations (e.g. 'pleural fluid aspiration under US guidance')",
      "Reflect current UK radiology practice and MDT pathways",
      "For oncology cases, include biopsy approach and staging requirements",
      "For emergency cases, include urgency of communication with referrer",
    ],
  },

  keyBullets: {
    count: 8,
    description:
      "Maps to Radiopaedia scoring: 5/8 bullets = score 7 (pass), 7/8 bullets = score 8 (clear pass). These are the specific findings/actions that discriminate between pass and fail.",
    rules: [
      "Exactly 8 key findings/observations the examiner expects",
      "Ordered by importance",
      "Includes both positive findings and important negatives",
      "Must include at least 1 management/referral bullet",
      "Must include at least 1 incidental finding bullet where applicable",
      "Each bullet is concise (one line)",
      "These must be case-specific — not generic findings that apply to any case",
    ],
  },

  importantNegatives: {
    count: 5,
    description:
      "Things the examiner expects you to actively exclude. Mentioning important normal structures consistently earns marks in real exams.",
    rules: [
      "Exactly 5 important negatives",
      "Things that would change management if present",
      "Demonstrates systematic approach to interpretation",
      "Must be case-specific — different negatives for different pathologies",
      "Should include structural integrity (e.g. 'no cord compression'), absence of complications (e.g. 'no perforation'), and staging negatives (e.g. 'no lymphadenopathy')",
    ],
    example: [
      "No fracture or dislocation",
      "No soft tissue mass",
      "No periosteal reaction",
      "Normal joint spaces",
      "No pathological lymphadenopathy",
    ],
  },

  examPearl: {
    description:
      "2-3 sentences of high-yield exam knowledge with at least one [n] textbook reference.",
    minSentences: 2,
    maxSentences: 3,
    rules: [
      "Must contain at least one textbook reference in [n] format",
      "High-yield, exam-focused knowledge",
      "Factually accurate and clinically relevant",
      "Should include a discriminating fact that separates this diagnosis from its closest mimics",
    ],
  },

  scoringGuide: {
    description:
      "CASE-SPECIFIC scoring rubric based on Radiopaedia marking scheme (scores 4-8). Must be tailored to each case — not a generic template.",
    rules: [
      "Score descriptions must reference the SPECIFIC diagnoses and findings for this case",
      "Score 6 vs 7 boundary must be clearly defined by secondary findings and key bullets",
      "Score 7 vs 8 boundary must be defined by important negatives and management comprehensiveness",
      "Must reflect the actual discriminating difficulty of the case",
    ],
    template: {
      score4:
        "Fails to identify the primary diagnosis or describes findings that do not support any reasonable diagnosis.",
      score5:
        "Identifies the primary diagnosis but with significant omissions or inaccuracies in findings.",
      score6:
        "Correctly identifies the primary diagnosis with adequate findings but misses secondary pathology or important negatives.",
      score7:
        "Correctly identifies primary diagnosis and secondary findings. Describes 5/8 key bullets.",
      score8:
        "Comprehensive answer with primary and secondary diagnoses, 7/8 key bullets, important negatives, and appropriate management.",
    },
    exampleCaseSpecific: {
      caseContext: "T11/12 discitis with empyema (from Radiopaedia)",
      score4: "Fails to recognise lung changes, pleural effusion or spinal abnormality",
      score5:
        "Describes lung changes and pleural effusion. Recognises spinal abnormality but doesn't consider discitis",
      score6:
        "Correctly identifies discitis, pleural collection and parenchymal lung changes",
      score7:
        "Correctly identifies discitis, empyema and lung infection (or septic emboli) with 5 of 8 bullets",
      score8:
        "Correctly identifies discitis, empyema and lung infection (or septic emboli) with 7 of 8 bullets",
    },
  },
  mnemonicIntegration: {
    description:
      "Integration rules for aligning long case content with mnemonics from 'Mnemonics for Radiologists and FRCR 2B Viva Preparation'. When a case's section maps to a mnemonic chapter, differentials and exam pearls should reference it.",
    rules: [
      "When a mnemonic exists for a case's section, the case's differentials MUST include conditions from the mnemonic's differential list",
      "It is acceptable to narrow the mnemonic list to the 3 most relevant conditions for a specific case, but differentials should not contradict or ignore the mnemonic",
      "The examPearl SHOULD reference the relevant mnemonic name and expand its letters/conditions",
      "Conditional differentials ('If... then...') should use the mnemonic's conditions as the basis for branching",
      "If no mnemonic exists for a case's section, this rule does not apply",
    ],
    mnemonicToSectionMap: {
      // Cardiorespiratory (Chest)
      "STREP ABC": { chapter: 1, sections: ["ILD"] },
      "LENT": { chapter: 2, sections: ["Cystic Lung disease"] },
      "SDLPVHF": { chapter: 3, sections: ["ILD"] },
      "CAVITIES": { chapter: 4, sections: ["Pulmonary Nodules / Masses"] },
      "Test Match Special": { chapter: 5, sections: ["Infections"] },
      "CHASM": { chapter: 6, sections: ["Infections"] },
      "CAT": { chapter: 7, sections: ["Infections"] },
      "4 Ts": { chapter: 8, sections: ["Mediastinum / Hilum"] },
      "METAL": { chapter: 9, sections: ["Pleural Disease"] },
      "PSALM": { chapter: 10, sections: ["Cystic Lung disease"] },
      "CLAMP": { chapter: 11, sections: ["Pleural Disease"] },
      "CEPI": { chapter: 12, sections: ["Systemic inflammatory"] },
      "HAPPY": { chapter: 13, sections: ["Infections"] },
      "SLIPS": { chapter: 14, sections: ["Systemic inflammatory"] },
      "CUBS": { chapter: 15, sections: ["Vascular Disease"] },
      // Musculoskeletal (MSK)
      "ROMPS": { chapter: 16, sections: ["Metabolic endocrine systemic"] },
      "FOG MACHINES": { chapter: 17, sections: ["Bone tumours DDx"] },
      "FEGNOMASHIC": { chapter: 18, sections: ["Bone tumours - benign"] },
      "LOSE ME": { chapter: 19, sections: ["Bone tumours - Malignant"] },
      "GOCCI": { chapter: 20, sections: ["Bone tumours - benign"] },
      "Five Ms": { chapter: 21, sections: ["Bone tumours DDx"] },
      "AMEND": { chapter: 22, sections: ["Bone tumours - benign"] },
      "SHIRT": { chapter: 23, sections: ["Arthopathies"] },
      "TIPS": { chapter: 24, sections: ["Bone Tumours - Syndromes and others"] },
      "PINCH FO": { chapter: 25, sections: ["Arthopathies"] },
      "PRION": { chapter: 26, sections: ["Bone Tumours - Syndromes and others"] },
      "HALT V": { chapter: 27, sections: ["Bone tumours DDx"] },
      "SAD GITS": { chapter: 28, sections: ["Metabolic endocrine systemic"] },
      // Gastrointestinal (GI)
      "HAFM": { chapter: 29, sections: ["Hepato-biliary"] },
      "PAGES": { chapter: 30, sections: ["Hepato-biliary"] },
      "CLCTA": { chapter: 31, sections: ["Colon + Rectum + Appendix"] },
      "CUBIC": { chapter: 32, sections: ["Colon + Rectum + Appendix"] },
      "SCALD": { chapter: 33, sections: ["Peritoneum Mesentry and retroperitoneum vascular"] },
      // Genitourinary (GU)
      "POSTCARDS": { chapter: 34, sections: ["Renal Masses"] },
      "MARSH": { chapter: 35, sections: ["Renal Masses"] },
      // Neuroradiology (Neuro)
      "MAGIC DR": { chapter: 36, sections: ["Infectious / Inflammatory"] },
      "SAME": { chapter: 37, sections: ["Benign Tumours"] },
      "CRAMP": { chapter: 38, sections: ["Benign Tumours"] },
      "FITCH": { chapter: 39, sections: ["Malignant Tumours"] },
      "MATCH": { chapter: 40, sections: ["Vascular / Haemorrhage"] },
      "ALICE": { chapter: 41, sections: ["Vascular / Haemorrhage"] },
      "I HEAL": { chapter: 42, sections: ["Spinal cord and canal"] },
      "MENDS": { chapter: 43, sections: ["Spinal cord and canal"] },
      "MEDAL": { chapter: 44, sections: ["Spinal cord and canal"] },
      // Paediatrics (Paeds)
      "SLOP": { chapter: 45, sections: ["Paediatrics - MSK"] },
      "LEMON": { chapter: 46, sections: ["Paediatrics - MSK"] },
      "PORKCHOPS": { chapter: 47, sections: ["Paediatrics - MSK"] },
      "GAME": { chapter: 48, sections: ["Paediatrics - Neuro"] },
      "WHAM": { chapter: 49, sections: ["Paediatrics - GI"] },
      "HIMAP": { chapter: 50, sections: ["Paediatrics - GI"] },
    },
  },
  obrienIntegration: {
    description:
      "Integration rules for aligning long case content with O'Brien 'Top 3 Differentials in Radiology' (textbook ref #7). Query differentialPatterns table by section to find relevant top-3 differential lists.",
    rules: [
      "When an O'Brien differential pattern exists for a case's imaging pattern, the case's differentials SHOULD include at least 2 of the O'Brien top-3 diagnoses",
      "The differentialPatterns table maps imaging patterns to top-3 + additional diagnoses — use as a cross-reference during case population",
      "O'Brien patterns complement (not replace) mnemonic-based differentials — use both sources",
      "Cases sourced from O'Brien should have textbookRefs: [7]",
    ],
    coveredCategories: ["Chest", "GI", "GU", "MSK", "ENT", "Neuro", "Paeds", "Breast"],
    totalPatterns: 200,
  },
} as const;

/**
 * Valid section names per category — used for validation.
 * Must match exactly the section names in sectionsSeed.ts.
 */
export const VALID_SECTIONS: Record<string, string[]> = {
  Gen: [
    "Default Section",
    "MRI Signal",
    "Staging - cancer",
    "Staging - Trauma",
    "Classifications",
    "Follow Up",
    "Syndromes",
  ],
  Paeds: [
    "Paediatrics - chest",
    "Paediatrics - GI",
    "Paediatrics - Kidneys",
    "Paediatrics - Neuro",
    "Paediatrics - MSK",
    "Paediatrics - Cardiac",
    "Paediatrics - Head and Neck",
    "Paediatrics - Systemic like Haem",
  ],
  MSK: [
    "Trauma + Fractures",
    "Arthopathies",
    "Bone tumours - benign",
    "Bone tumours - Malignant",
    "Bone tumours DDx",
    "Bone Tumours - Pseudotumours",
    "Bone Tumours - Syndromes and others",
    "Metabolic endocrine systemic",
    "Soft tissue / muscle",
    "Spine",
  ],
  Neuro: [
    "Benign Tumours",
    "Malignant Tumours",
    "Vascular / Haemorrhage",
    "Infectious / Inflammatory",
    "White matter and demyelination",
    "Metabolic",
    "Neurodegenerative",
    "Congenital and Structural",
    "Hydrocephalus + Cysts",
    "Seizure related pathology",
    "Spinal cord and canal",
    "Trauma",
  ],
  Chest: [
    "ILD",
    "Cystic Lung disease",
    "Obstructive / Airway",
    "Infections",
    "Pulmonary Nodules / Masses",
    "Transplant",
    "Pleural Disease",
    "Vascular Disease",
    "Occupational / Environmental",
    "Mediastinum / Hilum",
    "Trauma",
    "Systemic inflammatory",
  ],
  Cardiac: [
    "Ischaemic",
    "Cardiomyopathies",
    "Masses",
    "Pericardial",
    "Valve",
  ],
  Vasc: [
    "Vasculitis",
  ],
  GI: [
    "Oesphagus",
    "Stomach and Duodenum",
    "Small Bowel",
    "Colon + Rectum + Appendix",
    "Hepato-biliary",
    "Spleen",
    "Pancreas",
    "Peritoneum Mesentry and retroperitoneum vascular",
    "Post-operative and IR",
  ],
  GU: [
    "Renal Masses",
    "Renal Cysts and cystic disease",
    "Infection and inflammatory",
    "Obstruction and stones",
    "Renovascular + Trauma",
    "Bladder and Prostate",
    "Adrenal lesions",
    "Testes",
  ],
  Breast: [
    "Benign masses",
    "Malignant lesions",
    "Implants and complications",
    "Post treatment appearances",
    "Infection and Inflammatory",
  ],
  Gynae: [
    "Uterus - benign",
    "Vagina masses",
    "Uterus - Malignant",
    "Ovarian - cystic benign",
    "Ovarian - Malignant / borderline",
    "Miscellaneous / Emergencies",
  ],
  ENT: [
    "Ear and Temporal Bone",
    "Sinonasal",
    "Jaw and Oral Cavity",
    "Salivary Glands",
    "Neck Masses",
    "Pharynx and Larynx",
    "Thyroid and Parathyroid",
    "Skull base",
    "Rare",
  ],
  Orbits: [
    "Orbits",
  ],
};

/** Maximum valid textbook reference number */
export const MAX_TEXTBOOK_REF = 19;
