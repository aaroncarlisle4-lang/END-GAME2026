import { query } from "./_generated/server";

export const getHighYieldClusters = query({
  args: {},
  handler: async (ctx) => {
    const clusters = await ctx.db.query("highYieldClusters").collect();
    
    // Populate the underlying data
    return await Promise.all(
      clusters.map(async (cluster) => {
        let populatedData = null;
        if (cluster.sourceType === "pattern" && cluster.patternId) {
          populatedData = await ctx.db.get(cluster.patternId);
        } else if (cluster.sourceType === "mnemonic" && cluster.mnemonicId) {
          populatedData = await ctx.db.get(cluster.mnemonicId);
        }

        return {
          ...cluster,
          populatedData,
        };
      })
    );
  },
});
