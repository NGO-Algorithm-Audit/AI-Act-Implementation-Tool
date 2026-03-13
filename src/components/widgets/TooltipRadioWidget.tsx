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
              inline={inline as boolean}
              label={label}
              id={optionId(id, index)}
              key={index}
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
          );
        })}
    </Form.Group>
  );
}
