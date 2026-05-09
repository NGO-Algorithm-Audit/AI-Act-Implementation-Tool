import { Alert, Button } from "react-bootstrap";
import { FormProps } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { aiActItems } from "../data/questionnaireConfig";
import ObligationsSection from "./ObligationsSection";
import NextStepsSection from "./NextStepsSection";
import RolesOverviewSection from "./RolesOverviewSection";
import { useSettings } from "../context/SettingsContext";

type RiskOutcome = "low" | "high" | "forbidden" | "highExcept" | "forbiddenExcept";

const OUTCOME_BADGES: Record<RiskOutcome, { key: string; color: string }[]> = {
  low:             [{ key: "badge riskcat low",       color: "var(--cma-risk-low)" }],
  high:            [{ key: "badge riskcat high",      color: "var(--cma-risk-high)" }],
  forbidden:       [{ key: "badge riskcat forbidden", color: "#dc3545" }],
  highExcept:      [{ key: "badge riskcat high",      color: "var(--cma-risk-high)" }, { key: "badge riskcat exception", color: "var(--cma-text-muted)" }],
  forbiddenExcept: [{ key: "badge riskcat forbidden", color: "#dc3545" }, { key: "badge riskcat exception", color: "var(--cma-text-muted)" }],
};

const FALLBACK_BADGE_COLOR = "var(--cma-source-legal)";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "var(--cma-primary-700)" }}
    >
      <path d="M4 6l4 4 4-4" stroke="var(--cma-primary-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionSubsection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--cma-primary-600)", paddingBottom: "8px", paddingTop: "8px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", width: "100%" }}
        aria-expanded={open}
      >
        <ChevronIcon open={open} />
        <small style={{ color: "var(--cma-primary-700)", fontWeight: "bold" }}>{label}</small>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

type TriggeredBadge = { label: string; color: string; url?: string };
type TriggeredQuestion = {
  fieldKey: string;
  questionId?: string;
  answer: string;
  summary?: string;
  badges: TriggeredBadge[];
};

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return String(value);
}

function resolveSummary(ui: Record<string, any>, answer: string): string | undefined {
  const raw = ui["ui:id-summary"];
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") return raw[answer];
  return undefined;
}

function collectTriggeredQuestions(
  data: Record<string, unknown>,
  uiSchema: UiSchema | undefined
): TriggeredQuestion[] {
  if (!uiSchema) return [];
  const result: TriggeredQuestion[] = [];

  for (const key of Object.keys(data)) {
    if (key === "intro" || key.startsWith("output") || key === "additionalOutputText") continue;
    const value = (data as Record<string, unknown>)[key];
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;

    const ui = (uiSchema as Record<string, any>)[key];
    if (!ui) continue;

    const answer = formatAnswer(value);
    const summary = resolveSummary(ui, answer);
    let mainLabel = ui["ui:id-badge-label"] as string | undefined;
    const overrides = ui["ui:id-badge-label-overrides"] as { label?: string; answers?: string[] }[] | undefined;
    if (Array.isArray(overrides)) {
      for (const o of overrides) {
        if (o?.label && Array.isArray(o.answers) && o.answers.includes(answer)) {
          mainLabel = o.label;
          break;
        }
      }
    }
    const mainUrl = ui["ui:id-link"] as string | undefined;
    const questionId = ui["ui:id"] as string | undefined;

    const badges: TriggeredBadge[] = [];
    const seenInQuestion = new Set<string>();

    const pushBadge = (label?: string, color?: string, url?: string) => {
      if (!label || seenInQuestion.has(label)) return;
      seenInQuestion.add(label);
      badges.push({ label, color: color ?? FALLBACK_BADGE_COLOR, url });
    };

    // 6.1 — profiling question. Only the main "Art. 6(3)" badge is relevant
    // for classification; the contextual Profiling badge is suppressed. When
    // the answer is "No", the question is transitional so nothing is shown.
    if (key === "6.1") {
      if (value === "Yes" || value === "Ja") pushBadge(mainLabel, FALLBACK_BADGE_COLOR, mainUrl);
    } else {
      pushBadge(mainLabel, FALLBACK_BADGE_COLOR, mainUrl);
      const extras = ui["ui:badges"] as { label?: string; color?: string; url?: string }[] | undefined;
      if (Array.isArray(extras)) {
        for (const b of extras) pushBadge(b?.label, b?.color, b?.url);
      }
    }

    if (badges.length === 0) continue;
    result.push({ fieldKey: key, questionId, answer, summary, badges });
  }
  return result;
}

const ROLE_BADGES: Record<string, { key: string; color: string }> = {
  aanbieder:                  { key: "aiact2 summary role provider",    color: "var(--cma-role-provider)" },
  gebruiksverantwoordelijke:  { key: "aiact2 summary role deployer",    color: "var(--cma-role-deployer)" },
  importeur:                  { key: "aiact2 summary role importer",    color: "var(--cma-role-importer)" },
  distributeur:               { key: "aiact2 summary role distributor", color: "var(--cma-role-distributor)" },
};

export default function OutputRiskClassification({
  id,
  type,
  output,
  step,
  handlePrev,
  onSubmit,
  onStartQuestionnaire,
  onJumpToField,
  data,
  uiSchema,
  questionnaireName,
  aiAct2Roles,
}: {
  id: string;
  type: "output" | "error";
  output: Record<string, string>;
  step: number;
  handlePrev: () => void;
  onSubmit: (
    index: string,
    data: FormProps<any, RJSFSchema, any>["formData"]
  ) => void;
  onStartQuestionnaire?: (key: string) => void;
  onJumpToField?: (fieldKey: string) => void;
  data: FormProps<any, RJSFSchema, any>["schema"];
  uiSchema?: UiSchema;
  questionnaireName?: string;
  aiAct2Roles?: string[] | null;
}) {
  const { t } = useTranslation();
  const { hideSourceBadges } = useSettings();

  const outcome = (output?.riskOutcome as RiskOutcome | undefined) ?? "low";
  const annexIArt6Branch = (output?.annexIArt6Branch as "A" | "B" | undefined) ?? undefined;
  const baseBadges = OUTCOME_BADGES[outcome] ?? OUTCOME_BADGES.low;
  const outcomeMainBadge = baseBadges[0];
  const exceptionBadge = baseBadges.find((b) => b.key === "badge riskcat exception");

  const triggered = collectTriggeredQuestions(data, uiSchema);

  const art50Selections = Array.isArray((data as any)?.art50) ? ((data as any).art50 as string[]) : [];
  const hasArt50Scenario = art50Selections.some(
    (v) => v !== "None of the above" && v !== "Geen van de bovenstaande"
  );

  const rolesItem = aiActItems.find((i) => i.startKey === "AI2");
  const knownRoleBadges = (aiAct2Roles ?? [])
    .map((r) => ROLE_BADGES[r])
    .filter(Boolean) as { key: string; color: string }[];

  const exportData = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) => !key.startsWith("output") && key !== "intro"
    )
  );

  return (
    <div className="d-flex flex-column gap-3" style={{ padding: "1rem" }}>
      <div>
        <h5 className="mb-0 fw-bold mt-1" style={{ color: "var(--cma-primary-700)" }}>{output?.title}</h5>
        <hr className="mt-2 mb-0" />
      </div>

      <div>
        <h6 className="mb-1 mt-3 fw-bold" style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result category label")}</h6>
        <div style={{ fontSize: "0.95rem" }}>
          <span
            className="badge badge-secondary"
            style={{ backgroundColor: outcomeMainBadge.color, fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff", verticalAlign: "middle" }}
          >
            {t(outcomeMainBadge.key)}
          </span>{" "}
          <span
            className="badge badge-secondary"
            style={{ backgroundColor: "var(--cma-cat-ai-system)", fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff", verticalAlign: "middle" }}
          >
            {t("badge ai system")}
          </span>
          {hasArt50Scenario && (
            <>
              {" "}
              <span
                className="badge badge-secondary"
                style={{ backgroundColor: "var(--cma-cat-genai)", fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff", verticalAlign: "middle" }}
              >
                {t("badge genai")}
              </span>
            </>
          )}
          {exceptionBadge && (
            <>
              {", "}{t("riskcat result but exception prefix")}{" "}
              <span
                className="badge badge-secondary"
                style={{ backgroundColor: exceptionBadge.color, fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff", verticalAlign: "middle" }}
              >
                {t(exceptionBadge.key)}
              </span>{" "}
              {t("riskcat result might apply suffix")}
            </>
          )}
        </div>
        {triggered.length > 0 && (
          <div className="mt-2">
            <AccordionSubsection label={t("riskcat result triggered by")}>
              <div className="mt-2" style={{ fontSize: "0.9rem" }}>{t("riskcat result because")}</div>
              <ul className="mt-1 mb-2 ps-3" style={{ fontSize: "0.9rem" }}>
                {[...triggered].reverse().map((q, i) => {
                  const renderBadge = (b: TriggeredBadge, key: number) => {
                    const badgeStyle: React.CSSProperties = {
                      backgroundColor: b.color,
                      color: "#fff",
                      fontSize: "0.85rem",
                      padding: "3.2px 5.12px",
                      textDecoration: "none",
                      marginRight: "4px",
                    };
                    return b.url ? (
                      <a key={key} href={b.url} target="_blank" rel="noopener noreferrer" className="badge badge-secondary" style={badgeStyle}>
                        {b.label}
                      </a>
                    ) : (
                      <span key={key} className="badge badge-secondary" style={badgeStyle}>
                        {b.label}
                      </span>
                    );
                  };
                  const displayAnswer = q.summary ?? q.answer;
                  const displayQuestionId = q.questionId?.replace(/^q/, "Q");
                  const idSuffix = displayQuestionId
                    ? (questionnaireName ? `${questionnaireName} ${displayQuestionId}` : displayQuestionId)
                    : null;
                  const jumpable = !!(idSuffix && q.fieldKey && onJumpToField);
                  const idStyle: React.CSSProperties = {
                    fontSize: "0.8rem",
                    padding: "2.5px 5px",
                    cursor: jumpable ? "pointer" : "default",
                    textDecoration: "none",
                  };
                  const idBadge = idSuffix ? (
                    jumpable ? (
                      <span
                        role="button"
                        tabIndex={0}
                        className="badge badge-secondary ms-2"
                        style={idStyle}
                        onClick={() => onJumpToField!(q.fieldKey)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onJumpToField!(q.fieldKey);
                          }
                        }}
                      >
                        id: {idSuffix}
                      </span>
                    ) : (
                      <span className="badge badge-secondary ms-2" style={idStyle}>
                        id: {idSuffix}
                      </span>
                    )
                  ) : null;
                  const answerText = displayAnswer ? displayAnswer.replace(/\.+\s*$/, "") : "";
                  return (
                    <li key={i} className="mb-2">
                      {answerText && <span>{answerText}. </span>}
                      {idBadge && (
                        <>
                          <span style={{ marginRight: "6px" }}>{t("riskcat result see prefix")}</span>
                          {idBadge}
                          <span>. </span>
                        </>
                      )}
                      {!hideSourceBadges && q.badges.length > 0 && (
                        <>
                          <span style={{ marginRight: "6px" }}>{t("riskcat result more info prefix")}</span>
                          {q.badges.map((b, j) => renderBadge(b, j))}
                        </>
                      )}
                      <span>.</span>
                    </li>
                  );
                })}
              </ul>
              {(outcome === "forbidden" || outcome === "forbiddenExcept") && (
                <p className="mt-2 mb-1 ps-0" style={{ fontSize: "0.9rem" }}>
                  {t("riskcat result prohibited guidelines prefix")}{" "}
                  <a href="https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-prohibited-artificial-intelligence-ai-practices-defined-ai-act" target="_blank" rel="noopener noreferrer">
                    {t("riskcat result prohibited guidelines link")}
                  </a>
                  {", "}{t("riskcat result prohibited guidelines suffix")}
                </p>
              )}
            </AccordionSubsection>
          </div>
        )}
      </div>

      <div>
        <h6 className="mb-1 mt-3 fw-bold" style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result role label")}</h6>
        <div style={{ fontSize: "0.95rem" }}>
          {knownRoleBadges.length > 0 ? (
            knownRoleBadges.map(({ key, color }, i) => (
              <span key={key} style={{ marginLeft: i === 0 ? 0 : "4px" }}>
                <span
                  className="badge badge-secondary"
                  style={{ backgroundColor: color, fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff", verticalAlign: "middle" }}
                >
                  {t(key)}
                </span>
              </span>
            ))
          ) : rolesItem ? (
            (() => {
              const available = !!(rolesItem.startKey && onStartQuestionnaire);
              return (
                <>
                  <span style={{ marginRight: "8px" }}>{t("riskcat result fill in first")}</span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: available ? "var(--cma-primary-600)" : "var(--cma-text-muted)",
                      color: "#fff",
                      cursor: available ? "pointer" : "default",
                      fontSize: "0.85rem",
                      padding: "3.2px 5.12px",
                      verticalAlign: "middle",
                    }}
                    onClick={available ? () => onStartQuestionnaire!(rolesItem.startKey!) : undefined}
                  >
                    {t(rolesItem.nameKey)}
                  </span>
                </>
              );
            })()
          ) : null}
        </div>
      </div>

      {outcome === "low" && (
        <>
          <div>
            <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary-700)" }}>{t("aiact2 result provider continue label")}</h6>
            <div style={{ borderTop: "1px solid var(--cma-primary-600)", paddingTop: "8px", fontSize: "0.9rem" }}>
              <p className="mb-0">
                {t("riskcat result low next steps")}
              </p>
            </div>
          </div>
          <div>
            <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary-700)" }}>{t("aiact2 result next steps title")}</h6>
            <div style={{ borderTop: "1px solid var(--cma-primary-600)", paddingTop: "8px", fontSize: "0.9rem" }}>
              <p className="mb-0">
                {t("riskcat result low obligations")}
              </p>
            </div>
          </div>
        </>
      )}

      {knownRoleBadges.length > 0 && (outcome === "high" || outcome === "highExcept") && (
        <>
          <NextStepsSection roles={aiAct2Roles ?? []} onStartQuestionnaire={onStartQuestionnaire} annexIArt6Branch={annexIArt6Branch} />
          <ObligationsSection roles={aiAct2Roles ?? []} annexIArt6Branch={annexIArt6Branch} />
        </>
      )}

      {knownRoleBadges.length > 0 && (outcome === "forbidden" || outcome === "forbiddenExcept") && (() => {
        const roles = aiAct2Roles ?? [];
        const isProvider = roles.includes("aanbieder");
        const isDeployer = roles.includes("gebruiksverantwoordelijke");
        if (!isProvider && !isDeployer) return null;
        const nextStepsKey = isProvider
          ? "riskcat result prohibited next steps provider"
          : "riskcat result prohibited next steps deployer";
        return (
          <>
            <div>
              <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary-700)" }}>{t("aiact2 result provider continue label")}</h6>
              <div style={{ borderTop: "1px solid var(--cma-primary-600)", paddingTop: "8px", fontSize: "0.9rem" }}>
                <p className="mb-0">{t(nextStepsKey)}</p>
              </div>
            </div>
            <div>
              <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary-700)" }}>{t("aiact2 result next steps title")}</h6>
              <div style={{ borderTop: "1px solid var(--cma-primary-600)", paddingTop: "8px", fontSize: "0.9rem" }}>
                <p className="mb-0">{t("riskcat result prohibited obligation")}</p>
              </div>
            </div>
          </>
        );
      })()}

      <RolesOverviewSection />

      {type === "output" && (
        <Alert variant="warning" className="mt-4 mb-2">
          <small>{t("disclaimer")}</small>
        </Alert>
      )}

      <div>
        <div style={{ display: "inline-block", marginTop: "8px", marginBottom: "4px" }}>
          <span className="badge badge-secondary">id: {questionnaireName ? `${questionnaireName} ` : ""}results</span>
        </div>
        <div className="d-flex flex-row justify-content-between flex-row-reverse">
          <Button onClick={() => onSubmit(id, exportData)} variant="primary" type="submit">
            {t("aiact2 result save")}
          </Button>
          {step > 0 && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handlePrev}
              style={{ marginRight: "8px" }}
            >
              {t("back")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
