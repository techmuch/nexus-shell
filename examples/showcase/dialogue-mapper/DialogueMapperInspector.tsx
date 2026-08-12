import React from 'react';
import { Trash2 } from 'lucide-react';
import { PropertyPanel, type IPropertyField } from '../../../src/index';
import {
  getMapStore,
  IBIS_TYPES,
  type DialogueNode,
  type IbisNodeType,
} from './DialogueMappingService';

/**
 * The argument inspector.
 *
 * Every field here is a descriptor rather than markup. That is what replaced
 * roughly two hundred lines of hand-written labels and inputs, and it is also
 * what gives the panel multi-selection editing — retagging or resolving a dozen
 * nodes at once now works, where before selecting more than one showed
 * "cannot be edited simultaneously".
 */

/** Types whose resolution status is meaningful. */
const RESOLVABLE: IbisNodeType[] = ['question', 'idea', 'decision'];

const FIELDS: IPropertyField<DialogueNode>[] = [
  {
    key: 'data.title',
    label: 'Node label',
    validate: (value) => (String(value ?? '').trim() ? undefined : 'A node needs a label.'),
  },
  {
    key: 'kind',
    label: 'Argument logic class',
    type: 'select',
    description: 'Changing this can change what the node may connect to.',
    props: { options: IBIS_TYPES.map(({ value, label }) => ({ value, label })) },
  },
  {
    key: 'data.status',
    label: 'Resolution status',
    type: 'select',
    // Only ask about resolution where resolution means something.
    when: (nodes) => nodes.every((n) => RESOLVABLE.includes(n.kind)),
    props: {
      placeholder: 'Pending',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted / Chosen' },
        { value: 'rejected', label: 'Rejected / Dropped' },
      ],
    },
  },
  {
    key: 'data.description',
    label: 'Description & notes',
    type: 'textarea',
    group: 'Detail',
    props: { rows: 4, placeholder: 'Details, facts, URLs, or evidence context…' },
  },
  {
    key: 'data.url',
    label: 'Link URL',
    type: 'text',
    group: 'Detail',
    when: (nodes) => nodes.every((n) => n.kind === 'link'),
    props: { inputType: 'url', placeholder: 'https://example.com' },
  },
  {
    key: 'data.imageUrl',
    label: 'Image URL',
    type: 'text',
    group: 'Detail',
    when: (nodes) => nodes.every((n) => n.kind === 'image'),
    props: { inputType: 'url', placeholder: 'Image URL or local path…' },
  },
  {
    key: 'data.tags',
    label: 'Tags / categories',
    type: 'tags',
    group: 'Detail',
    props: { placeholder: 'e.g. database' },
  },
  { key: 'data.author', label: 'Author', type: 'static', group: 'Provenance' },
  { key: 'data.timestamp', label: 'Created', type: 'static', group: 'Provenance' },
  { key: 'id', label: 'Identifier', type: 'static', group: 'Provenance', props: { mono: true } },
];

export const DialogueMapperInspector: React.FC<{ mapId?: string }> = ({ mapId }) => {
  const useStore = React.useMemo(() => getMapStore(mapId), [mapId]);
  const nodes = useStore((state) => state.nodes);
  const selectedIds = useStore((state) => state.selectedIds);
  const setNodes = useStore((state) => state.setNodes);
  const deleteSelection = useStore((state) => state.deleteSelection);

  const selected = nodes.filter((node) => selectedIds.includes(node.id));

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-card/45 font-sans text-foreground">
      <div className="flex shrink-0 items-center border-b border-border bg-card p-3">
        <h3 className="text-sm font-bold tracking-tight">Argument Inspector</h3>
      </div>

      <div className="min-h-0 flex-1">
        <PropertyPanel<DialogueNode>
          subjects={selected}
          fields={FIELDS}
          groupOrder={['Detail', 'Provenance']}
          title={
            selected.length > 1 ? `${selected.length} nodes selected` : undefined
          }
          emptyState={
            <div className="grid h-full place-items-center px-6 text-center">
              <p className="text-xs italic text-muted-foreground/60">
                No node selected. Click a node in the mapping canvas to view and edit its
                logical properties.
              </p>
            </div>
          }
          onChange={(updated) => {
            const byId = new Map(updated.map((node) => [node.id, node]));
            setNodes(nodes.map((node) => byId.get(node.id) ?? node));
          }}
        />
      </div>

      {selected.length > 0 && (
        <div className="shrink-0 border-t border-border/40 p-4">
          <button
            type="button"
            onClick={deleteSelection}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 py-2 text-xs font-bold text-destructive shadow-sm transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-95"
          >
            <Trash2 size={13} />
            {selected.length > 1 ? `Delete ${selected.length} nodes` : 'Delete node from map'}
          </button>
        </div>
      )}
    </div>
  );
};
