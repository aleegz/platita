import { useEffect, useState } from 'react';

import { useDatabase } from '../../database/client/provider';
import { getUserFacingMessage } from '../../lib/errors';
import {
  profileStoreSelectors,
  useProfileStore,
} from '../../store/profile.store';
import type { UserProfile } from '../../types/domain';

import { createUserProfileService } from './service';
import type { SaveUserProfileInput } from './types';

type UserProfileBootstrapState = {
  profile: UserProfile | null;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

type UserProfileMutations = {
  isSubmitting: boolean;
  errorMessage: string | null;
  isSavingProfile: boolean;
  saveProfileErrorMessage: string | null;
  saveProfile: (input: SaveUserProfileInput) => Promise<UserProfile>;
  isUpdatingAppLock: boolean;
  appLockErrorMessage: string | null;
  setAppLockEnabled: (enabled: boolean) => Promise<UserProfile>;
};

export function useUserProfileBootstrap(): UserProfileBootstrapState {
  const database = useDatabase();
  const profile = useProfileStore(profileStoreSelectors.profile);
  const hydrated = useProfileStore(profileStoreSelectors.hydrated);
  const setProfile = useProfileStore((state) => state.setProfile);
  const markHydrated = useProfileStore((state) => state.markHydrated);
  const [isLoading, setIsLoading] = useState(!hydrated);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextProfile = await createUserProfileService(database).getProfile();

      setProfile(nextProfile);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo cargar tu perfil local.');
    } finally {
      markHydrated();
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hydrated) {
      setIsLoading(false);
      return;
    }

    void refresh();
  }, [database, hydrated]);

  return {
    profile,
    isLoading,
    errorMessage,
    refresh,
  };
}

export function useUserProfile() {
  const profile = useProfileStore(profileStoreSelectors.profile);
  const hydrated = useProfileStore(profileStoreSelectors.hydrated);

  return {
    profile,
    hydrated,
  };
}

export function useUserProfileMutations(): UserProfileMutations {
  const database = useDatabase();
  const setProfile = useProfileStore((state) => state.setProfile);
  const markHydrated = useProfileStore((state) => state.markHydrated);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveProfileErrorMessage, setSaveProfileErrorMessage] = useState<string | null>(null);
  const [isUpdatingAppLock, setIsUpdatingAppLock] = useState(false);
  const [appLockErrorMessage, setAppLockErrorMessage] = useState<string | null>(null);

  async function saveProfile(input: SaveUserProfileInput) {
    setIsSavingProfile(true);
    setSaveProfileErrorMessage(null);

    try {
      const profile = await createUserProfileService(database).saveProfile(input);

      setProfile(profile);
      markHydrated();

      return profile;
    } catch (error) {
      console.error(error);
      setSaveProfileErrorMessage(
        getUserFacingMessage(error, 'No se pudo guardar tu nombre.')
      );
      throw error;
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function setAppLockEnabled(enabled: boolean) {
    setIsUpdatingAppLock(true);
    setAppLockErrorMessage(null);

    try {
      const profile = await createUserProfileService(database).setAppLockEnabled(
        enabled
      );

      setProfile(profile);
      markHydrated();

      return profile;
    } catch (error) {
      console.error(error);
      setAppLockErrorMessage(
        getUserFacingMessage(
          error,
          'No se pudo actualizar el bloqueo de la app.'
        )
      );
      throw error;
    } finally {
      setIsUpdatingAppLock(false);
    }
  }

  return {
    isSubmitting: isSavingProfile || isUpdatingAppLock,
    errorMessage: saveProfileErrorMessage,
    isSavingProfile,
    saveProfileErrorMessage,
    saveProfile,
    isUpdatingAppLock,
    appLockErrorMessage,
    setAppLockEnabled,
  };
}