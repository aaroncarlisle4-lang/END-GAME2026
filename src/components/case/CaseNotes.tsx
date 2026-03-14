import { useState, useEffect } from "react";
import { PenLine, ChevronDown, ChevronUp } from "lucide-react";

interface CaseNotesProps {
  caseId: string;
  field: string;
}

function storageKey(caseId: string, field: string) {
  return `rq:note:${caseId}:${field}`;
}

export function CaseNotes({ caseId, field }: CaseNotesProps) {
  const key = storageKey(caseId, field);
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(key, note);
    } catch {
      // storage quota or private mode
    }
  }, [note, key]);

  const hasNote = note.trim().length > 0;

  return (
    <div className="mt-2 border-t border-dashed border-gray-100 pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-xs transition-colors ${
          hasNote ? "text-teal-600 font-medium" : "text-gray-400 hover:text-teal-500"
        }`}
      >
        <PenLine className="w-3 h-3" />
        {hasNote ? "My notes (saved)" : "Add notes"}
        {open ? (
          <ChevronUp className="w-3 h-3 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>

      {open && (
        <textarea
          className="w-full mt-2 text-sm border border-gray-200 rounded-lg p-2.5 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none bg-gray-50"
          rows={3}
          placeholder={`Your notes on ${field}...`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}
