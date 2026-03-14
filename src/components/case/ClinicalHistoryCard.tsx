import type { Doc } from "../../../convex/_generated/dataModel";
import { DicomPlaceholder } from "./DicomPlaceholder";
import { Badge } from "../ui/Badge";
import { getDifficultyColor, getModalityLabel } from "../../lib/caseHelpers";

type LongCase = Doc<"longCases">;

export function ClinicalHistoryCard({ caseData }: { caseData: LongCase }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm text-gray-400">#{caseData.caseNumber}</span>
          <Badge className={getDifficultyColor(caseData.difficulty)}>
            {caseData.difficulty || "ungraded"}
          </Badge>
          <Badge>{getModalityLabel(caseData.modality)}</Badge>
          {caseData.section && <Badge>{caseData.section}</Badge>}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{caseData.title}</h2>
      </div>

      {/* DICOM placeholder */}
      <DicomPlaceholder modality={caseData.modality} />

      {/* Clinical history */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Clinical History</h3>
        <p className="text-sm text-blue-900 leading-relaxed">
          {caseData.clinicalHistory || "No clinical history provided."}
        </p>
      </div>
    </div>
  );
}
