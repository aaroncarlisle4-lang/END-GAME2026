import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { chunkIntoPackets } from "../lib/packets";

export function useSectionCases(section: string | undefined) {
  const cases = useQuery(
    api.longCases.getBySection,
    section ? { section } : "skip",
  );

  const packets = cases ? chunkIntoPackets(cases, 6) : [];

  return { cases, packets, isLoading: cases === undefined };
}
