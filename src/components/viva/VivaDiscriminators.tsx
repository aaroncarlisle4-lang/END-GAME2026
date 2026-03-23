import { useMemo } from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { ContentComingSoon } from "../ui/ContentComingSoon";
import { GitBranch, CheckCircle2 } from "lucide-react";
import { FormattedMedicalText } from "../case/InlineDiscriminators";

type Discriminator = Doc<"discriminators">;

export function VivaDiscriminators({ discriminator }: { discriminator: Discriminator | null }) {
  const allDiffs = useMemo(() => {
    if (!discriminator) return [];
    
    // 1. Start with existing differentials
    const combined = discriminator.differentials.map((d) => ({ 
      ...d, 
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
        {allDiffs.map((d, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 shadow-sm transition-all ${
              d.isCorrectDiagnosis
                ? "border-teal-200 bg-teal-50 shadow-teal-900/5"
                : (d as any).isSeriousAlternative
                ? "border-rose-200 bg-rose-50 shadow-rose-900/5"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Numbered header */}
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black flex-shrink-0 border shadow-sm ${
                  d.isCorrectDiagnosis
                    ? "bg-teal-600 text-white border-teal-500"
                    : (d as any).isSeriousAlternative
                    ? "bg-rose-600 text-white border-rose-500"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {i + 1}
              </span>
              {d.isCorrectDiagnosis && (
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              )}
              <div className="flex-1 flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 tracking-tight uppercase leading-none">
                  {d.diagnosis}
                </span>
                {(d as any).isSeriousAlternative && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full bg-white shadow-sm">
                    Must Not Miss
                  </span>
                )}
              </div>
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
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">
                    {label}
                  </p>
                  <div className={`p-2.5 rounded-lg border shadow-inner ${
                    d.isCorrectDiagnosis ? 'bg-white/60 border-teal-100' : 
                    (d as any).isSeriousAlternative ? 'bg-white/60 border-rose-100' :
                    'bg-slate-50/50 border-slate-100'
                  }`}>
                    <FormattedMedicalText
                      text={value || "No data provided"}
                      isCorrect={d.isCorrectDiagnosis || false}
                    />
                  </div>
                </div>
              ))}

              <div className="col-span-2 pt-2 border-t border-slate-200 mt-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-600 mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Key Discriminator
                </p>
                <div className="text-xs font-bold text-slate-900 leading-snug pl-3.5 border-l-2 border-teal-500/30 italic">
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

      {/* Checklist section for quick review */}
      {discriminator.seriousAlternatives && discriminator.seriousAlternatives.length > 0 && (
        <div className="mt-4 bg-slate-900 rounded-2xl p-4 border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-4 bg-rose-500 rounded-full" />
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
              Serious Alternatives Checklist
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {discriminator.seriousAlternatives.map((alt, i) => {
              const inMainList = discriminator.differentials.some(d => d.diagnosis.toLowerCase() === alt.toLowerCase());
              return (
                <li key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${
                  inMainList ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-100'
                }`}>
                  <span className="text-[10px] font-black text-rose-500/50">{i + 1}</span>
                  <span className="text-xs font-bold tracking-tight">{alt}</span>
                  {inMainList && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
