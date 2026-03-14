import type { Doc } from "../../../convex/_generated/dataModel";
import { ContentComingSoon } from "../ui/ContentComingSoon";
import { BookOpen } from "lucide-react";

type DifferentialPattern = Doc<"differentialPatterns">;

export function VivaOBrien({ pattern }: { pattern: DifferentialPattern | null }) {
  if (!pattern) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-teal-600" />
          <h4 className="font-semibold text-gray-900">O'Brien Top 3</h4>
        </div>
        <ContentComingSoon label="No O'Brien pattern linked" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-teal-600" />
        <h4 className="font-semibold text-gray-900">
          O'Brien Top 3 — Case #{pattern.obrienCaseNumber}
        </h4>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Pattern</p>
          <p className="text-sm font-medium text-gray-900">{pattern.pattern}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Diagnosis</p>
          <p className="text-sm text-gray-900">{pattern.diagnosis}</p>
        </div>

        {pattern.clinicalPresentation && (
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
              Clinical Presentation
            </p>
            <p className="text-sm text-gray-700">{pattern.clinicalPresentation}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
            Top 3 Differentials
          </p>
          <ol className="list-decimal list-inside text-sm text-gray-800 space-y-1">
            {pattern.top3.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ol>
        </div>

        {pattern.additional && pattern.additional.length > 0 && (
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
              Additional
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
              {pattern.additional.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
