/*
 * generate.ts — build Mermaid `.mmd` flowcharts for the AI-Act questionnaires
 * directly from their JSON schemas (+ code logic for Role, Obligations).
 *
 * Run:  npx --yes tsx .claude/skills/export-questionnaire-flowcharts/generate.ts <outDir>
 * Emits <outDir>/{en,nl}/<chart>.mmd for chart in:
 *   identification, identification-ai, identification-algo, identification-sadm,
 *   role, risk, obligations
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve as pathResolve } from "node:path";
import { createRequire } from "node:module";
import { STYLES } from "./styles.js";

// @rjsf/utils and @rjsf/validator-ajv8 are CJS — reach their exports via require.
const require = createRequire(import.meta.url);
const rjsfRetrieve: any = require("@rjsf/utils").retrieveSchema;
const validator: any = require("@rjsf/validator-ajv8").default ?? require("@rjsf/validator-ajv8");

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = pathResolve(__dirname, "../../.."); // .claude/skills/<name> -> repo root

const readJSON = (rel: string) => JSON.parse(readFileSync(pathResolve(REPO, rel), "utf8"));

// ── schema loading ─────────────────────────────────────────────────────────
async function loadSchemas(lang: "en" | "nl") {
  const risk = readJSON(`src/schemas/${lang}/${lang === "en" ? "riskclassification" : "risicoclassificatie"}.json`);
  const role = readJSON(`src/schemas/${lang}/${lang === "en" ? "roleandstatus" : "rolenstatus"}.json`);
  const idMod = await import(
    lang === "en" ? "../../../src/schemas/en/identification-adm.ts" : "../../../src/schemas/nl/identificatie-adm.ts"
  );
  const ident = idMod.identificationSchema ?? idMod.default;
  return { risk, role, ident };
}

// ── graph model ──────────────────────────────────────────────────────────
interface GNode { id: string; label: string; cls: string; shape: "rect" | "round"; }
interface GEdge { from: string; to: string; label: string; }
interface Graph { nodes: Map<string, GNode>; edges: GEdge[]; }

const newGraph = (): Graph => ({ nodes: new Map(), edges: [] });

// ── label helpers ──────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/"/g, "&quot;").replace(/#/g, "&#35;");
function wrap(text: string, width = 30): string {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur ? cur + " " : "") + w;
  }
  if (cur) lines.push(cur);
  return lines.map(esc).join("<br/>");
}
const badgeText = (b: any): string =>
  typeof b === "string" ? b : (b?.label ?? b?.text ?? b?.article ?? b?.title ?? "");
function questionLabel(uiId: string | undefined, badges: any[] | undefined, title: string): string {
  const badgeStr = Array.isArray(badges) ? badges.map(badgeText).filter(Boolean).join(" · ") : "";
  const head = [uiId ? uiId.toUpperCase() : "", badgeStr].filter(Boolean).join(" · ");
  const body = wrap(title, 30);
  return head ? `<b>${esc(head)}</b><br/>${body}` : body;
}
// Mermaid node ids can't contain '.', spaces, etc.
const sid = (key: string) => "n_" + key.replace(/[^A-Za-z0-9_]/g, "_");

// ── schema resolution ────────────────────────────────────────────────────
// NB: @rjsf's retrieveSchema drops `dependencies` when it resolves, which breaks
// branch traversal. Do a plain $ref deref that preserves properties+dependencies.
const followRef = (ref: any, root: any): any => {
  if (typeof ref !== "string" || !ref.startsWith("#/")) return null;
  let cur: any = root;
  for (const p of ref.slice(2).split("/")) cur = cur == null ? cur : cur[p];
  return cur;
};
const deref = (schema: any, root: any): any => {
  let s = schema, guard = 0;
  while (s && typeof s === "object" && s.$ref && guard++ < 30) s = followRef(s.$ref, root);
  return s ?? schema;
};
const isQuestion = (p: any) => p && (Array.isArray(p.enum) || p.type === "array");
const optionValues = (p: any): string[] => {
  if (Array.isArray(p.enum)) return p.enum.map(String);
  if (p.type === "array" && p.items?.enum) return p.items.enum.map(String);
  return [];
};
function matchBranch(oneOf: any[], key: string, option: string, root?: any): any | null {
  if (!Array.isArray(oneOf)) return null;
  for (const b of oneOf) {
    const bp = b?.properties?.[key];
    if (!bp) continue;
    if (Array.isArray(bp.enum) && bp.enum.map(String).includes(option)) return b;
    // array multi-select gating: contains/anyOf reference the chosen item's enum
    const containsEnum: any[] = bp.contains?.enum || bp.items?.enum || [];
    if (containsEnum.map(String).includes(option)) return b;
    if (Array.isArray(bp.anyOf) && bp.anyOf.some((a: any) => (a.contains?.enum || []).map(String).includes(option))) return b;
    try { if ((validator as any).isValid(bp, [option], root)) return b; } catch { /* noop */ }
  }
  return null;
}

// ── schema-driven graph (identification, risk) ─────────────────────────────
// terminalFor: given a resolved `output`-def, return {id, label, cls} or null.
function buildSchemaGraph(
  root: any,
  uiSchema: any,
  terminalFor: (def: any) => { id: string; label: string; cls: string } | null
): Graph {
  const g = newGraph();
  const expanded = new Set<string>();

  const addQ = (key: string, prop: any): string => {
    const id = sid(key);
    if (!g.nodes.has(id)) {
      const ui = uiSchema?.[key] || {};
      g.nodes.set(id, { id, label: questionLabel(ui["ui:id"], ui["ui:badges"], prop.title || key), cls: "Q", shape: "rect" });
    }
    return id;
  };
  const addTerm = (prop: any): string | null => {
    const t = terminalFor(prop);
    if (!t) return null;
    if (!g.nodes.has(t.id)) g.nodes.set(t.id, { id: t.id, label: t.label, cls: t.cls, shape: "rect" });
    return t.id;
  };

  // Group edges from `from`: options sharing a target become one labelled edge
  // (keeps big gates like annexI's 20 answers readable).
  const emitGrouped = (from: string, pairs: { opt: string; to: string }[]) => {
    const byTarget = new Map<string, string[]>();
    for (const { opt, to } of pairs) (byTarget.get(to) ?? byTarget.set(to, []).get(to)!).push(opt);
    for (const [to, opts] of byTarget) {
      let label: string;
      if (opts.length === 1) label = wrap(opts[0], 26);
      else if (opts.length <= 3) label = opts.map((o) => wrap(o, 26)).join("<br/>");
      else label = `${opts.length} answers`;
      g.edges.push({ from, to, label });
    }
  };

  // Process an ordered object as a sequence. `cont` = node to flow to after the
  // sequence finishes (fall-through). Returns the sequence's entry node id.
  const processSeq = (objRaw: any, cont: string | null): string | null => {
    const obj = deref(objRaw, root);
    const items = Object.entries(obj.properties || {}).map(([k, v]) => [k, deref(v, root)] as [string, any]);
    const deps = obj.dependencies || {};
    let nextId: string | null = cont;
    let entry: string | null = cont;

    for (let i = items.length - 1; i >= 0; i--) {
      const [key, prop] = items[i];
      if (key === "output" || prop.classification || prop.riskOutcome) {
        const tid = addTerm(prop);
        if (tid) { nextId = tid; entry = tid; }
        continue;
      }
      // nested block object (has its own properties) → inline its questions
      if (prop && typeof prop === "object" && prop.properties && !isQuestion(prop)) {
        const subEntry = processSeq(prop, nextId);
        if (subEntry) { nextId = subEntry; entry = subEntry; }
        continue;
      }
      if (isQuestion(prop)) {
        const qid = addQ(key, prop);
        const followUp = nextId;
        if (!expanded.has(key)) {
          expanded.add(key);
          const pairs: { opt: string; to: string }[] = [];
          for (const opt of optionValues(prop)) {
            const branch = matchBranch(deps[key]?.oneOf, key, opt, root);
            let target: string | null = followUp;
            if (branch) {
              const injProps: any = {};
              for (const [k, v] of Object.entries(branch.properties || {})) if (k !== key) injProps[k] = v;
              if (Object.keys(injProps).length > 0)
                target = processSeq({ type: "object", properties: injProps, dependencies: branch.dependencies }, followUp);
            }
            if (target) pairs.push({ opt, to: target });
          }
          emitGrouped(qid, pairs);
        }
        nextId = qid; entry = qid;
        continue;
      }
      // scalar/intro/hidden → skip, keep nextId
    }
    return entry;
  };

  processSeq(root, null);
  return g;
}

// ── outcome → classDef mappers ─────────────────────────────────────────────
function riskTerminal(def: any) {
  const o = def.riskOutcome as string;
  const branch = def.annexIArt6Branch as string | undefined;
  const map: Record<string, { id: string; cls: string; label: string }> = {
    low: { id: "T_low", cls: "cat_low", label: "Minimal / no requirements" },
    high: { id: branch ? `T_high_${branch}` : "T_high", cls: "cat_high", label: `High-risk${branch ? ` (Annex I §${branch})` : ""}` },
    highExcept: { id: "T_highExcept", cls: "cat_except", label: "High-risk — exception" },
    forbidden: { id: "T_forbidden", cls: "cat_forb", label: "Prohibited" },
    forbiddenExcept: { id: "T_forbiddenExcept", cls: "cat_except", label: "Prohibited — exception" },
  };
  const m = map[o];
  return m ? { id: m.id, cls: m.cls, label: m.label } : null;
}
function identTerminal(def: any) {
  const c = def.classification;
  if (!c) return null;
  const id = `T_${c.ai}_${c.algo}_${c.sadm}`;
  const parts: string[] = [];
  if (c.ai === "yes") parts.push("AI system");
  if (c.algo === "yes") parts.push("High-impact algorithm");
  if (c.sadm && c.sadm !== "no") parts.push("Automated decision-making (sADM)");
  const label = parts.length ? parts.join(" + ") : "None of these";
  const cls = c.ai === "yes" ? "cat_ai" : c.algo === "yes" ? "cat_algo" : (c.sadm && c.sadm !== "no") ? "cat_sadm" : "oNone";
  return { id, cls, label };
}

// ── mermaid emit ───────────────────────────────────────────────────────────
function nodeLine(n: GNode): string {
  const open = n.shape === "round" ? '(["' : '["';
  const close = n.shape === "round" ? '"])' : '"]';
  return `    ${n.id}${open}${n.label}${close}:::${n.cls}`;
}
function emitMermaid(chartKey: string, g: Graph): string {
  const style = STYLES[chartKey];
  const out: string[] = [style.init, "flowchart LR", ""];
  out.push(...style.classDefs.map((c) => "    " + c), "");
  for (const n of g.nodes.values()) out.push(nodeLine(n));
  out.push("");
  for (const e of g.edges) {
    const lbl = (e.label ?? "").toString().trim();
    out.push(lbl ? `    ${e.from} -->|"${lbl}"| ${e.to}` : `    ${e.from} --> ${e.to}`);
  }
  return out.join("\n") + "\n";
}

// ── identification sub-charts (reachability to an outcome type) ─────────────
function subgraph(g: Graph, keep: (n: GNode) => boolean, styleKey: string, subCls: (n: GNode) => string): Graph {
  // keep terminals matching `keep`, plus every node/edge on a path that can reach them
  const targets = new Set([...g.nodes.values()].filter((n) => n.cls.startsWith("cat_") && keep(n)).map((n) => n.id));
  // reverse reachability
  const rev = new Map<string, string[]>();
  for (const e of g.edges) (rev.get(e.to) ?? rev.set(e.to, []).get(e.to)!).push(e.from);
  const reach = new Set<string>(targets);
  const stack = [...targets];
  while (stack.length) { const cur = stack.pop()!; for (const p of rev.get(cur) || []) if (!reach.has(p)) { reach.add(p); stack.push(p); } }
  const sg = newGraph();
  for (const n of g.nodes.values()) if (reach.has(n.id)) sg.nodes.set(n.id, { ...n, cls: n.cls === "Q" ? "Q" : subCls(n) });
  for (const e of g.edges) if (reach.has(e.from) && reach.has(e.to)) sg.edges.push(e);
  return sg;
}

// ── role & obligations (code logic) — see roleStatus.ts / ObligationsQuestionnaire.tsx
// (implemented in generateRole/generateObligations; kept schema-independent)
import { buildRoleGraph } from "./role-obligations.js";
import { buildObligationsGraph } from "./role-obligations.js";

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  const outDir = process.argv[2] || pathResolve(REPO, "flowcharts");
  for (const lang of ["en", "nl"] as const) {
    const { risk, role, ident } = await loadSchemas(lang);
    const dir = pathResolve(outDir, lang);
    mkdirSync(dir, { recursive: true });

    const write = (name: string, mmd: string) => { writeFileSync(pathResolve(dir, `${name}.mmd`), mmd); console.log("wrote", `${lang}/${name}.mmd`); };

    // risk
    write("risk", emitMermaid("risk", buildSchemaGraph(risk.JSONSchema, risk.uiSchema, riskTerminal)));

    // identification (full) + sub-charts
    const idG = buildSchemaGraph(ident.JSONSchema, ident.uiSchema, identTerminal);
    write("identification", emitMermaid("identification", idG));
    write("identification-ai", emitMermaid("identification-ai",
      subgraph(idG, (n) => n.id.startsWith("T_yes_"), "identification-ai", (n) => n.id.startsWith("T_") ? (n.cls === "oNone" ? "cat_none" : "cat_ai") : n.cls)));
    write("identification-algo", emitMermaid("identification-algo",
      subgraph(idG, (n) => /^T_(no|yes)_yes_/.test(n.id), "identification-algo", (n) => n.id.startsWith("T_") ? (n.cls === "oNone" ? "cat_none" : "cat_algo") : n.cls)));
    write("identification-sadm", emitMermaid("identification-sadm",
      subgraph(idG, (n) => /^T_[a-z]+_[a-z]+_(?!no)/.test(n.id), "identification-sadm", (n) => n.id.startsWith("T_") ? (n.cls === "oNone" ? "cat_none" : "cat_sadm") : n.cls)));

    // role + obligations (from code logic)
    write("role", emitMermaid("role", buildRoleGraph(role, lang)));
    write("obligations", emitMermaid("obligations", buildObligationsGraph(lang)));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
