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
 * This is a *presence* check only — it does not verify that a node's outgoing edges
 * go to the right place. See check-logic.mjs for that (risk/role/identification only).
 *
 * Run:  npx --yes tsx .claude/skills/export-questionnaire-flowcharts/check-coverage.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  REPO, NL_ONLY, CHARTS, QUESTION_SOURCE, SUBSET_OK,
  loadSchema, qNumbers, chartNodeIds, chartQNumbers, declaredClasses, usedClasses,
} from "./flowchart-shared.mjs";

const list = (s) => [...s].sort((a, b) => a - b || String(a).localeCompare(String(b))).join(", ");

// Single chart+language check — returns { ok, findings, nodeIds } so render.mjs can call
// it directly as part of its pre-export gate, and so the CLI runner below can still do
// the cross-language node-id-set parity comparison afterwards.
export async function checkChartCoverage({ chart, lang, srcDir }) {
  const SRC = srcDir || join(REPO, "flowcharts/src");
  const findings = [];
  if (lang === "en" && NL_ONLY.has(chart)) return { ok: true, findings, skipped: true, nodeIds: null };
  const path = join(SRC, lang, `${chart}.mmd`);
  if (!existsSync(path)) return { ok: false, findings: [`MISSING master ${path}`], nodeIds: null };
  const mmd = readFileSync(path, "utf8");
  const ids = chartNodeIds(mmd);

  const src = QUESTION_SOURCE[chart];
  if (src) {
    const schema = await loadSchema(chart, lang);
    const want = schema ? qNumbers(schema.uiSchema) : new Set();
    const have = chartQNumbers(ids);
    const missing = [...want].filter((q) => !have.has(q));
    const extra = [...have].filter((q) => !want.has(q));
    if (missing.length && !SUBSET_OK.has(chart)) findings.push(`questions in schema, not in chart: q${list(missing).split(", ").join(", q")}`);
    if (extra.length) findings.push(`Q-nodes in chart, not in schema: Q${list(extra).split(", ").join(", Q")}`);
  }

  const used = usedClasses(mmd);
  const unused = declaredClasses(mmd).filter((c) => !used.has(c));
  if (unused.length) findings.push(`classDefs declared but never applied: ${unused.join(", ")}`);

  return { ok: findings.length === 0, findings, nodeIds: ids };
}

// ── standalone CLI ─────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const SRC = process.argv[2] || join(REPO, "flowcharts/src");
  let problems = 0;
  const nodesByLang = {};
  for (const lang of ["en", "nl"]) {
    nodesByLang[lang] = {};
    console.log(`\n── ${lang} ──`);
    for (const chart of CHARTS) {
      const { ok, findings, skipped, nodeIds } = await checkChartCoverage({ chart, lang, srcDir: SRC });
      if (skipped) { console.log(`  ${chart}: skipped (Dutch-only chart)`); continue; }
      nodesByLang[lang][chart] = nodeIds;
      if (!ok) { problems += findings.length; findings.forEach((m) => console.error(`  ${chart}: ${m}`)); }
      else console.log(`  ${chart}: ok (${nodeIds.size} nodes)`);
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
}
