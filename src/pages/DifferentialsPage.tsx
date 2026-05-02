import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { getCategoryMeta } from "../lib/categoryConfig";
import { Search, Filter, ChevronDown, ChevronUp, BookOpen, ListTree, Lightbulb, Sparkles, LayoutGrid, Info, Target, BookmarkPlus, PlayCircle, ExternalLink, Plus, X, Edit2, Heart } from "lucide-react";
import { HighlightableText } from "../components/ui/HighlightableText";
import { useKnowledge } from "../lib/knowledgeContext";
import { KnowledgeTrigger } from "../components/ui/KnowledgeTrigger";
import { InlineDiscriminators, YJL2B_ROW_ORDER } from "../components/case/InlineDiscriminators";
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
  imageCount?: number;
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
  imageCount?: number;
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
  imageCount?: number;
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
  imageCount?: number;
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
  hasDiscriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
}: {
  dp: DifferentialPattern;
  discriminator?: Doc<"discriminators"> | null;
  hasDiscriminator?: boolean;
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

      {(hasDiscriminator || discriminator) && (
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
              <Sparkles className="w-3 h-3" />
              Discriminate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MnemonicCard({
  m,
  discriminator,
  hasDiscriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
}: {
  m: Mnemonic;
  discriminator?: Doc<"discriminators"> | null;
  hasDiscriminator?: boolean;
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

      {(hasDiscriminator || discriminator) && (
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
              <Sparkles className="w-3 h-3" />
              Discriminate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChapmanCard({
  c,
  discriminator,
  hasDiscriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
}: {
  c: ChapmanACE;
  discriminator?: Doc<"discriminators"> | null;
  hasDiscriminator?: boolean;
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

      {(hasDiscriminator || discriminator) && (
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
              <Sparkles className="w-3 h-3" />
              Discriminate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function YJLCard({
  c,
  discriminator,
  hasDiscriminator,
  discriminatorOpen,
  setDiscriminatorOpen,
  onViewImages,
  onAddNote,
  pendingNoteCount,
  onNavigateDiscriminator,
  discriminatorPosition,
  onEditDifferentials,
  columnOrder,
  onColumnReorder,
  isFavourited,
  onToggleFavourite,
}: {
  c: YJLCase;
  discriminator?: Doc<"discriminators"> | null;
  hasDiscriminator?: boolean;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
  onViewImages?: () => void;
  onAddNote?: () => void;
  pendingNoteCount?: number;
  onNavigateDiscriminator?: (direction: "prev" | "next") => void;
  discriminatorPosition?: { current: number; total: number };
  onEditDifferentials?: () => void;
  columnOrder?: number[];
  onColumnReorder?: (newOrder: number[]) => void;
  isFavourited?: boolean;
  onToggleFavourite?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(c.playlistCategory) ?? getCategoryMeta("Chest");

  return (
    <div className={`rounded-xl border ${meta.accentBorder} bg-white overflow-hidden transition-shadow hover:shadow-md flex flex-col group`}>
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
            <div className="shrink-0 flex items-center gap-1.5 pt-1 text-gray-400">
              {onEditDifferentials && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditDifferentials(); }}
                  className="p-1 rounded-lg text-slate-300 hover:text-teal-600 hover:bg-teal-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit differentials"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
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

      {(hasDiscriminator || discriminator) && (
        <div className="px-5 py-3 border-t border-gray-50 bg-slate-50/50">
          {(onAddNote || onToggleFavourite) && (
            <div className="flex justify-end gap-2 mb-2">
              {onToggleFavourite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavourite(); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    isFavourited
                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      : "text-slate-400 hover:text-rose-400 border border-transparent"
                  }`}
                  title={isFavourited ? "Remove from favourites" : "Add to favourites"}
                >
                  <Heart className={`w-3 h-3 ${isFavourited ? "fill-rose-500" : ""}`} />
                  {isFavourited ? "Saved" : "Favourite"}
                </button>
              )}
              {onAddNote && (
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
              )}
            </div>
          )}
          {discriminator ? (
            <InlineDiscriminators
              discriminator={discriminator}
              externalOpen={discriminatorOpen}
              setExternalOpen={setDiscriminatorOpen}
              onViewImages={onViewImages}
              rowOrder={YJL2B_ROW_ORDER}
              onNavigateCase={onNavigateDiscriminator}
              casePosition={discriminatorPosition}
              columnOrder={columnOrder}
              onColumnReorder={onColumnReorder}
              isFavourited={isFavourited}
              onToggleFavourite={onToggleFavourite}
            />
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setDiscriminatorOpen?.(true); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-teal-100 active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              Discriminate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EditDifferentialsModal({
  open,
  onClose,
  yjlCase,
  discriminator,
}: {
  open: boolean;
  onClose: () => void;
  yjlCase: YJLCase | null;
  discriminator?: Doc<"discriminators"> | null;
}) {
  const updateCase = useMutation(api.yjlCases.update);
  const updateDiscriminator = useMutation(api.discriminators.update);

  const [items, setItems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (open && yjlCase) {
      setItems([...yjlCase.top3Differentials]);
    }
  }, [open, yjlCase]);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      return next;
    });
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
  };

  const addItem = () => setItems((prev) => [...prev, ""]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!yjlCase) return;
    const filtered = items.filter((s) => s.trim());
    if (filtered.length === 0) return;
    setSaving(true);
    try {
      await updateCase({ id: yjlCase._id as Id<"yjlCases">, top3Differentials: filtered });

      if (discriminator) {
        const existing = discriminator.differentials;
        const existingNames = new Set(
          existing.map((d) => d.diagnosis.toLowerCase().trim())
        );
        const maxSortOrder = existing.reduce(
          (max, d) => Math.max(max, d.sortOrder ?? 0),
          0
        );
        const toAppend = filtered
          .filter((name) => !existingNames.has(name.toLowerCase().trim()))
          .map((name, i) => ({ diagnosis: name, sortOrder: maxSortOrder + i + 1 }));

        if (toAppend.length > 0) {
          await updateDiscriminator({
            id: discriminator._id,
            differentials: [...existing, ...toAppend],
          });
        }
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !yjlCase) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Differentials</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[280px]">{yjlCase.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {discriminator && (
          <p className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            Saving will update the discriminator table. Existing cell data is preserved.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            >
              <span className="text-slate-300 select-none text-sm leading-none shrink-0">⠿</span>
              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-blue-400"
              }`}>
                {i + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`Differential #${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300"
              />
              <button
                onClick={() => removeItem(i)}
                disabled={items.length <= 1}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-20"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Differential
        </button>

        <button
          onClick={handleSave}
          disabled={items.filter((s) => s.trim()).length === 0 || saving}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function CreateYJLCardModal({
  open,
  onClose,
  defaultCategory,
}: {
  open: boolean;
  onClose: () => void;
  defaultCategory: string | null;
}) {
  const createManual = useMutation(api.yjlCases.createManual);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory || YJL_CATEGORIES[0]);
  const [differentials, setDifferentials] = useState(["", "", ""]);
  const [presentation, setPresentation] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setTitle("");
    setDifferentials(["", "", ""]);
    setPresentation("");
    setCategory(defaultCategory || YJL_CATEGORIES[0]);
    setSaving(false);
  }
  if (open !== wasOpen) setWasOpen(open);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createManual({
        playlistCategory: category,
        title: title.trim(),
        top3Differentials: differentials.filter((d) => d.trim()),
        presentation: presentation.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">New Play Card</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
          {defaultCategory ? (
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 text-sm font-bold text-slate-700">{defaultCategory}</div>
          ) : (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all appearance-none bg-white"
            >
              {YJL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Case Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Solitary Pulmonary Nodule"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Differentials</label>
          <div className="space-y-2">
            {differentials.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                  i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-blue-400"
                }`}>{i + 1}</span>
                <input
                  type="text"
                  value={d}
                  onChange={(e) => {
                    const next = [...differentials];
                    next[i] = e.target.value;
                    setDifferentials(next);
                  }}
                  placeholder={`Differential #${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all placeholder:text-slate-300"
                />
                <button
                  onClick={() => setDifferentials((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={differentials.length <= 1}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-20 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setDifferentials((prev) => [...prev, ""])}
            className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Differential
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Clinical History (optional)</label>
          <textarea
            value={presentation}
            onChange={(e) => setPresentation(e.target.value)}
            placeholder="Brief clinical scenario..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all resize-none placeholder:text-slate-300"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
        >
          {saving ? "Creating..." : "Create Card"}
        </button>
      </div>
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
  // Lightweight lookup — only fields needed for map-building (bandwidth-optimised)
  type DiscriminatorLookup = {
    _id: Id<"discriminators">;
    pattern: string;
    obrienRef?: { obrienCaseNumber: number };
    mnemonicRef?: { mnemonic: string };
    differentialDiagnoses: string[];
  };
  const { results: allDiscriminatorLookups, status: _lookupStatus, loadMore: _loadMoreLookups } = usePaginatedQuery(
    api.discriminators.listLookup,
    {},
    { initialNumItems: 300 }
  ) as { results: DiscriminatorLookup[]; status: string; loadMore: (n: number) => void };
  useEffect(() => {
    if (_lookupStatus === "CanLoadMore") _loadMoreLookups(300);
  }, [_lookupStatus, _loadMoreLookups]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<"category" | "section">("category");
  const { openKnowledge } = useKnowledge();

  // Image library state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerActiveBucketName, setViewerActiveBucketName] = useState<string>("");
  const [viewerTarget, setViewerTarget] = useState<{
    sourceType: "differentialPattern" | "mnemonic" | "chapman" | "yjlCase";
    sourceId: string;
    title: string;
  } | null>(null);

  const [openDiscriminatorId, setOpenDiscriminatorIdRaw] = useState<string | null>(null);
  const [activeDiscriminatorId, setActiveDiscriminatorId] = useState<Id<"discriminators"> | null>(null);
  const setOpenDiscriminatorId = useCallback((sourceId: string | null, discriminatorId?: Id<"discriminators"> | null) => {
    setOpenDiscriminatorIdRaw(sourceId);
    setActiveDiscriminatorId(discriminatorId ?? null);
  }, []);

  // Text ingestion state
  const [textTarget, setTextTarget] = useState<{
    discriminatorId: Id<"discriminators">;
    pattern: string;
  } | null>(null);

  // Create card modal state
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [editDiffTarget, setEditDiffTarget] = useState<YJLCase | null>(null);

  // Add Note state
  const [noteTarget, setNoteTarget] = useState<Id<"discriminators"> | null>(null);
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
    (text: string, discriminator: { _id: Id<"discriminators">; pattern: string } | undefined) => {
      if (!discriminator) {
        alert("No discriminator table for this pattern");
        return;
      }
      setTextTarget({ discriminatorId: discriminator._id, pattern: discriminator.pattern });
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

  // Get full discriminator for text ingestion target (skip-query — only fetches when needed)
  const textTargetDiscriminator = useQuery(
    api.discriminators.get,
    textTarget ? { id: textTarget.discriminatorId } : "skip"
  ) ?? null;

  // Fetch images for the viewer target
  const viewerImages = useQuery(
    api.studyImages.listBySource,
    viewerTarget
      ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId }
      : "skip"
  );

  // Fetch and save viewer findings
  const viewerFindingsAll = useQuery(
    api.viewerFindings.getAllBySource,
    viewerTarget ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId } : "skip"
  );
  const viewerFindingsMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of viewerFindingsAll ?? []) { m.set(row.bucketName, row.findings); }
    return m;
  }, [viewerFindingsAll]);
  const saveFindings = useMutation(api.viewerFindings.save);

  const handleSaveFindings = useCallback((text: string, bucketName: string) => {
    if (!viewerTarget) return;
    saveFindings({ sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId, bucketName, findings: text });
  }, [viewerTarget, saveFindings]);

  const viewerPrefs = useQuery(
    api.viewerPreferences.get,
    viewerTarget ? { sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId } : "skip"
  );
  const saveFolderOrder = useMutation(api.viewerPreferences.setFolderOrder);

  const handleFolderReorder = useCallback((newOrder: string[]) => {
    if (!viewerTarget) return;
    saveFolderOrder({ sourceType: viewerTarget.sourceType, sourceId: viewerTarget.sourceId, folderOrder: newOrder });
  }, [viewerTarget, saveFolderOrder]);

  const saveColumnOrder = useMutation(api.viewerPreferences.setColumnOrder);
  const openCasePrefs = useQuery(
    api.viewerPreferences.get,
    openDiscriminatorId ? { sourceType: "yjlCase", sourceId: openDiscriminatorId } : "skip"
  );

  const handleColumnReorder = useCallback((newOrder: number[]) => {
    if (!openDiscriminatorId) return;
    saveColumnOrder({ sourceType: "yjlCase", sourceId: openDiscriminatorId, columnOrder: newOrder });
  }, [openDiscriminatorId, saveColumnOrder]);

  const allFavourites = useQuery(api.userFavourites.listAll) ?? [];
  const favouriteSet = useMemo(
    () => new Set(allFavourites.map((f) => f.sourceId)),
    [allFavourites]
  );
  const toggleFavourite = useMutation(api.userFavourites.toggle);

  const handleViewImages = (
    sourceType: "differentialPattern" | "mnemonic" | "chapman" | "yjlCase",
    sourceId: string,
    title: string
  ) => {
    setViewerTarget({ sourceType, sourceId, title });
    setViewerOpen(true);
  };

  // ── Horizontal navigation: Image Viewer case-to-case ──
  const viewerSiblings = useMemo(() => {
    if (!viewerTarget || viewerTarget.sourceType !== "yjlCase" || !allYJL) return null;
    const currentCase = allYJL.find(c => c._id === viewerTarget.sourceId);
    if (!currentCase) return null;
    const category = currentCase.playlistCategory;
    const siblings = allYJL
      .filter(c => c.playlistCategory === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = siblings.findIndex(c => c._id === viewerTarget.sourceId);
    return { siblings, currentIndex, category };
  }, [viewerTarget, allYJL]);

  const handleNavigateViewerCase = useCallback((direction: "prev" | "next") => {
    if (!viewerSiblings) return;
    const { siblings, currentIndex } = viewerSiblings;
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= siblings.length) return;
    const newCase = siblings[newIndex];
    setViewerTarget({ sourceType: "yjlCase", sourceId: newCase._id, title: newCase.title });
  }, [viewerSiblings]);

  // ── Horizontal navigation: Discriminator matrix case-to-case ──
  const discriminatorSiblings = useMemo(() => {
    if (!openDiscriminatorId || !allYJL) return null;
    const currentCase = allYJL.find(c => c._id === openDiscriminatorId);
    if (!currentCase) return null;
    const siblings = allYJL
      .filter(c => c.playlistCategory === currentCase.playlistCategory && c.discriminatorId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = siblings.findIndex(c => c._id === openDiscriminatorId);
    if (currentIndex === -1) return null;
    return { siblings, currentIndex };
  }, [openDiscriminatorId, allYJL]);

  const handleNavigateDiscriminator = useCallback((direction: "prev" | "next") => {
    if (!discriminatorSiblings) return;
    const { siblings, currentIndex } = discriminatorSiblings;
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= siblings.length) return;
    const next = siblings[newIndex];
    setOpenDiscriminatorId(next._id, next.discriminatorId as Id<"discriminators">);
  }, [discriminatorSiblings, setOpenDiscriminatorId]);

  const obrienMap = useMemo(() => {
    const map = new Map<number, DiscriminatorLookup>();
    allDiscriminatorLookups?.forEach(d => {
      if (d.obrienRef?.obrienCaseNumber) map.set(d.obrienRef.obrienCaseNumber, d);
    });
    return map;
  }, [allDiscriminatorLookups]);

  const mnemonicMap = useMemo(() => {
    const map = new Map<string, DiscriminatorLookup>();
    allDiscriminatorLookups?.forEach(d => {
      if (d.mnemonicRef?.mnemonic) map.set(d.mnemonicRef.mnemonic, d);
    });
    return map;
  }, [allDiscriminatorLookups]);

  const patternMap = useMemo(() => {
    const map = new Map<string, DiscriminatorLookup>();
    allDiscriminatorLookups?.forEach(d => {
      map.set(d.pattern.toLowerCase().trim(), d);
    });
    return map;
  }, [allDiscriminatorLookups]);

  // Fetch full discriminator only for the ONE currently expanded card
  const activeFullDiscriminator = useQuery(
    api.discriminators.get,
    activeDiscriminatorId ? { id: activeDiscriminatorId } : "skip"
  );

  // Fetch full discriminator for the edit differentials modal
  const editModalDiscriminator = useQuery(
    api.discriminators.get,
    editDiffTarget?.discriminatorId ? { id: editDiffTarget.discriminatorId as Id<"discriminators"> } : "skip"
  );

  // Fetch viewer detail when image viewer is open for any source that has a discriminator
  const viewerDiscriminatorId = useMemo(() => {
    if (!viewerTarget) return undefined;
    if (viewerTarget.sourceType === "yjlCase") {
      const yjlCase = allYJL?.find(c => c._id === viewerTarget.sourceId);
      return yjlCase?.discriminatorId as Id<"discriminators"> | undefined;
    }
    if (viewerTarget.sourceType === "differentialPattern") {
      const dp = allPatterns?.find(p => p._id === viewerTarget.sourceId);
      if (!dp) return undefined;
      return (obrienMap.get(dp.obrienCaseNumber) || patternMap.get(dp.pattern.toLowerCase().trim()))?._id;
    }
    if (viewerTarget.sourceType === "mnemonic") {
      const m = allMnemonics?.find(mn => mn._id === viewerTarget.sourceId);
      if (!m) return undefined;
      return (mnemonicMap.get(m.mnemonic) || patternMap.get(m.pattern.toLowerCase().trim()))?._id;
    }
    if (viewerTarget.sourceType === "chapman") {
      const c = allChapman?.find(ch => ch._id === viewerTarget.sourceId);
      if (!c) return undefined;
      return patternMap.get(c.pattern.toLowerCase().trim())?._id;
    }
    return undefined;
  }, [viewerTarget, allYJL, allPatterns, allMnemonics, allChapman, obrienMap, patternMap, mnemonicMap]);

  const viewerDetail = useQuery(
    api.discriminators.getViewerDetail,
    viewerDiscriminatorId ? { id: viewerDiscriminatorId } : "skip"
  );

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

  const groupedFavourites = useMemo(() => {
    const yjlFavs = allFavourites.filter((f) => f.sourceType === "yjlCase");
    const map = new Map<string, typeof yjlFavs>();
    for (const fav of yjlFavs) {
      const arr = map.get(fav.categoryName) ?? [];
      arr.push(fav);
      map.set(fav.categoryName, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      const ai = YJL_CATEGORIES.indexOf(a);
      const bi = YJL_CATEGORIES.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [allFavourites]);

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
            {groupedFavourites.length > 0 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-end gap-3 mb-6 border-b border-rose-100 pb-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Favourited Cases</h2>
                  <span className="text-[10px] font-black bg-rose-100 text-rose-500 px-2 py-1 rounded-md mb-1.5">
                    {allFavourites.filter(f => f.sourceType === "yjlCase").length} CASES
                  </span>
                </div>
                <div className="space-y-8">
                  {groupedFavourites.map(([categoryName, favs]) => (
                    <div key={categoryName}>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{categoryName}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {favs.map((fav) => {
                          const c = allYJL?.find((x) => x._id === fav.sourceId);
                          if (!c) return null;
                          const lookup = c.discriminatorId
                            ? allDiscriminatorLookups?.find((d) => d._id === c.discriminatorId)
                            : patternMap.get(c.title.toLowerCase().trim());
                          const discriminator = openDiscriminatorId === c._id && activeFullDiscriminator ? activeFullDiscriminator : undefined;
                          return (
                            <ImageDropZone
                              key={c._id}
                              sourceType="yjlCase"
                              sourceId={c._id}
                              imageCount={c.imageCount ?? 0}
                              onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                              differentialOptions={[c.title, ...c.top3Differentials]}
                            >
                              <YJLCard
                                c={c}
                                discriminator={discriminator}
                                hasDiscriminator={!!lookup}
                                discriminatorOpen={openDiscriminatorId === c._id}
                                setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? c._id : null, open ? lookup?._id : undefined)}
                                onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                                onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                                pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
                                onEditDifferentials={() => setEditDiffTarget(c)}
                                columnOrder={openDiscriminatorId === c._id ? openCasePrefs?.columnOrder : undefined}
                                onColumnReorder={openDiscriminatorId === c._id ? handleColumnReorder : undefined}
                                isFavourited={true}
                                onToggleFavourite={() => toggleFavourite({ sourceType: "yjlCase", sourceId: c._id, categoryName: c.playlistCategory, title: c.title })}
                              />
                            </ImageDropZone>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                        const lookup = obrienMap.get(dp.obrienCaseNumber) || patternMap.get(dp.pattern.toLowerCase().trim());
                        const isExpanded = openDiscriminatorId === dp._id;
                        return (
                          <div key={hy._id} className="relative">
                            <div className="absolute -top-3 left-4 z-10 bg-teal-500 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-black uppercase tracking-widest border border-teal-600">
                              {hy.clusterName}
                            </div>
                            <div className="pt-2">
                              <ImageDropZone
                                sourceType="differentialPattern"
                                sourceId={dp._id}
                                imageCount={dp.imageCount ?? 0}
                                onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                                onTextDrop={lookup ? (text) => handleTextDrop(text, { _id: lookup._id, pattern: lookup.pattern }) : undefined}
                                differentialOptions={[dp.diagnosis, ...dp.top3, ...dp.additional]}
                              >
                                <PatternCard
                                  dp={dp}
                                  discriminator={isExpanded ? activeFullDiscriminator : undefined}
                                  hasDiscriminator={!!lookup}
                                  discriminatorOpen={isExpanded}
                                  setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? dp._id : null, open ? lookup?._id : undefined)}
                                  onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                                  onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                                  pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
                                />
                              </ImageDropZone>
                            </div>
                          </div>
                        );
                      } else {
                        const m = hy.populatedData as Mnemonic;
                        const lookup = mnemonicMap.get(m.mnemonic) || patternMap.get(m.pattern.toLowerCase().trim());
                        const isExpanded = openDiscriminatorId === m._id;
                        return (
                          <div key={hy._id} className="relative">
                            <div className="absolute -top-3 left-4 z-10 bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-black uppercase tracking-widest border border-indigo-600">
                              {hy.clusterName}
                            </div>
                            <div className="pt-2">
                              <ImageDropZone
                                sourceType="mnemonic"
                                sourceId={m._id}
                                imageCount={m.imageCount ?? 0}
                                onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                                differentialOptions={[m.pattern, ...m.differentials.map(d => d.condition)]}
                              >
                                <MnemonicCard
                                  m={m}
                                  discriminator={isExpanded ? activeFullDiscriminator : undefined}
                                  hasDiscriminator={!!lookup}
                                  discriminatorOpen={isExpanded}
                                  setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? m._id : null, open ? lookup?._id : undefined)}
                                  onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                                  onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                                  pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
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
                      const lookup = obrienMap.get(dp.obrienCaseNumber) || patternMap.get(dp.pattern.toLowerCase().trim());
                      const isExpanded = openDiscriminatorId === dp._id;
                      return (
                        <ImageDropZone
                          key={dp._id}
                          sourceType="differentialPattern"
                          sourceId={dp._id}
                          imageCount={dp.imageCount ?? 0}
                          onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                          onTextDrop={lookup ? (text) => handleTextDrop(text, { _id: lookup._id, pattern: lookup.pattern }) : undefined}
                          differentialOptions={[dp.diagnosis, ...dp.top3, ...dp.additional]}
                        >
                          <PatternCard
                            dp={dp}
                            discriminator={isExpanded ? activeFullDiscriminator : undefined}
                            hasDiscriminator={!!lookup}
                            discriminatorOpen={isExpanded}
                            setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? dp._id : null, open ? lookup?._id : undefined)}
                            onViewImages={() => handleViewImages("differentialPattern", dp._id, dp.pattern)}
                            onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                            pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
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
                const lookup = mnemonicMap.get(m.mnemonic) || patternMap.get(m.pattern.toLowerCase().trim());
                const isExpanded = openDiscriminatorId === m._id;
                return (
                  <ImageDropZone
                    key={m._id}
                    sourceType="mnemonic"
                    sourceId={m._id}
                    imageCount={m.imageCount ?? 0}
                    onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                    onTextDrop={lookup ? (text) => handleTextDrop(text, { _id: lookup._id, pattern: lookup.pattern }) : undefined}
                    differentialOptions={[m.pattern, ...m.differentials.map(d => d.condition)]}
                  >
                    <MnemonicCard
                      m={m}
                      discriminator={isExpanded ? activeFullDiscriminator : undefined}
                      hasDiscriminator={!!lookup}
                      discriminatorOpen={isExpanded}
                      setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? m._id : null, open ? lookup?._id : undefined)}
                      onViewImages={() => handleViewImages("mnemonic", m._id, m.pattern)}
                      onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                      pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
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
                  <button
                    onClick={() => setCreateCardOpen(true)}
                    className="ml-auto mb-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Card
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {cases.sort((a, b) => a.sortOrder - b.sortOrder).map((c) => {
                    const lookup = c.discriminatorId
                      ? allDiscriminatorLookups?.find((d) => d._id === c.discriminatorId)
                      : patternMap.get(c.title.toLowerCase().trim());
                    // Use full doc only for the ONE expanded card, lightweight lookup for all others
                    const discriminator = (openDiscriminatorId === c._id && activeFullDiscriminator)
                      ? activeFullDiscriminator
                      : undefined;
                    return (
                      <ImageDropZone
                        key={c._id}
                        sourceType="yjlCase"
                        sourceId={c._id}
                        imageCount={c.imageCount ?? 0}
                        onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                        differentialOptions={[c.title, ...c.top3Differentials]}
                      >
                        <YJLCard
                          c={c}
                          discriminator={discriminator}
                          hasDiscriminator={!!lookup}
                          discriminatorOpen={openDiscriminatorId === c._id}
                          setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? c._id : null, open ? lookup?._id : undefined)}
                          onViewImages={() => handleViewImages("yjlCase", c._id, c.title)}
                          onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                          pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
                          onNavigateDiscriminator={openDiscriminatorId === c._id ? handleNavigateDiscriminator : undefined}
                          discriminatorPosition={openDiscriminatorId === c._id && discriminatorSiblings ? {
                            current: discriminatorSiblings.currentIndex + 1,
                            total: discriminatorSiblings.siblings.length,
                          } : undefined}
                          onEditDifferentials={() => setEditDiffTarget(c)}
                          columnOrder={openDiscriminatorId === c._id ? openCasePrefs?.columnOrder : undefined}
                          onColumnReorder={openDiscriminatorId === c._id ? handleColumnReorder : undefined}
                          isFavourited={favouriteSet.has(c._id)}
                          onToggleFavourite={() => toggleFavourite({
                            sourceType: "yjlCase",
                            sourceId: c._id,
                            categoryName: c.playlistCategory,
                            title: c.title,
                          })}
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
                const lookup = patternMap.get(c.pattern.toLowerCase().trim());
                const isExpanded = openDiscriminatorId === c._id;
                return (
                  <ImageDropZone
                    key={c._id}
                    sourceType="chapman"
                    sourceId={c._id}
                    imageCount={c.imageCount ?? 0}
                    onViewImages={() => handleViewImages("chapman", c._id, c.pattern)}
                    onTextDrop={lookup ? (text) => handleTextDrop(text, { _id: lookup._id, pattern: lookup.pattern }) : undefined}
                    differentialOptions={[c.pattern, ...c.families.flatMap(f => f.diagnoses)]}
                  >
                    <ChapmanCard
                      c={c}
                      discriminator={isExpanded ? activeFullDiscriminator : undefined}
                      hasDiscriminator={!!lookup}
                      discriminatorOpen={isExpanded}
                      setDiscriminatorOpen={(open) => setOpenDiscriminatorId(open ? c._id : null, open ? lookup?._id : undefined)}
                      onViewImages={() => handleViewImages("chapman", c._id, c.pattern)}
                      onAddNote={lookup ? () => setNoteTarget(lookup._id) : undefined}
                      pendingNoteCount={lookup ? (pendingCounts[lookup._id] ?? 0) : 0}
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

      {/* Edit Differentials Modal */}
      <EditDifferentialsModal
        open={!!editDiffTarget}
        onClose={() => setEditDiffTarget(null)}
        yjlCase={editDiffTarget}
        discriminator={editDiffTarget?.discriminatorId ? editModalDiscriminator : null}
      />

      {/* Create YJL Card Modal */}
      <CreateYJLCardModal
        open={createCardOpen}
        onClose={() => setCreateCardOpen(false)}
        defaultCategory={selectedCategory}
      />

      {/* Add Note Modal */}
      {noteTarget && (
        <AddNoteModal
          open={!!noteTarget}
          onClose={() => setNoteTarget(null)}
          discriminatorId={noteTarget}
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
            (viewerTarget.sourceType === "chapman" && (allChapman?.some(c => c._id === viewerTarget.sourceId && patternMap.get(c.pattern.toLowerCase().trim())))) ||
            (viewerTarget.sourceType === "yjlCase" && (allYJL?.some(c => c._id === viewerTarget.sourceId && c.discriminatorId)))
          )
        )}
        onViewDiscriminators={() => {
          if (viewerTarget) {
            // Resolve discriminator ID from source
            let discId: Id<"discriminators"> | undefined;
            if (viewerTarget.sourceType === "differentialPattern") {
              const dp = allPatterns?.find(p => p._id === viewerTarget.sourceId);
              if (dp) discId = (obrienMap.get(dp.obrienCaseNumber) || patternMap.get(dp.pattern.toLowerCase().trim()))?._id;
            } else if (viewerTarget.sourceType === "mnemonic") {
              const m = allMnemonics?.find(mn => mn._id === viewerTarget.sourceId);
              if (m) discId = (mnemonicMap.get(m.mnemonic) || patternMap.get(m.pattern.toLowerCase().trim()))?._id;
            } else if (viewerTarget.sourceType === "chapman") {
              const c = allChapman?.find(ch => ch._id === viewerTarget.sourceId);
              if (c) discId = patternMap.get(c.pattern.toLowerCase().trim())?._id;
            } else if (viewerTarget.sourceType === "yjlCase") {
              const c = allYJL?.find(yc => yc._id === viewerTarget.sourceId);
              if (c?.discriminatorId) discId = c.discriminatorId as Id<"discriminators">;
            }
            setOpenDiscriminatorId(viewerTarget.sourceId, discId);
            setViewerOpen(false);
          }
        }}
        differentialFolders={(() => {
          if (!viewerTarget || viewerTarget.sourceType !== "yjlCase") return undefined;
          const yjlCase = allYJL?.find(c => c._id === viewerTarget.sourceId);
          if (!yjlCase) return undefined;
          return [yjlCase.title, ...yjlCase.top3Differentials, "General / Uncategorized"];
        })()}
        vivaSummary={viewerDetail?.vivaSummary ?? undefined}
        sourceType={viewerTarget?.sourceType as any}
        sourceId={viewerTarget?.sourceId}
        dominantImagingFinding={viewerDetail?.dominantImagingFinding ?? undefined}
        discriminatingKeyFeature={viewerDetail?.discriminatingKeyFeature ?? undefined}
        vivaAnswer={(viewerDetail as any)?.vivaAnswer ?? undefined}
        onNavigateCase={viewerSiblings ? handleNavigateViewerCase : undefined}
        casePosition={viewerSiblings ? {
          current: viewerSiblings.currentIndex + 1,
          total: viewerSiblings.siblings.length,
          categoryName: viewerSiblings.category,
        } : undefined}
        findings={viewerFindingsMap.get(viewerActiveBucketName) ?? ""}
        onSaveFindings={(text) => handleSaveFindings(text, viewerActiveBucketName)}
        onActiveBucketChange={(name) => setViewerActiveBucketName(name)}
        savedFolderOrder={viewerPrefs?.folderOrder}
        onFolderReorder={handleFolderReorder}
        isFavourited={viewerTarget?.sourceType === "yjlCase" ? favouriteSet.has(viewerTarget.sourceId) : false}
        onToggleFavourite={viewerTarget?.sourceType === "yjlCase" ? () => {
          const c = allYJL?.find(x => x._id === viewerTarget?.sourceId);
          if (!c || !viewerTarget) return;
          toggleFavourite({ sourceType: "yjlCase", sourceId: c._id, categoryName: c.playlistCategory, title: c.title });
        } : undefined}
      />
    </div>
  );
}
