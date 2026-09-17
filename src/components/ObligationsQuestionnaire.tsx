import { useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { deriveRolesAndStatus, type Role, type Status } from "../utils/roleStatus";
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
  representative: "vertegenwoordiger",
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

// Which Art. 50 sub-case each field of the optional, on-demand Art. 50
// questionnaire (src/schemas/art50/{en,nl}/art50.json) resolves. Kept in sync
// by hand with that schema's enum wording — see Art50ObligationsAccordions.tsx
// for how each status is rendered.
export type Art50Status = "exempt" | "applies" | "attenuated";
export type Art50Applicable = {
  interactive?: Art50Status;
  synthetic?: Art50Status;
  biometric?: Art50Status;
  deepfake?: Art50Status;
  publicInterestText?: Art50Status;
};

// Redesigned per the client-authored Art. 50 questionnaire spec, with the
// shared exception screen (Art. 2's scope exclusions — personal use / R&D /
// open-source licence) moved to fire once, immediately after Q1, before any
// per-scenario follow-up: if it applies, every selected scenario is exempt
// and Q2-Q6 are never asked at all; if it doesn't ("None of the above"), each
// selected scenario's own Q2/Q3/Q5/Q6 direct-exemption options (plus a "None
// of the above" fall-through to "applies") or Q4's plain Yes/No are then
// asked, independent of the shared screen.
//
// Values are listed in both languages since this file's logic is shared
// across the English and Dutch schemas, and the raw answers stored in
// `art50Data` are in whichever language the user's schema used (mirrors the
// existing bilingual `NOTA` constant above).
const ART50_EXEMPT_VALUES: Record<string, string[]> = {
  interactiveException: [
    "It is obvious to a well-informed, observant and circumspect natural person that it is interacting with an AI system",
    "The AI system is authorised by law for law enforcement purposes",
    "Het is voor een goed geïnformeerde, oplettende en kritische natuurlijke persoon duidelijk dat deze interageert met een AI-systeem",
    "Het AI-systeem is bij wet toegestaan voor rechtshandhavingsdoeleinden",
  ],
  syntheticException: [
    "The AI system performs an assistive function for standard editing",
    "The AI system does not substantially alter the input data provided by the deployer or the semantics thereof",
    "The AI system is authorised by law to generate or manipulate synthetic content to detect, prevent, investigate or prosecute criminal offence",
    "Het AI-systeem vervult een ondersteunende functie voor standaardbewerking",
    "Het AI-systeem wijzigt de door de gebruiksverantwoordelijke verstrekte inputgegevens of de betekenis daarvan niet wezenlijk",
    "Het AI-systeem is bij wet toegestaan om synthetische inhoud te genereren of te manipuleren met het oog op het opsporen, voorkomen, onderzoeken of vervolgen van een strafbaar feit",
  ],
  biometricException: ["Yes", "Ja"],
  deepfakeException: [
    "The deep fake is authorised by law to detect, prevent, investigate or prosecute criminal offences",
    "De deepfake is bij wet toegestaan met het oog op het opsporen, voorkomen, onderzoeken of vervolgen van strafbare feiten",
  ],
  publicInterestTextException: [
    "The text is under human review or editorial control and editorial responsibility",
    "The use of the AI system for generating text published with the purpose of informing the public on matters of public interest without human review is authorised by law to detect, prevent, investigate or prosecute criminal offences",
    "De tekst staat onder menselijke beoordeling of redactionele controle en redactionele verantwoordelijkheid",
    "Het gebruik van het AI-systeem voor het genereren van tekst die wordt gepubliceerd met als doel het publiek te informeren over aangelegenheden van algemeen belang, zonder menselijke beoordeling, is bij wet toegestaan met het oog op het opsporen, voorkomen, onderzoeken of vervolgen van strafbare feiten",
  ],
};
const ART50_ATTENUATED_VALUES = [
  "The deep fake forms a part of evidently artistic, creative, satirical, fictional or analogous work",
  "De deepfake vormt onderdeel van een duidelijk artistiek, creatief, satirisch, fictief of soortgelijk werk",
];
// The generic "fall through to applies" catch-all for Q2/Q3/Q5/Q6's "None of
// the above" and (separately, below) Q4's "No" — also doubles as the check
// for the shared exception screen's own "None of the above" (no general
// exception selected).
const ART50_NONE_VALUES = ["None of the above", "Geen van de bovenstaande"];
const ART50_BIOMETRIC_NO_VALUES = ["No", "Nee"];
const ART50_RESEARCH_VALUES = ["Research and development", "Onderzoek en ontwikkeling"];

// Q1's own scenario-selection text, bilingual — used to tell "selected in Q1,
// but its own Q2-Q6 follow-up was never asked because the shared exception
// screen already resolved to a real exception" (should read as "exempt") apart
// from "never selected in Q1 at all" (should read as "resolved: not selected",
// hidden entirely — see resolveArt50Applicable's doc comment).
const ART50_SCENARIO_VALUES: Record<keyof Art50Applicable, string[]> = {
  interactive: [
    "It interacts directly with natural persons.",
    "Het interageert rechtstreeks met natuurlijke personen.",
  ],
  synthetic: [
    "It generates or manipulates synthetic audio, image, video or text content.",
    "Het genereert of manipuleert synthetische audio-, beeld-, video- of tekstinhoud.",
  ],
  biometric: [
    "It recognises emotions or categorises persons based on biometric data.",
    "Het herkent emoties of categoriseert personen op basis van biometrische gegevens.",
  ],
  deepfake: [
    "It generates or manipulates image, audio or video content that resembles real people, objects, places or events (a deep fake).",
    "Het genereert of manipuleert beeld-, audio- of video-inhoud die lijkt op bestaande personen, objecten, plaatsen of gebeurtenissen (een deepfake).",
  ],
  publicInterestText: [
    "It generates or manipulates text published to inform the public on matters of public interest.",
    "Het genereert of manipuleert tekst die wordt gepubliceerd om het publiek te informeren over aangelegenheden van algemeen belang.",
  ],
};

function resolveOne(
  field: string,
  value: unknown,
  generalExceptionValue: unknown
): Art50Status | undefined {
  // Q4 (biometricException) is a plain Yes/No, still a single string. Every
  // other field (Q2/Q3/Q5/Q6) is a multi-select array — more than one ground
  // can genuinely apply to the same AI system at once, even though every
  // "exempt" ground already resolves the same way on its own.
  const values: string[] =
    field === "biometricException"
      ? typeof value === "string"
        ? [value]
        : []
      : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  if (values.length === 0) return undefined;

  // A full exemption always wins over the attenuated deep-fake regime, even
  // when both grounds are checked at the same time.
  if (values.some((v) => ART50_EXEMPT_VALUES[field]?.includes(v))) return "exempt";

  const isAttenuated =
    field === "deepfakeException" && values.some((v) => ART50_ATTENUATED_VALUES.includes(v));
  const isFallthrough =
    isAttenuated ||
    values.some((v) => ART50_NONE_VALUES.includes(v)) ||
    (field === "biometricException" && values.some((v) => ART50_BIOMETRIC_NO_VALUES.includes(v)));
  if (!isFallthrough) return undefined;
  const generalExceptionApplies =
    typeof generalExceptionValue === "string" &&
    generalExceptionValue !== "" &&
    !ART50_NONE_VALUES.includes(generalExceptionValue);
  if (generalExceptionApplies) return "exempt";
  return isAttenuated ? "attenuated" : "applies";
}

// Whether the shared exception screen (asked once, right after Q1) fully
// resolved to a real exception — "None of the above" doesn't count, and
// "Research and development" only counts once the free-text description
// (asked as its own follow-up step) has actually been filled in.
function generalExceptionFullyApplies(art50Data: Record<string, unknown>): boolean {
  const value = art50Data.generalException;
  if (typeof value !== "string" || value === "" || ART50_NONE_VALUES.includes(value)) return false;
  if (ART50_RESEARCH_VALUES.includes(value)) {
    const description = art50Data.generalExceptionResearchDescription;
    return typeof description === "string" && description.trim() !== "";
  }
  return true;
}

/**
 * Resolves the optional Art. 50 questionnaire's answers into a per-sub-case
 * exempt/applies/attenuated status. Returns `undefined` when the questionnaire
 * hasn't been completed at all — deliberately distinct from a completed
 * questionnaire's object (where a key simply absent means "resolved, but this
 * scenario wasn't selected"). Callers (Art50ObligationsAccordions) treat
 * `undefined` as "unknown, show default content for everything" and a defined
 * object's missing keys as "known not to apply, hide entirely" — conflating
 * the two was a real bug: it made every unselected sub-case still render its
 * full default obligation text once the questionnaire had been completed.
 */
export function resolveArt50Applicable(
  art50Data: Record<string, unknown> | undefined
): Art50Applicable | undefined {
  if (!art50Data) return undefined;
  const generalException = art50Data.generalException;
  const scenarios = art50Data.scenarios;
  const isSelected = (key: keyof Art50Applicable): boolean =>
    Array.isArray(scenarios) && ART50_SCENARIO_VALUES[key].some((v) => scenarios.includes(v));
  const generalExceptionApplies = generalExceptionFullyApplies(art50Data);

  const resolveKey = (key: keyof Art50Applicable, field: string): Art50Status | undefined => {
    if (!isSelected(key)) return undefined;
    const value = art50Data[field];
    if (value === undefined) {
      // Selected in Q1, but its own Q2-Q6 follow-up was never asked — only
      // happens when the shared exception screen already exempted it.
      return generalExceptionApplies ? "exempt" : undefined;
    }
    return resolveOne(field, value, generalException);
  };

  return {
    interactive: resolveKey("interactive", "interactiveException"),
    synthetic: resolveKey("synthetic", "syntheticException"),
    biometric: resolveKey("biometric", "biometricException"),
    deepfake: resolveKey("deepfake", "deepfakeException"),
    publicInterestText: resolveKey("publicInterestText", "publicInterestTextException"),
  };
}

/** Pre-fill Q3 from the saved Risk-category outcome (see OutputRiskClassification). */
function prefillRisk(
  riskData: Record<string, unknown> | undefined,
  art50Applicable: Art50Applicable | undefined
): RiskKey[] {
  if (!riskData) return [];
  const outcome = riskData._riskOutcome as string | undefined;
  if (!outcome) return [];
  const art50: unknown[] = Array.isArray(riskData.art50) ? riskData.art50 : [];
  const hasArt50 = art50.some((v) => typeof v === "string" && !NOTA.includes(v));
  // If the optional Art. 50 questionnaire has been completed and every scenario
  // it resolved turned out to be exempt, the flat checkbox presence in
  // riskData.art50 is stale — no Art. 50 duty actually applies after all.
  const resolvedStatuses = Object.values(art50Applicable ?? {}).filter(Boolean) as Art50Status[];
  const allResolvedExempt = resolvedStatuses.length > 0 && resolvedStatuses.every((s) => s === "exempt");
  const effectiveHasArt50 = hasArt50 && !allResolvedExempt;
  switch (outcome) {
    case "low":
      return effectiveHasArt50 ? ["genai"] : ["low"];
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
      <p className="mb-1 mt-2" style={{ fontSize: "0.9rem" }}>
        <span style={{ fontWeight: "bold", color: "#005AA7", fontSize: "1rem" }}>
          {text}
        </span>
        {!hideHint && (
          <>
            <span style={{ marginLeft: "8px", marginRight: "8px" }}>
              {t("obligations hint prefix")}
            </span>
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
          </>
        )}
      </p>
      <div style={{ borderTop: "1px solid #005AA7", paddingTop: "8px" }}>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function ObligationsQuestionnaire({
  roleStatusData,
  riskData,
  art50Data,
  onBack,
  onStartQuestionnaire,
}: {
  roleStatusData: Record<string, unknown> | undefined;
  riskData: Record<string, unknown> | undefined;
  art50Data?: Record<string, unknown>;
  onBack: () => void;
  onStartQuestionnaire?: (key: string) => void;
}) {
  const { t } = useTranslation();

  const art50Applicable = resolveArt50Applicable(art50Data);
  const prefilled = deriveRolesAndStatus(roleStatusData, t);
  const prefilledRisk = prefillRisk(riskData, art50Applicable);
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

  // Q3 selection rules:
  //  - "No requirements" is exclusive (always alone).
  //  - "Prohibited" is exclusive of genai/high/low.
  //  - "Generative and interactive AI" and "High-risk" may be combined.
  //  - "Exception" only attaches to "Prohibited" or "High-risk".
  const toggleRisk = (key: RiskKey) => {
    setQ3((prev) => {
      const has = prev.includes(key);
      let next: RiskKey[];
      if (has) {
        next = prev.filter((k) => k !== key);
      } else {
        switch (key) {
          case "low":
            next = ["low"];
            break;
          case "forbidden":
            next = [...prev.filter((k) => k === "exception"), "forbidden"];
            break;
          case "genai":
            next = [...prev.filter((k) => k === "high" || k === "exception"), "genai"];
            break;
          case "high":
            next = [...prev.filter((k) => k === "genai" || k === "exception"), "high"];
            break;
          case "exception":
            next =
              prev.includes("forbidden") || prev.includes("high")
                ? [...prev, "exception"]
                : prev;
            break;
          default:
            next = prev;
        }
      }
      // "Exception" must stay anchored to "Prohibited" or "High-risk".
      if (
        next.includes("exception") &&
        !next.includes("forbidden") &&
        !next.includes("high")
      ) {
        next = next.filter((k) => k !== "exception");
      }
      return next;
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

  // Optional, on-demand refinement of which Art. 50 sub-cases actually apply
  // (accounting for exceptions) — offered whenever "genai" is selected. Until
  // it's completed, Art50ObligationsAccordions falls back to showing all sub-cases.
  const art50Hint = onStartQuestionnaire ? (
    <p className="mb-2" style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
      {t(art50Data ? "obligations art50 hint prefix done" : "obligations art50 hint prefix")}{" "}
      <span
        role="button"
        tabIndex={0}
        className="badge"
        style={{ backgroundColor: "var(--cma-primary)", color: "#fff", cursor: "pointer", fontSize: "0.85rem", padding: "3.2px 5.12px", verticalAlign: "middle" }}
        onClick={() => onStartQuestionnaire("ART50")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onStartQuestionnaire("ART50");
          }
        }}
      >
        {t(art50Data ? "obligations art50 hint badge done" : "obligations art50 hint badge")}
      </span>
    </p>
  ) : null;

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
      // The "Next steps — For obligation N, continue with: …" links
      // (NextStepsSection) are intentionally omitted here: in the Obligations
      // menu the user is already viewing the obligations overview.
      // When "Generative and interactive AI" is also selected, the Art. 50
      // transparency obligations are shown below the high-risk obligations.
      return (
        <>
          {dutchRoles.length === 0 ? (
            <p className="mb-0" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--cma-text-muted)" }}>
              {t("obligations no role note")}
            </p>
          ) : (
            <ObligationsSection roles={dutchRoles} annexIArt6Branch={annexIArt6Branch} />
          )}
          {q3.includes("genai") && (
            <>
              {art50Hint}
              <Art50ObligationsAccordions roles={dutchRoles} applicable={art50Applicable} />
            </>
          )}
        </>
      );
    }
    // genai
    return (
      <>
        {art50Hint}
        <Art50ObligationsAccordions roles={dutchRoles} applicable={art50Applicable} />
      </>
    );
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
          <h5 className="fw-bold mb-1 mt-2" style={{ color: "#005AA7" }}>
            {t("obligations type heading")}
          </h5>
          <hr className="mt-1 mb-2" />
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
          {q2Status && q3.length > 0 && !q3.includes("low") && (
            <p className="mb-3" style={{ fontSize: "0.9rem" }}>
              <span style={{ color: "#005AA7" }}>{t("aiact2 result timelines title")}:</span>{" "}
              {q3.includes("forbidden") ? (
                t("aiact2 result prohibited timelines text")
              ) : (
                <>
                  {q3.includes("genai") &&
                    t(q2Status === "in_use" ? "aiact2 result genai in use timelines text" : "aiact2 result genai timelines text")}
                  {q3.includes("genai") && q3.includes("high") && " "}
                  {q3.includes("high") &&
                    t(q2Status === "in_use" ? "aiact2 result in use text" : "aiact2 result high development timelines text")}
                  {!q3.includes("genai") && !q3.includes("high") &&
                    t(q2Status === "in_use" ? "aiact2 result in use text" : "aiact2 result in development text")}
                </>
              )}
            </p>
          )}
          {q3.includes("exception") && (q3.includes("forbidden") || q3.includes("high")) && (
            <Alert variant="warning" className="mb-3">
              <small>{t("obligations exception banner")}</small>
            </Alert>
          )}
          {renderObligations()}
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
