import { useState, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X, BookmarkPlus, Save, Check, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const FIELD_LABELS: Record<string, string> = {
  dominantImagingFinding: "Dominant Imaging Finding",
  distributionLocation: "Distribution & Location",
  demographicsClinicalContext: "Demographics & Clinical",
  discriminatingKeyFeature: "Key Discriminating Feature",
  associatedFindings: "Associated Findings",
  complicationsSeriousAlternatives: "Complications / Serious Alternatives",
};

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  discriminatorId: Id<"discriminators">;
}

export function AddNoteModal({ open, onClose, discriminatorId }: AddNoteModalProps) {
  const discriminator = useQuery(api.discriminators.get, open ? { id: discriminatorId } : "skip");
  const createNote = useMutation(api.pendingNotes.create);
  const [differentialIndex, setDifferentialIndex] = useState(0);
  const [field, setField] = useState("dominantImagingFinding");
  const [rawText, setRawText] = useState("");
  const [source, setSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!rawText.trim() || !discriminator) return;
    setSaving(true);
    try {
      await createNote({ discriminatorId, differentialIndex, field, rawText: rawText.trim(), source: source.trim() || undefined });
      setSaved(true);
      setRawText("");
      setSource("");
      setTimeout(() => { setSaved(false); onClose(); }, 800);
    } finally { setSaving(false); }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <DialogPanel className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-white font-bold text-base flex items-center gap-2">
                      <BookmarkPlus className="w-4 h-4 text-amber-400" />
                      Add Note
                    </DialogTitle>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">{discriminator?.pattern ?? "Loading..."}</p>
                  </div>
                  <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                {!discriminator ? (
                  <div className="p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Differential</label>
                        <select value={differentialIndex} onChange={(e) => setDifferentialIndex(Number(e.target.value))} className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
                          {discriminator.differentials.map((d, i) => (<option key={i} value={i}>{d.diagnosis}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Field</label>
                        <select value={field} onChange={(e) => setField(e.target.value)} className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
                          {Object.entries(FIELD_LABELS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Note Text</label>
                      <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste or type your note here..." rows={4} className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Source <span className="font-normal text-slate-400 normal-case">(optional)</span></label>
                      <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Dahnert p.412" className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                    </div>
                  </div>
                )}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={!rawText.trim() || saving || !discriminator} className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold text-white rounded-lg transition-colors disabled:opacity-40 ${saved ? "bg-emerald-500" : "bg-amber-500 hover:bg-amber-600"}`}>
                    {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {saved ? "Saved!" : saving ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
