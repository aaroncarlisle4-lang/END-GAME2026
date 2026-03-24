import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    abbreviation: v.string(),
    examSection: v.string(),
    caseCount: v.number(),
  }).index("by_abbreviation", ["abbreviation"]),

  longCases: defineTable({
    categoryId: v.id("categories"),
    caseNumber: v.number(),
    title: v.string(),
    section: v.optional(v.string()),
    modality: v.string(),
    clinicalHistory: v.string(),
    findings: v.string(),
    interpretation: v.string(),
    diagnosis: v.string(),
    differentials: v.array(v.string()),
    nextSteps: v.string(),
    keyBullets: v.array(v.string()),
    importantNegatives: v.array(v.string()),
    difficulty: v.string(),
    hasDiscriminator: v.boolean(),
    textbookRefs: v.array(v.number()),
    examPearl: v.string(),
    nuclearMedicine: v.boolean(),
    scoringGuide: v.optional(v.object({
      score4: v.string(),
      score5: v.string(),
      score6: v.string(),
      score7: v.string(),
      score8: v.string(),
    })),
    // Problem category: emergency | staging | characterisation | incidental | chronic | congenital
    problemCategory: v.optional(v.string()),
    // Structured viva presentation — "thinking out loud" OSCE-style script
    vivaPresentation: v.optional(v.object({
      opening: v.string(),        // "This is a [modality] of a [age/sex] showing..."
      anchorStatement: v.string(), // The key finding you anchor on first
      systemicApproach: v.string(), // How you systematically describe the rest
      synthesis: v.string(),        // Linking findings → diagnosis
      differentialReasoning: v.string(), // "If this were X, I'd expect... but instead I see..."
      clinicalUrgency: v.string(), // Emergency/urgent/routine + why
      examinerTip: v.string(),     // What the examiner is listening for
    })),
    // Categorised important negatives with urgency context
    negativesContext: v.optional(v.object({
      emergencyExclusions: v.array(v.string()),   // Must-exclude-NOW findings (cord compression, perforation, etc.)
      stagingNegatives: v.array(v.string()),       // Staging-relevant negatives (no mets, no nodes)
      complicationNegatives: v.array(v.string()),  // Complications to actively exclude
      incidentalNegatives: v.array(v.string()),    // Normal structures to mention for marks
    })),
    // Mnemonic link — direct reference to mnemonics table if applicable
    hasMnemonic: v.optional(v.boolean()),
    mnemonicRef: v.optional(v.object({
      mnemonic: v.string(),       // e.g. "FOG MACHINES"
      chapterNumber: v.number(),  // links to mnemonics table by chapterNumber
      pattern: v.string(),        // e.g. "Multiple lucent bone lesions"
    })),
    // Synthesized model answers — drawn from building blocks above
    modelAnswer: v.optional(v.string()),       // Structured written report (FINDINGS → DIAGNOSIS → DDx → NEGATIVES → MANAGEMENT → PEARL)
    vivaModelAnswer: v.optional(v.string()),   // Flowing spoken narrative for viva component
  })
    .index("by_category", ["categoryId"])
    .index("by_caseNumber", ["caseNumber"])
    .index("by_difficulty", ["difficulty"])
    .index("by_section", ["section"])
    .index("by_problemCategory", ["problemCategory"]),

  discriminators: defineTable({
    longCaseId: v.optional(v.id("longCases")),
    pattern: v.string(),
    differentials: v.array(
      v.object({
        diagnosis: v.string(),
        mnemonicLetter: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
        dominantImagingFinding: v.optional(v.string()),
        distributionLocation: v.optional(v.string()),
        demographicsClinicalContext: v.optional(v.string()),
        discriminatingKeyFeature: v.optional(v.string()),
        associatedFindings: v.optional(v.string()),
        complicationsSeriousAlternatives: v.optional(v.string()),
        isCorrectDiagnosis: v.optional(v.boolean()),
        dahnertConditionSlug: v.optional(v.string()), // links to dahnertConditions.slug
        // Old fields for backward compatibility during migration
        keyImagingPattern: v.optional(v.string()),
        distribution: v.optional(v.string()),
        clinicalContext: v.optional(v.string()),
        keyDiscriminator: v.optional(v.string()),
      })
    ),
    seriousAlternatives: v.optional(v.array(v.string())),
    // Links to mnemonic chapter if applicable
    mnemonicRef: v.optional(v.object({
      mnemonic: v.string(),       // e.g. "FOG MACHINES"
      chapterNumber: v.number(),  // links to mnemonics table
      expandedLetters: v.string(), // e.g. "F=Fibrous dysplasia, O=Osteomyelitis..."
    })),
    // Links to O'Brien differential pattern if applicable
    obrienRef: v.optional(v.object({
      obrienCaseNumber: v.number(), // links to differentialPatterns table
      pattern: v.string(),           // the O'Brien imaging pattern name
      top3Alignment: v.string(),     // how this case's differentials align with O'Brien top-3
    })),
    // Problem cluster for differential reasoning
    problemCluster: v.optional(v.string()), // e.g. "aggressive bone lesion", "erosive arthropathy", "metabolic bone disease"
  })
    .index("by_longCaseId", ["longCaseId"])
    .index("by_pattern", ["pattern"]),

  rapidCases: defineTable({
    categoryId: v.id("categories"),
    caseNumber: v.number(),
    title: v.string(),
    modality: v.string(),
    keyFinding: v.string(),
    diagnosis: v.string(),
    examPearl: v.string(),
    importantNegatives: v.array(v.string()),
    difficulty: v.string(),
    textbookRefs: v.array(v.number()),
    // Rapid expansion fields
    subsection: v.optional(v.string()),      // DDx problem type (e.g. "Acute aortic syndrome")
    parentGroup: v.optional(v.string()),     // Anatomical grouping (e.g. "Mediastinum")
    packet: v.optional(v.number()),          // Packet number within category
    packetOrder: v.optional(v.number()),     // Position within packet
    shellStatus: v.optional(v.string()),     // "shell" | "sourced" | "imaged" | "complete"
    radByte: v.optional(v.object({
      clinicalContext: v.string(),           // 1-line scenario: "72F, acute chest pain"
      primarySign: v.string(),              // THE finding: "Widened mediastinum"
      systematicReview: v.array(v.string()), // 3-5 bullets, anatomy-based checklist
      reportConclusion: v.string(),         // 1-2 sentence structured conclusion
      urgency: v.string(),                  // "emergency" | "urgent" | "routine"
      followUp: v.optional(v.string()),     // Next imaging/action
    })),
    radiopaediaSource: v.optional(v.object({
      caseId: v.optional(v.number()),       // Radiopaedia case ID
      caseUrl: v.optional(v.string()),      // Full URL
      author: v.optional(v.string()),       // Contributing author
      licence: v.optional(v.string()),      // CC licence type
    })),
  })
    .index("by_category", ["categoryId"])
    .index("by_caseNumber", ["caseNumber"])
    .index("by_difficulty", ["difficulty"])
    .index("by_subsection", ["subsection"])
    .index("by_packet", ["categoryId", "packet"])
    .index("by_shellStatus", ["shellStatus"]),

  vivaFramework: defineTable({
    category: v.string(),
    context: v.string(),
    phrases: v.array(v.string()),
    examples: v.array(v.string()),
    subcategory: v.optional(v.string()),
    specialty: v.optional(v.string()),
    sourceRef: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_specialty", ["specialty"]),

  sections: defineTable({
    categoryAbbreviation: v.string(),
    name: v.string(),
    description: v.string(),
    sortOrder: v.number(),
  })
    .index("by_category", ["categoryAbbreviation"])
    .index("by_name", ["name"]),

  mnemonics: defineTable({
    chapterNumber: v.number(),
    bookSection: v.string(),
    categoryAbbreviation: v.string(),
    pattern: v.string(),
    mnemonic: v.string(),
    differentials: v.array(
      v.object({
        letter: v.string(),
        condition: v.string(),
        associatedFeatures: v.string(),
      })
    ),
    modelAnswer: v.string(),
    pearls: v.array(v.string()),
    relatedSections: v.array(v.string()),
  })
    .index("by_chapter", ["chapterNumber"])
    .index("by_category", ["categoryAbbreviation"])
    .index("by_pattern", ["pattern"]),

  differentialPatterns: defineTable({
    obrienCaseNumber: v.number(),
    categoryAbbreviation: v.string(),
    section: v.string(),
    pattern: v.string(),
    diagnosis: v.string(),
    clinicalPresentation: v.string(),
    top3: v.array(v.string()),
    additional: v.array(v.string()),
    dahnertDdxSlug: v.optional(v.string()), // links to dahnertDDxClusters.slug
  })
    .index("by_category", ["categoryAbbreviation"])
    .index("by_section", ["section"])
    .index("by_caseNumber", ["obrienCaseNumber"])
    .index("by_pattern", ["pattern"]),

  chapmanACE: defineTable({
    itemNumber: v.string(),
    categoryAbbreviation: v.string(),
    pattern: v.string(),
    families: v.array(
      v.object({
        familyName: v.string(),
        diagnoses: v.array(v.string()),
      })
    ),
    additionalNotes: v.optional(v.string()),
  })
    .index("by_category", ["categoryAbbreviation"])
    .index("by_itemNumber", ["itemNumber"])
    .index("by_pattern", ["pattern"]),

  radiopaediaPlaylists: defineTable({
    playlistId: v.string(),
    name: v.string(),
    authorName: v.string(),
    url: v.string(),
    caseCount: v.number(),
    targetCategories: v.array(v.string()),
    notes: v.optional(v.string()),
  }).index("by_author", ["authorName"]),

  studyImages: defineTable({
    sourceType: v.union(
      v.literal("differentialPattern"),
      v.literal("mnemonic"),
      v.literal("chapman"),
      v.literal("rapidCase")
    ),
    sourceId: v.string(),
    storageId: v.optional(v.id("_storage")),
    externalUrl: v.optional(v.string()),
    s3Key: v.optional(v.string()),
    s3Bucket: v.optional(v.string()),
    storageProvider: v.optional(v.union(
      v.literal("convex"),
      v.literal("external"),
      v.literal("s3")
    )),
    caption: v.optional(v.string()),
    caseGroup: v.optional(v.string()),
    attribution: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_source", ["sourceType", "sourceId"]),

  studyManifests: defineTable({
    sourceType: v.union(
      v.literal("differentialPattern"),
      v.literal("mnemonic"),
      v.literal("chapman"),
      v.literal("rapidCase")
    ),
    sourceId: v.string(),
    caseGroup: v.string(),
    attribution: v.optional(v.string()),
    storageProvider: v.union(
      v.literal("convex"),
      v.literal("external"),
      v.literal("s3")
    ),
    slices: v.array(v.object({
      url: v.string(),
      storageId: v.optional(v.id("_storage")),
      s3Key: v.optional(v.string()),
      caption: v.optional(v.string()),
      sortOrder: v.number(),
    })),
    createdAt: v.number(),
  })
    .index("by_source", ["sourceType", "sourceId"]),

  imageAnnotations: defineTable({
    imageId: v.string(),
    x1: v.number(),
    y1: v.number(),
    x2: v.number(),
    y2: v.number(),
    captionRotation: v.number(),
    captionWidth: v.optional(v.number()), // SVG user units (% of image width), default 16
    text: v.string(),
  }).index("by_imageId", ["imageId"]),

  pendingNotes: defineTable({
    discriminatorId: v.id("discriminators"),
    differentialIndex: v.number(),
    field: v.string(),
    rawText: v.string(),
    source: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("processed")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_discriminator", ["discriminatorId"])
    .index("by_status_discriminator", ["status", "discriminatorId"]),

  textbookReferences: defineTable({
    refNumber: v.number(),
    shortName: v.string(),
    fullTitle: v.string(),
    authors: v.string(),
    primaryUseCase: v.string(),
  }).index("by_refNumber", ["refNumber"]),

  textbookKnowledge: defineTable({
    // Core Identity
    entityName: v.string(),             // e.g., "Acute Cholecystitis", "Osteosarcoma"
    category: v.string(),               // e.g., "GI", "MSK", "Neuro", "Cardiac"
    
    // Structured Modality Findings
    radiographicFeatures: v.object({
      xray: v.optional(v.array(v.string())),        // Explicit X-Ray / Plain Film findings
      us: v.optional(v.array(v.string())),          // Ultrasound findings
      ct: v.optional(v.array(v.string())),          // CT findings
      mri: v.optional(v.array(v.string())),         // MRI findings
      fluoroscopy: v.optional(v.array(v.string())), // Fluoroscopy / Barium studies
      nuclearMedicine: v.optional(v.array(v.string())), // PET/SPECT/Scintigraphy
    }),
    
    // Clinical Context
    clinicalData: v.object({
      demographics: v.optional(v.array(v.string())), // Age, gender predilections
      associations: v.optional(v.array(v.string())), // Syndromes, risk factors
      cardinalSigns: v.optional(v.array(v.string())), // The "Aunt Minnie" or classic signs
    }),
    
    // RAG specific fields
    rawTextChunk: v.string(),           // The synthesized markdown/text passage used for the embedding
    embedding: v.array(v.float64()),    // The vector representation (e.g., 1536 dims)
    pageNumber: v.optional(v.number()),  // The primary page number from the PDF
    sourceReference: v.optional(v.string()), // e.g., "Dahnert Review Manual - GI Section"

    // Multi-source & quality fields
    sourceBook: v.optional(v.string()),      // "dahnert" | "radquiz-cases" | "chapman" | "obrien" | "mnemonics"
    sourceText: v.optional(v.string()),      // Raw PDF text (for re-refinement)
    qualityScore: v.optional(v.number()),    // 0-10 computed quality metric
  })
    .index("by_category", ["category"])
    .index("by_entityName", ["entityName"])
    .index("by_sourceBook", ["sourceBook"])
    .searchIndex("search_text", {
      searchField: "rawTextChunk",
      filterFields: ["category", "sourceBook"],
    })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["category", "sourceBook"],
    }),

  highYieldClusters: defineTable({
    category: v.string(),
    clusterName: v.string(),
    sortOrder: v.number(),
    sourceType: v.union(v.literal("pattern"), v.literal("mnemonic")),
    patternId: v.optional(v.id("differentialPatterns")),
    mnemonicId: v.optional(v.id("mnemonics")),
    dahnertDdxSlug: v.optional(v.string()), // links to dahnertDDxClusters.slug
  }).index("by_category", ["category"]),

  searchCache: defineTable({
    query: v.string(),
    embedding: v.array(v.float64()),
    results: v.array(v.id("textbookKnowledge")),
    createdAt: v.number(),
  }).index("by_query", ["query"]),

  dahnertDDxClusters: defineTable({
    finding: v.string(),          // "Solitary Pulmonary Nodule"
    slug: v.string(),             // unique, deduped key
    chapter: v.string(),          // Dahnert chapter / section heading
    clusterType: v.string(),      // "differential" | "framework" | "mixed"
    qualityScore: v.number(),     // 0.0–1.0 from extraction pipeline
    differentials: v.array(v.object({
      name: v.string(),                          // diagnosis name
      rank: v.number(),                          // list position (frequency proxy)
      frequency: v.optional(v.string()),
      // Dahnert condition enrichment (populated by enrich script)
      conditionSlug: v.optional(v.string()),     // links to dahnertConditions.slug
      definition: v.optional(v.string()),
      dominantFinding: v.optional(v.string()),
      distribution: v.optional(v.string()),
      demographics: v.optional(v.string()),      // joined demographics string
      discriminatingFeatures: v.optional(v.array(v.string())),
    })),
    context: v.optional(v.string()), // extra context text from source
  })
    .index("by_slug", ["slug"])
    .index("by_finding", ["finding"])
    .index("by_chapter", ["chapter"])
    .index("by_quality", ["qualityScore"]),

  dahnertConditions: defineTable({
    name: v.string(),                         // "GLIOBLASTOMA MULTIFORME"
    slug: v.string(),                         // "glioblastoma_multiforme" — unique source key
    chapter: v.string(),                      // Dahnert chapter heading
    definition: v.optional(v.string()),
    demographics: v.optional(v.array(v.string())),  // ["Age: peak 65-75 years", "M:F = 3:2"]
    dominantFinding: v.optional(v.string()),
    distribution: v.optional(v.string()),
    discriminatingFeatures: v.array(v.string()),
    modalityFindings: v.object({
      general:  v.optional(v.array(v.string())),
      xray:     v.optional(v.array(v.string())),
      cxr:      v.optional(v.array(v.string())),
      ct:       v.optional(v.array(v.string())),
      cect:     v.optional(v.array(v.string())),
      nect:     v.optional(v.array(v.string())),
      hrct:     v.optional(v.array(v.string())),
      mri:      v.optional(v.array(v.string())),
      us:       v.optional(v.array(v.string())),
      angio:    v.optional(v.array(v.string())),
      nuc:      v.optional(v.array(v.string())),
      pet:      v.optional(v.array(v.string())),
    }),
    clinical: v.optional(v.array(v.string())), // ["Rx: surgery + radiation", "Prognosis: 16 months"]
  })
    .index("by_slug", ["slug"])
    .index("by_chapter", ["chapter"])
    .index("by_name", ["name"]),
});
