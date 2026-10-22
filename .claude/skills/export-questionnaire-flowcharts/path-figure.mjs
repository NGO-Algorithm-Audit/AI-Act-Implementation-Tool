/*
 * path-figure.mjs — communication figure derived from a curated master: the full
 * chart structure as blank grey shapes in the background, one path to a terminal
 * highlighted. Styled after the ClassifymyAI slide deck (Inter, #F4F4F0 background,
 * #295B55 accent, warm greys). Writes <outBase>.{svg,png,pdf}.
 *
 * Run:  node .claude/skills/export-questionnaire-flowcharts/path-figure.mjs \
 *         <chart> "<path>" <outName> [terminal label] [lang]
 *   e.g. risk "Q1,Q3,Q11@None of the above,Q13@None of the above,Q28,Q30,LOW" \
 *        risk-path-low "No requirements"
 *
 * <path> is a comma-separated list of node ids. "ID@label" selects, among several
 * edges leaving ID towards the next node, the one whose label contains <label>.
 * Junction hops (A --- J --> B) count as one step of the path.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "../../..");
const argv = process.argv.slice(2);
const concise = argv.includes("--concise");
const [chart, pathArg, outName, termLabel = "", lang = "en"] = argv.filter((a) => a !== "--concise");
if (!chart || !pathArg || !outName) {
  console.error('usage: path-figure.mjs [--concise] <chart> "<A,B@label,C>" <outName> [terminal label] [lang]');
  process.exit(1);
}

const C = {
  bg: "#F4F4F0", node: "#E8E8E3", stroke: "#D8D8D0", term: "#D8D8D0", termStroke: "#ABAB9C",
  edge: "#D8D8D0", on: "#295B55", text: "#0C0C09",
};

const src = readFileSync(join(REPO, "flowcharts/src", lang, `${chart}.mmd`), "utf8").split("\n");

// ── parse ──────────────────────────────────────────────────────────────────────
const NODE_RE = /^\s*([A-Za-z0-9_]+)\[".*"\](?::::(\w+))?\s*$/;
const JUNC_RE = /^\s*([A-Za-z0-9_]+)@\{.*shape:\s*sm-circ.*\}\s*$/;
const EDGE_RE = /^\s*([A-Za-z0-9_]+)\s*(-->|---)\s*(?:\|"(.*?)"\|\s*)?([A-Za-z0-9_]+)\s*$/;

let nodes = new Map(); // id -> class
let junctions = new Set();
let edges = []; // { i, from, to, label }
for (const line of src) {
  let m;
  if ((m = line.match(EDGE_RE))) edges.push({ i: edges.length, from: m[1], to: m[4], label: m[3] ?? "" });
  else if ((m = line.match(JUNC_RE))) junctions.add(m[1]);
  else if ((m = line.match(NODE_RE))) nodes.set(m[1], m[2] ?? "");
}

// ── --concise: collapse each multi-question block into one shape ───────────────
// Key = the node id the block keeps (use it in <path>); value = the nodes it absorbs.
const GROUPS = {
  risk: {
    Q4: ["Q5", "Q6", "Q7", "Q7_exceptions", "Q8", "Q9", "Q10"], // biometric drill-down
    Q14: ["Q15", "Q15_cer"], Q17: ["Q18"], Q21: ["Q21_followup", "Q22"], Q23: ["Q24", "Q25"], // Annex III domains
    Q28: ["Q29", "Q30", "Q31"], // Art. 5(1)(a)/(c) prohibited-practices screen
    EXCH: ["Q32", "Q33", "Q34"], // high-risk exception screen + Art. 6(3)
  },
};
if (concise) {
  const rep = new Map();
  for (const [k, members] of Object.entries(GROUPS[chart] ?? {})) for (const m of members) rep.set(m, k);
  const r = (id) => rep.get(id) ?? id;
  const seen = new Set(), collapsed = [];
  for (const e of edges) {
    if (junctions.has(e.from)) continue; // folded into the edge that enters the junction
    const to = junctions.has(e.to) ? edges.find((h) => h.from === e.to).to : e.to;
    const [a, b] = [r(e.from), r(to)], key = `${a}>${b}`;
    if (a === b || seen.has(key)) continue;
    seen.add(key);
    collapsed.push({ i: collapsed.length, from: a, to: b, label: e.label });
  }
  edges = collapsed;
  junctions = new Set();
  nodes = new Map([...nodes].filter(([id]) => !rep.has(id)));
}
const isTerminal = (id) => !junctions.has(id) && !edges.some((e) => e.from === id);

// ── resolve the path ───────────────────────────────────────────────────────────
const steps = pathArg.split(",").map((s) => s.trim()).map((s) => {
  const [id, label] = s.split("@");
  return { id: id.trim(), label: label?.trim() };
});
const onEdges = new Set(), onJunctions = new Set(), onNodes = new Set(steps.map((s) => s.id));
for (let k = 0; k < steps.length - 1; k++) {
  const { id: a, label } = steps[k], b = steps[k + 1].id;
  const cands = [];
  for (const e of edges.filter((e) => e.from === a)) {
    if (e.to === b) cands.push([e]);
    else if (junctions.has(e.to)) {
      const hop = edges.find((h) => h.from === e.to && h.to === b);
      if (hop) cands.push([e, hop]);
    }
  }
  const pick = label && !concise ? cands.filter((c) => c[0].label.toLowerCase().includes(label.toLowerCase())) : cands;
  if (!pick.length) {
    console.error(`No edge ${a} -> ${b}${label ? ` with label "${label}"` : ""} in ${lang}/${chart}.mmd` +
      (cands.length ? ` (labels: ${cands.map((c) => `"${c[0].label}"`).join(", ")})` : ""));
    process.exit(1);
  }
  if (pick.length > 1) console.warn(`WARN ${a} -> ${b}: ${pick.length} parallel edges, using "${pick[0][0].label}" (add @label to choose)`);
  for (const e of pick[0]) { onEdges.add(e.i); if (junctions.has(e.to)) onJunctions.add(e.to); }
  console.log(`${a} -> ${b}: edge ${pick[0].map((e) => e.i).join("+")} "${pick[0][0].label}"`);
}
const last = steps.at(-1).id;
if (!isTerminal(last)) console.warn(`WARN path ends at ${last}, which is not a terminal node`);

// ── rewrite ────────────────────────────────────────────────────────────────────
const init = `%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'Inter, Helvetica, sans-serif', 'fontSize': '16px', 'lineColor': '${C.edge}', 'background': '${C.bg}'}, 'flowchart': {'curve': 'basis', 'useMaxWidth': false, 'htmlLabels': true, 'nodeSpacing': 60, 'rankSpacing': 110, 'padding': 18}}}%%`;
const blank = "&nbsp;".repeat(10);
const out = [init, "flowchart LR", ""];
out.push(
  `    classDef bg fill:${C.node},stroke:${C.stroke},stroke-width:1px,color:${C.node}`,
  `    classDef bgterm fill:${C.term},stroke:${C.termStroke},stroke-width:1px,color:${C.term}`,
  `    classDef on fill:${C.on},stroke:${C.on},stroke-width:1px,color:${C.on}`,
  `    classDef onterm fill:${C.on},stroke:${C.on},stroke-width:1px,color:#ffffff,font-weight:bold`,
  `    linkStyle default stroke:${C.edge},stroke-width:1.2px`,
  "",
);
const nodeLine = (id) => {
  const term = isTerminal(id), on = onNodes.has(id);
  const label = on && id === last ? (termLabel || blank) : blank;
  return `    ${id}["${label}"]:::${on ? (term ? "onterm" : "on") : term ? "bgterm" : "bg"}`;
};
if (concise) {
  for (const id of nodes.keys()) out.push(nodeLine(id));
  for (const e of edges) out.push(`    ${e.from} --> ${e.to}`);
} else for (const line of src) {
  let m;
  if ((m = line.match(EDGE_RE))) out.push(`    ${m[1]} ${m[2]} ${m[4]}`);
  else if ((m = line.match(JUNC_RE))) out.push(`    ${m[1]}@{ shape: sm-circ, label: " " }`);
  else if ((m = line.match(NODE_RE))) out.push(nodeLine(m[1]));
}
out.push("", `    linkStyle ${[...onEdges].sort((a, b) => a - b).join(",")} stroke:${C.on},stroke-width:4px`);
const mmd = out.join("\n") + "\n";

// ── render ─────────────────────────────────────────────────────────────────────
const tmp = mkdtempSync(join(process.env.TMPDIR || tmpdir(), "path-figure-"));
const mmdPath = join(tmp, `${outName}.mmd`), cfgPath = join(tmp, "mmdc-config.json");
writeFileSync(mmdPath, mmd);
const cfg = JSON.parse(readFileSync(join(__dirname, "mmdc-config.json"), "utf8"));
cfg.themeCSS = ".label, .nodeLabel, .edgeLabel, span, p, div, text, tspan { font-family: 'Inter', Helvetica, sans-serif !important; }" +
  // Mermaid 12 ignores style/class on sm-circ junctions, so colour them via CSS.
  ` .state-start { fill: ${C.stroke} !important; stroke: ${C.stroke} !important; }` +
  [...onJunctions].map((j) => ` [id*="-${j}-"] .state-start { fill: ${C.on} !important; stroke: ${C.on} !important; }`).join("");
writeFileSync(cfgPath, JSON.stringify(cfg));
const outBase = join(REPO, "flowcharts", lang, outName);
for (const [ext, extra] of [["svg", []], ["png", ["-s", "3"]]]) {
  execFileSync("npx", ["--yes", "@mermaid-js/mermaid-cli", "-q", "-i", mmdPath, "-o", `${outBase}.${ext}`,
    "-c", cfgPath, "-p", join(__dirname, "puppeteer-config.json"), "-b", C.bg, ...extra], { stdio: "inherit" });
  console.log(`wrote ${outBase}.${ext}`);
}
// mermaid-cli ignores -b for PDFs, so print the SVG on a page with the deck background via Chrome.
const svg = readFileSync(`${outBase}.svg`, "utf8");
const w = Math.ceil(+svg.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/)[1]);
const h = Math.ceil(+svg.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/)[2]);
const htmlPath = join(tmp, `${outName}.html`);
writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: ${w}px ${h}px; margin: 0; }
html,body { margin:0; padding:0; background:${C.bg}; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
svg { display:block; width:${w}px; height:${h}px; }
</style></head><body>${svg}</body></html>`);
const CHROME = JSON.parse(readFileSync(join(__dirname, "puppeteer-config.json"), "utf8")).executablePath;
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${outBase}.pdf`,
  "--print-to-pdf-no-header", `file://${htmlPath}`], { stdio: "ignore" });
console.log(`wrote ${outBase}.pdf (${w}x${h})`);
console.log(`derived mermaid source: ${mmdPath}`);
