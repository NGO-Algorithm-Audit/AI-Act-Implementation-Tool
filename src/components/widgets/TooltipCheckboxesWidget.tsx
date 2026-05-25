import React, { ChangeEvent } from "react";
import { Form, OverlayTrigger, Popover } from "react-bootstrap";
import {
  ariaDescribedByIds,
  enumOptionsDeselectValue,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  FormContextType,
  optionId,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from "@rjsf/utils";

function renderTooltipBody(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => (
    <p
      key={i}
      className={i === paragraphs.length - 1 ? "mb-0" : "mb-2"}
      style={{ whiteSpace: "pre-line" }}
    >
      {para}
    </p>
  ));
}

export default function TooltipCheckboxesWidget<
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

  const validEnumValues = new Set(
    Array.isArray(enumOptions) ? enumOptions.map((o) => o.value) : []
  );
  const checkboxesValues = (Array.isArray(value) ? value : []).filter(
    (v) => v !== undefined && v !== null && validEnumValues.has(v)
  );

  const _onChange =
    (index: number) =>
    ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
      if (checked) {
        onChange(
          enumOptionsSelectValue<S>(index, checkboxesValues, enumOptions)
        );
      } else {
        onChange(
          enumOptionsDeselectValue<S>(index, checkboxesValues, enumOptions)
        );
      }
    };

  const _onBlur = ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, value);
  const _onFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

  return (
    <Form.Group>
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index) => {
          const checked = enumOptionsIsSelected<S>(
            option.value,
            checkboxesValues
          );
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;
          const tooltip = enumTooltips[index];
          const description = enumDescriptions[index];

          const label = (
            <>
              {option.label}
              {tooltip && (
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="right"
                  overlay={
                    <Popover
                      id={`${optionId(id, index)}-popover`}
                      className="cma-info-popover"
                    >
                      <Popover.Content>{renderTooltipBody(tooltip)}</Popover.Content>
                    </Popover>
                  }
                >
                  <button
                    type="button"
                    className="enum-tooltip-icon enum-tooltip-button"
                    aria-label="More info"
                  >
                    ⓘ
                  </button>
                </OverlayTrigger>
              )}
              {description && (
                <small className="enum-option-description">{description}</small>
              )}
            </>
          );

          return (
            <Form.Check
              key={option.value}
              inline={inline as boolean}
              custom
              checked={checked}
              className="bg-transparent border-0"
              type="checkbox"
              id={optionId(id, index)}
              name={id}
              label={label}
              autoFocus={autofocus && index === 0}
              onChange={_onChange(index)}
              onBlur={_onBlur}
              onFocus={_onFocus}
              disabled={disabled || itemDisabled || readonly}
              aria-describedby={ariaDescribedByIds<T>(id)}
            />
          );
        })}
    </Form.Group>
  );
}
