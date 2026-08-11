import { useState } from 'react';
import {
  Boxes,
  Contrast,
  Copy,
  GitFork,
  LogOut,
  Scissors,
  Settings,
  Sun,
  Trash2,
  UserCog,
} from 'lucide-react';
import {
  AppTitle,
  ContextMenu,
  SettingsPanel,
  ThemeSwitcher,
  UserProfile,
  type IUserProfile,
} from 'nexus-shell';

/* -------------------------------------------------------------------------- */
/* ThemeSwitcher                                                              */
/* -------------------------------------------------------------------------- */

// #region themeSwitcher
export const ThemeSwitcherBasic = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <div className="flex flex-col items-start gap-3">
      {/* Controlled: it renders `value` and applies nothing to the document.
          Use ConnectedThemeSwitcher to bind it to the shell's theme store. */}
      <ThemeSwitcher value={theme} onChange={setTheme} />
      <p className="text-[13px] text-muted-foreground">
        Selected: <code className="font-mono">{theme}</code>
      </p>
    </div>
  );
};
// #endregion

// #region themeSwitcherCustom
export const ThemeSwitcherCustom = () => {
  const [theme, setTheme] = useState('solar');

  return (
    <ThemeSwitcher
      value={theme}
      onChange={setTheme}
      options={[
        { id: 'solar', label: 'Solar' },
        { id: 'mono', label: 'Mono' },
        { id: 'hc', label: 'HC' },
      ]}
    />
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* SettingsPanel                                                              */
/* -------------------------------------------------------------------------- */

// #region settingsPanel
export const SettingsPanelBasic = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <div className="w-[300px] bg-muted rounded-lg overflow-hidden">
      <SettingsPanel theme={theme} onThemeChange={setTheme} />
    </div>
  );
};
// #endregion

// #region settingsPanelCustom
export const SettingsPanelCustom = () => {
  const [theme, setTheme] = useState('daylight');

  return (
    <div className="w-[300px] bg-muted rounded-lg overflow-hidden">
      <SettingsPanel
        theme={theme}
        onThemeChange={setTheme}
        themes={[
          { id: 'daylight', label: 'Daylight', icon: Sun },
          { id: 'contrast', label: 'High Contrast', icon: Contrast },
        ]}
      />
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* AppTitle                                                                   */
/* -------------------------------------------------------------------------- */

// #region appTitle
export const AppTitleBasic = () => (
  <div className="flex flex-col gap-6">
    <AppTitle title="Acme Studio" subtitle="Design System" icon={<Boxes size={16} />} />
    <AppTitle title="Nexus Research" subtitle="Knowledge Modeler" icon={<GitFork size={16} />} />
    {/* Without an icon the badge is omitted; without a subtitle it collapses. */}
    <AppTitle title="No Icon Here" subtitle="Still two lines" />
    <AppTitle title="Title Only" icon={<Boxes size={16} />} />
  </div>
);
// #endregion

/* -------------------------------------------------------------------------- */
/* ContextMenu                                                                */
/* -------------------------------------------------------------------------- */

// #region contextMenu
export const ContextMenuBasic = () => {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [action, setAction] = useState<string | null>(null);

  const items = [
    { label: 'Cut', icon: <Scissors size={14} />, onClick: () => setAction('Cut') },
    { label: 'Copy', icon: <Copy size={14} />, onClick: () => setAction('Copy') },
    { label: 'Paste', onClick: () => setAction('Paste'), disabled: true },
    {
      label: 'Delete',
      icon: <Trash2 size={14} className="text-destructive" />,
      divider: true,
      onClick: () => setAction('Delete'),
    },
  ];

  return (
    <div
      // The component doesn't decide when to appear — you capture the
      // coordinates and mount it conditionally.
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
      className="h-40 grid place-items-center rounded-lg bg-muted/40 text-sm text-muted-foreground select-none"
    >
      {action ? `Chose: ${action}` : 'Right-click anywhere in this box.'}
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} />
      )}
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* UserProfile                                                                */
/* -------------------------------------------------------------------------- */

// #region userProfile
export const UserProfileBasic = () => {
  const [profile, setProfile] = useState<IUserProfile>({
    name: 'Ada Lovelace',
    role: 'Principal Engineer',
    email: 'ada@example.com',
  });

  return (
    <UserProfile
      profile={profile}
      // The component prescribes no menu items of its own — "Sign Out" means
      // something different in every app.
      actions={[
        { id: 'account', label: 'Account Settings', icon: Settings, onSelect: () => {} },
        { id: 'prefs', label: 'Preferences', icon: UserCog, onSelect: () => {} },
        {
          id: 'signout',
          label: 'Sign Out',
          icon: LogOut,
          onSelect: () => {},
          destructive: true,
          divider: true,
        },
      ]}
      onProfileChange={(next) => setProfile((current) => ({ ...current, ...next }))}
    />
  );
};
// #endregion

// #region userProfileCompact
export const UserProfileCompact = () => (
  <UserProfile
    profile={{ name: 'Ada Lovelace', role: 'Principal Engineer' }}
    showName={false}
    actions={[{ id: 'out', label: 'Sign Out', icon: LogOut, onSelect: () => {}, destructive: true }]}
  />
);
// #endregion
