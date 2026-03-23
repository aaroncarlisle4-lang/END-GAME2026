import { useState, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X, Check, Trash2, ChevronDown, ChevronUp, Loader2, MessageSquare, CheckCheck, XCircle, Edit3 } from "lucide-react";
import type { TextSuggestion } from "../../hooks/useTextIngestion";

const FIELD_LABELS: Record<string, string> = {
  dominantImagingFinding: "Dominant Imaging Finding",
  distributionLocation: "Distribution & Location",
  demographicsClinicalContext: "Demographics & Clinical",
  discriminatingKeyFeature: "Key Discriminating Feature",
  associatedFindings: "Associated Findings",
  complicationsSeriousAlternatives: "Complications / Serious Alternatives",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-red-100 text-red-700 border-red-200",
};

function getConfidenceLevel(c: number): "high" | "medium" | "low" {
  if (c >= 0.8) return "high";
  if (c >= 0.5) return "medium";
  return "low";
}

const ACTION_BADGE: Record<string, { label: string; className: string }> = {
  add: { label: "ADD", className: "bg-emerald-100 text-emerald-700" },
  replace: { label: "REPLACE", className: "bg-blue-100 text-blue-700" },
  skip: { label: "SKIP", className: "bg-slate-100 text-slate-500" },
};

interface OverrideForm {
  differentialIndex: number;
  field: string;
  value: string;
}

interface TextReviewModalProps {
  open: boolean;
  onClose: () => void;
  patternName: string;
  suggestions: TextSuggestion[];
  isProcessing: boolean;
  error: string | null;
  onApprove: (index: number) => void;
  onDismiss: (index: number) => void;
  onApproveAll: () => void;
  onDismissAll: () => void;
  onRefine: (feedback: string) => void;
  onOverride: (differentialIndex: number, field: string, value: string) => void;
  differentialNames: string[];
}

export function TextReviewModal({
  open,
  onClose,
  patternName,
  suggestions,
  isProcessing,
  error,
  onApprove,
  onDismiss,
  onApproveAll,
  onDismissAll,
  onRefine,
  onOverride,
  differentialNames,
}: TextReviewModalProps) {
  const [feedback, setFeedback] = useState("");
  const [expandedReasoning, setExpandedReasoning] = useState<Set<number>>(new Set());
  const [showOverride, setShowOverride] = useState(false);
  const [overrideForm, setOverrideForm] = useState<OverrideForm>({
    differentialIndex: 0,
    field: "dominantImagingFinding",
    value: "",
  });

  const toggleReasoning = (idx: number) => {
    setExpandedReasoning((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleRefine = () => {
    if (!feedback.trim()) return;
    onRefine(feedback.trim());
    setFeedback("");
  };

  const handleOverrideSubmit = () => {
    if (!overrideForm.value.trim()) return;
    onOverride(overrideForm.differentialIndex, overrideForm.field, overrideForm.value.trim());
    setOverrideForm({ differentialIndex: 0, field: "dominantImagingFinding", value: "" });
    setShowOverride(false);
  };

  const actionable = suggestions.filter((s) => s.action !== "skip");

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-white font-bold text-base">
                      Text Ingestion Review
                    </DialogTitle>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">{patternName}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-3 py-12">
                      <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                      <p className="text-sm text-slate-500 font-medium">Classifying text...</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  {!isProcessing && suggestions.length === 0 && !error && (
                    <div className="text-center py-12">
                      <p className="text-sm text-slate-400 font-medium">
                        No suggestions. The text may not match any differential in this pattern.
                      </p>
                    </div>
                  )}

                  {suggestions.map((s, i) => {
                    const level = getConfidenceLevel(s.confidence);
                    const actionBadge = ACTION_BADGE[s.action];
                    return (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 space-y-2 ${
                          s.action === "skip" ? "border-slate-200 bg-slate-50/50 opacity-60" : "border-slate-200 bg-white"
                        }`}
                      >
                        {/* Top row: diagnosis + field + badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{s.diagnosis}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {FIELD_LABELS[s.field] ?? s.field}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${actionBadge.className}`}>
                            {actionBadge.label}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${CONFIDENCE_COLORS[level]}`}>
                            {Math.round(s.confidence * 100)}%
                          </span>
                        </div>

                        {/* Current vs suggested */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current</p>
                            {s.currentValue ? (
                              <p className="text-xs text-slate-600 leading-relaxed">{s.currentValue}</p>
                            ) : (
                              <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-medium">
                                Empty
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Suggested</p>
                            <p className="text-xs text-emerald-800 leading-relaxed bg-emerald-50 px-2 py-1 rounded">
                              {s.suggestedValue}
                            </p>
                          </div>
                        </div>

                        {/* Reasoning toggle */}
                        <button
                          onClick={() => toggleReasoning(i)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1"
                        >
                          {expandedReasoning.has(i) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          Reasoning
                        </button>
                        {expandedReasoning.has(i) && (
                          <p className="text-[11px] text-slate-500 italic leading-relaxed pl-4 border-l-2 border-slate-200">
                            {s.reasoning}
                          </p>
                        )}

                        {/* Action buttons */}
                        {s.action !== "skip" && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => onApprove(i)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => onDismiss(i)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Dismiss
                            </button>
                          </div>
                        )}
                        {s.action === "skip" && (
                          <button
                            onClick={() => onDismiss(i)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feedback area */}
                {suggestions.length > 0 && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Feedback / Refine</span>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="e.g. 'The text is about metastases, not lymphoma' or 'Map the age to demographics'"
                        rows={2}
                        className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none"
                      />
                      <button
                        onClick={handleRefine}
                        disabled={!feedback.trim() || isProcessing}
                        className="self-end px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
                      >
                        Refine
                      </button>
                    </div>
                  </div>
                )}

                {/* Override form */}
                {showOverride && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-amber-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-600 uppercase">Manual Override</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select
                        value={overrideForm.differentialIndex}
                        onChange={(e) =>
                          setOverrideForm((f) => ({ ...f, differentialIndex: Number(e.target.value) }))
                        }
                        className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      >
                        {differentialNames.map((name, i) => (
                          <option key={i} value={i}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={overrideForm.field}
                        onChange={(e) => setOverrideForm((f) => ({ ...f, field: e.target.value }))}
                        className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      >
                        {Object.entries(FIELD_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={overrideForm.value}
                        onChange={(e) => setOverrideForm((f) => ({ ...f, value: e.target.value }))}
                        placeholder="Enter value..."
                        rows={2}
                        className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 resize-none"
                      />
                      <button
                        onClick={handleOverrideSubmit}
                        disabled={!overrideForm.value.trim()}
                        className="self-end px-4 py-2 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 disabled:opacity-40 transition-colors"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowOverride((v) => !v)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      {showOverride ? "Hide Override" : "Manual Override"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {actionable.length > 0 && (
                      <>
                        <button
                          onClick={onDismissAll}
                          className="flex items-center gap-1 px-4 py-2 text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Dismiss All
                        </button>
                        <button
                          onClick={onApproveAll}
                          className="flex items-center gap-1 px-4 py-2 text-[10px] font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Approve All ({actionable.length})
                        </button>
                      </>
                    )}
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
