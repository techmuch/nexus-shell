import { create } from 'zustand';

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

const STORAGE_KEY = 'nexus-shell-user-profile';

const DEFAULT_PROFILE = {
  name: 'David Tech',
  role: 'Shell Architect',
  email: 'david@techmuch.io',
  avatarUrl: '',
  customAvatar: '',
};

export const useUserProfileStore = create<UserProfileState>((set) => {
  let initialProfile = { ...DEFAULT_PROFILE };
  
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        initialProfile = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse saved user profile:', e);
    }
  }

  const saveToStorage = (nextState: UserProfileState) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            name: nextState.name,
            role: nextState.role,
            email: nextState.email,
            avatarUrl: nextState.avatarUrl,
            customAvatar: nextState.customAvatar,
          })
        );
      } catch (e) {
        console.error('Failed to save user profile:', e);
      }
    }
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
