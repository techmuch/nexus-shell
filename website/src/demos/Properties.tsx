import { useMemo, useState } from 'react';
import { Gauge } from 'lucide-react';
import {
  CheckboxField,
  ColorField,
  DateField,
  FieldShell,
  GraphCanvas,
  GraphEdge,
  GraphEdgeLayer,
  GraphNode,
  NumberField,
  PropertyPanel,
  SelectField,
  StaticField,
  TagField,
  TextAreaField,
  TextField,
  BUILT_IN_FIELD_TYPES,
  type IGraphEdge,
  type IGraphNode,
  type IPropertyField,
} from 'nexus-shell';

/* -------------------------------------------------------------------------- */
/* Shared domain                                                              */
/* -------------------------------------------------------------------------- */

interface NodeData {
  label: string;
  notes?: string;
  colour?: string;
  tags?: string[];
  due?: string;
  weight?: number;
  resolved?: boolean;
}

type Node = IGraphNode & { data: NodeData };

const KINDS = [
  { value: 'question', label: 'Question' },
  { value: 'idea', label: 'Idea' },
  { value: 'argument', label: 'Argument' },
];

const FIELDS: IPropertyField<Node>[] = [
  { key: 'data.label', label: 'Label', description: 'Shown on the node.' },
  { key: 'kind', label: 'Kind', type: 'select', props: { options: KINDS } },
  { key: 'data.colour', label: 'Colour', type: 'color', group: 'Appearance' },
  {
    key: 'data.weight',
    label: 'Weight',
    type: 'number',
    props: { min: 1, max: 5, step: 1 },
    group: 'Appearance',
  },
  { key: 'data.notes', label: 'Notes', type: 'textarea', props: { rows: 3 }, group: 'Detail' },
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

const NODES: Node[] = [
  {
    id: 'ship',
    kind: 'question',
    position: { x: 60, y: 60 },
    size: { width: 200, height: 64 },
    data: {
      label: 'Ship on Friday?',
      notes: 'The release train is weekly, so slipping costs seven days.',
      colour: '#3b82f6',
      tags: ['release'],
      due: '2026-09-04',
      weight: 3,
      resolved: false,
    },
  },
  {
    id: 'flag',
    kind: 'idea',
    position: { x: 340, y: 20 },
    size: { width: 200, height: 64 },
    data: {
      label: 'Ship behind a flag',
      notes: 'Decouples the deploy from the launch.',
      colour: '#22c55e',
      tags: ['release', 'urgent'],
      due: '2026-09-04',
      weight: 5,
    },
  },
  {
    id: 'qa',
    kind: 'argument',
    position: { x: 340, y: 150 },
    size: { width: 200, height: 64 },
    data: { label: 'QA has not signed off', colour: '#ef4444', tags: ['risk'], weight: 5 },
  },
];

const EDGES: IGraphEdge[] = [
  { id: 'e1', source: 'ship', target: 'flag' },
  { id: 'e2', source: 'ship', target: 'qa' },
];

/* -------------------------------------------------------------------------- */
/* Fields on their own                                                        */
/* -------------------------------------------------------------------------- */

// #region fields
export const Fields = () => {
  const [state, setState] = useState({
    label: 'Ship behind a flag',
    notes: 'Decouples the deploy from the launch.',
    kind: 'idea',
    weight: 3,
    colour: '#22c55e',
    due: '2026-09-04',
    tags: ['release', 'urgent'],
    resolved: true,
  });

  // Every field is an ordinary controlled component: pass `value`, get
  // `onChange`. Reach for them directly when a property needs its own layout.
  const set =
    <K extends keyof typeof state>(key: K) =>
    (value: (typeof state)[K]) =>
      setState((s) => ({ ...s, [key]: value }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField label="Label" value={state.label} onChange={set('label')} />
      <SelectField label="Kind" value={state.kind} options={KINDS} onChange={set('kind')} />
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
      <div className="sm:col-span-2">
        <TextAreaField label="Notes" value={state.notes} onChange={set('notes')} rows={3} />
      </div>
      <CheckboxField label="Resolved" value={state.resolved} onChange={set('resolved')} />
      <StaticField label="Identifier" value="node-8f21c4" mono />
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* The panel, and the mixed case                                              */
/* -------------------------------------------------------------------------- */

// #region panel
export const MultiSelect = () => {
  const [nodes, setNodes] = useState(NODES);
  const [selection, setSelection] = useState<string[]>(['ship', 'flag']);
  const selected = nodes.filter((n) => selection.includes(n.id));

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col gap-2 border-r border-border p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Selection
        </p>
        {nodes.map((node) => (
          <label
            key={node.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs"
          >
            <input
              type="checkbox"
              checked={selection.includes(node.id)}
              onChange={(e) =>
                setSelection((s) =>
                  e.target.checked ? [...s, node.id] : s.filter((id) => id !== node.id),
                )
              }
            />
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: node.data.colour }}
            />
            {node.data.label}
          </label>
        ))}
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Select more than one. Where they agree the field edits all of them; where
          they disagree it says <em>Mixed</em> rather than showing one node’s value.
        </p>
      </div>

      <div className="w-[300px] shrink-0">
        <PropertyPanel<Node>
          subjects={selected}
          fields={FIELDS}
          groupOrder={['Appearance', 'Detail', 'Meta']}
          title={(subjects) =>
            subjects.length > 1 ? `${subjects.length} nodes selected` : subjects[0]?.data.label
          }
          // The panel mutates nothing — it hands back new copies to merge.
          onChange={(updated) =>
            setNodes((current) =>
              current.map((node) => updated.find((u) => u.id === node.id) ?? node),
            )
          }
        />
      </div>
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* A graph inspector                                                          */
/* -------------------------------------------------------------------------- */

// #region inspector
export const GraphInspector = () => {
  const [nodes, setNodes] = useState(NODES);
  const [selection, setSelection] = useState<string[]>(['ship']);
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const selected = nodes.filter((n) => selection.includes(n.id));

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <GraphCanvas>
          <GraphEdgeLayer>
            {EDGES.map((edge) => (
              <GraphEdge
                key={edge.id}
                edge={edge}
                source={byId[edge.source]}
                target={byId[edge.target]}
                routing="smoothstep"
              />
            ))}
          </GraphEdgeLayer>

          {nodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              selected={selection.includes(node.id)}
              // Shift-click adds to the selection — which is what makes the
              // panel's mixed handling worth having.
              onSelect={(id, event) =>
                setSelection((current) =>
                  event?.shiftKey
                    ? current.includes(id)
                      ? current.filter((s) => s !== id)
                      : [...current, id]
                    : [id],
                )
              }
              onMove={(id, position) =>
                setNodes((current) =>
                  current.map((n) => (n.id === id ? { ...n, position } : n)),
                )
              }
            >
              <div className="flex h-full items-center gap-2 px-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: node.data.colour }}
                />
                <p className="truncate text-sm font-medium">{node.data.label}</p>
              </div>
            </GraphNode>
          ))}
        </GraphCanvas>
      </div>

      <div className="w-[300px] shrink-0 border-l border-border">
        <PropertyPanel<Node>
          subjects={selected}
          fields={FIELDS}
          groupOrder={['Appearance', 'Detail', 'Meta']}
          emptyState={
            <div className="grid h-full place-items-center px-6 text-center">
              <p className="text-xs text-muted-foreground">
                Click a node. Shift-click to select several.
              </p>
            </div>
          }
          title={(subjects) =>
            subjects.length > 1 ? `${subjects.length} nodes selected` : subjects[0]?.data.label
          }
          onChange={(updated) =>
            setNodes((current) =>
              current.map((node) => updated.find((u) => u.id === node.id) ?? node),
            )
          }
        />
      </div>
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* A field type of your own                                                   */
/* -------------------------------------------------------------------------- */

// #region custom
export const CustomFieldType = () => {
  const [nodes, setNodes] = useState(NODES);

  // A renderer is any function of `{ field, state, onChange, subjects }`.
  // `FieldShell` gives it the same label, description and Mixed treatment as
  // the built-ins, so a one-off field never looks like one.
  const fieldTypes = {
    ...BUILT_IN_FIELD_TYPES,
    rating: ({ field, state, onChange }: Parameters<(typeof BUILT_IN_FIELD_TYPES)['text']>[0]) => (
      <FieldShell label={field.label} description={field.description} mixed={state.mixed}>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n}`}
              onClick={() => onChange(n)}
              className={
                !state.mixed && (state.value as number) >= n
                  ? 'rounded p-1 text-primary'
                  : 'rounded p-1 text-muted-foreground/40 hover:text-muted-foreground'
              }
            >
              <Gauge size={16} />
            </button>
          ))}
        </div>
      </FieldShell>
    ),
  };

  return (
    <div className="mx-auto w-[300px]">
      <PropertyPanel<Node>
        subjects={nodes.slice(0, 1)}
        fieldTypes={fieldTypes}
        fields={[
          FIELDS[0],
          {
            key: 'data.weight',
            label: 'Weight',
            type: 'rating',
            description: 'A field type registered by the application.',
          },
          FIELDS[1],
        ]}
        onChange={(updated) =>
          setNodes((current) =>
            current.map((node) => updated.find((u) => u.id === node.id) ?? node),
          )
        }
      />
    </div>
  );
};
// #endregion
