/** Capitalise the first letter of a string */
function cap(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Convert a paragraph of text into an array of bullet point strings.
 * Handles:
 *  - Pre-existing newline-delimited lists
 *  - Inline numbered lists: "(1) ... ; (2) ..." or "1. ... 2. ..."
 *  - Paragraph text split at sentence boundaries
 *  - Leading dashes / bullets stripped
 *  - Capitalisation enforced
 *  - Trailing periods enforced
 */
export function textToBullets(text: string | undefined | null): string[] {
  if (!text || !text.trim()) return [];

  const raw = text.trim();

  // 1. Newline-based structure
  const lines = raw
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*·]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines.map((l) => cap(l.endsWith(".") ? l : l + "."));
  }

  // 2. Inline numbered list: "(1) foo; (2) bar" or "(1) foo — (2) bar"
  //    Split on semicolons or dashes that precede a bracketed number
  if (/\(\d+\)/.test(raw)) {
    // Strip any leading preamble before "(1)" e.g. "The examiner is listening for: (1)"
    const withoutPreamble = raw.replace(/^[^(]*(?=\()/, "").trim();
    const parts = withoutPreamble
      .split(/;\s*(?=\(\d+\))|(?:\s+—\s+)(?=\(\d+\))/)
      .map((p) => p.replace(/^\(\d+\)\s*/, "").trim())
      .filter(Boolean);

    if (parts.length > 1) {
      return parts.map((p) => cap(p.endsWith(".") ? p : p + "."));
    }
  }

  // 3. Numbered list with period: "1. foo 2. bar"
  if (/^\d+\.\s/.test(raw)) {
    const parts = raw
      .split(/(?=\d+\.\s)/)
      .map((p) => p.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    if (parts.length > 1) {
      return parts.map((p) => cap(p.endsWith(".") ? p : p + "."));
    }
  }

  // 4. Sentence boundaries: ". " followed by a capital letter
  const sentences = raw
    .split(/\.\s+(?=[A-Z])/)
    .map((s) => s.trim().replace(/^[-•*·]\s*/, "").trim())
    .filter(Boolean);

  if (sentences.length > 1) {
    return sentences.map((s) => cap(s.endsWith(".") ? s : s + "."));
  }

  // 5. Single item
  return [cap(raw.endsWith(".") ? raw : raw + ".")];
}
