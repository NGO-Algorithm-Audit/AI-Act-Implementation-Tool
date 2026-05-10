import { useTranslation } from "react-i18next";
import { Table } from "react-bootstrap";
import { useAppContext } from "../../context/AppContext";

const OUTCOME_ROWS: { color: string; badgeKey: string; descKey: string; url: string }[] = [
  { color: "#0d9488", badgeKey: "badge riskcat low",       descKey: "ai1 intro outcome low",       url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5" },
  { color: "#dc3545", badgeKey: "badge riskcat forbidden", descKey: "ai1 intro outcome forbidden", url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5" },
  { color: "#d97706", badgeKey: "badge riskcat high",      descKey: "ai1 intro outcome high",      url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6" },
  { color: "#FFBF00", badgeKey: "badge genai",             descKey: "intro concept genai",         url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50" },
  { color: "#6c757d", badgeKey: "badge riskcat exception", descKey: "ai1 intro outcome exception", url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-2" },
];

const ROLE_BADGE: Record<string, { labelKey: string; color: string }> = {
  aanbieder:                  { labelKey: "aiact2 summary role provider",    color: "var(--cma-role-provider)" },
  gebruiksverantwoordelijke:  { labelKey: "aiact2 summary role deployer",    color: "var(--cma-role-deployer)" },
  importeur:                  { labelKey: "aiact2 summary role importer",    color: "var(--cma-role-importer)" },
  distributeur:               { labelKey: "aiact2 summary role distributor", color: "var(--cma-role-distributor)" },
};

export default function RiskClassificationIntroWidget() {
  const { t } = useTranslation();
  const { role, onStartQuestionnaire } = useAppContext();

  const hasRole = !!role;
  const roleBadgeMeta = role ? ROLE_BADGE[role] : null;

  const roleStatusName = t("questionnaire 3 name");

  const roleStatusBadge = (
    <span
      role={onStartQuestionnaire ? "button" : undefined}
      tabIndex={onStartQuestionnaire ? 0 : undefined}
      onClick={onStartQuestionnaire ? () => onStartQuestionnaire("AI2") : undefined}
      onKeyDown={
        onStartQuestionnaire
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onStartQuestionnaire("AI2");
              }
            }
          : undefined
      }
      className="badge badge-secondary"
      style={{
        fontSize: "0.85rem",
        padding: "3.2px 5.12px",
        cursor: onStartQuestionnaire ? "pointer" : "default",
      }}
    >
      {roleStatusName}
    </span>
  );

  const roleBadge =
    roleBadgeMeta && (
      <span
        className="badge badge-secondary"
        style={{
          backgroundColor: roleBadgeMeta.color,
          color: "#fff",
          fontSize: "0.85rem",
          padding: "3.2px 5.12px",
        }}
      >
        {t(roleBadgeMeta.labelKey)}
      </span>
    );

  return (
    <div>
      <div>
        <span
          className="badge badge-secondary"
          style={{ backgroundColor: "#c9a84c", fontSize: "0.85rem", padding: "3.2px 5.12px" }}
        >
          {t("badge ai system")}
        </span>
        {roleBadge && <>{" "}{roleBadge}</>}
      </div>

      <p style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        {t("aiact2 intro p1 prefix")}{" "}
        <span className="badge badge-secondary" style={{ fontSize: "0.85rem", padding: "3.2px 5.12px" }}>
          {t("questionnaire 1 name")}
        </span>{" "}
        {t("aiact2 intro p1 suffix")}
      </p>

      {hasRole ? (
        <p style={{ marginBottom: "1rem" }}>
          {t("ai1 intro role present prefix")}{" "}
          {roleBadge}
          {t("ai1 intro role present middle")}{" "}
          {roleStatusBadge}
          {t("ai1 intro role present suffix")}
        </p>
      ) : (
        <p style={{ marginBottom: "1rem" }}>
          {t("ai1 intro role missing prefix")}{" "}
          {roleStatusBadge}
          <span style={{ marginLeft: "0.4rem" }}>
            {t("ai1 intro role missing suffix")}
          </span>
        </p>
      )}

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
