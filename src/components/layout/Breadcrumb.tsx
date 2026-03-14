import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function Breadcrumb() {
  const { abbrev, section, caseId } = useParams();

  if (!abbrev && !caseId) return null;

  const crumbs: { label: string; to?: string }[] = [];

  if (abbrev) {
    crumbs.push({ label: abbrev, to: `/category/${abbrev}` });
    if (section) {
      crumbs.push({ label: decodeURIComponent(section), to: `/category/${abbrev}/${section}` });
    }
  }

  if (caseId) {
    crumbs.push({ label: "Case" });
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 ml-4">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {c.to ? (
            <Link to={c.to} className="hover:text-teal-700 transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-gray-400">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
