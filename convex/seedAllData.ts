import { internalMutation, mutation } from "./_generated/server";
import { mskCases } from "./seedData/mskCases";
import { headNeckLongCases } from "./data/headNeckLongCases";
import { paediatricsLongCases } from "./data/paediatricsLongCases";
import { womensHealthGU_longCases } from "./data/womensHealthGU_longCases";
import { cardiothoracicsLongCases } from "./data/cardiothoracicsLongCases";
import { gastroVascularLongCases } from "./data/gastroVascularLongCases";
import { rapidCasesSeed } from "./data/rapidCasesSeed";
import { sectionsSeed } from "./data/sectionsSeed";
import { mnemonicsSeed } from "./data/mnemonicsSeed";
import { textbookRefsSeed } from "./data/textbookRefsSeed";
import { vivaFrameworkSeed } from "./data/vivaFrameworkSeed";
import { differentialPatternsSeed } from "./data/differentialPatternsSeed";
import { obrienLongCaseShells } from "./data/obrienLongCaseShells";
import { chapmanSeed } from "./data/chapmanSeed";

const CATEGORY_CASE_MAP: Record<string, Array<{
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
}>> = {
  MSK: mskCases,
  Neuro: headNeckLongCases,
  Paeds: paediatricsLongCases,
  GU: womensHealthGU_longCases,
  Chest: cardiothoracicsLongCases,
  GI: gastroVascularLongCases,
};

// Seed all long cases for one category
export const seedLongCasesForCategory = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if long cases already exist
    const existing = await ctx.db.query("longCases").first();
    if (existing) {
      return { status: "skipped", message: "Long cases already exist. Run clearAll first to reseed." };
    }

    const results: Record<string, number> = {};

    for (const [abbrev, cases] of Object.entries(CATEGORY_CASE_MAP)) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_abbreviation", (q) => q.eq("abbreviation", abbrev))
        .first();
      if (!category) {
        throw new Error(`Category ${abbrev} not found`);
      }
      let count = 0;
      for (const c of cases) {
        await ctx.db.insert("longCases", { ...c, categoryId: category._id });
        count++;
      }
      results[abbrev] = count;
    }

    return { status: "success", results };
  },
});

// Seed all rapid cases
export const seedAllRapidCases = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("rapidCases").first();
    if (existing) {
      return { status: "skipped", message: "Rapid cases already exist. Run clearAll first to reseed." };
    }

    const results: Record<string, number> = {};

    for (const c of rapidCasesSeed) {
      const abbrev = (c as any).categoryAbbrev as string;
      const category = await ctx.db
        .query("categories")
        .withIndex("by_abbreviation", (q) => q.eq("abbreviation", abbrev))
        .first();
      if (!category) {
        throw new Error(`Category ${abbrev} not found`);
      }
      // Remove categoryAbbrev and add categoryId
      const { categoryAbbrev, ...caseData } = c as any;
      await ctx.db.insert("rapidCases", {
        ...caseData,
        categoryId: category._id,
        // Ensure all required fields exist
        importantNegatives: caseData.importantNegatives || [],
        textbookRefs: caseData.textbookRefs || [],
      });
      results[abbrev] = (results[abbrev] || 0) + 1;
    }

    return { status: "success", results };
  },
});

// Seed all sections
export const seedAllSections = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sections").first();
    if (existing) {
      return { status: "skipped", message: "Sections already exist. Run clearAll first to reseed." };
    }
    let count = 0;
    for (const s of sectionsSeed) {
      await ctx.db.insert("sections", s);
      count++;
    }
    return { status: "success", count };
  },
});

// Seed all mnemonics
export const seedAllMnemonics = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("mnemonics").first();
    if (existing) {
      return { status: "skipped", message: "Mnemonics already exist. Run clearAll first to reseed." };
    }
    let count = 0;
    for (const m of mnemonicsSeed) {
      await ctx.db.insert("mnemonics", m);
      count++;
    }
    return { status: "success", count };
  },
});

// Seed all textbook references
export const seedAllTextbookRefs = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("textbookReferences").first();
    if (existing) {
      return { status: "skipped", message: "Textbook references already exist. Run clearAll first to reseed." };
    }
    let count = 0;
    for (const r of textbookRefsSeed) {
      await ctx.db.insert("textbookReferences", r);
      count++;
    }
    return { status: "success", count };
  },
});

// Seed all viva framework entries (expanded ~50 records)
export const seedAllVivaFramework = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing viva framework entries first (replacing old 6 with expanded set)
    const existing = await ctx.db.query("vivaFramework").collect();
    for (const entry of existing) {
      await ctx.db.delete(entry._id);
    }
    let count = 0;
    for (const entry of vivaFrameworkSeed) {
      await ctx.db.insert("vivaFramework", entry);
      count++;
    }
    return { status: "success", count, replaced: existing.length };
  },
});

// Seed all Chapman ACE differentials
export const seedAllChapmanACE = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("chapmanACE").first();
    if (existing) {
      return { status: "skipped", message: "Chapman ACE differentials already exist. Clear first to reseed." };
    }
    let count = 0;
    for (const item of chapmanSeed) {
      await ctx.db.insert("chapmanACE", item);
      count++;
    }
    return { status: "success", count };
  },
});

// Seed all differential patterns (O'Brien Top 3)
export const seedAllDifferentialPatterns = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("differentialPatterns").first();
    if (existing) {
      return { status: "skipped", message: "Differential patterns already exist. Clear first to reseed." };
    }
    let count = 0;
    for (const dp of differentialPatternsSeed) {
      await ctx.db.insert("differentialPatterns", dp);
      count++;
    }
    return { status: "success", count };
  },
});

// Seed O'Brien long case shells (325 cases across 13 categories)
export const seedObrienLongCases = mutation({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    for (const [abbrev, cases] of Object.entries(obrienLongCaseShells)) {
      // "Classics" cases span multiple categories — skip if no matching category
      const category = await ctx.db
        .query("categories")
        .withIndex("by_abbreviation", (q) => q.eq("abbreviation", abbrev))
        .first();
      if (!category) {
        results[abbrev] = -1; // skipped — no matching category
        continue;
      }
      let count = 0;
      for (const c of cases) {
        await ctx.db.insert("longCases", { ...c, categoryId: category._id });
        count++;
      }
      results[abbrev] = count;
    }

    return { status: "success", results };
  },
});

// Clear and reseed differential patterns
export const reseedDifferentialPatterns = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("differentialPatterns").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
    let count = 0;
    for (const dp of differentialPatternsSeed) {
      await ctx.db.insert("differentialPatterns", dp);
      count++;
    }
    return { status: "success", count, replaced: existing.length };
  },
});
