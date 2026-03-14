import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

async function main() {
  console.log("Fetching discriminators to deduplicate...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  // Group by mnemonic
  const grouped = new Map<string, any[]>();
  for (const d of discriminators) {
    const key = d.mnemonicRef?.mnemonic;
    if (key) {
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(d);
    }
  }

  for (const [mnemonic, records] of grouped.entries()) {
    if (records.length > 1) {
      console.log(`Found ${records.length} records for ${mnemonic}`);
      
      // Sort by number of differentials (descending), then by creation time (descending)
      records.sort((a, b) => {
        const diffCount = b.differentials.length - a.differentials.length;
        if (diffCount !== 0) return diffCount;
        return b._creationTime - a._creationTime;
      });

      // Keep the first one (most differentials, or newest if equal)
      const toKeep = records[0];
      const toDelete = records.slice(1);

      console.log(`  Keeping ${toKeep._id} (${toKeep.differentials.length} differentials)`);
      for (const record of toDelete) {
        console.log(`  Deleting ${record._id} (${record.differentials.length} differentials)`);
        await client.mutation(api.discriminators.remove as any, { id: record._id });
      }
    }
  }
  
  console.log("Deduplication complete!");
}

main().catch(console.error);