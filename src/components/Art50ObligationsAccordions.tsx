import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";

// Renders the Art. 50 transparency obligations as four collapsible accordions,
// one per sub-case (interactive / synthetic content / emotion-biometric /
// public-interest). Used by the Obligations screen when the risk category is
// "Generative and interactive AI" — that single badge cannot tell the four
// sub-cases apart, so all four are shown. The obligation text is reused
// verbatim from the Risk-category result page (riskcat result art50_* keys).

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

export default function Art50ObligationsAccordions({ roles }: { roles: string[] }) {
  const { t } = useTranslation();
  const isProvider = roles.includes("aanbieder");
  const isDeployer = roles.includes("gebruiksverantwoordelijke");
  const hasRole = isProvider || isDeployer;

  const TimingExceptionLines = (
    <div className="mt-2">
      <p className="mb-1">
        <span style={{ color: "#005AA7" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
        {t("riskcat result art50_3 deployer timing item1")}
      </p>
      <p className="mb-0">
        <span style={{ color: "#005AA7" }}>{t("riskcat result art50_3 deployer exception heading")}:</span>{" "}
        {t("riskcat result art50_3 deployer exception item1")}
      </p>
    </div>
  );

  const GuidelinesSource = ({ prefixKey, linkKey, urlKey, suffixKey }: { prefixKey: string; linkKey: string; urlKey: string; suffixKey: string }) => (
    <p className="mt-2 mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)", fontSize: "0.85rem" }}>
      {t(prefixKey)}
      <a href={t(urlKey)} target="_blank" rel="noreferrer">{t(linkKey)}</a>
      {t(suffixKey)}
    </p>
  );

  return (
    <div style={{ fontSize: "0.9rem" }}>
      {!hasRole && (
        <p className="mb-2" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
          {t("obligations art50 role note")}
        </p>
      )}

      {/* Sub-case 1 — interactive AI */}
      <AccordionSubsection label={t("riskcat result art50_1 core obligation heading").replace(/:\s*$/, "")} defaultOpen>
        {isProvider && (
          <div className="mb-2">
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
          <ul className="mb-2 ps-3">
            <li>{t("riskcat result art50_1 deployer step1")}</li>
            <li>{t("riskcat result art50_1 deployer step2")}</li>
          </ul>
        )}
        {hasRole && (
          <>
            {TimingExceptionLines}
            <div className="mt-2">
              <SourceBadge label={t("article art50_1 label")} url={t("article art50_1 url")} />
            </div>
          </>
        )}
      </AccordionSubsection>

      {/* Sub-case 2 — synthetic audio, image, video or text content */}
      <AccordionSubsection label={t("riskcat result art50_2 core obligation heading").replace(/:\s*$/, "")}>
        {isProvider && (
          <div className="mb-2">
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
          <>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_2 deployer step1")}</li>
              <li>{t("riskcat result art50_2 deployer step2")}</li>
            </ul>
            <p className="mb-2">
              <span style={{ color: "#005AA7" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
              {t("riskcat result art50_3 deployer timing item1")}
            </p>
            <p className="mb-1">
              <span style={{ color: "#005AA7" }}>{t("riskcat result art50_2 deployer exceptions heading")}</span>
            </p>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_2 deployer exceptions item1")}</li>
              <li>{t("riskcat result art50_2 deployer exceptions item2")}</li>
              <li>
                {t("riskcat result art50_2 deployer exceptions item3")}{" "}
                <InfoTooltip id="art50_2-acc-exceptions-item3" text={t("riskcat result art50_2 deployer exceptions item3 tooltip")} />
              </li>
            </ul>
          </>
        )}
        {hasRole && (
          <div className="mt-2">
            <SourceBadge label={t("article art50_2 label")} url={t("article art50_2 url")} />
          </div>
        )}
      </AccordionSubsection>

      {/* Sub-case 3 — emotion recognition / biometric categorisation */}
      <AccordionSubsection label={t("riskcat result art50_3 core obligation heading").replace(/:\s*$/, "")}>
        {isProvider && <p className="mb-2">{t("riskcat result art50_3 provider obligation")}</p>}
        {isDeployer && (
          <>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_3 deployer core item1")}</li>
              <li>{t("riskcat result art50_3 deployer core item3")}</li>
              <li>{t("riskcat result art50_3 deployer core item4")}</li>
            </ul>
            {TimingExceptionLines}
          </>
        )}
        {hasRole && (
          <div className="mt-2 d-flex flex-wrap gap-1">
            <SourceBadge label={t("article art50_3 label")} url={t("article art50_3 url")} />
            <SourceBadge label={t("article art50_5 label")} url={t("article art50_5 url")} />
          </div>
        )}
      </AccordionSubsection>

      {/* Sub-case 4 — manipulated public-interest content (deep fakes) */}
      <AccordionSubsection label={t("riskcat result art50_4 core obligation heading").replace(/:\s*$/, "")}>
        {isDeployer ? (
          <>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_2 deployer step1")}</li>
              <li>{t("riskcat result art50_2 deployer step2")}</li>
            </ul>
            <p className="mb-2">
              <span style={{ color: "#005AA7" }}>{t("riskcat result art50_3 deployer timing heading")}:</span>{" "}
              {t("riskcat result art50_3 deployer timing item1")}
            </p>
            <p className="mb-1">
              <span style={{ color: "#005AA7" }}>{t("riskcat result art50_2 deployer exceptions heading")}</span>
            </p>
            <ul className="mb-2 ps-3">
              <li>{t("riskcat result art50_2 deployer exceptions item1")}</li>
              <li>{t("riskcat result art50_2 deployer exceptions item2")}</li>
              <li>
                {t("riskcat result art50_2 deployer exceptions item3")}{" "}
                <InfoTooltip id="art50_4-acc-exceptions-item3" text={t("riskcat result art50_2 deployer exceptions item3 tooltip")} />
              </li>
            </ul>
            <div className="mt-2">
              <SourceBadge label={t("article art50_4 label")} url={t("article art50_4 url")} />
            </div>
          </>
        ) : (
          <p className="mb-0" style={{ fontStyle: "italic", color: "var(--cma-text-muted)" }}>
            {t("obligations art50_4 deployer only note")}
          </p>
        )}
      </AccordionSubsection>
    </div>
  );
}
