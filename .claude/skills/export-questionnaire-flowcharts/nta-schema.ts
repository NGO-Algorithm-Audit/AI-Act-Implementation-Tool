// Shared schema-reading logic for the NTA 8047 charts, used by both nta-generate.mjs
// (which builds the charts) and check-coverage.mjs (which checks them). Kept in one
// place on purpose: the requirement-counting rule below must never drift between "what
// the chart says" and "what the check expects."

export interface NtaQuestion {
  qid: string; // "q1", "q2", ...
  groupTitle: string;
  count: number; // requirements represented by this question, for the "(n vereisten)" line
}

// Checkbox options that don't count as a requirement of their own — they're the
// "select this instead" escape hatches every checkbox question ends with.
export const NONE_OF_ABOVE = /^geen van de bovenstaande/i;
export const NOT_APPLICABLE = /^niet van toepassing/i;

// Ordered list of questions in one NTA chapter schema (the parsed JSON from
// src/schemas/nta/nl/<chapter>.json). `ui:id` values number the screens (q1..qn); the
// "start" screen (the intro) is not a question.
export function extractQuestions(schema: any): NtaQuestion[] {
  const { JSONSchema, uiSchema } = schema;
  const out: NtaQuestion[] = [];
  for (const key of Object.keys(JSONSchema.properties || {})) {
    const ui = uiSchema[key];
    const qid = ui?.["ui:id"];
    if (!qid || qid === "start") continue;
    const prop = JSONSchema.properties[key];
    const groupTitle = ui["ui:groupTitle"] || "";
    let count: number;
    if (ui["ui:widget"] === "checkboxes") {
      const opts: string[] = prop.items?.enum || [];
      count = opts.filter((o) => !NONE_OF_ABOVE.test(o) && !NOT_APPLICABLE.test(o)).length;
    } else {
      // radio (single-select yes/no, sometimes with a "not applicable" escape) — the
      // question itself is one requirement, not one per answer option.
      count = 1;
    }
    out.push({ qid, groupTitle, count });
  }
  return out;
}

export const vereistenLabel = (n: number) => (n === 1 ? "(1 vereiste)" : `(${n} vereisten)`);
