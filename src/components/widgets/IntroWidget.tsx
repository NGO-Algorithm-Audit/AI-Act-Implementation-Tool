import { useTranslation } from "react-i18next";
import { Table } from "react-bootstrap";

const BADGE_ROWS: { color: string; textKey: string; conceptTextKey: string; conceptUrl: string; linkParenOnly?: boolean }[] = [
  { color: "#c9a84c", textKey: "badge ai system",   conceptTextKey: "intro concept ai",        conceptUrl: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3", linkParenOnly: true },
  { color: "#198754", textKey: "category gdpr",      conceptTextKey: "intro concept gdpr",      conceptUrl: "https://gdpr-info.eu/art-4-gdpr/",     linkParenOnly: true },
  { color: "#4f46e5", textKey: "badge profiling",    conceptTextKey: "intro concept profiling", conceptUrl: "https://gdpr-info.eu/art-4-gdpr/",     linkParenOnly: true },
  { color: "#6b8a9e", textKey: "badge sadm",         conceptTextKey: "intro concept sadm",      conceptUrl: "https://gdpr-info.eu/art-22-gdpr/",    linkParenOnly: true },
  { color: "#fd7e14", textKey: "badge algo",         conceptTextKey: "intro concept algo",      conceptUrl: "https://aienalgoritmes.pleio.nl/wiki/view/19bb6e9e-7a97-43d5-bef3-b1d66e59f4ff/handreiking-algoritmeregister" },
];

export default function IntroWidget() {
  const { t } = useTranslation();

  return (
    <div>
      <p style={{ marginBottom: "1rem" }}>
        {t("intro text")} {t("intro next steps note")} {t("intro concepts label")}
      </p>

      <Table bordered size="sm" style={{ marginBottom: "1rem" }}>
        <thead>
          <tr>
            <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("intro concept header")}</th>
            <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("table header category")}</th>
          </tr>
        </thead>
        <tbody>
          {BADGE_ROWS.map(({ color, textKey, conceptTextKey, conceptUrl, linkParenOnly }) => {
            const text = t(conceptTextKey);
            const match = linkParenOnly ? text.match(/^(.*?)(\(.*\))(.*)$/s) : null;
            return (
              <tr key={textKey}>
                <td style={{ verticalAlign: "middle" }}>
                  <span
                    className="badge badge-secondary"
                    style={{
                      backgroundColor: color,
                      fontSize: "0.85rem",
                      padding: "3.2px 5.12px",
                      color: "#fff",
                    }}
                  >
                    {t(textKey)}
                  </span>
                </td>
                <td style={{ verticalAlign: "middle", fontSize: "0.875rem" }}>
                  {match ? (
                    <>
                      {match[1]}
                      <a href={conceptUrl} target="_blank" rel="noopener noreferrer">{match[2]}</a>
                      {match[3]}
                    </>
                  ) : (
                    <a href={conceptUrl} target="_blank" rel="noopener noreferrer">
                      {text}
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
