import { useTranslation } from "react-i18next";
import { Table } from "react-bootstrap";

const AI_ACT_ART3_URL = "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3";

type IntroRow = { color: string; labelKey: string; descKey: string; url: string };

const ROLE_ROWS: IntroRow[] = [
  { color: "#6f42c1", labelKey: "aiact2 summary role provider",       descKey: "aiact2 intro role provider desc",       url: AI_ACT_ART3_URL },
  { color: "#0d6efd", labelKey: "aiact2 summary role deployer",       descKey: "aiact2 intro role deployer desc",       url: AI_ACT_ART3_URL },
  { color: "#475569", labelKey: "aiact2 summary role representative", descKey: "aiact2 intro role representative desc", url: AI_ACT_ART3_URL },
  { color: "#198754", labelKey: "aiact2 summary role importer",       descKey: "aiact2 intro role importer desc",       url: AI_ACT_ART3_URL },
  { color: "#fd7e14", labelKey: "aiact2 summary role distributor",    descKey: "aiact2 intro role distributor desc",    url: AI_ACT_ART3_URL },
  { color: "#6b8a9e", labelKey: "aiact2 summary role private",        descKey: "aiact2 intro role private desc",        url: AI_ACT_ART3_URL },
];

const STATUS_ROWS: IntroRow[] = [
  { color: "#2563eb", labelKey: "aiact2 q13 a1", descKey: "aiact2 intro status in use desc",         url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-111" },
  { color: "#8b5cf6", labelKey: "aiact2 q13 a2", descKey: "aiact2 intro status in development desc", url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-113" },
];

export default function RoleStatusIntroWidget() {
  const { t } = useTranslation();

  // Wrap any parenthetical "(...)" in the description text in a link.
  const renderDescription = (text: string, url: string) => {
    const match = text.match(/^(.*?)(\(.*\))(.*)$/s);
    if (!match) return text;
    return (
      <>
        {match[1]}
        <a href={url} target="_blank" rel="noopener noreferrer">{match[2]}</a>
        {match[3]}
      </>
    );
  };

  const renderTable = (headerKey: string, rows: IntroRow[]) => (
    <Table bordered size="sm" style={{ marginBottom: "1rem" }}>
      <thead>
        <tr>
          <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t(headerKey)}</th>
          <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("aiact2 intro role description header")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ color, labelKey, descKey, url }) => (
          <tr key={labelKey}>
            <td style={{ verticalAlign: "middle" }}>
              <span
                className="badge badge-secondary"
                style={{ backgroundColor: color, fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff" }}
              >
                {t(labelKey)}
              </span>
            </td>
            <td style={{ verticalAlign: "middle", fontSize: "0.875rem" }}>
              {renderDescription(t(descKey), url)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div>
      <p style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
        {t("aiact2 intro p2 prefix")}
      </p>

      {renderTable("aiact2 intro role header", ROLE_ROWS)}
      {renderTable("aiact2 intro status header", STATUS_ROWS)}
    </div>
  );
}
