import { useParams, Link, useSearchParams } from "react-router-dom";
import { useSectionCases } from "../hooks/useSectionCases";
import { isShellCase, getDifficultyColor, getModalityLabel } from "../lib/caseHelpers";
import { Package, FileText } from "lucide-react";

export function PacketPage() {
  const { abbrev, section } = useParams<{ abbrev: string; section: string }>();
  const decodedSection = section ? decodeURIComponent(section) : undefined;
  const { cases, packets, isLoading } = useSectionCases(decodedSection);
  const [searchParams, setSearchParams] = useSearchParams();
  const activePacket = Number(searchParams.get("packet") ?? "0");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No cases found in "{decodedSection}".
      </div>
    );
  }

  const currentPacket = packets[activePacket] ?? packets[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{decodedSection}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {cases.length} cases in {packets.length} packet{packets.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Packet tabs */}
      {packets.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {packets.map((pkt, i) => (
            <button
              key={i}
              onClick={() => setSearchParams({ packet: String(i) })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                i === activePacket
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Packet {i + 1}
              <span className="text-xs opacity-75">({pkt.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Case cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentPacket.map((c) => {
          const shell = isShellCase(c);
          return (
            <Link
              key={c._id}
              to={`/case/${c._id}?packet=${activePacket}&abbrev=${abbrev}&section=${encodeURIComponent(decodedSection ?? "")}`}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                shell
                  ? "border-gray-200 bg-gray-50 hover:border-gray-300"
                  : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm"
              }`}
            >
              <div className="p-1.5 rounded bg-gray-100 text-gray-400 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">#{c.caseNumber}</span>
                  {c.difficulty && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(c.difficulty)}`}>
                      {c.difficulty}
                    </span>
                  )}
                  {shell && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">
                      shell
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 truncate">{c.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{getModalityLabel(c.modality)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
