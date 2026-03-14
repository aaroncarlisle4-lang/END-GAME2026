import type { Doc } from "../../../convex/_generated/dataModel";
import { ContentComingSoon } from "../ui/ContentComingSoon";
import { textToBullets } from "../../lib/textHelpers";
import { Mic } from "lucide-react";
import { HighlightableText } from "../ui/HighlightableText";

type LongCase = Doc<"longCases">;

const scriptSections = [
  { key: "opening", label: "Opening Statement" },
  { key: "anchorStatement", label: "Anchor Statement" },
  { key: "systemicApproach", label: "Systematic Approach" },
  { key: "synthesis", label: "Synthesis" },
  { key: "differentialReasoning", label: "Differential Reasoning" },
  { key: "clinicalUrgency", label: "Clinical Urgency" },
  { key: "examinerTip", label: "Examiner Tip" },
] as const;

export function VivaScript({ caseData }: { caseData: LongCase }) {
  const viva = caseData.vivaPresentation;
  const highlightKey = `${caseData._id}_viva`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Mic className="w-4 h-4 text-teal-600" />
        <h4 className="font-semibold text-gray-900">Presentation Script</h4>
      </div>

      {!viva ? (
        <ContentComingSoon label="Viva presentation script coming soon" />
      ) : (
        <div className="space-y-3">
          {scriptSections.map(({ key, label }) => {
            const text = viva[key as keyof typeof viva] as string;
            if (!text) return null;
            const bullets = textToBullets(text);
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
                  {label}
                </p>
                {bullets.length <= 1 ? (
                  <HighlightableText id={highlightKey} text={text} className="text-sm text-gray-800" />
                ) : (
                  <ul className="space-y-1.5">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
                        <span className="font-bold text-teal-500 flex-shrink-0 w-4">{i + 1}.</span>
                        <HighlightableText id={highlightKey} text={b} className="flex-1" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
