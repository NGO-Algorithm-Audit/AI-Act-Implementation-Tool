import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";

function SourceBadge({ label, url }: { label: string; url: string }) {
  const { hideSourceBadges } = useSettings();
  if (hideSourceBadges && (/^Art\.\s/i.test(label) || /^Annex\s/i.test(label) || /^Bijlage\s/i.test(label) || /^art\.\s/i.test(label))) {
    return null;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="question-badge-link">
      <span className="question-badge" style={{ backgroundColor: "var(--cma-source-legal)" }}>
        {label}
      </span>
    </a>
  );
}

function renderLinks(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      return <a key={i} href={m[2]} target="_blank" rel="noreferrer">{m[1]}</a>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function StepItem({ text }: { text: string }) {
  const idx = text.indexOf(":");
  if (idx === -1) return <li>{renderLinks(text)}</li>;
  return <li><strong>{renderLinks(text.slice(0, idx + 1))}</strong>{renderLinks(text.slice(idx + 1))}</li>;
}

export default function ObligationsSection({
  roles,
  annexIArt6Branch,
  footer,
}: {
  roles: string[];
  annexIArt6Branch?: "A" | "B";
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();

  const has = (r: string) => roles.includes(r);

  // Annex I Section B + Art. 6(1) third-party assessment: only Article 6(1),
  // Articles 102 to 109 and Article 112 of the AI Act apply directly. The
  // detailed Art. 8-17 obligations are integrated into the relevant sectoral
  // regulations (motor vehicles, aviation, rail, ...), not the AI Act, so
  // both Providers and Deployers see a short "no new obligations" line. The
  // long Art. 6(1) / 102-109 / 112 explainer is kept as a fallback for
  // any other role combination (e.g. Importer / Distributor only).
  if (annexIArt6Branch === "B") {
    let shortKey: string | null = null;
    if (has("aanbieder")) shortKey = "riskcat result annex i secB provider only";
    else if (has("gebruiksverantwoordelijke")) shortKey = "riskcat result annex i secB deployer only";
    return (
      <div>
        <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary)" }}>{t("aiact2 result next steps title")}</h6>
        <div style={{ borderTop: "1px solid var(--cma-primary)", paddingTop: "8px", fontSize: "0.9rem" }}>
          {shortKey ? (
            <p className="mb-0">{renderLinks(t(shortKey))}</p>
          ) : (
            <>
              <p className="mb-2">{renderLinks(t("riskcat result annex i secB intro"))}</p>
              <ul className="mb-1 ps-3">
                <StepItem text={t("riskcat result annex i secB art6_1")} />
                <StepItem text={t("riskcat result annex i secB art102_109")} />
                <StepItem text={t("riskcat result annex i secB art112")} />
              </ul>
              <p className="mt-2 mb-0">{renderLinks(t("riskcat result annex i secB sectoral"))}</p>
            </>
          )}
          {footer}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary)" }}>{t("aiact2 result next steps title")}</h6>
      <div style={{ borderTop: "1px solid var(--cma-primary)", paddingTop: "8px", fontSize: "0.9rem" }}>
        {has("privaat") ? (
          <p className="mb-0">{t("aiact2 result private no obligations")}</p>
        ) : has("aanbieder") ? (
          <>
            <div className="mb-2 fw-semibold">{t(annexIArt6Branch === "A" ? "aiact2 result provider heading section a" : "aiact2 result provider heading")}</div>
            <ol className="mb-1 ps-3">
              {[
                t("aiact2 result provider step_art9"),
                t("aiact2 result provider step_art10"),
                t("aiact2 result provider step7"),
                t("aiact2 result provider step9"),
                t("aiact2 result provider step10"),
                t("aiact2 result provider step_art15"),
                t("aiact2 result provider step6"),
                t("aiact2 result provider step1"),
                t("aiact2 result provider step2"),
                t("aiact2 result provider step3"),
                t("aiact2 result provider step4"),
                t("aiact2 result provider step5"),
                t("aiact2 result provider step11"),
              ].map((s, i) => <StepItem key={i} text={s} />)}
            </ol>
            {has("gebruiksverantwoordelijke") && (
              <>
                <div className="mt-2 mb-2">{t("aiact2 result provider source prefix")} <SourceBadge label={t("article art16 label")} url={t("article art16 url")} /></div>
                <div className="mb-2 fw-semibold">{t(annexIArt6Branch === "A" ? "aiact2 result deployer heading section a" : "aiact2 result deployer heading")}</div>
                <ol className="mb-1 ps-3">
                  {[
                    t("aiact2 result deployer step4"),
                    t("aiact2 result deployer step3"),
                    t("aiact2 result deployer step5"),
                    t("aiact2 result deployer step1"),
                    t("aiact2 result deployer step2"),
                    t("aiact2 result deployer step6"),
                    t("aiact2 result deployer step7"),
                    t("aiact2 result deployer step8"),
                  ].map((s, i) => <StepItem key={i} text={s} />)}
                </ol>
                <div className="mt-2 mb-2">{t("aiact2 result deployer source prefix")} <SourceBadge label={t("article art26 deployer label")} url={t("article art26 deployer url")} /></div>
              </>
            )}
            {!has("gebruiksverantwoordelijke") && (
              <div className="mt-2">{t("aiact2 result provider source prefix")} <SourceBadge label={t("article art16 label")} url={t("article art16 url")} /></div>
            )}
          </>
        ) : has("importeur") ? (
          <>
            <div className="mb-2 fw-semibold">{t("aiact2 result importer heading")}</div>
            <ol className="mb-1 ps-3">
              {[
                t("aiact2 result importer step1"),
                t("aiact2 result importer step2"),
                t("aiact2 result importer step3"),
                t("aiact2 result importer step4"),
                t("aiact2 result importer step5"),
                t("aiact2 result importer step6"),
                t("aiact2 result importer step7"),
              ].map((s, i) => <StepItem key={i} text={s} />)}
            </ol>
            <div className="mt-2">{t("aiact2 result importer source prefix")} <SourceBadge label={t("article art23 importer label")} url={t("article art23 importer url")} /></div>
          </>
        ) : has("distributeur") ? (
          <>
            <div className="mb-2 fw-semibold">{t("aiact2 result distributor heading")}</div>
            <ol className="mb-1 ps-3">
              {[
                t("aiact2 result distributor step1"),
                t("aiact2 result distributor step2"),
                t("aiact2 result distributor step3"),
                t("aiact2 result distributor step4"),
                t("aiact2 result distributor step5"),
                t("aiact2 result distributor step6"),
              ].map((s, i) => <StepItem key={i} text={s} />)}
            </ol>
            <div className="mt-2">{t("aiact2 result distributor source prefix")} <SourceBadge label={t("article art24 label")} url={t("article art24 url")} /></div>
          </>
        ) : has("gebruiksverantwoordelijke") ? (
          <>
            <div className="mb-2 fw-semibold">{t(annexIArt6Branch === "A" ? "aiact2 result deployer heading section a" : "aiact2 result deployer heading")}</div>
            <ol className="mb-1 ps-3">
              {[
                t("aiact2 result deployer step4"),
                t("aiact2 result deployer step3"),
                t("aiact2 result deployer step5"),
                t("aiact2 result deployer step1"),
                t("aiact2 result deployer step2"),
                t("aiact2 result deployer step6"),
                t("aiact2 result deployer step7"),
                t("aiact2 result deployer step8"),
              ].map((s, i) => <StepItem key={i} text={s} />)}
            </ol>
            <div className="mt-2">{t("aiact2 result deployer source prefix")} <SourceBadge label={t("article art26 deployer label")} url={t("article art26 deployer url")} /></div>
          </>
        ) : null}
        {footer}
      </div>
    </div>
  );
}
