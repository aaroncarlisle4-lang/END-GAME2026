import { mutation } from "./_generated/server";

export const migrateDiscriminators = mutation({
  args: {},
  handler: async (ctx) => {
    // @ts-ignore
    const docs = await ctx.db.query("discriminators").collect();
    let count = 0;
    for (const doc of docs) {
      if (doc.differentials && doc.differentials.length > 0) {
        const first = doc.differentials[0];
        // Check if it has old properties
        if ("keyImagingPattern" in first) {
          const newDifferentials = doc.differentials.map((d: any) => ({
            diagnosis: d.diagnosis || "",
            dominantImagingFinding: d.keyImagingPattern || "",
            distributionLocation: d.distribution || "",
            demographicsClinicalContext: d.clinicalContext || "",
            discriminatingKeyFeature: d.keyDiscriminator || "",
            associatedFindings: d.associatedFindings || "",
            complicationsSeriousAlternatives: d.complicationsSeriousAlternatives || "",
            isCorrectDiagnosis: d.isCorrectDiagnosis || false,
          }));
          await ctx.db.patch(doc._id, { differentials: newDifferentials });
          count++;
        }
      }
    }
    return `Migrated ${count} discriminators`;
  }
});
