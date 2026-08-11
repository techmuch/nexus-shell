import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { AppTitle, MenuBar, QuickSearch, ThemeSwitcher } from 'nexus-shell';

const MENUS = {
  File: [
    { id: 'new', label: 'New File', keybinding: '⌘N' },
    { id: 'open', label: 'Open…', keybinding: '⌘O' },
    { id: 'save', label: 'Save', keybinding: '⌘S' },
    {
      id: 'recent',
      label: 'Open Recent',
      submenu: [
        { id: 'r1', label: 'nexus-shell' },
        { id: 'r2', label: 'design-system' },
      ],
    },
  ],
  Edit: [
    { id: 'undo', label: 'Undo', keybinding: '⌘Z' },
    { id: 'redo', label: 'Redo', keybinding: '⇧⌘Z' },
  ],
  View: [
    { id: 'terminal', label: 'Toggle Terminal', keybinding: '⌃`' },
    { id: 'sidebar', label: 'Toggle Sidebar', keybinding: '⌘B' },
  ],
};

// #region basic
export const Basic = () => {
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div>
      <MenuBar menus={MENUS} onSelect={(item) => setChosen(item.label)} />
      <p className="p-4 text-[13px] text-muted-foreground">
        {chosen ? `Selected: ${chosen}` : 'Hover a menu, then pick an item.'}
      </p>
    </div>
  );
};
// #endregion

// #region slots
export const WithSlots = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <MenuBar
      menus={MENUS}
      onSelect={() => {}}
      // Providing `title` switches the bar to its taller, translucent variant.
      title={<AppTitle title="Acme Studio" subtitle="Design System" icon={<Boxes size={16} />} />}
      center={<QuickSearch results={[]} onSelect={() => {}} />}
      right={<ThemeSwitcher value={theme} onChange={setTheme} />}
    />
  );
};
// #endregion
