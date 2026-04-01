import { createAccountRepository } from '../../database/repositories/account.repository';
import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import { createUserFacingError } from '../../lib/errors';
import type { RepositoryDatabase } from '../../types/database';
import type {
  Transaction,
  TransactionType,
} from '../../types/domain';
import type {
  SaveTransactionInput,
  TransactionListFilters,
  TransactionReferenceData,
} from './types';

export type TransactionService = {
  createTransaction(input: SaveTransactionInput): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  updateTransaction(
    id: string,
    input: SaveTransactionInput
  ): Promise<Transaction | null>;
  listTransactions(input: TransactionListFilters): Promise<Transaction[]>;
  loadReferenceData(): Promise<TransactionReferenceData>;
};

export function createTransactionService(
  database: RepositoryDatabase
): TransactionService {
  const transactionRepository = createTransactionRepository(database);
  const accountRepository = createAccountRepository(database);
  const categoryRepository = createCategoryRepository(database);

  return {
    async createTransaction(input) {
      if (input.type === 'transfer') {
        if (!input.fromAccountId || !input.toAccountId) {
          throw createUserFacingError(
            'Selecciona una cuenta de origen y otra de destino.'
          );
        }

        if (input.fromAccountId === input.toAccountId) {
          throw createUserFacingError(
            'Origen y destino deben ser cuentas distintas.'
          );
        }

        await Promise.all([
          requireActiveAccount(accountRepository, input.fromAccountId),
          requireActiveAccount(accountRepository, input.toAccountId),
        ]);
      } else {
        if (!input.accountId) {
          throw createUserFacingError('Selecciona una cuenta.');
        }

        if (!input.categoryId) {
          throw createUserFacingError('Selecciona una categoría.');
        }

        await Promise.all([
          requireActiveAccount(accountRepository, input.accountId),
          requireMatchingCategory(categoryRepository, input.categoryId, input.type),
        ]);
      }

      const timestamp = createTimestamp();

      return transactionRepository.create({
        id: createTransactionId(),
        type: input.type,
        amount: input.amount,
        date: input.date,
        accountId: input.accountId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        categoryId: input.categoryId,
        note: input.note,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    },
    async deleteTransaction(id) {
      const deleted = await transactionRepository.delete(id);

      if (!deleted) {
        throw createUserFacingError(
          'El movimiento ya no existe o no se pudo eliminar.'
        );
      }
    },
    async updateTransaction(id, input) {
      if (input.type === 'transfer') {
        if (!input.fromAccountId || !input.toAccountId) {
          throw createUserFacingError(
            'Selecciona una cuenta de origen y otra de destino.'
          );
        }

        if (input.fromAccountId === input.toAccountId) {
          throw createUserFacingError(
            'Origen y destino deben ser cuentas distintas.'
          );
        }

        await Promise.all([
          requireActiveAccount(accountRepository, input.fromAccountId),
          requireActiveAccount(accountRepository, input.toAccountId),
        ]);
      } else {
        if (!input.accountId) {
          throw createUserFacingError('Selecciona una cuenta.');
        }

        if (!input.categoryId) {
          throw createUserFacingError('Selecciona una categoría.');
        }

        await Promise.all([
          requireActiveAccount(accountRepository, input.accountId),
          requireMatchingCategory(categoryRepository, input.categoryId, input.type),
        ]);
      }

      return transactionRepository.update(id, {
        type: input.type,
        amount: input.amount,
        date: input.date,
        accountId: input.accountId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        categoryId: input.categoryId,
        note: input.note,
        updatedAt: createTimestamp(),
      });
    },
    async listTransactions(input) {
      return transactionRepository.listWithFilters({
        month: input.month,
        year: input.year,
        type: input.type ?? undefined,
        accountId: input.accountId ?? undefined,
        categoryId: input.categoryId ?? undefined,
      });
    },
    async loadReferenceData() {
      const [accounts, categories] = await Promise.all([
        accountRepository.listActive(),
        categoryRepository.listActive(),
      ]);

      return {
        accounts,
        categories,
      };
    },
  };
}

async function requireActiveAccount(
  repository: ReturnType<typeof createAccountRepository>,
  accountId: string
) {
  const account = await repository.getById(accountId);

  if (!account || !account.active) {
    throw createUserFacingError('La cuenta seleccionada ya no está disponible.');
  }

  return account;
}

async function requireMatchingCategory(
  repository: ReturnType<typeof createCategoryRepository>,
  categoryId: string,
  type: Exclude<TransactionType, 'transfer'>
) {
  const category = await repository.getById(categoryId);

  if (!category || !category.active) {
    throw createUserFacingError(
      'La categoría seleccionada ya no está disponible.'
    );
  }

  if (category.type !== type) {
    throw createUserFacingError(
      'La categoría elegida no coincide con el tipo de movimiento.'
    );
  }

  return category;
}

function createTimestamp() {
  return new Date().toISOString();
}

function createTransactionId() {
  return `transaction_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
