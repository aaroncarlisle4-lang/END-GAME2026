import { AccordionItem } from "../ui/AccordionItem";
import { ContentComingSoon } from "../ui/ContentComingSoon";

interface ScoringGuideData {
  score4: string;
  score5: string;
  score6: string;
  score7: string;
  score8: string;
}

export function ScoringGuide({ guide }: { guide?: ScoringGuideData | null }) {
  if (!guide) {
    return <ContentComingSoon label="Scoring guide coming soon" />;
  }

  const scores = [
    { score: 4, label: "Below expectations", text: guide.score4, color: "text-red-600" },
    { score: 5, label: "Borderline", text: guide.score5, color: "text-orange-600" },
    { score: 6, label: "Satisfactory", text: guide.score6, color: "text-yellow-600" },
    { score: 7, label: "Good", text: guide.score7, color: "text-green-600" },
    { score: 8, label: "Excellent", text: guide.score8, color: "text-teal-600" },
  ];

  return (
    <div className="space-y-2">
      {scores.map(({ score, label, text, color }) => (
        <AccordionItem key={score} title={`Score ${score}`} badge={label}>
          <p className={`${color} font-medium mb-1`}>{label}</p>
          <p>{text}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
