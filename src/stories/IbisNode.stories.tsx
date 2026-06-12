import type { Meta, StoryObj } from '@storybook/react';
import ReactFlow, { Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { IbisNode } from '../components/widgets/dialogue-mapper/IbisNode';
import { IDialogueNodeData } from '../core/services/DialogueMappingService';

const nodeTypes = {
  ibisNode: IbisNode,
};

const meta: Meta = {
  title: 'DialogueMapper/IbisNode',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// Mock Wrapper to render React Flow nodes correctly
const ReactFlowMockWrapper: React.FC<{ node: Node<IDialogueNodeData> }> = ({ node }) => {
  return (
    <div className="theme-dark bg-background border border-border/80 rounded-xl p-2 h-[220px] w-[280px]">
      <ReactFlow
        nodes={[node]}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
      />
    </div>
  );
};

export const Question: StoryObj = {
  render: () => (
    <ReactFlowMockWrapper
      node={{
        id: 'mock-node-1',
        type: 'ibisNode',
        position: { x: 0, y: 0 },
        data: {
          id: 'mock-node-1',
          type: 'question',
          title: 'Which authorization library is most secure for OAuth2 integration?',
          description: 'Looking for maintained libraries with native JWT support.',
          tags: ['security', 'oauth2'],
          author: 'security-lead',
          timestamp: new Date().toLocaleDateString(),
          status: 'pending',
        },
      }}
    />
  ),
};

export const Idea: StoryObj = {
  render: () => (
    <ReactFlowMockWrapper
      node={{
        id: 'mock-node-2',
        type: 'ibisNode',
        position: { x: 0, y: 0 },
        data: {
          id: 'mock-node-2',
          type: 'idea',
          title: 'Use NextAuth.js (Auth.js) with standard JWT session flow',
          description: 'Supports prebuilt providers and manages cookie encryption automatically.',
          tags: ['nextjs', 'authjs'],
          author: 'engineer-1',
          timestamp: new Date().toLocaleDateString(),
          status: 'pending',
        },
      }}
    />
  ),
};

export const Pro: StoryObj = {
  render: () => (
    <ReactFlowMockWrapper
      node={{
        id: 'mock-node-3',
        type: 'ibisNode',
        position: { x: 0, y: 0 },
        data: {
          id: 'mock-node-3',
          type: 'pro',
          title: 'Supports 40+ social providers out-of-the-box',
          description: 'Saves time setting up Google, GitHub, and Apple login.',
          tags: ['oauth'],
          author: 'engineer-1',
          timestamp: new Date().toLocaleDateString(),
        },
      }}
    />
  ),
};

export const Con: StoryObj = {
  render: () => (
    <ReactFlowMockWrapper
      node={{
        id: 'mock-node-4',
        type: 'ibisNode',
        position: { x: 0, y: 0 },
        data: {
          id: 'mock-node-4',
          type: 'con',
          title: 'Locks the project into React-based frameworks',
          description: 'Difficult to reuse if we build a companion mobile app in React Native.',
          tags: ['mobile-compatibility'],
          author: 'lead-architect',
          timestamp: new Date().toLocaleDateString(),
        },
      }}
    />
  ),
};

export const Note: StoryObj = {
  render: () => (
    <ReactFlowMockWrapper
      node={{
        id: 'mock-node-5',
        type: 'ibisNode',
        position: { x: 0, y: 0 },
        data: {
          id: 'mock-node-5',
          type: 'note',
          title: 'Link to Auth.js docs: authjs.dev',
          description: 'Reference page for manual adapter setups.',
          tags: ['documentation'],
          author: 'engineer-2',
          timestamp: new Date().toLocaleDateString(),
        },
      }}
    />
  ),
};

export const Decision: StoryObj = {
  render: () => (
    <ReactFlowMockWrapper
      node={{
        id: 'mock-node-6',
        type: 'ibisNode',
        position: { x: 0, y: 0 },
        data: {
          id: 'mock-node-6',
          type: 'decision',
          title: 'Implement NextAuth.js with PostgreSQL backend persistence',
          description: 'Formally accepted by design review board on June 12.',
          tags: ['database', 'decision-accepted'],
          author: 'review-board',
          timestamp: new Date().toLocaleDateString(),
          status: 'accepted',
        },
      }}
    />
  ),
};
