import { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useKnowledge } from "../../lib/knowledgeContext";
import { X, BookOpen, Search, Info, Activity, AlertCircle, Zap, Crosshair, Sparkles, MessageSquareQuote } from "lucide-react";
import { useState, useEffect } from "react";

const MODALITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  xray: { label: "X-Ray / Plain Film", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
  ct: { label: "Computed Tomography", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
  us: { label: "Ultrasound", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
  mri: { label: "MRI", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100" },
  fluoroscopy: { label: "Fluoroscopy", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-100" },
  nuclearMedicine: { label: "Nuclear Medicine", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
};

/** Highlighting helper */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const words = query.split(/[\s,]+/).filter(w => w.length > 2);
  if (words.length === 0) return <>{text}</>;
  
  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-slate-900 px-0.5 rounded leading-none">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function TextbookKnowledgeDrawer() {
  const { isOpen, query, closeKnowledge } = useKnowledge();
  const searchTextbook = useAction(api.rag.searchEntities);
  const synthesize = useAction(api.rag.synthesizeAnswer);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [synthesisLoading, setSynthesisLoading] = useState(false);

  useEffect(() => {
    if (isOpen && query) {
      setLoading(true);
      setError(null);
      setSynthesis(null);
      searchTextbook({ query, limit: 3 })
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Search failed:", err);
          setError("Failed to retrieve textbook data.");
          setLoading(false);
        });
    }
  }, [isOpen, query, searchTextbook]);

  const handleSynthesize = async () => {
    if (results.length === 0) return;
    setSynthesisLoading(true);
    try {
      const summary = await synthesize({ query, context: results });
      setSynthesis(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setSynthesisLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={closeKnowledge} className="relative z-[60]">
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-400 sm:duration-600"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-400 sm:duration-600"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-4xl">
                  <div className="flex h-full flex-col bg-slate-50 shadow-2xl">
                    
                    {/* Header */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <DialogTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">
                              Dahnert Reference
                            </DialogTitle>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Search className="w-3 h-3" />
                              <span className="text-xs font-bold uppercase tracking-wider italic">"{query}"</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!loading && results.length > 0 && !synthesis && (
                            <button
                              onClick={handleSynthesize}
                              className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-black uppercase tracking-widest border border-teal-100 hover:bg-teal-100 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              AI Synthesis
                            </button>
                          )}
                          <button onClick={closeKnowledge} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex-1 overflow-y-auto px-6 py-6 space-y-8">
                      {/* AI Synthesis Section */}
                      {(synthesisLoading || synthesis) && (
                        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl shadow-teal-100 animate-in fade-in zoom-in-95 duration-300">
                          <div className="flex items-center gap-2 mb-4 opacity-80">
                            <MessageSquareQuote className="w-4 h-4" />
                            <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Clinical Summary</h4>
                          </div>
                          {synthesisLoading ? (
                            <div className="space-y-2">
                              <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse" />
                              <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse" />
                            </div>
                          ) : (
                            <p className="text-lg font-bold leading-relaxed tracking-tight">
                              {synthesis}
                            </p>
                          )}
                        </div>
                      )}

                      {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                          <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-teal-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
                          </div>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Scanning high-yield findings...</p>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Info className="w-12 h-12 text-slate-200 mb-4" />
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No direct match in the manual</p>
                        </div>
                      ) : (
                        results.map((item, idx) => (
                          <div key={item._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            
                            <div className="px-8 py-6 bg-slate-900 text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-10">
                                <BookOpen className="w-24 h-24 rotate-12" />
                              </div>
                              <div className="relative z-10 text-left">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-2 py-0.5 bg-teal-500 text-[9px] font-black uppercase tracking-[0.2em] rounded text-white shadow-sm">
                                    {item.category}
                                  </span>
                                  <span className="text-slate-400 font-black text-[9px] uppercase tracking-widest">
                                    Page {item.pageNumber}
                                  </span>
                                </div>
                                <h3 className="text-2xl font-black leading-tight tracking-tight uppercase max-w-2xl">
                                  {item.entityName}
                                </h3>
                              </div>
                            </div>

                            <div className="p-8 space-y-10 text-left">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                {item.clinicalData.demographics?.length > 0 && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-blue-600">
                                      <Activity className="w-4 h-4" />
                                      <h4 className="font-black uppercase tracking-[0.15em] text-[10px]">Patient Profile</h4>
                                    </div>
                                    <ul className="space-y-2">
                                      {item.clinicalData.demographics.map((d: string, i: number) => (
                                        <li key={i} className="text-sm text-slate-700 font-semibold leading-relaxed pl-4 border-l-2 border-blue-200">
                                          <HighlightText text={d} query={query} />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {item.clinicalData.associations?.length > 0 && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-purple-600">
                                      <Zap className="w-4 h-4" />
                                      <h4 className="font-black uppercase tracking-[0.15em] text-[10px]">Associations</h4>
                                    </div>
                                    <ul className="grid grid-cols-1 gap-2">
                                      {item.clinicalData.associations.map((a: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-600 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                                          <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0"></span>
                                          <HighlightText text={a} query={query} />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-teal-700">
                                  <Crosshair className="w-4 h-4" />
                                  <h4 className="font-black uppercase tracking-[0.15em] text-[10px]">Imaging Features Matrix</h4>
                                </div>
                                
                                {Object.values(item.radiographicFeatures).some((arr: any) => arr && arr.length > 0) ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {Object.entries(MODALITY_CONFIG).map(([key, config]) => {
                                      const findings = item.radiographicFeatures[key]?.filter((f: string) => f.trim());
                                      if (!findings || findings.length === 0) return null;

                                      return (
                                        <div key={key} className={`rounded-2xl border-2 ${config.border} ${config.bg} overflow-hidden flex flex-col h-full`}>
                                          <div className={`px-4 py-2 flex items-center justify-between border-b ${config.border} bg-white/50`}>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${config.color}`}>
                                              {config.label}
                                            </span>
                                          </div>
                                          <ul className="p-4 space-y-3 flex-1 bg-white/30 backdrop-blur-sm">
                                            {findings.map((f: string, i: number) => {
                                              const cleanText = f.replace(/^√\s*/, "").trim();
                                              if (!cleanText) return null;
                                              return (
                                                <li key={i} className="flex gap-2.5 leading-snug">
                                                  <span className={`${config.color} font-black mt-0.5 text-xs`}>√</span>
                                                  <span className="text-xs text-slate-800 font-bold leading-normal">
                                                    <HighlightText text={cleanText} query={query} />
                                                  </span>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                      <HighlightText text={item.rawTextChunk} query={query} />
                                    </p>
                                  </div>
                                )}
                              </div>

                              {item.clinicalData.cardinalSigns?.length > 0 && (
                                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-6 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <AlertCircle className="w-16 h-16" />
                                  </div>
                                  <div className="flex items-center gap-2 text-amber-700 mb-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <h4 className="font-black uppercase tracking-[0.15em] text-[10px]">Cardinal Signs & Pathognomonics</h4>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3">
                                    {item.clinicalData.cardinalSigns.map((s: string, i: number) => (
                                      <p key={i} className="text-sm text-amber-900 font-black italic border-l-4 border-amber-200 pl-4 py-1 leading-relaxed">
                                        "<HighlightText text={s} query={query} />"
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
