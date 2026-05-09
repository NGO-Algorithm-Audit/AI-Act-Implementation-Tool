import Form from "@rjsf/bootstrap-4";
import { FormProps } from "@rjsf/core";
import {
  DescriptionFieldProps,
  FieldTemplateProps,
  GenericObjectType,
  getTemplate,
  getUiOptions,
  retrieveSchema,
  RJSFSchema,
} from "@rjsf/utils";
import { useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { t as i18nT } from "i18next";
import Markdown from "markdown-to-jsx";

const MD_INLINE_OPTS = { forceInline: true } as const;
import Output from "./Output";
import OutputIdentification from "./OutputIdentification";
import OutputRoleStatus from "./OutputRoleStatus";
import OutputRiskClassification from "./OutputRiskClassification";
import QuestionBadge from "./QuestionBadge";
import TooltipCheckboxesWidget from "./widgets/TooltipCheckboxesWidget";
import TooltipRadioWidget from "./widgets/TooltipRadioWidget";
import IntroWidget from "./widgets/IntroWidget";
import RoleStatusIntroWidget from "./widgets/RoleStatusIntroWidget";
import RiskClassificationIntroWidget from "./widgets/RiskClassificationIntroWidget";
import { useTranslation } from "react-i18next";

function PlainTextWidget({ value }: { value: string }) {
  return <p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{value}</p>;
}

function UserGuidanceAlert({ text }: { text: string }) {
  const sections = String(text)
    .split("\n\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const noInlineBullets = sections.every((s) => !s.includes("\n- "));
  const renderAsBulletList = sections.length > 1 && noInlineBullets;
  return (
    <Alert
      style={{
        color: "#6d2c91",
        backgroundColor: "#f5eefa",
        borderColor: "#d9b3f0",
      }}
      className="py-2 px-3 mt-3"
    >
      <small
        style={{
          fontWeight: "bold",
          display: "block",
          marginBottom: "2px",
        }}
      >
        {i18nT("user guidance title")}
      </small>
      {renderAsBulletList ? (
        <ul
          className="mb-0 ps-3"
          style={{ fontSize: "0.875em" }}
        >
          {sections.map((section, i) => (
            <li key={i} style={{ whiteSpace: "pre-wrap" }}>
              <Markdown options={MD_INLINE_OPTS}>{section}</Markdown>
            </li>
          ))}
        </ul>
      ) : (
        sections.map((section, i) => {
          if (section.includes("\n- ")) {
            const parts = section.split("\n- ");
            const intro = parts[0];
            const bullets = parts.slice(1);
            return (
              <div key={i}>
                {intro && (
                  <small style={{ display: "block", whiteSpace: "pre-wrap" }}>
                    <Markdown options={MD_INLINE_OPTS}>{intro}</Markdown>
                  </small>
                )}
                <ul className="mb-0 ps-3" style={{ fontSize: "0.875em" }}>
                  {bullets.map((b, j) => (
                    <li key={j}>
                      <Markdown options={MD_INLINE_OPTS}>{b}</Markdown>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <small
              key={i}
              style={{ whiteSpace: "pre-wrap", display: "block" }}
            >
              <Markdown options={MD_INLINE_OPTS}>{section}</Markdown>
            </small>
          );
        })
      )}
    </Alert>
  );
}

function DescriptionFieldTemplate({
  description,
  uiSchema,
}: DescriptionFieldProps) {
  const uiOptions = getUiOptions(uiSchema ?? {});
  const isPlain = uiOptions["descriptionStyle"] === "plain";
  if (isPlain) {
    const alertText = uiOptions["alertDescription"] as string | undefined;
    if (!alertText) return null;
    return <UserGuidanceAlert text={alertText} />;
  }
  // Prefer the raw `ui:description` string from uiSchema. When
  // `enableMarkdownInDescription: true` is set, RJSF wraps the description in a
  // <Markdown> element before passing it as the `description` prop, so falling
  // back to String(description) would yield "[object Object]".
  const rawDescription =
    (uiOptions["description"] as string | undefined) ??
    (typeof description === "string" ? description : undefined);
  if (!rawDescription) return null;
  return <UserGuidanceAlert text={rawDescription} />;
}

function FieldTemplate({
  id,
  children,
  displayLabel,
  rawErrors = [],
  errors,
  help,
  description,
  rawDescription,
  label,
  hidden,
  required,
  schema,
  uiSchema,
  registry,
  classNames,
  style,
  disabled,
  onDropPropertyClick,
  onKeyChange,
  readonly,
}: FieldTemplateProps) {
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate(
    "WrapIfAdditionalTemplate",
    registry,
    uiOptions
  );
  if (hidden) return <div className="hidden">{children}</div>;
  const isPlainDescription = uiOptions["descriptionStyle"] === "plain";
  return (
    <WrapIfAdditionalTemplate
      classNames={classNames}
      style={style}
      disabled={disabled}
      id={id}
      label={label}
      onDropPropertyClick={onDropPropertyClick}
      onKeyChange={onKeyChange}
      readonly={readonly}
      required={required}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
    >
      <div className="form-group">
        {displayLabel && (
          <label
            htmlFor={id}
            className={rawErrors.length > 0 ? "text-danger" : ""}
            style={isPlainDescription ? { marginBottom: 0 } : undefined}
          >
            {label}
            {required ? "*" : null}
          </label>
        )}
        {isPlainDescription && rawDescription && (
          <small className="form-text text-muted d-block mb-2">
            <Markdown options={MD_INLINE_OPTS}>{rawDescription}</Markdown>
          </small>
        )}
        {children}
        {isPlainDescription && uiOptions["alertDescription"] && description}
        {!isPlainDescription && displayLabel && description}
        {errors}
        {help}
      </div>
    </WrapIfAdditionalTemplate>
  );
}

const tooltipWidgets = {
  CheckboxesWidget: TooltipCheckboxesWidget,
  RadioWidget: TooltipRadioWidget,
  PlainTextWidget,
  IntroWidget,
  RoleStatusIntroWidget,
  RiskClassificationIntroWidget,
};

const WizardForm = ({
  id,
  schema,
  uiSchema,
  formData,
  onSubmit,
  onCancel,
  validator,
  aiAct2Roles,
  onStartQuestionnaire,
}: {
  id: number;
  schema: FormProps<any, RJSFSchema, any>["schema"];
  uiSchema: FormProps<any, RJSFSchema, any>["uiSchema"];
  formData: FormProps<any, RJSFSchema, any>["formData"];
  aiAct2Roles?: string[] | null;
  onStartQuestionnaire?: (key: string) => void;
  onSubmit: (
    index: number,
    data: FormProps<any, RJSFSchema, any>["formData"]
  ) => void;
  onCancel: (index: number) => void;
  validator: FormProps<any, RJSFSchema, any>["validator"];
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(formData || {});

  const flattenSchema = (
    resolvedSchema: any,
    rootSchema: any
  ): GenericObjectType => {
    const flattenedProperties: any = {};
    const requiredFields: string[] = [];

    // Helper to add properties from a schema object
    const addProperties = (schemaObject: any) => {
      // Add required fields from this schema object
      if (schemaObject.required) {
        requiredFields.push(...schemaObject.required);
      }

      // Handle regular properties
      Object.entries(schemaObject.properties || {}).forEach(
        ([key, value]: [string, any]) => {
          if (value && typeof value === "object") {
            if ("properties" in value) {
              // If it's a nested object with properties, resolve and add its properties
              const resolvedNestedSchema = retrieveSchema(
                validator,
                value,
                rootSchema,
                data
              );
              addProperties(resolvedNestedSchema);
            } else {
              flattenedProperties[key] = value;
            }
          } else {
            flattenedProperties[key] = value;
          }
        }
      );

      // Handle dependencies
      Object.entries(schemaObject.dependencies || {}).forEach(
        ([key, dependency]: [string, any]) => {
          if (data[key] && dependency.oneOf) {
            // Find matching schema in oneOf array
            const matchingSchema = dependency.oneOf.find((oneOfSchema: any) => {
              const enumValue = oneOfSchema.properties?.[key]?.enum?.[0];
              return enumValue === data[key];
            });

            if (matchingSchema) {
              // Resolve the matching schema
              const resolvedDependencySchema = retrieveSchema(
                validator,
                matchingSchema,
                rootSchema,
                data
              );

              // Add required fields from the dependency schema
              if (resolvedDependencySchema.required) {
                requiredFields.push(...resolvedDependencySchema.required);
              }

              // Add properties from the resolved dependency schema
              Object.entries(resolvedDependencySchema.properties || {}).forEach(
                ([depKey, depValue]) => {
                  if (depKey !== key) {
                    flattenedProperties[depKey] = depValue;
                  }
                }
              );
            }
          }
        }
      );
    };

    // Start with the main schema
    addProperties(resolvedSchema);

    return {
      ...resolvedSchema,
      properties: flattenedProperties,
      required: requiredFields,
    };
  };

  // Get all visible fields (excluding hidden ones)
  const getVisibleFields = (flattenedSchema: any): string[] => {
    return Object.keys(flattenedSchema?.properties ?? {}).filter(
      (fieldName) => {
        // Check if the field is hidden in uiSchema
        const fieldUiSchema = uiSchema?.[fieldName];
        return fieldUiSchema?.["ui:widget"] !== "hidden";
      }
    );
  };

  // Get hidden fields with their default values
  const getHiddenFieldsWithDefaults = (
    flattenedSchema: any
  ): Record<string, any> => {
    const hiddenFields: Record<string, any> = {};

    Object.entries(flattenedSchema?.properties ?? {}).forEach(
      ([fieldName, fieldSchema]: [string, any]) => {
        const fieldUiSchema = uiSchema?.[fieldName];
        if (fieldUiSchema?.["ui:widget"] === "hidden") {
          // Add the default value if it exists
          if (fieldSchema.default !== undefined) {
            hiddenFields[fieldName] = fieldSchema.default;
          }
        }
      }
    );

    return hiddenFields;
  };

  const getCurrentStepSchema = (
    validator: FormProps<any, RJSFSchema, any>["validator"],
    schema: FormProps<any, RJSFSchema, any>["schema"],
    currentData: FormProps<any, RJSFSchema, any>["formData"]
  ): GenericObjectType => {
    // First resolve the schema with the full root schema
    const resolvedSchema = retrieveSchema(
      validator,
      schema,
      schema,
      currentData
    );

    // Then flatten it while maintaining access to the root schema for nested references
    const flattenedSchema = flattenSchema(resolvedSchema, schema);

    // Get visible fields only
    const visibleFields = getVisibleFields(flattenedSchema);
    const property = visibleFields[step];

    if (flattenedSchema?.properties?.[property]) {
      return {
        type: "object",
        required: flattenedSchema?.required?.filter(
          (x: string) => x === property
        ),
        definitions: schema.definitions,
        properties: { [property]: flattenedSchema?.properties?.[property] },
      };
    }

    return {
      type: "object",
      properties: {
        error: {
          title: t("error title"),
          type: "string",
          default: t("error message"),
        },
      },
    };
  };

  const handleValidate = (formData: any, errors: any) => {
    const currentSchema = getCurrentStepSchema(validator, schema, data);
    const currentField = Object.keys(currentSchema.properties)[0];

    const fieldValue = formData[currentField];
    const fieldSchema = currentSchema.properties?.[currentField];
    const isArrayField = fieldSchema?.type === "array";
    const minItems = fieldSchema?.minItems ?? 0;
    const isEmpty = isArrayField
      ? !Array.isArray(fieldValue) || fieldValue.length < Math.max(minItems, 1)
      : fieldValue === undefined || fieldValue === "";

    if (
      (currentSchema.required?.includes(currentField) ||
        (isArrayField && minItems >= 1)) &&
      isEmpty
    ) {
      errors[currentField].addError(t("required field"));
    }

    if (isArrayField && Array.isArray(fieldValue) && fieldValue.length >= 2) {
      const NOTA = ["None of the above", "Geen van de bovenstaande"];
      const hasNOTA = fieldValue.some((v) => NOTA.includes(v));
      const hasOther = fieldValue.some((v) => !NOTA.includes(v));
      if (hasNOTA && hasOther) {
        errors[currentField].addError(t("invalid answer combination"));
      }
    }

    return errors;
  };

  const handleNext = (formData: typeof data) => {
    // Get the flattened schema to access hidden fields
    const resolvedSchema = retrieveSchema(validator, schema, schema, data);
    const flattenedSchema = flattenSchema(resolvedSchema, schema);

    // Get hidden fields with their default values
    const hiddenFieldsWithDefaults =
      getHiddenFieldsWithDefaults(flattenedSchema);

    // Merge form data with hidden fields defaults
    const mergedData = { ...formData, ...hiddenFieldsWithDefaults };

    setData((prevData: typeof data) => ({ ...prevData, ...mergedData }));
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrev = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const currentStepSchema = getCurrentStepSchema(validator, schema, data);

  // Get visible fields for step calculation
  // const resolvedSchema = retrieveSchema(validator, schema, schema, data);
  // const flattenedSchema = flattenSchema(resolvedSchema, schema);
  // const visibleFields = getVisibleFields(flattenedSchema);

  const questions = Object.keys(
    getCurrentStepSchema(validator, schema, data)?.properties ?? {}
  );

  const firstQuestion = currentStepSchema?.properties?.[questions[0]];

  return (
    <Card style={{ minHeight: "300px" }}>
      <Card.Header className="d-flex flex-row justify-content-between align-items-center">
        <div className="d-flex flex-row align-items-center gap-2">
          {(() => {
            const title = String(schema?.title ?? "");
            const isRiskCategory = /^(Risk category|Risicocategorie|Prohibited|Verboden)/i.test(
              title
            );
            const isRoleAndStatus = /^(Role and status|Rol en status|Deployer|Aanbieder)/i.test(
              title
            );
            const tag = isRiskCategory
              ? t("questionnaire 2 name")
              : isRoleAndStatus
              ? t("questionnaire 3 name")
              : t("questionnaire 1 name");
            return (
              <span
                className="badge"
                style={{
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                  backgroundColor: "#005AA7",
                  color: "#fff",
                }}
              >
                {tag}
              </span>
            );
          })()}
          <Card.Title className="my-1" style={{ marginLeft: "8px" }}>
            {schema.title}
          </Card.Title>
        </div>
        <button
          type="button"
          onClick={() => onCancel(id)}
          className="btn btn-outline-secondary btn-sm ml-4"
          aria-label="Back"
        >
          ← {t("back to overview")}
        </button>
      </Card.Header>
      <Card.Body className="d-flex flex-column justify-content-between">
        {questions[0] === "output" || questions[0] === "error" ? (
          (() => {
            const resolvedSchema = retrieveSchema(
              validator,
              schema,
              schema,
              data
            );
            const flattenedSchema = flattenSchema(resolvedSchema, schema);
            const hiddenFieldsWithDefaults =
              getHiddenFieldsWithDefaults(flattenedSchema);
            const mergedData = { ...data, ...hiddenFieldsWithDefaults };
            const hasClassification =
              !!(firstQuestion as any)?.classification;
            const hasRoleStatus = !!(firstQuestion as any)?.roleStatus;
            const hasRiskOutcome = !!(firstQuestion as any)?.riskOutcome;
            if (hasRoleStatus) {
              return (
                <OutputRoleStatus
                  id={id}
                  type={questions[0] as "output" | "error"}
                  output={firstQuestion as Record<string, any>}
                  step={step}
                  handlePrev={handlePrev}
                  onSubmit={onSubmit}
                  data={mergedData}
                />
              );
            }
            if (hasRiskOutcome) {
              const title = String(schema?.title ?? "");
              const isRiskCategory = /^(Risk category|Risicocategorie|Prohibited|Verboden)/i.test(
                title
              );
              const questionnaireName = isRiskCategory
                ? (t("questionnaire 2 name") as string)
                : undefined;
              const handleJumpToField = (fieldKey: string) => {
                const visibleFields = getVisibleFields(flattenedSchema);
                const idx = visibleFields.indexOf(fieldKey);
                if (idx >= 0) setStep(idx);
              };
              return (
                <OutputRiskClassification
                  id={String(id)}
                  type={questions[0] as "output" | "error"}
                  output={firstQuestion as Record<string, any>}
                  step={step}
                  handlePrev={handlePrev}
                  onSubmit={(_idx, payload) => onSubmit(id, payload)}
                  onStartQuestionnaire={onStartQuestionnaire}
                  onJumpToField={handleJumpToField}
                  data={mergedData}
                  uiSchema={uiSchema}
                  questionnaireName={questionnaireName}
                  aiAct2Roles={aiAct2Roles}
                />
              );
            }
            return hasClassification ? (
              <OutputIdentification
                id={id}
                type={questions[0] as "output" | "error"}
                output={firstQuestion as Record<string, any>}
                step={step}
                handlePrev={handlePrev}
                onSubmit={onSubmit}
                data={mergedData}
              />
            ) : (
              <Output
                id={id}
                type={questions[0] as "output" | "error"}
                output={firstQuestion}
                step={step}
                handlePrev={handlePrev}
                onSubmit={onSubmit}
                data={mergedData}
              />
            );
          })()
        ) : (
          <Form
            schema={currentStepSchema as RJSFSchema}
            uiSchema={uiSchema}
            widgets={tooltipWidgets}
            templates={{ FieldTemplate, DescriptionFieldTemplate }}
            formData={
              data[questions[0]]
                ? {
                    [questions[0]]: data[questions[0]],
                  }
                : {}
            }
            onSubmit={(data) => handleNext(data.formData)}
            validator={validator}
            customValidate={handleValidate}
            className="d-flex flex-column justify-content-between flex-grow-1"
          >
            <div className="d-flex flex-row justify-content-between flex-row-reverse">
              <Button variant="primary" type="submit">
                {t("next")}
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

            {/* tag with question ID */}
            <div style={{ display: "inline-block", marginTop: "8px" }}>
              {(() => {
                const rawSuffix =
                  (uiSchema?.[questions[0]]?.["ui:id"] as string | undefined) ??
                  questions[0];
                const displaySuffix = rawSuffix.replace(/^q/, "Q");
                const title = String(schema?.title ?? "");
                const isRiskCategory = /^(Risk category|Risicocategorie)/i.test(
                  title
                );
                const isRoleAndStatus = /^(Role and status|Rol en status|Deployer|Aanbieder)/i.test(
                  title
                );
                const questionnaireName = isRiskCategory
                  ? t("questionnaire 2 name")
                  : isRoleAndStatus
                  ? t("questionnaire 3 name")
                  : t("questionnaire 1 name");
                return (
                  <span className="badge badge-secondary me-1">
                    id: {questionnaireName} {displaySuffix}
                  </span>
                );
              })()}
              {(uiSchema?.[questions[0]]?.["ui:badges"] as {
                label: string;
                color?: string;
                url?: string;
              }[] | undefined)?.map((badge, i) => (
                <QuestionBadge
                  key={i}
                  label={badge.label}
                  color={badge.color}
                  href={badge.url}
                />
              ))}
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default WizardForm;
