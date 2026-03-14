import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { chunkIntoPackets } from "../lib/packets";
import type { Id } from "../../convex/_generated/dataModel";

export function usePacketNavigation(caseId: string) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packetIdx = Number(searchParams.get("packet") ?? "0");
  const abbrev = searchParams.get("abbrev") ?? "";
  const section = searchParams.get("section") ?? "";

  const cases = useQuery(
    api.longCases.getBySection,
    section ? { section: decodeURIComponent(section) } : "skip",
  );

  const packets = cases ? chunkIntoPackets(cases, 6) : [];
  const currentPacket = packets[packetIdx] ?? [];
  const currentIndex = currentPacket.findIndex((c) => c._id === caseId);

  const prev = currentIndex > 0 ? currentPacket[currentIndex - 1] : null;
  const next = currentIndex < currentPacket.length - 1 ? currentPacket[currentIndex + 1] : null;

  function goTo(id: Id<"longCases">) {
    navigate(
      `/case/${id}?packet=${packetIdx}&abbrev=${abbrev}&section=${encodeURIComponent(section)}`,
    );
  }

  return {
    prev,
    next,
    goToPrev: prev ? () => goTo(prev._id) : null,
    goToNext: next ? () => goTo(next._id) : null,
    currentIndex,
    totalInPacket: currentPacket.length,
    abbrev,
    section: decodeURIComponent(section),
  };
}
