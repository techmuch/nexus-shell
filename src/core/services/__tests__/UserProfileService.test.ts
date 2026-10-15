import { describe, expect, it } from 'vitest';
import { DEFAULT_USER_PROFILE, useUserProfileStore } from '../UserProfileService';

describe('UserProfileService', () => {
  it('starts anonymous, so no consumer shows a real person before sign-in', () => {
    expect(DEFAULT_USER_PROFILE).toEqual({ name: 'Guest', role: '', email: '', avatarUrl: '', customAvatar: '' });
    expect(useUserProfileStore.getState().email).toBe('');
  });

  it('persists only what the app or user sets', () => {
    localStorage.clear();
    useUserProfileStore.getState().updateProfile({ name: 'Ada' });
    expect(JSON.parse(localStorage.getItem('nexus-shell-user-profile')!).name).toBe('Ada');
  });
});
