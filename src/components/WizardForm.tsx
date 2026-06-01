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
import { useEffect, useState } from "react";
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
  initialFieldKey,
  onInitialFieldConsumed,
  identificationFormData,
}: {
  id: number;
  schema: FormProps<any, RJSFSchema, any>["schema"];
  uiSchema: FormProps<any, RJSFSchema, any>["uiSchema"];
  formData: FormProps<any, RJSFSchema, any>["formData"];
  aiAct2Roles?: string[] | null;
  onStartQuestionnaire?: (key: string) => void;
  initialFieldKey?: string | null;
  onInitialFieldConsumed?: () => void;
  // Raw answers from a completed Identification questionnaire, when this
  // form is the Risk-category one. Used to raise a cross-questionnaire
  // warning on Q33 (property "6.1") when the user's profiling answer
  // contradicts the Identification outcome.
  identificationFormData?: Record<string, any>;
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

  // On first mount, if a search result handed us an initialFieldKey, advance
  // step to that question. Many target fields (e.g. art50.nudify a.k.a. Q11)
  // sit behind an `allOf.if/then` or `dependencies.oneOf` gate — RJSF only
  // expands them when the gating answer is already in data. So we walk the
  // schema once to discover the target, collect a minimum data patch that
  // satisfies the gates along the way, and seed `data` with it.
  // flattenSchema/getVisibleFields are const arrows declared below; they
  // exist by the time this effect callback runs.
  useEffect(() => {
    if (!initialFieldKey) return;

    const inferSatisfyingValue = (propSchema: any): any => {
      if (!propSchema || typeof propSchema !== "object") return undefined;
      if (propSchema.const !== undefined) return propSchema.const;
      if (Array.isArray(propSchema.enum) && propSchema.enum.length > 0)
        return propSchema.enum[0];
      if (propSchema.contains) {
        const c = propSchema.contains;
        if (Array.isArray(c.enum) && c.enum.length > 0) return [c.enum[0]];
        if (c.const !== undefined) return [c.const];
      }
      return undefined;
    };

    const followRef = (ref: string): any => {
      if (typeof ref !== "string" || !ref.startsWith("#/")) return null;
      const parts = ref.slice(2).split("/");
      let cur: any = schema;
      for (const p of parts) {
        if (cur && typeof cur === "object") cur = cur[p];
        else return null;
      }
      return cur;
    };

    const seen = new WeakSet<object>();
    const findPath = (node: any): Record<string, any> | null => {
      if (!node || typeof node !== "object" || seen.has(node)) return null;
      seen.add(node);
      if (typeof node.$ref === "string") {
        const target = followRef(node.$ref);
        if (target) return findPath(target);
      }
      if (node.properties && typeof node.properties === "object") {
        if (node.properties[initialFieldKey]) return {};
        for (const v of Object.values(node.properties)) {
          const r = findPath(v);
          if (r) return r;
        }
      }
      if (Array.isArray(node.allOf)) {
        for (const sub of node.allOf) {
          if (!sub || typeof sub !== "object") continue;
          const branch = sub.then ?? sub;
          const r = findPath(branch);
          if (r) {
            if (sub.if?.properties && typeof sub.if.properties === "object") {
              for (const [k, vs] of Object.entries(sub.if.properties)) {
                if (r[k] !== undefined) continue;
                const val = inferSatisfyingValue(vs);
                if (val !== undefined) r[k] = val;
              }
            }
            return r;
          }
        }
      }
      if (node.dependencies && typeof node.dependencies === "object") {
        const deps = node.dependencies as Record<string, any>;
        const ownProps =
          node.properties && typeof node.properties === "object"
            ? (node.properties as Record<string, any>)
            : {};
        // A dependency key can itself be a field that only appears via
        // another sibling dependency in the same `dependencies` map — e.g.
        // exceptionHigh chains `exceptions` -> `6.1` -> `6.2`. Setting only
        // the immediate gate (`6.1`) leaves `6.1` itself hidden, so the
        // target never becomes visible. Walk back from the matched key,
        // satisfying every gate, until we reach a real property of `node`.
        const satisfyGateChain = (key: string, acc: Record<string, any>) => {
          let current: string | null = key;
          const guard = new Set<string>();
          while (current && !guard.has(current) && !ownProps[current]) {
            guard.add(current);
            const cur = current;
            let nextKey: string | null = null;
            for (const [dk, d] of Object.entries(deps)) {
              const branches = (d as any)?.oneOf;
              if (!Array.isArray(branches)) continue;
              const hit = branches.find(
                (b: any) => b?.properties && b.properties[cur]
              );
              if (!hit) continue;
              if (acc[dk] === undefined) {
                const v = inferSatisfyingValue(hit.properties[dk]);
                if (v !== undefined) acc[dk] = v;
              }
              nextKey = dk;
              break;
            }
            current = nextKey;
          }
        };
        for (const [depKey, dep] of Object.entries(deps)) {
          const oneOf = (dep as any)?.oneOf;
          if (!Array.isArray(oneOf)) continue;
          for (const branch of oneOf) {
            const r = findPath(branch);
            if (r) {
              const branchProp = (branch as any).properties?.[depKey];
              if (branchProp && r[depKey] === undefined) {
                const val = inferSatisfyingValue(branchProp);
                if (val !== undefined) r[depKey] = val;
              }
              satisfyGateChain(depKey, r);
              return r;
            }
          }
        }
      }
      // Don't walk `definitions` directly — they're reached via $ref so the
      // dependency-trigger from the call site is captured in the path.
      return null;
    };

    const patch = findPath(schema as any) ?? {};
    const seededData = { ...data, ...patch };

    const flattenedSchema = flattenSchema(schema, schema, seededData);
    const visibleFields = getVisibleFields(flattenedSchema);
    const idx = visibleFields.indexOf(initialFieldKey);
    if (idx >= 0) {
      if (Object.keys(patch).length > 0) setData(seededData);
      setStep(idx);
    }
    onInitialFieldConsumed?.();
    // run once on mount; later prop changes are intentionally ignored
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flattenSchema = (
    resolvedSchema: any,
    rootSchema: any,
    dataOverride?: any
  ): GenericObjectType => {
    const effectiveData = dataOverride ?? data;
    const flattenedProperties: any = {};
    const requiredFields: string[] = [];

    // Helper to add properties from a schema object
    const addProperties = (schemaObject: any) => {
      // Add required fields from this schema object
      if (schemaObject.required) {
        requiredFields.push(...schemaObject.required);
      }

      const dependencies = schemaObject.dependencies || {};
      const handledDependencies = new Set<string>();

      // Resolve and inline a dependency for `key` against current data, if it
      // matches. Called immediately after adding `key` so dependent fields
      // appear in the correct position in the visible-fields order (e.g.
      // art6.thirdParty must come right after annexI, not after III.1).
      const applyDependency = (key: string) => {
        const dependency = dependencies[key];
        if (!dependency || handledDependencies.has(key)) return;
        handledDependencies.add(key);
        const fieldValue = effectiveData[key];
        if (fieldValue === undefined || fieldValue === null) return;
        if (Array.isArray(fieldValue) && fieldValue.length === 0) return;
        if (!dependency.oneOf) return;

        // Match by membership in the branch's enum (not first element only),
        // so multi-value branches like Annex I Section A/B work. Fall back to
        // full AJV validation when the branch uses richer JSON-Schema patterns
        // (contains / anyOf / allOf / maxItems) — e.g. Q1's array-of-checkboxes
        // branches that have no flat `enum` on the gating property.
        const matchingSchema = dependency.oneOf.find((oneOfSchema: any) => {
          const branchProp = oneOfSchema.properties?.[key];
          if (!branchProp) return false;
          if (Array.isArray(branchProp.enum)) {
            if (Array.isArray(fieldValue)) {
              return fieldValue.some((v) => branchProp.enum.includes(v));
            }
            return branchProp.enum.includes(fieldValue);
          }
          try {
            return validator.isValid(branchProp, fieldValue, rootSchema);
          } catch {
            return false;
          }
        });
        if (!matchingSchema) return;

        const resolvedDependencySchema = retrieveSchema(
          validator,
          matchingSchema,
          rootSchema,
          effectiveData
        );
        if (resolvedDependencySchema.required) {
          requiredFields.push(...resolvedDependencySchema.required);
        }
        Object.entries(resolvedDependencySchema.properties || {}).forEach(
          ([depKey, depValue]) => {
            if (depKey === key) return;
            const dv = depValue as any;
            if (dv && typeof dv === "object" && "properties" in dv) {
              const r = retrieveSchema(validator, dv, rootSchema, effectiveData);
              addProperties(r);
            } else {
              flattenedProperties[depKey] = depValue;
            }
            applyDependency(depKey);
          }
        );
      };

      // Walk regular properties; expand each property's dependency immediately
      // after it lands so dependency-injected fields keep their natural slot.
      Object.entries(schemaObject.properties || {}).forEach(
        ([key, value]: [string, any]) => {
          if (value && typeof value === "object") {
            if ("properties" in value) {
              const resolvedNestedSchema = retrieveSchema(
                validator,
                value,
                rootSchema,
                effectiveData
              );
              addProperties(resolvedNestedSchema);
            } else {
              flattenedProperties[key] = value;
            }
          } else {
            flattenedProperties[key] = value;
          }
          applyDependency(key);
        }
      );

      // Catch any dependencies whose key wasn't a property of this object
      // (rare; preserves previous behaviour for completeness).
      Object.keys(dependencies).forEach((key) => applyDependency(key));
    };

    // Start with the main schema
    addProperties(resolvedSchema);

    return {
      ...resolvedSchema,
      properties: flattenedProperties,
      // Definitions like `exceptionForbidden` are referenced via `$ref` from
      // multiple sibling dependency branches, so a single user data state
      // can pull `["exceptions"]` (or any other shared required key) into
      // `requiredFields` more than once. Downstream that becomes
      // `required: ["exceptions", "exceptions"]`, which AJV's meta-schema
      // rejects. Dedupe here so every caller is safe.
      required: Array.from(new Set(requiredFields)),
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
    _validator: FormProps<any, RJSFSchema, any>["validator"],
    schema: FormProps<any, RJSFSchema, any>["schema"],
    currentData: FormProps<any, RJSFSchema, any>["formData"]
  ): GenericObjectType => {
    // Pass the raw schema (not retrieveSchema-resolved) so flattenSchema's own
    // applyDependency can place dependency-injected fields in their correct
    // slot — e.g. art6.thirdParty must come right after annexI, not appended
    // after III.1 (which is what RJSF's top-level retrieveSchema produces).
    const flattenedSchema = flattenSchema(schema, schema, currentData);

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

    // Cross-questionnaire warning on Risk-category Q33 (property "6.1"): if
    // Identification told us profiling applies (Q8 ≠ "No" AND Q8b = "Yes"),
    // the expected Q33 answer is the first enum option ("Yes"/"Ja"). Block
    // the user from advancing with "No" until they reconsider.
    if (currentField === "6.1" && identificationFormData && !isEmpty) {
      const idQ8 = identificationFormData.q8;
      const idQ8b = identificationFormData.q8b;
      const profilingApplicable =
        !!idQ8 && idQ8 !== t("q8 option no") && idQ8b === t("q8b option yes");
      if (profilingApplicable) {
        const yesEnum = Array.isArray(fieldSchema?.enum)
          ? fieldSchema.enum[0]
          : undefined;
        if (yesEnum && fieldValue !== yesEnum) {
          errors[currentField].addError(t("profiling expected yes warning"));
        }
      }
    }

    return errors;
  };

  const handleNext = (formData: typeof data) => {
    // Flatten using the raw schema so dependency ordering stays stable.
    const flattenedSchema = flattenSchema(schema, schema, data);

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
            const flattenedSchema = flattenSchema(schema, schema, data);
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
                  onStartQuestionnaire={onStartQuestionnaire}
                  data={mergedData}
                  uiSchema={uiSchema}
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
            // For checkbox questions (e.g. Identification Q1), suppress the
            // error summary box on an empty submit. The inline field errors
            // ("must NOT have fewer than 1 items", "This field is required")
            // and the red question label still render via FieldTemplate.
            // Risk-category Q33 (property "6.1") also opts out: the only
            // failure mode here is the cross-questionnaire profiling
            // warning, which already reads clearly inline — repeating it
            // in the top alert is noise.
            showErrorList={
              uiSchema?.[questions[0]]?.["ui:widget"] === "checkboxes" ||
              questions[0] === "6.1"
                ? false
                : "top"
            }
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
