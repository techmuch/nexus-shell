import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid, IDataGridColumn } from '../components/widgets/DataGrid';
import { useState } from 'react';
import { Play, RotateCcw, CheckCircle, ShieldAlert } from 'lucide-react';

const meta: Meta<typeof DataGrid> = {
  title: 'Widgets/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

interface AgentRecord {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'running' | 'failed' | 'completed';
  uptime: number;
  accuracy: number;
}

const columns: IDataGridColumn<AgentRecord>[] = [
  { key: 'id', header: 'ID', width: '10%', sortable: true },
  { key: 'name', header: 'Agent Name', width: '25%', sortable: true },
  { key: 'type', header: 'Type', width: '15%', sortable: true },
  {
    key: 'status',
    header: 'Status',
    width: '15%',
    sortable: true,
    render: (value) => {
      const statusColors: Record<string, string> = {
        idle: 'bg-muted text-muted-foreground border-border',
        running: 'bg-primary/15 text-primary border-primary/20 animate-pulse',
        failed: 'bg-destructive/15 text-destructive border-destructive/20',
        completed: 'bg-green-500/15 text-green-500 border-green-500/20',
      };
      
      const statusIcons: Record<string, React.ReactNode> = {
        idle: <RotateCcw size={12} className="mr-1.5 text-muted-foreground" />,
        running: <Play size={12} className="mr-1.5 text-primary" />,
        failed: <ShieldAlert size={12} className="mr-1.5 text-destructive" />,
        completed: <CheckCircle size={12} className="mr-1.5 text-green-500" />,
      };

      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColors[value] || ''}`}>
          {statusIcons[value]}
          {String(value).toUpperCase()}
        </span>
      );
    },
  },
  {
    key: 'uptime',
    header: 'Uptime',
    width: '15%',
    sortable: true,
    render: (value) => `${Number(value).toLocaleString()}s`,
  },
  {
    key: 'accuracy',
    header: 'Accuracy',
    width: '20%',
    sortable: true,
    render: (value) => `${(Number(value) * 100).toFixed(1)}%`,
  },
];

const sampleData: AgentRecord[] = [
  { id: 'agt-001', name: 'Strategic Planner', type: 'ReAct Agent', status: 'running', uptime: 3600, accuracy: 0.942 },
  { id: 'agt-002', name: 'Translation Pipeline', type: 'Translator', status: 'idle', uptime: 7200, accuracy: 0.985 },
  { id: 'agt-003', name: 'Vulnerability Scanner', type: 'Security Validator', status: 'failed', uptime: 120, accuracy: 0.450 },
  { id: 'agt-004', name: 'Log Classifier', type: 'Classifier', status: 'completed', uptime: 18000, accuracy: 0.910 },
  { id: 'agt-005', name: 'Risk Evaluator', type: 'Critic Agent', status: 'running', uptime: 4200, accuracy: 0.897 },
];

export const Light: Story = {
  render: () => (
    <div className="theme-light bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} />
      </div>
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} />
      </div>
    </div>
  ),
};

export const GeorgiaTech: Story = {
  render: () => (
    <div className="theme-gt bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} />
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="theme-dark bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} loading />
      </div>
    </div>
  ),
};

export const LargeDataset: Story = {
  render: () => {
    const largeData: AgentRecord[] = Array.from({ length: 2000 }).map((_, index) => {
      const statuses: AgentRecord['status'][] = ['idle', 'running', 'failed', 'completed'];
      const types = ['ReAct Agent', 'Translator', 'Security Validator', 'Classifier', 'Critic Agent'];
      return {
        id: `agt-${String(index + 1).padStart(4, '0')}`,
        name: `Agent ${index + 1}`,
        type: types[index % types.length],
        status: statuses[index % statuses.length],
        uptime: Math.floor(Math.random() * 86400),
        accuracy: 0.5 + Math.random() * 0.5,
      };
    });

    return (
      <div className="theme-dark bg-background text-foreground p-4 rounded border">
        <div className="h-96">
          <DataGrid columns={columns} data={largeData} />
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);

    return (
      <div className="theme-dark bg-background text-foreground p-4 rounded border flex flex-col space-y-4">
        <div className="h-96 flex-1">
          <DataGrid
            columns={columns}
            data={sampleData}
            onRowClick={(row) => setSelectedAgent(row)}
            selectedRowId={selectedAgent?.id}
          />
        </div>
        
        {selectedAgent ? (
          <div className="p-4 bg-muted/30 border border-border rounded-lg flex flex-col space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Selected Agent Inspection
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Name:</span>
                <span className="font-semibold">{selectedAgent.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Uptime:</span>
                <span>{selectedAgent.uptime.toLocaleString()} seconds</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Target Accuracy:</span>
                <span className="font-mono font-medium">{(selectedAgent.accuracy * 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Type:</span>
                <span>{selectedAgent.type}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/10 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground italic">
            Click a row in the data grid to view details
          </div>
        )}
      </div>
    );
  },
};
