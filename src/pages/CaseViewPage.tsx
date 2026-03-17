import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { IdealAnswerPanel } from "../components/case/IdealAnswerPanel";
import { CaseNavBar } from "../components/case/CaseNavBar";
import { ToggleReveal } from "../components/ui/ToggleReveal";
import { VivaOverlay } from "../components/viva/VivaOverlay";
import { DicomPlaceholder } from "../components/case/DicomPlaceholder";
import { ScoringGuide } from "../components/case/ScoringGuide";
import { ExplanationDrawer } from "../components/case/ExplanationDrawer";
import { Badge } from "../components/ui/Badge";
import { getDifficultyColor, getModalityLabel } from "../lib/caseHelpers";
import { usePacketNavigation } from "../hooks/usePacketNavigation";

export function CaseViewPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [showAnswer, setShowAnswer] = useState(false);
  const [vivaOpen, setVivaOpen] = useState(false);
  const [discriminatorOpen, setDiscriminatorOpen] = useState(false);

  const caseData = useQuery(
    api.longCases.get,
    caseId ? { id: caseId as Id<"longCases"> } : "skip",
  );

  const discriminator = useQuery(
    api.discriminators.getByLongCase,
    caseId ? { longCaseId: caseId as Id<"longCases"> } : "skip",
  );

  const nav = usePacketNavigation(caseId ?? "");

  useEffect(() => {
    setShowAnswer(false);
    setVivaOpen(false);
    setDiscriminatorOpen(false);
  }, [caseId]);

  if (caseData === undefined) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[44fr_56fr] gap-5">
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (caseData === null) {
    return <div className="text-center py-12 text-gray-400">Case not found.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Two-column layout: DICOM left | case info + answer right */}
      <div className="grid grid-cols-1 lg:grid-cols-[44fr_56fr] gap-5 items-start">
        {/* ── LEFT: DICOM viewer + (when revealed) scoring / explanation ── */}
        <div className="space-y-4 sticky top-4">
          <DicomPlaceholder 
            modality={caseData.modality} 
            onViewDiscriminators={() => setDiscriminatorOpen(true)}
            hasDiscriminator={!!discriminator}
          />

          {showAnswer && (
            <>
              {/* Scoring guide above DICOM column, shown once answer is revealed */}
              {caseData.scoringGuide && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Scoring Guide</h4>
                  <ScoringGuide guide={caseData.scoringGuide} />
                </div>
              )}
              <ExplanationDrawer />
            </>
          )}
        </div>

        {/* ── RIGHT: clinical info + ideal answer ── */}
        <div className="space-y-4">
          {/* Case header */}
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

          {/* Clinical history */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Clinical History</h3>
            <p className="text-sm text-blue-900 leading-relaxed">
              {caseData.clinicalHistory || "No clinical history provided."}
            </p>
          </div>

          {/* Toggle reveal */}
          <ToggleReveal revealed={showAnswer} onToggle={() => setShowAnswer(!showAnswer)} />

          {/* Ideal answer (revealed) */}
          {showAnswer && (
            <IdealAnswerPanel
              caseData={caseData}
              discriminator={discriminator ?? null}
              onOpenViva={() => setVivaOpen(true)}
              discriminatorOpen={discriminatorOpen}
              setDiscriminatorOpen={setDiscriminatorOpen}
            />
          )}
        </div>
      </div>

      {/* Navigation bar */}
      <CaseNavBar
        goToPrev={nav.goToPrev}
        goToNext={nav.goToNext}
        currentIndex={nav.currentIndex}
        totalInPacket={nav.totalInPacket}
      />

      {/* Viva overlay */}
      <VivaOverlay
        open={vivaOpen}
        onClose={() => setVivaOpen(false)}
        caseData={caseData}
      />
    </div>
  );
}
