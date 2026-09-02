/*
 * check-logic.mjs — verifies a chart's *branching logic*, not just node presence:
 * for every answer branch in the schema that leads to another question or to a
 * terminal outcome, the corresponding .mmd master must have SOME path (not
 * necessarily a single hop — see role.mmd's role-label nodes) from that question's
 * node cluster to the required destination.
 *
 * check-coverage.mjs answers "does a node exist for every question?" This answers
 * "do the arrows actually go where the schema says they must?" — the gap that let
 * risk.mmd carry 3 real logic bugs (missing Q7B/Q15B/Q22B) while check-coverage.mjs
 * reported it clean, because those bugs are about *destinations*, not *presence*.
 *
 * Scope: risk, role, identification (+ its 3 subset sub-charts) — the schema-backed
 * charts. `obligations` has no declarative source (a fixed 3-question form whose
 * outcome text is chosen by ~15-20 imperative switch/if/ternary branches in
 * ObligationsQuestionnaire.tsx) and is intentionally NOT covered here; a heuristic
 * that scraped its i18n keys and checked they appear in the chart would compare an
 * implementation detail against deliberately-condensed chart labels — noise, not
 * signal. `nta`/`nta-*` are out of scope too (untouched by this feature).
 *
 * What this does NOT catch (by design — see SKILL.md):
 *   - wrong/misleading text on an otherwise-correct edge (labels are never compared)
 *   - extra chart edges the schema doesn't require
 *   - a coincidentally-reachable path that isn't really "the same logic"
 *   - exact terminal IDENTITY for role/identification (existence-only there — see
 *     TERMINAL_MAP below)
 *
 * Run:  npx --yes tsx .claude/skills/export-questionnaire-flowcharts/check-logic.mjs [chart...]
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { REPO, loadSchema, chartEdges, QUESTION_SOURCE } from "./flowchart-shared.mjs";

// Charts this checker applies to. identification-ai/-algo/-sadm reuse identification's
// required-edge set (same source schema) but, like check-coverage.mjs's SUBSET_OK,
// silently skip a required edge whose endpoints aren't even nodes in that sub-chart —
// showing a deliberate subset is not drift.
export const LOGIC_CHARTS = ["risk", "role", "identification", "identification-ai", "identification-algo", "identification-sadm"];

// ── per-chart config: how to resolve output-definition names and semantic (non-numeric
// ui:id) fields to chart node ids. Hand-maintained because neither mapping is a
// mechanical string transform (outputForbidden -> FORB, not FORBIDDEN) and some charts'
// terminals are genuinely ambiguous at the schema level (role's q13block routes both
// "In use" and "In development" through the same generic outputResult; identification's
// chart nodes are legitimately many-to-one against ~15-20 output definitions). Where a
// chart has no entries, terminal checks fall back to "reaches *some* sink node" (weak).
const TERMINAL_MAP = {
  risk: {
    outputLow: "LOW", outputHigh: "HIGH", outputHighSecA: "HIGHSECA", outputHighSecB: "HIGHSECB",
    outputForbidden: "FORB", outputHighExcept: "HIGHEXCEPT", outputForbiddenExcept: "FORBEXCEPT",
  },
  role: {}, // q13block's both branches share outputResult; q12's natural-person branch too — weak-only
  identification: {}, // many-to-one against chart terminals; TODO precise map, fast-follow
};
// key = "<definitionNameOrRoot>.<fieldKey>" (checked first) or bare "<fieldKey>" (fallback).
const SEMANTIC_NODE_MAP = {
  risk: { "exceptionHigh.exceptions": "EXCH", "exceptionForbidden.exceptions": "EXCF" },
  role: {},
  identification: { "root.intro": "START" },
};

const defsFor = (schema) => schema.JSONSchema.definitions || {};
const uiSchemaFor = (schema) => schema.uiSchema || {};

const refName = (ref) => {
  const m = typeof ref === "string" && ref.match(/^#\/definitions\/(\w+)$/);
  return m ? m[1] : null;
};

// Identity for skip-self-loop purposes: a "question" target's true identity is its full
// ui:id STRING, not just the leading number — "q22" and "q22 follow-up" both carry
// number 22 but are different fields, and this exact case (a numbered field's follow-up
// sharing its number) is what produced 3 of the 5 real bugs found this session
// (Q7/"q7 exceptions", Q15/"q15 cer", Q22/"q22 follow-up"). Collapsing on number alone
// silently turns "field -> its own follow-up" into a false self-loop and drops the
// required edge entirely — caught by the regression test before this was fixed.
const questionKey = (t) =>
  t ? `${t.kind}:${t.kind === "question" ? t.uiId : t.kind === "semantic" ? t.id : t.defName}` : null;
const sameTarget = (a, b) => questionKey(a) === questionKey(b);
// True only when two question-targets share a cluster number but are genuinely
// different fields — the chart-side check for these must require a *lettered* node
// (Q22B, never bare Q22) since the bare numbered node is the source, not a valid answer.
const isWithinClusterEdge = (from, to) =>
  from?.kind === "question" && to?.kind === "question" && from.n === to.n && from.uiId !== to.uiId;

function resolveTarget(chart, key, val, uiSchema, contextName) {
  if (key === "output") {
    const def = refName(val?.$ref);
    return def ? { kind: "terminal", defName: def } : null;
  }
  const semanticMap = SEMANTIC_NODE_MAP[chart] || {};
  const semanticId = semanticMap[`${contextName}.${key}`] ?? semanticMap[key];
  if (semanticId) return { kind: "semantic", id: semanticId };
  const uiId = uiSchema[key]?.["ui:id"];
  // Free-text elaboration fields (ui:widget "textarea") are supplementary detail
  // attached to whatever branch required them, not a further decision point — they
  // never carry their own `dependencies` (nothing to branch on) and don't correspond to
  // a distinct chart screen. Without this filter, identification's ".1"-suffixed
  // explanation fields (ui:id "q1.1", "q2.1", ... — literally "please describe your
  // answer" boxes) collapse onto their parent's cluster number via the same
  // /^q(\d+)/ match and get flagged as a missing required chart node, which they are
  // not. Confirmed against identification-factory.ts: q1_option6 -> ui:id "q1.1",
  // ui:widget "textarea".
  if (uiSchema[key]?.["ui:widget"] === "textarea") return null;
  if (typeof uiId === "string") {
    const trimmed = uiId.trim().toLowerCase();
    const m = trimmed.match(/^q(\d+)/);
    if (m) return { kind: "question", n: +m[1], uiId: trimmed };
  }
  if (val?.$ref) {
    const def = refName(val.$ref);
    if (def) return { kind: "pass", defName: def };
  }
  return null;
}

// Recursively walks one schema "node" (an object that may carry properties/dependencies/
// allOf — the root JSONSchema, a definitions.<Name> object, or an inline then/branch
// object). incomingOwner is the {kind,...} target that reaching THIS node required;
// edges are recorded FROM incomingOwner. Returns the node's own resulting owner (the
// last ui:id-bearing field its properties introduced, or incomingOwner unchanged), so a
// caller processing a sequential allOf array can thread it into later sibling items —
// this is what correctly attributes e.g. infra's per-domain branches to Q13 rather than
// leaving them attributed to Q11 (the field introduced earlier in the same allOf array).
//
// `registry` is a single Map shared across the *entire* walk (not scoped per call): a
// container's own `dependencies` object frequently lists a field as a flat SIBLING key
// to the branch that actually introduces it, rather than nesting the dependency inside
// that branch — e.g. risk's biometrics definition declares "III.1.2"'s dependencies
// (Q7's own follow-up) as a sibling of "5.h.verify" (Q6), not nested inside Q6's oneOf
// branch that introduces the III.1.2 field. Without a walk-wide registry, "III.1.2"'s
// owner falls back to whatever the *enclosing* node's own owner was (Q4, the biometrics
// gate) instead of Q6/Q7 — silently misattributing the requirement and dropping the
// real Q7->Q7B edge. The registry is populated as soon as any field is discovered
// anywhere in the walk and is looked up (by field name) whenever a later sibling
// `dependencies` entry needs to know who owns it.
function walkNode(chart, node, incomingOwner, uiSchema, defs, edges, contextName, visited, registry) {
  if (!node || typeof node !== "object") return incomingOwner;
  let currentOwner = incomingOwner;

  if (node.properties) {
    for (const [key, val] of Object.entries(node.properties)) {
      const target = resolveTarget(chart, key, val, uiSchema, contextName);
      if (target) registry.set(key, target);
      if (!target) continue;
      if (target.kind === "terminal") {
        if (incomingOwner) edges.add(JSON.stringify({ from: incomingOwner, to: target }));
        continue;
      }
      if (target.kind === "pass") {
        // Structural wrapper with no screen identity of its own (e.g. role's
        // q13block/q12bblock, or risk's "infra" grouping) — recurse without recording
        // an edge or moving the owner; whatever THAT definition's properties introduce
        // will attribute back to the current owner instead.
        const visitKey = `${target.defName}@${questionKey(currentOwner)}`;
        if (!visited.has(visitKey) && defs[target.defName]) {
          visited.add(visitKey);
          currentOwner = walkNode(chart, defs[target.defName], currentOwner, uiSchema, defs, edges, target.defName, visited, registry);
        }
        continue;
      }
      // Real next-question or semantic-screen target.
      if (incomingOwner && !sameTarget(incomingOwner, target)) {
        edges.add(JSON.stringify({ from: incomingOwner, to: target }));
      }
      currentOwner = target;
      if (val?.$ref) {
        const def = refName(val.$ref);
        const visitKey = `${def}@${questionKey(target)}`;
        if (def && !visited.has(visitKey) && defs[def]) {
          visited.add(visitKey);
          currentOwner = walkNode(chart, defs[def], target, uiSchema, defs, edges, def, visited, registry);
        }
      }
    }
  }

  if (node.dependencies) {
    for (const [depKey, depBlock] of Object.entries(node.dependencies)) {
      const registered = registry.get(depKey);
      const depOwner = registered && registered.kind !== "pass" ? registered : currentOwner;
      if (depBlock.oneOf) {
        for (const branch of depBlock.oneOf) {
          walkNode(chart, branch, depOwner, uiSchema, defs, edges, contextName, visited, registry);
        }
      } else {
        walkNode(chart, depBlock, depOwner, uiSchema, defs, edges, contextName, visited, registry);
      }
    }
  }

  if (node.allOf) {
    for (const item of node.allOf) {
      if (item.if && item.then) {
        walkNode(chart, item.then, currentOwner, uiSchema, defs, edges, contextName, visited, registry);
        if (item.else) walkNode(chart, item.else, currentOwner, uiSchema, defs, edges, contextName, visited, registry);
      } else {
        currentOwner = walkNode(chart, item, currentOwner, uiSchema, defs, edges, contextName, visited, registry);
      }
    }
  }

  return currentOwner;
}

// Builds the required-edges set for a schema: { from, to } pairs, both as
// {kind:'question',n} | {kind:'semantic',id} | {kind:'terminal',defName}.
export function requiredEdges(chart, schema) {
  const uiSchema = uiSchemaFor(schema);
  const defs = defsFor(schema);
  const edges = new Set();
  walkNode(chart, schema.JSONSchema, null, uiSchema, defs, edges, "root", new Set(), new Map());
  return [...edges].map((s) => JSON.parse(s));
}

// ── chart-side: bounded BFS reachability from a question-cluster's nodes ─────────────
const clusterNodes = (allNodeIds, n) => allNodeIds.filter((id) => new RegExp(`^Q${n}(\\D|$)`).test(id));

function matchesTarget(nodeId, target, adjacency, terminalMap, requireLettered) {
  if (target.kind === "question") {
    // Within-cluster edges (e.g. Q22's own follow-up "q22 follow-up") must land on a
    // *lettered* node distinct from the bare numbered node — the bare node is the
    // source, never a valid distinct answer to itself.
    const re = requireLettered ? new RegExp(`^Q${target.n}\\D`) : new RegExp(`^Q${target.n}(\\D|$)`);
    return re.test(nodeId);
  }
  if (target.kind === "semantic") return nodeId === target.id;
  // terminal
  const mapped = terminalMap[target.defName];
  if (mapped) return nodeId === mapped;
  return !adjacency.has(nodeId); // weak: any sink node counts as "reached a terminal"
}

const MAX_HOPS = 6;
function bfsReaches(startIds, target, adjacency, terminalMap, requireLettered) {
  let frontier = new Set(startIds);
  const seen = new Set(startIds);
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    for (const id of frontier) if (matchesTarget(id, target, adjacency, terminalMap, requireLettered)) return true;
    const next = new Set();
    for (const id of frontier) for (const dst of adjacency.get(id) || []) if (!seen.has(dst)) { seen.add(dst); next.add(dst); }
    frontier = next;
    if (!frontier.size) break;
  }
  return false;
}

const describeTarget = (t) =>
  t.kind === "question" ? `Q${t.n} (ui:id "${t.uiId}")` : t.kind === "semantic" ? t.id : `terminal(${t.defName})`;

export async function checkChartLogic({ chart, lang, mmdPath }) {
  const findings = [];
  const src = QUESTION_SOURCE[chart]; // sub-charts (identification-ai/-algo/-sadm) reuse identification's schema
  if (!LOGIC_CHARTS.includes(chart) || !src) return { ok: true, findings };
  if (!existsSync(mmdPath)) return { ok: true, findings }; // missing master is check-coverage.mjs's job

  const schema = await loadSchema(chart, lang);
  if (!schema) return { ok: true, findings };
  const required = requiredEdges(src, schema);

  const mmd = readFileSync(mmdPath, "utf8");
  const edges = chartEdges(mmd);
  const allNodeIds = [...new Set(edges.flatMap((e) => [e.src, e.dst]))];
  const adjacency = new Map();
  for (const e of edges) {
    if (!adjacency.has(e.src)) adjacency.set(e.src, []);
    adjacency.get(e.src).push(e.dst);
  }
  const terminalMap = TERMINAL_MAP[src] || {};

  for (const { from, to } of required) {
    if (from.kind === "question" && !allNodeIds.some((id) => new RegExp(`^Q${from.n}(\\D|$)`).test(id))) continue; // subset chart, not this question's concern
    if (to.kind === "question" && !allNodeIds.some((id) => new RegExp(`^Q${to.n}(\\D|$)`).test(id))) continue; // subset chart
    const withinCluster = isWithinClusterEdge(from, to);
    // Within-cluster: start strictly from the bare numbered node, not the whole cluster —
    // otherwise an unrelated (e.g. disconnected/mis-wired) lettered node already sitting
    // in the cluster would trivially satisfy its own requirement at hop 0.
    const startIds = from.kind === "question"
      ? (withinCluster ? allNodeIds.filter((id) => id === `Q${from.n}`) : clusterNodes(allNodeIds, from.n))
      : allNodeIds.filter((id) => id === from.id);
    if (!startIds.length) continue; // source not present — check-coverage.mjs's job to flag
    if (!bfsReaches(startIds, to, adjacency, terminalMap, withinCluster)) {
      findings.push(`${describeTarget(from)} has no path to required ${describeTarget(to)} (schema: ${chart})`);
    }
  }

  return { ok: findings.length === 0, findings };
}

// ── standalone CLI ─────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv.slice(2);
  const charts = only.length ? LOGIC_CHARTS.filter((c) => only.includes(c)) : LOGIC_CHARTS;
  const SRC = join(REPO, "flowcharts/src");
  let problems = 0;
  for (const lang of ["en", "nl"]) {
    console.log(`\n── ${lang} ──`);
    for (const chart of charts) {
      const mmdPath = join(SRC, lang, `${chart}.mmd`);
      const { ok, findings } = await checkChartLogic({ chart, lang, mmdPath });
      if (!ok) { problems += findings.length; findings.forEach((f) => console.error(`  ${chart}: ${f}`)); }
      else console.log(`  ${chart}: ok`);
    }
  }
  console.log("\nobligations: not logic-checked (no declarative source) — verify by hand.");
  console.log(problems ? `\n${problems} issue(s) — review before exporting.` : "\nAll logic-checked charts match their schemas.");
  process.exit(problems ? 1 : 0);
}
