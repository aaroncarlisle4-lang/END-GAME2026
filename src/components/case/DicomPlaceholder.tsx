import { MonitorDot } from "lucide-react";

export function DicomPlaceholder({ modality }: { modality?: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg aspect-[4/3] text-gray-500">
      <MonitorDot className="w-12 h-12 mb-2" />
      <p className="text-sm">DICOM Viewer</p>
      {modality && <p className="text-xs text-gray-600 mt-0.5">{modality} images</p>}
    </div>
  );
}
