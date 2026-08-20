/* Code-derived charts: Role and status (from src/utils/roleStatus.ts logic) and
 * Obligations (from ObligationsQuestionnaire.tsx risk→role mapping). No JSON schema
 * exists for Obligations, so both are built from the app's decision logic + i18n. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve as pathResolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = pathResolve(__dirname, "../../..");

interface GNode { id: string; label: string; cls: string; shape: "rect" | "round"; }
interface GEdge { from: string; to: string; label: string; }
interface Graph { nodes: Map<string, GNode>; edges: GEdge[]; }
const g = (): Graph => ({ nodes: new Map(), edges: [] });
const esc = (s: string) => String(s).replace(/"/g, "&quot;").replace(/#/g, "&#35;");
function wrap(text: string, width = 30): string {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > width) { if (cur) lines.push(cur); cur = w; } else cur = (cur ? cur + " " : "") + w; }
  if (cur) lines.push(cur);
  return lines.map(esc).join("<br/>");
}
const node = (G: Graph, id: string, label: string, cls: string, shape: "rect" | "round" = "rect") => {
  if (!G.nodes.has(id)) G.nodes.set(id, { id, label, cls, shape });
};

const loadT = (lang: string): ((k: string) => string) => {
  const res = JSON.parse(readFileSync(pathResolve(REPO, `src/i18n/${lang}/translation.json`), "utf8"));
  return (k: string) => res[k] ?? k;
};

// ── Role and status ─────────────────────────────────────────────────────────
// Q12 answer key → role terminal (mirrors Q12_MAP in roleStatus.ts).
const ROLE_TERMS: Record<string, { id: string; cls: string; en: string; nl: string }> = {
  a3: { id: "R_pd", cls: "cat_pd", en: "Provider + Deployer", nl: "Aanbieder + Gebruiksverantwoordelijke" },
  a1: { id: "R_prov", cls: "cat_provider", en: "Provider", nl: "Aanbieder" },
  a2: { id: "R_pd", cls: "cat_pd", en: "Provider + Deployer", nl: "Aanbieder + Gebruiksverantwoordelijke" },
  a7: { id: "R_imp", cls: "cat_importer", en: "Importer", nl: "Importeur" },
  a8: { id: "R_dist", cls: "cat_distrib", en: "Distributor", nl: "Distributeur" },
  a11: { id: "R_rep", cls: "cat_repr", en: "Authorised representative", nl: "Gemachtigde" },
  a10: { id: "R_priv", cls: "cat_private", en: "Private user", nl: "Privégebruiker" },
};
const Q12_KEYS = ["a3", "a1", "a2", "a6", "a7", "a8", "a11", "a10"];

export function buildRoleGraph(_roleSchema: any, lang: "en" | "nl"): Graph {
  const t = loadT(lang);
  const G = g();
  const L = (en: string, nl: string) => (lang === "en" ? en : nl);

  node(G, "Q12", `<b>${L("Q1", "V1")}</b><br/>${wrap(L("How is the AI system developed or deployed?", "Hoe wordt het AI-systeem ontwikkeld of ingezet?"))}`, "Q");
  node(G, "Q13", `<b>${L("Q3 · Status", "V3 · Status")}</b><br/>${wrap(L("Is the AI system already in use?", "Is het AI-systeem al in gebruik?"))}`, "Q");
  node(G, "R_inuse", L("In use", "In gebruik"), "cat_inuse");
  node(G, "R_indev", L("In development", "In ontwikkeling"), "cat_indev");

  for (const k of Q12_KEYS) {
    const opt = t(`aiact2 q12 ${k}`);
    if (k === "a6") {
      // externally developed → modification question (q12b): m4 stays deployer, else provider
      node(G, "Q12b", `<b>${L("Q2", "V2")}</b><br/>${wrap(L("Do you modify the externally developed AI system?", "Wijzig je het extern ontwikkelde AI-systeem?"))}`, "Q");
      G.edges.push({ from: "Q12", to: "Q12b", label: opt });
      for (const m of ["m1", "m2", "m3", "m4"]) {
        const target = m === "m4" ? "R_dep" : "R_prov";
        node(G, "R_prov", L("Provider", "Aanbieder"), "cat_provider");
        node(G, "R_dep", L("Deployer", "Gebruiksverantwoordelijke"), "cat_deployer");
        G.edges.push({ from: "Q12b", to: target, label: t(`aiact2 q12b ${m}`) });
      }
      continue;
    }
    const term = ROLE_TERMS[k];
    node(G, term.id, L(term.en, term.nl), term.cls);
    G.edges.push({ from: "Q12", to: term.id, label: opt });
  }

  // every role except "private" then asks the status question (q13)
  for (const rid of ["R_pd", "R_prov", "R_dep", "R_imp", "R_dist", "R_rep"]) {
    if (G.nodes.has(rid)) G.edges.push({ from: rid, to: "Q13", label: "" });
  }
  G.edges.push({ from: "Q13", to: "R_inuse", label: t("aiact2 q13 a1") });
  G.edges.push({ from: "Q13", to: "R_indev", label: t("aiact2 q13 a2") });
  for (const e of G.edges) if (e.label) e.label = wrap(e.label, 26);
  return G;
}

// ── Obligations (risk × role → obligation set) ──────────────────────────────
// Simplified from ObligationsQuestionnaire.tsx: riskOutcome → risk key(s), then
// per role the applicable obligation set. High-level structural view.
export function buildObligationsGraph(lang: "en" | "nl"): Graph {
  const t = loadT(lang);
  const G = g();
  const L = (en: string, nl: string) => (lang === "en" ? en : nl);

  node(G, "START", L("Risk category", "Risicocategorie"), "Q", "round");

  // risk category nodes
  node(G, "FORB", t("badge riskcat forbidden") || L("Prohibited", "Verboden"), "cat_forb");
  node(G, "HIGH", t("badge riskcat high") || L("High-risk", "Hoog risico"), "cat_high");
  node(G, "GENAI", t("badge genai") || L("GPAI / transparency", "GPAI / transparantie"), "cat_genai");
  G.edges.push({ from: "START", to: "FORB", label: L("Prohibited", "Verboden") });
  G.edges.push({ from: "START", to: "HIGH", label: L("High-risk", "Hoog risico") });
  G.edges.push({ from: "START", to: "GENAI", label: L("GPAI / limited", "GPAI / beperkt") });

  // prohibited → single obligation
  node(G, "O_FORB", wrap(L("May not be developed, placed on the market or used (Art. 5).", "Mag niet worden ontwikkeld, in de handel gebracht of gebruikt (art. 5).")), "oblig_forb");
  G.edges.push({ from: "FORB", to: "O_FORB", label: "" });

  // high-risk & genai → split by role
  node(G, "ROLE_P", t("aiact2 summary role provider") ? L("Provider", "Aanbieder") : L("Provider", "Aanbieder"), "role_prov");
  node(G, "ROLE_D", L("Deployer", "Gebruiksverantwoordelijke"), "role_dep");
  G.edges.push({ from: "HIGH", to: "ROLE_P", label: L("as provider", "als aanbieder") });
  G.edges.push({ from: "HIGH", to: "ROLE_D", label: L("as deployer", "als gebruiksverantwoordelijke") });

  node(G, "O_HIGH_P", wrap(L("Risk & quality management, data governance, technical documentation, conformity assessment, CE marking, registration (Ch. III S.2-3).", "Risico- en kwaliteitsbeheer, datagovernance, technische documentatie, conformiteitsbeoordeling, CE-markering, registratie (hfd. III afd. 2-3).")), "oblig_high");
  node(G, "O_HIGH_D", wrap(L("Use per instructions, human oversight, monitoring, logging, inform affected persons (Art. 26-27).", "Gebruik volgens instructies, menselijk toezicht, monitoring, logging, betrokkenen informeren (art. 26-27).")), "oblig_high");
  G.edges.push({ from: "ROLE_P", to: "O_HIGH_P", label: "" });
  G.edges.push({ from: "ROLE_D", to: "O_HIGH_D", label: "" });

  node(G, "O_GENAI", wrap(L("Transparency duties: disclose AI interaction & mark AI-generated content (Art. 50).", "Transparantieverplichtingen: AI-interactie kenbaar maken en AI-gegenereerde content markeren (art. 50).")), "oblig_genai");
  G.edges.push({ from: "GENAI", to: "O_GENAI", label: "" });

  for (const e of G.edges) if (e.label) e.label = wrap(e.label, 26);
  return G;
}
