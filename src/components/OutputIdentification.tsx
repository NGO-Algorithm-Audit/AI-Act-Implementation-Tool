import { Alert, Button, Table } from "react-bootstrap";
import { FormProps } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import CodeBlock from "./CodeBlock";
import a11yLight from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-light";
import { dictionaryToCsv } from "../utils/dictionaryToCsv";
import AccordionSection from "./AccordionSection";
import type { OutputClassification } from "../schemas/shared/identification-types";

type StatusValue = "yes" | "no" | "maybe" | null;

function statusDisplay(status: StatusValue, notAssessedLabel: string): string {
  if (status === "yes") return "✅";
  if (status === "no") return "❌";
  if (status === "maybe") return "💡";
  return notAssessedLabel;
}

type OutputProps = {
  id: number;
  type: "output" | "error";
  output: Record<string, any>;
  step: number;
  handlePrev: () => void;
  onSubmit: (
    index: number,
    data: FormProps<any, RJSFSchema, any>["formData"]
  ) => void;
  data: FormProps<any, RJSFSchema, any>["schema"];
};

export default function OutputIdentification({
  id,
  type,
  output,
  step,
  handlePrev,
  onSubmit,
  data,
}: OutputProps) {
  const { t } = useTranslation();

  const classification = output?.classification as
    | OutputClassification
    | undefined;

  // Strip schema-internal fields from the export payload.
  data = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) =>
        !key.startsWith("output") &&
        key !== "nextStepsText" &&
        key !== "isAISystem" &&
        key !== "intro"
    )
  );

  const outputDefault: string = output?.default ?? "";

  // Q8 (personal data processed?) and Q8b (profiling?) drive GDPR/profiling rows.
  const gdprStatus: StatusValue =
    data.q8 === t("q8 option no") ? "no" : data.q8 ? "yes" : null;
  const profilingStatus: StatusValue = data.q8b
    ? data.q8b === t("q8b option yes")
      ? "yes"
      : "no"
    : null;
  const profilingTableStatus: StatusValue =
    data.q8 === t("q8 option no") ? "no" : profilingStatus;

  const categoryConfig: Record<
    string,
    { color: string; badgeText: string; nextStepKey: string }
  > = {
    [t("category ai system")]: {
      color: "#c9a84c",
      badgeText: t("badge ai system"),
      nextStepKey: "next step ai",
    },
    [t("category algo")]: {
      color: "#fd7e14",
      badgeText: t("badge algo"),
      nextStepKey: "next step algo",
    },
    [t("category gdpr")]: {
      color: "#198754",
      badgeText: t("category gdpr"),
      nextStepKey: "next step gdpr",
    },
    [t("category sadm")]: {
      color: "#6b8a9e",
      badgeText: t("badge sadm"),
      nextStepKey: "next step sadm",
    },
    [t("category profiling")]: {
      color: "#4f46e5",
      badgeText: t("badge profiling"),
      nextStepKey: "next step profiling",
    },
  };

  const tableRows = classification
    ? [
        {
          category: t("category ai system"),
          status: classification.ai,
        },
        {
          category: t("category algo"),
          status: classification.algo,
        },
        {
          category: t("category gdpr"),
          status: gdprStatus,
        },
        {
          category: t("category sadm"),
          status: classification.sadm,
        },
        {
          category: t("category profiling"),
          status: profilingTableStatus,
        },
      ]
    : null;

  const summaryClauses: { badge: string; color: string }[] = [];
  if (classification?.ai === "yes")
    summaryClauses.push({ badge: t("badge ai system"), color: "#c9a84c" });
  if (classification?.algo === "yes")
    summaryClauses.push({ badge: t("badge algo"), color: "#fd7e14" });
  if (gdprStatus === "yes")
    summaryClauses.push({ badge: t("category gdpr"), color: "#198754" });
  if (classification?.sadm === "yes" || classification?.sadm === "maybe")
    summaryClauses.push({ badge: t("badge sadm"), color: "#6b8a9e" });
  if (profilingStatus === "yes")
    summaryClauses.push({ badge: t("badge profiling"), color: "#4f46e5" });

  const exportData = { ...data, output: outputDefault };

  return (
    <div className="d-flex flex-column gap-3" style={{ padding: "1rem" }}>
      <div>
        <h5 className="mb-0 fw-bold mt-1" style={{ color: "#005AA7" }}>
          {output?.title}
        </h5>
        <hr className="mt-2 mb-0" />
      </div>

      {tableRows && (
        <p
          style={{
            marginTop: "0.75rem",
            marginBottom: "0.75rem",
            fontSize: "0.95rem",
          }}
        >
          {summaryClauses.length === 0 ? (
            t("summary none")
          ) : (
            <>
              {t("summary intro")}{" "}
              {summaryClauses.map((clause, i) => (
                <span
                  key={i}
                  style={{ marginLeft: i === 0 ? 0 : "4px" }}
                >
                  <span
                    className="badge badge-secondary"
                    style={{
                      backgroundColor: clause.color,
                      fontSize: "0.85rem",
                      padding: "3.2px 5.12px",
                      color: "#fff",
                      verticalAlign: "middle",
                    }}
                  >
                    {clause.badge}
                  </span>
                </span>
              ))}
              {". "}
              {t("summary next steps")}
            </>
          )}
        </p>
      )}

      {tableRows ? (
        <Table bordered responsive size="sm">
          <thead>
            <tr>
              <th
                style={{
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                }}
              >
                {t("table header category")}
              </th>
              <th
                style={{
                  width: "120px",
                  textAlign: "center",
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                }}
              >
                {t("table header applicable")}
              </th>
              <th
                style={{
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                }}
              >
                {t("table header next steps")}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(({ category, status }) => {
              const cfg = categoryConfig[category];
              const showNextStep = status === "yes" || status === "maybe";
              return (
                <tr key={category}>
                  <td>
                    <span
                      className="badge badge-secondary"
                      style={{
                        fontSize: "0.85rem",
                        padding: "3.2px 5.12px",
                        color: "#fff",
                        backgroundColor: cfg.color,
                        opacity: status === "maybe" ? 0.75 : 1,
                      }}
                    >
                      {cfg.badgeText}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {statusDisplay(status, t("status not assessed"))}
                  </td>
                  <td style={{ fontSize: "0.875rem" }}>
                    {showNextStep ? t(cfg.nextStepKey) : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <Alert variant="primary">{outputDefault}</Alert>
      )}

      {data?.additionalOutputText && (
        <Alert variant="info">{data.additionalOutputText}</Alert>
      )}

      {type === "output" && (
        <>
          <AccordionSection label={t("export results")} noBorder>
            <p className="mb-2">{t("save output")}</p>
            <CodeBlock
              style={a11yLight}
              code={dictionaryToCsv(
                exportData as unknown as Record<string, string | number>
              )}
              language={"typescript"}
              title={"CSV"}
              wrapLongLines={false}
            />
            <CodeBlock
              style={a11yLight}
              code={JSON.stringify(exportData, null, 2)}
              language={"json"}
              title="JSON"
              wrapLongLines={false}
            />
          </AccordionSection>
          <Alert variant="warning" className="my-2">
            <small>{t("disclaimer")}</small>
          </Alert>
        </>
      )}

      <div>
        <div
          style={{
            display: "inline-block",
            marginTop: "8px",
            marginBottom: "4px",
          }}
        >
          <span className="badge badge-secondary">
            id: {t("questionnaire 1 name")} results
          </span>
        </div>
        <div className="d-flex flex-row justify-content-between flex-row-reverse">
          <Button
            onClick={() => onSubmit(id, exportData)}
            variant="primary"
            type="submit"
          >
            {t("done")}
          </Button>
          {step > 0 && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handlePrev}
              style={{ marginRight: "8px" }}
            >
              {t("back")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
