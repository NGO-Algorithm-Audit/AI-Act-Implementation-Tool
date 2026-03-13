import { ChangeEvent } from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
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
  required,
  onChange,
  onBlur,
  onFocus,
  uiSchema,
}: WidgetProps<T, S, F>) {
  const { enumOptions, enumDisabled, inline } = options;
  const enumTooltips: (string | null | undefined)[] =
    (uiSchema?.["ui:enumTooltips"] as (string | null | undefined)[]) ?? [];

  const checkboxesValues = Array.isArray(value) ? value : [value];

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

          const label = tooltip ? (
            <>
              {option.label}
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
            </>
          ) : (
            option.label
          );

          return (
            <Form.Check
              key={option.value}
              inline={inline as boolean}
              custom
              required={required}
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
