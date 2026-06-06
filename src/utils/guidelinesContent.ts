import paragraphsData from "../data/guidelinesParagraphs.json";

type ParagraphEntry = { section: string; sourceFile: string; text: string };
const data = paragraphsData as Record<string, ParagraphEntry>;

// Matches any "Draft guidelines on the classification of high-risk AI systems"
// label (English or Dutch) and captures the trailing paragraph reference.
const LABEL_RE =
  /(Draft guidelines on the classification of high-risk AI systems|Ontwerprichtsnoeren voor de classificatie van hoog-risico AI-systemen)\s+(.+)$/;

export type GuidelinesExcerpt = {
  section: string;
  paragraphs: { number: string; text: string }[];
  /** Numbers that the label referenced but weren't found in the extracted JSON. */
  missing: string[];
};

/** Expand "(127), (145)-(164)" into ["127", "145", "146", ..., "164"]. */
export function parseParagraphRefs(spec: string): string[] {
  const tokens = spec.split(",").map((s) => s.trim());
  const out: string[] = [];
  for (const tok of tokens) {
    const range = tok.match(/^\((\d+)\)\s*[-–—]\s*\((\d+)\)$/);
    if (range) {
      const a = parseInt(range[1], 10);
      const b = parseInt(range[2], 10);
      if (Number.isFinite(a) && Number.isFinite(b) && a <= b) {
        for (let n = a; n <= b; n++) out.push(String(n));
      }
      continue;
    }
    const single = tok.match(/^\((\d+)\)$/);
    if (single) out.push(single[1]);
  }
  return out;
}

/** Look up the excerpt that a badge label references, or null if the label is
 *  not a Draft Guidelines reference. */
export function lookupGuidelinesExcerpt(label: string): GuidelinesExcerpt | null {
  const m = label.match(LABEL_RE);
  if (!m) return null;
  const numbers = parseParagraphRefs(m[2]);
  if (numbers.length === 0) return null;

  const found: { number: string; text: string }[] = [];
  const missing: string[] = [];
  let section = "";
  for (const n of numbers) {
    const entry = data[n];
    if (entry) {
      found.push({ number: n, text: entry.text });
      if (!section) section = entry.section;
    } else {
      missing.push(n);
    }
  }
  if (found.length === 0) return null;
  return { section, paragraphs: found, missing };
}
