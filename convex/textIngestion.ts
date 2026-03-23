import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const processText = action({
  args: {
    text: v.string(),
    discriminatorId: v.id("discriminators"),
    userFeedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

    const discriminator = await ctx.runQuery(internal.discriminators.internalGet, {
      id: args.discriminatorId,
    });
    if (!discriminator) throw new Error("Discriminator not found");

    const existingDifferentials = discriminator.differentials.map((d, i) => ({
      index: i,
      diagnosis: d.diagnosis,
      dominantImagingFinding: d.dominantImagingFinding ?? null,
      distributionLocation: d.distributionLocation ?? null,
      demographicsClinicalContext: d.demographicsClinicalContext ?? null,
      discriminatingKeyFeature: d.discriminatingKeyFeature ?? null,
      associatedFindings: d.associatedFindings ?? null,
      complicationsSeriousAlternatives: d.complicationsSeriousAlternatives ?? null,
    }));

    const feedbackInstruction = args.userFeedback
      ? `\n\nUSER CORRECTION FROM PREVIOUS ATTEMPT:\n${args.userFeedback}\nPlease incorporate this feedback into your classification.`
      : "";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a radiology knowledge organizer for FRCR 2B exam preparation.
You do NOT generate new medical content — you EXTRACT, CLASSIFY and ORGANIZE text
provided by a human from trusted radiology sources into a discriminator table.

CRITICAL RULES:
1. ONE SUGGESTION PER (differential, field) PAIR — NEVER produce multiple suggestions for the same differential+field combo. Collect ALL relevant facts from the text for that cell into ONE merged suggestion. If you find 5 facts for Asbestosis → associatedFindings, emit ONE suggestion with all 5 facts joined by semicolons.
2. MAP TO EVERY MATCHING DIFFERENTIAL — scan ALL differentials in the table. If the text mentions "mesothelioma" and there is a Mesothelioma differential, create suggestions for it. If text mentions "lung cancer" and there is a Bronchogenic Carcinoma differential, map to it. Use fuzzy name matching (e.g. "lung cancer" = "Bronchogenic Carcinoma", "asbestosis" = "Asbestos-related ILD").
3. USE ALL 6 FIELDS — distribute content across fields appropriately:
   - dominantImagingFinding: what you SEE on imaging (calcified plaques, pleural thickening, ground-glass)
   - distributionLocation: WHERE it occurs (parietal pleura, lower lobes, diaphragmatic dome, costophrenic angles)
   - demographicsClinicalContext: WHO gets it, exposure history, prevalence, percentages
   - discriminatingKeyFeature: the PATHOGNOMONIC or most specific feature that distinguishes this entity
   - associatedFindings: other findings commonly seen WITH this entity, related conditions
   - complicationsSeriousAlternatives: malignant transformation risk, must-not-miss diagnoses, progression
4. CONDENSE for the table — max ~30 words per suggestion. Use semicolons to separate points within a cell.
5. MERGE with existing — when a field already has content, provide a MERGED value that keeps the existing text and appends new facts. Do not drop existing content.

Fields: dominantImagingFinding, distributionLocation, demographicsClinicalContext, discriminatingKeyFeature, associatedFindings, complicationsSeriousAlternatives

Actions:
- "skip": exact duplicate of existing content
- "add": field is currently empty/null and text provides high-yield content
- "replace": field has content — provide a MERGED value combining existing + new information

Return ONLY valid JSON: { "suggestions": [...] }

Each suggestion:
{
  "differentialIndex": <number matching the index in EXISTING DIFFERENTIALS>,
  "diagnosis": "<name of the differential>",
  "field": "<one of the 6 field names>",
  "currentValue": <current string or null>,
  "suggestedValue": "<concise bullet-point value for the table cell>",
  "action": "add" | "replace" | "skip",
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>"
}`,
          },
          {
            role: "user",
            content: `PATTERN: ${discriminator.pattern}

EXISTING DIFFERENTIALS:
${JSON.stringify(existingDifferentials, null, 2)}

PASTED TEXT:
${args.text}${feedbackInstruction}`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter error body:", errorBody);
      throw new Error(`OpenRouter API failed: ${response.status} — ${errorBody.slice(0, 300)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("OpenRouter returned no content. Full response:", JSON.stringify(data).slice(0, 500));
      throw new Error("No response from AI — check Convex logs for details");
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      throw new Error(`Failed to parse AI response as JSON: ${content.slice(0, 200)}`);
    }

    const suggestions = parsed.suggestions ?? [];
    console.log(`Text ingestion: ${suggestions.length} suggestions for pattern "${discriminator.pattern}"`);
    return suggestions;
  },
});
