import { default as React } from '../../../../node_modules/react';

interface WorkflowMapperProps {
    setActiveTab: (tab: 'workflow' | 'review' | 'implementation') => void;
}
export declare const WorkflowMapper: React.FC<WorkflowMapperProps>;
export {};
