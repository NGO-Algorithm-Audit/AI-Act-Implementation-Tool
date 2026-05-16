import React from "react";
import { Alert, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import AccordionSection from "./AccordionSection";

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

function splitBullet(b: string): { lead: string; subs: string[] } {
  const lines = b.split("\n");
  const lead: string[] = [];
  const subs: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*-\s+(.*)$/);
    if (m) subs.push(m[1]);
    else lead.push(line);
  }
  return { lead: lead.join("\n").trim(), subs };
}

function ExplanationBox({ text, prepend, intro }: { text: string; prepend?: React.ReactNode; intro?: string }) {
  const { t } = useTranslation();
  const bullets = text.split("\n\n").map((s) => s.trim()).filter(Boolean);
  return (
    <Alert style={{ color: "#6d2c91", backgroundColor: "#f5eefa", borderColor: "#d9b3f0" }} className="py-2 px-3 mt-3">
      <small style={{ fontWeight: "bold", display: "block", marginBottom: "2px" }}>{t("user guidance title")}</small>
      {intro && <small style={{ display: "block", marginBottom: "4px" }}>{intro}</small>}
      {(prepend || bullets.length > 1) ? (
        <ul className="mb-0 ps-3" style={{ fontSize: "0.875em" }}>
          {prepend && <li>{prepend}</li>}
          {bullets.map((b, i) => {
            const { lead, subs } = splitBullet(b);
            return (
              <li key={i}>
                {renderLinks(lead)}
                {subs.length > 0 && (
                  <ul className="mb-0 ps-3">
                    {subs.map((s, j) => <li key={j}>{renderLinks(s)}</li>)}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <small style={{ whiteSpace: "pre-wrap" }}>{renderLinks(text)}</small>
      )}
    </Alert>
  );
}

export default function RolesOverviewSection() {
  const { t } = useTranslation();
  return (
    <div className="mb-1">
      <AccordionSection label={t("aiact2 summary title")} noBorder>
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
          <Table bordered size="sm" className="mt-2 mb-0" style={{ minWidth: "2400px" }}>
            <thead>
              <tr>
                {(["aiact2 summary col role","aiact2 summary col rms","aiact2 summary col data","aiact2 summary col logs","aiact2 summary col instructions","aiact2 summary col oversight","aiact2 summary col accuracy","aiact2 summary col qms","aiact2 summary col technical","aiact2 summary col conformity","aiact2 summary col ce","aiact2 summary col declaration","aiact2 summary col registration","aiact2 summary col postmarket","aiact2 summary col literacy","aiact2 summary col workers","aiact2 summary col transparency","aiact2 summary col fria","aiact2 summary col cooperation"] as const).map((k) => (
                  <th key={k} style={{ color: "#000", fontWeight: "bold", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{t(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: "0.8rem" }}>
              {(["provider", "deployer", "importer", "distributor", "private"] as const).map((role) => (
                <tr key={role}>
                  <td style={{ whiteSpace: "nowrap" }}><strong>{t(`aiact2 summary role ${role}`)}</strong></td>
                  {(["rms","data","logs","instructions","oversight","accuracy","qms","technical","conformity","ce","declaration","registration","postmarket","literacy","workers","transparency","fria","cooperation"] as const).map(col => (
                    <td key={col} style={{ minWidth: "160px" }}>{t(`aiact2 summary cell ${role} ${col}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <ExplanationBox
          text={t("aiact2 summary guidance")}
          prepend={
            <span>
              {t("aiact2 result note bullet1 before")}{" "}
              <SourceBadge label={t("article art16 label")} url={t("article art16 url")} />
              {" "}<SourceBadge label={t("article art26 deployer label")} url={t("article art26 deployer url")} />
              {" "}<SourceBadge label={t("article art23 importer label")} url={t("article art23 importer url")} />
              {" "}<SourceBadge label={t("article art24 label")} url={t("article art24 url")} />
              {t("aiact2 result note bullet1 after")}
            </span>
          }
        />
      </AccordionSection>
    </div>
  );
}
