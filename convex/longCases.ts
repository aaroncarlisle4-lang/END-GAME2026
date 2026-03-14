import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("longCases").collect();
  },
});

export const getByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("longCases")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
  },
});

export const getByCaseNumber = query({
  args: { caseNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("longCases")
      .withIndex("by_caseNumber", (q) => q.eq("caseNumber", args.caseNumber))
      .first();
  },
});

export const getByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("longCases")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

export const getBySection = query({
  args: { section: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("longCases")
      .withIndex("by_section", (q) => q.eq("section", args.section))
      .collect();
  },
});

export const search = query({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("longCases").collect();
    const searchTerm = args.title.toLowerCase();
    return all.filter((c) => c.title.toLowerCase().includes(searchTerm));
  },
});

export const get = query({
  args: { id: v.id("longCases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    categoryId: v.id("categories"),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("longCases", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("longCases"),
    clinicalHistory: v.optional(v.string()),
    section: v.optional(v.string()),
    findings: v.optional(v.string()),
    interpretation: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    differentials: v.optional(v.array(v.string())),
    nextSteps: v.optional(v.string()),
    keyBullets: v.optional(v.array(v.string())),
    importantNegatives: v.optional(v.array(v.string())),
    examPearl: v.optional(v.string()),
    hasDiscriminator: v.optional(v.boolean()),
    textbookRefs: v.optional(v.array(v.number())),
    scoringGuide: v.optional(v.object({
      score4: v.string(),
      score5: v.string(),
      score6: v.string(),
      score7: v.string(),
      score8: v.string(),
    })),
    problemCategory: v.optional(v.string()),
    vivaPresentation: v.optional(v.object({
      opening: v.string(),
      anchorStatement: v.string(),
      systemicApproach: v.string(),
      synthesis: v.string(),
      differentialReasoning: v.string(),
      clinicalUrgency: v.string(),
      examinerTip: v.string(),
    })),
    negativesContext: v.optional(v.object({
      emergencyExclusions: v.array(v.string()),
      stagingNegatives: v.array(v.string()),
      complicationNegatives: v.array(v.string()),
      incidentalNegatives: v.array(v.string()),
    })),
    hasMnemonic: v.optional(v.boolean()),
    mnemonicRef: v.optional(v.object({
      mnemonic: v.string(),
      chapterNumber: v.number(),
      pattern: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

// Populate model answers (structured written + optional viva)
export const updateModelAnswers = mutation({
  args: {
    updates: v.array(
      v.object({
        caseNumber: v.number(),
        modelAnswer: v.string(),
        vivaModelAnswer: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const u of args.updates) {
      const existing = await ctx.db
        .query("longCases")
        .withIndex("by_caseNumber", (q) => q.eq("caseNumber", u.caseNumber))
        .first();
      if (existing) {
        const patch: Record<string, string> = { modelAnswer: u.modelAnswer };
        if (u.vivaModelAnswer) {
          patch.vivaModelAnswer = u.vivaModelAnswer;
        }
        await ctx.db.patch(existing._id, patch);
        count++;
      }
    }
    return { status: "success", count };
  },
});

// Server-side model answer generation from building blocks
export const generateModelAnswersBatch = mutation({
  args: {
    categoryAbbreviation: v.string(),
    startCaseNumber: v.number(),
    endCaseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", args.categoryAbbreviation))
      .first();
    if (!cat) return { status: "error", message: "Category not found" };

    const allCases = await ctx.db
      .query("longCases")
      .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
      .collect();

    const cases = allCases
      .filter((c) => c.caseNumber >= args.startCaseNumber && c.caseNumber <= args.endCaseNumber)
      .sort((a, b) => a.caseNumber - b.caseNumber);

    let count = 0;
    let skipped = 0;

    for (const c of cases) {
      if (!c.findings || c.findings.length < 20) {
        skipped++;
        continue;
      }

      // Build structured written model answer
      const sections: string[] = [];
      sections.push(`FINDINGS:\n${c.findings}`);
      sections.push(`INTERPRETATION:\n${c.interpretation}`);
      sections.push(`DIAGNOSIS:\n${c.diagnosis}.`);

      if (c.differentials.length > 0) {
        const ddx = c.differentials.map((d: string, i: number) => `${i + 1}. ${d}`).join("\n");
        sections.push(`DIFFERENTIAL DIAGNOSIS:\n${ddx}`);
      }

      // Important negatives (categorised if available)
      const nc = c.negativesContext as {
        emergencyExclusions: string[];
        stagingNegatives: string[];
        complicationNegatives: string[];
        incidentalNegatives: string[];
      } | undefined;
      if (nc) {
        const negLines: string[] = [];
        if (nc.emergencyExclusions.length > 0) {
          negLines.push(...nc.emergencyExclusions.map((n: string) => `- ${n} [emergency exclusion]`));
        }
        if (nc.stagingNegatives.length > 0) {
          negLines.push(...nc.stagingNegatives.map((n: string) => `- ${n} [staging]`));
        }
        if (nc.complicationNegatives.length > 0) {
          negLines.push(...nc.complicationNegatives.map((n: string) => `- ${n} [complication]`));
        }
        if (nc.incidentalNegatives.length > 0) {
          negLines.push(...nc.incidentalNegatives.map((n: string) => `- ${n} [incidental]`));
        }
        if (negLines.length > 0) {
          sections.push(`IMPORTANT NEGATIVES:\n${negLines.join("\n")}`);
        }
      } else if (c.importantNegatives.length > 0) {
        const negs = c.importantNegatives.map((n: string) => `- ${n}`).join("\n");
        sections.push(`IMPORTANT NEGATIVES:\n${negs}`);
      }

      sections.push(`MANAGEMENT:\n${c.nextSteps}`);
      sections.push(`EXAM PEARL:\n${c.examPearl}`);

      const modelAnswer = sections.join("\n\n");

      // Build viva model answer if vivaPresentation exists
      let vivaModelAnswer: string | undefined;
      const vp = c.vivaPresentation as {
        opening: string;
        anchorStatement: string;
        systemicApproach: string;
        synthesis: string;
        differentialReasoning: string;
        clinicalUrgency: string;
        examinerTip: string;
      } | undefined;
      if (vp) {
        const paragraphs: string[] = [];
        paragraphs.push(`${vp.opening}\n\n${vp.anchorStatement}`);
        paragraphs.push(vp.systemicApproach);
        paragraphs.push(vp.synthesis);
        paragraphs.push(vp.differentialReasoning);
        paragraphs.push(vp.clinicalUrgency);
        vivaModelAnswer = paragraphs.join("\n\n");
      }

      const patch: Record<string, string> = { modelAnswer };
      if (vivaModelAnswer) {
        patch.vivaModelAnswer = vivaModelAnswer;
      }
      await ctx.db.patch(c._id, patch);
      count++;
    }

    return { status: "success", count, skipped };
  },
});

export const getPopulated = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("longCases").collect();
    return all.filter((c) => c.findings !== "");
  },
});

export const updateBatch = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("longCases"),
        fields: v.object({
          clinicalHistory: v.optional(v.string()),
          section: v.optional(v.string()),
          findings: v.optional(v.string()),
          interpretation: v.optional(v.string()),
          diagnosis: v.optional(v.string()),
          differentials: v.optional(v.array(v.string())),
          nextSteps: v.optional(v.string()),
          keyBullets: v.optional(v.array(v.string())),
          importantNegatives: v.optional(v.array(v.string())),
          examPearl: v.optional(v.string()),
          hasDiscriminator: v.optional(v.boolean()),
          textbookRefs: v.optional(v.array(v.number())),
          scoringGuide: v.optional(v.object({
            score4: v.string(),
            score5: v.string(),
            score6: v.string(),
            score7: v.string(),
            score8: v.string(),
          })),
          problemCategory: v.optional(v.string()),
          vivaPresentation: v.optional(v.object({
            opening: v.string(),
            anchorStatement: v.string(),
            systemicApproach: v.string(),
            synthesis: v.string(),
            differentialReasoning: v.string(),
            clinicalUrgency: v.string(),
            examinerTip: v.string(),
          })),
          negativesContext: v.optional(v.object({
            emergencyExclusions: v.array(v.string()),
            stagingNegatives: v.array(v.string()),
            complicationNegatives: v.array(v.string()),
            incidentalNegatives: v.array(v.string()),
          })),
          hasMnemonic: v.optional(v.boolean()),
          mnemonicRef: v.optional(v.object({
            mnemonic: v.string(),
            chapterNumber: v.number(),
            pattern: v.string(),
          })),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const { id, fields } of args.updates) {
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          updates[key] = value;
        }
      }
      await ctx.db.patch(id, updates);
      count++;
    }
    return { status: "success", count };
  },
});
