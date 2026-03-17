import { MonitorDot, GitBranch, Sparkles } from "lucide-react";

export function DicomPlaceholder({ 
  modality, 
  onViewDiscriminators,
  hasDiscriminator 
}: { 
  modality?: string;
  onViewDiscriminators?: () => void;
  hasDiscriminator?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg aspect-[4/3] text-gray-500 relative group">
      <MonitorDot className="w-12 h-12 mb-2" />
      <p className="text-sm">DICOM Viewer</p>
      {modality && <p className="text-xs text-gray-600 mt-0.5">{modality} images</p>}
      
      {hasDiscriminator && onViewDiscriminators && (
        <button
          onClick={onViewDiscriminators}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-900/40 transition-all active:scale-95 group-hover:ring-4 ring-teal-500/20"
        >
          <GitBranch className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">Compare Differentials</span>
          <Sparkles className="w-3 h-3 text-teal-200" />
        </button>
      )}
    </div>
  );
}
