import { useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { deriveRolesAndStatus, type Role, type Status } from "../utils/roleStatus";
import NextStepsSection from "./NextStepsSection";
import ObligationsSection from "./ObligationsSection";
import Art50ObligationsAccordions from "./Art50ObligationsAccordions";
import RolesOverviewSection from "./RolesOverviewSection";

// The Obligations screen: a compact three-question form whose answers are
// selectable badges (pre-filled from the Role-and-status and Risk-category
// questionnaires when those have been completed). Below the questions it shows
// the AI Act obligations that follow from the answer combination, reusing the
// logic already implemented on the Risk-category result page.

type RiskKey = "genai" | "low" | "forbidden" | "high" | "exception";

const ROLE_ORDER: Role[] = [
  "provider",
  "deployer",
  "importer",
  "distributor",
  "representative",
  "private",
];

const ROLE_LABEL_KEY: Record<Role, string> = {
  provider: "aiact2 summary role provider",
  deployer: "aiact2 summary role deployer",
  importer: "aiact2 summary role importer",
  distributor: "aiact2 summary role distributor",
  representative: "aiact2 summary role representative",
  private: "aiact2 summary role private",
};

const ROLE_COLOR: Record<Role, string> = {
  provider: "var(--cma-role-provider)",
  deployer: "var(--cma-role-deployer)",
  representative: "var(--cma-role-representative)",
  importer: "var(--cma-role-importer)",
  distributor: "var(--cma-role-distributor)",
  private: "var(--cma-role-private)",
};

// Maps the questionnaire's English role keys to the Dutch keys that
// ObligationsSection / NextStepsSection expect. Authorised representatives are
// treated as importers (see "aiact2 summary guidance"); private users have no
// obligations branch.
const ROLE_TO_DUTCH: Record<Role, string> = {
  provider: "aanbieder",
  deployer: "gebruiksverantwoordelijke",
  importer: "importeur",
  distributor: "distributeur",
  representative: "importeur",
  private: "privaat",
};

const STATUS_COLOR: Record<Status, string> = {
  in_use: "var(--cma-status-in-use)",
  in_development: "var(--cma-status-in-development)",
};
const STATUS_LABEL_KEY: Record<Status, string> = {
  in_use: "aiact2 q13 a1",
  in_development: "aiact2 q13 a2",
};

const RISK_ORDER: RiskKey[] = ["genai", "low", "forbidden", "high", "exception"];
const RISK_LABEL_KEY: Record<RiskKey, string> = {
  genai: "badge genai",
  low: "badge riskcat low",
  forbidden: "badge riskcat forbidden",
  high: "badge riskcat high",
  exception: "badge riskcat exception",
};
const RISK_COLOR: Record<RiskKey, string> = {
  genai: "var(--cma-cat-genai)",
  low: "var(--cma-risk-low)",
  forbidden: "var(--cma-risk-unacceptable)",
  high: "var(--cma-risk-high)",
  exception: "var(--cma-risk-exception)",
};

const NOTA = ["None of the above", "Geen van de bovenstaande"];

/** Pre-fill Q3 from the saved Risk-category outcome (see OutputRiskClassification). */
function prefillRisk(riskData: Record<string, unknown> | undefined): RiskKey[] {
  if (!riskData) return [];
  const outcome = riskData._riskOutcome as string | undefined;
  if (!outcome) return [];
  const art50: unknown[] = Array.isArray(riskData.art50) ? riskData.art50 : [];
  const hasArt50 = art50.some((v) => typeof v === "string" && !NOTA.includes(v));
  switch (outcome) {
    case "low":
      return hasArt50 ? ["genai"] : ["low"];
    case "high":
      return ["high"];
    case "highExcept":
      return ["high", "exception"];
    case "forbidden":
      return ["forbidden"];
    case "forbiddenExcept":
      return ["forbidden", "exception"];
    default:
      return [];
  }
}

function Chip({
  label,
  color,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  color: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (disabled) return;
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
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
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

function QuestionBlock({
  text,
  hintBadge,
  onStartHint,
  hideHint,
  children,
}: {
  text: string;
  hintBadge: string;
  onStartHint?: () => void;
  // When the answer is already pre-filled from a completed questionnaire, the
  // "Find out by filling in questionnaire: …" hint is no longer relevant.
  hideHint?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <h6 className="fw-bold mb-1 mt-2" style={{ color: "#005AA7" }}>
        {text}
      </h6>
      <div style={{ borderTop: "1px solid #005AA7", paddingTop: "8px" }}>
        {!hideHint && (
          <p className="mb-2" style={{ fontSize: "0.9rem" }}>
            <span style={{ marginRight: "8px" }}>{t("obligations hint prefix")}</span>
            <span
              role={onStartHint ? "button" : undefined}
              className="badge"
              style={{
                backgroundColor: onStartHint ? "var(--cma-primary)" : "var(--cma-text-muted)",
                color: "#fff",
                cursor: onStartHint ? "pointer" : "default",
                fontSize: "0.85rem",
                padding: "3.2px 5.12px",
                verticalAlign: "middle",
              }}
              onClick={onStartHint}
            >
              {hintBadge}
            </span>
          </p>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function ObligationsQuestionnaire({
  roleStatusData,
  riskData,
  onBack,
  onStartQuestionnaire,
}: {
  roleStatusData: Record<string, unknown> | undefined;
  riskData: Record<string, unknown> | undefined;
  onBack: () => void;
  onStartQuestionnaire?: (key: string) => void;
}) {
  const { t } = useTranslation();

  const prefilled = deriveRolesAndStatus(roleStatusData, t);
  const prefilledRisk = prefillRisk(riskData);
  const [q1Roles, setQ1Roles] = useState<Role[]>(prefilled.roles);
  const [q2Status, setQ2Status] = useState<Status | null>(prefilled.status);
  const [q3, setQ3] = useState<RiskKey[]>(prefilledRisk);

  // When an answer was pre-filled from a completed questionnaire, hide the
  // "Find out by filling in questionnaire: …" hint for that question.
  const q1Prefilled = prefilled.roles.length > 0;
  const q2Prefilled = prefilled.status !== null;
  const q3Prefilled = prefilledRisk.length > 0;

  // Q1: single-select, except Provider + Deployer may be held together.
  const toggleRole = (role: Role) => {
    setQ1Roles((prev) => {
      if (prev.includes(role)) return prev.filter((r) => r !== role);
      const isPair = role === "provider" || role === "deployer";
      const prevOnlyPair = prev.every((r) => r === "provider" || r === "deployer");
      if (isPair && prevOnlyPair) return [...prev, role];
      return [role];
    });
  };

  // Q2: single-select toggle.
  const toggleStatus = (status: Status) =>
    setQ2Status((prev) => (prev === status ? null : status));

  // Q3: genai / "No requirements" are each exclusive; Prohibited and High-risk
  // are mutually exclusive; Exception only attaches to Prohibited or High-risk.
  const toggleRisk = (key: RiskKey) => {
    setQ3((prev) => {
      const has = prev.includes(key);
      if (key === "genai") return has ? [] : ["genai"];
      if (key === "low") return has ? [] : ["low"];
      if (key === "exception") {
        if (has) return prev.filter((k) => k !== "exception");
        return prev.includes("forbidden") || prev.includes("high")
          ? [...prev, "exception"]
          : prev;
      }
      // forbidden / high
      if (has) return [];
      const keepException = prev.includes("exception");
      return keepException ? [key, "exception"] : [key];
    });
  };
  const exceptionEnabled = q3.includes("forbidden") || q3.includes("high");

  const dutchRoles = Array.from(new Set(q1Roles.map((r) => ROLE_TO_DUTCH[r])));
  const isProvider = dutchRoles.includes("aanbieder");
  const isDeployer = dutchRoles.includes("gebruiksverantwoordelijke");
  const annexIArt6Branch =
    riskData?._annexIArt6Branch === "A" || riskData?._annexIArt6Branch === "B"
      ? (riskData._annexIArt6Branch as "A" | "B")
      : undefined;

  const renderObligations = () => {
    if (q3.length === 0) {
      return <p className="mb-0" style={{ fontSize: "0.9rem" }}>{t("obligations select prompt")}</p>;
    }
    if (q3.includes("low")) {
      return <p className="mb-0" style={{ fontSize: "0.9rem" }}>{t("riskcat result low obligations")}</p>;
    }
    if (q3.includes("forbidden")) {
      const nextStepsKey = isProvider
        ? "riskcat result prohibited next steps provider"
        : isDeployer
        ? "riskcat result prohibited next steps deployer"
        : null;
      return (
        <div style={{ fontSize: "0.9rem" }}>
          {nextStepsKey ? (
            <p className="mb-2">{t(nextStepsKey)}</p>
          ) : (
            <p className="mb-2" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
              {t("obligations no role note")}
            </p>
          )}
          <p className="mb-0">{t("riskcat result prohibited obligation")}</p>
        </div>
      );
    }
    if (q3.includes("high")) {
      if (dutchRoles.length === 0) {
        return (
          <p className="mb-0" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--cma-text-muted)" }}>
            {t("obligations no role note")}
          </p>
        );
      }
      return (
        <>
          <NextStepsSection
            roles={dutchRoles}
            onStartQuestionnaire={onStartQuestionnaire}
            annexIArt6Branch={annexIArt6Branch}
          />
          <ObligationsSection roles={dutchRoles} annexIArt6Branch={annexIArt6Branch} />
        </>
      );
    }
    // genai
    return <Art50ObligationsAccordions roles={dutchRoles} />;
  };

  return (
    <Card style={{ minHeight: "300px" }}>
      <Card.Header className="d-flex flex-row justify-content-between align-items-center">
        <div className="d-flex flex-row align-items-center gap-2">
          <span
            className="badge"
            style={{ fontSize: "0.85rem", whiteSpace: "nowrap", backgroundColor: "#005AA7", color: "#fff" }}
          >
            {t("questionnaire 4 name")}
          </span>
          <Card.Title className="my-1" style={{ marginLeft: "8px" }}>
            {t("questionnaire 4 title")}
          </Card.Title>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-outline-secondary btn-sm ml-4"
          aria-label="Back"
        >
          ← {t("back to overview")}
        </button>
      </Card.Header>
      <Card.Body className="d-flex flex-column gap-3">
        <p className="mb-0" style={{ fontSize: "0.9rem" }}>
          {t("aiact2 intro p1 prefix")}{" "}
          <span className="badge badge-secondary" style={{ fontSize: "0.85rem", padding: "3.2px 5.12px" }}>
            {t("questionnaire 1 name")}
          </span>{" "}
          {t("aiact2 intro p1 suffix")}{" "}
          <span
            className="badge badge-secondary"
            style={{ backgroundColor: "var(--cma-cat-ai-system)", color: "#fff", fontSize: "0.85rem", padding: "3.2px 5.12px" }}
          >
            {t("badge ai system")}
          </span>
          {t("aiact2 intro p1 suffix2")}
        </p>

        {/* Q1 — role */}
        <div style={{ marginTop: "1rem" }}>
          <QuestionBlock
            text={t("obligations q1 text")}
            hintBadge={t("questionnaire 3 name")}
            onStartHint={onStartQuestionnaire ? () => onStartQuestionnaire("AI2") : undefined}
            hideHint={q1Prefilled}
          >
            {ROLE_ORDER.map((role) => (
              <Chip
                key={role}
                label={t(ROLE_LABEL_KEY[role])}
                color={ROLE_COLOR[role]}
                selected={q1Roles.includes(role)}
                onClick={() => toggleRole(role)}
              />
            ))}
          </QuestionBlock>
        </div>

        {/* Q2 — status */}
        <QuestionBlock
          text={t("obligations q2 text")}
          hintBadge={t("questionnaire 3 name")}
          onStartHint={onStartQuestionnaire ? () => onStartQuestionnaire("AI2") : undefined}
          hideHint={q2Prefilled}
        >
          {(["in_use", "in_development"] as Status[]).map((status) => (
            <Chip
              key={status}
              label={t(STATUS_LABEL_KEY[status])}
              color={STATUS_COLOR[status]}
              selected={q2Status === status}
              onClick={() => toggleStatus(status)}
            />
          ))}
        </QuestionBlock>

        {/* Q3 — risk category */}
        <QuestionBlock
          text={t("obligations q3 text")}
          hintBadge={t("questionnaire 2 name")}
          onStartHint={onStartQuestionnaire ? () => onStartQuestionnaire("AI1") : undefined}
          hideHint={q3Prefilled}
        >
          {RISK_ORDER.map((key) => (
            <Chip
              key={key}
              label={t(RISK_LABEL_KEY[key])}
              color={RISK_COLOR[key]}
              selected={q3.includes(key)}
              disabled={key === "exception" && !exceptionEnabled}
              onClick={() => toggleRisk(key)}
            />
          ))}
        </QuestionBlock>

        {/* Obligations overview */}
        <div>
          <h5 className="fw-bold mb-1 mt-2" style={{ color: "#005AA7" }}>
            {t("obligations overview heading")}
          </h5>
          <hr className="mt-1 mb-2" />
          {renderObligations()}
          {q2Status && q3.length > 0 && !q3.includes("low") && (
            <p className="mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
              <span style={{ color: "#005AA7" }}>{t("aiact2 result timelines title")}:</span>{" "}
              {t(q2Status === "in_use" ? "aiact2 result in use text" : "aiact2 result in development text")}
            </p>
          )}
        </div>

        <RolesOverviewSection />

        <Alert variant="warning" className="mt-2 mb-2">
          <small>{t("disclaimer")}</small>
        </Alert>

        <div>
          <div style={{ display: "inline-block", marginTop: "8px", marginBottom: "4px" }}>
            <span className="badge badge-secondary">id: {t("questionnaire 4 name")} menu</span>
          </div>
          <div className="d-flex flex-row justify-content-end">
            <Button variant="primary" onClick={onBack}>
              {t("done")}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
