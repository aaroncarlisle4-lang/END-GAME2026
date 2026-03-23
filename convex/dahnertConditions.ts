import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const conditionFields = {
  name: v.string(),
  slug: v.string(),
  chapter: v.string(),
  definition: v.optional(v.string()),
  demographics: v.optional(v.array(v.string())),
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
  clinical: v.optional(v.array(v.string())),
};

export const list = query({
  args: { chapter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.chapter) {
      return ctx.db
        .query("dahnertConditions")
        .withIndex("by_chapter", (q) => q.eq("chapter", args.chapter!))
        .collect();
    }
    return ctx.db.query("dahnertConditions").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("dahnertConditions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("dahnertConditions")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("dahnertConditions").collect();
    return all.length;
  },
});

export const chapters = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("dahnertConditions").collect();
    const seen = new Set<string>();
    const result: string[] = [];
    for (const c of all) {
      if (c.chapter && !seen.has(c.chapter)) { seen.add(c.chapter); result.push(c.chapter); }
    }
    return result.sort();
  },
});

// Batch insert — called by seed script in chunks of ~100
export const batchSeed = mutation({
  args: {
    conditions: v.array(v.object(conditionFields)),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    for (const condition of args.conditions) {
      // Skip if slug already exists (idempotent)
      const existing = await ctx.db
        .query("dahnertConditions")
        .withIndex("by_slug", (q) => q.eq("slug", condition.slug))
        .first();
      if (!existing) {
        await ctx.db.insert("dahnertConditions", condition);
        inserted++;
      }
    }
    return { inserted };
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("dahnertConditions").collect();
    for (const doc of all) {
      await ctx.db.delete(doc._id);
    }
    return { deleted: all.length };
  },
});

// Link discriminator differentials to dahnertConditions by name matching.
// Three-pass strategy (each pass only processes still-unlinked entries):
//   Pass 1 — exact normalised match (already run on initial seed; skipped if already set)
//   Pass 2 — strip parenthetical suffixes then exact match
//             e.g. "Osteogenesis imperfecta (OI)" → "OSTEOGENESIS IMPERFECTA"
//   Pass 3 — prefix match (min 10 chars): either the Dahnert name starts with the
//             diagnosis token or the diagnosis token starts with the Dahnert name.
//             This catches "Ewing sarcoma" → "EWING SARCOMA / TUMOR" while
//             rejecting false positives like "Parsonage-Turner" → "TURNER SYNDROME".
export const linkToDiscriminators = mutation({
  args: { pass: v.optional(v.number()) }, // 0=all, 1/2/3=specific pass
  handler: async (ctx, args) => {
    const runPass = args.pass ?? 0; // 0 = run all passes

    const conditions = await ctx.db.query("dahnertConditions").collect();

    // Build exact-normalised map
    const normMap = new Map<string, string>(); // normalisedName → slug
    for (const c of conditions) {
      normMap.set(normalize(c.name), c.slug);
    }
    // Sorted list for prefix matching (longer names first to prefer specific matches)
    const condList = conditions
      .map((c) => ({ slug: c.slug, norm: normalize(c.name) }))
      .sort((a, b) => b.norm.length - a.norm.length);

    const discriminators = await ctx.db.query("discriminators").collect();
    let linked = 0;
    let skipped = 0;

    for (const disc of discriminators) {
      const updatedDiffs = disc.differentials.map((diff) => {
        if (diff.dahnertConditionSlug) {
          skipped++;
          return diff; // already linked — skip
        }

        const raw = diff.diagnosis;

        // Pass 1: exact match (re-run in case new conditions were seeded)
        if (runPass === 0 || runPass === 1) {
          const slug = normMap.get(normalize(raw));
          if (slug) { linked++; return { ...diff, dahnertConditionSlug: slug }; }
        }

        // Pass 2: strip leading "N. " numbering + strip parenthetical suffixes
        if (runPass === 0 || runPass === 2) {
          const cleaned = raw
            .replace(/^\d+\.\s*/, "")           // "1. Atherosclerosis" → "Atherosclerosis"
            .replace(/\s*\(.*?\)\s*$/, "")       // "Ewing sarcoma (ES)" → "Ewing sarcoma"
            .replace(/\s*—.*$/, "")              // "Septic arthritis — must exclude" → "Septic arthritis"
            .replace(/\s*\*.*$/, "")             // "Juvenile RA *" → "Juvenile RA"
            .trim();
          if (cleaned !== raw) {
            const slug = normMap.get(normalize(cleaned));
            if (slug) { linked++; return { ...diff, dahnertConditionSlug: slug }; }
          }
        }

        // Pass 3: prefix match — safer than full substring
        if (runPass === 0 || runPass === 3) {
          const diagNorm = normalize(
            raw
              .replace(/^\d+\.\s*/, "")
              .replace(/\s*\(.*?\)\s*$/, "")
              .replace(/\s*—.*$/, "")
              .replace(/\s*\*.*$/, "")
          );
          if (diagNorm.length >= 10) {
            for (const cond of condList) {
              if (cond.norm.length < 10) continue;
              // Accept if one is a prefix of the other (covers plurals, qualifiers, etc.)
              if (cond.norm.startsWith(diagNorm) || diagNorm.startsWith(cond.norm)) {
                linked++;
                return { ...diff, dahnertConditionSlug: cond.slug };
              }
            }
          }
        }

        return diff;
      });

      const changed = updatedDiffs.some(
        (d, i) => d.dahnertConditionSlug !== disc.differentials[i].dahnertConditionSlug
      );
      if (changed) {
        await ctx.db.patch(disc._id, { differentials: updatedDiffs });
      }
    }

    return { linked, skipped, total: discriminators.length };
  },
});

// Enrich discriminator differentials that have a dahnertConditionSlug by
// pulling ALL Dahnert imaging data into the comparison-matrix fields.
// Field mapping (full content, no truncation):
//   dominantImagingFinding      ← dahnert.dominantFinding
//   distributionLocation        ← dahnert.distribution
//   demographicsClinicalContext ← ALL demographics joined
//   discriminatingKeyFeature    ← ALL discriminatingFeatures joined
//   associatedFindings          ← general findings + all modality findings labelled
//   complicationsSeriousAlts    ← ALL clinical joined
export const enrichDiscriminatorsFromDahnert = mutation({
  args: { overwrite: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const overwrite = args.overwrite ?? false;

    const conditions = await ctx.db.query("dahnertConditions").collect();
    const condMap = new Map(conditions.map((c) => [c.slug, c]));

    const discriminators = await ctx.db.query("discriminators").collect();
    let enriched = 0;
    let fieldsSet = 0;

    for (const disc of discriminators) {
      let changed = false;

      const updatedDiffs = disc.differentials.map((diff) => {
        if (!diff.dahnertConditionSlug) return diff;
        const cond = condMap.get(diff.dahnertConditionSlug);
        if (!cond) return diff;

        const updates: Record<string, string> = {};

        // dominantImagingFinding ← dominant_finding
        if ((overwrite || !diff.dominantImagingFinding) && cond.dominantFinding) {
          updates.dominantImagingFinding = cond.dominantFinding;
        }

        // distributionLocation ← distribution
        if ((overwrite || !diff.distributionLocation) && cond.distribution) {
          updates.distributionLocation = cond.distribution;
        }

        // demographicsClinicalContext ← ALL demographics
        if ((overwrite || !diff.demographicsClinicalContext) && cond.demographics?.length) {
          updates.demographicsClinicalContext = cond.demographics.join(". ");
        }

        // discriminatingKeyFeature ← ALL discriminatingFeatures (complete, no truncation)
        if ((overwrite || !diff.discriminatingKeyFeature) && cond.discriminatingFeatures?.length) {
          updates.discriminatingKeyFeature = cond.discriminatingFeatures.join(". ");
        }

        // associatedFindings ← general findings + modality-specific findings with labels
        if (overwrite || !diff.associatedFindings) {
          const parts: string[] = [];
          const mf = cond.modalityFindings;

          // General / plain film findings
          if (mf.general?.length) {
            parts.push(...mf.general);
          }
          // Modality-labelled sections
          const LABELLED: Array<[keyof typeof mf, string]> = [
            ["ct",    "CT"],
            ["cect",  "CECT"],
            ["nect",  "NECT"],
            ["mri",   "MRI"],
            ["us",    "US"],
            ["cxr",   "CXR"],
            ["xray",  "X-ray"],
            ["hrct",  "HRCT"],
            ["angio", "Angio"],
            ["nuc",   "NM"],
            ["pet",   "PET"],
          ];
          for (const [key, label] of LABELLED) {
            const items = mf[key];
            if (items?.length) {
              parts.push(`[${label}] ${items.join("; ")}`);
            }
          }

          if (parts.length > 0) {
            updates.associatedFindings = parts.join(". ");
          }
        }

        // complicationsSeriousAlternatives ← ALL clinical (Rx, Prognosis, Cx, N.B., Spread)
        if ((overwrite || !diff.complicationsSeriousAlternatives) && cond.clinical?.length) {
          updates.complicationsSeriousAlternatives = cond.clinical.join(". ");
        }

        if (Object.keys(updates).length > 0) {
          changed = true;
          enriched++;
          fieldsSet += Object.keys(updates).length;
          return { ...diff, ...updates };
        }
        return diff;
      });

      if (changed) {
        await ctx.db.patch(disc._id, { differentials: updatedDiffs });
      }
    }

    return { enriched, fieldsSet, total: discriminators.length };
  },
});

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}
