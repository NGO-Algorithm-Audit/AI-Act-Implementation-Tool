import React from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  ariaDescribedByIds,
  enumOptionsIsSelected,
  FormContextType,
  optionId,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from "@rjsf/utils";

function renderLabel(text: string): React.ReactNode {
  const parts = String(text).split(/(\[[^\]]+\]\([^)]+\))/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      return (
        <a
          key={i}
          href={m[2]}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {m[1]}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function TooltipRadioWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  id,
  disabled,
  options,
  value,
  autofocus,
  readonly,
  required,
  onChange,
  onBlur,
  onFocus,
  uiSchema,
}: WidgetProps<T, S, F>) {
  const { enumOptions, enumDisabled, inline } = options;
  const enumTooltips: (string | null | undefined)[] =
    (uiSchema?.["ui:enumTooltips"] as (string | null | undefined)[]) ?? [];
  const enumDescriptions: (string | null | undefined)[] =
    (uiSchema?.["ui:enumDescriptions"] as (string | null | undefined)[]) ?? [];
  const optionHeaders: Record<string, string> =
    (uiSchema?.["ui:optionHeaders"] as Record<string, string> | undefined) ?? {};

  const _onChange = (nextValue: string) => onChange(nextValue);
  const _onBlur = ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, value);
  const _onFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

  return (
    <Form.Group className="mb-0">
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index) => {
          const checked = enumOptionsIsSelected<S>(option.value, value);
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;
          const tooltip = enumTooltips[index];
          const description = enumDescriptions[index];

          const label = (
            <>
              {renderLabel(option.label)}
              {tooltip && (
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id={`${optionId(id, index)}-tooltip`}>
                      {tooltip}
                    </Tooltip>
                  }
                >
                  <span className="enum-tooltip-icon" aria-label="More info">
                    {" "}ⓘ
                  </span>
                </OverlayTrigger>
              )}
              {description && (
                <small className="enum-option-description">{description}</small>
              )}
            </>
          );

          const header = optionHeaders[String(index)];

          return (
            <React.Fragment key={index}>
              {header && (
                <div
                  style={{
                    fontWeight: 600,
                    color: "#005AA7",
                    marginTop: "8px",
                    marginBottom: "4px",
                  }}
                >
                  {header}
                </div>
              )}
              <Form.Check
                inline={inline as boolean}
                label={label}
                id={optionId(id, index)}
                name={id}
                type="radio"
                disabled={disabled || itemDisabled || readonly}
                checked={checked}
                required={required}
                value={String(index)}
                autoFocus={autofocus && index === 0}
                onChange={() => _onChange(option.value)}
                onBlur={_onBlur}
                onFocus={_onFocus}
                aria-describedby={ariaDescribedByIds<T>(id)}
              />
            </React.Fragment>
          );
        })}
    </Form.Group>
  );
}
