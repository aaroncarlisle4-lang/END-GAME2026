import { Clock } from "lucide-react";

export function ContentComingSoon({ label = "Content coming soon" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-50 text-amber-600 text-sm">
      <Clock className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </div>
  );
}
