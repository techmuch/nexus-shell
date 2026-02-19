import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UserProfileProps {
  name: string;
  avatarUrl?: string;
  role?: string;
  onClick?: () => void;
  className?: string;
  showName?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  avatarUrl,
  role,
  onClick,
  className,
  showName = true
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors select-none",
        className
      )}
    >
      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border/50 bg-muted flex items-center justify-center shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User size={14} className="text-muted-foreground" />
        )}
      </div>
      
      {showName && (
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[11px] font-semibold truncate">{name}</span>
          {role && <span className="text-[9px] text-muted-foreground truncate">{role}</span>}
        </div>
      )}
    </div>
  );
};
