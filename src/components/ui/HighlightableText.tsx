import { useState, useCallback, useRef, useEffect } from "react";
import { useHighlights } from "../../hooks/useHighlights";
import { Highlighter as HighlighIcon, X } from "lucide-react";

interface HighlightableTextProps {
  id: string; // Unique ID for this context (e.g. case ID)
  text: string;
  className?: string;
}

export function HighlightableText({ id, text, className = "" }: HighlightableTextProps) {
  const { highlights, addHighlight, removeHighlight } = useHighlights(id);
  const [selection, setSelection] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 2) {
      const selectedText = sel.toString().trim();
      setSelection(selectedText);

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPopupPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    } else {
      setSelection(null);
      setPopupPos(null);
    }
  }, []);

  const handleAddHighlight = useCallback(() => {
    if (selection) {
      addHighlight(selection);
      setSelection(null);
      setPopupPos(null);
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  }, [selection, addHighlight]);

  // Function to render text with highlights
  const renderHighlightedText = () => {
    if (highlights.length === 0) return text;

    // Create a regex to match any of the highlights
    // Escape special characters and join with |
    const escaped = highlights
      .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length); // Match longer strings first
    const regex = new RegExp(`(${escaped.join("|")})`, "gi");

    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isHighlighted = highlights.some(
        (h) => h.toLowerCase() === part.toLowerCase()
      );

      if (isHighlighted) {
        return (
          <mark
            key={i}
            className="bg-yellow-200 text-gray-900 px-0.5 rounded relative group cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              removeHighlight(part);
            }}
            title="Click to remove highlight"
          >
            {part}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              Remove
            </span>
          </mark>
        );
      }

      return part;
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className={`relative ${className}`}
    >
      <div className="whitespace-pre-wrap leading-relaxed">
        {renderHighlightedText()}
      </div>

      {selection && popupPos && (
        <button
          onClick={handleAddHighlight}
          className="fixed z-50 -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 text-xs font-bold hover:bg-gray-800 transition-colors"
          style={{ left: popupPos.x, top: popupPos.y }}
        >
          <HighlighIcon className="w-3.5 h-3.5" />
          Highlight
        </button>
      )}

      {/* Highlight toolbar toggle (optional) */}
      {highlights.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <button
              key={i}
              onClick={() => removeHighlight(h)}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-[10px] font-medium hover:bg-yellow-100 transition-colors"
            >
              {h.length > 20 ? h.substring(0, 17) + "..." : h}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
