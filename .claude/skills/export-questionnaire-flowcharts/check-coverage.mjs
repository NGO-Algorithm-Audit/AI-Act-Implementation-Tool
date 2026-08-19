/*
 * check-coverage.mjs — sync gate between the questionnaires and the curated chart
 * masters in flowcharts/src/{en,nl}/*.mmd.
 *
 * The masters are hand-authored (see the authoring rules in SKILL.md), so nothing
 * keeps them in step with the schemas automatically. This reports, per chart:
 *   - questions in the schema that have no node in the chart
 *   - Q-nodes in the chart that no longer exist in the schema
 *   - classDefs declared but never applied (a thin chart / missing outcome)
 *   - EN/NL structural drift (different node ids)
 * Exits non-zero if anything is missing.
 *
 * Run:  npx --yes tsx .claude/skills/export-questionnaire-flowcharts/check-coverage.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "../../..");
const SRC = process.argv[2] || resolve(REPO, "flowcharts/src");

const readJSON = (rel) => JSON.parse(readFileSync(resolve(REPO, rel), "utf8"));

// ── schema side: which question numbers does the questionnaire have? ────────
// ui:id values look like "q1", "q2.1", "q34 explain purpose" -> the leading number.
const qNumbers = (uiSchema) => {
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

async function schemaQuestions(lang) {
  const risk = readJSON(`src/schemas/${lang}/${lang === "en" ? "riskclassification" : "risicoclassificatie"}.json`);
  const idMod = await import(
    lang === "en" ? "../../../src/schemas/en/identification-adm.ts" : "../../../src/schemas/nl/identificatie-adm.ts"
  );
  const ident = idMod.identificationSchema ?? idMod.default;
  return { risk: qNumbers(risk.uiSchema), identification: qNumbers(ident.uiSchema) };
}

// ── chart side ─────────────────────────────────────────────────────────────
// Node declarations sit at the start of a line: `    Q12["…"]:::Q` / `START([▶ Start])`.
const chartNodeIds = (mmd) =>
  new Set([...mmd.matchAll(/^\s+([A-Za-z][A-Za-z0-9_]*)\s*(?:\[|\(\[|\{|\()/gm)].map((m) => m[1])
    .filter((id) => id !== "linkStyle" && id !== "classDef" && id !== "flowchart"));
// Q2A / Q2B / Q12cat all cover question 2 / 12.
const chartQNumbers = (ids) =>
  new Set([...ids].map((id) => id.match(/^Q(\d+)/)).filter(Boolean).map((m) => +m[1]));
const declaredClasses = (mmd) => [...mmd.matchAll(/^\s*classDef\s+(\S+)/gm)].map((m) => m[1]);
const usedClasses = (mmd) => new Set([...mmd.matchAll(/:::(\w+)/g)].map((m) => m[1]));

const CHARTS = ["identification", "identification-ai", "identification-algo", "identification-sadm",
  "role", "risk", "obligations"];
// Charts whose questions are numbered from a schema (role/obligations come from code logic).
const QUESTION_SOURCE = {
  risk: "risk",
  identification: "identification",
  "identification-ai": "identification",
  "identification-algo": "identification",
  "identification-sadm": "identification",
};
// Sub-charts show a subset of the questionnaire on purpose.
const SUBSET_OK = new Set(["identification-ai", "identification-algo", "identification-sadm"]);

const list = (s) => [...s].sort((a, b) => a - b || String(a).localeCompare(String(b))).join(", ");
let problems = 0;

const nodesByLang = {};
for (const lang of ["en", "nl"]) {
  const schema = await schemaQuestions(lang);
  nodesByLang[lang] = {};
  console.log(`\n── ${lang} ──`);
  for (const chart of CHARTS) {
    const path = join(SRC, lang, `${chart}.mmd`);
    if (!existsSync(path)) { console.error(`  ${chart}: MISSING master ${path}`); problems++; continue; }
    const mmd = readFileSync(path, "utf8");
    const ids = chartNodeIds(mmd);
    nodesByLang[lang][chart] = ids;
    const msgs = [];

    const src = QUESTION_SOURCE[chart];
    if (src) {
      const want = schema[src], have = chartQNumbers(ids);
      const missing = [...want].filter((q) => !have.has(q));
      const extra = [...have].filter((q) => !want.has(q));
      if (missing.length && !SUBSET_OK.has(chart)) msgs.push(`questions in schema, not in chart: q${list(missing).split(", ").join(", q")}`);
      if (extra.length) msgs.push(`Q-nodes in chart, not in schema: Q${list(extra).split(", ").join(", Q")}`);
    }

    const used = usedClasses(mmd);
    const unused = declaredClasses(mmd).filter((c) => !used.has(c));
    if (unused.length) msgs.push(`classDefs declared but never applied: ${unused.join(", ")}`);

    if (msgs.length) { problems += msgs.length; msgs.forEach((m) => console.error(`  ${chart}: ${m}`)); }
    else console.log(`  ${chart}: ok (${ids.size} nodes)`);
  }
}

// EN/NL structural parity
console.log("\n── en/nl parity ──");
for (const chart of CHARTS) {
  const a = nodesByLang.en[chart], b = nodesByLang.nl[chart];
  if (!a || !b) continue;
  const onlyEn = [...a].filter((x) => !b.has(x)), onlyNl = [...b].filter((x) => !a.has(x));
  if (onlyEn.length || onlyNl.length) {
    problems++;
    console.error(`  ${chart}: node ids differ — only en: ${onlyEn.join(", ") || "-"} | only nl: ${onlyNl.join(", ") || "-"}`);
  } else console.log(`  ${chart}: ok (${a.size} nodes both languages)`);
}

console.log(problems ? `\n${problems} issue(s) — review before exporting.` : "\nAll charts in sync with the schemas.");
process.exit(problems ? 1 : 0);
