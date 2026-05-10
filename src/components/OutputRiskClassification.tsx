import { Alert, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
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

    // 6.1 – profiling question. Only the main "Art. 6(3)" badge is relevant
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
  const isArt50Interactive = art50Selections.some(
    (v) =>
      v === "It interacts directly with natural persons." ||
      v === "Het interageert rechtstreeks met natuurlijke personen."
  );
  const isArt50Generative = art50Selections.some(
    (v) =>
      v === "It generates synthetic audio, image, video or text content." ||
      v === "Het genereert synthetische audio-, beeld-, video- of tekstinhoud."
  );
  const isArt50EmotionBiometric = art50Selections.some(
    (v) =>
      v === "It recognises emotions or categorises persons based on biometric data." ||
      v === "Het herkent emoties of categoriseert personen op basis van biometrische gegevens."
  );
  const isArt50PublicInterest = art50Selections.some(
    (v) =>
      v === "It generates or manipulates image, audio, video or public-interest text content." ||
      v === "Het genereert of manipuleert beeld-, audio-, video- of tekstinhoud van algemeen belang."
  );
  const hasProviderRole = (aiAct2Roles ?? []).includes("aanbieder");
  const hasDeployerRole = (aiAct2Roles ?? []).includes("gebruiksverantwoordelijke");
  const isArt50InteractiveProvider = isArt50Interactive && hasProviderRole;
  const isArt50InteractiveDeployer = isArt50Interactive && hasDeployerRole;
  const isArt50GenerativeProvider = isArt50Generative && hasProviderRole;
  const isArt50GenerativeDeployer = isArt50Generative && hasDeployerRole;
  const isArt50EmotionBiometricDeployer = isArt50EmotionBiometric && hasDeployerRole;
  const isArt50EmotionBiometricProvider = isArt50EmotionBiometric && hasProviderRole;
  const isArt50PublicInterestDeployer = isArt50PublicInterest && hasDeployerRole;
  const showAnyArt50Block =
    isArt50InteractiveProvider ||
    isArt50InteractiveDeployer ||
    isArt50GenerativeProvider ||
    isArt50GenerativeDeployer ||
    isArt50EmotionBiometricDeployer ||
    isArt50EmotionBiometricProvider ||
    isArt50PublicInterestDeployer;

  const countDistinctArt50Options = [
    isArt50InteractiveProvider || isArt50InteractiveDeployer,
    isArt50GenerativeProvider || isArt50GenerativeDeployer,
    isArt50EmotionBiometricProvider || isArt50EmotionBiometricDeployer,
    isArt50PublicInterestDeployer,
  ].filter(Boolean).length;
  const isUnifiedArt50 = countDistinctArt50Options >= 2;

  const art50Clauses: string[] = [];
  if (isArt50InteractiveProvider || isArt50InteractiveDeployer) art50Clauses.push(t("riskcat result art50_1 clause"));
  if (isArt50GenerativeProvider || isArt50GenerativeDeployer) art50Clauses.push(t("riskcat result art50_2 clause"));
  if (isArt50EmotionBiometricProvider || isArt50EmotionBiometricDeployer) art50Clauses.push(t("riskcat result art50_3 clause"));
  if (isArt50PublicInterestDeployer) art50Clauses.push(t("riskcat result art50_4 clause"));
  const art50Conjunction = t("riskcat result art50 combined conjunction");
  const combinedClauses = art50Clauses.length <= 1
    ? art50Clauses.join("")
    : `${art50Clauses.slice(0, -1).join(", ")} ${art50Conjunction} ${art50Clauses[art50Clauses.length - 1]}`;
  const combinedArt50Heading = `${t("riskcat result art50 combined prefix")}${combinedClauses}:`;

  const art50TimingExceptionLines = (
    <div className="mt-2">
      <p className="mb-1">
        <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
        {t("riskcat result art50_3 deployer timing item1")}
      </p>
      <p className="mb-0">
        <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer exception heading")}:</span>{" "}
        {t("riskcat result art50_3 deployer exception item1")}
      </p>
    </div>
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
              {showAnyArt50Block ? (
                isUnifiedArt50 ? (
                  <div className="mb-3">
                    <p className="mb-2">{combinedArt50Heading}</p>
                    <p className="mb-1">
                      <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50 obligations subsection heading")}:</span>
                    </p>
                    <ul className="mb-2 ps-3">
                      {isArt50InteractiveProvider && (
                        <>
                          <li>{t("riskcat result art50_1 core obligation step1")}</li>
                          <li>{t("riskcat result art50_1 core obligation step2")}</li>
                          <li>{t("riskcat result art50_1 core obligation step3")}</li>
                        </>
                      )}
                      {isArt50InteractiveDeployer && (
                        <>
                          <li>{t("riskcat result art50_1 deployer step1")}</li>
                          <li>{t("riskcat result art50_1 deployer step2")}</li>
                        </>
                      )}
                      {isArt50GenerativeProvider && (
                        <>
                          <li>{t("riskcat result art50_2 core obligation step1")}</li>
                          <li>{t("riskcat result art50_2 core obligation step2")}</li>
                          <li>{t("riskcat result art50_2 core obligation step3")}</li>
                        </>
                      )}
                      {(isArt50GenerativeDeployer || isArt50PublicInterestDeployer) && (
                        <>
                          <li>{t("riskcat result art50_2 deployer step1")}</li>
                          <li>{t("riskcat result art50_2 deployer step2")}</li>
                        </>
                      )}
                      {isArt50EmotionBiometricProvider && (
                        <li>{t("riskcat result art50_3 provider obligation")}</li>
                      )}
                      {isArt50EmotionBiometricDeployer && (
                        <>
                          <li>{t("riskcat result art50_3 deployer core item1")}</li>
                          <li>{t("riskcat result art50_3 deployer core item3")}</li>
                          <li>{t("riskcat result art50_3 deployer core item4")}</li>
                        </>
                      )}
                    </ul>
                    <p className="mb-1">
                      <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>
                    </p>
                    <ul className="mb-2 ps-3">
                      <li>{t("riskcat result art50_3 deployer timing item1")}</li>
                    </ul>
                    <p className="mb-1">
                      <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer exception heading")}:</span>
                    </p>
                    <ul className="mb-2 ps-3">
                      <li>{t("riskcat result art50_2 deployer exceptions item1")}</li>
                      {(isArt50GenerativeDeployer || isArt50PublicInterestDeployer) && (
                        <>
                          <li>{t("riskcat result art50_2 deployer exceptions item2")}</li>
                          <li>
                            {t("riskcat result art50_2 deployer exceptions item3")}{" "}
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="art50-unified-exceptions-item3-tooltip" style={{ maxWidth: "320px" }}>
                                  {t("riskcat result art50_2 deployer exceptions item3 tooltip")}
                                </Tooltip>
                              }
                            >
                              <span style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="8" cy="8" r="7.5" stroke="#198754" />
                                  <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#198754" fontFamily="Arial, sans-serif" fontWeight="bold">i</text>
                                </svg>
                              </span>
                            </OverlayTrigger>
                          </li>
                        </>
                      )}
                    </ul>
                    {isArt50InteractiveProvider && (
                      <AccordionSubsection label={t("riskcat result art50_1 guidelines title")}>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_1 guidelines acceptable heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_1 guidelines acceptable item1")}</li>
                          <li>{t("riskcat result art50_1 guidelines acceptable item2")}</li>
                          <li>{t("riskcat result art50_1 guidelines acceptable item3")}</li>
                          <li>{t("riskcat result art50_1 guidelines acceptable item4")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_1 guidelines insufficient heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_1 guidelines insufficient item1")}</li>
                          <li>{t("riskcat result art50_1 guidelines insufficient item2")}</li>
                          <li>{t("riskcat result art50_1 guidelines insufficient item3")}</li>
                          <li>{t("riskcat result art50_1 guidelines insufficient item4")}</li>
                        </ul>
                        <p className="mt-2 mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)", fontSize: "0.85rem" }}>
                          {t("riskcat result art50_1 guidelines source prefix")}
                          <a href={t("riskcat result art50_1 guidelines source url")} target="_blank" rel="noreferrer">
                            {t("riskcat result art50_1 guidelines source link")}
                          </a>
                          {t("riskcat result art50_1 guidelines source suffix")}
                        </p>
                      </AccordionSubsection>
                    )}
                    {isArt50GenerativeProvider && (
                      <AccordionSubsection label={t("riskcat result art50_2 guidelines title")}>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines quality heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines quality item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item2")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item3")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item4")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item5")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines scope heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines scope item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines scope item2")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines outofscope heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines outofscope item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines outofscope item2")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines exceptions heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines exceptions item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines exceptions item2")}</li>
                          <li>{t("riskcat result art50_2 guidelines exceptions item3")}</li>
                          <li>{t("riskcat result art50_2 guidelines exceptions item4")}</li>
                        </ul>
                        <p className="mt-2 mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)", fontSize: "0.85rem" }}>
                          {t("riskcat result art50_2 guidelines source prefix")}
                          <a href={t("riskcat result art50_2 guidelines source url")} target="_blank" rel="noreferrer">
                            {t("riskcat result art50_2 guidelines source link")}
                          </a>
                          {t("riskcat result art50_2 guidelines source suffix")}
                        </p>
                      </AccordionSubsection>
                    )}
                    {!hideSourceBadges && (
                      <div className="mt-2 d-flex flex-wrap gap-1">
                        {(isArt50InteractiveProvider || isArt50InteractiveDeployer) && (
                          <a href={t("article art50_1 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_1 label")}
                            </span>
                          </a>
                        )}
                        {isArt50GenerativeProvider && (
                          <a href={t("article art50_2 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_2 label")}
                            </span>
                          </a>
                        )}
                        {(isArt50GenerativeDeployer || isArt50PublicInterestDeployer) && (
                          <a href={t("article art50_4 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_4 label")}
                            </span>
                          </a>
                        )}
                        {isArt50EmotionBiometricDeployer && (
                          <>
                            <a href={t("article art50_3 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                              <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                                {t("article art50_3 label")}
                              </span>
                            </a>
                            <a href={t("article art50_5 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                              <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                                {t("article art50_5 label")}
                              </span>
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                <>
                  {isArt50InteractiveDeployer && (
                    <div className="mb-3">
                      <p className="mb-2">{t("riskcat result art50_1 core obligation heading")}</p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_1 deployer step1")}</li>
                        <li>{t("riskcat result art50_1 deployer step2")}</li>
                      </ul>
                      {art50TimingExceptionLines}
                      {!hideSourceBadges && (
                        <div className="mt-2">
                          <a href={t("article art50_1 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_1 label")}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isArt50InteractiveProvider && (
                    <div className="mb-3">
                      <p className="mb-2">{t("riskcat result art50_1 core obligation heading")}</p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_1 core obligation step1")}</li>
                        <li>{t("riskcat result art50_1 core obligation step2")}</li>
                        <li>{t("riskcat result art50_1 core obligation step3")}</li>
                      </ul>
                      <AccordionSubsection label={t("riskcat result art50_1 guidelines title")}>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_1 guidelines acceptable heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_1 guidelines acceptable item1")}</li>
                          <li>{t("riskcat result art50_1 guidelines acceptable item2")}</li>
                          <li>{t("riskcat result art50_1 guidelines acceptable item3")}</li>
                          <li>{t("riskcat result art50_1 guidelines acceptable item4")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_1 guidelines insufficient heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_1 guidelines insufficient item1")}</li>
                          <li>{t("riskcat result art50_1 guidelines insufficient item2")}</li>
                          <li>{t("riskcat result art50_1 guidelines insufficient item3")}</li>
                          <li>{t("riskcat result art50_1 guidelines insufficient item4")}</li>
                        </ul>
                        <p className="mt-2 mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)", fontSize: "0.85rem" }}>
                          {t("riskcat result art50_1 guidelines source prefix")}
                          <a href={t("riskcat result art50_1 guidelines source url")} target="_blank" rel="noreferrer">
                            {t("riskcat result art50_1 guidelines source link")}
                          </a>
                          {t("riskcat result art50_1 guidelines source suffix")}
                        </p>
                      </AccordionSubsection>
                      {art50TimingExceptionLines}
                      {!hideSourceBadges && (
                        <div className="mt-2">
                          <a href={t("article art50_1 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_1 label")}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isArt50GenerativeDeployer && (
                    <div className="mb-3">
                      <p className="mb-2">{t("riskcat result art50_2 core obligation heading")}</p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_2 deployer step1")}</li>
                        <li>{t("riskcat result art50_2 deployer step2")}</li>
                      </ul>
                      <p className="mb-2">
                        <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
                        {t("riskcat result art50_3 deployer timing item1")}
                      </p>
                      <p className="mb-1">
                        <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_2 deployer exceptions heading")}</span>
                      </p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_2 deployer exceptions item1")}</li>
                        <li>{t("riskcat result art50_2 deployer exceptions item2")}</li>
                        <li>
                          {t("riskcat result art50_2 deployer exceptions item3")}{" "}
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="art50_2-deployer-exceptions-item3-tooltip" style={{ maxWidth: "320px" }}>
                                {t("riskcat result art50_2 deployer exceptions item3 tooltip")}
                              </Tooltip>
                            }
                          >
                            <span style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="7.5" stroke="#198754" />
                                <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#198754" fontFamily="Arial, sans-serif" fontWeight="bold">i</text>
                              </svg>
                            </span>
                          </OverlayTrigger>
                        </li>
                      </ul>
                      {!hideSourceBadges && (
                        <div className="mt-2">
                          <a href={t("article art50_4 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_4 label")}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isArt50GenerativeProvider && (
                    <div className="mb-3">
                      <p className="mb-2">{t("riskcat result art50_2 core obligation heading")}</p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_2 core obligation step1")}</li>
                        <li>{t("riskcat result art50_2 core obligation step2")}</li>
                        <li>{t("riskcat result art50_2 core obligation step3")}</li>
                      </ul>
                      <AccordionSubsection label={t("riskcat result art50_2 guidelines title")}>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines quality heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines quality item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item2")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item3")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item4")}</li>
                          <li>{t("riskcat result art50_2 guidelines quality item5")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines scope heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines scope item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines scope item2")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines outofscope heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines outofscope item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines outofscope item2")}</li>
                        </ul>
                        <div className="fw-semibold mb-1">{t("riskcat result art50_2 guidelines exceptions heading")}</div>
                        <ul className="mb-2 ps-3">
                          <li>{t("riskcat result art50_2 guidelines exceptions item1")}</li>
                          <li>{t("riskcat result art50_2 guidelines exceptions item2")}</li>
                          <li>{t("riskcat result art50_2 guidelines exceptions item3")}</li>
                          <li>{t("riskcat result art50_2 guidelines exceptions item4")}</li>
                        </ul>
                        <p className="mt-2 mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)", fontSize: "0.85rem" }}>
                          {t("riskcat result art50_2 guidelines source prefix")}
                          <a href={t("riskcat result art50_2 guidelines source url")} target="_blank" rel="noreferrer">
                            {t("riskcat result art50_2 guidelines source link")}
                          </a>
                          {t("riskcat result art50_2 guidelines source suffix")}
                        </p>
                      </AccordionSubsection>
                      {art50TimingExceptionLines}
                      {!hideSourceBadges && (
                        <div className="mt-2">
                          <a href={t("article art50_2 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_2 label")}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isArt50PublicInterestDeployer && (
                    <div className="mb-3">
                      <p className="mb-2">{t("riskcat result art50_4 core obligation heading")}</p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_2 deployer step1")}</li>
                        <li>{t("riskcat result art50_2 deployer step2")}</li>
                      </ul>
                      <p className="mb-2">
                        <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
                        {t("riskcat result art50_3 deployer timing item1")}
                      </p>
                      <p className="mb-1">
                        <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_2 deployer exceptions heading")}</span>
                      </p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_2 deployer exceptions item1")}</li>
                        <li>{t("riskcat result art50_2 deployer exceptions item2")}</li>
                        <li>
                          {t("riskcat result art50_2 deployer exceptions item3")}{" "}
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="art50_4-deployer-exceptions-item3-tooltip" style={{ maxWidth: "320px" }}>
                                {t("riskcat result art50_2 deployer exceptions item3 tooltip")}
                              </Tooltip>
                            }
                          >
                            <span style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="7.5" stroke="#198754" />
                                <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#198754" fontFamily="Arial, sans-serif" fontWeight="bold">i</text>
                              </svg>
                            </span>
                          </OverlayTrigger>
                        </li>
                      </ul>
                      {!hideSourceBadges && (
                        <div className="mt-2">
                          <a href={t("article art50_4 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_4 label")}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isArt50EmotionBiometricDeployer && (
                    <div className="mb-3">
                      <p className="mb-2">{t("riskcat result art50_3 core obligation heading")}</p>
                      <ul className="mb-2 ps-3">
                        <li>{t("riskcat result art50_3 deployer core item1")}</li>
                        <li>{t("riskcat result art50_3 deployer core item3")}</li>
                        <li>{t("riskcat result art50_3 deployer core item4")}</li>
                      </ul>
                      {art50TimingExceptionLines}
                      {!hideSourceBadges && (
                        <div className="mt-2 d-flex flex-wrap gap-1">
                          <a href={t("article art50_3 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_3 label")}
                            </span>
                          </a>
                          <a href={t("article art50_5 url")} target="_blank" rel="noreferrer" className="question-badge-link">
                            <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
                              {t("article art50_5 label")}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isArt50EmotionBiometricProvider && (
                    <div className="mb-3">
                      <p className="mb-0">{t("riskcat result art50_3 provider obligation")}</p>
                    </div>
                  )}
                </>
                )
              ) : (
                <p className="mb-0">
                  {t("riskcat result low obligations")}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {knownRoleBadges.length > 0 && (outcome === "high" || outcome === "highExcept") && (
        <>
          <NextStepsSection roles={aiAct2Roles ?? []} onStartQuestionnaire={onStartQuestionnaire} annexIArt6Branch={annexIArt6Branch} />
          <ObligationsSection
            roles={aiAct2Roles ?? []}
            annexIArt6Branch={annexIArt6Branch}
            footer={hasArt50Scenario ? (
              <div className="mt-3">
                <p className="mb-1">
                  <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
                  {t("riskcat result art50_3 deployer timing item1")}
                </p>
                <p className="mb-0">
                  <span style={{ color: "var(--cma-primary-700)" }}>{t("riskcat result art50_3 deployer exception heading")}:</span>{" "}
                  {t("riskcat result art50_3 deployer exception item1")}
                </p>
              </div>
            ) : undefined}
          />
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
