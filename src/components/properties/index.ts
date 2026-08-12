/**
 * Property editing.
 *
 * An inspector is one of the things every application with a canvas, a tree or
 * a selection ends up needing, and one of the things most often hand-rolled
 * three times over. This family covers it at two levels: composable fields you
 * arrange yourself, and a descriptor-driven panel built on them.
 *
 * Nothing here is graph-specific — the subjects can be nodes, edges, tree
 * items, rows, or an application's settings object.
 */

export {
  FieldShell,
  CONTROL_CLASS,
  borderClass,
  fieldId,
  type FieldShellProps,
  type FieldProps,
} from './FieldShell';

export {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  NumberField,
  ColorField,
  DateField,
  TagField,
  StaticField,
  type TextFieldProps,
  type TextAreaFieldProps,
  type SelectFieldProps,
  type CheckboxFieldProps,
  type NumberFieldProps,
  type ColorFieldProps,
  type DateFieldProps,
  type TagFieldProps,
  type StaticFieldProps,
  type ISelectOption,
} from './fields';

export {
  PropertyPanel,
  BUILT_IN_FIELD_TYPES,
  type PropertyPanelProps,
  type IPropertyField,
  type FieldRenderer,
  type FieldRendererProps,
} from './PropertyPanel';
