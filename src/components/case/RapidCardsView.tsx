import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { ChevronDown, ChevronUp, Search, Zap } from "lucide-react";
import { HighlightableText } from "../ui/HighlightableText";
import { ImageDropZone } from "../images/ImageDropZone";
import { RapidImageViewer } from "../images/RapidImageViewer";
import { DicomPlaceholder } from "./DicomPlaceholder";
import { getCategoryMeta } from "../../lib/categoryConfig";
import { InlineDiscriminators } from "./InlineDiscriminators";

function RapidCard({
  caseData,
  meta,
  abbrev,
  discriminator,
  hasDiscriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages
}: {
  caseData: Doc<"rapidCases">;
  meta: ReturnType<typeof getCategoryMeta>;
  abbrev: string;
  discriminator?: Doc<"discriminators"> | null;
  hasDiscriminator?: boolean;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
  onViewImages?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const highlightKey = `rapid_${caseData._id}`;

  return (
    <div className={`rounded-xl border ${meta.accentBorder} bg-white overflow-hidden transition-shadow hover:shadow-md flex flex-col`}>
      <div className="flex-1">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => e.key === "Enter" && setExpanded((e) => !e)}
          className="w-full text-left px-5 py-4 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${meta.accent} ${meta.accentText}`}>
                  {abbrev}
                </span>
                <span className="text-xs text-gray-400 font-medium">#{caseData.caseNumber}</span>
                {caseData.subsection && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                    {caseData.subsection}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{caseData.title || caseData.keyFinding}</h3>
            </div>
            <div className="shrink-0 pt-1 text-gray-400">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Embedded DICOM Viewer Placeholder */}
            <DicomPlaceholder 
              modality={caseData.modality} 
              onViewDiscriminators={hasDiscriminator ? () => setDiscriminatorOpen?.(true) : undefined}
              hasDiscriminator={!!hasDiscriminator}
            />

            <div className="space-y-3 mt-4">
              {caseData.keyFinding && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Key Finding</p>
                  <HighlightableText id={highlightKey} text={caseData.keyFinding} className="text-sm text-gray-700 leading-relaxed" />
                </div>
              )}

              {caseData.diagnosis && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
                  <HighlightableText id={highlightKey} text={caseData.diagnosis} className="text-sm font-bold text-gray-900" />
                </div>
              )}

              {caseData.importantNegatives && caseData.importantNegatives.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Important Negatives</p>
                  <ul className="space-y-1">
                    {caseData.importantNegatives.map((neg, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-gray-300 font-black shrink-0">-</span>
                        <HighlightableText id={highlightKey} text={neg} className="text-sm text-gray-600 leading-relaxed flex-1" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {caseData.examPearl && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 mt-2">
                  <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" />
                    EXAM PEARL
                  </h4>
                  <HighlightableText id={highlightKey} text={caseData.examPearl} className="text-xs text-amber-900/80 leading-relaxed font-medium" />
                </div>
              )}
            </div>

            {(hasDiscriminator || discriminator) && (
              <div className="pt-4 border-t border-gray-100">
                {discriminator ? (
                  <InlineDiscriminators
                    discriminator={discriminator}
                    externalOpen={discriminatorOpen}
                    setExternalOpen={setDiscriminatorOpen}
                    onViewImages={onViewImages}
                  />
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDiscriminatorOpen?.(true); }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-teal-100 active:scale-95"
                  >
                    Discriminate
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type DiscriminatorLookup = {
  _id: Id<"discriminators">;
  pattern: string;
  obrienRef?: { obrienCaseNumber: number };
  mnemonicRef?: { mnemonic: string };
  differentialDiagnoses: string[];
};

export function RapidCardsView({ categoryId, abbrev }: { categoryId: Id<"categories">; abbrev: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const cases = useQuery(api.rapidCases.getByCategory, { categoryId });
  const allDiscriminatorLookups = useQuery(api.discriminators.listLookup) as DiscriminatorLookup[] | undefined;
  const meta = getCategoryMeta(abbrev);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTarget, setViewerTarget] = useState<{
    sourceType: "rapidCase";
    sourceId: string;
    title: string;
  } | null>(null);

  const [openDiscriminatorId, setOpenDiscriminatorId] = useState<string | null>(null);

  const patternMap = useMemo(() => {
    const map = new Map<string, DiscriminatorLookup>();
    allDiscriminatorLookups?.forEach(d => {
      map.set(d.pattern.toLowerCase().trim(), d);
    });
    return map;
  }, [allDiscriminatorLookups]);

  // Resolve the discriminator ID for the currently-open rapid case
  const activeDiscriminatorId = useMemo(() => {
    if (!openDiscriminatorId || !cases) return undefined;
    const openCase = cases.find(c => c._id === openDiscriminatorId);
    if (!openCase) return undefined;
    const lookup = patternMap.get((openCase.title || openCase.keyFinding || "").toLowerCase().trim());
    return lookup?._id;
  }, [openDiscriminatorId, cases, patternMap]);

  // Fetch full discriminator only for the ONE expanded card
  const activeFullDiscriminator = useQuery(
    api.discriminators.get,
    activeDiscriminatorId ? { id: activeDiscriminatorId } : "skip"
  );

  // Group and filter
  const filteredCases = useMemo(() => {
    if (!cases) return [];
    let results = cases;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.keyFinding.toLowerCase().includes(q) ||
          c.diagnosis.toLowerCase().includes(q) ||
          (c.subsection && c.subsection.toLowerCase().includes(q)) ||
          (c.parentGroup && c.parentGroup.toLowerCase().includes(q))
      );
    }
    return results;
  }, [cases, searchQuery]);

  const groupedCases = useMemo(() => {
    const map = new Map<string, Doc<"rapidCases">[]>();
    for (const c of filteredCases) {
      // Group by parentGroup, fallback to subsection, then to "Ungrouped"
      const key = c.parentGroup || c.subsection || "Other Cases";
      const arr = map.get(key) || [];
      arr.push(c);
      map.set(key, arr);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries;
  }, [filteredCases]);


  const viewerImages = useQuery(
    api.studyImages.listBySource,
    viewerTarget
      ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId }
      : "skip"
  );

  const handleViewImages = (
    sourceId: string,
    title: string
  ) => {
    setViewerTarget({ sourceType: "rapidCase", sourceId, title });
    setViewerOpen(true);
  };

  if (!cases) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search rapid cases by finding, diagnosis, or group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
        />
      </div>

      <div className="space-y-10">
        {groupedCases.map(([groupName, groupCases]) => (
          <div key={groupName} className="animate-in fade-in duration-500">
            <div className="flex items-end gap-3 mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{groupName}</h2>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md mb-1.5">
                {groupCases.length} CASES
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupCases.map(c => {
                const lookup = patternMap.get((c.title || c.keyFinding || "").toLowerCase().trim());
                const options = lookup
                  ? Array.from(new Set([c.diagnosis, ...lookup.differentialDiagnoses]))
                  : [c.diagnosis];
                // Use full doc only for the ONE expanded card
                const fullDiscriminator = (openDiscriminatorId === c._id && activeFullDiscriminator)
                  ? activeFullDiscriminator
                  : undefined;

                return (
                  <ImageDropZone
                    key={c._id}
                    sourceType="rapidCase"
                    sourceId={c._id}
                    imageCount={c.imageCount ?? 0}
                    onViewImages={() => handleViewImages(c._id, c.title || c.keyFinding)}
                    differentialOptions={options}
                  >
                    <RapidCard
                      caseData={c}
                      meta={meta}
                      abbrev={abbrev}
                      discriminator={fullDiscriminator}
                      hasDiscriminator={!!lookup}
                      discriminatorOpen={openDiscriminatorId === c._id}
                      setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? c._id : null)}
                      onViewImages={() => handleViewImages(c._id, c.title || c.keyFinding)}
                    />
                  </ImageDropZone>
                );
              })}
            </div>
          </div>
        ))}

        {groupedCases.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-400">No matching rapid cases found</p>
          </div>
        )}
      </div>

      <RapidImageViewer
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setViewerTarget(null);
        }}
        images={viewerImages ?? []}
        isLoading={viewerOpen && viewerImages === undefined}
        title={viewerTarget?.title ?? ""}
        hasDiscriminator={!!(
          viewerTarget && 
          patternMap.get(viewerTarget.title.toLowerCase().trim())
        )}
        onViewDiscriminators={() => {
          if (viewerTarget) {
            const found = cases?.find(c => c._id === viewerTarget.sourceId);
            if (found) {
              setOpenDiscriminatorId(found._id);
              setViewerOpen(false);
            }
          }
        }}
      />
    </div>
  );
}
