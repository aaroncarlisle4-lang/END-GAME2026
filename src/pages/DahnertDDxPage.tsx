import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronDown, ChevronUp, Search, List, Network, LayoutGrid } from "lucide-react";

// Reuse same chapter label logic
const CHAPTER_LABELS: Record<string, string> = {
  "MUSCULOSKELETAL SYSTEM": "MSK",
  "BONE AND SOFT-TISSUE DISORDERS": "Bone & Soft Tissue",
  "MUSCULOSKELETAL INFECTION": "MSK Infection",
  "NEUROPATHIC OSTEOARTHROPATHY": "Neuropathic OA",
  "DIAGNOSTIC GAMUT OF BONE DISORDERS": "Bone Gamuts",
  "CHEST DISORDERS": "Chest",
  "PNEUMONECTOMY CHEST": "Post-Pneumonectomy",
  "CHEST WALL": "Chest Wall",
  "DIFFERENTIAL DIAGNOSIS OF CHEST DISORDERS": "Chest DDx",
  "CENTRAL NERVOUS SYSTEM": "CNS",
  "SKULL AND SPINE DISORDERS": "Skull & Spine",
  "ANATOMY OF THE NERVOUS SYSTEM": "Neuro Anatomy",
  "NERVOUS SYSTEM DISORDERS": "NS Disorders",
  "DIFFERENTIAL DIAGNOSIS OF NERVOUS SYSTEM DISORDERS": "Neuro DDx",
  "DIFFERENTIAL DIAGNOSIS OF SKULL AND SPINE DISORDERS": "Skull/Spine DDx",
  "HEAD TRAUMA": "Head Trauma",
  "ORBITAL AND OCULAR DISORDERS": "Orbital & Ocular",
  "DIFFERENTIAL DIAGNOSIS OF ORBITAL AND OCULAR DISORDERS": "Orbital DDx",
  "GASTROINTESTINAL AND ABDOMINAL DISORDERS": "GI & Abdomen",
  "GASTROINTESTINAL HEMORRHAGE": "GI Haemorrhage",
  "GASTROINTESTINAL HORMONES": "GI Hormones",
  "GASTROINTESTINAL SCINTIGRAPHY": "GI Scintigraphy",
  "AND SPLENIC DISORDERS": "Splenic",
  "MESENTERIC VENOUS SYSTEM": "Mesenteric Veins",
  "LYMPH FLOW DISORDERS": "Lymph Flow",
  "COLLECTING SYSTEM": "Collecting System",
  "NEUROGENIC BLADDER": "Neurogenic Bladder",
  "DIFFERENTIAL DIAGNOSIS OF UROGENITAL DISORDERS": "GU DDx",
  "OBSTETRIC AND GYNECOLOGIC DISORDERS": "Gynae/Obstetric",
  "DIFFERENTIAL DIAGNOSIS OF OBSTETRIC AND GYNECOLOGIC": "Gynae DDx",
  "EAR, NOSE, AND THROAT DISORDERS": "ENT",
  "DIFFERENTIAL DIAGNOSIS OF EAR, NOSE, AND THROAT": "ENT DDx",
  "NECK": "Neck",
  "CARDIOVASCULAR DISORDERS": "Cardiovascular",
  "DIFFERENTIAL DIAGNOSIS OF CARDIOVASCULAR DISORDERS": "Cardiac DDx",
  "BREAST DISORDERS": "Breast",
  "BREAST ANATOMY": "Breast Anatomy",
  "BREAST CANCER": "Breast Cancer",
  "BREAST CYST": "Breast Cyst",
  "BREAST LESION": "Breast Lesion",
  "BREAST SKIN": "Breast Skin",
  "DIFFERENTIAL DIAGNOSIS OF BREAST DISORDERS": "Breast DDx",
  "MYELOPROLIFERATIVE DISORDERS": "Myeloproliferative",
  "PRINCIPLES OF TREATMENT": "Treatment",
  "TREATMENT OF CONTRAST REACTIONS": "Contrast Reactions",
  "TREATMENT OF ADVERSE CONTRAST REACTIONS2": "Contrast Reactions",
};

function chapterLabel(ch: string) {
  return CHAPTER_LABELS[ch] ?? ch.replace(/^(DIFFERENTIAL DIAGNOSIS OF |ANATOMY OF THE )/, "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

interface Differential {
  name: string;
  rank: number;
  frequency?: string;
  conditionSlug?: string;
  definition?: string;
  dominantFinding?: string;
  distribution?: string;
  demographics?: string;
  discriminatingFeatures?: string[];
}

interface Cluster {
  _id: string;
  finding: string;
  slug: string;
  chapter: string;
  clusterType: string;
  qualityScore: number;
  differentials: Differential[];
  context?: string;
}

function ClusterCard({ cluster }: { cluster: Cluster }) {
  const [expanded, setExpanded] = useState(false);
  const enrichedCount = cluster.differentials.filter(d => d.conditionSlug).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{cluster.finding}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">
                {chapterLabel(cluster.chapter)}
              </span>
              {cluster.clusterType !== "differential" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {cluster.clusterType}
                </span>
              )}
            </div>
            {/* Differential pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {cluster.differentials.slice(0, expanded ? undefined : 8).map((d, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    d.conditionSlug
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {d.name}
                </span>
              ))}
              {!expanded && cluster.differentials.length > 8 && (
                <span className="text-xs text-gray-400 px-1 py-0.5">
                  +{cluster.differentials.length - 8} more
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {enrichedCount > 0 && (
              <span className="text-xs text-teal-600 font-medium">
                {enrichedCount}/{cluster.differentials.length} linked
              </span>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded: enriched differentials */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
          {cluster.context && (
            <p className="text-xs text-gray-500 italic">{cluster.context}</p>
          )}
          <div className="space-y-2">
            {cluster.differentials.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">{d.name}</span>
                    {d.frequency && (
                      <span className="text-xs text-gray-500">({d.frequency})</span>
                    )}
                    {d.conditionSlug && (
                      <span className="text-xs text-teal-600">✓ linked</span>
                    )}
                  </div>
                  {d.definition && (
                    <p className="text-xs text-gray-600 mt-0.5 italic">{d.definition}</p>
                  )}
                  {d.dominantFinding && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      <span className="font-medium">Dominant: </span>{d.dominantFinding}
                    </p>
                  )}
                  {d.discriminatingFeatures && d.discriminatingFeatures.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {d.discriminatingFeatures.map((f, j) => (
                        <li key={j} className="text-xs text-gray-600">• {f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FrameworkCard({ cluster }: { cluster: Cluster }) {
  const [expanded, setExpanded] = useState(false);
  // Detect category headers (ALL_CAPS items) vs sub-items
  const isHeader = (name: string) => name === name.toUpperCase() && name.length > 2 && !/^\d/.test(name);

  return (
    <div className="rounded-xl border border-amber-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{cluster.finding}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              {chapterLabel(cluster.chapter)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase tracking-wide">
              Framework
            </span>
          </div>
          {!expanded && (
            <p className="text-xs text-gray-500 mt-1">
              {cluster.differentials.filter(d => isHeader(d.name)).map(d => d.name).slice(0, 4).join(" · ")}
              {cluster.differentials.filter(d => isHeader(d.name)).length > 4 && " …"}
            </p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="border-t border-amber-100 px-4 py-3 bg-amber-50/30 space-y-1">
          {cluster.context && (
            <p className="text-xs text-gray-500 italic mb-2">{cluster.context}</p>
          )}
          {cluster.differentials.map((d, i) => (
            <div key={i} className={isHeader(d.name) ? "mt-3 first:mt-0" : "pl-4"}>
              {isHeader(d.name) ? (
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest border-b border-amber-200 pb-0.5 mb-1">
                  {d.name}
                </p>
              ) : (
                <p className="text-xs text-gray-700 flex gap-1.5">
                  <span className="text-amber-400 flex-shrink-0">›</span>
                  {d.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DahnertDDxPage() {
  const allChapters = useQuery(api.dahnertDDxClusters.chapters, {});
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [minQuality, setMinQuality] = useState(0);
  const [tab, setTab] = useState<"ddx" | "frameworks">("ddx");

  const clusters = useQuery(
    api.dahnertDDxClusters.list,
    selectedChapter ? { chapter: selectedChapter, minQuality } : { minQuality }
  ) as Cluster[] | undefined;

  const { ddxFiltered, frameworksFiltered } = useMemo(() => {
    if (!clusters) return { ddxFiltered: [], frameworksFiltered: [] };
    const q = search.trim().toLowerCase();
    const match = (c: Cluster) =>
      !q || c.finding.toLowerCase().includes(q) || c.differentials.some(d => d.name.toLowerCase().includes(q));
    return {
      ddxFiltered: clusters.filter(c => c.clusterType !== "framework" && match(c)),
      frameworksFiltered: clusters.filter(c => c.clusterType === "framework" && match(c)),
    };
  }, [clusters, search]);

  const activeList = tab === "ddx" ? ddxFiltered : frameworksFiltered;

  return (
    <div className="flex gap-6 min-h-0">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="sticky top-20 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">Chapter</p>
          <button
            onClick={() => setSelectedChapter(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedChapter === null ? "bg-violet-600 text-white font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            All chapters
          </button>
          {(allChapters ?? []).map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedChapter(ch === selectedChapter ? null : ch)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors leading-snug ${
                selectedChapter === ch ? "bg-violet-600 text-white font-medium" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {chapterLabel(ch)}
            </button>
          ))}
          <div className="pt-4 px-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Min Quality</p>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.1} value={minQuality}
                onChange={e => setMinQuality(parseFloat(e.target.value))}
                className="flex-1 accent-violet-600" />
              <span className="text-xs text-gray-600 w-6 text-right">{minQuality.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${tab === "frameworks" ? "bg-amber-50 text-amber-700" : "bg-violet-50 text-violet-700"}`}>
            {tab === "frameworks" ? <LayoutGrid className="w-5 h-5" /> : <Network className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {tab === "frameworks" ? "Dahnert Frameworks" : "Dahnert DDx Clusters"}
            </h1>
            <p className="text-sm text-gray-500">
              {selectedChapter ? chapterLabel(selectedChapter) : "All chapters"} · {activeList.length} {tab === "frameworks" ? "framework" : "cluster"}{activeList.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit">
          <button
            onClick={() => setTab("ddx")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === "ddx" ? "bg-white text-violet-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            DDx Clusters <span className="ml-1 text-xs text-gray-400">{ddxFiltered.length}</span>
          </button>
          <button
            onClick={() => setTab("frameworks")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === "frameworks" ? "bg-white text-amber-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Frameworks <span className="ml-1 text-xs text-gray-400">{frameworksFiltered.length}</span>
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={tab === "frameworks" ? "Search frameworks…" : "Search findings or diagnoses…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {!clusters ? (
          <div className="text-center py-12 text-gray-400">
            <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : activeList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No results match your search.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tab === "frameworks"
              ? activeList.map(c => <FrameworkCard key={c._id} cluster={c} />)
              : activeList.map(c => <ClusterCard key={c._id} cluster={c} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
