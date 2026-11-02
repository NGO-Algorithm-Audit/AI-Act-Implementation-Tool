import { WidgetProps } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import { Table } from "react-bootstrap";
import Markdown from "markdown-to-jsx";

type Outcome = { label: string; color: string; description: string; url?: string };

/**
 * Opener screen listing a questionnaire's possible outcomes — the schema-driven
 * equivalent of `RiskClassificationIntroWidget`, used by questionnaires that keep
 * their texts per language in their own JSON (NIS2, Pre-scan DPIA).
 *
 * Reads `introText` (markdown) and `outcomes` from `ui:options` on the schema's
 * `intro` property. In each outcome description, the reference in brackets at the
 * end, e.g. "(Art. 3(1) NIS2).", is linked to `url`.
 *
 * Usage in a schema:
 *   properties: { intro: { type: "string", title: "", default: "" }, ... }
 *   uiSchema: {
 *     intro: {
 *       "ui:widget": "OutcomeIntroWidget",
 *       "ui:options": {
 *         label: false,
 *         introText: "...",
 *         outcomes: [{ label: "...", color: "#dc3545", description: "... (Art. 3 ...)", url: "..." }],
 *       },
 *     },
 *   }
 */
export default function OutcomeIntroWidget({ options }: WidgetProps) {
  const { t } = useTranslation();
  const introText = options?.introText as string | undefined;
  const outcomes = (options?.outcomes as Outcome[] | undefined) ?? [];

  return (
    <div>
      {introText && (
        <div style={{ marginBottom: "1rem" }}>
          <Markdown>{introText}</Markdown>
        </div>
      )}

      {outcomes.length > 0 && (
        <Table bordered size="sm" style={{ marginBottom: "1rem" }}>
          <thead>
            <tr>
              <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("ai1 intro outcome header")}</th>
              <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("ai1 intro outcome description header")}</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map(({ label, color, description, url }) => {
              // Link the closing reference "(Art. 3(1) NIS2)", allowing one level of nested brackets.
              const match = url ? description.match(/^(.*)(\((?:[^()]|\([^()]*\))*\))(\.?)$/s) : null;
              return (
                <tr key={label}>
                  <td style={{ verticalAlign: "middle" }}>
                    <span
                      className="badge badge-secondary"
                      style={{ backgroundColor: color, fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff" }}
                    >
                      {label}
                    </span>
                  </td>
                  <td style={{ verticalAlign: "middle", fontSize: "0.875rem" }}>
                    {match ? (
                      <>
                        {match[1]}
                        <a href={url} target="_blank" rel="noopener noreferrer">{match[2]}</a>
                        {match[3]}
                      </>
                    ) : (
                      description
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
