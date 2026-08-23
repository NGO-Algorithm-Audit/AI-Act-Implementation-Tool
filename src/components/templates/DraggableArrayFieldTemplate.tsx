import { useRef } from "react";
import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  WidgetProps,
} from "@rjsf/utils";

/**
 * Repeatable free-text list used by the NTA questionnaires (e.g. Hoofdstuk 6,
 * section 6.5 "Alternatieve instrumenten").
 *
 * Rows are reordered by dragging their handle, and added/removed with the
 * + / - buttons. Reordering rides on RJSF's own `onReorderClick(from, to)`,
 * which moves an item between two indices, so no drag-and-drop library is
 * needed. The handler guards on its event argument, so it is called without
 * one from the drop handler.
 *
 * Only free-form arrays reach this template: enum arrays (the checkbox
 * questions) are rendered by `CheckboxesWidget` instead.
 */

// Index of the row currently being dragged. A module-level ref is enough — a
// single drag is in flight at a time, and the value must survive the re-render
// that dragging over another row triggers.
const dragSource = { index: -1 };

const handleStyle: React.CSSProperties = {
  cursor: "grab",
  userSelect: "none",
  color: "#6c757d",
  fontSize: "1.25rem",
  lineHeight: 1,
};

/**
 * Textarea for a list row that numbers its own placeholder: with
 * `"ui:options": { "itemPlaceholderPrefix": "Alternatief" }` the rows read
 * "Alternatief 1", "Alternatief 2", … `ui:placeholder` cannot do this because
 * every row shares one uiSchema, so the row number is taken from the trailing
 * `_<n>` of the widget id (e.g. `root_q4-beoordeling_0`). Rendering itself is
 * delegated to the theme's TextareaWidget.
 */
export function ListItemTextareaWidget(props: WidgetProps) {
  const { id, options, placeholder, registry } = props;
  const Textarea = registry.widgets.TextareaWidget;
  const prefix = options?.itemPlaceholderPrefix as string | undefined;
  const rowIndex = /_(\d+)$/.exec(id)?.[1];
  return (
    <Textarea
      {...props}
      placeholder={
        prefix && rowIndex !== undefined
          ? `${prefix} ${Number(rowIndex) + 1}`
          : placeholder
      }
    />
  );
}

export function ArrayFieldItemTemplate(props: ArrayFieldTemplateItemType) {
  const {
    children,
    disabled,
    hasRemove,
    index,
    onDropIndexClick,
    onReorderClick,
    readonly,
  } = props;

  return (
    <div
      className="d-flex flex-row align-items-start mb-2"
      onDragOver={(e) => {
        if (dragSource.index >= 0) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const from = dragSource.index;
        dragSource.index = -1;
        if (from < 0 || from === index) return;
        onReorderClick(from, index)();
      }}
    >
      <span
        draggable={!disabled && !readonly}
        onDragStart={() => {
          dragSource.index = index;
        }}
        onDragEnd={() => {
          dragSource.index = -1;
        }}
        className="mr-2 mt-2"
        style={handleStyle}
        aria-label="Verplaats item"
        title="Sleep om de volgorde te wijzigen"
      >
        ⠿
      </span>
      <div className="flex-grow-1">{children}</div>
      {hasRemove && (
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm ml-2 mt-2"
          disabled={disabled || readonly}
          onClick={onDropIndexClick(index)}
          aria-label="Verwijder item"
        >
          −
        </button>
      )}
    </div>
  );
}

export function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const { canAdd, disabled, items, onAddClick, readonly, schema, uiSchema } =
    props;
  const containerRef = useRef<HTMLDivElement>(null);
  const bullets = uiSchema?.["ui:bullets"] as string[] | undefined;
  const title = uiSchema?.["ui:title"] ?? schema.title;

  return (
    <div ref={containerRef}>
      {!!title && <label>{title as string}</label>}
      {!!bullets?.length && (
        <ul className="mb-2">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
      {items?.map(({ key, ...itemProps }) => (
        <ArrayFieldItemTemplate key={key} {...itemProps} />
      ))}
      {canAdd && (
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={disabled || readonly}
          onClick={onAddClick}
          aria-label="Voeg item toe"
        >
          +
        </button>
      )}
    </div>
  );
}
