import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Gauge } from 'lucide-react';
import {
  PropertyPanel,
  BUILT_IN_FIELD_TYPES,
  type IPropertyField,
  type PropertyPanelProps,
} from './PropertyPanel';
import { FieldShell } from './FieldShell';
import { cn } from '../../lib/cn';

/* -------------------------------------------------------------------------- */
/* A small domain to inspect                                                  */
/* -------------------------------------------------------------------------- */

interface Node {
  id: string;
  kind: 'idea' | 'question' | 'argument';
  data: {
    label: string;
    notes?: string;
    colour?: string;
    tags?: string[];
    due?: string;
    weight?: number;
    resolved?: boolean;
  };
}

const NODES: Node[] = [
  {
    id: 'n1',
    kind: 'question',
    data: {
      label: 'Should we ship on Friday?',
      notes: 'The release train is weekly, so slipping costs seven days.',
      colour: '#3b82f6',
      tags: ['release', 'urgent'],
      due: '2026-09-04',
      weight: 3,
      resolved: false,
    },
  },
  {
    id: 'n2',
    kind: 'idea',
    data: {
      label: 'Ship behind a flag',
      notes: 'Decouples the deploy from the launch.',
      colour: '#22c55e',
      tags: ['release'],
      due: '2026-09-04',
      weight: 5,
      resolved: true,
    },
  },
  {
    id: 'n3',
    kind: 'argument',
    data: {
      label: 'QA has not signed off',
      colour: '#ef4444',
      tags: ['risk'],
      weight: 5,
      resolved: false,
    },
  },
];

const FIELDS: IPropertyField<Node>[] = [
  { key: 'data.label', label: 'Label', description: 'Shown on the node.' },
  {
    key: 'kind',
    label: 'Kind',
    type: 'select',
    props: {
      options: [
        { value: 'idea', label: 'Idea' },
        { value: 'question', label: 'Question' },
        { value: 'argument', label: 'Argument' },
      ],
    },
  },
  { key: 'data.colour', label: 'Colour', type: 'color', group: 'Appearance' },
  {
    key: 'data.weight',
    label: 'Weight',
    type: 'number',
    props: { min: 1, max: 5, step: 1 },
    group: 'Appearance',
  },
  { key: 'data.notes', label: 'Notes', type: 'textarea', group: 'Detail' },
  { key: 'data.tags', label: 'Tags', type: 'tags', group: 'Detail' },
  { key: 'data.due', label: 'Due', type: 'date', group: 'Detail' },
  {
    key: 'data.resolved',
    label: 'Resolved',
    type: 'checkbox',
    group: 'Detail',
    // Only a question can be resolved, so the field disappears for the rest.
    when: (subjects) => subjects.every((s) => s.kind === 'question'),
  },
  { key: 'id', label: 'Identifier', type: 'static', props: { mono: true }, group: 'Meta' },
];

/* -------------------------------------------------------------------------- */

const meta = {
  title: 'Properties/PropertyPanel',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An inspector: the properties of whatever is selected, as editable fields.\n\nGive it the selection and a list of field descriptors. It reads each property across every subject, renders the matching field, and hands back new copies on edit — it holds no state and mutates nothing.\n\nThe case worth dwelling on is **several subjects at once**. Where they agree, the field shows the shared value and editing sets all of them. Where they disagree it shows *Mixed* rather than one subject\'s value — hand-rolled inspectors usually skip this, and skipping it is how a multi-selection edit silently flattens data.\n\nEvery field is exported on its own, and `FieldShell` gives a bespoke control the same label, description and error frame.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[620px] w-[340px] overflow-hidden rounded-lg border border-border bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */

/** A panel wired to state, which is all a consumer has to write. */
const Inspector = ({
  selection,
  ...rest
}: {
  selection: string[];
} & Partial<PropertyPanelProps<Node>>) => {
  const [nodes, setNodes] = useState(NODES);
  const selected = nodes.filter((n) => selection.includes(n.id));

  return (
    <PropertyPanel<Node>
      subjects={selected}
      fields={FIELDS}
      title={(subjects) =>
        subjects.length > 1 ? `${subjects.length} nodes selected` : subjects[0]?.data.label
      }
      groupOrder={['Appearance', 'Detail', 'Meta']}
      onChange={(updated) =>
        setNodes((current) =>
          current.map((node) => updated.find((u) => u.id === node.id) ?? node),
        )
      }
      {...rest}
    />
  );
};

/** One subject: ordinary editing, grouped and ordered. */
export const SingleSelection: Story = {
  render: () => <Inspector selection={['n1']} />,
};

/**
 * Two subjects that disagree on almost everything. `Label`, `Notes` and `Tags`
 * show *Mixed*; `Due` agrees and edits normally; `Resolved` has vanished,
 * because only a question can be resolved.
 */
export const MultipleSelection: Story = {
  render: () => <Inspector selection={['n1', 'n2']} />,
};

/** Three subjects, one of which is missing several properties entirely. */
export const MixedThroughout: Story = {
  render: () => <Inspector selection={['n1', 'n2', 'n3']} />,
};

/** Nothing selected. Replace the message with `emptyState`. */
export const EmptySelection: Story = {
  render: () => <Inspector selection={[]} />,
};

/** Validation shows under the field and turns its border destructive. */
export const Validation: Story = {
  render: () => {
    const fields: IPropertyField<Node>[] = [
      {
        key: 'data.label',
        label: 'Label',
        validate: (value) =>
          !value || String(value).length < 3 ? 'At least three characters.' : undefined,
      },
      ...FIELDS.slice(1, 4),
    ];
    return <Inspector selection={['n1']} fields={fields} />;
  },
};

/**
 * A field type of your own.
 *
 * A renderer is any function of `{ field, state, onChange, subjects }`. Spread
 * `BUILT_IN_FIELD_TYPES` to keep the built-ins, and use `FieldShell` so the new
 * control carries the same label, description, error and *Mixed* treatment.
 */
export const CustomFieldType: Story = {
  render: () => {
    const fields: IPropertyField<Node>[] = [
      FIELDS[0],
      {
        key: 'data.weight',
        label: 'Weight',
        type: 'rating',
        description: 'A custom field type, registered by the app.',
      },
      ...FIELDS.slice(4),
    ];

    return (
      <Inspector
        selection={['n1']}
        fields={fields}
        fieldTypes={{
          ...BUILT_IN_FIELD_TYPES,
          rating: ({ field, state, onChange }) => (
            <FieldShell
              label={field.label}
              description={field.description}
              mixed={state.mixed}
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n}`}
                    onClick={() => onChange(n)}
                    className={cn(
                      'rounded p-1 transition-colors',
                      !state.mixed && (state.value as number) >= n
                        ? 'text-primary'
                        : 'text-muted-foreground/40 hover:text-muted-foreground',
                    )}
                  >
                    <Gauge size={16} />
                  </button>
                ))}
              </div>
            </FieldShell>
          ),
        }}
      />
    );
  },
};
