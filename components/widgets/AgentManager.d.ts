import { default as React } from '../../../node_modules/react';

export interface Agent {
    id: string;
    name: string;
    description: string;
    schemaJson: string;
}
export interface AgentManagerProps {
    agents?: Agent[];
    onFetchAgents?: () => void;
    onSaveAgent?: (agent: Partial<Agent>) => Promise<Agent | void>;
    onDeleteAgent?: (id: string) => Promise<void>;
    title?: string;
    subtitle?: string;
    className?: string;
}
export declare const AgentManager: React.FC<AgentManagerProps>;
