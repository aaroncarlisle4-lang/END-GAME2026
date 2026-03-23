import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronDown, ChevronUp, BookOpen, Search, List } from "lucide-react";

// Chapter → display label (shorten verbose headings)
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

const CHAPTER_COLORS: Record<string, string> = {
  "MUSCULOSKELETAL SYSTEM": "bg-amber-50 text-amber-800 border-amber-200",
  "BONE AND SOFT-TISSUE DISORDERS": "bg-amber-50 text-amber-800 border-amber-200",
  "MUSCULOSKELETAL INFECTION": "bg-amber-50 text-amber-800 border-amber-200",
  "NEUROPATHIC OSTEOARTHROPATHY": "bg-amber-50 text-amber-800 border-amber-200",
  "DIAGNOSTIC GAMUT OF BONE DISORDERS": "bg-amber-50 text-amber-800 border-amber-200",
  "CHEST DISORDERS": "bg-blue-50 text-blue-800 border-blue-200",
  "PNEUMONECTOMY CHEST": "bg-blue-50 text-blue-800 border-blue-200",
  "CHEST WALL": "bg-blue-50 text-blue-800 border-blue-200",
  "DIFFERENTIAL DIAGNOSIS OF CHEST DISORDERS": "bg-blue-50 text-blue-800 border-blue-200",
  "CENTRAL NERVOUS SYSTEM": "bg-purple-50 text-purple-800 border-purple-200",
  "SKULL AND SPINE DISORDERS": "bg-purple-50 text-purple-800 border-purple-200",
  "ANATOMY OF THE NERVOUS SYSTEM": "bg-purple-50 text-purple-800 border-purple-200",
  "NERVOUS SYSTEM DISORDERS": "bg-purple-50 text-purple-800 border-purple-200",
  "DIFFERENTIAL DIAGNOSIS OF NERVOUS SYSTEM DISORDERS": "bg-purple-50 text-purple-800 border-purple-200",
  "DIFFERENTIAL DIAGNOSIS OF SKULL AND SPINE DISORDERS": "bg-purple-50 text-purple-800 border-purple-200",
  "HEAD TRAUMA": "bg-purple-50 text-purple-800 border-purple-200",
  "ORBITAL AND OCULAR DISORDERS": "bg-purple-50 text-purple-800 border-purple-200",
  "DIFFERENTIAL DIAGNOSIS OF ORBITAL AND OCULAR DISORDERS": "bg-purple-50 text-purple-800 border-purple-200",
  "GASTROINTESTINAL AND ABDOMINAL DISORDERS": "bg-green-50 text-green-800 border-green-200",
  "GASTROINTESTINAL HEMORRHAGE": "bg-green-50 text-green-800 border-green-200",
  "GASTROINTESTINAL HORMONES": "bg-green-50 text-green-800 border-green-200",
  "GASTROINTESTINAL SCINTIGRAPHY": "bg-green-50 text-green-800 border-green-200",
  "AND SPLENIC DISORDERS": "bg-green-50 text-green-800 border-green-200",
  "MESENTERIC VENOUS SYSTEM": "bg-green-50 text-green-800 border-green-200",
  "LYMPH FLOW DISORDERS": "bg-green-50 text-green-800 border-green-200",
  "COLLECTING SYSTEM": "bg-teal-50 text-teal-800 border-teal-200",
  "NEUROGENIC BLADDER": "bg-teal-50 text-teal-800 border-teal-200",
  "DIFFERENTIAL DIAGNOSIS OF UROGENITAL DISORDERS": "bg-teal-50 text-teal-800 border-teal-200",
  "OBSTETRIC AND GYNECOLOGIC DISORDERS": "bg-pink-50 text-pink-800 border-pink-200",
  "DIFFERENTIAL DIAGNOSIS OF OBSTETRIC AND GYNECOLOGIC": "bg-pink-50 text-pink-800 border-pink-200",
  "EAR, NOSE, AND THROAT DISORDERS": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "DIFFERENTIAL DIAGNOSIS OF EAR, NOSE, AND THROAT": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "NECK": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "CARDIOVASCULAR DISORDERS": "bg-red-50 text-red-800 border-red-200",
  "DIFFERENTIAL DIAGNOSIS OF CARDIOVASCULAR DISORDERS": "bg-red-50 text-red-800 border-red-200",
  "BREAST DISORDERS": "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  "BREAST ANATOMY": "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  "BREAST CANCER": "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  "BREAST CYST": "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  "BREAST LESION": "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  "BREAST SKIN": "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  "DIFFERENTIAL DIAGNOSIS OF BREAST DISORDERS": "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
};

const DEFAULT_COLOR = "bg-gray-50 text-gray-800 border-gray-200";

function chapterLabel(ch: string) {
  return CHAPTER_LABELS[ch] ?? ch.replace(/^(DIFFERENTIAL DIAGNOSIS OF |ANATOMY OF THE )/, "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
function chapterColor(ch: string) {
  return CHAPTER_COLORS[ch] ?? DEFAULT_COLOR;
}

const MODALITY_LABELS: Record<string, string> = {
  general: "General / X-ray",
  xray: "X-ray",
  cxr: "CXR",
  ct: "CT",
  cect: "CECT",
  nect: "NECT",
  hrct: "HRCT",
  mri: "MRI",
  us: "US",
  angio: "Angiography",
  nuc: "Nuclear Med",
  pet: "PET",
};

interface Condition {
  _id: string;
  name: string;
  slug: string;
  chapter: string;
  definition?: string;
  demographics?: string[];
  dominantFinding?: string;
  distribution?: string;
  discriminatingFeatures: string[];
  modalityFindings: Record<string, string[] | undefined>;
  clinical?: string[];
}

function ConditionCard({ condition }: { condition: Condition }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = chapterColor(condition.chapter);
  const hasExtra = condition.definition || (condition.demographics?.length ?? 0) > 0 ||
    condition.distribution || (condition.clinical?.length ?? 0) > 0 ||
    Object.values(condition.modalityFindings).some(v => v && v.length > 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm tracking-wide">
                {condition.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorClass}`}>
                {chapterLabel(condition.chapter)}
              </span>
            </div>
            {condition.dominantFinding && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium text-gray-700">Dominant: </span>
                {condition.dominantFinding}
              </p>
            )}
          </div>
          {hasExtra && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Discriminating features — always visible */}
        {condition.discriminatingFeatures.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {condition.discriminatingFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                <span className="text-teal-500 mt-0.5 flex-shrink-0">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Expanded content */}
      {expanded && hasExtra && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-gray-50">
          {condition.definition && (
            <p className="text-xs text-gray-700 italic">{condition.definition}</p>
          )}
          {condition.distribution && (
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Distribution: </span>
              <span className="text-xs text-gray-700">{condition.distribution}</span>
            </div>
          )}
          {condition.demographics && condition.demographics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Demographics</p>
              <ul className="space-y-0.5">
                {condition.demographics.map((d, i) => (
                  <li key={i} className="text-xs text-gray-700">• {d}</li>
                ))}
              </ul>
            </div>
          )}
          {condition.clinical && condition.clinical.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Clinical</p>
              <ul className="space-y-0.5">
                {condition.clinical.map((c, i) => (
                  <li key={i} className="text-xs text-gray-700">• {c}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Modality findings */}
          {Object.entries(condition.modalityFindings)
            .filter(([, v]) => v && v.length > 0)
            .map(([key, items]) => (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  {MODALITY_LABELS[key] ?? key}
                </p>
                <ul className="space-y-0.5">
                  {(items as string[]).map((item, i) => (
                    <li key={i} className="text-xs text-gray-700">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export function DahnertConditionsPage() {
  const allChapters = useQuery(api.dahnertConditions.chapters, {});
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const conditions = useQuery(
    api.dahnertConditions.list,
    selectedChapter ? { chapter: selectedChapter } : {}
  ) as Condition[] | undefined;

  const filtered = useMemo(() => {
    if (!conditions) return [];
    if (!search.trim()) return conditions;
    const q = search.toLowerCase();
    return conditions.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.dominantFinding?.toLowerCase().includes(q) ||
      c.discriminatingFeatures.some(f => f.toLowerCase().includes(q))
    );
  }, [conditions, search]);

  const totalCount = conditions?.length ?? 0;

  return (
    <div className="flex gap-6 min-h-0">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="sticky top-20 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
            Chapter
          </p>
          <button
            onClick={() => setSelectedChapter(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedChapter === null
                ? "bg-teal-600 text-white font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            All chapters
          </button>
          {(allChapters ?? []).map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedChapter(ch === selectedChapter ? null : ch)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors leading-snug ${
                selectedChapter === ch
                  ? "bg-teal-600 text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {chapterLabel(ch)}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dahnert Conditions</h1>
            <p className="text-sm text-gray-500">
              {selectedChapter ? chapterLabel(selectedChapter) : "All chapters"} ·{" "}
              {totalCount} condition{totalCount !== 1 ? "s" : ""}
              {filtered.length !== totalCount && ` · ${filtered.length} matching`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conditions, findings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Conditions list */}
        {!conditions ? (
          <div className="text-center py-12 text-gray-400">
            <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Loading conditions…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No conditions match your search.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <ConditionCard key={c._id} condition={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
