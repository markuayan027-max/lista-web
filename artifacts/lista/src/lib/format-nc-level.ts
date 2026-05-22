const ROMAN_FROM_DIGIT: Record<string, string> = {
  "1": "I",
  "2": "II",
  "3": "III",
  "4": "IV",
};

function normalizeLevelPart(part: string): string {
  const t = part.trim();
  if (!t) return "";
  if (/^[IVXLC]+$/i.test(t)) return t.toUpperCase();
  return ROMAN_FROM_DIGIT[t] ?? t.toUpperCase();
}

/** Always show full TESDA level label, e.g. "NC I", "NC II", "NC III". */
export function formatNcLevel(raw: string | null | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "NC";

  if (/short\s*course/i.test(value)) return "Short Course";

  const withPrefix = value.match(/^NC\s*(.+)$/i);
  if (withPrefix) {
    const part = normalizeLevelPart(withPrefix[1]);
    return part ? `NC ${part}` : "NC";
  }

  if (/^[IVXLC]+$/i.test(value)) return `NC ${value.toUpperCase()}`;

  const fromDigit = ROMAN_FROM_DIGIT[value];
  if (fromDigit) return `NC ${fromDigit}`;

  return value;
}
