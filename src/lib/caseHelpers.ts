import type { Doc } from "../../convex/_generated/dataModel";

type LongCase = Doc<"longCases">;

/** A shell case has no meaningful findings content */
export function isShellCase(c: LongCase): boolean {
  return !c.findings || c.findings.trim().length === 0;
}

/** Map modality string to a short display label */
export function getModalityLabel(modality?: string): string {
  if (!modality) return "Unknown";
  const map: Record<string, string> = {
    CT: "CT",
    MRI: "MRI",
    XR: "X-Ray",
    US: "Ultrasound",
    NM: "Nuclear Medicine",
    Fluoro: "Fluoroscopy",
    Angio: "Angiography",
    PET: "PET/CT",
  };
  return map[modality] ?? modality;
}

/** Return difficulty badge color classes */
export function getDifficultyColor(difficulty?: string): string {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "hard":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
