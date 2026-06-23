import { default as React } from '../../../node_modules/react';

export interface NexusWorkspaceShellProps {
    disableLocalStorage?: boolean;
    initialLayoutJson?: any;
    onLayoutChange?: (model: any) => void;
}
export declare const NexusWorkspaceShell: React.FC<NexusWorkspaceShellProps>;
export default NexusWorkspaceShell;
