import { create } from 'zustand';
import { readStoredJson, writeStored, STORAGE_KEYS } from '../../lib/storage';

export interface UserProfileState {
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  customAvatar: string; // Base64 data URL
  updateProfile: (profile: Partial<Pick<UserProfileState, 'name' | 'role' | 'email' | 'avatarUrl'>>) => void;
  setCustomAvatar: (base64: string) => void;
  clearCustomAvatar: () => void;
}

const STORAGE_KEY = STORAGE_KEYS.userProfile;

/**
 * Deliberately anonymous. This is what `ConnectedUserProfile` shows before the
 * application says who is signed in, so it must not look like anybody real.
 */
export const DEFAULT_USER_PROFILE = {
  name: 'Guest',
  role: '',
  email: '',
  avatarUrl: '',
  customAvatar: '',
};

export const useUserProfileStore = create<UserProfileState>((set) => {
  const saved = readStoredJson<Partial<typeof DEFAULT_USER_PROFILE>>(STORAGE_KEY);
  const initialProfile = { ...DEFAULT_USER_PROFILE, ...(saved ?? {}) };

  const saveToStorage = (nextState: UserProfileState) => {
    writeStored(
      STORAGE_KEY,
      JSON.stringify({
        name: nextState.name,
        role: nextState.role,
        email: nextState.email,
        avatarUrl: nextState.avatarUrl,
        customAvatar: nextState.customAvatar,
      }),
    );
  };

  return {
    ...initialProfile,
    updateProfile: (updated) =>
      set((state) => {
        const nextState = { ...state, ...updated };
        saveToStorage(nextState);
        return updated;
      }),
    setCustomAvatar: (base64) =>
      set((state) => {
        const nextState = { ...state, customAvatar: base64 };
        saveToStorage(nextState);
        return { customAvatar: base64 };
      }),
    clearCustomAvatar: () =>
      set((state) => {
        const nextState = { ...state, customAvatar: '' };
        saveToStorage(nextState);
        return { customAvatar: '' };
      }),
  };
});
