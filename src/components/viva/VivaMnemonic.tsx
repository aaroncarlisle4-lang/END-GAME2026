import type { Doc } from "../../../convex/_generated/dataModel";
import { ContentComingSoon } from "../ui/ContentComingSoon";
import { Puzzle } from "lucide-react";

type Mnemonic = Doc<"mnemonics">;

export function VivaMnemonic({ mnemonic }: { mnemonic: Mnemonic | null }) {
  if (!mnemonic) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Puzzle className="w-4 h-4 text-teal-600" />
          <h4 className="font-semibold text-gray-900">Mnemonic</h4>
        </div>
        <ContentComingSoon label="No mnemonic linked" />
      </div>
    );
  }

  // Parse mnemonic string into letters
  const letters = mnemonic.mnemonic.split("");

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Puzzle className="w-4 h-4 text-teal-600" />
        <h4 className="font-semibold text-gray-900">Mnemonic</h4>
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
        <p className="text-xs font-medium text-violet-600 uppercase tracking-wide mb-1">
          {mnemonic.pattern}
        </p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {letters.map((letter, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center w-8 h-8 rounded bg-violet-200 text-violet-800 font-bold text-lg"
            >
              {letter}
            </span>
          ))}
        </div>

        {mnemonic.differentials.length > 0 && (
          <div>
            <p className="text-xs font-medium text-violet-600 mb-1">Differentials</p>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-0.5">
              {mnemonic.differentials.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
