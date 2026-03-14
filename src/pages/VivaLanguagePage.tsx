import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, ChevronDown, ChevronUp, MessageSquare, BookOpen, ShieldAlert, Zap, Layers } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { HighlightableText } from "../components/ui/HighlightableText";

interface VivaFrameworkEntry {
  _id: string;
  category: string;
  subcategory: string;
  context: string;
  phrases: string[];
  examples: string[];
  specialty?: string;
  sourceRef: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  Structure: BookOpen,
  Recovery: Zap,
  Safety: ShieldAlert,
  Differentials: Layers,
  Specialty: MessageSquare,
};

function VivaCard({ entry }: { entry: VivaFrameworkEntry }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[entry.category] || MessageSquare;
  const highlightKey = `viva_lang_${entry._id}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-5 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                {entry.category} • {entry.subcategory}
              </span>
              {entry.specialty && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] py-0 px-1.5">
                  {entry.specialty}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{entry.context}</h3>
          </div>
          <div className="shrink-0 pt-1 text-gray-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {!expanded && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">
            "{entry.phrases[0]}"
          </p>
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Key Phrases</p>
            <ul className="space-y-2">
              {entry.phrases.map((phrase, i) => (
                <li key={i} className="flex gap-2.5">
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-200 mt-1.5" />
                  <HighlightableText
                    id={highlightKey}
                    text={phrase}
                    className="text-sm text-gray-700 leading-relaxed font-medium flex-1"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5 pt-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Examples</p>
            {entry.examples.map((example, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <HighlightableText
                  id={highlightKey}
                  text={example}
                  className="text-sm text-gray-600 italic leading-relaxed"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 italic">Source: {entry.sourceRef}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function VivaLanguagePage() {
  const allEntries = useQuery(api.vivaFramework.list) as VivaFrameworkEntry[] | undefined;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    if (!allEntries) return [];
    return [...new Set(allEntries.map((e) => e.category))].sort();
  }, [allEntries]);

  const filtered = useMemo(() => {
    if (!allEntries) return [];
    let results = allEntries;

    if (selectedCategory) {
      results = results.filter((e) => e.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (e) =>
          e.context.toLowerCase().includes(q) ||
          e.subcategory.toLowerCase().includes(q) ||
          e.phrases.some((p) => p.toLowerCase().includes(q)) ||
          e.examples.some((ex) => ex.toLowerCase().includes(q)) ||
          (e.specialty && e.specialty.toLowerCase().includes(q))
      );
    }

    return results;
  }, [allEntries, selectedCategory, searchQuery]);

  if (allEntries === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-72 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Viva Language & Frameworks</h1>
        <p className="text-gray-500 mt-1">
          Master the "thinking out loud" OSCE-style script for the FRCR 2B viva
        </p>
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search phrases, scenarios, specialties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            selectedCategory === null
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({allEntries.length})
        </button>
        {categories.map((cat) => {
          const count = allEntries.filter((e) => e.category === cat).length;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isActive ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                isActive
                  ? "bg-indigo-100 text-indigo-700 ring-2 ring-offset-1 ring-indigo-500 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((entry) => (
          <VivaCard key={entry._id} entry={entry} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-medium">No scripts found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
