import type { UpsertUserProfileDTO } from '../../types/dto';
import type {
  RepositoryDatabase,
  UserProfileRow,
} from '../../types/database';
import { mapUserProfileRow } from '../../types/database';
import type { UserProfile } from '../../types/domain';

const userProfileSelectStatement = `
  SELECT id, display_name, created_at, updated_at
  FROM user_profile
`;

export type UserProfileRepository = {
  get(): Promise<UserProfile | null>;
  upsert(input: UpsertUserProfileDTO): Promise<UserProfile>;
};

export function createUserProfileRepository(
  database: RepositoryDatabase
): UserProfileRepository {
  async function get() {
    const row = await database.getFirstAsync<UserProfileRow>(
      `${userProfileSelectStatement} LIMIT 1`
    );

    return row ? mapUserProfileRow(row) : null;
  }

  async function upsert(input: UpsertUserProfileDTO) {
    await database.runAsync(
      `
        INSERT INTO user_profile (
          id,
          display_name,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          display_name = excluded.display_name,
          updated_at = excluded.updated_at
      `,
      [
        input.id,
        input.displayName,
        input.createdAt,
        input.updatedAt,
      ]
    );

    const profile = await get();

    if (!profile) {
      throw new Error('Failed to load user profile after upsert.');
    }

    return profile;
  }

  return {
    get,
    upsert,
  };
}
