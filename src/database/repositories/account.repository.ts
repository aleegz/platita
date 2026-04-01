import type { RepositoryDatabase, AccountRow } from '../../types/database';
import {
  mapAccountRow,
  toDatabaseBoolean,
} from '../../types/database';
import type { Account } from '../../types/domain';
import type { CreateAccountDTO, UpdateAccountDTO } from '../../types/dto';

const accountSelectStatement = `
  SELECT id, name, type, initial_balance, active, created_at, updated_at
  FROM accounts
`;

export type AccountRepository = {
  create(input: CreateAccountDTO): Promise<Account>;
  update(id: string, input: UpdateAccountDTO): Promise<Account | null>;
  listActive(): Promise<Account[]>;
  getById(id: string): Promise<Account | null>;
};

export function createAccountRepository(
  database: RepositoryDatabase
): AccountRepository {
  async function getById(id: string) {
    const row = await database.getFirstAsync<AccountRow>(
      `${accountSelectStatement} WHERE id = ?`,
      [id]
    );

    return row ? mapAccountRow(row) : null;
  }

  async function create(input: CreateAccountDTO) {
    await database.runAsync(
      `
        INSERT INTO accounts (
          id,
          name,
          type,
          initial_balance,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.id,
        input.name,
        input.type,
        input.initialBalance,
        toDatabaseBoolean(input.active),
        input.createdAt,
        input.updatedAt,
      ]
    );

    const account = await getById(input.id);

    if (!account) {
      throw new Error(`Failed to load account ${input.id} after insert.`);
    }

    return account;
  }

  async function update(id: string, input: UpdateAccountDTO) {
    const assignments: string[] = [];
    const parameters: Array<string | number> = [];

    if (input.name !== undefined) {
      assignments.push('name = ?');
      parameters.push(input.name);
    }

    if (input.type !== undefined) {
      assignments.push('type = ?');
      parameters.push(input.type);
    }

    if (input.initialBalance !== undefined) {
      assignments.push('initial_balance = ?');
      parameters.push(input.initialBalance);
    }

    if (input.active !== undefined) {
      assignments.push('active = ?');
      parameters.push(toDatabaseBoolean(input.active));
    }

    assignments.push('updated_at = ?');
    parameters.push(input.updatedAt);
    parameters.push(id);

    const result = await database.runAsync(
      `UPDATE accounts SET ${assignments.join(', ')} WHERE id = ?`,
      parameters
    );

    if (result.changes === 0) {
      return null;
    }

    return getById(id);
  }

  async function listActive() {
    const rows = await database.getAllAsync<AccountRow>(
      `${accountSelectStatement} WHERE active = 1 ORDER BY name ASC`
    );

    return rows.map(mapAccountRow);
  }

  return {
    create,
    update,
    listActive,
    getById,
  };
}
