import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type LongCase = Doc<"longCases">;

export function useCaseVivaData(caseData: LongCase | null, enabled: boolean) {
  const caseId = caseData?._id;

  const discriminator = useQuery(
    api.discriminators.getByLongCase,
    enabled && caseId ? { longCaseId: caseId as Id<"longCases"> } : "skip",
  );

  // Get O'Brien pattern if discriminator has a ref
  const obrienCaseNumber = discriminator?.obrienRef?.obrienCaseNumber;
  const obrienPattern = useQuery(
    api.differentialPatterns.getByCaseNumber,
    enabled && obrienCaseNumber != null ? { obrienCaseNumber } : "skip",
  );

  // Get mnemonic if discriminator has a ref
  const chapterNumber = discriminator?.mnemonicRef?.chapterNumber;
  const mnemonic = useQuery(
    api.mnemonics.getByChapter,
    enabled && chapterNumber != null ? { chapterNumber } : "skip",
  );

  return {
    discriminator: discriminator ?? null,
    obrienPattern: obrienPattern ?? null,
    mnemonic: mnemonic ?? null,
    isLoading: enabled && discriminator === undefined,
  };
}
