import { UserProfile, type UserProfileProps } from '../components/widgets/UserProfile';
import { useUserProfileStore } from '../core/services/UserProfileService';

export type ConnectedUserProfileProps = Omit<
  UserProfileProps,
  'profile' | 'onProfileChange' | 'onAvatarChange'
>;

/**
 * {@link UserProfile} bound to `useUserProfileStore`.
 *
 * Reads the identity from the store, writes inline edits back to it, and reads
 * a picked avatar file as a data URL before storing it.
 *
 * The dropdown's `actions` are deliberately still yours to pass — sign-out and
 * account settings mean different things in every app, so the library declines
 * to guess.
 */
export const ConnectedUserProfile = (props: ConnectedUserProfileProps) => {
  const name = useUserProfileStore((s) => s.name);
  const role = useUserProfileStore((s) => s.role);
  const email = useUserProfileStore((s) => s.email);
  const avatarUrl = useUserProfileStore((s) => s.avatarUrl);
  const customAvatar = useUserProfileStore((s) => s.customAvatar);
  const updateProfile = useUserProfileStore((s) => s.updateProfile);
  const setCustomAvatar = useUserProfileStore((s) => s.setCustomAvatar);

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setCustomAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <UserProfile
      {...props}
      profile={{ name, role, email, avatarUrl: customAvatar || avatarUrl }}
      onProfileChange={updateProfile}
      onAvatarChange={handleAvatarChange}
    />
  );
};
