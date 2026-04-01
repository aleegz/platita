import { createUserProfileRepository } from '../../database/repositories/userProfile.repository';
import { createUserFacingError } from '../../lib/errors';
import type { RepositoryDatabase } from '../../types/database';
import type { UserProfile } from '../../types/domain';

import type { SaveUserProfileInput } from './types';

export type UserProfileService = {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(input: SaveUserProfileInput): Promise<UserProfile>;
};

const USER_PROFILE_ID = 'main';

export function createUserProfileService(
  database: RepositoryDatabase
): UserProfileService {
  const repository = createUserProfileRepository(database);

  return {
    async getProfile() {
      return repository.get();
    },
    async saveProfile(input) {
      const displayName = input.displayName.trim();

      if (displayName.length === 0) {
        throw createUserFacingError('Ingresa tu nombre.');
      }

      const existingProfile = await repository.get();
      const timestamp = createTimestamp();

      return repository.upsert({
        id: existingProfile?.id ?? USER_PROFILE_ID,
        displayName,
        createdAt: existingProfile?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
    },
  };
}

function createTimestamp() {
  return new Date().toISOString();
}
