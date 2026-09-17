import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import type { Art50Applicable, Art50Status } from "./ObligationsQuestionnaire";

// Renders the Art. 50 transparency obligations as five collapsible accordions,
// one per sub-case (interactive / synthetic content / emotion-biometric / deep
// fakes / public-interest text). Used by the Obligations screen when the risk
// category is "Generative and interactive AI".
//
// The optional `applicable` prop (from the on-demand Art. 50 questionnaire,
// src/schemas/art50/{en,nl}/art50.json — see ObligationsQuestionnaire.tsx's
// resolveArt50Applicable) tells each sub-case whether an exception applies
// ("exempt"), whether the standard duty applies ("applies"), or — deep fakes
// only — whether the attenuated artistic/creative/satirical/fictional regime
// applies ("attenuated"). A sub-case with no resolved status (questionnaire
// not completed, `applicable` omitted entirely) falls back to showing the
// full standard obligation content, exactly as before that questionnaire
// existed — nothing regresses for someone who skips it.
//
// The obligation text is reused verbatim from the Risk-category result page
// (riskcat result art50_* keys).

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "#005AA7" }}
    >
      <path d="M4 6l4 4 4-4" stroke="#005AA7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionSubsection({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--cma-primary)", paddingBottom: "8px", paddingTop: "8px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", width: "100%" }}
        aria-expanded={open}
      >
        <ChevronIcon open={open} />
        <small style={{ color: "#005AA7", fontWeight: "bold" }}>{label}</small>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function SourceBadge({ label, url }: { label: string; url: string }) {
  const { hideSourceBadges } = useSettings();
  if (hideSourceBadges && /^Art\.\s/i.test(label)) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="question-badge-link">
      <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
        {label}
      </span>
    </a>
  );
}

function InfoTooltip({ id, text }: { id: string; text: string }) {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={id} style={{ maxWidth: "320px" }}>{text}</Tooltip>}
    >
      <span style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7.5" stroke="var(--cma-cat-gdpr)" />
          <text x="8" y="12" textAnchor="middle" fontSize="10" fill="var(--cma-cat-gdpr)" fontFamily="Arial, sans-serif" fontWeight="bold">i</text>
        </svg>
      </span>
    </OverlayTrigger>
  );
}

function ExemptNote({ t }: { t: (key: string) => string }) {
  return (
    <p className="mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
      {t("obligations art50 exempt note")}
    </p>
  );
}

export default function Art50ObligationsAccordions({
  roles,
  applicable,
}: {
  roles: string[];
  applicable?: Art50Applicable;
}) {
  const { t } = useTranslation();
  const isProvider = roles.includes("aanbieder");
  const isDeployer = roles.includes("gebruiksverantwoordelijke");
  const hasRole = isProvider || isDeployer;
  const statusOf = (key: keyof Art50Applicable): Art50Status | undefined => applicable?.[key];
  // `applicable === undefined` means the detail questionnaire was never
  // completed — unknown, so show every sub-case's default content (today's
  // fallback). Once it HAS been completed, `applicable` is a real object and
  // a missing key means "resolved: this scenario wasn't selected" — hide that
  // sub-case entirely rather than falling through to default content.
  const isSelected = (key: keyof Art50Applicable): boolean =>
    applicable === undefined || statusOf(key) !== undefined;

  // A sub-case's exception question already ruled the exception in or out on
  // the preceding screen — once `statusOf(key) === "applies"` (confirmed no
  // exception), repeating the generic "Exception: ..." caveat here is
  // redundant. Only show it when the status is unresolved (questionnaire
  // skipped, e.g. from the Obligations menu without completing the Art. 50
  // detail questionnaire) — there it's still useful, since nothing has ruled
  // the exception out yet.
  const timingLine = () => (
    <p className="mb-1">
      <span style={{ color: "#005AA7" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
      {t("riskcat result art50_3 deployer timing item1")}
    </p>
  );
  const timingLines = (key: keyof Art50Applicable, exceptionItemKey: string) => (
    <div className="mt-2">
      {timingLine()}
      {statusOf(key) !== "applies" && (
        <p className="mb-0">
          <span style={{ color: "#005AA7" }}>{t("riskcat result art50_3 deployer exception heading")}:</span>{" "}
          {t(exceptionItemKey)}
        </p>
      )}
    </div>
  );

  const GuidelinesSource = ({ prefixKey, linkKey, urlKey, suffixKey }: { prefixKey: string; linkKey: string; urlKey: string; suffixKey: string }) => (
    <p className="mt-2 mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)", fontSize: "0.85rem" }}>
      {t(prefixKey)}
      <a href={t(urlKey)} target="_blank" rel="noreferrer">{t(linkKey)}</a>
      {t(suffixKey)}
    </p>
  );

  const roleWords: string[] = [];
  if (isProvider) roleWords.push(t("obligations art50 role provider"));
  if (isDeployer) roleWords.push(t("obligations art50 role deployer"));
  const roleText = roleWords.join(` ${t("and")} `);

  return (
    <div style={{ fontSize: "0.9rem" }}>
      {hasRole ? (
        <div className="mb-2 fw-semibold" style={{ color: "#000" }}>
          {t("obligations art50 heading", { role: roleText })}
        </div>
      ) : (
        <p className="mb-2" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
          {t("obligations art50 role note")}
        </p>
      )}

      {/* Sub-case 1 — interactive AI */}
      {isSelected("interactive") && (
      <AccordionSubsection label={t("riskcat result art50_1 core obligation heading").replace(/:\s*$/, "")}>
        {statusOf("interactive") === "exempt" ? (
        <ExemptNote t={t} />
        ) : (
        <>
        {isProvider && (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_1 provider label")}
            </div>
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
              <GuidelinesSource
                prefixKey="riskcat result art50_1 guidelines source prefix"
                linkKey="riskcat result art50_1 guidelines source link"
                urlKey="riskcat result art50_1 guidelines source url"
                suffixKey="riskcat result art50_1 guidelines source suffix"
              />
            </AccordionSubsection>
          </div>
        )}
        {isDeployer && (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_1 deployer label")}
            </div>
            <AccordionSubsection label={t("riskcat result art50_1 deployer checklist title")}>
              <ul className="mb-2 ps-3">
                <li>{t("riskcat result art50_1 deployer step1")}</li>
                <li>{t("riskcat result art50_1 deployer step2")}</li>
              </ul>
            </AccordionSubsection>
          </div>
        )}
        {hasRole && (
          <>
            {timingLines("interactive", "riskcat result art50_1 deployer exception item1")}
            <div className="mt-2">
              <SourceBadge label={t("article art50_1 label")} url={t("article art50_1 url")} />
            </div>
          </>
        )}
        </>
        )}
      </AccordionSubsection>
      )}

      {/* Sub-case 2 — synthetic audio, image, video or text content */}
      {isSelected("synthetic") && (
      <AccordionSubsection label={t("riskcat result art50_2 core obligation heading").replace(/:\s*$/, "")}>
        {statusOf("synthetic") === "exempt" ? (
        <ExemptNote t={t} />
        ) : (
        <>
        {isProvider && (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_2 provider label")}
            </div>
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
                {statusOf("synthetic") !== "applies" && (
                  <>
                    <li>{t("riskcat result art50_2 guidelines exceptions item1")}</li>
                    <li>{t("riskcat result art50_2 guidelines exceptions item2")}</li>
                    <li>{t("riskcat result art50_2 guidelines exceptions item3")}</li>
                  </>
                )}
                <li>{t("riskcat result art50_2 guidelines exceptions item4")}</li>
              </ul>
              <GuidelinesSource
                prefixKey="riskcat result art50_2 guidelines source prefix"
                linkKey="riskcat result art50_2 guidelines source link"
                urlKey="riskcat result art50_2 guidelines source url"
                suffixKey="riskcat result art50_2 guidelines source suffix"
              />
            </AccordionSubsection>
          </div>
        )}
        {isDeployer && (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_2 deployer label")}
            </div>
            <p className="mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
              {isProvider
                ? t("obligations art50_2 deployer no separate duty note")
                : t("obligations art50_2 provider only note")}
            </p>
          </div>
        )}
        {isProvider && (
          <div className="mt-2">
            <SourceBadge label={t("article art50_2 label")} url={t("article art50_2 url")} />
          </div>
        )}
        </>
        )}
      </AccordionSubsection>
      )}

      {/* Sub-case 3 — emotion recognition / biometric categorisation */}
      {isSelected("biometric") && (
      <AccordionSubsection label={t("riskcat result art50_3 core obligation heading").replace(/:\s*$/, "")}>
        {statusOf("biometric") === "exempt" ? (
        <ExemptNote t={t} />
        ) : (
        <>
        {isProvider && (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_3 provider label")}
            </div>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_3 provider obligation")}</li>
            </ul>
          </div>
        )}
        {isDeployer && (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_3 deployer label")}
            </div>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_3 deployer core item1")}</li>
              <li>{t("riskcat result art50_3 deployer core item3")}</li>
              <li>{t("riskcat result art50_3 deployer core item4")}</li>
            </ul>
            {timingLines("biometric", "riskcat result art50_3 deployer exception item1")}
          </div>
        )}
        {hasRole && (
          <div className="mt-2 d-flex flex-wrap gap-1">
            <SourceBadge label={t("article art50_3 label")} url={t("article art50_3 url")} />
            <SourceBadge label={t("article art50_5 label")} url={t("article art50_5 url")} />
          </div>
        )}
        </>
        )}
      </AccordionSubsection>
      )}

      {/* Sub-case 4 — deep fakes */}
      {isSelected("deepfake") && (
      <AccordionSubsection label={t("riskcat result art50_4 core obligation heading").replace(/:\s*$/, "")}>
        {statusOf("deepfake") === "exempt" ? (
          <ExemptNote t={t} />
        ) : statusOf("deepfake") === "attenuated" ? (
          isDeployer ? (
            <div className="mb-2">
              <div className="fw-semibold mb-1" style={{ color: "#000" }}>
                {t("riskcat result art50_4 deployer label")}
              </div>
              <p className="mb-2">{t("riskcat result art50_4 attenuated note")}</p>
              <p className="mb-2">{t("riskcat result art50_4 attenuated safeguards note")}</p>
              <div className="mt-2">
                <SourceBadge label={t("article art50_4 label")} url={t("article art50_4 url")} />
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <div className="fw-semibold mb-1" style={{ color: "#000" }}>
                {t("riskcat result art50_4 provider label")}
              </div>
              <p className="mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
                {t("obligations art50_4 deployer only note")}
              </p>
            </div>
          )
        ) : isDeployer ? (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_4 deployer label")}
            </div>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_4 deployer step1")}</li>
            </ul>
            {statusOf("deepfake") !== "applies" && (
              <>
                <p className="mb-1">
                  <span style={{ color: "#005AA7" }}>{t("riskcat result art50_4 deployer exceptions heading")}</span>
                </p>
                <ul className="mb-2 ps-3">
                  <li>{t("riskcat result art50_4 deployer exceptions item1")}</li>
                </ul>
              </>
            )}
            <div className="mt-2">
              <SourceBadge label={t("article art50_4 label")} url={t("article art50_4 url")} />
            </div>
          </div>
        ) : (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_4 provider label")}
            </div>
            <p className="mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
              {t("obligations art50_4 deployer only note")}
            </p>
          </div>
        )}
      </AccordionSubsection>
      )}

      {/* Sub-case 5 — public-interest text */}
      {isSelected("publicInterestText") && (
      <AccordionSubsection label={t("riskcat result art50_4pit core obligation heading").replace(/:\s*$/, "")}>
        {statusOf("publicInterestText") === "exempt" ? (
          <ExemptNote t={t} />
        ) : isDeployer ? (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_4pit deployer label")}
            </div>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_4pit deployer step1")}</li>
            </ul>
            {statusOf("publicInterestText") !== "applies" && (
              <>
                <p className="mb-1">
                  <span style={{ color: "#005AA7" }}>{t("riskcat result art50_4pit deployer exceptions heading")}</span>
                </p>
                <ul className="mb-2 ps-3">
                  <li>{t("riskcat result art50_4pit deployer exceptions item1")}</li>
                  <li>
                    {t("riskcat result art50_4pit deployer exceptions item2")}{" "}
                    <InfoTooltip id="art50_4pit-acc-exceptions-item2" text={t("riskcat result art50_4pit deployer exceptions item2 tooltip")} />
                  </li>
                </ul>
              </>
            )}
            <div className="mt-2">
              <SourceBadge label={t("article art50_4pit label")} url={t("article art50_4pit url")} />
            </div>
          </div>
        ) : (
          <div className="mb-2">
            <div className="fw-semibold mb-1" style={{ color: "#000" }}>
              {t("riskcat result art50_4pit provider label")}
            </div>
            <p className="mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
              {t("obligations art50_4pit deployer only note")}
            </p>
          </div>
        )}
      </AccordionSubsection>
      )}
    </div>
  );
}
