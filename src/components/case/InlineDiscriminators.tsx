import { useState, useMemo, Fragment, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  GitBranch, X, CheckCircle2, AlertTriangle, Fingerprint, MapPin,
  Activity, UserSquare2, Info, Sparkles, Edit2, Save, Type,
  Highlighter, Underline as UnderlineIcon, Check, RotateCcw, MonitorDot,
  ChevronLeft, ChevronRight, ChevronsUpDown
} from "lucide-react";

interface Props {
  discriminator: Doc<"discriminators">;
  externalOpen?: boolean;
  setExternalOpen?: (open: boolean) => void;
  onViewImages?: () => void;
}

// ── Helpers ──

const ROW_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; aliases: string[]; dbField: string }> = {
  dominantImagingFactor: { 
    label: "DOMINANT IMAGING FACTOR", 
    icon: Fingerprint, 
    color: "text-blue-700",
    bg: "bg-blue-50",
    aliases: ["dominantImagingFinding", "keyImagingPattern"],
    dbField: "dominantImagingFinding"
  },
  distributionLocation: { 
    label: "DISTRIBUTION & LOCATION", 
    icon: MapPin, 
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    aliases: ["distribution"],
    dbField: "distributionLocation"
  },
  demographicsClinicalContext: { 
    label: "DEMOGRAPHICS & CLINICAL", 
    icon: UserSquare2, 
    color: "text-purple-700",
    bg: "bg-purple-50",
    aliases: ["clinicalContext"],
    dbField: "demographicsClinicalContext"
  },
  associatedFindings: { 
    label: "ASSOCIATED FINDINGS", 
    icon: Activity, 
    color: "text-amber-700",
    bg: "bg-amber-50",
    aliases: [],
    dbField: "associatedFindings"
  },
  keyDiscriminatingFactors: { 
    label: "KEY DISCRIMINATING FACTORS", 
    icon: CheckCircle2, 
    color: "text-teal-700",
    bg: "bg-teal-50",
    aliases: ["discriminatingKeyFeature", "keyDiscriminator"],
    dbField: "discriminatingKeyFeature"
  },
  complicationsSeriousAlternatives: {
    label: "COMPLICATIONS & ALTS",
    icon: AlertTriangle,
    color: "text-rose-700",
    bg: "bg-rose-50",
    aliases: [],
    dbField: "complicationsSeriousAlternatives"
  },
};

// Rows that span all columns (pattern-level, not per-differential)
const PATTERN_ROWS: { key: string; label: string; icon: any; color: string; bg: string; emptyText: string }[] = [
  { key: "commonPitfalls", label: "COMMON PITFALLS", icon: AlertTriangle, color: "text-orange-700", bg: "bg-orange-50", emptyText: "No pitfalls recorded" },
  { key: "nextBestStep", label: "NEXT BEST STEP", icon: Info, color: "text-indigo-700", bg: "bg-indigo-50", emptyText: "No next step recorded" },
];

/**
 * Intelligent medical text parser for rich formatting
 */
export function FormattedMedicalText({ text, isCorrect }: { text: string; isCorrect: boolean }) {
  // Regex for keywords that deserve highlighting (no capturing groups to avoid split double-splicing)
  const highlights = {
    critical: /\b(?:MALIGNANT|CANCER|CARCINOMA|SERIOUS|URGENT|ACUTE|EMERGENCY|DEATH|FATAL)\b/gi,
    positive: /\b(?:BENIGN|STABLE|NORMAL|INCREASED|GOLD STANDARD|CLASSIC|PATHOGNOMONIC|CHARACTERISTIC)\b/gi,
    negative: /\b(?:ABSENT|NEGATIVE|DECREASED|LOW|NONE)\b/gi,
  };

  // If text contains newlines (Dahnert bullet format), split on lines instead of sentences
  const lines = text.includes("\n")
    ? text.split("\n").map(l => l.trim()).filter(Boolean)
    : text.split(". ").map(l => l.trim()).filter(Boolean);

  return (
    <div className="space-y-1">
      {lines.map((sentence, sIdx) => {
        if (!sentence.trim()) return null;

        // Section header line (e.g. "GENERAL:", "CT:", "MRI:")
        const isSectionHeader = /^[A-Z][A-Z\s\/]{1,20}:$/.test(sentence.trim());
        if (isSectionHeader) {
          return (
            <div key={sIdx} className="pt-2 pb-0.5">
              <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase border-b border-slate-200">
                {sentence.replace(/:$/, "")}
              </span>
            </div>
          );
        }

        // Bullet point line
        const isBullet = sentence.startsWith("•");
        let content = isBullet ? sentence.slice(1).trim() : sentence.trim();
        let label = "";

        // Detect "Label: content" (only for non-bullet lines without newlines)
        if (!text.includes("\n") && content.includes(":")) {
          const parts = content.split(":");
          label = parts[0].trim().toUpperCase();
          content = parts.slice(1).join(":").trim();
        }

        const format = (str: string) => {
          let elements: (string | JSX.Element)[] = [str];

          // 1. Handle Manual Markers first (<u> and ==)
          const manualMarkers = [
            { type: 'manualUnderline', regex: /<u>(.*?)<\/u>/gi, style: 'underline decoration-2 decoration-teal-500 underline-offset-2' },
            { type: 'manualHighlight', regex: /==([^=]+)==/g, style: 'bg-yellow-200 px-0.5 rounded text-slate-900' }
          ];

          manualMarkers.forEach(marker => {
            const newElements: (string | JSX.Element)[] = [];
            elements.forEach(el => {
              if (typeof el !== 'string') {
                newElements.push(el);
                return;
              }
              const parts = el.split(marker.regex);
              parts.forEach((part, i) => {
                if (i % 2 === 0) {
                  newElements.push(part);
                } else {
                  newElements.push(
                    <span key={`${marker.type}-${i}`} className={marker.style}>
                      {part}
                    </span>
                  );
                }
              });
            });
            elements = newElements;
          });

          // 2. Apply automatic highlights
          Object.entries(highlights).forEach(([type, regex]) => {
            const newElements: (string | JSX.Element)[] = [];
            elements.forEach(el => {
              if (typeof el !== 'string') {
                newElements.push(el);
                return;
              }
              const split = el.split(regex);
              const matches = el.match(regex);

              split.forEach((part, i) => {
                newElements.push(part);
                if (matches && matches[i]) {
                  const match = matches[i];
                  const colorClass = type === 'critical' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                                   type === 'positive' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                   'text-blue-700 bg-blue-50 border-blue-200';
                  newElements.push(
                    <span key={i} className={`font-black px-1 rounded border-b-2 uppercase tracking-tighter ${colorClass}`}>
                      {match}
                    </span>
                  );
                }
              });
            });
            elements = newElements;
          });
          return elements;
        };

        return (
          <div key={sIdx} className="flex items-start gap-2 group/line">
            <div className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${isBullet ? (isCorrect ? "bg-teal-500" : "bg-slate-400") : (isCorrect ? "bg-teal-500" : "bg-slate-300")}`} />
            <div className="flex-1">
              {label && (
                <span className="font-black text-[10px] tracking-widest text-slate-900 mr-2 border-b-2 border-slate-200 uppercase">
                  {label}:
                </span>
              )}
              <span className={`text-[13px] leading-relaxed ${isCorrect ? "text-slate-900 font-bold" : "text-slate-600 font-medium"}`}>
                {format(content)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Constrains cell content to a max height with a toggle to expand.
 * Prevents long text from distorting the table layout.
 */
function ClampedCell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsClamp, setNeedsClamp] = useState(false);

  // Check if content overflows on mount / update
  const checkOverflow = () => {
    if (contentRef.current) {
      setNeedsClamp(contentRef.current.scrollHeight > 120);
    }
  };

  return (
    <div className="relative">
      <div
        ref={(el) => {
          (contentRef as any).current = el;
          if (el) {
            // Use requestAnimationFrame to measure after render
            requestAnimationFrame(() => {
              setNeedsClamp(el.scrollHeight > 120);
            });
          }
        }}
        className={expanded ? "" : "max-h-[120px] overflow-hidden"}
      >
        {children}
      </div>
      {needsClamp && (
        <>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-inherit to-transparent pointer-events-none" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="mt-1 flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ChevronsUpDown className="w-3 h-3" />
            {expanded ? "Collapse" : "Show more"}
          </button>
        </>
      )}
    </div>
  );
}

export function InlineDiscriminators({ discriminator, externalOpen, setExternalOpen, onViewImages }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = externalOpen !== undefined ? (externalOpen as boolean) : internalOpen;
  const setOpen = (val: boolean) => {
    if (setExternalOpen) {
      setExternalOpen(val);
    } else {
      setInternalOpen(val);
    }
  };

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const patchField = useMutation(api.discriminators.patchDifferentialField);

  // State for editing
  const [editingCell, setEditingCell] = useState<{ 
    originalIndex: number; 
    key: string; 
    dbField: string;
    text: string;
  } | null>(null);

  // ── Combined Logic: Merge differentials and seriousAlternatives ──
  const allDiffs = useMemo(() => {
    // 1. Start with existing differentials (with original index for patching)
    const combined = discriminator.differentials.map((d, i) => ({ 
      ...d, 
      originalIndex: i,
      isSeriousAlternative: false 
    }));

    const existingNames = new Set(combined.map(d => d.diagnosis.toLowerCase()));

    // 2. Add seriousAlternatives that aren't already there
    (discriminator.seriousAlternatives || []).forEach((alt) => {
      if (!existingNames.has(alt.toLowerCase())) {
        combined.push({
          diagnosis: alt,
          isCorrectDiagnosis: false,
          isSeriousAlternative: true,
          originalIndex: -1, // Cannot be patched via index-based mutation if virtual
          dominantImagingFinding: "Awaiting clinical description...",
          distributionLocation: "",
          demographicsClinicalContext: "",
          discriminatingKeyFeature: "",
          associatedFindings: "",
          complicationsSeriousAlternatives: "MUST-NOT-MISS",
        } as any);
      }
    });

    return combined;
  }, [discriminator]);

  // ── Sorting Logic: Order differentials by the Mnemonic Sequence ──
  const sortedDiffs = useMemo(() => {
    const diffsWithIndex = allDiffs;

    // If we have an explicit sortOrder from the sync, use it
    const hasSortOrder = diffsWithIndex.some(d => d.sortOrder !== undefined);

    if (hasSortOrder) {
      return [...diffsWithIndex].sort((a, b) => 
        (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
      );
    }

    if (!discriminator.mnemonicRef?.expandedLetters) return diffsWithIndex;

    // Fallback: Get the acronym sequence order
    const acronymOrder = discriminator.mnemonicRef.expandedLetters
      .split(",")
      .map(part => {
        const letter = part.split(":")[0];
        return letter ? letter.trim().toUpperCase() : null;
      })
      .filter(Boolean) as string[];

    // Sort by mnemonic letter
    return [...diffsWithIndex].sort((a, b) => {
      const aLetter = a.mnemonicLetter?.toUpperCase();
      const bLetter = b.mnemonicLetter?.toUpperCase();

      const aIndex = aLetter ? acronymOrder.indexOf(aLetter) : -1;
      const bIndex = bLetter ? acronymOrder.indexOf(bLetter) : -1;

      if (aIndex === -1 || bIndex === -1) {
        // Put serious alternatives at the end if no mnemonic match
        if (a.isSeriousAlternative && !b.isSeriousAlternative) return 1;
        if (!a.isSeriousAlternative && b.isSeriousAlternative) return -1;
        return 0;
      }

      return aIndex - bIndex;
    });
  }, [allDiffs, discriminator]);

  const diffs = sortedDiffs;
  const totalPages = Math.ceil(diffs.length / itemsPerPage);
  const currentDiffs = diffs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  
  const rows = Object.keys(ROW_CONFIG);

  // ── Editing Handlers ──
  const handleSave = async () => {
    if (!editingCell) return;
    try {
      await patchField({
        id: discriminator._id,
        differentialIndex: editingCell.originalIndex,
        field: editingCell.dbField,
        value: editingCell.text
      });
      setEditingCell(null);
    } catch (err) {
      console.error("Failed to save cell update:", err);
      alert("Error saving changes");
    }
  };

  const applyFormat = (type: 'capitalize' | 'highlight' | 'underline') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    
    // Check if selection is inside the editor
    const editor = document.getElementById('visual-editor');
    if (!editor || !editor.contains(range.commonAncestorContainer)) return;

    if (range.collapsed) return;

    if (type === 'capitalize') {
      const text = range.toString().toUpperCase();
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    } else if (type === 'highlight') {
      const parentMark = range.commonAncestorContainer.parentElement?.closest('mark');
      if (parentMark) {
        const text = document.createTextNode(parentMark.textContent || "");
        parentMark.replaceWith(text);
      } else {
        const mark = document.createElement('mark');
        mark.className = "bg-yellow-200 px-0.5 rounded text-slate-900";
        mark.appendChild(range.extractContents());
        range.insertNode(mark);
      }
    } else if (type === 'underline') {
      const parentU = range.commonAncestorContainer.parentElement?.closest('u');
      if (parentU) {
        const text = document.createTextNode(parentU.textContent || "");
        parentU.replaceWith(text);
      } else {
        const u = document.createElement('u');
        u.className = "underline decoration-2 decoration-teal-500 underline-offset-2";
        u.appendChild(range.extractContents());
        range.insertNode(u);
      }
    }

    // Update the state from HTML
    if (editor) {
      const markerText = fromHTML(editor.innerHTML);
      if (editingCell) setEditingCell({ ...editingCell, text: markerText });
    }
  };

  const fromHTML = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const process = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const inner = Array.from(el.childNodes).map(process).join("");
        if (el.tagName === 'MARK') return `==${inner}==`;
        if (el.tagName === 'U') return `<u>${inner}</u>`;
        if (el.tagName === 'BR') return "\n";
        if (el.tagName === 'DIV' || el.tagName === 'P') return "\n" + inner;
        return inner;
      }
      return "";
    };
    return Array.from(div.childNodes).map(process).join("").trim().replace(/\n+/g, '. ');
  };

  const toHTML = (text: string) => {
    return text
      .replace(/==([^=]+)==/g, '<mark class="bg-yellow-200 px-0.5 rounded text-slate-900">$1</mark>')
      .replace(/<u>(.*?)<\/u>/gi, '<u class="underline decoration-2 decoration-teal-500 underline-offset-2">$1</u>');
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-teal-100 active:scale-95"
      >
        <Sparkles className="w-3 h-3" />
        Discriminate
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            leave="ease-in duration-200"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-6">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              leave="ease-in duration-200"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-[98vw] h-full max-h-[96vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
                {/* ── Header ── */}
                <div className="bg-slate-900 px-8 py-5 flex-shrink-0 flex items-center justify-between border-b border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/20 shadow-inner">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-[0.3em] text-teal-400 uppercase">
                          Diagnostic Comparison Matrix
                        </span>
                        {discriminator.mnemonicRef && (
                          <div className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-black tracking-widest uppercase shadow-sm">
                            Mnemonic: {discriminator.mnemonicRef.mnemonic}
                          </div>
                        )}
                      </div>
                      <DialogTitle className="text-xl font-black text-white tracking-tight">
                        {discriminator.pattern}
                      </DialogTitle>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-4 relative z-10">
                    <button
                      onClick={() => {
                        setOpen(false);
                        if (onViewImages) onViewImages();
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-[11px] font-black uppercase tracking-widest transition-all border border-teal-500/20 shadow-inner"
                    >
                      <MonitorDot className="w-4 h-4" />
                      {onViewImages ? "Image Viewer" : "DICOM Viewer"}
                    </button>
                    {discriminator.mnemonicRef && (
                      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Acronym Sequence</span>
                        <span className="text-xs font-bold text-indigo-300 tracking-wider">
                          {discriminator.mnemonicRef.expandedLetters}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* ── Grid Container ── */}
                <div className="flex-1 overflow-auto bg-slate-50 p-4">
                  <div className="min-w-full inline-block align-middle">
                    <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="sticky left-0 z-30 bg-slate-100 border-b-2 border-r-2 border-slate-200 p-6 text-left w-64 shadow-md">
                              <div className="flex flex-col gap-3">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                  FEATURES
                                </span>
                                {totalPages > 1 && (
                                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm self-start">
                                    <button 
                                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                      disabled={currentPage === 0}
                                      className="p-1 rounded-lg hover:bg-slate-50 disabled:opacity-30 text-slate-600 transition-colors border border-transparent hover:border-slate-100"
                                      title="Previous Page"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                                      <span className="text-[10px] font-black text-slate-900 tracking-tighter">
                                        {currentPage + 1} <span className="text-slate-400">/</span> {totalPages}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                      disabled={currentPage === totalPages - 1}
                                      className="p-1 rounded-lg hover:bg-slate-50 disabled:opacity-30 text-slate-600 transition-colors border border-transparent hover:border-slate-100"
                                      title="Next Page"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </th>
                            {currentDiffs.map((d, i) => (
                              <th
                                key={i}
                                className={`p-6 border-b-2 border-r last:border-r-0 border-slate-200 text-center relative ${
                                  d.isCorrectDiagnosis 
                                    ? "bg-slate-900 text-white z-10" 
                                    : "bg-white text-slate-900"
                                }`}
                              >
                                {d.isCorrectDiagnosis && (
                                  <div className="absolute -top-px left-0 right-0 h-1 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
                                )}
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
                                    d.isCorrectDiagnosis ? 'bg-teal-500 text-white border-teal-400' : 
                                    (d as any).isSeriousAlternative ? 'bg-rose-500 text-white border-rose-400' :
                                    'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}>
                                    {d.isCorrectDiagnosis ? 'Primary Match' : (d as any).isSeriousAlternative ? 'Serious Alt' : 'Differential'}
                                  </span>
                                  <span className="text-base font-black uppercase tracking-tight leading-tight">
                                    {d.diagnosis}
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rows.map((key, rowIdx) => {
                            const config = ROW_CONFIG[key as keyof typeof ROW_CONFIG];
                            const Icon = config.icon;
                            const isKeyFactors = key === "keyDiscriminatingFactors";

                            return (
                              <tr key={key} className={rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                                <td className="sticky left-0 z-20 bg-inherit border-r-2 border-slate-200 p-5 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${config.bg} ${config.color} border border-current/10 shadow-sm`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest leading-tight pt-1 ${config.color}`}>
                                      {config.label}
                                    </span>
                                  </div>
                                </td>
                                {currentDiffs.map((d, i) => {
                                  const primaryValue = (d as any)[key];
                                  const aliasValue = config.aliases.find(alias => (d as any)[alias]) 
                                    ? (d as any)[config.aliases.find(alias => (d as any)[alias])!] 
                                    : null;
                                  const cellText = primaryValue || aliasValue;

                                  const isEditing = editingCell?.originalIndex === d.originalIndex && editingCell?.key === key && d.originalIndex !== -1;

                                  return (
                                    <td
                                      key={i}
                                      className={`px-6 py-6 align-top border-r last:border-r-0 border-slate-100 group relative ${
                                        d.isCorrectDiagnosis
                                          ? isKeyFactors ? "bg-teal-50/40" : "bg-teal-50/20"
                                          : ""
                                      } transition-colors hover:bg-slate-100/50`}
                                    >
                                      {isEditing ? (
                                        <div className="flex flex-col gap-4 min-w-[500px] bg-white p-1 rounded-2xl shadow-sm">
                                          ... (unchanged editor code) ...
                                        </div>
                                      ) : (                                        <>
                                          {d.originalIndex !== -1 && (
                                            <button
                                              onClick={() => setEditingCell({ 
                                                originalIndex: d.originalIndex, 
                                                key, 
                                                dbField: config.dbField,
                                                text: cellText || "" 
                                              })}
                                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200 opacity-0 group-hover:opacity-100 transition-all z-10"
                                              title="Edit this section"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                          )}

                                          <ClampedCell>
                                            <FormattedMedicalText
                                              text={cellText || "No data provided"}
                                              isCorrect={d.isCorrectDiagnosis || false}
                                            />
                                          </ClampedCell>
                                        </>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                          {/* ── Pattern-level rows (pitfalls, next step) ── */}
                          {PATTERN_ROWS.map((row) => {
                            const value = (discriminator as any)[row.key];
                            if (!value || (Array.isArray(value) && value.length === 0)) return null;
                            const Icon = row.icon;
                            return (
                              <tr key={row.key} className="bg-slate-50/50 border-t border-slate-200">
                                <td className="sticky left-0 z-20 bg-inherit border-r-2 border-slate-200 p-5 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${row.bg} ${row.color} border border-current/10 shadow-sm`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest leading-tight pt-1 ${row.color}`}>
                                      {row.label}
                                    </span>
                                  </div>
                                </td>
                                <td colSpan={currentDiffs.length} className="px-6 py-5 align-top">
                                  {Array.isArray(value) ? (
                                    <ul className="space-y-1.5">
                                      {value.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${row.key === "commonPitfalls" ? "bg-orange-400" : "bg-indigo-400"}`} />
                                          <span className="text-[13px] text-slate-700 font-medium leading-relaxed">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-[13px] text-slate-700 font-medium leading-relaxed">{value}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* ── Serious Alternatives ── */}
                {discriminator.seriousAlternatives && discriminator.seriousAlternatives.length > 0 && (
                  <div className="px-8 py-4 bg-rose-50 border-t border-rose-100 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-rose-700">
                        MUST-NOT-MISS SERIOUS ALTERNATIVES
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {discriminator.seriousAlternatives.map((alt, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-rose-200 text-rose-900 text-xs font-bold rounded-lg shadow-sm">
                          {alt.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Footer ── */}
                <div className="px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Radiology AI-Enhanced Comparison Grid
                    </span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Close Comparison
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

