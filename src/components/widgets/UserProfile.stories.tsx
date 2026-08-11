import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LogOut, Settings, UserCog } from 'lucide-react';
import { UserProfile, type IUserProfile } from './UserProfile';

const PROFILE: IUserProfile = {
  name: 'Ada Lovelace',
  role: 'Principal Engineer',
  email: 'ada@example.com',
};

const ACTIONS = [
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
];

const meta = {
  title: 'Primitives/UserProfile',
  component: UserProfile,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An avatar and identity widget with a dropdown menu, sized for a menu bar\'s right slot.\n\nFully controlled — the identity comes in as `profile`, edits go out through `onProfileChange`, and the menu is whatever you pass as `actions`. It prescribes no menu items of its own: "Sign Out" and "Account Settings" mean different things in every app. See `ConnectedUserProfile` for the variant bound to `useUserProfileStore`.\n\nClick the widget to open the dropdown.',
      },
    },
  },
} satisfies Meta<typeof UserProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Name and role beside the avatar. Click to open the menu. */
export const Default: Story = {
  args: { profile: PROFILE, actions: ACTIONS },
};

/** Compact mode: avatar only, for a tight menu bar. */
export const AvatarOnly: Story = {
  args: { profile: PROFILE, actions: ACTIONS, showName: false },
};

/** With an image avatar. */
export const WithImage: Story = {
  args: {
    profile: {
      ...PROFILE,
      avatarUrl:
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%236366f1"/><text x="32" y="42" font-size="28" font-family="sans-serif" fill="white" text-anchor="middle">AL</text></svg>`,
        ),
    },
    actions: ACTIONS,
  },
};

/** No `actions`, no `onProfileChange`: a read-only identity card. */
export const ReadOnly: Story = {
  args: { profile: PROFILE },
};

/** Omitting `role` and `email` collapses the widget to just a name. */
export const NameOnly: Story = {
  args: { profile: { name: 'Ada Lovelace' }, actions: ACTIONS },
};

/** `onClick` bypasses the dropdown entirely — use it to open a settings tab. */
export const AsButton: Story = {
  args: { profile: PROFILE, onClick: () => {} },
};

/** Edit the name and role inline; the parent owns the result. */
export const Editable: Story = {
  args: { profile: PROFILE },
  render: function Render() {
    const [profile, setProfile] = useState<IUserProfile>(PROFILE);
    return (
      <div className="flex flex-col items-center gap-3">
        <UserProfile
          profile={profile}
          actions={ACTIONS}
          onProfileChange={(next) => setProfile((p) => ({ ...p, ...next }))}
        />
        <p className="text-xs text-muted-foreground">
          {profile.name} — {profile.role || 'no role'}
        </p>
      </div>
    );
  },
};
