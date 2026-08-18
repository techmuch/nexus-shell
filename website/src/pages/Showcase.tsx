import { useState } from 'react';
import {
  ArrowRight,
  Blocks,
  Database,
  FileCode2,
  GitFork,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  DataGrid,
  GraphCanvas,
  GraphEdge,
  GraphMiniMap,
  GraphNode,
  NodePalette,
  PropertyPanel,
  TextField,
  useGraphKeyboard,
  type IDataGridColumn,
  type IFieldDefinition,
  type IGraphEdge,
  type IGraphNode,
  type IPropertySubject,
} from 'nexus-shell';
import { CodeBlock } from '@site/site/CodeBlock';
import { H2, P } from '@site/site/Prose';
import { Link } from '@site/lib/router';
import { Full as ShellDemo } from '@site/demos/ShellLayout';

/* ------------------------------------------------ Dialogue Mapper State */
const INITIAL_GRAPH_NODES: IGraphNode[] = [
  { id: '1', kind: 'question', position: { x: 100, y: 120 }, data: { label: 'How to scale application shell?' } },
  { id: '2', kind: 'idea', position: { x: 420, y: 80 }, data: { label: 'Decouple view registration from shell layout' } },
  { id: '3', kind: 'pro', position: { x: 740, y: 50 }, data: { label: 'Plugins can contribute views without shell imports' } },
  { id: '4', kind: 'con', position: { x: 740, y: 150 }, data: { label: 'Requires id string string registration' } },
];

const INITIAL_GRAPH_EDGES: IGraphEdge[] = [
  { id: 'e1-2', source: '1', target: '2', sourceSide: 'right', targetSide: 'left' },
  { id: 'e2-3', source: '2', target: '3', sourceSide: 'right', targetSide: 'left' },
  { id: 'e2-4', source: '2', target: '4', sourceSide: 'right', targetSide: 'left' },
];

const NODE_PALETTE_ITEMS = [
  { kind: 'question', label: 'Question', description: 'Problem statement or decision point' },
  { kind: 'idea', label: 'Idea', description: 'Proposed solution or architecture' },
  { kind: 'pro', label: 'Pro', description: 'Supporting argument or advantage' },
  { kind: 'con', label: 'Con', description: 'Counter-argument or trade-off' },
];

const PROPERTY_FIELDS: IFieldDefinition[] = [
  { key: 'kind', label: 'Node Kind', type: 'select', options: [{ label: 'Question', value: 'question' }, { label: 'Idea', value: 'idea' }, { label: 'Pro', value: 'pro' }, { label: 'Con', value: 'con' }] },
  { key: 'data.label', label: 'Label / Title', type: 'text', placeholder: 'Enter node summary…' },
  { key: 'data.description', label: 'Detailed Description', type: 'textarea', placeholder: 'Elaborate on this node…' },
  { key: 'data.priority', label: 'Priority Level', type: 'number' },
];

/* ------------------------------------------------ Data Grid Inspector State */
interface ITaskRecord extends IPropertySubject {
  id: string;
  title: string;
  category: string;
  status: string;
  assignee: string;
  priority: number;
}

const SAMPLE_TASKS: ITaskRecord[] = [
  { id: 'TSK-101', title: 'Implement PaneHost layout engine', category: 'Layout', status: 'Done', assignee: 'Alex', priority: 1 },
  { id: 'TSK-102', title: 'Add GraphMiniMap component', category: 'Graph', status: 'Done', assignee: 'Jordan', priority: 2 },
  { id: 'TSK-103', title: 'Multi-selection PropertyPanel', category: 'Properties', status: 'In Progress', assignee: 'Taylor', priority: 1 },
  { id: 'TSK-104', title: 'Global Cmd+K QuickSearch modal', category: 'Search', status: 'In Progress', assignee: 'Alex', priority: 3 },
  { id: 'TSK-105', title: 'CSS token theme engine', category: 'Theming', status: 'Done', assignee: 'Morgan', priority: 2 },
];

const TASK_COLUMNS: IDataGridColumn<ITaskRecord>[] = [
  { key: 'id', header: 'ID', width: '100px' },
  { key: 'title', header: 'Task Name', sortable: true },
  { key: 'category', header: 'Category', sortable: true, width: '120px' },
  { key: 'status', header: 'Status', sortable: true, width: '120px' },
  { key: 'assignee', header: 'Assignee', width: '120px' },
];

const TASK_PROPERTY_FIELDS: IFieldDefinition[] = [
  { key: 'title', label: 'Task Title', type: 'text' },
  { key: 'category', label: 'Category', type: 'select', options: [{ label: 'Layout', value: 'Layout' }, { label: 'Graph', value: 'Graph' }, { label: 'Properties', value: 'Properties' }, { label: 'Search', value: 'Search' }, { label: 'Theming', value: 'Theming' }] },
  { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Backlog', value: 'Backlog' }, { label: 'In Progress', value: 'In Progress' }, { label: 'Done', value: 'Done' }] },
  { key: 'assignee', label: 'Assignee', type: 'text' },
  { key: 'priority', label: 'Priority', type: 'number' },
];

export const Showcase = () => {
  // Graph State
  const [nodes, setNodes] = useState<IGraphNode[]>(INITIAL_GRAPH_NODES);
  const [edges] = useState<IGraphEdge[]>(INITIAL_GRAPH_EDGES);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(['1']);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  // DataGrid State
  const [tasks, setTasks] = useState<ITaskRecord[]>(SAMPLE_TASKS);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(['TSK-103']);

  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
  const selectedTasks = tasks.filter((t) => selectedTaskIds.includes(t.id));

  const handleGraphNodeChange = (updatedSubject: IPropertySubject) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === updatedSubject.id ? ({ ...n, ...updatedSubject } as IGraphNode) : n)),
    );
  };

  const handleTaskChange = (updatedSubject: IPropertySubject) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedSubject.id ? ({ ...t, ...updatedSubject } as ITaskRecord) : t)),
    );
  };

  return (
    <div className="pb-16 space-y-16">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary mb-4">
          <Sparkles size={14} /> Full Application Compositions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Showcase & Examples</h1>
        <P className="mt-3 text-base">
          Interactive full-featured application workflows built entirely by composing Nexus Shell primitives.
        </P>
      </header>

      {/* -------------------------------------------------- Showcase 1: Dialogue Mapper */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Example 1</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1 text-foreground">
            Dialogue & Decision Graph Editor
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Composes <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">GraphCanvas</code>,{' '}
            <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">NodePalette</code>,{' '}
            <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">GraphMiniMap</code>, and{' '}
            <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">PropertyPanel</code>. Click a node to inspect its attributes, drag from the palette to place new nodes, or pan/zoom the canvas.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[560px]">
          {/* Left Palette & Canvas */}
          <div className="flex-1 flex flex-col relative bg-background overflow-hidden border-r border-border/70">
            {/* Top Palette Bar */}
            <div className="p-2 border-b border-border bg-muted/20 flex items-center justify-between">
              <NodePalette items={NODE_PALETTE_ITEMS} orientation="horizontal" />
              <span className="text-xs font-mono text-muted-foreground px-2">Drag or Click item to add</span>
            </div>

            {/* Main Graph Canvas */}
            <div className="flex-1 relative">
              <GraphCanvas
                viewport={viewport}
                onViewportChange={setViewport}
                className="w-full h-full"
              >
                {edges.map((e) => {
                  const src = nodes.find((n) => n.id === e.source);
                  const tgt = nodes.find((n) => n.id === e.target);
                  if (!src || !tgt) return null;
                  return (
                    <GraphEdge
                      key={e.id}
                      source={src.position}
                      target={tgt.position}
                      sourceSide={e.sourceSide}
                      targetSide={e.targetSide}
                      routing="bezier"
                    />
                  );
                })}

                {nodes.map((n) => (
                  <GraphNode
                    key={n.id}
                    id={n.id}
                    position={n.position}
                    selected={selectedNodeIds.includes(n.id)}
                    onClick={() => setSelectedNodeIds([n.id])}
                    onMove={(pos) =>
                      setNodes((prev) => prev.map((node) => (node.id === n.id ? { ...node, position: pos } : node)))
                    }
                    className="w-56 p-3.5 bg-card border border-border shadow-lg rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {n.kind}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground leading-snug">{n.data?.label}</p>
                  </GraphNode>
                ))}
              </GraphCanvas>

              {/* Bottom Right MiniMap */}
              <div className="absolute bottom-3 right-3 z-10">
                <GraphMiniMap
                  nodes={nodes}
                  viewport={viewport}
                  onViewportChange={setViewport}
                  canvasSize={{ width: 600, height: 450 }}
                />
              </div>
            </div>
          </div>

          {/* Right Property Panel Inspector */}
          <div className="w-full lg:w-80 bg-card border-t lg:border-t-0 border-border p-4 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Node Property Inspector
            </h3>
            {selectedNodes.length > 0 ? (
              <PropertyPanel
                selection={selectedNodes}
                fields={PROPERTY_FIELDS}
                onChange={handleGraphNodeChange}
              />
            ) : (
              <div className="text-xs text-muted-foreground py-8 text-center">
                Click any node on the graph canvas to inspect and edit its properties.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Showcase 2: Workbench IDE Shell */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Example 2</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1 text-foreground">
            Complete Workbench IDE Shell
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">ShellLayout</code> provides the entire desktop application frame — dockable tabs, command palette, sidebar rails, terminal, and AI chat pane.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 overflow-hidden shadow-2xl flex flex-col h-[560px]">
          <ShellDemo />
        </div>
      </section>

      {/* -------------------------------------------------- Showcase 3: Data Grid & Property Inspector */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Example 3</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1 text-foreground">
            Data Grid & Multi-Selection Inspector
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Composes <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">DataGrid</code> with <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">PropertyPanel</code>. Select one or multiple rows to inspect and batch-edit properties across items.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[460px]">
          {/* Data Grid */}
          <div className="flex-1 p-4 bg-background overflow-hidden border-r border-border/70">
            <DataGrid
              columns={TASK_COLUMNS}
              data={tasks}
              selectedIds={selectedTaskIds}
              onSelectionChange={setSelectedTaskIds}
              className="h-full"
            />
          </div>

          {/* Right Inspector */}
          <div className="w-full lg:w-80 bg-card border-t lg:border-t-0 border-border p-4 flex flex-col overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Multi-Select Task Inspector
            </h3>
            <PropertyPanel
              selection={selectedTasks}
              fields={TASK_PROPERTY_FIELDS}
              onChange={handleTaskChange}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
