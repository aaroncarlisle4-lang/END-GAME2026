import { ChevronLeft, ChevronRight } from "lucide-react";

interface CaseNavBarProps {
  goToPrev: (() => void) | null;
  goToNext: (() => void) | null;
  currentIndex: number;
  totalInPacket: number;
}

export function CaseNavBar({ goToPrev, goToNext, currentIndex, totalInPacket }: CaseNavBarProps) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2">
      <button
        onClick={goToPrev ?? undefined}
        disabled={!goToPrev}
        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <span className="text-sm text-gray-400">
        {totalInPacket > 0 ? `${currentIndex + 1} / ${totalInPacket}` : ""}
      </span>
      <button
        onClick={goToNext ?? undefined}
        disabled={!goToNext}
        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
