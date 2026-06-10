import { createAccountRepository } from '../../database/repositories/account.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import { createUserFacingError } from '../../lib/errors';
import type { RepositoryDatabase } from '../../types/database';
import type { Account } from '../../types/domain';
import type { SaveAccountInput } from './types';

export type AccountService = {
  createAccount(input: SaveAccountInput): Promise<Account>;
  deleteAccount(id: string): Promise<void>;
  updateAccount(id: string, input: SaveAccountInput): Promise<Account | null>;
  listAccounts(): Promise<Account[]>;
  listActiveAccounts(): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | null>;
};

export function createAccountService(
  database: RepositoryDatabase
): AccountService {
  const repository = createAccountRepository(database);
  const transactionRepository = createTransactionRepository(database);

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
    async deleteAccount(id) {
      const existingAccount = await repository.getById(id);

      if (!existingAccount) {
        throw createUserFacingError('La cuenta ya no existe o no está disponible.');
      }

      if (existingAccount.active) {
        throw createUserFacingError('Solo puedes eliminar cuentas inactivas.');
      }

      const transactionCount = await transactionRepository.countByAccountId(id);

      if (transactionCount > 0) {
        throw createUserFacingError(
          'No puedes eliminar una cuenta que ya tiene movimientos asociados.'
        );
      }

      const deleted = await repository.delete(id);

      if (!deleted) {
        throw createUserFacingError('La cuenta ya no existe o no está disponible.');
      }
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
    async listAccounts() {
      return repository.listAll();
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
