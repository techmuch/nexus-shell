import type { Meta, StoryObj } from '@storybook/react';
import { MenuBar } from '../components/widgets/MenuBar';
import { initializeShell } from '../core/Boot';
import { commandRegistry } from '../core/registry/CommandRegistry';
import { useFileStore } from '../core/services/FileStoreService';
import { useEffect } from 'react';
import { create } from 'zustand';

const meta: Meta<typeof MenuBar> = {
  title: 'Widgets/Shell/MenuBarSearch',
  component: MenuBar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MenuBar>;

export const InteractiveSearchDemo: Story = {
  render: () => {
    useEffect(() => {
      // 1. Initialize core
      initializeShell();

      // 2. Prepopulate commands in registry
      commandRegistry.registerCommand({
        id: 'story.clear-cache',
        label: 'Clear Application Cache',
        keybinding: 'Control+Alt+C',
        execute: () => alert('Cache cleared!'),
      });
      commandRegistry.registerCommand({
        id: 'story.export-pdf',
        label: 'Export Current Map to PDF',
        keybinding: 'Control+Shift+E',
        execute: () => alert('Exporting to PDF...'),
      });

      // 3. Seed useFileStore with mock files
      useFileStore.setState({
        nodes: [
          {
            id: 'proj-1',
            label: 'Nexus Project Alpha',
            type: 'folder',
            isOpen: true,
            children: [
              { id: 'file-1', label: 'system_design.map', type: 'file' },
              { id: 'file-2', label: 'requirements.txt', type: 'file' },
              { id: 'file-3', label: 'architecture_diagram.png', type: 'file' },
            ]
          },
          {
            id: 'proj-2',
            label: 'Shared Resources',
            type: 'folder',
            isOpen: true,
            children: [
              { id: 'file-4', label: 'reference_guide.pdf', type: 'file' },
              { id: 'file-5', label: 'meeting_notes.map', type: 'file' },
            ]
          }
        ]
      });

      // 4. Mock the window.useDialogueMappingStore to simulate active dialogue map nodes
      const mockStore = create(() => ({
        nodes: [
          {
            id: 'node-q1',
            position: { x: 100, y: 100 },
            data: {
              id: 'node-q1',
              type: 'question',
              title: 'How should we handle auth?',
              description: 'We need to decide between OAuth2 and Passkeys.',
              timestamp: '2026-06-23 08:00',
            }
          },
          {
            id: 'node-i1',
            position: { x: 300, y: 100 },
            data: {
              id: 'node-i1',
              type: 'idea',
              title: 'Adopt Passkeys natively',
              description: 'Allows secure passwordless authentication.',
              timestamp: '2026-06-23 08:05',
            }
          },
          {
            id: 'node-pro1',
            position: { x: 500, y: 100 },
            data: {
              id: 'node-pro1',
              type: 'pro',
              title: 'Excellent UX and high security',
              description: 'Zero passwords, simple biometric access.',
              timestamp: '2026-06-23 08:10',
            }
          },
          {
            id: 'node-con1',
            position: { x: 500, y: 250 },
            data: {
              id: 'node-con1',
              type: 'con',
              title: 'Requires modern browser support',
              description: 'May not be available on older machines.',
              timestamp: '2026-06-23 08:12',
            }
          }
        ],
        setSelectedNodeId: (id: string | null) => {
          alert(`Selected active dialogue node: ${id}`);
        }
      }));

      // Set it on window
      (window as any).useDialogueMappingStore = mockStore;

      // Mock reactFlowInstance
      (window as any).reactFlowInstance = {
        setCenter: (x: number, y: number, options: any) => {
          alert(`Panning ReactFlow viewport to center: x=${x}, y=${y} (zoom=${options.zoom})`);
        }
      };

      return () => {
        delete (window as any).useDialogueMappingStore;
        delete (window as any).reactFlowInstance;
      };
    }, []);

    return (
      <div className="theme-dark bg-background text-foreground h-screen p-4">
        <div className="border border-border rounded-lg overflow-hidden shadow-2xl">
          <MenuBar />
        </div>
        
        <div className="mt-8 max-w-xl mx-auto p-6 bg-card border rounded-lg shadow text-sm space-y-4">
          <h2 className="font-semibold text-lg text-primary">Interactive Search Demo Instructions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Click on the <strong>Search...</strong> input inside the menubar above and try searching for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs font-mono">
            <li><strong>"auth"</strong> or <strong>"passkeys"</strong> to find active dialogue nodes on the canvas.</li>
            <li><strong>"map"</strong> or <strong>"notes"</strong> to find files from the workspace explorer.</li>
            <li><strong>"clear"</strong> or <strong>"pdf"</strong> to find executable registry commands.</li>
          </ul>
          <p className="text-[11px] text-muted-foreground/80 italic">
            Tip: Use <kbd className="bg-muted px-1 border rounded">↑</kbd> <kbd className="bg-muted px-1 border rounded">↓</kbd> arrow keys to navigate and <kbd className="bg-muted px-1 border rounded">Enter</kbd> to select.
          </p>
        </div>
      </div>
    );
  }
};
