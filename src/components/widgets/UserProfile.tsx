import React, { useState, useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, LogOut, Settings, Camera, Check, X, Edit2 } from 'lucide-react';
import { useUserProfileStore } from '../../core/services/UserProfileService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UserProfileProps {
  name?: string;
  avatarUrl?: string;
  role?: string;
  email?: string;
  onClick?: () => void;
  className?: string;
  showName?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name: propName,
  avatarUrl: propAvatarUrl,
  role: propRole,
  email: propEmail,
  onClick,
  className,
  showName = true
}) => {
  const store = useUserProfileStore();
  
  // Choose source of truth: prop override or store state
  const name = propName !== undefined ? propName : store.name;
  const role = propRole !== undefined ? propRole : store.role;
  const email = propEmail !== undefined ? propEmail : store.email;
  const customAvatar = store.customAvatar;
  const displayAvatar = customAvatar || (propAvatarUrl !== undefined ? propAvatarUrl : store.avatarUrl);

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editRole, setEditRole] = useState(role);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit state with store when opening menu/resetting
  useEffect(() => {
    if (isOpen) {
      setEditName(name);
      setEditRole(role);
      setIsEditing(false);
    }
  }, [isOpen, name, role]);

  // Click outside listener to close the dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          store.setCustomAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({ name: editName, role: editRole });
    setIsEditing(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        onClick={handleProfileClick}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User Profile Menu"
        className={cn(
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-200 select-none",
          showName 
            ? "flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent/50 hover:text-accent-foreground text-left cursor-pointer border border-transparent hover:border-border/30" 
            : "w-7 h-7 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer",
          isOpen && (showName ? "bg-accent/60 border-border/40" : "border-primary/50 text-foreground ring-1 ring-primary/20"),
          className
        )}
      >
        {/* Avatar Image container */}
        <div className={cn(
          "rounded-full overflow-hidden border border-border/50 bg-muted flex items-center justify-center shrink-0 shadow-sm",
          showName ? "w-6 h-6" : "w-full h-full"
        )}>
          {displayAvatar ? (
            <img src={displayAvatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User size={showName ? 13 : 12} className="text-muted-foreground" />
          )}
        </div>

        {/* Text Details (Badge mode) */}
        {showName && (
          <div className="flex flex-col min-w-0 leading-tight pr-1">
            <span className="text-[11px] font-semibold truncate text-foreground">{name}</span>
            {role && <span className="text-[9px] text-muted-foreground/80 truncate font-medium">{role}</span>}
          </div>
        )}
      </button>

      {/* Hidden file input for uploading images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-64 rounded-lg border border-border/50 bg-card text-card-foreground shadow-lg backdrop-blur-md p-2 flex flex-col gap-1 mt-1.5 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right",
            showName ? "left-0" : "right-0"
          )}
        >
          {isEditing ? (
            /* Editing Profile View */
            <form onSubmit={handleSaveEdit} className="p-2 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Edit Profile</span>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-name" className="text-[9px] font-semibold text-muted-foreground">Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-role" className="text-[9px] font-semibold text-muted-foreground">Role</label>
                <input
                  id="profile-role"
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-1.5 mt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-[10px] rounded hover:bg-accent text-muted-foreground flex items-center gap-1 border border-border/30"
                >
                  <X size={10} /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 text-[10px] rounded bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-1 font-semibold"
                >
                  <Check size={10} /> Save
                </button>
              </div>
            </form>
          ) : (
            /* Standard Profile View */
            <>
              {/* Profile Card Header */}
              <div className="p-2 flex items-center gap-3 border-b border-border/40 pb-2.5 mb-1">
                {/* Avatar with click-to-upload action */}
                <div 
                  onClick={handleAvatarClick}
                  className="group relative w-12 h-12 rounded-full overflow-hidden border border-border/80 bg-muted flex items-center justify-center shrink-0 cursor-pointer shadow-inner"
                  title="Upload avatar image"
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={name} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <User size={24} className="text-muted-foreground group-hover:opacity-40 transition-opacity" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={14} className="text-white" />
                  </div>
                </div>

                <div className="flex flex-col min-w-0 leading-normal flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate text-foreground">{name}</span>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 size={10} />
                    </button>
                  </div>
                  {role && <span className="text-[10px] text-muted-foreground/80 truncate font-semibold">{role}</span>}
                  <span className="text-[9px] text-muted-foreground/60 truncate font-mono mt-0.5">{email}</span>
                </div>
              </div>

              {/* Menu Actions */}
              <button
                onClick={handleAvatarClick}
                className="w-full px-2 py-1.5 hover:bg-accent/60 hover:text-accent-foreground text-left rounded-md text-[11px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Camera size={12} className="opacity-70" />
                Upload Avatar Image
              </button>

              {store.customAvatar && (
                <button
                  onClick={() => store.clearCustomAvatar()}
                  className="w-full px-2 py-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive text-left rounded-md text-[11px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <X size={12} className="opacity-70" />
                  Clear Custom Avatar
                </button>
              )}

              <button
                onClick={() => alert('Settings menu coming soon')}
                className="w-full px-2 py-1.5 hover:bg-accent/60 hover:text-accent-foreground text-left rounded-md text-[11px] font-medium flex items-center gap-2 cursor-pointer transition-colors border-t border-border/20 pt-2 mt-1"
              >
                <Settings size={12} className="opacity-70" />
                Account Settings
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to sign out?')) {
                    store.clearCustomAvatar();
                    store.updateProfile({ name: 'David Tech', role: 'Shell Architect' });
                    setIsOpen(false);
                  }
                }}
                className="w-full px-2 py-1.5 hover:bg-destructive/10 text-destructive hover:text-destructive text-left rounded-md text-[11px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={12} className="opacity-70" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
