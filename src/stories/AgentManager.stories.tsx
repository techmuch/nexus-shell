import type { Meta, StoryObj } from '@storybook/react';
import { AgentManager, Agent } from '../components/widgets/AgentManager';
import { useState } from 'react';

const meta = {
  title: 'Widgets/AgentManager',
  component: AgentManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onFetchAgents: { action: 'fetched' },
    onSaveAgent: { action: 'saved' },
    onDeleteAgent: { action: 'deleted' },
  },
} satisfies Meta<typeof AgentManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Email Summarizer',
    description: 'Summarizes daily important emails using LLM and vector database retrievers.',
    schemaJson: '{"nodes":[{"id":"start","type":"custom","position":{"x":100,"y":200},"data":{"label":"START","type":"START","settings":{}}}],"edges":[]}',
  },
  {
    id: 'agent-2',
    name: 'Draft Composer',
    description: 'Composes draft responses to client inquiries autonomously.',
    schemaJson: '{"nodes":[{"id":"start","type":"custom","position":{"x":100,"y":200},"data":{"label":"START","type":"START","settings":{}}}],"edges":[]}',
  },
];

const InteractiveAgentManager = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);

  const handleSave = async (agent: Partial<Agent>): Promise<Agent> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let newAgent: Agent;
        if (agent.id) {
          // Update
          setAgents((prev) => prev.map(a => a.id === agent.id ? { ...a, ...agent } as Agent : a));
          newAgent = { ...agents.find(a => a.id === agent.id), ...agent } as Agent;
        } else {
          // Create
          newAgent = { 
            ...agent, 
            id: `agent-${Date.now()}` 
          } as Agent;
          setAgents((prev) => [...prev, newAgent]);
        }
        resolve(newAgent);
      }, 500);
    });
  };

  const handleDelete = async (id: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setAgents((prev) => prev.filter(a => a.id !== id));
        resolve();
      }, 300);
    });
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col">
        <AgentManager 
            agents={agents} 
            onSaveAgent={handleSave} 
            onDeleteAgent={handleDelete} 
            title="Nexus Agents"
            subtitle="Visually design and build your custom AI workflows"
        />
    </div>
  );
};

export const Default: Story = {
  render: () => <InteractiveAgentManager />,
};

export const Empty: Story = {
  args: {
    agents: [],
  },
  render: (args) => (
    <div className="h-screen w-full bg-background flex flex-col">
        <AgentManager {...args} />
    </div>
  )
};
