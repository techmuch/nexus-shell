import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Camera, Check, Edit2, User, X } from 'lucide-react';
import { cn } from '../../lib/cn';

/** The identity rendered by {@link UserProfile}. */
export interface IUserProfile {
  /** Display name. Shown on the trigger and in the dropdown header. */
  name: string;
  /** Secondary line, e.g. job title. Omit to hide it. */
  role?: string;
  /** Shown in the dropdown header only. */
  email?: string;
  /** Image URL or data URL. Falls back to a generic user icon. */
  avatarUrl?: string;
}

/** An action in the profile dropdown. */
export interface IUserProfileAction {
  /** Stable identifier. Used as the React key. */
  id: string;
  /** Label shown for the action. */
  label: string;
  /** `lucide-react` icon rendered at 12px. */
  icon?: LucideIcon;
  /** Runs on click. The dropdown closes afterwards. */
  onSelect: () => void;
  /** Render in the destructive colour, for sign-out and similar. */
  destructive?: boolean;
  /** Draw a separator above this action. */
  divider?: boolean;
}

export interface UserProfileProps {
  /** The identity to display. */
  profile: IUserProfile;
  /**
   * Actions listed in the dropdown. Empty by default — the component prescribes
   * no menu, since "Sign Out" and "Account Settings" mean different things in
   * every app.
   */
  actions?: IUserProfileAction[];
  /**
   * Called with the new name and role when the inline editor is saved.
   * Omit it to hide the edit affordance entirely.
   */
  onProfileChange?: (profile: Pick<IUserProfile, 'name' | 'role'>) => void;
  /**
   * Called with a file the user picked for their avatar. Read it and update
   * `profile.avatarUrl` yourself — the component neither reads files nor holds
   * the result. Omit it to hide the upload affordance.
   */
  onAvatarChange?: (file: File) => void;
  /**
   * Bypass the dropdown entirely and just report the click. Useful when the
   * profile should open a full settings tab instead of a menu.
   */
  onClick?: () => void;
  /** Show the name and role beside the avatar. Defaults to `true`. */
  showName?: boolean;
  /** Extra classes merged onto the trigger button. */
  className?: string;
}

/**
 * An avatar and identity widget with a dropdown menu, sized for a menu bar's
 * right slot.
 *
 * Fully controlled — it owns only its open/editing UI state. The identity comes
 * in as `profile`, edits go out through `onProfileChange`, and the menu is
 * whatever you pass as `actions`. It reads no store and prescribes no menu
 * items, so it works the same against a session hook, an auth provider, or
 * static props.
 *
 * @example
 * ```tsx
 * <UserProfile
 *   profile={{ name: 'Ada Lovelace', role: 'Engineer', email: 'ada@example.com' }}
 *   onProfileChange={(next) => save(next)}
 *   actions={[
 *     { id: 'settings', label: 'Account Settings', icon: Settings, onSelect: openSettings },
 *     { id: 'out', label: 'Sign Out', icon: LogOut, onSelect: signOut, destructive: true, divider: true },
 *   ]}
 * />
 * ```
 */
export const UserProfile = ({
  profile,
  actions = [],
  onProfileChange,
  onAvatarChange,
  onClick,
  showName = true,
  className,
}: UserProfileProps) => {
  const { name, role, email, avatarUrl } = profile;

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editRole, setEditRole] = useState(role ?? '');

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEditName(name);
    setEditRole(role ?? '');
    setIsEditing(false);
  }, [isOpen, name, role]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileChange?.({ name: editName, role: editRole });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarChange?.(file);
    e.target.value = '';
  };

  const avatar = (size: number) =>
    avatarUrl ? (
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
    ) : (
      <User size={size} className="text-muted-foreground" />
    );

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => (onClick ? onClick() : setIsOpen((o) => !o))}
        aria-haspopup={onClick ? undefined : 'menu'}
        aria-expanded={onClick ? undefined : isOpen}
        aria-label="User Profile Menu"
        className={cn(
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-200 select-none',
          showName
            ? 'flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent/50 hover:text-accent-foreground text-left cursor-pointer border border-transparent hover:border-border/30'
            : 'w-7 h-7 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer',
          isOpen &&
            (showName
              ? 'bg-accent/60 border-border/40'
              : 'border-primary/50 text-foreground ring-1 ring-primary/20'),
          className,
        )}
      >
        <div
          className={cn(
            'rounded-full overflow-hidden border border-border/50 bg-muted flex items-center justify-center shrink-0 shadow-sm',
            showName ? 'w-6 h-6' : 'w-full h-full',
          )}
        >
          {avatar(showName ? 13 : 12)}
        </div>

        {showName && (
          <div className="flex flex-col min-w-0 leading-tight pr-1">
            <span className="text-[11px] font-semibold truncate text-foreground">
              {name}
            </span>
            {role && (
              <span className="text-[9px] text-muted-foreground/80 truncate font-medium">
                {role}
              </span>
            )}
          </div>
        )}
      </button>

      {onAvatarChange && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          aria-label="Upload avatar"
          className="hidden"
        />
      )}

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 w-64 rounded-lg border border-border/50 bg-card text-card-foreground shadow-lg backdrop-blur-md p-2 flex flex-col gap-1 mt-1.5 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right',
            showName ? 'left-0' : 'right-0',
          )}
        >
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="p-2 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Edit Profile
              </span>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-name" className="text-[9px] font-semibold text-muted-foreground">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-2 py-1 text-xs border rounded bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-role" className="text-[9px] font-semibold text-muted-foreground">
                  Role
                </label>
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
            <>
              <div className="p-2 flex items-center gap-3 border-b border-border/40 pb-2.5 mb-1">
                <div
                  onClick={() => onAvatarChange && fileInputRef.current?.click()}
                  title={onAvatarChange ? 'Upload avatar image' : undefined}
                  className={cn(
                    'group relative w-12 h-12 rounded-full overflow-hidden border border-border/80 bg-muted flex items-center justify-center shrink-0 shadow-inner',
                    onAvatarChange && 'cursor-pointer',
                  )}
                >
                  {avatar(24)}
                  {onAvatarChange && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera size={14} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 leading-normal flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate text-foreground">{name}</span>
                    {onProfileChange && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        title="Edit Profile"
                        aria-label="Edit Profile"
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded transition-colors"
                      >
                        <Edit2 size={10} />
                      </button>
                    )}
                  </div>
                  {role && (
                    <span className="text-[10px] text-muted-foreground/80 truncate font-semibold">
                      {role}
                    </span>
                  )}
                  {email && (
                    <span className="text-[9px] text-muted-foreground/60 truncate font-mono mt-0.5">
                      {email}
                    </span>
                  )}
                </div>
              </div>

              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      action.onSelect();
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full px-2 py-1.5 text-left rounded-md text-[11px] font-medium flex items-center gap-2 cursor-pointer transition-colors',
                      action.destructive
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'hover:bg-accent/60 hover:text-accent-foreground',
                      action.divider && 'border-t border-border/20 pt-2 mt-1',
                    )}
                  >
                    {Icon && <Icon size={12} className="opacity-70" />}
                    {action.label}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};
