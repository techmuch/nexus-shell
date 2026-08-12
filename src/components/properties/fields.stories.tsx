import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Ruler } from 'lucide-react';
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
} from './fields';
import { FieldShell, CONTROL_CLASS } from './FieldShell';
import { cn } from '../../lib/cn';

const meta = {
  title: 'Properties/Fields',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The property fields, each an ordinary controlled component: pass `value`, get `onChange`.\n\nThey share a shape so `PropertyPanel` can render them from descriptors, but every one works on its own — reach for them directly when a property needs bespoke arrangement.\n\n`mixed` is the multi-selection case. A mixed field shows a placeholder rather than one subject\'s value, because displaying one as if it were everyone\'s is how a multi-edit quietly flattens data.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] rounded-lg border border-border bg-background p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'question', label: 'Question' },
  { value: 'argument', label: 'Argument' },
  { value: 'retired', label: 'Retired', disabled: true },
];

/* -------------------------------------------------------------------------- */

/** Every field at once, in the state a single selection produces. */
export const AllFields: Story = {
  render: () => {
    const [state, setState] = useState({
      label: 'Ship behind a flag',
      notes: 'Decouples the deploy from the launch.',
      kind: 'idea',
      resolved: true,
      weight: 3,
      colour: '#22c55e',
      due: '2026-09-04',
      tags: ['release', 'urgent'],
    });
    const set = <K extends keyof typeof state>(key: K) => (value: (typeof state)[K]) =>
      setState((s) => ({ ...s, [key]: value }));

    return (
      <div className="flex flex-col gap-4">
        <TextField label="Label" value={state.label} onChange={set('label')} />
        <TextAreaField
          label="Notes"
          value={state.notes}
          onChange={set('notes')}
          rows={3}
          description="Free text, shown in the detail pane."
        />
        <SelectField label="Kind" value={state.kind} options={OPTIONS} onChange={set('kind')} />
        <NumberField
          label="Weight"
          value={state.weight}
          onChange={set('weight')}
          min={1}
          max={5}
          unit="pt"
        />
        <ColorField label="Colour" value={state.colour} onChange={set('colour')} />
        <DateField label="Due" value={state.due} onChange={set('due')} />
        <TagField label="Tags" value={state.tags} onChange={set('tags')} />
        <CheckboxField label="Resolved" value={state.resolved} onChange={set('resolved')} />
        <StaticField label="Identifier" value="node-8f21c4" mono />
      </div>
    );
  },
};

/**
 * The same fields with `mixed` set — what a selection that disagrees looks
 * like. Nothing shows a value it cannot vouch for, and editing any of them
 * still applies to the whole selection.
 */
export const Mixed: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField label="Label" value="Ship behind a flag" mixed />
      <TextAreaField label="Notes" value="Some notes" mixed rows={3} />
      <SelectField label="Kind" value="idea" options={OPTIONS} mixed />
      <NumberField label="Weight" value={3} mixed unit="pt" />
      <ColorField label="Colour" value="#22c55e" mixed />
      <DateField label="Due" value="2026-09-04" mixed />
      <TagField label="Tags" value={['release']} mixed />
      <CheckboxField label="Resolved" value mixed />
      <StaticField label="Identifier" value="node-8f21c4" mixed mono />
    </div>
  ),
};

/** Validation messages replace the description and mark the control. */
export const WithErrors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField label="Label" value="" error="Required." />
      <NumberField label="Weight" value={9} min={1} max={5} error="Must be 1 to 5." />
      <SelectField label="Kind" value={undefined} options={OPTIONS} error="Pick a kind." />
    </div>
  ),
};

/** Read-only, for a subject you may look at but not change. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField label="Label" value="Ship behind a flag" disabled />
      <SelectField label="Kind" value="idea" options={OPTIONS} disabled />
      <TagField label="Tags" value={['release', 'urgent']} disabled />
      <CheckboxField label="Resolved" value disabled />
    </div>
  ),
};

/**
 * `TagField` on its own: Enter or the button commits, and blanks and duplicates
 * are rejected silently — neither is a mistake worth interrupting for.
 */
export const Tags: Story = {
  render: () => {
    const [tags, setTags] = useState(['release']);
    return (
      <TagField
        label="Tags"
        value={tags}
        onChange={setTags}
        suggestions={['release', 'urgent', 'risk', 'blocked']}
        description="Type and press Enter. Suggestions come from the project."
      />
    );
  },
};

/**
 * A bespoke control wearing the family's clothes.
 *
 * `FieldShell` supplies the label, description, error and *Mixed* marker, so a
 * one-off field lines up with the rest without copying their markup.
 */
export const CustomWithFieldShell: Story = {
  render: () => {
    const [size, setSize] = useState({ w: 220, h: 90 });

    return (
      <FieldShell label="Size" description="Width and height, in graph units.">
        <div className="flex items-center gap-2">
          <Ruler size={14} className="shrink-0 text-muted-foreground" />
          {(['w', 'h'] as const).map((axis) => (
            <input
              key={axis}
              type="number"
              aria-label={axis === 'w' ? 'Width' : 'Height'}
              value={size[axis]}
              onChange={(e) => setSize((s) => ({ ...s, [axis]: Number(e.target.value) }))}
              className={cn(CONTROL_CLASS, 'border-border')}
            />
          ))}
        </div>
      </FieldShell>
    );
  },
};
