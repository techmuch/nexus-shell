export interface UserProfileState {
    name: string;
    role: string;
    email: string;
    avatarUrl: string;
    customAvatar: string;
    updateProfile: (profile: Partial<Pick<UserProfileState, 'name' | 'role' | 'email' | 'avatarUrl'>>) => void;
    setCustomAvatar: (base64: string) => void;
    clearCustomAvatar: () => void;
}
export declare const useUserProfileStore: import('zustand').UseBoundStore<import('zustand').StoreApi<UserProfileState>>;
