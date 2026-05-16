import React from "react";
import { Alert, Button } from "react-bootstrap";
import { FormProps } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import CodeBlock from "./CodeBlock";
import a11yLight from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-light";
import { dictionaryToCsv } from "../utils/dictionaryToCsv";
import { deriveRolesAndStatus, type Role } from "../utils/roleStatus";
import AccordionSection from "./AccordionSection";

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
  onStartQuestionnaire?: (key: string) => void;
  data: FormProps<any, RJSFSchema, any>["schema"];
  uiSchema?: FormProps<any, RJSFSchema, any>["uiSchema"];
};

export default function OutputRoleStatus({
  id,
  type,
  output: _output,
  step,
  handlePrev,
  onSubmit,
  onStartQuestionnaire,
  data,
  uiSchema,
}: OutputProps) {
  const { t } = useTranslation();
  void _output;

  const { roles: effectiveRoles, status: q13Key } = deriveRolesAndStatus(
    data,
    t
  );

  const roleColors: Record<Role, string> = {
    provider: "#6f42c1",
    deployer: "#0891b2",
    representative: "#475569",
    importer: "#65a30d",
    distributor: "#92400e",
    private: "#0f766e",
  };
  const roleBadgeKey: Record<Role, string> = {
    provider: "aiact2 summary role provider",
    deployer: "aiact2 summary role deployer",
    representative: "aiact2 summary role representative",
    importer: "aiact2 summary role importer",
    distributor: "aiact2 summary role distributor",
    private: "aiact2 summary role private",
  };
  const roleArtLabelKey: Partial<Record<Role, string>> = {
    provider: "article art3_3 label",
    deployer: "article art3_4 label",
    representative: "article art3_5 label",
    importer: "article art3_6 label",
    distributor: "article art3_7 label",
  };
  const roleArtUrlKey: Partial<Record<Role, string>> = {
    provider: "article art3_3 url",
    deployer: "article art3_4 url",
    representative: "article art3_5 url",
    importer: "article art3_6 url",
    distributor: "article art3_7 url",
  };

  const isPrivate = effectiveRoles.includes("private");
  const timelineText =
    q13Key === "in_use"
      ? t("aiact2 result in use text")
      : q13Key === "in_development"
      ? t("aiact2 result in development text")
      : "";
  const statusBadgeColor = q13Key === "in_use" ? "#2563eb" : "#8b5cf6";
  const statusBadgeLabel =
    q13Key === "in_use"
      ? t("aiact2 q13 a1")
      : q13Key === "in_development"
      ? t("aiact2 q13 a2")
      : "";

  // Raw export payload — keeps the schema field names (q12, q12b, q13) so the
  // role derivation downstream (App.tsx deriveRole, deriveRolesAndStatus) keeps
  // working when this is passed to onSubmit.
  const exportData = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) =>
        !key.startsWith("output") &&
        key !== "q12bblock" &&
        key !== "q13block"
    )
  );

  // Human-readable copy for the CSV/JSON export: re-key each answer to the
  // questionnaire's display ID (Q1, Q2, Q3) instead of the schema field name.
  const exportDisplayData = Object.fromEntries(
    Object.entries(exportData)
      .filter(([key]) => key !== "intro")
      .map(([key, value]) => {
        const uiId = (uiSchema as Record<string, any> | undefined)?.[key]?.[
          "ui:id"
        ];
        return [typeof uiId === "string" ? uiId : key, value];
      })
  );

  // Clickable questionnaire-name badge: navigates to the questionnaire when
  // `onStartQuestionnaire` is provided.
  const questionnaireBadge = (label: string, key: string) => (
    <span
      role={onStartQuestionnaire ? "button" : undefined}
      tabIndex={onStartQuestionnaire ? 0 : undefined}
      onClick={onStartQuestionnaire ? () => onStartQuestionnaire(key) : undefined}
      onKeyDown={
        onStartQuestionnaire
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onStartQuestionnaire(key);
              }
            }
          : undefined
      }
      className="badge"
      style={{
        backgroundColor: "#005AA7",
        color: "#fff",
        fontSize: "0.85rem",
        padding: "3.2px 5.12px",
        cursor: onStartQuestionnaire ? "pointer" : "default",
        verticalAlign: "middle",
      }}
    >
      {label}
    </span>
  );

  return (
    <div className="d-flex flex-column gap-3" style={{ padding: "1rem" }}>
      <div>
        <h5 className="mb-0 fw-bold mt-1" style={{ color: "#005AA7" }}>
          {t("aiact2 result section title")}
        </h5>
        <hr className="mt-2 mb-0" />
      </div>

      <div>
        <h6 className="fw-bold mb-1 mt-2" style={{ color: "#005AA7" }}>
          {t("aiact2 result role label")}
        </h6>
        <div style={{ borderTop: "1px solid #005AA7", paddingTop: "8px" }}>
          {isPrivate ? (
            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
              {t("aiact2 result role identified prefix")}{" "}
              <span
                className="badge"
                style={{
                  backgroundColor: roleColors.private,
                  color: "#fff",
                  fontSize: "0.85rem",
                  padding: "3.2px 5.12px",
                }}
              >
                {t("aiact2 summary role private")}
              </span>{" "}
              {t("aiact2 result role identified suffix")}
            </p>
          ) : (
            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
              {t("aiact2 result role identified prefix")}{" "}
              {effectiveRoles.map((role, i) => (
                <React.Fragment key={role}>
                  {i > 0 && <> {t("and")} </>}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: roleColors[role],
                      color: "#fff",
                      fontSize: "0.85rem",
                      padding: "3.2px 5.12px",
                    }}
                  >
                    {t(roleBadgeKey[role])}
                  </span>
                </React.Fragment>
              ))}{" "}
              {t("aiact2 result role identified suffix")}{" "}
              {effectiveRoles.length > 1
                ? t("aiact2 result role definition prefix plural")
                : t("aiact2 result role definition prefix")}{" "}
              {effectiveRoles.map((role, i) => {
                const labelKey = roleArtLabelKey[role];
                const urlKey = roleArtUrlKey[role];
                if (!labelKey || !urlKey) return null;
                return (
                  <React.Fragment key={role}>
                    {i > 0 && <> {t("and")} </>}
                    <a
                      href={t(urlKey)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#F37962",
                          color: "#fff",
                          fontSize: "0.85rem",
                          padding: "3.2px 5.12px",
                        }}
                      >
                        {t(labelKey)}
                      </span>
                    </a>
                  </React.Fragment>
                );
              })}
              {". "}
            </p>
          )}
        </div>
      </div>

      {!isPrivate && q13Key && (
        <div>
          <h6 className="fw-bold mb-1 mt-2" style={{ color: "#005AA7" }}>
            {t("aiact2 result timelines title")}
          </h6>
          <div style={{ borderTop: "1px solid #005AA7", paddingTop: "8px" }}>
            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
              {t("aiact2 result ai system status prefix")}{" "}
              <span
                className="badge"
                style={{
                  backgroundColor: statusBadgeColor,
                  color: "#fff",
                  fontSize: "0.85rem",
                  padding: "3.2px 5.12px",
                }}
              >
                {statusBadgeLabel}
              </span>
              {". "}
              {timelineText}
            </p>
          </div>
        </div>
      )}

      {!isPrivate && q13Key && (
        <div>
          <h6 className="fw-bold mb-1 mt-2" style={{ color: "#005AA7" }}>
            {t("aiact2 next steps heading")}
          </h6>
          <div style={{ borderTop: "1px solid #005AA7", paddingTop: "8px" }}>
            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
              {t("aiact2 result next steps prefix")}{" "}
              {questionnaireBadge(t("questionnaire 2 name"), "AI1")}{" "}
              {t("and")}{" "}
              {questionnaireBadge(t("questionnaire 4 name"), "OBL")}
              {t("aiact2 result next steps suffix")}
            </p>
          </div>
        </div>
      )}

      {type === "output" && (
        <div style={{ marginTop: "1rem" }}>
          <AccordionSection label={t("export results")} noBorder>
            <p className="mb-2">{t("save output")}</p>
            <CodeBlock
              style={a11yLight}
              code={dictionaryToCsv(
                exportDisplayData as unknown as Record<string, string | number>
              )}
              language={"typescript"}
              title={"CSV"}
              wrapLongLines={false}
            />
            <CodeBlock
              style={a11yLight}
              code={JSON.stringify(exportDisplayData, null, 2)}
              language={"json"}
              title="JSON"
              wrapLongLines={false}
            />
          </AccordionSection>
          <Alert variant="warning" className="my-2">
            <small>{t("disclaimer")}</small>
          </Alert>
        </div>
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
            id: {t("questionnaire 3 name")} results
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
