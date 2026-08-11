import { useState } from 'react';
import { Bug, Files, GitBranch, MessageSquare, Package, Search, Settings } from 'lucide-react';
import { ActivityBar, SidebarPane } from 'nexus-shell';

const PANELS = [
  { id: 'files', label: 'Explorer', icon: Files },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'scm', label: 'Source Control', icon: GitBranch },
  { id: 'debug', label: 'Run and Debug', icon: Bug },
  { id: 'ext', label: 'Extensions', icon: Package },
];

// #region basic
export const Basic = () => {
  const [active, setActive] = useState<string | null>('files');

  return (
    <ActivityBar
      items={PANELS}
      activeId={active}
      // Clicking the active item again closes the sidebar. The component
      // reports the click; the toggle policy is yours.
      onSelect={(id) => setActive(id === active ? null : id)}
    />
  );
};
// #endregion

// #region withSidebar
export const WithSidebar = () => {
  const [active, setActive] = useState<string | null>('files');
  const panel = PANELS.find((p) => p.id === active);

  return (
    <div className="flex h-full">
      <ActivityBar
        items={PANELS}
        activeId={active}
        onSelect={(id) => setActive(id === active ? null : id)}
      />

      {panel && (
        <SidebarPane title={panel.label} onClose={() => setActive(null)}>
          <p className="p-4 text-sm text-muted-foreground">
            Content for the {panel.label} panel.
          </p>
        </SidebarPane>
      )}

      <main className="flex-1 grid place-items-center text-sm text-muted-foreground">
        Your editor goes here
      </main>
    </div>
  );
};
// #endregion

// #region bottomItems
export const BottomItems = () => {
  const [active, setActive] = useState<string | null>('search');

  return (
    <ActivityBar
      items={PANELS.slice(0, 3)}
      activeId={active}
      onSelect={setActive}
      // Replaces the default single Settings item. Pass [] for no bottom group.
      bottomItems={[
        { id: 'chat', label: 'Assistant', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]}
    />
  );
};
// #endregion
