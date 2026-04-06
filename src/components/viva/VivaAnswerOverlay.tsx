/**
 * VivaAnswerOverlay — renders a structured FRCR 2B viva ideal answer
 * in the right-side overlay area of the RapidImageViewer.
 *
 * Replaces the Dominant Imaging + Key Discriminating boxes when toggled on.
 */

export interface VivaAnswerData {
  findings: {
    dominantFinding: string;
    supportingFeatures: string;
    criticalNegatives: string;
    influentialFeature: string;
  };
  differentials: {
    primaryDiagnosis: string;
    principleDifferential: string;
    excludeDiagnosis: string;
    unifyingSummary?: string;
  };
  management: {
    priority: string;
    priorImaging?: string;
    furtherImaging?: string;
    ctPhases?: string;
    mriSequences?: string;
    spectralCt?: string;
    nuclearMedicine?: string;
    intervention?: string;
    followUp?: string;
    mdtDiscussion: string;
  };
  fullScript: string;
}

function OverlayCard({
  title,
  color,
  children,
}: {
  title: string;
  color: "amber" | "violet" | "indigo";
  children: React.ReactNode;
}) {
  const palette = {
    amber: {
      border: "border-amber-500/30",
      title: "text-amber-400",
      dot: "bg-amber-400",
      text: "text-amber-100/90",
    },
    violet: {
      border: "border-violet-500/30",
      title: "text-violet-400",
      dot: "bg-violet-400",
      text: "text-violet-100/90",
    },
    indigo: {
      border: "border-indigo-500/30",
      title: "text-indigo-400",
      dot: "bg-indigo-400",
      text: "text-indigo-100/90",
    },
  }[color];

  return (
    <div
      className={`px-3 py-2 2xl:px-4 2xl:py-3 bg-slate-900/90 backdrop-blur-md border ${palette.border} rounded-2xl shadow-2xl max-h-[35vh] overflow-y-auto scrollbar-thin`}
    >
      <p
        className={`text-[9px] font-black ${palette.title} uppercase tracking-[0.25em] mb-1 2xl:mb-2`}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Bullet({
  text,
  color,
}: {
  text: string;
  color: "amber" | "violet" | "indigo";
}) {
  const palette = {
    amber: { dot: "bg-amber-400", text: "text-amber-100/95" },
    violet: { dot: "bg-violet-400", text: "text-violet-100/95" },
    indigo: { dot: "bg-indigo-400", text: "text-indigo-100/95" },
  }[color];

  return (
    <li className="flex items-start gap-1.5">
      <span className={`mt-1.5 w-1 h-1 rounded-full ${palette.dot} shrink-0`} />
      <span
        className={`text-[11px] xl:text-xs 2xl:text-sm ${palette.text} leading-snug font-medium`}
      >
        {text}
      </span>
    </li>
  );
}

export function VivaAnswerOverlay({
  vivaAnswer,
}: {
  vivaAnswer: VivaAnswerData;
}) {
  const { findings, differentials, management } = vivaAnswer;

  // Collect non-null management items
  const mgmtItems: string[] = [];
  if (management.priority) mgmtItems.push(management.priority);
  if (management.priorImaging) mgmtItems.push(management.priorImaging);
  if (management.furtherImaging) mgmtItems.push(management.furtherImaging);
  if (management.ctPhases) mgmtItems.push(management.ctPhases);
  if (management.mriSequences) mgmtItems.push(management.mriSequences);
  if (management.spectralCt) mgmtItems.push(management.spectralCt);
  if (management.nuclearMedicine) mgmtItems.push(management.nuclearMedicine);
  if (management.intervention) mgmtItems.push(management.intervention);
  if (management.followUp) mgmtItems.push(management.followUp);
  if (management.mdtDiscussion) mgmtItems.push(management.mdtDiscussion);

  return (
    <div className="flex flex-col gap-2">
      {/* FINDINGS */}
      <OverlayCard title="Findings" color="amber">
        <ul className="space-y-0.5 2xl:space-y-1">
          <Bullet text={findings.dominantFinding} color="amber" />
          <Bullet text={findings.supportingFeatures} color="amber" />
          <Bullet text={findings.criticalNegatives} color="amber" />
          <Bullet text={findings.influentialFeature} color="amber" />
        </ul>
      </OverlayCard>

      {/* DIFFERENTIALS */}
      <OverlayCard title="Differentials" color="violet">
        <ul className="space-y-0.5 2xl:space-y-1">
          <Bullet text={differentials.primaryDiagnosis} color="violet" />
          <Bullet text={differentials.principleDifferential} color="violet" />
          <Bullet text={differentials.excludeDiagnosis} color="violet" />
          {differentials.unifyingSummary && (
            <Bullet text={differentials.unifyingSummary} color="violet" />
          )}
        </ul>
      </OverlayCard>

      {/* MANAGEMENT */}
      <OverlayCard title="Management" color="indigo">
        <ul className="space-y-0.5 2xl:space-y-1">
          {mgmtItems.map((item, i) => (
            <Bullet key={i} text={item} color="indigo" />
          ))}
        </ul>
      </OverlayCard>
    </div>
  );
}
