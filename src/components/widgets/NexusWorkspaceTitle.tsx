import React from 'react';
import { GitFork } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NexusWorkspaceTitleProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const NexusWorkspaceTitle: React.FC<NexusWorkspaceTitleProps> = ({
  title = "NEXUS Research Workspace",
  subtitle = "Autonomous Multi-Agent Orchestration",
  icon = <GitFork size={16} />,
  className,
}) => {
  return (
    <div className={cn("flex items-center space-x-3 select-none", className)}>
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner shrink-0">
        {icon}
      </div>
      <div>
        <h1 className="text-xs font-black uppercase tracking-wider text-foreground font-mono">
          {title}
        </h1>
        <p className="text-[9px] text-muted-foreground font-semibold">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default NexusWorkspaceTitle;
