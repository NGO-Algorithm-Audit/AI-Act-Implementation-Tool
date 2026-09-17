import { useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { FormProps } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import CodeBlock from "./CodeBlock";
import a11yLight from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-light";
import { dictionaryToCsv } from "../utils/dictionaryToCsv";
import AccordionSection from "./AccordionSection";
import Art50ObligationsAccordions from "./Art50ObligationsAccordions";
import { resolveArt50Applicable, type Art50Applicable, type Art50Status } from "./ObligationsQuestionnaire";

// Result screen for the optional Art. 50 detail questionnaire
// (src/schemas/art50/{en,nl}/art50.json), mirroring the shape of
// OutputRiskClassification.tsx (Result heading, category + badges, "Why this
// classification?" accordion, an obligations section, Export results,
// disclaimer, id badge) but — unlike that component, which independently
// duplicates the Art. 50 obligation text — this one reuses
// Art50ObligationsAccordions directly, since that is the whole point of
// having a shared, exemption-aware renderer.

// `values` lists both the English and Dutch scenario text, since `data.scenarios`
// holds whichever language the user's schema used (mirrors the same bilingual
// matching used in ObligationsQuestionnaire.tsx's resolveArt50Applicable) — this
// component previously matched English text only, so badges silently never
// appeared for Dutch-language submissions.
const SCENARIO_META: {
  values: string[];
  badgeKey: string;
  applicableKey: keyof Art50Applicable;
  articleLabelKey: string;
  articleUrlKey: string;
}[] = [
  {
    values: [
      "It interacts directly with natural persons.",
      "Het interageert rechtstreeks met natuurlijke personen.",
    ],
    badgeKey: "art50 result badge interactive",
    applicableKey: "interactive",
    articleLabelKey: "article art50_1 label",
    articleUrlKey: "article art50_1 url",
  },
  {
    values: [
      "It generates or manipulates synthetic audio, image, video or text content.",
      "Het genereert of manipuleert synthetische audio-, beeld-, video- of tekstinhoud.",
    ],
    badgeKey: "art50 result badge synthetic",
    applicableKey: "synthetic",
    articleLabelKey: "article art50_2 label",
    articleUrlKey: "article art50_2 url",
  },
  {
    values: [
      "It recognises emotions or categorises persons based on biometric data.",
      "Het herkent emoties of categoriseert personen op basis van biometrische gegevens.",
    ],
    badgeKey: "art50 result badge biometric",
    applicableKey: "biometric",
    articleLabelKey: "article art50_3 label",
    articleUrlKey: "article art50_3 url",
  },
  {
    values: [
      "It generates or manipulates image, audio or video content that resembles real people, objects, places or events (a deep fake).",
      "Het genereert of manipuleert beeld-, audio- of video-inhoud die lijkt op bestaande personen, objecten, plaatsen of gebeurtenissen (een deepfake).",
    ],
    badgeKey: "art50 result badge deepfake",
    applicableKey: "deepfake",
    articleLabelKey: "article art50_4 label",
    articleUrlKey: "article art50_4 url",
  },
  {
    values: [
      "It generates or manipulates text published to inform the public on matters of public interest.",
      "Het genereert of manipuleert tekst die wordt gepubliceerd om het publiek te informeren over aangelegenheden van algemeen belang.",
    ],
    badgeKey: "art50 result badge publicinteresttext",
    applicableKey: "publicInterestText",
    articleLabelKey: "article art50_4pit label",
    articleUrlKey: "article art50_4pit url",
  },
];

// Mirrors OutputRiskClassification.tsx's "High-risk, AI system, but an
// Exception might apply" pattern: the scenario keeps its normal badge colour,
// and — only when an exception/attenuated regime was resolved — a second,
// distinctly-coloured badge is appended with connecting text, exactly as on
// the Risk-category result screen.
const SECONDARY_BADGE: Partial<
  Record<Art50Status, { prefixKey: string; labelKey: string; suffixKey: string; color: string }>
> = {
  exempt: {
    prefixKey: "riskcat result but exception prefix",
    labelKey: "badge riskcat exception",
    suffixKey: "riskcat result might apply suffix",
    color: "var(--cma-text-muted)",
  },
  attenuated: {
    prefixKey: "art50 result but attenuated prefix",
    labelKey: "art50 result attenuated badge",
    suffixKey: "art50 result attenuated applies suffix",
    color: "#fd7e14",
  },
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "var(--cma-primary)" }}
    >
      <path d="M4 6l4 4 4-4" stroke="var(--cma-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionSubsection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--cma-primary)", paddingBottom: "8px", paddingTop: "8px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", width: "100%" }}
        aria-expanded={open}
      >
        <ChevronIcon open={open} />
        <small style={{ color: "var(--cma-primary)", fontWeight: "bold" }}>{label}</small>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

// Provider/deployer can be held simultaneously — matches the toggle rule
// already used for the equivalent role chips in ObligationsQuestionnaire.tsx.
const ROLE_OPTIONS: { key: string; labelKey: string; color: string }[] = [
  { key: "aanbieder", labelKey: "aiact2 summary role provider", color: "var(--cma-role-provider)" },
  { key: "gebruiksverantwoordelijke", labelKey: "aiact2 summary role deployer", color: "var(--cma-role-deployer)" },
];

function RoleChip({
  label,
  color,
  selected,
  onClick,
}: {
  label: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="badge"
      style={{
        backgroundColor: selected ? color : "transparent",
        color: selected ? "#fff" : "var(--cma-text-muted)",
        border: `1px solid ${selected ? color : "var(--cma-border-strong)"}`,
        cursor: "pointer",
        fontSize: "0.85rem",
        padding: "5px 8px",
        marginRight: "6px",
        marginBottom: "6px",
        verticalAlign: "middle",
      }}
    >
      {label}
    </span>
  );
}

function CitationBadge({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
      <span
        className="badge"
        style={{ backgroundColor: "var(--cma-source-legal)", color: "#fff", fontSize: "0.85rem", padding: "3.2px 5.12px" }}
      >
        {label}
      </span>
    </a>
  );
}

type OutputProps = {
  id: string;
  type: "output" | "error";
  output: Record<string, any>;
  step: number;
  handlePrev: () => void;
  onSubmit: (index: string, data: FormProps<any, RJSFSchema, any>["formData"]) => void;
  onStartQuestionnaire?: (key: string) => void;
  data: FormProps<any, RJSFSchema, any>["schema"];
  uiSchema?: UiSchema;
  aiAct2Roles?: string[] | null;
};

export default function OutputArt50Detail({
  id,
  type,
  output,
  step,
  handlePrev,
  onSubmit,
  data,
  uiSchema,
  aiAct2Roles,
}: OutputProps) {
  const { t } = useTranslation();

  // Role is normally known from the Role-and-status questionnaire (aiAct2Roles,
  // already Dutch-keyed) but that questionnaire may not have been completed —
  // let the user pick Provider/Deployer directly here so the obligations below
  // reflect it immediately, without having to leave this screen.
  const [selectedRoles, setSelectedRoles] = useState<string[]>(aiAct2Roles ?? []);
  const toggleRole = (key: string) =>
    setSelectedRoles((prev) => (prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]));

  const scenarios: unknown[] = Array.isArray((data as Record<string, unknown>)?.scenarios)
    ? ((data as Record<string, unknown>).scenarios as unknown[])
    : [];
  const selectedMeta = SCENARIO_META.filter((m) => m.values.some((v) => scenarios.includes(v)));
  const art50Applicable = resolveArt50Applicable(data as Record<string, unknown>);

  // Raw export payload, and a re-keyed human-readable copy for CSV/JSON —
  // same house pattern as the other three Output components.
  const exportData = Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter(([key]) => !key.startsWith("output") && key !== "intro")
  );
  const exportDisplayData = Object.fromEntries(
    Object.entries(exportData).map(([key, value]) => {
      const uiId = (uiSchema as Record<string, any> | undefined)?.[key]?.["ui:id"];
      return [typeof uiId === "string" ? uiId : key, value];
    })
  );

  return (
    <div className="d-flex flex-column gap-3" style={{ padding: "1rem" }}>
      <div>
        <h5 className="mb-0 fw-bold mt-1" style={{ color: "var(--cma-primary)" }}>
          {output?.title}
        </h5>
        <hr className="mt-2 mb-0" />
      </div>

      <div>
        <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary)" }}>
          {t("art50 result category label")}
        </h6>
        <div style={{ borderTop: "1px solid var(--cma-primary)", paddingTop: "8px" }}>
          {selectedMeta.length === 0 ? (
            <p className="mb-0" style={{ fontSize: "0.9rem" }}>{t("art50 result no scenario")}</p>
          ) : (
            <div className="mb-2" style={{ fontSize: "0.95rem" }}>
              {selectedMeta.map((m) => {
                const status = art50Applicable?.[m.applicableKey];
                const secondary = status ? SECONDARY_BADGE[status] : undefined;
                return (
                  <div key={m.applicableKey} className="mb-1">
                    <span
                      className="badge badge-secondary"
                      style={{ backgroundColor: "var(--cma-cat-genai)", color: "#fff", fontSize: "0.85rem", padding: "3.2px 5.12px", verticalAlign: "middle" }}
                    >
                      {t(m.badgeKey)}
                    </span>
                    {secondary && (
                      <>
                        {", "}
                        {t(secondary.prefixKey)}{" "}
                        <span
                          className="badge badge-secondary"
                          style={{ backgroundColor: secondary.color, color: "#fff", fontSize: "0.85rem", padding: "3.2px 5.12px", verticalAlign: "middle" }}
                        >
                          {t(secondary.labelKey)}
                        </span>{" "}
                        {t(secondary.suffixKey)}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {selectedMeta.length > 0 && (
            <AccordionSubsection label={t("riskcat result triggered by")}>
              <p className="mb-2" style={{ fontSize: "0.9rem" }}>{t("riskcat result because")}</p>
              <ul className="mb-0 ps-3" style={{ fontSize: "0.9rem" }}>
                {selectedMeta.map((m) => (
                  <li key={m.applicableKey} className="mb-1">
                    {t(m.badgeKey)} <CitationBadge label={t(m.articleLabelKey)} url={t(m.articleUrlKey)} />
                  </li>
                ))}
              </ul>
            </AccordionSubsection>
          )}
        </div>
      </div>

      {selectedMeta.length > 0 && (
        <div>
          <h5 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary)" }}>
            {t("questionnaire 4 name")}
          </h5>
          <div style={{ borderTop: "1px solid var(--cma-primary)", paddingTop: "8px" }}>
            <p className="mb-2" style={{ fontSize: "0.9rem" }}>
              <span style={{ marginRight: "8px" }}>{t("art50 result role prompt")}</span>
              {ROLE_OPTIONS.map((r) => (
                <RoleChip
                  key={r.key}
                  label={t(r.labelKey)}
                  color={r.color}
                  selected={selectedRoles.includes(r.key)}
                  onClick={() => toggleRole(r.key)}
                />
              ))}
            </p>
            <Art50ObligationsAccordions roles={selectedRoles} applicable={art50Applicable} />
          </div>
        </div>
      )}

      {type === "output" && (
        <div style={{ marginTop: "1rem" }}>
          <AccordionSection label={t("export results")} noBorder>
            <p className="mb-2">{t("save output")}</p>
            <CodeBlock
              style={a11yLight}
              code={dictionaryToCsv(exportDisplayData as unknown as Record<string, string | number>)}
              language={"typescript"}
              title={"CSV"}
              wrapLongLines={false}
            />
            <CodeBlock
              style={a11yLight}
              code={JSON.stringify(exportDisplayData, null, 2)}
              language={"json"}
              title="JSON"
              wrapLongLines={false}
            />
          </AccordionSection>
          <Alert variant="warning" className="my-2">
            <small>{t("disclaimer")}</small>
          </Alert>
        </div>
      )}

      <div>
        <div style={{ display: "inline-block", marginTop: "8px", marginBottom: "4px" }}>
          <span className="badge badge-secondary">id: {t("questionnaire art50 name")} results</span>
        </div>
        <div className="d-flex flex-row justify-content-between flex-row-reverse">
          <Button onClick={() => onSubmit(id, exportData)} variant="primary" type="submit">
            {t("done")}
          </Button>
          {step > 0 && (
            <Button type="button" variant="outline-secondary" onClick={handlePrev} style={{ marginRight: "8px" }}>
              {t("back")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
