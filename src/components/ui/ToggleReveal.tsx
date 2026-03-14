import { Eye, EyeOff } from "lucide-react";

interface ToggleRevealProps {
  revealed: boolean;
  onToggle: () => void;
  label?: string;
}

export function ToggleReveal({ revealed, onToggle, label = "Show Ideal Answer" }: ToggleRevealProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        revealed
          ? "bg-teal-600 text-white hover:bg-teal-700"
          : "bg-teal-50 text-teal-700 hover:bg-teal-100"
      }`}
    >
      {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      {revealed ? "Hide Answer" : label}
    </button>
  );
}
