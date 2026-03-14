import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// CATEGORIES
// ============================================================
const CATEGORIES = [
  { name: "Musculoskeletal", abbreviation: "MSK", examSection: "long", caseCount: 40 },
  { name: "Neuroradiology", abbreviation: "Neuro", examSection: "long", caseCount: 40 },
  { name: "Paediatrics", abbreviation: "Paeds", examSection: "long", caseCount: 40 },
  { name: "Genitourinary", abbreviation: "GU", examSection: "long", caseCount: 40 },
  { name: "Chest", abbreviation: "Chest", examSection: "long", caseCount: 40 },
  { name: "Gastrointestinal", abbreviation: "GI", examSection: "long", caseCount: 40 },
  { name: "ENT & Head and Neck", abbreviation: "ENT", examSection: "long", caseCount: 25 },
  { name: "Breast", abbreviation: "Breast", examSection: "long", caseCount: 25 },
  { name: "Ultrasound", abbreviation: "US", examSection: "long", caseCount: 25 },
  { name: "Vascular & IR", abbreviation: "VIR", examSection: "long", caseCount: 25 },
  { name: "Nuclear Medicine", abbreviation: "NucMed", examSection: "long", caseCount: 25 },
  { name: "Gynaecology", abbreviation: "Gynae", examSection: "long", caseCount: 0 },
  { name: "Cardiac", abbreviation: "Cardiac", examSection: "long", caseCount: 0 },
  { name: "Chest X-Ray Rapid", abbreviation: "CXR", examSection: "rapid", caseCount: 30 },
  { name: "MSK Plain Film Rapid", abbreviation: "MSK-Rapid", examSection: "rapid", caseCount: 30 },
  { name: "Paediatric MSK Rapid", abbreviation: "Paeds-MSK", examSection: "rapid", caseCount: 30 },
  { name: "Paediatric CXR Rapid", abbreviation: "Paeds-CXR", examSection: "rapid", caseCount: 0 },
  { name: "Abdominal X-Ray Rapid", abbreviation: "AXR", examSection: "rapid", caseCount: 0 },
];

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if categories already exist
    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) {
      return { status: "skipped", message: "Categories already seeded", count: existing.length };
    }
    for (const cat of CATEGORIES) {
      await ctx.db.insert("categories", cat);
    }
    return { status: "success", count: CATEGORIES.length };
  },
});

// ============================================================
// LONG CASES - placeholder, will be populated by seedLongCases
// ============================================================

// Helper type for case data without categoryId (added at insert time)
type LongCaseData = {
  caseNumber: number;
  title: string;
  section: string;
  modality: string;
  clinicalHistory: string;
  findings: string;
  interpretation: string;
  diagnosis: string;
  differentials: string[];
  nextSteps: string;
  keyBullets: string[];
  importantNegatives: string[];
  difficulty: string;
  hasDiscriminator: boolean;
  textbookRefs: number[];
  examPearl: string;
  nuclearMedicine: boolean;
  scoringGuide?: {
    score4: string;
    score5: string;
    score6: string;
    score7: string;
    score8: string;
  };
};

// Seed long cases for a specific category by abbreviation
export const seedLongCasesBatch = mutation({
  args: {
    categoryAbbreviation: v.string(),
    cases: v.array(
      v.object({
        caseNumber: v.number(),
        title: v.string(),
        section: v.string(),
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", args.categoryAbbreviation))
      .first();
    if (!category) {
      throw new Error(`Category ${args.categoryAbbreviation} not found. Seed categories first.`);
    }
    let count = 0;
    for (const c of args.cases) {
      await ctx.db.insert("longCases", { ...c, categoryId: category._id });
      count++;
    }
    return { status: "success", category: args.categoryAbbreviation, count };
  },
});

// Seed rapid cases for a specific category
export const seedRapidCasesBatch = mutation({
  args: {
    categoryAbbreviation: v.string(),
    cases: v.array(
      v.object({
        caseNumber: v.number(),
        title: v.string(),
        modality: v.string(),
        keyFinding: v.string(),
        diagnosis: v.string(),
        examPearl: v.string(),
        importantNegatives: v.array(v.string()),
        difficulty: v.string(),
        textbookRefs: v.array(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", args.categoryAbbreviation))
      .first();
    if (!category) {
      throw new Error(`Category ${args.categoryAbbreviation} not found. Seed categories first.`);
    }
    let count = 0;
    for (const c of args.cases) {
      await ctx.db.insert("rapidCases", { ...c, categoryId: category._id });
      count++;
    }
    return { status: "success", category: args.categoryAbbreviation, count };
  },
});

// Seed viva framework entries
export const seedVivaFramework = mutation({
  args: {
    entries: v.array(
      v.object({
        category: v.string(),
        context: v.string(),
        phrases: v.array(v.string()),
        examples: v.array(v.string()),
        subcategory: v.optional(v.string()),
        specialty: v.optional(v.string()),
        sourceRef: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("vivaFramework").collect();
    if (existing.length > 0) {
      return { status: "skipped", message: "Viva framework already seeded", count: existing.length };
    }
    for (const entry of args.entries) {
      await ctx.db.insert("vivaFramework", entry);
    }
    return { status: "success", count: args.entries.length };
  },
});

// Utility: clear sections and mnemonics only (for remapping)
export const clearSectionsAndMnemonics = mutation({
  args: {},
  handler: async (ctx) => {
    const counts: Record<string, number> = {};
    for (const table of ["sections", "mnemonics"] as const) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      counts[table] = docs.length;
    }
    return { status: "cleared", counts };
  },
});

// Utility: clear all data (for reseeding)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["categories", "longCases", "rapidCases", "discriminators", "vivaFramework", "sections", "mnemonics", "textbookReferences"] as const;
    const counts: Record<string, number> = {};
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      counts[table] = docs.length;
    }
    return { status: "cleared", counts };
  },
});

// ============================================================
// SECTIONS
// ============================================================
export const seedSectionsBatch = mutation({
  args: {
    sections: v.array(
      v.object({
        categoryAbbreviation: v.string(),
        name: v.string(),
        description: v.string(),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const s of args.sections) {
      await ctx.db.insert("sections", s);
      count++;
    }
    return { status: "success", count };
  },
});

// ============================================================
// MNEMONICS
// ============================================================
export const seedMnemonicsBatch = mutation({
  args: {
    mnemonics: v.array(
      v.object({
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
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const m of args.mnemonics) {
      await ctx.db.insert("mnemonics", m);
      count++;
    }
    return { status: "success", count };
  },
});

// Add new categories without touching existing ones
export const addMissingCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const added: string[] = [];
    for (const cat of CATEGORIES) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_abbreviation", (q) => q.eq("abbreviation", cat.abbreviation))
        .first();
      if (!existing) {
        await ctx.db.insert("categories", cat);
        added.push(cat.abbreviation);
      }
    }
    return { status: "success", added };
  },
});

// ============================================================
// MIGRATION: Rename category abbreviations
// ============================================================
const ABBREVIATION_REMAP: Record<string, { abbreviation: string; name: string }> = {
  CT: { abbreviation: "Chest", name: "Chest" },
  HN: { abbreviation: "Neuro", name: "Neuroradiology" },
  GV: { abbreviation: "GI", name: "Gastrointestinal" },
  WHGU: { abbreviation: "GU", name: "Genitourinary" },
};

export const migrateCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const changes: string[] = [];
    for (const [oldAbbrev, newData] of Object.entries(ABBREVIATION_REMAP)) {
      const cat = await ctx.db
        .query("categories")
        .withIndex("by_abbreviation", (q) => q.eq("abbreviation", oldAbbrev))
        .first();
      if (cat) {
        await ctx.db.patch(cat._id, { abbreviation: newData.abbreviation, name: newData.name });
        changes.push(`${oldAbbrev} → ${newData.abbreviation}`);
      }
    }
    return { status: "success", changes };
  },
});

// ============================================================
// TEXTBOOK REFERENCES
// ============================================================
export const seedTextbookRefsBatch = mutation({
  args: {
    refs: v.array(
      v.object({
        refNumber: v.number(),
        shortName: v.string(),
        fullTitle: v.string(),
        authors: v.string(),
        primaryUseCase: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const r of args.refs) {
      await ctx.db.insert("textbookReferences", r);
      count++;
    }
    return { status: "success", count };
  },
});

// ============================================================
// RAPID EXPANSION: Migration + Shell Seeding
// ============================================================

// Rename Paeds-Rapid → Paeds-MSK in categories table
export const migrateRapidCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const changes: string[] = [];

    // 1. Rename Paeds-Rapid → Paeds-MSK
    const paedsRapid = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", "Paeds-Rapid"))
      .first();
    if (paedsRapid) {
      await ctx.db.patch(paedsRapid._id, {
        abbreviation: "Paeds-MSK",
        name: "Paediatric MSK Rapid",
      });
      changes.push("Paeds-Rapid → Paeds-MSK");
    }

    // 2. Add Paeds-CXR if missing
    const paedsCxr = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", "Paeds-CXR"))
      .first();
    if (!paedsCxr) {
      await ctx.db.insert("categories", {
        name: "Paediatric CXR Rapid",
        abbreviation: "Paeds-CXR",
        examSection: "rapid",
        caseCount: 0,
      });
      changes.push("Added Paeds-CXR");
    }

    // 3. Add AXR if missing
    const axr = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", "AXR"))
      .first();
    if (!axr) {
      await ctx.db.insert("categories", {
        name: "Abdominal X-Ray Rapid",
        abbreviation: "AXR",
        examSection: "rapid",
        caseCount: 0,
      });
      changes.push("Added AXR");
    }

    return { status: "success", changes };
  },
});

// Seed rapid shells (new cases with shellStatus="shell")
export const seedRapidShellsBatch = mutation({
  args: {
    categoryAbbreviation: v.string(),
    shells: v.array(
      v.object({
        caseNumber: v.number(),
        title: v.string(),
        modality: v.string(),
        diagnosis: v.string(),
        difficulty: v.string(),
        subsection: v.string(),
        parentGroup: v.string(),
        packet: v.number(),
        packetOrder: v.number(),
        // Shell fields left empty
        keyFinding: v.optional(v.string()),
        examPearl: v.optional(v.string()),
        importantNegatives: v.optional(v.array(v.string())),
        textbookRefs: v.optional(v.array(v.number())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", args.categoryAbbreviation))
      .first();
    if (!category) {
      throw new Error(`Category ${args.categoryAbbreviation} not found. Run migrateRapidCategories first.`);
    }
    let count = 0;
    for (const s of args.shells) {
      await ctx.db.insert("rapidCases", {
        categoryId: category._id,
        caseNumber: s.caseNumber,
        title: s.title,
        modality: s.modality,
        keyFinding: s.keyFinding ?? "",
        diagnosis: s.diagnosis,
        examPearl: s.examPearl ?? "",
        importantNegatives: s.importantNegatives ?? [],
        difficulty: s.difficulty,
        textbookRefs: s.textbookRefs ?? [],
        subsection: s.subsection,
        parentGroup: s.parentGroup,
        packet: s.packet,
        packetOrder: s.packetOrder,
        shellStatus: "shell",
      });
      count++;
    }
    // Update category case count
    const allCases = await ctx.db
      .query("rapidCases")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .collect();
    await ctx.db.patch(category._id, { caseCount: allCases.length });

    return { status: "success", category: args.categoryAbbreviation, count };
  },
});

// Backfill existing rapid cases with subsection/parentGroup/packet/shellStatus
export const backfillRapidCaseFields = mutation({
  args: {
    updates: v.array(
      v.object({
        caseNumber: v.number(),
        subsection: v.string(),
        parentGroup: v.string(),
        packet: v.number(),
        packetOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const u of args.updates) {
      const existing = await ctx.db
        .query("rapidCases")
        .withIndex("by_caseNumber", (q) => q.eq("caseNumber", u.caseNumber))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          subsection: u.subsection,
          parentGroup: u.parentGroup,
          packet: u.packet,
          packetOrder: u.packetOrder,
          shellStatus: "complete",
        });
        count++;
      }
    }
    return { status: "success", count };
  },
});
