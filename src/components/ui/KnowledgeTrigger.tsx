import { useKnowledge } from "../../lib/knowledgeContext";
import { BookOpen } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  query: string;
  children?: ReactNode;
  className?: string;
}

/**
 * A wrapper that makes text clickable to open the textbook knowledge drawer.
 */
export function KnowledgeTrigger({ query, children, className = "" }: Props) {
  const { openKnowledge } = useKnowledge();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openKnowledge(query);
      }}
      className={`group relative inline-flex items-center gap-1 hover:text-teal-700 transition-colors cursor-help ${className}`}
      title={`Click to view textbook features for ${query}`}
    >
      <span className="border-b border-dotted border-gray-400 group-hover:border-teal-500 transition-colors">
        {children || query}
      </span>
      <BookOpen className="w-3 h-3 text-gray-300 group-hover:text-teal-500 transition-colors opacity-0 group-hover:opacity-100 -mr-4 group-hover:mr-0 absolute right-0 translate-x-full group-hover:relative group-hover:translate-x-0" />
    </button>
  );
}
