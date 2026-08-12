import React, { useMemo, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  readValues,
  writeValues,
  type IPropertyAccessor,
  type IPropertyValue,
} from '../../lib/properties';
import {
  CheckboxField,
  ColorField,
  DateField,
  NumberField,
  SelectField,
  StaticField,
  TagField,
  TextAreaField,
  TextField,
  type ISelectOption,
} from './fields';

/* -------------------------------------------------------------------------- */
/* Descriptors                                                                */
/* -------------------------------------------------------------------------- */

/**
 * One editable property.
 *
 * `type` names a renderer in the field registry. The built-ins are listed in
 * {@link BUILT_IN_FIELD_TYPES}, and any string works once you register a
 * renderer for it.
 */
export interface IPropertyField<S = unknown> extends IPropertyAccessor<S> {
  /** Label shown above the control. */
  label: string;
  /** Field type. Defaults to `"text"`. */
  type?: string;
  /** One line under the label explaining the property. */
  description?: string;
  /** Group heading this field sits under. Ungrouped fields come first. */
  group?: string;
  /** Render read-only. */
  disabled?: boolean;
  /**
   * Hide the field for the current selection — a property that only applies to
   * some node kinds, say. Receives the selected subjects.
   */
  when?: (subjects: S[]) => boolean;
  /** Return a message to show the field as invalid. */
  validate?: (value: unknown, subjects: S[]) => string | undefined;
  /**
   * Anything the renderer needs: `options` for a select, `rows` for a text
   * area, `unit` for a number, or whatever your own field type expects.
   */
  props?: Record<string, unknown>;
}

/** What a field renderer receives. */
export interface FieldRendererProps<S = unknown> {
  field: IPropertyField<S>;
  /** The shared value across the selection, and whether subjects disagree. */
  state: IPropertyValue;
  /** Apply a value to every selected subject. */
  onChange: (value: unknown) => void;
  /** The selected subjects, for a renderer that needs more than one value. */
  subjects: S[];
  /** Validation message, if `validate` returned one. */
  error?: string;
}

/** Renders one field. Register your own to extend the panel. */
export type FieldRenderer<S = unknown> = (props: FieldRendererProps<S>) => ReactNode;

/**
 * The field types the panel understands out of the box.
 *
 * Spread it to add your own, or replace an entry to change how a type renders
 * everywhere:
 *
 * ```tsx
 * <PropertyPanel
 *   fieldTypes={{ ...BUILT_IN_FIELD_TYPES, latlong: LatLongField }}
 * />
 * ```
 */
export const BUILT_IN_FIELD_TYPES: Record<string, FieldRenderer<any>> = {
  text: ({ field, state, onChange, error }) => (
    <TextField
      label={field.label}
      description={field.description}
      value={state.value as string}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      {...field.props}
    />
  ),

  textarea: ({ field, state, onChange, error }) => (
    <TextAreaField
      label={field.label}
      description={field.description}
      value={state.value as string}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      {...field.props}
    />
  ),

  select: ({ field, state, onChange, error }) => (
    <SelectField
      label={field.label}
      description={field.description}
      value={state.value as string}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      options={(field.props?.options as ISelectOption[]) ?? []}
      {...field.props}
    />
  ),

  checkbox: ({ field, state, onChange, error }) => (
    <CheckboxField
      label={field.label}
      description={field.description}
      value={state.value as boolean}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      {...field.props}
    />
  ),

  number: ({ field, state, onChange, error }) => (
    <NumberField
      label={field.label}
      description={field.description}
      value={state.value as number}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      {...field.props}
    />
  ),

  color: ({ field, state, onChange, error }) => (
    <ColorField
      label={field.label}
      description={field.description}
      value={state.value as string}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      {...field.props}
    />
  ),

  date: ({ field, state, onChange, error }) => (
    <DateField
      label={field.label}
      description={field.description}
      value={state.value as string}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      {...field.props}
    />
  ),

  tags: ({ field, state, onChange, error }) => (
    <TagField
      label={field.label}
      description={field.description}
      value={state.value as string[]}
      mixed={state.mixed}
      disabled={field.disabled}
      error={error}
      onChange={onChange}
      {...field.props}
    />
  ),

  static: ({ field, state }) => (
    <StaticField
      label={field.label}
      description={field.description}
      value={state.value as ReactNode}
      mixed={state.mixed}
      {...field.props}
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export interface PropertyPanelProps<S = unknown> {
  /**
   * The selected subjects. Zero renders the empty state, one edits normally,
   * several edit together with a mixed indicator where values differ.
   */
  subjects: S[];
  /** The properties to show. */
  fields: IPropertyField<S>[];
  /**
   * Called with every subject updated. The panel produces new copies and never
   * mutates, so this is the whole edit — apply it to your state.
   */
  onChange?: (updated: S[], field: IPropertyField<S>, value: unknown) => void;
  /**
   * Field renderers by type. Defaults to {@link BUILT_IN_FIELD_TYPES}; spread
   * it to add your own without losing the built-ins.
   */
  fieldTypes?: Record<string, FieldRenderer<S>>;
  /** Shown when nothing is selected. */
  emptyState?: ReactNode;
  /**
   * Heading above the fields. Receives the selection, so it can read
   * "3 nodes selected" as easily as a name.
   */
  title?: ReactNode | ((subjects: S[]) => ReactNode);
  /** Group headings render in this order. Unlisted groups follow, in first-seen order. */
  groupOrder?: string[];
  /** Extra classes merged onto the root element. */
  className?: string;
  /** Accessible label for the region. Defaults to `"Properties"`. */
  'aria-label'?: string;
}

const DEFAULT_EMPTY = (
  <div className="grid h-full place-items-center px-6 py-10 text-center">
    <p className="text-xs text-muted-foreground">
      Nothing selected. Choose an item to see its properties.
    </p>
  </div>
);

/**
 * An inspector: the properties of whatever is selected, as editable fields.
 *
 * Give it the selection and a list of field descriptors. It reads each
 * property across every selected subject, renders the matching field, and hands
 * back new copies on edit — it holds no state and mutates nothing.
 *
 * Three selection states are handled for you:
 *
 * - **none** — the empty state.
 * - **one** — ordinary editing.
 * - **several** — shared values edit together; where subjects disagree the
 *   field shows *Mixed* rather than one subject's value, and editing applies to
 *   all of them.
 *
 * That last case is the one hand-rolled inspectors usually skip, and skipping
 * it is how a multi-selection edit silently flattens data.
 *
 * Every field is also exported on its own — reach for `TextField` and friends
 * when a property needs bespoke arrangement, and use `FieldShell` to make a
 * custom control look like the rest.
 *
 * @example
 * ```tsx
 * <PropertyPanel
 *   subjects={selectedNodes}
 *   title={(nodes) => nodes.length > 1 ? `${nodes.length} nodes` : 'Node'}
 *   fields={[
 *     { key: 'data.label', label: 'Label' },
 *     { key: 'kind', label: 'Type', type: 'select',
 *       props: { options: [{ value: 'idea', label: 'Idea' }] } },
 *     { key: 'data.notes', label: 'Notes', type: 'textarea', group: 'Detail' },
 *     { key: 'data.tags', label: 'Tags', type: 'tags', group: 'Detail' },
 *   ]}
 *   onChange={(updated) => setNodes(merge(nodes, updated))}
 * />
 * ```
 */
export const PropertyPanel = <S,>({
  subjects,
  fields,
  onChange,
  fieldTypes = BUILT_IN_FIELD_TYPES as Record<string, FieldRenderer<S>>,
  emptyState = DEFAULT_EMPTY,
  title,
  groupOrder,
  className,
  'aria-label': ariaLabel = 'Properties',
}: PropertyPanelProps<S>) => {
  const visible = useMemo(
    () => fields.filter((field) => !field.when || field.when(subjects)),
    [fields, subjects],
  );

  /** Fields bucketed by group, in the order groups should render. */
  const groups = useMemo(() => {
    const buckets = new Map<string, IPropertyField<S>[]>();
    visible.forEach((field) => {
      const key = field.group ?? '';
      buckets.set(key, [...(buckets.get(key) ?? []), field]);
    });

    const seen = [...buckets.keys()];
    const ordered = groupOrder
      ? [
          // Ungrouped fields always lead — they are the identity of the thing.
          ...(buckets.has('') ? [''] : []),
          ...groupOrder.filter((g) => buckets.has(g)),
          ...seen.filter((g) => g !== '' && !groupOrder.includes(g)),
        ]
      : seen;

    return ordered.map((group) => ({ group, fields: buckets.get(group)! }));
  }, [visible, groupOrder]);

  if (subjects.length === 0) {
    return (
      <section aria-label={ariaLabel} className={cn('h-full overflow-y-auto', className)}>
        {emptyState}
      </section>
    );
  }

  const heading = typeof title === 'function' ? title(subjects) : title;

  return (
    <section
      aria-label={ariaLabel}
      className={cn('h-full overflow-y-auto', className)}
    >
      {heading !== undefined && heading !== null && (
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-4 py-2.5 backdrop-blur-sm">
          <div className="text-xs font-semibold text-foreground">{heading}</div>
        </header>
      )}

      <div className="flex flex-col gap-5 p-4">
        {groups.map(({ group, fields: groupFields }) => (
          <div key={group || '_'} className="flex flex-col gap-4">
            {group && (
              <h3 className="border-b border-border/40 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                {group}
              </h3>
            )}

            {groupFields.map((field) => {
              const state = readValues(subjects, field);
              const renderer = fieldTypes[field.type ?? 'text'];

              if (!renderer) {
                return (
                  <p key={field.key} className="text-[11px] text-destructive">
                    No renderer registered for field type “{field.type}”.
                  </p>
                );
              }

              return (
                <React.Fragment key={field.key}>
                  {renderer({
                    field,
                    state,
                    subjects,
                    error: field.validate?.(state.value, subjects),
                    onChange: (value) =>
                      onChange?.(writeValues(subjects, field, value), field, value),
                  })}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
};
