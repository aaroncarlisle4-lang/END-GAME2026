import { Link } from "react-router-dom";
import { getCategoryMeta } from "../../lib/categoryConfig";

interface CategoryCardProps {
  name: string;
  abbreviation: string;
  caseCount: number;
  examSection: string;
}

export function CategoryCard({ name, abbreviation, caseCount, examSection }: CategoryCardProps) {
  const meta = getCategoryMeta(abbreviation);
  const Icon = meta.icon;

  return (
    <Link
      to={`/category/${abbreviation}`}
      className={`block rounded-xl border ${meta.accentBorder} ${meta.accent} p-5 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-white/60 ${meta.accentText}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 ${meta.accentText}`}>
          {examSection === "rapid" ? "Rapid" : "Long"}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-500">{caseCount} cases</p>
    </Link>
  );
}
