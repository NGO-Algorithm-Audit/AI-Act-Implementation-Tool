/*
 * nta-generate.mjs — builds the five NTA 8047 chart masters (the four chapter charts
 * plus the merged `nta` chart) from the questionnaire schemas + the hand-written
 * paraphrases in nta-content.ts.
 *
 * Unlike generate.ts (which only produces a rough, never-shipped scaffold), this
 * script's output is the shipped master: it fully replaces
 * flowcharts/src/nl/nta-wenselijkheid.mmd, nta-ontwerp.mmd, nta-verificatie.mmd,
 * nta-gebruik.mmd and nta.mmd every time it runs. That is safe because these four
 * questionnaires are linear documentation forms with no branches (see SKILL.md's NTA
 * rules) — the box order, the box-to-box arrows, the requirement counts, and the
 * merged chart's row layout are all mechanically derivable from the schema. The only
 * thing that is never derived is the paraphrase sentence on each box, which always
 * comes from nta-content.ts.
 *
 * If a question exists in a schema but has no entry in nta-content.ts, the script
 * stops and reports which one — it never invents or blanks out chart wording.
 *
 * Run:  npx --yes tsx .claude/skills/export-questionnaire-flowcharts/nta-generate.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { STYLES } from "./styles.ts";
import { NTA_CONTENT } from "./nta-content.ts";
import { extractQuestions, vereistenLabel } from "./nta-schema.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "../../..");
const OUT_DIR = resolve(REPO, "flowcharts/src/nl");

// Chapter order = the order the tool walks them in. Not derived from the standard's
// own chapter numbers — those are intentionally not used anywhere in these charts.
const CHAPTERS = [
  { schemaFile: "wenselijkheid", contentKey: "wenselijkheid", chartKey: "nta-wenselijkheid", prefix: "W" },
  { schemaFile: "ontwerp", contentKey: "ontwerp", chartKey: "nta-ontwerp", prefix: "O" },
  { schemaFile: "verificatie", contentKey: "verificatie", chartKey: "nta-verificatie", prefix: "T" },
  { schemaFile: "gebruik", contentKey: "gebruik", chartKey: "nta-gebruik", prefix: "G" },
];

const esc = (s) => String(s).replace(/"/g, "&quot;").replace(/#/g, "&#35;");

const readSchema = (file) => JSON.parse(readFileSync(resolve(REPO, `src/schemas/nta/nl/${file}.json`), "utf8"));

function requireContent(chapter, qid) {
  const body = NTA_CONTENT[chapter.contentKey]?.[qid];
  if (!body) {
    console.error(
      `Missing chart text: nta-content.ts has no "${qid}" entry under "${chapter.contentKey}" ` +
        `(schema src/schemas/nta/nl/${chapter.schemaFile}.json). Add it before regenerating.`
    );
    process.exit(1);
  }
  return body;
}

function nodeLabel(groupTitle, body, count) {
  return `${esc(groupTitle)}<br/>${body}<br/>${vereistenLabel(count)}`;
}

// ── one chapter's standalone chart (flowchart LR, Q1..Qn -> RES) ────────────────────
function buildChapterMmd(chapter, questions) {
  const style = STYLES[chapter.chartKey];
  const lines = [style.init, "flowchart LR", "", ...style.classDefs.map((c) => "    " + c)];
  questions.forEach((q, i) => {
    const nid = `Q${i + 1}`;
    const next = i < questions.length - 1 ? `Q${i + 2}` : "RES";
    const body = requireContent(chapter, q.qid);
    lines.push("");
    lines.push(`    %% ════════ ${nid} — ${q.groupTitle} ════════`);
    lines.push(`    ${nid}["${nodeLabel(q.groupTitle, body, q.count)}"]:::Q`);
    lines.push(`    ${nid} --> ${next}`);
  });
  lines.push("");
  lines.push(`    %% ════════ Afsluiting ════════`);
  lines.push(`    RES["Resultaat<br/>vastgelegd<br/>(inhoud van de resultaten-<br/>pagina volgt)"]:::cat_result`);
  return lines.join("\n") + "\n";
}

// ── the merged chart: four rows, one per chapter, wired per SKILL.md's NTA rules ────
function buildMergedMmd(chapterData) {
  const style = STYLES["nta"];
  const lines = [style.init, "flowchart TB", "", ...style.classDefs.map((c) => "    " + c)];
  const clusterIds = [];
  let edgeCount = 0;

  chapterData.forEach(({ chapter, questions, title }, ci) => {
    const clusterId = `CH_${chapter.prefix}`;
    clusterIds.push(clusterId);
    const entryId = `E_${chapter.prefix}`;
    const resId = `RES_${chapter.prefix}`;
    const entryText =
      ci === 0
        ? "▶ Vanaf het NTA-scherm"
        : `▶ Vanaf het NTA-scherm<br/>of Resultaat<br/>${esc(chapterData[ci - 1].title)}`;

    lines.push("");
    lines.push(`    %% ${"═".repeat(60)}`);
    lines.push(`    %% ${title}`);
    lines.push(`    %% ${"═".repeat(60)}`);
    lines.push(`    subgraph ${clusterId}["${esc(title)}"]`);
    lines.push(`        direction LR`);
    lines.push(`        ${entryId}["${entryText}"]:::entry`);
    questions.forEach((q, i) => {
      const nid = `${chapter.prefix}${i + 1}`;
      const body = requireContent(chapter, q.qid);
      lines.push(`        ${nid}["${nodeLabel(q.groupTitle, body, q.count)}"]:::Q`);
    });
    lines.push(`        ${resId}["Resultaat<br/>vastgelegd"]:::cat_result`);
    lines.push(`        ${entryId} --> ${chapter.prefix}1`);
    edgeCount += 1;
    const chain = questions.map((_, i) => `${chapter.prefix}${i + 1}`).concat(resId).join(" --> ");
    lines.push(`        ${chain}`);
    edgeCount += questions.length; // one edge per --> in the chain above
    lines.push(`    end`);
  });

  lines.push("");
  lines.push(`    %% ════════ Volgorde van de hoofdstukken ════════`);
  lines.push(
    "    %% Onzichtbare links tussen de clusters (niet tussen knopen!) houden de vier"
  );
  lines.push(
    "    %% rijen onder elkaar en laten de LR-richting binnen elke rij intact."
  );
  const invisibleStart = edgeCount;
  const invisibleIndices = [];
  for (let i = 0; i < clusterIds.length - 1; i++) {
    lines.push(`    ${clusterIds[i]} ~~~ ${clusterIds[i + 1]}`);
    invisibleIndices.push(invisibleStart + i);
  }
  lines.push("");
  lines.push(
    "    %% De cluster-links hierboven zijn ordeningshulp, geen stap in het proces:"
  );
  lines.push(
    "    %% expliciet onzichtbaar maken, anders erven ze de blauwe `linkStyle default`."
  );
  lines.push(`    linkStyle ${invisibleIndices.join(",")} stroke:none,stroke-width:0px`);
  return lines.join("\n") + "\n";
}

// ── main ──────────────────────────────────────────────────────────────────────────
function main() {
  const chapterData = CHAPTERS.map((chapter) => {
    const schema = readSchema(chapter.schemaFile);
    const questions = extractQuestions(schema);
    return { chapter, questions, title: schema.JSONSchema.title };
  });

  for (const { chapter, questions } of chapterData) {
    const mmd = buildChapterMmd(chapter, questions);
    const path = resolve(OUT_DIR, `${chapter.chartKey}.mmd`);
    writeFileSync(path, mmd);
    console.log(`wrote ${path} (${questions.length} questions)`);
  }

  const merged = buildMergedMmd(chapterData);
  const mergedPath = resolve(OUT_DIR, "nta.mmd");
  writeFileSync(mergedPath, merged);
  console.log(`wrote ${mergedPath}`);
}

main();
