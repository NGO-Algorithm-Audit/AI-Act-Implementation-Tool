import { useTranslation } from "react-i18next";
import { Alert, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import aiGeneratedSvgRaw from "../../assets/ai-generated.svg?raw";

const BADGE_ROWS: { color: string; textKey: string; conceptTextKey: string; conceptUrl: string; linkParenOnly?: boolean }[] = [
  { color: "#c9a84c", textKey: "badge ai system",   conceptTextKey: "intro concept ai",        conceptUrl: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3", linkParenOnly: true },
  { color: "#fd7e14", textKey: "badge algo",         conceptTextKey: "intro concept algo",      conceptUrl: "https://aienalgoritmes.pleio.nl/wiki/view/19bb6e9e-7a97-43d5-bef3-b1d66e59f4ff/handreiking-algoritmeregister" },
  { color: "#198754", textKey: "category gdpr",      conceptTextKey: "intro concept gdpr",      conceptUrl: "https://gdpr-info.eu/art-4-gdpr/",     linkParenOnly: true },
  { color: "#4f46e5", textKey: "badge profiling",    conceptTextKey: "intro concept profiling", conceptUrl: "https://gdpr-info.eu/art-4-gdpr/",     linkParenOnly: true },
  { color: "#6b8a9e", textKey: "badge sadm",         conceptTextKey: "intro concept sadm",      conceptUrl: "https://gdpr-info.eu/art-22-gdpr/",    linkParenOnly: true },
];

const SVG_COLOR = "#8B4513";
const svgColored = aiGeneratedSvgRaw.replace("<svg ", `<svg fill="${SVG_COLOR}" `);

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

      <Alert
        style={{
          color: "#8B4513",
          backgroundColor: "#FFF0E0",
          borderColor: "#E8C49A",
        }}
        className="py-2 px-3 d-flex align-items-center gap-2 mb-0"
      >
        <span
          dangerouslySetInnerHTML={{ __html: svgColored }}
          style={{ display: "inline-flex", width: "24px", height: "24px", flexShrink: 0, alignSelf: "center" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "6px", alignSelf: "center" }}>
          <small>{t("intro ai note")}</small>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="intro-ai-note-tooltip" style={{ maxWidth: "320px" }}>
                {t("meta data ai note tooltip")}
              </Tooltip>
            }
          >
            <span style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7.5" stroke="#8B4513" />
                <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#8B4513" fontFamily="Arial, sans-serif" fontWeight="bold">i</text>
              </svg>
            </span>
          </OverlayTrigger>
        </div>
      </Alert>
    </div>
  );
}
