import type { Doc } from "../../../convex/_generated/dataModel";
import { ContentComingSoon } from "../ui/ContentComingSoon";
import { GitBranch, CheckCircle2 } from "lucide-react";
import { FormattedMedicalText } from "../case/InlineDiscriminators";

type Discriminator = Doc<"discriminators">;

export function VivaDiscriminators({ discriminator }: { discriminator: Discriminator | null }) {
  if (!discriminator) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-4 h-4 text-teal-600" />
          <h4 className="font-semibold text-gray-900">Differential Discriminators</h4>
        </div>
        <ContentComingSoon label="No discriminator data for this case" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="w-4 h-4 text-teal-600" />
        <h4 className="font-semibold text-gray-900">Differential Discriminators</h4>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Pattern: <span className="font-medium text-gray-700">{discriminator.pattern}</span>
      </p>

      <div className="space-y-3">
        {discriminator.differentials.map((d, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              d.isCorrectDiagnosis
                ? "border-teal-200 bg-teal-50"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Numbered header */}
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${
                  d.isCorrectDiagnosis
                    ? "bg-teal-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </span>
              {d.isCorrectDiagnosis && (
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              )}
              <span className="font-bold text-sm text-gray-900">{d.diagnosis}</span>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
                { label: "Imaging", value: d.dominantImagingFinding },
                { label: "Distribution", value: d.distributionLocation },
                { label: "Clinical", value: d.demographicsClinicalContext },
                { label: "Associated", value: d.associatedFindings },
                { label: "Complications / Alts", value: d.complicationsSeriousAlternatives },
              ].map(({ label, value }) => (
                <div key={label} className={label.includes("Complications") ? "col-span-2" : ""}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                    {label}
                  </p>
                  <FormattedMedicalText
                    text={value || "No data provided"}
                    isCorrect={d.isCorrectDiagnosis || false}
                  />
                </div>
              ))}

              <div className="col-span-2 pt-1 border-t border-gray-100 mt-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-600 mb-0.5">
                  Key Discriminator
                </p>
                <div className="text-xs font-semibold text-teal-800 leading-snug">
                  <FormattedMedicalText
                    text={d.discriminatingKeyFeature || "No data"}
                    isCorrect={true}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {discriminator.seriousAlternatives.length > 0 && (
        <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-red-700 mb-1.5">Serious Alternatives</p>
          <ul className="space-y-1">
            {discriminator.seriousAlternatives.map((alt, i) => (
              <li key={i} className="flex gap-2 text-xs text-red-800">
                <span className="font-bold text-red-500 flex-shrink-0">{i + 1}.</span>
                <span>{alt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
