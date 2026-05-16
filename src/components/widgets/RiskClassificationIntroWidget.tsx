import { useTranslation } from "react-i18next";
import { Table } from "react-bootstrap";

const OUTCOME_ROWS: { color: string; badgeKey: string; descKey: string; url: string }[] = [
  { color: "#0d9488", badgeKey: "badge riskcat low",       descKey: "ai1 intro outcome low",       url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5" },
  { color: "#dc3545", badgeKey: "badge riskcat forbidden", descKey: "ai1 intro outcome forbidden", url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5" },
  { color: "#d97706", badgeKey: "badge riskcat high",      descKey: "ai1 intro outcome high",      url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6" },
  { color: "#FFBF00", badgeKey: "badge genai",             descKey: "intro concept genai",         url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50" },
  { color: "#6c757d", badgeKey: "badge riskcat exception", descKey: "ai1 intro outcome exception", url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-2" },
];

export default function RiskClassificationIntroWidget() {
  const { t } = useTranslation();

  return (
    <div>
      <p style={{ marginBottom: "1rem" }}>
        {t("aiact2 intro p1 prefix")}{" "}
        <span className="badge badge-secondary" style={{ fontSize: "0.85rem", padding: "3.2px 5.12px" }}>
          {t("questionnaire 1 name")}
        </span>{" "}
        {t("aiact2 intro p1 suffix")}{" "}
        <span
          className="badge badge-secondary"
          style={{ backgroundColor: "#c9a84c", color: "#fff", fontSize: "0.85rem", padding: "3.2px 5.12px" }}
        >
          {t("badge ai system")}
        </span>
        {t("aiact2 intro p1 suffix2")}
      </p>

      <p style={{ marginBottom: "1rem" }}>
        {t("ai1 intro text")} {t("ai1 intro next steps note")} {t("ai1 intro outcomes label")}
      </p>

      <Table bordered size="sm" style={{ marginBottom: "1rem" }}>
        <thead>
          <tr>
            <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("ai1 intro outcome header")}</th>
            <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("ai1 intro outcome description header")}</th>
          </tr>
        </thead>
        <tbody>
          {OUTCOME_ROWS.map(({ color, badgeKey, descKey, url }) => {
            const desc = t(descKey);
            const match = desc.match(/^(.*?)(\([^)]+\))(.*)$/s);
            return (
              <tr key={badgeKey}>
                <td style={{ verticalAlign: "middle" }}>
                  <span
                    className="badge badge-secondary"
                    style={{ backgroundColor: color, fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff" }}
                  >
                    {t(badgeKey)}
                  </span>
                </td>
                <td style={{ verticalAlign: "middle", fontSize: "0.875rem" }}>
                  {match ? (
                    <>
                      {match[1]}
                      <a href={url} target="_blank" rel="noopener noreferrer">{match[2]}</a>
                      {match[3]}
                    </>
                  ) : desc}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
