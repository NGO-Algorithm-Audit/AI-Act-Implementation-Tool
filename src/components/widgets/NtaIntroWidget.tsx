import { WidgetProps } from "@rjsf/utils";

/**
 * Opener screen for an NTA 8047 sub-questionnaire (Wenselijkheid, Ontwerp,
 * Verificatie, Gebruik) — the NTA equivalent of `IntroWidget` /
 * `RoleStatusIntroWidget` used by the AI Act questionnaires.
 *
 * Unlike those, this widget takes no hardcoded content: it reads
 * `introText` (a lead paragraph) and `items` (a bullet list — typically
 * "what you need before starting this chapter") from `ui:options` on the
 * schema's `intro` property, so each NTA chapter's opener is authored in its
 * own JSON file rather than in a dedicated .tsx per chapter.
 *
 * Usage in a schema:
 *   properties: { intro: { type: "string", title: "", default: "" }, ... }
 *   uiSchema: {
 *     intro: {
 *       "ui:widget": "NtaIntroWidget",
 *       "ui:options": {
 *         label: false,
 *         introText: "...",
 *         items: ["...", "..."],
 *       },
 *     },
 *   }
 */
export default function NtaIntroWidget({ options }: WidgetProps) {
  const introText = options?.introText as string | undefined;
  const items = (options?.items as string[] | undefined) ?? [];

  return (
    <div>
      {introText && <p style={{ marginBottom: items.length ? "0.75rem" : 0 }}>{introText}</p>}
      {items.length > 0 && (
        <ul className="mb-0 ps-3">
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: "0.35rem" }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
