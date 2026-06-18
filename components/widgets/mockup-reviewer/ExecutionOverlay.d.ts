import { default as React } from '../../../../node_modules/react';

interface ExecutionOverlayProps {
    isExecuting: boolean;
    setIsExecuting: (val: boolean) => void;
    executionStep: number;
    setExecutionStep: (step: number | ((prev: number) => number)) => void;
}
export declare const ExecutionOverlay: React.FC<ExecutionOverlayProps>;
export {};
