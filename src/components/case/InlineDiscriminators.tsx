import { useState, useMemo, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { GitBranch, X, CheckCircle2, AlertTriangle, Fingerprint, MapPin, Activity, UserSquare2, Info, Sparkles } from "lucide-react";

interface Props {
  discriminator: Doc<"discriminators">;
}

// ── Helpers ──

const ROW_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; aliases: string[] }> = {
  dominantImagingFactor: { 
    label: "DOMINANT IMAGING FACTOR", 
    icon: Fingerprint, 
    color: "text-blue-700",
    bg: "bg-blue-50",
    aliases: ["dominantImagingFinding", "keyImagingPattern"]
  },
  distributionLocation: { 
    label: "DISTRIBUTION & LOCATION", 
    icon: MapPin, 
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    aliases: ["distribution"]
  },
  demographicsClinicalContext: { 
    label: "DEMOGRAPHICS & CLINICAL", 
    icon: UserSquare2, 
    color: "text-purple-700",
    bg: "bg-purple-50",
    aliases: ["clinicalContext"]
  },
  associatedFindings: { 
    label: "ASSOCIATED FINDINGS", 
    icon: Activity, 
    color: "text-amber-700",
    bg: "bg-amber-50",
    aliases: []
  },
  keyDiscriminatingFactors: { 
    label: "KEY DISCRIMINATING FACTORS", 
    icon: CheckCircle2, 
    color: "text-teal-700",
    bg: "bg-teal-50",
    aliases: ["discriminatingKeyFeature", "keyDiscriminator"]
  },
};

/**
 * Intelligent medical text parser for rich formatting
 */
function FormattedMedicalText({ text, isCorrect }: { text: string; isCorrect: boolean }) {
  // Regex for keywords that deserve highlighting (no capturing groups to avoid split double-splicing)
  const highlights = {
    critical: /\b(?:MALIGNANT|CANCER|CARCINOMA|SERIOUS|URGENT|ACUTE|EMERGENCY|DEATH|FATAL)\b/gi,
    positive: /\b(?:BENIGN|STABLE|NORMAL|INCREASED|GOLD STANDARD|CLASSIC|PATHOGNOMONIC|CHARACTERISTIC)\b/gi,
    negative: /\b(?:ABSENT|NEGATIVE|DECREASED|LOW|NONE)\b/gi,
  };

  return (
    <div className="space-y-2">
      {text.split(". ").map((sentence, sIdx) => {
        if (!sentence.trim()) return null;
        
        let content = sentence.trim();
        let label = "";
        
        // Detect "Label: content"
        if (content.includes(":")) {
          const parts = content.split(":");
          label = parts[0].trim().toUpperCase();
          content = parts.slice(1).join(":").trim();
        }

        const format = (str: string) => {
          let elements: (string | JSX.Element)[] = [str];
          
          // Apply highlights
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
            <div className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${isCorrect ? "bg-teal-500" : "bg-slate-300"}`} />
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

export function InlineDiscriminators({ discriminator }: Props) {
  const [open, setOpen] = useState(false);

  // ── Sorting Logic: Order differentials by the Mnemonic Sequence ──
  const sortedDiffs = useMemo(() => {
    // If we have an explicit sortOrder from the sync, use it
    const hasSortOrder = discriminator.differentials.some(d => d.sortOrder !== undefined);
    
    if (hasSortOrder) {
      return [...discriminator.differentials].sort((a, b) => 
        (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
      );
    }

    if (!discriminator.mnemonicRef?.expandedLetters) return discriminator.differentials;

    // Fallback: Get the acronym sequence order
    const acronymOrder = discriminator.mnemonicRef.expandedLetters
      .split(",")
      .map(part => {
        const letter = part.split(":")[0];
        return letter ? letter.trim().toUpperCase() : null;
      })
      .filter(Boolean) as string[];

    // Sort by mnemonic letter
    return [...discriminator.differentials].sort((a, b) => {
      const aLetter = a.mnemonicLetter?.toUpperCase();
      const bLetter = b.mnemonicLetter?.toUpperCase();
      
      const aIndex = aLetter ? acronymOrder.indexOf(aLetter) : -1;
      const bIndex = bLetter ? acronymOrder.indexOf(bLetter) : -1;
      
      if (aIndex === -1 || bIndex === -1) {
        return 0;
      }
      
      return aIndex - bIndex;
    });
  }, [discriminator]);

  const diffs = sortedDiffs;
  const rows = Object.keys(ROW_CONFIG);

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
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                FEATURES
                              </span>
                            </th>
                            {diffs.map((d, i) => (
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
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                    d.isCorrectDiagnosis ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                  }`}>
                                    {d.isCorrectDiagnosis ? 'Primary Match' : 'Differential'}
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
                                {diffs.map((d, i) => {
                                  const primaryValue = (d as any)[key];
                                  const aliasValue = config.aliases.find(alias => (d as any)[alias]) 
                                    ? (d as any)[config.aliases.find(alias => (d as any)[alias])!] 
                                    : null;
                                  const cellText = primaryValue || aliasValue;

                                  return (
                                    <td
                                      key={i}
                                      className={`px-6 py-6 align-top border-r last:border-r-0 border-slate-100 ${
                                        d.isCorrectDiagnosis
                                          ? isKeyFactors ? "bg-teal-50/40" : "bg-teal-50/20"
                                          : ""
                                      } transition-colors hover:bg-slate-100/50`}
                                    >
                                      <FormattedMedicalText
                                        text={cellText || "No data provided"}
                                        isCorrect={d.isCorrectDiagnosis || false}
                                      />
                                    </td>
                                  );
                                })}
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
