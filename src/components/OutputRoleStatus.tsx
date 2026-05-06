import React from "react";
import { Alert, Button } from "react-bootstrap";
import { FormProps } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import CodeBlock from "./CodeBlock";
import a11yLight from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-light";
import { dictionaryToCsv } from "../utils/dictionaryToCsv";

type Q12Key = "a3" | "a1" | "a2" | "a6" | "a7" | "a8" | "a11" | "a10";
type Q12bKey = "m1" | "m2" | "m3" | "m4";
type Q13Key = "in_use" | "in_development";
type Role =
  | "provider"
  | "deployer"
  | "representative"
  | "importer"
  | "distributor"
  | "private";

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

export default function OutputRoleStatus({
  id,
  type,
  output: _output,
  step,
  handlePrev,
  onSubmit,
  data,
}: OutputProps) {
  const { t } = useTranslation();
  void _output;

  const q12Map: { key: Q12Key; i18n: string; roles: Role[] }[] = [
    { key: "a3", i18n: "aiact2 q12 a3", roles: ["provider", "deployer"] },
    { key: "a1", i18n: "aiact2 q12 a1", roles: ["provider"] },
    { key: "a2", i18n: "aiact2 q12 a2", roles: ["provider", "deployer"] },
    { key: "a6", i18n: "aiact2 q12 a6", roles: ["provider", "deployer"] },
    { key: "a7", i18n: "aiact2 q12 a7", roles: ["importer"] },
    { key: "a8", i18n: "aiact2 q12 a8", roles: ["distributor"] },
    { key: "a11", i18n: "aiact2 q12 a11", roles: ["representative"] },
    { key: "a10", i18n: "aiact2 q12 a10", roles: ["private"] },
  ];
  const q12bMap: { key: Q12bKey; i18n: string }[] = [
    { key: "m1", i18n: "aiact2 q12b m1" },
    { key: "m2", i18n: "aiact2 q12b m2" },
    { key: "m3", i18n: "aiact2 q12b m3" },
    { key: "m4", i18n: "aiact2 q12b m4" },
  ];

  const q12Match = q12Map.find((m) => data?.q12 === t(m.i18n));
  const q12bMatch = q12bMap.find((m) => data?.q12b === t(m.i18n));
  const q13Key: Q13Key | null =
    data?.q13 === t("aiact2 q13 a1")
      ? "in_use"
      : data?.q13 === t("aiact2 q13 a2")
      ? "in_development"
      : null;

  const effectiveRoles: Role[] =
    q12Match?.key === "a6"
      ? q12bMatch?.key === "m4"
        ? ["deployer"]
        : ["provider"]
      : q12Match?.roles ?? [];

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

  const exportData = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) =>
        !key.startsWith("output") &&
        key !== "q12bblock" &&
        key !== "q13block"
    )
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

      {type === "output" && (
        <>
          <p className="mb-2 mt-3">{t("save output")}</p>
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
