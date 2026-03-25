import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { getCategoryMeta } from "../lib/categoryConfig";
import { Search, Filter, ChevronDown, ChevronUp, BookOpen, ListTree, Lightbulb, Sparkles, LayoutGrid, Info, Target, BookmarkPlus, PlayCircle, ExternalLink } from "lucide-react";
import { HighlightableText } from "../components/ui/HighlightableText";
import { useKnowledge } from "../lib/knowledgeContext";
import { KnowledgeTrigger } from "../components/ui/KnowledgeTrigger";
import { InlineDiscriminators } from "../components/case/InlineDiscriminators";
import { ImageDropZone } from "../components/images/ImageDropZone";
import { RapidImageViewer } from "../components/images/RapidImageViewer";
import { useTextIngestion } from "../hooks/useTextIngestion";
import { TextReviewModal } from "../components/text/TextReviewModal";
import { AddNoteModal } from "../components/text/AddNoteModal";

interface DifferentialPattern {
  _id: string;
  obrienCaseNumber: number;
  categoryAbbreviation: string;
  section: string;
  pattern: string;
  diagnosis: string;
  clinicalPresentation: string;
  top3: string[];
  additional: string[];
}

interface Mnemonic {
  _id: string;
  chapterNumber: number;
  bookSection: string;
  categoryAbbreviation: string;
  pattern: string;
  mnemonic: string;
  differentials: {
    letter: string;
    condition: string;
    associatedFeatures: string;
  }[];
  modelAnswer: string;
  pearls: string[];
}

interface ChapmanACE {
  _id: string;
  itemNumber: string;
  categoryAbbreviation: string;
  pattern: string;
  families: {
    familyName: string;
    diagnoses: string[];
  }[];
  additionalNotes?: string;
}

interface YJLCase {
  _id: string;
  playlistId: number;
  playlistName: string;
  playlistCategory: string;
  sortOrder: number;
  radiopaediaCaseUrl: string;
  title: string;
  presentation?: string;
  findings?: string;
  top3Differentials: string[];
  discriminatorId?: string;
  attribution?: string;
}

const CATEGORY_ORDER = [
  "Chest", "GI", "GU", "MSK", "ENT", "Neuro",
  "Paeds", "US", "Gynae", "VIR", "NucMed", "Breast", "Cardiac"
];

const YJL_CATEGORIES = [
  "Spine", "Chest", "GI", "GI Oncology", "GU", "Head and Neck",
  "MSK", "Multi-system", "Neuro", "Nuclear Medicine", "Pediatrics",
  "Abdominal Trauma", "Acute Pancreatitis", "Colorectal",
  "GI Emergencies", "HPB", "HPB Acute", "Upper GI"
];

function PatternCard({
  dp,
  discriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
}: {
  dp: DifferentialPattern;
  discriminator?: Doc<"discriminators"> | null;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
  onViewImages?: () => void;
  onAddNote?: () => void;
  pendingNoteCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(dp.categoryAbbreviation);
  const highlightKey = `pattern_${dp._id}`;

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
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${meta.accent} ${meta.accentText}`}>
                  {dp.categoryAbbreviation}
                </span>
                <span className="text-xs text-gray-400 font-medium">#{dp.obrienCaseNumber}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{dp.pattern}</h3>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">{dp.section}</p>
            </div>
            <div className="shrink-0 pt-1 text-gray-400">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {(expanded ? [...dp.top3, ...dp.additional] : dp.top3).map((dx, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? "bg-amber-100 text-amber-700" :
                  i === 1 ? "bg-slate-100 text-slate-600" :
                  i === 2 ? "bg-orange-50 text-orange-600" :
                  "bg-blue-50 text-blue-600"
                }`}>
                  {i + 1}
                </span>
                <span className={`text-sm ${dx === dp.diagnosis ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                  <KnowledgeTrigger query={dx}>
                    {dx}
                  </KnowledgeTrigger>
                  {dx === dp.diagnosis && (
                    <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                      Key Dx
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-4 border-t border-gray-100 pt-3 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinical Presentation</p>
              <HighlightableText id={highlightKey} text={dp.clinicalPresentation} className="text-sm text-gray-700 leading-relaxed" />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Final Diagnosis</p>
              <KnowledgeTrigger query={dp.diagnosis}>
                <HighlightableText id={highlightKey} text={dp.diagnosis} className="text-sm font-bold text-gray-900" />
              </KnowledgeTrigger>
            </div>
          </div>
        )}
      </div>

      {discriminator && (
        <div className="px-5 py-3 border-t border-gray-50 bg-slate-50/50">
          {onAddNote && (
            <div className="flex justify-end mb-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAddNote(); }}
                className="relative flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <BookmarkPlus className="w-3 h-3" />
                Add Note
                {!!pendingNoteCount && (
                  <span className="ml-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {pendingNoteCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <InlineDiscriminators
            discriminator={discriminator}
            externalOpen={discriminatorOpen}
            setExternalOpen={setDiscriminatorOpen}
            onViewImages={onViewImages}
          />
        </div>
      )}
    </div>
  );
}

function MnemonicCard({
  m,
  discriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
}: {
  m: Mnemonic;
  discriminator?: Doc<"discriminators"> | null;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
  onViewImages?: () => void;
  onAddNote?: () => void;
  pendingNoteCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(m.categoryAbbreviation);
  const highlightKey = `mnemonic_${m._id}`;

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
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${meta.accent} ${meta.accentText}`}>
                  {m.categoryAbbreviation}
                </span>
                <span className="text-xs text-gray-400 font-medium">Chapter {m.chapterNumber}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{m.pattern}</h3>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-sm font-black tracking-[0.1em] border border-indigo-100 uppercase">
                <Lightbulb className="w-3.5 h-3.5" />
                {m.mnemonic}
              </div>
            </div>
            <div className="shrink-0 pt-1 text-gray-400">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {!expanded && (
            <div className="mt-3 flex flex-wrap gap-1">
              {m.differentials.slice(0, 4).map((d, i) => (
                <span key={i} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">
                  {d.condition}
                </span>
              ))}
              {m.differentials.length > 4 && (
                <span className="text-[10px] text-gray-400 px-1 font-medium">+ {m.differentials.length - 4} more</span>
              )}
            </div>
          )}
        </div>

        {expanded && (
          <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
            <div className="space-y-2">
              {m.differentials.map((d, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-slate-900 text-[10px] font-black text-white border border-slate-800 shadow-sm">
                    {d.letter}
                  </span>
                  <div className="flex-1">
                    <KnowledgeTrigger query={d.condition}>
                      <HighlightableText id={highlightKey} text={d.condition} className="text-sm font-bold text-gray-900 leading-tight" />
                    </KnowledgeTrigger>
                    <HighlightableText id={highlightKey} text={d.associatedFeatures} className="text-xs text-gray-500 mt-0.5 leading-relaxed" />
                  </div>
                </div>
              ))}
            </div>

            {m.pearls && m.pearls.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  VIVA PEARLS
                </h4>
                <ul className="space-y-1.5">
                  {m.pearls.map((pearl, i) => (
                    <li key={i} className="text-xs text-amber-900/80 leading-relaxed flex gap-2">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                      <HighlightableText id={highlightKey} text={pearl} className="flex-1 font-medium" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {discriminator && (
        <div className="px-5 py-3 border-t border-gray-50 bg-slate-50/50">
          {onAddNote && (
            <div className="flex justify-end mb-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAddNote(); }}
                className="relative flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <BookmarkPlus className="w-3 h-3" />
                Add Note
                {!!pendingNoteCount && (
                  <span className="ml-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {pendingNoteCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <InlineDiscriminators
            discriminator={discriminator}
            externalOpen={discriminatorOpen}
            setExternalOpen={setDiscriminatorOpen}
            onViewImages={onViewImages}
          />
        </div>
      )}
    </div>
  );
}

function ChapmanCard({
  c,
  discriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
}: {
  c: ChapmanACE;
  discriminator?: Doc<"discriminators"> | null;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
  onViewImages?: () => void;
  onAddNote?: () => void;
  pendingNoteCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(c.categoryAbbreviation);
  const highlightKey = `chapman_${c._id}`;

  return (
    <div className={`group rounded-2xl border ${meta.accentBorder} bg-white hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col`}>
      <div className={`h-1.5 w-full ${meta.accent}`} />

      <div className="flex-1 flex flex-col">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => e.key === "Enter" && setExpanded((e) => !e)}
          className="w-full text-left p-5 flex flex-col h-full cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${meta.accent} ${meta.accentText}`}>
                  {c.categoryAbbreviation}
                </span>
                <span className="text-[10px] font-mono text-gray-400 font-bold">ACE {c.itemNumber}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-teal-700 transition-colors">
                {c.pattern}
              </h3>
            </div>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expanded ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>

          {!expanded && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.families.map((f, i) => (
                <span key={i} className="inline-flex items-center text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-tighter">
                  {f.familyName}
                </span>
              ))}
            </div>
          )}

          {expanded && (
            <div className="mt-6 space-y-6 w-full animate-in fade-in slide-in-from-top-2 duration-300">
              {c.families.map((f, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-200" />

                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    {f.familyName}
                    <span className="h-px flex-1 bg-slate-100" />
                  </h4>
                  <ul className="space-y-2.5">
                    {f.diagnoses.map((dx, j) => (
                      <li key={j}>
                        <KnowledgeTrigger query={dx}>
                          <div className="group/item flex items-start gap-2.5 cursor-help">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500/30 group-hover/item:bg-teal-500 group-hover/item:scale-125 shrink-0 transition-all duration-200" />
                            <HighlightableText 
                              id={highlightKey} 
                              text={dx} 
                              className="text-sm text-gray-700 font-medium group-hover/item:text-teal-700 transition-colors leading-relaxed" 
                            />
                          </div>
                        </KnowledgeTrigger>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {c.additionalNotes && (
                <div className="mt-4 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 flex gap-2 items-start">
                  <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800/80 leading-relaxed italic font-medium">
                    {c.additionalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {discriminator && (
        <div className="px-5 py-4 border-t border-gray-50 bg-slate-50/50">
          {onAddNote && (
            <div className="flex justify-end mb-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAddNote(); }}
                className="relative flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <BookmarkPlus className="w-3 h-3" />
                Add Note
                {!!pendingNoteCount && (
                  <span className="ml-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {pendingNoteCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <InlineDiscriminators
            discriminator={discriminator}
            externalOpen={discriminatorOpen}
            setExternalOpen={setDiscriminatorOpen}
            onViewImages={onViewImages}
          />
        </div>
      )}
    </div>
  );
}

function YJLCard({
  c,
  discriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
}: {
  c: YJLCase;
  discriminator?: Doc<"discriminators"> | null;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
  onViewImages?: () => void;
  onAddNote?: () => void;
  pendingNoteCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(c.playlistCategory) ?? getCategoryMeta("Chest");

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
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${meta.accent} ${meta.accentText}`}>
                  {c.playlistCategory}
                </span>
                <span className="text-xs text-gray-400 font-medium">#{c.sortOrder}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{c.title}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">{c.playlistName}</p>
            </div>
            <div className="shrink-0 pt-1 text-gray-400">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {!expanded && c.top3Differentials.length > 0 && (
            <div className="mt-3 space-y-1">
              {c.top3Differentials.slice(0, 3).map((dx, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-slate-100 text-slate-600" :
                    "bg-orange-50 text-orange-600"
                  }`}>{i + 1}</span>
                  <span className="text-sm text-gray-700">{dx}</span>
                </div>
              ))}
            </div>
          )}

          {!expanded && c.top3Differentials.length === 0 && (
            <p className="mt-2 text-[10px] text-slate-400 italic">No differentials yet</p>
          )}
        </div>

        {expanded && (
          <div className="px-5 pb-4 border-t border-gray-100 pt-3 space-y-3">
            {c.presentation && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinical History</p>
                <p className="text-sm text-gray-700 leading-relaxed">{c.presentation}</p>
              </div>
            )}
            {c.findings && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Discussion</p>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-6">{c.findings}</p>
              </div>
            )}
            <a
              href={`https://radiopaedia.org${c.radiopaediaCaseUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-600 hover:text-teal-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on Radiopaedia
            </a>
          </div>
        )}
      </div>

      {discriminator && (
        <div className="px-5 py-3 border-t border-gray-50 bg-slate-50/50">
          {onAddNote && (
            <div className="flex justify-end mb-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAddNote(); }}
                className="relative flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <BookmarkPlus className="w-3 h-3" />
                Add Note
                {!!pendingNoteCount && (
                  <span className="ml-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {pendingNoteCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <InlineDiscriminators
            discriminator={discriminator}
            externalOpen={discriminatorOpen}
            setExternalOpen={setDiscriminatorOpen}
            onViewImages={onViewImages}
          />
        </div>
      )}
    </div>
  );
}

export function DifferentialsPage() {
  const [activeTab, setActiveTab] = useState<"highyield" | "patterns" | "mnemonics" | "yjl2b" | "chapman">("highyield");
  const allHighYield = useQuery(api.highYield.getHighYieldClusters);
  const allPatterns = useQuery(api.differentialPatterns.list) as DifferentialPattern[] | undefined;
  const allMnemonics = useQuery(api.mnemonics.list) as Mnemonic[] | undefined;
  const allChapman = useQuery(api.chapman.list) as ChapmanACE[] | undefined;
  const allYJL = useQuery(api.yjlCases.list) as YJLCase[] | undefined;
  const allDiscriminators = useQuery(api.discriminators.list) as Doc<"discriminators">[] | undefined;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<"category" | "section">("category");
  const { openKnowledge } = useKnowledge();

  // Image library state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTarget, setViewerTarget] = useState<{
    sourceType: "differentialPattern" | "mnemonic" | "chapman" | "yjlCase";
    sourceId: string;
    title: string;
  } | null>(null);

  const [openDiscriminatorId, setOpenDiscriminatorId] = useState<string | null>(null);

  // Text ingestion state
  const [textTarget, setTextTarget] = useState<{
    discriminatorId: Id<"discriminators">;
    pattern: string;
  } | null>(null);

  // Add Note state
  const [noteTarget, setNoteTarget] = useState<Doc<"discriminators"> | null>(null);
  const pendingCounts = useQuery(api.pendingNotes.getPendingCounts) ?? {};

  const {
    processText,
    refineSuggestion,
    approveSuggestion,
    approveAll,
    dismissSuggestion,
    dismissAll,
    reset: resetIngestion,
    suggestions,
    isProcessing: isTextProcessing,
    error: textError,
  } = useTextIngestion();

  const patchField = useMutation(api.discriminators.patchDifferentialField);

  const handleTextDrop = useCallback(
    (text: string, discriminator: Doc<"discriminators"> | undefined) => {
      if (!discriminator) {
        alert("No discriminator table for this pattern");
        return;
      }
      setTextTarget({ discriminatorId: discriminator._id, pattern: discriminator.pattern });
      // Pass discriminatorId directly — no closure timing issue
      processText(text, discriminator._id);
    },
    [processText]
  );

  const handleTextModalClose = useCallback(() => {
    setTextTarget(null);
    resetIngestion();
  }, [resetIngestion]);

  const handleOverride = useCallback(
    async (differentialIndex: number, field: string, value: string) => {
      if (!textTarget) return;
      await patchField({
        id: textTarget.discriminatorId,
        differentialIndex,
        field,
        value,
      });
    },
    [textTarget, patchField]
  );

  // Get differential names for the override form
  const textTargetDiscriminator = useMemo(() => {
    if (!textTarget || !allDiscriminators) return null;
    return allDiscriminators.find((d) => d._id === textTarget.discriminatorId) ?? null;
  }, [textTarget, allDiscriminators]);

  // Batch image counts for each tab
  const patternIds = useMemo(() => allPatterns?.map((p) => p._id) ?? [], [allPatterns]);
  const mnemonicIds = useMemo(() => allMnemonics?.map((m) => m._id) ?? [], [allMnemonics]);
  const chapmanIds = useMemo(() => allChapman?.map((c) => c._id) ?? [], [allChapman]);

  const patternImageCounts = useQuery(
    api.studyImages.batchGetImageCounts,
    patternIds.length > 0
      ? { sourceType: "differentialPattern" as const, sourceIds: patternIds }
      : "skip"
  );
  const mnemonicImageCounts = useQuery(
    api.studyImages.batchGetImageCounts,
    mnemonicIds.length > 0
      ? { sourceType: "mnemonic" as const, sourceIds: mnemonicIds }
      : "skip"
  );
  const chapmanImageCounts = useQuery(
    api.studyImages.batchGetImageCounts,
    chapmanIds.length > 0
      ? { sourceType: "chapman" as const, sourceIds: chapmanIds }
      : "skip"
  );

  const yjlIds = useMemo(() => allYJL?.map((c) => c._id) ?? [], [allYJL]);
  const yjlImageCounts = useQuery(
    api.studyImages.batchGetImageCounts,
    yjlIds.length > 0
      ? { sourceType: "yjlCase" as const, sourceIds: yjlIds }
      : "skip"
  );

  // Fetch images for the viewer target
  const viewerImages = useQuery(
    api.studyImages.listBySource,
    viewerTarget
      ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId }
      : "skip"
  );

  const handleViewImages = (
    sourceType: "differentialPattern" | "mnemonic" | "chapman" | "yjlCase",
    sourceId: string,
    title: string
  ) => {
    setViewerTarget({ sourceType, sourceId, title });
    setViewerOpen(true);
  };

  const obrienMap = useMemo(() => {
    const map = new Map<number, Doc<"discriminators">>();
    allDiscriminators?.forEach(d => {
      if (d.obrienRef?.obrienCaseNumber) map.set(d.obrienRef.obrienCaseNumber, d);
    });
    return map;
  }, [allDiscriminators]);

  const mnemonicMap = useMemo(() => {
    const map = new Map<string, Doc<"discriminators">>();
    allDiscriminators?.forEach(d => {
      if (d.mnemonicRef?.mnemonic) map.set(d.mnemonicRef.mnemonic, d);
    });
    return map;
  }, [allDiscriminators]);

  const patternMap = useMemo(() => {
    const map = new Map<string, Doc<"discriminators">>();
    allDiscriminators?.forEach(d => {
      map.set(d.pattern.toLowerCase().trim(), d);
    });
    return map;
  }, [allDiscriminators]);

  const filteredPatterns = useMemo(() => {
    if (!allPatterns) return [];
    let results = allPatterns;
    if (selectedCategory) results = results.filter((dp) => dp.categoryAbbreviation === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (dp) =>
          dp.pattern.toLowerCase().includes(q) ||
          dp.diagnosis.toLowerCase().includes(q) ||
          dp.top3.some((t) => t.toLowerCase().includes(q)) ||
          dp.section.toLowerCase().includes(q)
      );
    }
    return results;
  }, [allPatterns, selectedCategory, searchQuery]);

  const filteredMnemonics = useMemo(() => {
    if (!allMnemonics) return [];
    let results = allMnemonics;
    if (selectedCategory) results = results.filter((m) => m.categoryAbbreviation === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (m) =>
          m.pattern.toLowerCase().includes(q) ||
          m.mnemonic.toLowerCase().includes(q) ||
          m.differentials.some((d) => d.condition.toLowerCase().includes(q))
      );
    }
    return results;
  }, [allMnemonics, selectedCategory, searchQuery]);

  const filteredChapman = useMemo(() => {
    if (!allChapman) return [];
    let results = allChapman;
    if (selectedCategory) results = results.filter((c) => c.categoryAbbreviation === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.pattern.toLowerCase().includes(q) ||
          c.families.some((f) => 
            f.familyName.toLowerCase().includes(q) || 
            f.diagnoses.some(dx => dx.toLowerCase().includes(q))
          )
      );
    }
    return results;
  }, [allChapman, selectedCategory, searchQuery]);

  const filteredYJL = useMemo(() => {
    if (!allYJL) return [];
    let results = allYJL;
    if (selectedCategory) results = results.filter((c) => c.playlistCategory === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.top3Differentials.some((d) => d.toLowerCase().includes(q)) ||
          c.playlistName.toLowerCase().includes(q)
      );
    }
    return results;
  }, [allYJL, selectedCategory, searchQuery]);

  const groupedYJL = useMemo(() => {
    const map = new Map<string, YJLCase[]>();
    for (const c of filteredYJL) {
      const arr = map.get(c.playlistCategory) || [];
      arr.push(c);
      map.set(c.playlistCategory, arr);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const ai = YJL_CATEGORIES.indexOf(a[0]);
      const bi = YJL_CATEGORIES.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return entries;
  }, [filteredYJL]);

  const filteredHighYield = useMemo(() => {
    if (!allHighYield) return [];
    let results = allHighYield;
    if (selectedCategory) results = results.filter((hy) => hy.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter((hy) => {
        const matchName = hy.clusterName.toLowerCase().includes(q);
        if (matchName) return true;
        if (hy.populatedData) {
          const pd = hy.populatedData as any;
          if (pd.pattern && pd.pattern.toLowerCase().includes(q)) return true;
          if (pd.diagnosis && pd.diagnosis.toLowerCase().includes(q)) return true;
          if (pd.top3 && pd.top3.some((t: string) => t.toLowerCase().includes(q))) return true;
          if (pd.mnemonic && pd.mnemonic.toLowerCase().includes(q)) return true;
          if (pd.differentials && pd.differentials.some((d: any) => d.condition.toLowerCase().includes(q))) return true;
        }
        return false;
      });
    }
    return results;
  }, [allHighYield, selectedCategory, searchQuery]);

  const groupedPatterns = useMemo(() => {
    const map = new Map<string, DifferentialPattern[]>();
    for (const dp of filteredPatterns) {
      const key = groupBy === "category" ? dp.categoryAbbreviation : dp.section;
      const arr = map.get(key) || [];
      arr.push(dp);
      map.set(key, arr);
    }
    const entries = Array.from(map.entries());
    if (groupBy === "category") {
      entries.sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a[0]);
        const bi = CATEGORY_ORDER.indexOf(b[0]);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    }
    return entries;
  }, [filteredPatterns, groupBy]);

  const groupedHighYield = useMemo(() => {
    const map = new Map<string, typeof filteredHighYield>();
    for (const hy of filteredHighYield) {
      const arr = map.get(hy.category) || [];
      arr.push(hy);
      map.set(hy.category, arr);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a[0]);
      const bi = CATEGORY_ORDER.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return entries;
  }, [filteredHighYield]);

  const availableCategories = useMemo(() => {
    if (activeTab === "yjl2b") {
      if (!allYJL) return [];
      const cats = Array.from(new Set(allYJL.map((c) => c.playlistCategory)));
      return cats.sort((a, b) => {
        const ai = YJL_CATEGORIES.indexOf(a);
        const bi = YJL_CATEGORIES.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    }
    const currentList = activeTab === "highyield" ? allHighYield : activeTab === "patterns" ? allPatterns : activeTab === "mnemonics" ? allMnemonics : allChapman;
    if (!currentList) return [];
    const cats = Array.from(new Set(currentList.map((x: any) => x.categoryAbbreviation || x.category)));
    return cats.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [allPatterns, allMnemonics, allChapman, allHighYield, allYJL, activeTab]);

  if (allPatterns === undefined || allMnemonics === undefined || allChapman === undefined || allHighYield === undefined || allYJL === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-72 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-teal-600" />
            Radiology Differentials
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeTab === "highyield"
              ? `Exploring 60 Highest-Yield Case Clusters`
              : activeTab === "patterns"
              ? `Exploring ${allPatterns.length} O'Brien High-Yield Patterns`
              : activeTab === "mnemonics"
              ? `Mastering ${allMnemonics.length} Viva Mnemonics`
              : activeTab === "yjl2b"
              ? `Reviewing ${allYJL.length} YJL Radiopaedia Cases`
              : `Reviewing ${allChapman.length} Chapman ACE Clusters`}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit shadow-inner border border-slate-200">
          {[
            { id: "highyield", label: "Highest Yield", icon: Target },
            { id: "patterns", label: "Top 3 Patterns", icon: ListTree },
            { id: "mnemonics", label: "Mnemonics", icon: Lightbulb },
            { id: "yjl2b", label: "YJL 2B", icon: PlayCircle },
            { id: "chapman", label: "ACE Differentials", icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id 
                  ? "bg-white text-slate-900 shadow-md scale-[1.02]" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-teal-600" : "text-slate-400"}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === "highyield"
                  ? "Search high-yield clusters..."
                  : activeTab === "patterns"
                  ? "Search O'Brien patterns..."
                  : activeTab === "mnemonics"
                  ? "Search viva mnemonics..."
                  : activeTab === "yjl2b"
                  ? "Search YJL cases by title or differential..."
                  : "Search Chapman's clusters..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-none bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => searchQuery.trim() && openKnowledge(searchQuery)}
            disabled={!searchQuery.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            RAG Query
          </button>
        </div>

        {activeTab === "patterns" && (
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "category" | "section")}
              className="w-full md:w-auto pl-11 pr-10 py-3 rounded-2xl border-none bg-slate-50 text-sm font-bold appearance-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
            >
              <option value="category">Group by Category</option>
              <option value="section">Group by Section</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5 items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2">Filter Category</span>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 border-2 ${
            selectedCategory === null
              ? "bg-slate-900 border-slate-900 text-white shadow-md scale-105"
              : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Categories
        </button>
        {availableCategories.map((cat) => {
          const meta = getCategoryMeta(cat);
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isActive ? null : cat)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 border-2 ${
                isActive
                  ? `bg-white ${meta.accentBorder} ${meta.accentText} shadow-md scale-105`
                  : `bg-white border-slate-50 text-slate-400 hover:border-slate-200`
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="relative">
        {activeTab === "highyield" && (
          <div className="space-y-12">
            {groupedHighYield.map(([groupName, clusters]) => (
              <div key={groupName} className="animate-in fade-in duration-500">
                <div className="flex items-end gap-3 mb-6 border-b border-slate-100 pb-2">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{groupName}</h2>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md mb-1.5">
                    {clusters.length} CLUSTERS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {clusters
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((hy) => {
                      if (!hy.populatedData) return null;

                      if (hy.sourceType === "pattern") {
                        const dp = hy.populatedData as DifferentialPattern;
                        const discriminator = obrienMap.get(dp.obrienCaseNumber) || patternMap.get(dp.pattern.toLowerCase().trim());
                        return (
                          <div key={hy._id} className="relative">
                            <div className="absolute -top-3 left-4 z-10 bg-teal-500 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-black uppercase tracking-widest border border-teal-600">
                              {hy.clusterName}
                            </div>
                            <div className="pt-2">
                              <ImageDropZone
                                sourceType="differentialPattern"
                                sourceId={dp._id}
                                imageCount={patternImageCounts?.[dp._id] ?? 0}
                                onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                                onTextDrop={(text) => handleTextDrop(text, discriminator ?? undefined)}
                                differentialOptions={[dp.diagnosis, ...dp.top3, ...dp.additional]}
                              >
                                <PatternCard
                                  dp={dp}
                                  discriminator={discriminator}
                                  discriminatorOpen={openDiscriminatorId === dp._id}
                                  setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? dp._id : null)}
                                  onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                                  onAddNote={discriminator ? () => setNoteTarget(discriminator) : undefined}
                                  pendingNoteCount={discriminator ? (pendingCounts[discriminator._id] ?? 0) : 0}
                                />
                              </ImageDropZone>
                            </div>
                          </div>
                        );
                      } else {
                        const m = hy.populatedData as Mnemonic;
                        const discriminator = mnemonicMap.get(m.mnemonic) || patternMap.get(m.pattern.toLowerCase().trim());
                        return (
                          <div key={hy._id} className="relative">
                            <div className="absolute -top-3 left-4 z-10 bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-black uppercase tracking-widest border border-indigo-600">
                              {hy.clusterName}
                            </div>
                            <div className="pt-2">
                              <ImageDropZone
                                sourceType="mnemonic"
                                sourceId={m._id}
                                imageCount={mnemonicImageCounts?.[m._id] ?? 0}
                                onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                                differentialOptions={[m.pattern, ...m.differentials.map(d => d.condition)]}
                              >
                                <MnemonicCard
                                  m={m}
                                  discriminator={discriminator}
                                  discriminatorOpen={openDiscriminatorId === m._id}
                                  setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? m._id : null)}
                                  onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                                  onAddNote={discriminator ? () => setNoteTarget(discriminator) : undefined}
                                  pendingNoteCount={discriminator ? (pendingCounts[discriminator._id] ?? 0) : 0}
                                />
                              </ImageDropZone>
                            </div>
                          </div>
                        );
                      }
                    })}
                </div>
              </div>
            ))}
            {groupedHighYield.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Target className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-400">No matching high-yield clusters found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "patterns" && (
          <div className="space-y-12">
            {groupedPatterns.map(([groupName, patterns]) => (
              <div key={groupName} className="animate-in fade-in duration-500">
                <div className="flex items-end gap-3 mb-6 border-b border-slate-100 pb-2">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{groupName}</h2>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md mb-1.5">
                    {patterns.length} ITEMS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {patterns
                    .sort((a, b) => a.obrienCaseNumber - b.obrienCaseNumber)
                    .map((dp) => {
                      const discriminator = obrienMap.get(dp.obrienCaseNumber) || patternMap.get(dp.pattern.toLowerCase().trim());
                      return (
                        <ImageDropZone
                          key={dp._id}
                          sourceType="differentialPattern"
                          sourceId={dp._id}
                          imageCount={patternImageCounts?.[dp._id] ?? 0}
                          onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                          onTextDrop={(text) => handleTextDrop(text, discriminator ?? undefined)}
                          differentialOptions={[dp.diagnosis, ...dp.top3, ...dp.additional]}
                        >
                          <PatternCard
                            dp={dp}
                            discriminator={discriminator}
                            discriminatorOpen={openDiscriminatorId === dp._id}
                            setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? dp._id : null)}
                            onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                            onAddNote={discriminator ? () => setNoteTarget(discriminator) : undefined}
                            pendingNoteCount={discriminator ? (pendingCounts[discriminator._id] ?? 0) : 0}
                          />
                        </ImageDropZone>
                      );
                    })}
                </div>
              </div>
            ))}
            {groupedPatterns.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-400">No matching O'Brien patterns found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "mnemonics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {filteredMnemonics
              .sort((a, b) => a.chapterNumber - b.chapterNumber)
              .map((m) => {
                const discriminator = mnemonicMap.get(m.mnemonic) || patternMap.get(m.pattern.toLowerCase().trim());
                return (
                  <ImageDropZone
                    key={m._id}
                    sourceType="mnemonic"
                    sourceId={m._id}
                    imageCount={mnemonicImageCounts?.[m._id] ?? 0}
                    onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                    onTextDrop={(text) => handleTextDrop(text, discriminator ?? undefined)}
                    differentialOptions={[m.pattern, ...m.differentials.map(d => d.condition)]}
                  >
                    <MnemonicCard
                      m={m}
                      discriminator={discriminator}
                      discriminatorOpen={openDiscriminatorId === m._id}
                      setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? m._id : null)}
                      onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                      onAddNote={discriminator ? () => setNoteTarget(discriminator) : undefined}
                      pendingNoteCount={discriminator ? (pendingCounts[discriminator._id] ?? 0) : 0}
                    />
                  </ImageDropZone>
                );
              })}
            {filteredMnemonics.length === 0 && (
              <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Lightbulb className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-400">No mnemonics found for this filter</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "yjl2b" && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {groupedYJL.map(([category, cases]) => (
              <div key={category}>
                <div className="flex items-end gap-3 mb-6 border-b border-slate-100 pb-2">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{category}</h2>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md mb-1.5">{cases.length} CASES</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {cases.sort((a, b) => a.sortOrder - b.sortOrder).map((c) => {
                    const discriminator = c.discriminatorId
                      ? allDiscriminators?.find((d) => d._id === c.discriminatorId)
                      : patternMap.get(c.title.toLowerCase().trim());
                    return (
                      <ImageDropZone
                        key={c._id}
                        sourceType="yjlCase"
                        sourceId={c._id}
                        imageCount={yjlImageCounts?.[c._id] ?? 0}
                        onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                        differentialOptions={c.top3Differentials}
                      >
                        <YJLCard
                          c={c}
                          discriminator={discriminator}
                          discriminatorOpen={openDiscriminatorId === c._id}
                          setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? c._id : null)}
                          onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                          onAddNote={discriminator ? () => setNoteTarget(discriminator) : undefined}
                          pendingNoteCount={discriminator ? (pendingCounts[discriminator._id] ?? 0) : 0}
                        />
                      </ImageDropZone>
                    );
                  })}
                </div>
              </div>
            ))}
            {groupedYJL.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <PlayCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-400">No YJL cases for this filter</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "chapman" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {filteredChapman
              .sort((a, b) => {
                const [a1, a2] = a.itemNumber.split('.').map(Number);
                const [b1, b2] = b.itemNumber.split('.').map(Number);
                if (a1 !== b1) return a1 - b1;
                return (a2 || 0) - (b2 || 0);
              })
              .map((c) => {
                const discriminator = patternMap.get(c.pattern.toLowerCase().trim());
                return (
                  <ImageDropZone
                    key={c._id}
                    sourceType="chapman"
                    sourceId={c._id}
                    imageCount={chapmanImageCounts?.[c._id] ?? 0}
                    onViewImages={() => handleViewImages("chapman", c._id, c.pattern)}
                    onTextDrop={(text) => handleTextDrop(text, discriminator ?? undefined)}
                    differentialOptions={[c.pattern, ...c.families.flatMap(f => f.diagnoses)]}
                  >
                    <ChapmanCard
                      c={c}
                      discriminator={discriminator}
                      discriminatorOpen={openDiscriminatorId === c._id}
                      setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? c._id : null)}
                      onViewImages={() => handleViewImages("chapman", c._id, c.pattern)}
                      onAddNote={discriminator ? () => setNoteTarget(discriminator) : undefined}
                      pendingNoteCount={discriminator ? (pendingCounts[discriminator._id] ?? 0) : 0}
                    />
                  </ImageDropZone>
                );
              })}
            {filteredChapman.length === 0 && (
              <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-400">No Chapman differentials found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {noteTarget && (
        <AddNoteModal
          open={!!noteTarget}
          onClose={() => setNoteTarget(null)}
          discriminator={noteTarget}
        />
      )}

      {/* Text Ingestion Review Modal */}
      <TextReviewModal
        open={!!textTarget}
        onClose={handleTextModalClose}
        patternName={textTarget?.pattern ?? ""}
        suggestions={suggestions}
        isProcessing={isTextProcessing}
        error={textError}
        onApprove={approveSuggestion}
        onDismiss={dismissSuggestion}
        onApproveAll={approveAll}
        onDismissAll={dismissAll}
        onRefine={refineSuggestion}
        onOverride={handleOverride}
        differentialNames={[
          ...(textTargetDiscriminator?.differentials.map((d) => d.diagnosis) ?? []),
          ...(textTargetDiscriminator?.seriousAlternatives?.filter(
            (alt) => !textTargetDiscriminator.differentials.some((d) => d.diagnosis.toLowerCase() === alt.toLowerCase())
          ) ?? []),
        ]}
      />

      {/* Rapid Image Viewer */}
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
          viewerTarget && (
            (viewerTarget.sourceType === "differentialPattern" && (allPatterns?.some(p => p._id === viewerTarget.sourceId && (obrienMap.get(p.obrienCaseNumber) || patternMap.get(p.pattern.toLowerCase().trim()))))) ||
            (viewerTarget.sourceType === "mnemonic" && (allMnemonics?.some(m => m._id === viewerTarget.sourceId && (mnemonicMap.get(m.mnemonic) || patternMap.get(m.pattern.toLowerCase().trim()))))) ||
            (viewerTarget.sourceType === "chapman" && (allChapman?.some(c => c._id === viewerTarget.sourceId && patternMap.get(c.pattern.toLowerCase().trim()))))
          )
        )}
        onViewDiscriminators={() => {
          if (viewerTarget) {
            setOpenDiscriminatorId(viewerTarget.sourceId);
            setViewerOpen(false);
          }
        }}
        differentialFolders={(() => {
          if (!viewerTarget || viewerTarget.sourceType !== "yjlCase") return undefined;
          const yjlCase = allYJL?.find(c => c._id === viewerTarget.sourceId);
          if (!yjlCase) return undefined;
          return [yjlCase.title, ...yjlCase.top3Differentials, "General / Uncategorized"];
        })()}
        vivaSummary={(() => {
          if (!viewerTarget || viewerTarget.sourceType !== "yjlCase") return undefined;
          const yjlCase = allYJL?.find(c => c._id === viewerTarget.sourceId);
          if (!yjlCase?.discriminatorId) return undefined;
          const disc = allDiscriminators?.find(d => d._id === yjlCase.discriminatorId);
          return disc?.vivaSummary ?? undefined;
        })()}
      />
    </div>
  );
}
