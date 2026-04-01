import { createAccountRepository } from '../../database/repositories/account.repository';
import type { RepositoryDatabase } from '../../types/database';
import type { Account } from '../../types/domain';
import type { SaveAccountInput } from './types';

export type AccountService = {
  createAccount(input: SaveAccountInput): Promise<Account>;
  updateAccount(id: string, input: SaveAccountInput): Promise<Account | null>;
  listActiveAccounts(): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | null>;
};

export function createAccountService(
  database: RepositoryDatabase
): AccountService {
  const repository = createAccountRepository(database);

  return {
    async createAccount(input) {
      const timestamp = createTimestamp();

      return repository.create({
        id: createAccountId(),
        name: input.name,
        type: input.type,
        initialBalance: input.initialBalance,
        active: input.active,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    },
    async updateAccount(id, input) {
      return repository.update(id, {
        name: input.name,
        type: input.type,
        initialBalance: input.initialBalance,
        active: input.active,
        updatedAt: createTimestamp(),
      });
    },
    async listActiveAccounts() {
      return repository.listActive();
    },
    async getAccountById(id) {
      return repository.getById(id);
    },
  };
}

function createTimestamp() {
  return new Date().toISOString();
}

function createAccountId() {
  return `account_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
