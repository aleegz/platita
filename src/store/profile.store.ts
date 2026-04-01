import { create } from 'zustand';

import type { UserProfile } from '../types/domain';

export type ProfileStoreState = {
  profile: UserProfile | null;
  hydrated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  markHydrated: () => void;
  reset: () => void;
};

export const useProfileStore = create<ProfileStoreState>((set) => ({
  profile: null,
  hydrated: false,
  setProfile: (profile) => set({ profile }),
  markHydrated: () => set({ hydrated: true }),
  reset: () =>
    set({
      profile: null,
      hydrated: false,
    }),
}));

export const profileStoreSelectors = {
  profile: (state: ProfileStoreState) => state.profile,
  hydrated: (state: ProfileStoreState) => state.hydrated,
  displayName: (state: ProfileStoreState) => state.profile?.displayName ?? null,
} as const;
