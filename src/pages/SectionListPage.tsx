import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getCategoryMeta } from "../lib/categoryConfig";
import { chunkIntoPackets } from "../lib/packets";
import { ChevronRight, ChevronDown, Package } from "lucide-react";
import { RapidCardsView } from "../components/case/RapidCardsView";

export function SectionListPage() {
  const { abbrev } = useParams<{ abbrev: string }>();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const category = useQuery(
    api.categories.getByAbbreviation,
    abbrev ? { abbreviation: abbrev } : "skip",
  );
  const sections = useQuery(
    api.sections.getByCategory,
    abbrev ? { categoryAbbreviation: abbrev } : "skip",
  );
  
  // Only fetch longCases if it's not a rapid section, else we don't need them here.
  const cases = useQuery(
    api.longCases.getByCategory,
    category?._id && category.examSection !== "rapid" ? { categoryId: category._id } : "skip",
  );

  const meta = getCategoryMeta(abbrev ?? "");
  const Icon = meta.icon;

  // Group cases by section
  const casesBySection: Record<string, typeof cases> = {};
  if (cases) {
    for (const c of cases) {
      const sec = c.section ?? "__unsectioned";
      if (!casesBySection[sec]) casesBySection[sec] = [];
      casesBySection[sec]!.push(c);
    }
  }

  const isLoading = category === undefined || (category?.examSection !== "rapid" && sections === undefined);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${meta.accent} ${meta.accentText}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {category?.name ?? abbrev}
          </h1>
          {category?.examSection !== "rapid" && (
            <p className="text-sm text-gray-500">
              {cases?.length ?? "..."} cases across {sections?.length ?? "..."} sections
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : category?.examSection === "rapid" ? (
        <RapidCardsView categoryId={category._id} abbrev={abbrev ?? ""} />
      ) : sections?.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No sections found for this category.</p>
          <p className="text-sm mt-1">Cases may not be grouped into sections yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...(sections || [])]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((sec) => {
              const secCases = casesBySection[sec.name] ?? [];
              const count = secCases.length;
              const packets = chunkIntoPackets(secCases, 6);
              const isExpanded = expandedSection === sec._id;

              return (
                <div key={sec._id} className="rounded-lg border border-gray-200 overflow-hidden">
                  {/* Section header row — click to expand/collapse */}
                  <button
                    onClick={() =>
                      setExpandedSection(isExpanded ? null : sec._id)
                    }
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{sec.name}</h3>
                      {sec.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{sec.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <span className="text-sm text-gray-400">{count} cases</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-teal-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </button>

                  {/* Expanded: packet list */}
                  {isExpanded && count > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      {packets.length === 1 ? (
                        /* Only one packet — link directly to the section */
                        <Link
                          to={`/category/${abbrev}/${encodeURIComponent(sec.name)}`}
                          className="flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium"
                        >
                          <Package className="w-4 h-4" />
                          View all {count} cases
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {packets.map((pkt, i) => (
                            <Link
                              key={i}
                              to={`/category/${abbrev}/${encodeURIComponent(sec.name)}?packet=${i}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-teal-200 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-colors"
                            >
                              <Package className="w-3.5 h-3.5" />
                              Packet {i + 1}
                              <span className="text-xs text-teal-500">({pkt.length})</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {isExpanded && count === 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-sm text-gray-400">No cases in this section yet.</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
