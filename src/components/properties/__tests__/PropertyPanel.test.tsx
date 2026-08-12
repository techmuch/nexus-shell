import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PropertyPanel,
  BUILT_IN_FIELD_TYPES,
  type IPropertyField,
  type PropertyPanelProps,
} from '../PropertyPanel';
import { FieldShell } from '../FieldShell';

/**
 * The panel's job is the selection boundary — empty, one, many — and applying
 * an edit across all of them without flattening values that disagree.
 */

interface Node {
  id: string;
  kind?: string;
  data?: { label?: string; notes?: string; tags?: string[]; done?: boolean; size?: number };
}

const node = (id: string, data: Node['data'] = {}, kind = 'idea'): Node => ({
  id,
  kind,
  data,
});

const FIELDS: IPropertyField<Node>[] = [
  { key: 'data.label', label: 'Label' },
  {
    key: 'kind',
    label: 'Kind',
    type: 'select',
    props: {
      options: [
        { value: 'idea', label: 'Idea' },
        { value: 'question', label: 'Question' },
      ],
    },
  },
  { key: 'data.notes', label: 'Notes', type: 'textarea', group: 'Detail' },
  { key: 'data.tags', label: 'Tags', type: 'tags', group: 'Detail' },
  { key: 'data.done', label: 'Done', type: 'checkbox', group: 'Detail' },
  { key: 'id', label: 'Identifier', type: 'static', group: 'Meta' },
];

/** A panel wired to state, close to what a consumer writes. */
const Harness = ({
  initial,
  fields = FIELDS,
  ...rest
}: {
  initial: Node[];
  fields?: IPropertyField<Node>[];
} & Partial<PropertyPanelProps<Node>>) => {
  const [subjects, setSubjects] = useState(initial);

  return (
    <div>
      <PropertyPanel<Node>
        subjects={subjects}
        fields={fields}
        onChange={(updated) => setSubjects(updated)}
        {...rest}
      />
      <p data-testid="state">
        {subjects
          .map((s) => `${s.id}:${s.data?.label ?? '-'}:${s.kind ?? '-'}`)
          .join(' ')}
      </p>
    </div>
  );
};

const state = () => screen.getByTestId('state').textContent;

afterEach(cleanup);

describe('empty selection', () => {
  it('renders the default empty state', () => {
    render(<PropertyPanel subjects={[]} fields={FIELDS} />);
    expect(screen.getByText(/Nothing selected/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Label')).not.toBeInTheDocument();
  });

  it('accepts a custom empty state', () => {
    render(
      <PropertyPanel subjects={[]} fields={FIELDS} emptyState={<p>Pick a node</p>} />,
    );
    expect(screen.getByText('Pick a node')).toBeInTheDocument();
  });
});

describe('single selection', () => {
  it('shows each field with the subject value', () => {
    render(<Harness initial={[node('a', { label: 'Hello', notes: 'Some notes' })]} />);

    expect(screen.getByLabelText('Label')).toHaveValue('Hello');
    expect(screen.getByLabelText('Notes')).toHaveValue('Some notes');
    expect(screen.getByLabelText('Kind')).toHaveValue('idea');
  });

  it('writes an edit back through onChange', async () => {
    render(<Harness initial={[node('a', { label: 'Old' })]} />);

    await userEvent.clear(screen.getByLabelText('Label'));
    await userEvent.type(screen.getByLabelText('Label'), 'New');

    expect(state()).toContain('a:New');
  });

  it('edits a select', async () => {
    render(<Harness initial={[node('a', {}, 'idea')]} />);
    await userEvent.selectOptions(screen.getByLabelText('Kind'), 'question');
    expect(state()).toContain(':question');
  });

  it('renders a static field as text, not an input', () => {
    render(<Harness initial={[node('a')]} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.queryByLabelText('Identifier')).not.toBeInTheDocument();
  });

  it('groups fields under their headings, ungrouped first', () => {
    render(<Harness initial={[node('a')]} />);

    const headings = screen.getAllByRole('heading').map((h) => h.textContent);
    expect(headings).toEqual(['Detail', 'Meta']);
  });

  it('honours an explicit group order', () => {
    render(<Harness initial={[node('a')]} groupOrder={['Meta', 'Detail']} />);
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual([
      'Meta',
      'Detail',
    ]);
  });

  it('renders a title, which may read the selection', () => {
    render(<Harness initial={[node('a')]} title={(s) => `${s.length} selected`} />);
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });
});

describe('multiple selection', () => {
  const two = [node('a', { label: 'Same' }), node('b', { label: 'Same' })];
  const differing = [node('a', { label: 'One' }), node('b', { label: 'Two' })];

  /** The wrapper around one field, so "Mixed" can be checked per field. */
  const fieldOf = (label: string) =>
    screen.getByLabelText(label).closest('div.flex.flex-col') as HTMLElement;

  it('shows a shared value normally', () => {
    render(<Harness initial={two} />);

    expect(screen.getByLabelText('Label')).toHaveValue('Same');
    expect(within(fieldOf('Label')).queryByText('Mixed')).not.toBeInTheDocument();
  });

  it('marks only the fields that actually disagree', () => {
    render(<Harness initial={two} />);

    // Label agrees; id does not, and the static field says so.
    expect(within(fieldOf('Label')).queryByText('Mixed')).not.toBeInTheDocument();
    expect(screen.getAllByText('Mixed')).toHaveLength(1);
  });

  it('shows Mixed, and no value, when subjects disagree', () => {
    render(<Harness initial={differing} />);

    const input = screen.getByLabelText('Label');
    // Showing one subject's value here is how a multi-edit flattens data.
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Mixed values');
    expect(screen.getAllByText('Mixed').length).toBeGreaterThan(0);
  });

  it('applies an edit to every subject', async () => {
    render(<Harness initial={differing} />);

    await userEvent.type(screen.getByLabelText('Label'), 'Both');
    expect(state()).toContain('a:Both');
    expect(state()).toContain('b:Both');
  });

  it('renders a mixed checkbox as indeterminate', () => {
    render(
      <Harness initial={[node('a', { done: true }), node('b', { done: false })]} />,
    );
    const box = screen.getByLabelText('Done') as HTMLInputElement;

    // Neither on nor off is the only honest state for a disagreeing selection.
    expect(box.indeterminate).toBe(true);
    expect(box.checked).toBe(false);
  });

  it('does not mark a checkbox mixed when subjects agree', () => {
    render(<Harness initial={[node('a', { done: true }), node('b', { done: true })]} />);
    const box = screen.getByLabelText('Done') as HTMLInputElement;
    expect(box.indeterminate).toBe(false);
    expect(box.checked).toBe(true);
  });
});

describe('field visibility and validation', () => {
  it('hides a field when `when` returns false', () => {
    const fields: IPropertyField<Node>[] = [
      { key: 'data.label', label: 'Label' },
      {
        key: 'data.notes',
        label: 'Notes',
        // Only meaningful for questions.
        when: (subjects) => subjects.every((s) => s.kind === 'question'),
      },
    ];

    render(<PropertyPanel subjects={[node('a', {}, 'idea')]} fields={fields} />);
    expect(screen.queryByLabelText('Notes')).not.toBeInTheDocument();

    cleanup();
    render(<PropertyPanel subjects={[node('a', {}, 'question')]} fields={fields} />);
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('shows a validation message', () => {
    const fields: IPropertyField<Node>[] = [
      {
        key: 'data.label',
        label: 'Label',
        validate: (value) => (value ? undefined : 'Required'),
      },
    ];
    render(<Harness initial={[node('a')]} fields={fields} />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows a description when there is no error', () => {
    const fields: IPropertyField<Node>[] = [
      { key: 'data.label', label: 'Label', description: 'Shown on the node' },
    ];
    render(<Harness initial={[node('a')]} fields={fields} />);
    expect(screen.getByText('Shown on the node')).toBeInTheDocument();
  });

  it('renders a disabled field read-only', () => {
    const fields: IPropertyField<Node>[] = [
      { key: 'data.label', label: 'Label', disabled: true },
    ];
    render(<Harness initial={[node('a')]} fields={fields} />);
    expect(screen.getByLabelText('Label')).toBeDisabled();
  });
});

describe('the field registry', () => {
  it('renders a custom field type', () => {
    const fields: IPropertyField<Node>[] = [
      { key: 'data.size', label: 'Size', type: 'stars' },
    ];

    render(
      <Harness
        initial={[node('a', { size: 3 })]}
        fields={fields}
        fieldTypes={{
          ...BUILT_IN_FIELD_TYPES,
          // Anything of this shape is a field type.
          stars: ({ field, state: value, onChange }) => (
            <FieldShell label={field.label}>
              <button type="button" onClick={() => onChange(((value.value as number) ?? 0) + 1)}>
                {'★'.repeat((value.value as number) ?? 0)}
              </button>
            </FieldShell>
          ),
        }}
      />,
    );

    expect(screen.getByText('★★★')).toBeInTheDocument();
  });

  it('can replace a built-in type', () => {
    render(
      <Harness
        initial={[node('a', { label: 'Hi' })]}
        fields={[{ key: 'data.label', label: 'Label' }]}
        fieldTypes={{
          ...BUILT_IN_FIELD_TYPES,
          text: ({ field }) => <p>custom {field.label}</p>,
        }}
      />,
    );
    expect(screen.getByText('custom Label')).toBeInTheDocument();
  });

  it('reports an unregistered type instead of rendering nothing', () => {
    render(
      <Harness initial={[node('a')]} fields={[{ key: 'x', label: 'X', type: 'nope' }]} />,
    );
    // Silence here would be a blank gap with no explanation.
    expect(screen.getByText(/No renderer registered/)).toBeInTheDocument();
  });
});

describe('immutability', () => {
  it('never mutates the subjects it is given', async () => {
    const original = node('a', { label: 'Old' });
    const onChange = vi.fn();

    render(<PropertyPanel<Node> subjects={[original]} fields={FIELDS} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Label'), '!');

    expect(original.data?.label).toBe('Old');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0][0]).not.toBe(original);
  });
});
