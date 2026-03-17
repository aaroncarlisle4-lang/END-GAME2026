import type { Doc } from "../../../convex/_generated/dataModel";
import { ContentComingSoon } from "../ui/ContentComingSoon";
import { CaseNotes } from "./CaseNotes";
import { InlineDiscriminators } from "./InlineDiscriminators";
import { isShellCase } from "../../lib/caseHelpers";
import { textToBullets } from "../../lib/textHelpers";
import { HighlightableText } from "../ui/HighlightableText";
import { KnowledgeTrigger } from "../ui/KnowledgeTrigger";
import {
  ClipboardList,
  Search,
  Target,
  GitBranch,
  ArrowRight,
  List,
  XCircle,
  Lightbulb,
} from "lucide-react";

type LongCase = Doc<"longCases">;
type Discriminator = Doc<"discriminators">;

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
}

function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
      <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
    </div>
  );
}

function BulletList({ items, caseId }: { items: string[]; caseId: string }) {
  if (items.length === 0) return <ContentComingSoon />;
  return (
    <ul className="list-none space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
          <span className="text-teal-500 flex-shrink-0 mt-0.5">•</span>
          <HighlightableText id={caseId} text={item} className="flex-1" />
        </li>
      ))}
    </ul>
  );
}

function TextBullets({ text, caseId }: { text: string | undefined | null; caseId: string }) {
  const items = textToBullets(text);
  if (items.length === 0) return <ContentComingSoon />;
  return <BulletList items={items} caseId={caseId} />;
}

export function IdealAnswerPanel({
  caseData,
  discriminator,
  onOpenViva,
  discriminatorOpen,
  setDiscriminatorOpen,
}: {
  caseData: LongCase;
  discriminator: Discriminator | null;
  onOpenViva: () => void;
  discriminatorOpen?: boolean;
  setDiscriminatorOpen?: (open: boolean) => void;
}) {
  const shell = isShellCase(caseData);
  const caseId = caseData._id;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Ideal Answer</h3>
        <button
          onClick={onOpenViva}
          className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          Open Viva Panel &rarr;
        </button>
      </div>

      {/* ── Row 1: Findings (left) | Important Negatives (right) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Findings */}
        <div>
          <SectionHeader icon={ClipboardList} title="Findings" />
          <div className="pl-6">
            {shell ? (
              <ContentComingSoon />
            ) : (
              <TextBullets text={caseData.findings} caseId={caseId} />
            )}
          </div>
          <div className="pl-6">
            <CaseNotes caseId={caseId} field="findings" />
          </div>
        </div>

        {/* Important Negatives */}
        <div>
          <SectionHeader icon={XCircle} title="Important Negatives" />
          <div className="pl-6">
            {caseData.importantNegatives.length === 0 ? (
              <ContentComingSoon />
            ) : (
              <BulletList items={caseData.importantNegatives} caseId={caseId} />
            )}
          </div>
        </div>
      </div>

      {/* ── Interpretation ── */}
      <div>
        <SectionHeader icon={Search} title="Interpretation" />
        <div className="pl-6">
          {!caseData.interpretation ? (
            <ContentComingSoon />
          ) : (
            <TextBullets text={caseData.interpretation} caseId={caseId} />
          )}
        </div>
        <div className="pl-6">
          <CaseNotes caseId={caseId} field="interpretation" />
        </div>
      </div>

      {/* ── Diagnosis ── */}
      <div>
        <SectionHeader icon={Target} title="Diagnosis" />
        <div className="pl-6">
          {!caseData.diagnosis ? (
            <ContentComingSoon />
          ) : (
            <div className="bg-teal-50 border border-teal-100 px-3 py-2 rounded-lg inline-block">
              <KnowledgeTrigger query={caseData.diagnosis}>
                <HighlightableText id={caseId} text={caseData.diagnosis} className="font-semibold text-teal-800 text-sm" />
              </KnowledgeTrigger>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Differentials (left) | Discriminators (right) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Differentials */}
        <div>
          <SectionHeader icon={GitBranch} title="Differentials" />
          <div className="pl-6">
            {caseData.differentials.length === 0 ? (
              <ContentComingSoon />
            ) : (
              <ol className="space-y-1">
                {caseData.differentials.map((d, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="font-bold text-teal-600 flex-shrink-0 w-4">{i + 1}.</span>
                    <KnowledgeTrigger query={d}>
                      <HighlightableText id={caseId} text={d} className="flex-1" />
                    </KnowledgeTrigger>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="pl-6">
            <CaseNotes caseId={caseId} field="differentials" />
          </div>
        </div>

        {/* Differential Discriminators (inline collapsible) */}
        <div>
          <SectionHeader icon={GitBranch} title="Discriminators" />
          <div className="pl-6">
            {discriminator ? (
              <InlineDiscriminators 
                discriminator={discriminator} 
                externalOpen={discriminatorOpen}
                setExternalOpen={setDiscriminatorOpen}
              />
            ) : (
              <ContentComingSoon label="No discriminator data linked" />
            )}
          </div>
        </div>
      </div>

      {/* ── Next Steps ── */}
      <div>
        <SectionHeader icon={ArrowRight} title="Next Steps" />
        <div className="pl-6">
          {!caseData.nextSteps ? (
            <ContentComingSoon />
          ) : (
            <TextBullets text={caseData.nextSteps} caseId={caseId} />
          )}
        </div>
        <div className="pl-6">
          <CaseNotes caseId={caseId} field="nextSteps" />
        </div>
      </div>

      {/* ── Key Bullets ── */}
      <div>
        <SectionHeader icon={List} title="Key Bullets" />
        <div className="pl-6">
          {caseData.keyBullets.length === 0 ? (
            <ContentComingSoon />
          ) : (
            <BulletList items={caseData.keyBullets} caseId={caseId} />
          )}
        </div>
      </div>

      {/* ── Exam Pearl ── */}
      {caseData.examPearl && (
        <div>
          <SectionHeader icon={Lightbulb} title="Exam Pearl" />
          <div className="pl-6">
            <ExamPearlBullets text={caseData.examPearl} caseId={caseId} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Render exam pearl as bullet points */
function ExamPearlBullets({ text, caseId }: { text: string; caseId: string }) {
  const bullets = textToBullets(text);
  if (bullets.length <= 1) {
    return (
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
        <HighlightableText id={caseId} text={text} className="text-sm text-yellow-900" />
      </div>
    );
  }
  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm text-yellow-900 leading-relaxed">
            <span className="font-bold text-yellow-600 flex-shrink-0">{i + 1}.</span>
            <HighlightableText id={caseId} text={b} className="flex-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}
