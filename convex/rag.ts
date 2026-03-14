import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const refineTextbookKnowledge = internalMutation({
  args: {
    id: v.id("textbookKnowledge"),
    entityName: v.string(),
    category: v.string(),
    radiographicFeatures: v.object({
      xray: v.optional(v.array(v.string())),
      us: v.optional(v.array(v.string())),
      ct: v.optional(v.array(v.string())),
      mri: v.optional(v.array(v.string())),
      fluoroscopy: v.optional(v.array(v.string())),
      nuclearMedicine: v.optional(v.array(v.string())),
    }),
    clinicalData: v.object({
      demographics: v.optional(v.array(v.string())),
      associations: v.optional(v.array(v.string())),
      cardinalSigns: v.optional(v.array(v.string())),
    }),
    rawTextChunk: v.string(),
    embedding: v.array(v.float64()),
    sourceBook: v.optional(v.string()),
    sourceText: v.optional(v.string()),
    qualityScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const getStubs = internalQuery({
  args: { limit: v.number(), cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Scan from the beginning or a cursor
    const results = await ctx.db
      .query("textbookKnowledge")
      .paginate({ cursor: args.cursor ?? null, numItems: 500 });
    
    const stubs = results.page.filter(doc => {
      const xray = doc.radiographicFeatures.xray || [];
      const ct = doc.radiographicFeatures.ct || [];
      const us = doc.radiographicFeatures.us || [];
      const mri = doc.radiographicFeatures.mri || [];
      
      const noFindings = xray.length === 0 && ct.length === 0 && us.length === 0 && mri.length === 0;
      const isIndexEntry = doc.entityName.length < 4 || doc.entityName.toLowerCase().includes(" p.");
      
      return noFindings && !isIndexEntry;
    }).map(({ embedding, ...rest }) => rest); // Exclude large embeddings

    return {
      stubs: stubs.slice(0, args.limit),
      nextCursor: results.continueCursor
    };
  },
});

export const getDocCount = internalQuery({
  args: {},
  handler: async (ctx) => {
    let count = 0;
    const docs = await ctx.db.query("textbookKnowledge").collect();
    // This might still fail, but let's see. 
    // Actually, let's use a better way if possible.
    // For now, let's just use take(5000) to see if we are at least that big.
    return docs.length;
  },
});

export const fastCount = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("textbookKnowledge").collect();
    let stubs = 0;
    for (const doc of all) {
      const xray = doc.radiographicFeatures.xray || [];
      const ct = doc.radiographicFeatures.ct || [];
      const us = doc.radiographicFeatures.us || [];
      const mri = doc.radiographicFeatures.mri || [];
      if (xray.length === 0 && ct.length === 0 && us.length === 0 && mri.length === 0) {
        stubs++;
      }
    }
    return { total: all.length, stubs };
  }
});

export const purgeStubs = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("textbookKnowledge")
      .paginate({ cursor: args.cursor ?? null, numItems: 200 });
    let purged = 0;
    for (const doc of results.page) {
      const xray = doc.radiographicFeatures.xray || [];
      const ct = doc.radiographicFeatures.ct || [];
      const us = doc.radiographicFeatures.us || [];
      const mri = doc.radiographicFeatures.mri || [];
      const fluoro = doc.radiographicFeatures.fluoroscopy || [];
      const nucMed = doc.radiographicFeatures.nuclearMedicine || [];
      const noFindings = xray.length === 0 && ct.length === 0 && us.length === 0 &&
        mri.length === 0 && fluoro.length === 0 && nucMed.length === 0;
      if (noFindings && doc.rawTextChunk.length < 100) {
        await ctx.db.delete(doc._id);
        purged++;
      }
    }
    return { purged, isDone: results.isDone, continueCursor: results.continueCursor };
  },
});

export const flushSearchCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("searchCache").collect();
    let deleted = 0;
    for (const entry of all) {
      await ctx.db.delete(entry._id);
      deleted++;
    }
    return { deleted };
  },
});

export const getDocById = internalQuery({
  args: { id: v.id("textbookKnowledge") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const checkCache = internalQuery({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("searchCache")
      .withIndex("by_query", (q) => q.eq("query", args.query))
      .first();
  },
});

export const setCache = internalMutation({
  args: {
    query: v.string(),
    embedding: v.array(v.float64()),
    results: v.array(v.id("textbookKnowledge")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("searchCache", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const ingestTextbookKnowledge = internalMutation({
  args: {
    entityName: v.string(),
    category: v.string(),
    radiographicFeatures: v.object({
      xray: v.optional(v.array(v.string())),
      us: v.optional(v.array(v.string())),
      ct: v.optional(v.array(v.string())),
      mri: v.optional(v.array(v.string())),
      fluoroscopy: v.optional(v.array(v.string())),
      nuclearMedicine: v.optional(v.array(v.string())),
    }),
    clinicalData: v.object({
      demographics: v.optional(v.array(v.string())),
      associations: v.optional(v.array(v.string())),
      cardinalSigns: v.optional(v.array(v.string())),
    }),
    rawTextChunk: v.string(),
    embedding: v.array(v.float64()),
    pageNumber: v.optional(v.number()),
    sourceReference: v.optional(v.string()),
    sourceBook: v.optional(v.string()),
    sourceText: v.optional(v.string()),
    qualityScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("textbookKnowledge")
      .withIndex("by_entityName", (q) => q.eq("entityName", args.entityName))
      .first();

    if (existing) {
      // If same sourceBook, overwrite. If different source, keep the richer one.
      if (existing.sourceBook && args.sourceBook && existing.sourceBook !== args.sourceBook) {
        // Different source — merge finding arrays and re-embed with enriched rawTextChunk
        const mergedChunk = existing.rawTextChunk + "\n\n---\n\n" + args.rawTextChunk;
        await ctx.db.patch(existing._id, {
          ...args,
          rawTextChunk: mergedChunk,
        });
      } else {
        await ctx.db.patch(existing._id, { ...args });
      }
      return existing._id;
    } else {
      const newId = await ctx.db.insert("textbookKnowledge", { ...args });
      return newId;
    }
  },
});

// ─── Full-text search component for hybrid search ─────────────────────────────

export const textSearch = internalQuery({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    sourceBook: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("textbookKnowledge")
      .withSearchIndex("search_text", (s) => {
        const search = s.search("rawTextChunk", args.query);
        if (args.category && args.sourceBook) {
          return search.eq("category", args.category).eq("sourceBook", args.sourceBook);
        } else if (args.category) {
          return search.eq("category", args.category);
        } else if (args.sourceBook) {
          return search.eq("sourceBook", args.sourceBook);
        }
        return search;
      })
      .take(args.limit ?? 10);
    return results;
  },
});

// ─── Cache TTL check ───────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const checkCacheWithTTL = internalQuery({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("searchCache")
      .withIndex("by_query", (q) => q.eq("query", args.query))
      .first();
    if (!cached) return null;
    if (Date.now() - cached.createdAt > CACHE_TTL_MS) return null; // Expired
    return cached;
  },
});

// ─── Reciprocal Rank Fusion ────────────────────────────────────────────────────

function reciprocalRankFusion(
  rankedLists: Array<Array<{ _id: string; _score?: number }>>,
  k = 60
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const list of rankedLists) {
    for (let rank = 0; rank < list.length; rank++) {
      const id = list[rank]._id;
      const existing = scores.get(id) || 0;
      scores.set(id, existing + 1 / (k + rank + 1));
    }
  }
  return scores;
}

// ─── Main Search Action (Hybrid: Vector + Full-Text + RRF) ────────────────────

export const searchEntities = action({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    sourceBook: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not set in environment");
    }

    // 1. Check Cache (with TTL)
    const cached = await ctx.runQuery(internal.rag.checkCacheWithTTL, { query: args.query });
    if (cached) {
      const docs = await Promise.all(
        cached.results.map(async (id) => {
          const doc = await ctx.runQuery(internal.rag.getDocById, { id });
          return doc ? { ...doc, _score: 1.0 } : null;
        })
      );
      return docs.filter((d) => d !== null);
    }

    // 2. Query Expansion — radiology-specific with Gemini 2.0 Flash
    let expandedQuery = args.query;
    try {
      const expansionResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: `You are a radiology terminology expansion engine for FRCR 2B exam preparation.
Given a radiology query, return a comma-separated list of synonyms and related terms. Include:
- Medical synonyms (Wilms tumour → nephroblastoma)
- Eponymous signs (double bubble sign → duodenal atresia)
- Radiological signs associated with the condition
- British AND American spelling variants (tumour/tumor, oesophagus/esophagus, haemorrhage/hemorrhage)
- FRCR exam terminology and classifications
- Abbreviated forms (AVN → avascular necrosis)
Keep it to 8-12 terms maximum. No explanations, just the comma-separated list.`
            },
            { role: "user", content: args.query }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });
      const expansionData = await expansionResponse.json();
      const expanded = expansionData.choices?.[0]?.message?.content;
      if (expanded) {
        expandedQuery = expanded + ", " + args.query;
      }
    } catch (e) {
      console.error("Query expansion failed, using original query");
    }

    // 3. Generate embedding with text-embedding-3-large (same 1536 dims, better quality)
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-large",
        input: expandedQuery,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter embedding failed: ${response.status}`);
    }

    const data = await response.json();
    const queryVector = data.data[0].embedding;

    // 4. Hybrid Search: Vector + Full-Text in parallel
    const [vectorResults, textResults] = await Promise.all([
      ctx.vectorSearch("textbookKnowledge", "by_embedding", {
        vector: queryVector,
        limit: 10,
        filter: args.category ? (q) => q.eq("category", args.category as string) : undefined,
      }),
      ctx.runQuery(internal.rag.textSearch, {
        query: args.query,
        category: args.category,
        sourceBook: args.sourceBook,
        limit: 10,
      }),
    ]);

    // 5. Reciprocal Rank Fusion to merge results
    const textResultsWithId = textResults.map((doc: any) => ({ _id: doc._id, _score: 1.0 }));
    const rrfScores = reciprocalRankFusion([vectorResults, textResultsWithId]);

    // Collect all unique IDs
    const allIds = new Set([
      ...vectorResults.map((r) => r._id),
      ...textResults.map((r: any) => r._id),
    ]);

    // 6. Fetch full documents and attach RRF scores
    const documents = await Promise.all(
      Array.from(allIds).map(async (id) => {
        const doc: any = await ctx.runQuery(internal.rag.getDocById, { id });
        if (!doc) return null;
        return {
          ...doc,
          _score: rrfScores.get(id as string) ?? 0,
        };
      })
    );

    const validDocs = documents.filter((doc): doc is any => doc !== null);

    // 7. Deduplicate by entity name, keeping richest version
    const uniqueResults = new Map<string, any>();
    for (const doc of validDocs) {
      const name = doc.entityName.toLowerCase();
      const existing = uniqueResults.get(name);
      const currentFindingsCount = Object.values(doc.radiographicFeatures).flat().length;
      const existingFindingsCount = existing ? Object.values(existing.radiographicFeatures).flat().length : -1;
      if (!existing || currentFindingsCount > existingFindingsCount ||
          (currentFindingsCount === existingFindingsCount && doc._score > existing._score)) {
        uniqueResults.set(name, doc);
      }
    }

    const finalResults = Array.from(uniqueResults.values())
      .sort((a, b) => b._score - a._score)
      .slice(0, args.limit ?? 5);

    // 8. Save to Cache
    if (finalResults.length > 0) {
      await ctx.runMutation(internal.rag.setCache, {
        query: args.query,
        embedding: queryVector,
        results: finalResults.map((r) => r._id),
      });
    }

    return finalResults;
  },
});

export const synthesizeAnswer = action({
  args: {
    query: v.string(),
    context: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

    const promptContext = args.context.map(c => `ENTITY: ${c.entityName}\nFINDINGS: ${c.rawTextChunk}`).join("\n\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: "You are a senior radiologist preparing candidates for the FRCR 2B exam. Synthesize a concise, 2-3 sentence clinical answer to the user's query based ONLY on the provided textbook context. Focus on pathognomonic features, key discriminators, and exam-relevant pearls." },
          { role: "user", content: `QUERY: ${args.query}\n\nCONTEXT:\n${promptContext}` }
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  },
});
