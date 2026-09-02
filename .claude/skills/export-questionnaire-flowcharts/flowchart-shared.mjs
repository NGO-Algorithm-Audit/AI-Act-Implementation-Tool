/*
 * flowchart-shared.mjs — primitives shared by check-coverage.mjs and check-logic.mjs:
 * "what is chart X's source, for language Y" and basic chart-text parsing. Kept in one
 * place so the two checkers can't silently disagree about which file is the source of
 * truth for a given chart.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(__dirname, "../../..");

export const readJSON = (rel) => JSON.parse(readFileSync(resolve(REPO, rel), "utf8"));

// The four NTA 8047 chapter questionnaires: chart key -> schema basename in
// src/schemas/nta/<lang>/. Their `ui:id`s (q1..qn) number the screens, not the
// individual requirements listed on a screen.
export const NTA = {
  "nta-wenselijkheid": "wenselijkheid",
  "nta-ontwerp": "ontwerp",
  "nta-verificatie": "verificatie",
  "nta-gebruik": "gebruik",
};
// Charts that exist in Dutch only — the English NTA schemas are still copies of the
// Dutch ones, so there is no English master to check or to compare against.
// "nta" merges the four chapter charts into one diagram; its node ids are prefixed per
// chapter (W/O/T/G), so it carries no Q-numbers of its own — the chapter charts below
// are what the schema check runs against.
export const NL_ONLY = new Set([...Object.keys(NTA), "nta"]);

export const CHARTS = ["identification", "identification-ai", "identification-algo", "identification-sadm",
  "role", "risk", "obligations", "nta", ...Object.keys(NTA)];

// Charts whose questions are numbered from a schema (obligations comes from imperative
// code — see check-logic.mjs's LOGIC_CHARTS / the "not logic-checked" notice).
export const QUESTION_SOURCE = {
  risk: "risk",
  role: "role",
  identification: "identification",
  "identification-ai": "identification",
  "identification-algo": "identification",
  "identification-sadm": "identification",
  ...Object.fromEntries(Object.keys(NTA).map((k) => [k, k])),
};
// Sub-charts show a subset of the questionnaire on purpose.
export const SUBSET_OK = new Set(["identification-ai", "identification-algo", "identification-sadm"]);

// ── loading a chart's schema object for a language ───────────────────────────
// risk/role are plain JSON files; identification's schema is assembled at runtime by a
// TS factory, so it's imported and executed rather than JSON.parse'd (same pattern
// check-coverage.mjs already used). Returns { JSONSchema, uiSchema } or null (no
// declarative source, e.g. obligations/nta-not-applicable).
export async function loadSchema(chart, lang) {
  const src = QUESTION_SOURCE[chart];
  if (!src) return null;
  if (src === "risk") {
    return readJSON(`src/schemas/${lang}/${lang === "en" ? "riskclassification" : "risicoclassificatie"}.json`);
  }
  if (src === "role") {
    return readJSON(`src/schemas/${lang}/${lang === "en" ? "roleandstatus" : "rolenstatus"}.json`);
  }
  if (src === "identification") {
    const idMod = await import(
      lang === "en" ? "../../../src/schemas/en/identification-adm.ts" : "../../../src/schemas/nl/identificatie-adm.ts"
    );
    return idMod.identificationSchema ?? idMod.default;
  }
  if (Object.prototype.hasOwnProperty.call(NTA, src)) {
    return readJSON(`src/schemas/nta/${lang}/${NTA[src]}.json`);
  }
  return null;
}

// ── chart side: parsing a .mmd's text ─────────────────────────────────────────
// Node declarations sit at the start of a line: `    Q12["…"]:::Q` / `START([▶ Start])`.
export const chartNodeIds = (mmd) =>
  new Set([...mmd.matchAll(/^\s+([A-Za-z][A-Za-z0-9_]*)\s*(?:\[|\(\[|\{|\()/gm)].map((m) => m[1])
    .filter((id) => id !== "linkStyle" && id !== "classDef" && id !== "flowchart"));
// Q2A / Q2B / Q12cat all cover question 2 / 12.
export const chartQNumbers = (ids) =>
  new Set([...ids].map((id) => id.match(/^Q(\d+)/)).filter(Boolean).map((m) => +m[1]));
export const declaredClasses = (mmd) => [...mmd.matchAll(/^\s*classDef\s+(\S+)/gm)].map((m) => m[1]);
export const usedClasses = (mmd) => new Set([...mmd.matchAll(/:::(\w+)/g)].map((m) => m[1]));

// All `A --> B` edges in declaration order, as { src, dst, label }. Handles Mermaid's
// multi-node `&`-chaining on either side (`A & B & C --> D`, `A --> B & C`) by expanding
// it to the full set of pairs — role.mmd's role-label convergence line
// (`ROLE_P & ROLE_PD & ... --> Q3`) is exactly this shape, and a plain single-id regex
// silently drops the whole line (proven: it made check-logic.mjs mis-report Q1/Q2 as
// unable to reach Q3, when the real chart is correctly wired).
export const chartEdges = (mmd) => {
  const out = [];
  for (const m of mmd.matchAll(/^\s*([\w\s&]+?)\s*-->\s*(?:\|"([^"]*)"\|)?\s*([\w\s&]+?)\s*$/gm)) {
    const srcs = m[1].split(/\s*&\s*/).filter(Boolean);
    const dsts = m[3].split(/\s*&\s*/).filter(Boolean);
    for (const src of srcs) for (const dst of dsts) out.push({ src, label: m[2] ?? null, dst });
  }
  return out;
};

// ── schema side: which question numbers does a uiSchema have? ────────────────
// ui:id values look like "q1", "Q1", "q2.1", "q34 explain purpose" -> the leading number.
export const qNumbers = (uiSchema) => {
  const out = new Set();
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    const id = o["ui:id"];
    if (typeof id === "string") {
      const m = id.trim().toLowerCase().match(/^q(\d+)/);
      if (m) out.add(+m[1]);
    }
    for (const v of Object.values(o)) if (v && typeof v === "object") walk(v);
  };
  walk(uiSchema);
  return out;
};
