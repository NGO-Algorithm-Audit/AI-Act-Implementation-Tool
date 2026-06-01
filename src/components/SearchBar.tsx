import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { aiActItems } from "../data/questionnaireConfig";
import { enTranslations } from "../schemas/en/translations";
import { nlTranslations } from "../schemas/nl/translations";
import enRiskSchema from "../schemas/en/riskclassification.json";
import nlRiskSchema from "../schemas/nl/risicoclassificatie.json";
import enI18n from "../i18n/en/translation.json";
import nlI18n from "../i18n/nl/translation.json";

// Adapted from ClassifyMyAI's SearchBar (see /Users/jurriaan/Github
// repos/ClassifyMyAI/src/components/SearchBar.tsx). Stripped of the
// dashboard-entry branch and MetaData questionnaire (neither exists in this
// repo) and collapsed the multi-group questionnaire dispatch down to the
// single onStartQuestionnaire(key) callback this app already exposes.

type SearchKind = "questionnaire" | "question" | "badge";

type SearchResult = {
  id: string;
  kind: SearchKind;
  label: string;
  context: string;
  score: number;
  payload: { startKey?: string; questionnaire?: string; fieldKey?: string; url?: string };
};

function rankMatch(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (!h.includes(n)) return 0;
  if (h.startsWith(n)) return 100;
  const wb = new RegExp(`\\b${n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}`);
  if (wb.test(h)) return 50;
  return 10;
}

type IndexedText = {
  text: string;
  fieldKind: "title" | "option" | "description" | "badge";
  questionId: string;
  propertyKey: string;
};

function stripMarkdown(s: string): string {
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
}

function formatQuestionId(uiId: string | undefined, fallback: string): string {
  const raw = uiId ?? fallback;
  return raw.replace(/^q/, "Q");
}

function walkSchemaForIndex(
  properties: Record<string, unknown> | undefined,
  uiIdMap: Record<string, string>,
  contextId: string,
  contextPropertyKey: string,
  out: IndexedText[],
): void {
  if (!properties) return;
  for (const [propKey, val] of Object.entries(properties)) {
    if (!val || typeof val !== "object") continue;
    const node = val as Record<string, unknown>;
    const hasUiId = uiIdMap[propKey] !== undefined;
    const localId = hasUiId ? uiIdMap[propKey] : contextId;
    const localPropertyKey = hasUiId ? propKey : (contextPropertyKey || propKey);
    const questionId = formatQuestionId(localId || propKey, propKey);

    if (typeof node.title === "string" && node.title.trim().length > 4) {
      out.push({ text: node.title, fieldKind: "title", questionId, propertyKey: localPropertyKey });
    }
    if (typeof node.description === "string" && node.description.trim().length > 4) {
      out.push({ text: node.description, fieldKind: "description", questionId, propertyKey: localPropertyKey });
    }
    const itemsEnum = (node.items as { enum?: unknown } | undefined)?.enum;
    const enumCandidates = Array.isArray(node.enum)
      ? node.enum
      : Array.isArray(itemsEnum)
      ? itemsEnum
      : null;
    if (enumCandidates) {
      enumCandidates.forEach((opt) => {
        if (typeof opt === "string" && opt.trim().length > 1) {
          out.push({ text: stripMarkdown(opt), fieldKind: "option", questionId, propertyKey: localPropertyKey });
        }
      });
    }
    if (node.properties) {
      walkSchemaForIndex(node.properties as Record<string, unknown>, uiIdMap, localId, localPropertyKey, out);
    }
    if (node.dependencies && typeof node.dependencies === "object") {
      for (const dep of Object.values(node.dependencies as Record<string, unknown>)) {
        if (!dep || typeof dep !== "object") continue;
        const oneOf = (dep as { oneOf?: unknown[] }).oneOf;
        if (Array.isArray(oneOf)) {
          oneOf.forEach((branch) => {
            if (branch && typeof branch === "object") {
              walkSchemaForIndex(
                (branch as { properties?: Record<string, unknown> }).properties,
                uiIdMap, localId, localPropertyKey, out,
              );
            }
          });
        }
        const allOf = (dep as { allOf?: unknown[] }).allOf;
        if (Array.isArray(allOf)) {
          allOf.forEach((branch) => {
            if (branch && typeof branch === "object") {
              walkSchemaForIndex(
                (branch as { then?: { properties?: Record<string, unknown> } }).then?.properties,
                uiIdMap, localId, localPropertyKey, out,
              );
            }
          });
        }
      }
    }
    if (Array.isArray(node.allOf)) {
      node.allOf.forEach((branch) => {
        if (branch && typeof branch === "object") {
          walkSchemaForIndex(
            (branch as { then?: { properties?: Record<string, unknown> } }).then?.properties,
            uiIdMap, localId, localPropertyKey, out,
          );
        }
      });
    }
  }
}

function walkContainerDependencies(
  container: { dependencies?: unknown; allOf?: unknown[] } | undefined,
  uiIdMap: Record<string, string>,
  out: IndexedText[],
): void {
  if (!container) return;
  if (container.dependencies && typeof container.dependencies === "object") {
    for (const dep of Object.values(container.dependencies as Record<string, unknown>)) {
      if (!dep || typeof dep !== "object") continue;
      const oneOf = (dep as { oneOf?: unknown[] }).oneOf;
      if (Array.isArray(oneOf)) {
        oneOf.forEach((branch) => {
          if (branch && typeof branch === "object") {
            walkSchemaForIndex(
              (branch as { properties?: Record<string, unknown> }).properties,
              uiIdMap, "", "", out,
            );
          }
        });
      }
      const allOfDep = (dep as { allOf?: unknown[] }).allOf;
      if (Array.isArray(allOfDep)) {
        allOfDep.forEach((branch) => {
          if (branch && typeof branch === "object") {
            walkSchemaForIndex(
              (branch as { then?: { properties?: Record<string, unknown> } }).then?.properties,
              uiIdMap, "", "", out,
            );
          }
        });
      }
    }
  }
  if (Array.isArray(container.allOf)) {
    container.allOf.forEach((branch) => {
      if (branch && typeof branch === "object") {
        walkSchemaForIndex(
          (branch as { then?: { properties?: Record<string, unknown> } }).then?.properties,
          uiIdMap, "", "", out,
        );
      }
    });
  }
}

function buildRiskCategoryIndex(lang: string): IndexedText[] {
  const schema = lang === "nl" ? nlRiskSchema : enRiskSchema;
  const root = (schema as {
    JSONSchema?: {
      properties?: Record<string, unknown>;
      definitions?: Record<string, unknown>;
      dependencies?: unknown;
      allOf?: unknown[];
    };
    uiSchema?: Record<string, { "ui:id"?: string }>;
  });
  const out: IndexedText[] = [];
  if (!root.JSONSchema) return out;

  const uiIdMap: Record<string, string> = {};
  if (root.uiSchema) {
    for (const [propKey, ui] of Object.entries(root.uiSchema)) {
      if (ui && typeof ui === "object" && typeof ui["ui:id"] === "string") {
        uiIdMap[propKey] = ui["ui:id"];
      }
    }
  }

  walkSchemaForIndex(root.JSONSchema.properties, uiIdMap, "", "", out);
  walkContainerDependencies(root.JSONSchema, uiIdMap, out);
  if (root.JSONSchema.definitions) {
    for (const def of Object.values(root.JSONSchema.definitions)) {
      if (def && typeof def === "object") {
        walkSchemaForIndex(
          (def as { properties?: Record<string, unknown> }).properties,
          uiIdMap, "", "", out,
        );
        walkContainerDependencies(def as { dependencies?: unknown; allOf?: unknown[] }, uiIdMap, out);
      }
    }
  }

  // Per-question badges (the chips shown at the bottom of each screen, plus
  // the question's primary article/annex label) — attribute them to the
  // owning question so e.g. searching "Profiling" surfaces Q33 (the question
  // where Profiling is a badge), not only the external GDPR link.
  const fullUiSchema = (root.uiSchema ?? {}) as Record<string, Record<string, unknown>>;
  for (const [propKey, ui] of Object.entries(fullUiSchema)) {
    if (!ui || typeof ui !== "object") continue;
    const uiId = ui["ui:id"];
    if (typeof uiId !== "string" || !uiId) continue;
    const qid = formatQuestionId(uiId, propKey);
    const badges = ui["ui:badges"];
    if (Array.isArray(badges)) {
      for (const b of badges) {
        if (
          b && typeof b === "object" &&
          typeof (b as { label?: unknown }).label === "string" &&
          (b as { label: string }).label.trim().length > 1
        ) {
          out.push({
            text: (b as { label: string }).label,
            fieldKind: "badge",
            questionId: qid,
            propertyKey: propKey,
          });
        }
      }
    }
    const primaryLabel = ui["ui:id-badge-label"];
    if (typeof primaryLabel === "string" && primaryLabel.trim().length > 1) {
      out.push({ text: primaryLabel, fieldKind: "badge", questionId: qid, propertyKey: propKey });
    }
  }
  return out;
}

function buildIdentificationIndex(lang: string): IndexedText[] {
  const tr = (lang === "nl" ? nlTranslations : enTranslations) as unknown as Record<string, unknown>;
  const out: IndexedText[] = [];
  for (const [key, val] of Object.entries(tr)) {
    const titleMatch = key.match(/^(q\d+(?:_\d+|b)?)Title(?:Generic)?$/);
    if (titleMatch && typeof val === "string") {
      const propertyKey = titleMatch[1];
      out.push({ text: val, fieldKind: "title", questionId: formatQuestionId(propertyKey, propertyKey), propertyKey });
      continue;
    }
    const descMatch = key.match(/^(q\d+(?:_\d+|b)?)(Description|EnumTooltips|EnumDescriptions|FormalRefTitle|OtherDescription|SymbolicDescription|NoDescription)$/);
    if (descMatch && val) {
      const propertyKey = descMatch[1];
      const qid = formatQuestionId(propertyKey, propertyKey);
      if (typeof val === "string") {
        out.push({ text: val, fieldKind: "description", questionId: qid, propertyKey });
      } else if (Array.isArray(val)) {
        (val as unknown[]).forEach((v) => {
          if (typeof v === "string" && v.trim().length > 4) {
            out.push({ text: v, fieldKind: "description", questionId: qid, propertyKey });
          }
        });
      }
      continue;
    }
    const optionsMatch = key.match(/^(q\d+(?:_\d+|b)?)Options$/);
    if (optionsMatch && val && typeof val === "object") {
      const propertyKey = optionsMatch[1];
      const qid = formatQuestionId(propertyKey, propertyKey);
      for (const opt of Object.values(val as Record<string, unknown>)) {
        if (typeof opt === "string" && opt.trim().length > 1) {
          out.push({ text: opt, fieldKind: "option", questionId: qid, propertyKey });
        }
      }
      continue;
    }
    // Badges shown at the bottom of a question screen (e.g. "Profiling",
    // "High-impact algorithm") should make the question itself searchable —
    // not just the external article/recital link in the global badge index.
    const badgesMatch = key.match(/^(q\d+(?:_\d+|b)?)Badges$/);
    if (badgesMatch && Array.isArray(val)) {
      const propertyKey = badgesMatch[1];
      const qid = formatQuestionId(propertyKey, propertyKey);
      for (const b of val as unknown[]) {
        if (
          b && typeof b === "object" &&
          typeof (b as { label?: unknown }).label === "string" &&
          (b as { label: string }).label.trim().length > 1
        ) {
          out.push({
            text: (b as { label: string }).label,
            fieldKind: "badge",
            questionId: qid,
            propertyKey,
          });
        }
      }
    }
  }
  return out;
}

const ROLE_AND_STATUS_QUESTION_IDS = ["q12", "q12b", "q13"];

type IndexedBadge = { label: string; url: string };

const ARABIC_TO_ROMAN: Record<string, string> = { "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V", "6": "VI", "7": "VII", "8": "VIII", "9": "IX" };

function canonicalBadgeFromUrl(url: string, lang: "en" | "nl"): string | null {
  const m = url.match(/\/(article|annex|recital)-(\w+)/);
  if (!m) return null;
  const kind = m[1];
  const num = m[2];
  if (kind === "article") {
    return lang === "nl" ? `Artikel ${num} AI-verordening` : `Article ${num} AI Act`;
  }
  if (kind === "recital") {
    return lang === "nl" ? `Overweging ${num} AI-verordening` : `Recital ${num} AI Act`;
  }
  if (kind === "annex") {
    const roman = ARABIC_TO_ROMAN[num] ?? num.toUpperCase();
    return lang === "nl" ? `Bijlage ${roman} AI-verordening` : `Annex ${roman} AI Act`;
  }
  return null;
}

function buildBadgeIndex(lang: string): IndexedBadge[] {
  const out: IndexedBadge[] = [];

  const riskSchema = (lang === "nl" ? nlRiskSchema : enRiskSchema) as {
    uiSchema?: Record<string, Record<string, unknown>>;
  };
  if (riskSchema.uiSchema) {
    for (const ui of Object.values(riskSchema.uiSchema)) {
      if (!ui || typeof ui !== "object") continue;
      const primaryLabel = ui["ui:id-badge-label"];
      const primaryUrl = ui["ui:id-link"];
      if (typeof primaryLabel === "string" && typeof primaryUrl === "string") {
        out.push({ label: primaryLabel, url: primaryUrl });
      }
      const badges = ui["ui:badges"];
      if (Array.isArray(badges)) {
        for (const b of badges) {
          if (b && typeof b === "object" && typeof (b as { label?: unknown }).label === "string" && typeof (b as { url?: unknown }).url === "string") {
            out.push({ label: (b as { label: string }).label, url: (b as { url: string }).url });
          }
        }
      }
    }
  }

  const tr = (lang === "nl" ? nlTranslations : enTranslations) as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(tr)) {
    if (/Badges$/.test(k) && Array.isArray(v)) {
      for (const b of v) {
        if (b && typeof b === "object" && typeof (b as { label?: unknown }).label === "string" && typeof (b as { url?: unknown }).url === "string") {
          out.push({ label: (b as { label: string }).label, url: (b as { url: string }).url });
        }
      }
    }
  }

  const i18nBundle = (lang === "nl" ? nlI18n : enI18n) as Record<string, string>;
  for (const k of Object.keys(i18nBundle)) {
    const m = k.match(/^article (.+) label$/);
    if (!m) continue;
    const urlKey = `article ${m[1]} url`;
    const label = i18nBundle[k];
    const url = i18nBundle[urlKey];
    if (typeof label === "string" && typeof url === "string" && label.trim() && url.trim()) {
      out.push({ label, url });
    }
  }

  const byUrl = new Map<string, IndexedBadge>();
  for (const b of out) {
    const existing = byUrl.get(b.url);
    if (!existing || b.label.length < existing.label.length) {
      byUrl.set(b.url, b);
    }
  }
  const lng: "en" | "nl" = lang === "nl" ? "nl" : "en";
  return Array.from(byUrl.values()).map((b) => {
    const canonical = canonicalBadgeFromUrl(b.url, lng);
    return canonical ? { label: canonical, url: b.url } : b;
  });
}

function buildRoleAndStatusIndex(t: (k: string) => string): IndexedText[] {
  const out: IndexedText[] = [];
  ROLE_AND_STATUS_QUESTION_IDS.forEach((qid) => {
    const display = formatQuestionId(qid, qid);
    const titleKey = `aiact2 ${qid} title`;
    const titleVal = t(titleKey);
    if (titleVal && titleVal !== titleKey) {
      out.push({ text: titleVal, fieldKind: "title", questionId: display, propertyKey: qid });
    }
    const prefixes = [`aiact2 ${qid} a`, `aiact2 ${qid} m`];
    for (const prefix of prefixes) {
      for (let i = 1; i <= 12; i++) {
        const k = `${prefix}${i}`;
        const v = t(k);
        if (v && v !== k && v.trim().length > 1) {
          out.push({ text: v, fieldKind: "option", questionId: display, propertyKey: qid });
        }
      }
    }
    const descKey = `aiact2 ${qid} description`;
    const descVal = t(descKey);
    if (descVal && descVal !== descKey) {
      out.push({ text: descVal, fieldKind: "description", questionId: display, propertyKey: qid });
    }
    const explKey = `aiact2 ${qid} explanation`;
    const explVal = t(explKey);
    if (explVal && explVal !== explKey) {
      out.push({ text: explVal, fieldKind: "description", questionId: display, propertyKey: qid });
    }
  });
  return out;
}

// Index the Obligations menu's "hidden" content: the per-role obligation
// steps shown only after a role/status/risk combination is selected. Each
// role section becomes one searchable blob whose display label is its
// heading (e.g. "Obligations for provider of a high-risk AI system:").
function buildObligationsIndex(lang: string): { heading: string; text: string }[] {
  const bundle = (lang === "nl" ? nlI18n : enI18n) as Record<string, string>;
  const out: { heading: string; text: string }[] = [];
  for (const role of ["provider", "deployer", "importer", "distributor"]) {
    const heading = bundle[`aiact2 result ${role} heading`];
    if (typeof heading !== "string" || !heading.trim()) continue;
    const parts: string[] = [heading];
    const stepRe = new RegExp(`^aiact2 result ${role} step`);
    for (const [k, v] of Object.entries(bundle)) {
      if (typeof v === "string" && v.trim() && stepRe.test(k)) parts.push(v);
    }
    out.push({ heading, text: parts.join(" — ") });
  }
  return out;
}

export default function SearchBar({
  onStartQuestionnaire,
}: {
  onStartQuestionnaire?: (key: string, fieldKey?: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lang = i18n.language?.startsWith("nl") ? "nl" : "en";

  const questionIndex = useMemo(() => {
    const items: {
      id: string;
      questionnaire: string;
      questionId: string;
      text: string;
      fieldKind: IndexedText["fieldKind"];
      startKey: "IDENT" | "AI1" | "AI2";
      propertyKey: string;
    }[] = [];

    buildIdentificationIndex(lang).forEach((q, i) =>
      items.push({
        id: `ident-${q.questionId}-${q.fieldKind}-${i}`,
        questionnaire: t("questionnaire 1 name"),
        questionId: q.questionId,
        text: q.text,
        fieldKind: q.fieldKind,
        startKey: "IDENT",
        propertyKey: q.propertyKey,
      }),
    );
    buildRoleAndStatusIndex(t).forEach((q, i) =>
      items.push({
        id: `aiact2-${q.questionId}-${q.fieldKind}-${i}`,
        questionnaire: t("questionnaire 3 name"),
        questionId: q.questionId,
        text: q.text,
        fieldKind: q.fieldKind,
        startKey: "AI2",
        propertyKey: q.propertyKey,
      }),
    );
    buildRiskCategoryIndex(lang).forEach((q, i) =>
      items.push({
        id: `riskcat-${q.questionId}-${q.fieldKind}-${i}`,
        questionnaire: t("questionnaire 2 name"),
        questionId: q.questionId,
        text: q.text,
        fieldKind: q.fieldKind,
        startKey: "AI1",
        propertyKey: q.propertyKey,
      }),
    );
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.questionnaire}|${item.questionId}|${item.fieldKind}|${item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [lang, t]);

  const badgeIndex = useMemo(() => buildBadgeIndex(lang), [lang]);

  const obligationsIndex = useMemo(() => buildObligationsIndex(lang), [lang]);

  const allQuestionnaireItems = useMemo(() => {
    return aiActItems.map((item) => ({ item }));
  }, []);

  const results: SearchResult[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const matched: SearchResult[] = [];

    allQuestionnaireItems.forEach(({ item }) => {
      const name = t(item.nameKey);
      const title = t(item.titleKey);
      const score = Math.max(rankMatch(title, q), rankMatch(name, q));
      if (score > 0) {
        matched.push({
          id: `q-${item.nameKey}`,
          kind: "questionnaire",
          label: title && title !== item.titleKey ? title : name,
          context: name,
          score,
          payload: { startKey: item.startKey ?? undefined },
        });
      }
    });

    badgeIndex.forEach((b, i) => {
      const score = rankMatch(b.label, q);
      if (score > 0) {
        matched.push({
          id: `badge-${i}-${b.url}`,
          kind: "badge",
          label: b.label,
          context: t("search badge external"),
          score,
          payload: { url: b.url },
        });
      }
    });

    questionIndex.forEach((qi) => {
      const score = rankMatch(qi.text, q);
      if (score > 0) {
        const fieldLabel =
          qi.fieldKind === "option" ? t("search field option") :
          qi.fieldKind === "description" ? t("search field description") :
          qi.fieldKind === "badge" ? t("search field badge") :
          t("search field title");
        const idPart = qi.questionId
          ? `id: ${qi.questionnaire} ${qi.questionId}`
          : `id: ${qi.questionnaire}`;
        matched.push({
          id: qi.id,
          kind: "question",
          label: qi.text,
          context: `${idPart} · ${fieldLabel}`,
          score,
          payload: { startKey: qi.startKey, questionnaire: qi.questionnaire, fieldKey: qi.propertyKey },
        });
      }
    });

    obligationsIndex.forEach((o, i) => {
      const score = rankMatch(o.text, q);
      if (score > 0) {
        matched.push({
          id: `obl-${i}`,
          kind: "question",
          label: o.heading,
          context: `id: ${t("questionnaire 4 name")} menu`,
          score,
          payload: { startKey: "OBL" },
        });
      }
    });

    return matched;
  }, [query, allQuestionnaireItems, questionIndex, badgeIndex, obligationsIndex, t]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function dispatchResult(r: SearchResult) {
    setOpen(false);
    setQuery("");
    if ((r.kind === "questionnaire" || r.kind === "question") && r.payload.startKey) {
      onStartQuestionnaire?.(r.payload.startKey, r.payload.fieldKey);
      return;
    }
    if (r.kind === "badge" && r.payload.url) {
      window.open(r.payload.url, "_blank", "noopener,noreferrer");
    }
  }

  const grouped = useMemo(() => {
    const byKind: Record<SearchKind, SearchResult[]> = { questionnaire: [], question: [], badge: [] };
    results.forEach((r) => byKind[r.kind].push(r));
    (Object.keys(byKind) as SearchKind[]).forEach((k) => {
      byKind[k].sort((a, b) => b.score - a.score || a.label.length - b.label.length);
    });
    return byKind;
  }, [results]);

  const showPanel = open && query.trim().length >= 2;
  const totalMatches = results.length;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        border: "1px solid var(--cma-primary)",
        borderRadius: "6px",
        backgroundColor: "#fff",
        marginBottom: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "6px 12px", gap: "8px" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="var(--cma-primary)" strokeWidth="1.5" />
          <line x1="11" y1="11" x2="14" y2="14" stroke="var(--cma-primary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
          placeholder={t("search placeholder")}
          aria-label={t("search placeholder")}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "0.9rem",
            backgroundColor: "transparent",
            color: "#000",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setOpen(false); }}
            aria-label={t("search clear")}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--cma-text-muted)", fontSize: "1rem", lineHeight: 1, padding: "0 4px" }}
          >
            ×
          </button>
        )}
      </div>

      {showPanel && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "#fff",
            border: "1px solid var(--cma-primary)",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 1000,
            maxHeight: "360px",
            overflowY: "auto",
          }}
        >
          {totalMatches === 0 ? (
            <div style={{ padding: "10px 12px", color: "var(--cma-text-muted)", fontSize: "0.875rem" }}>
              {t("search no results")}
            </div>
          ) : (
            <>
              {(["questionnaire", "question", "badge"] as SearchKind[]).map((kind) => {
                const items = grouped[kind];
                if (items.length === 0) return null;
                const headerKey =
                  kind === "questionnaire" ? "search group questionnaires" :
                  kind === "badge" ? "search group badges" :
                  "search group questions";
                return (
                  <div key={kind}>
                    <div
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "var(--cma-primary-50)",
                        color: "var(--cma-primary)",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {t(headerKey)} <span style={{ fontWeight: "normal", color: "var(--cma-text-muted)" }}>({items.length})</span>
                    </div>
                    {items.slice(0, 6).map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => dispatchResult(r)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          color: "#000",
                          borderBottom: "1px solid #f1f3f5",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div style={{ fontWeight: 500 }}>{r.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--cma-text-muted)" }}>{r.context}</div>
                      </button>
                    ))}
                    {items.length > 6 && (
                      <div style={{ padding: "4px 12px", fontSize: "0.75rem", color: "var(--cma-text-muted)" }}>
                        {t("search more results", { count: items.length - 6 })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
