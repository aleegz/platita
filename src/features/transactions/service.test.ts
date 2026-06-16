import { createAccountRepository } from '../../database/repositories/account.repository';
import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import { yieldSystemCategoryId } from '../categories/types';
import type { Account, Category, Transaction } from '../../types/domain';
import type { RepositoryDatabase } from '../../types/database';

import { createTransactionService } from './service';
import type { SaveTransactionInput } from './types';

jest.mock('../../database/repositories/account.repository', () => ({
  createAccountRepository: jest.fn(),
}));

jest.mock('../../database/repositories/category.repository', () => ({
  createCategoryRepository: jest.fn(),
}));

jest.mock('../../database/repositories/transaction.repository', () => ({
  createTransactionRepository: jest.fn(),
}));

const mockedCreateAccountRepository = jest.mocked(createAccountRepository);
const mockedCreateCategoryRepository = jest.mocked(createCategoryRepository);
const mockedCreateTransactionRepository = jest.mocked(createTransactionRepository);

function createAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'account_1',
    name: 'Cuenta',
    type: 'cash',
    initialBalance: 0,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'category_1',
    name: 'Categoria',
    type: 'expense',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'transaction_1',
    type: 'expense',
    amount: 1000,
    date: '2026-06-16',
    accountId: 'account_1',
    fromAccountId: null,
    toAccountId: null,
    categoryId: 'category_1',
    note: null,
    createdAt: '2026-06-16T00:00:00.000Z',
    updatedAt: '2026-06-16T00:00:00.000Z',
    ...overrides,
  };
}

function createInput(overrides: Partial<SaveTransactionInput> = {}): SaveTransactionInput {
  return {
    type: 'expense',
    amount: 1500,
    date: '2026-06-16',
    accountId: 'account_1',
    fromAccountId: null,
    toAccountId: null,
    categoryId: 'category_1',
    note: 'nota',
    ...overrides,
  };
}

describe('createTransactionService', () => {
  const database = {} as RepositoryDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects transfers between the same account', async () => {
    const accountRepository = {
      getById: jest.fn(),
      listActive: jest.fn(),
    };
    const categoryRepository = {
      getById: jest.fn(),
      listAll: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      listWithFilters: jest.fn(),
    };

    mockedCreateAccountRepository.mockReturnValue(accountRepository as never);
    mockedCreateCategoryRepository.mockReturnValue(categoryRepository as never);
    mockedCreateTransactionRepository.mockReturnValue(transactionRepository as never);

    await expect(
      createTransactionService(database).createTransaction(
        createInput({
          type: 'transfer',
          accountId: null,
          categoryId: null,
          fromAccountId: 'account_1',
          toAccountId: 'account_1',
        })
      )
    ).rejects.toMatchObject({
      name: 'UserFacingError',
      userMessage: 'Origen y destino deben ser cuentas distintas.',
    });

    expect(accountRepository.getById).not.toHaveBeenCalled();
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('rejects transactions when the selected account is inactive', async () => {
    const accountRepository = {
      getById: jest.fn().mockResolvedValue(createAccount({ active: false })),
      listActive: jest.fn(),
    };
    const categoryRepository = {
      getById: jest.fn().mockResolvedValue(createCategory()),
      listAll: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      listWithFilters: jest.fn(),
    };

    mockedCreateAccountRepository.mockReturnValue(accountRepository as never);
    mockedCreateCategoryRepository.mockReturnValue(categoryRepository as never);
    mockedCreateTransactionRepository.mockReturnValue(transactionRepository as never);

    await expect(
      createTransactionService(database).createTransaction(createInput())
    ).rejects.toMatchObject({
      name: 'UserFacingError',
      userMessage: 'La cuenta seleccionada ya no está disponible.',
    });
  });

  it('rejects categories whose type does not match the transaction type', async () => {
    const accountRepository = {
      getById: jest.fn().mockResolvedValue(createAccount()),
      listActive: jest.fn(),
    };
    const categoryRepository = {
      getById: jest.fn().mockResolvedValue(createCategory({ type: 'income' })),
      listAll: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      listWithFilters: jest.fn(),
    };

    mockedCreateAccountRepository.mockReturnValue(accountRepository as never);
    mockedCreateCategoryRepository.mockReturnValue(categoryRepository as never);
    mockedCreateTransactionRepository.mockReturnValue(transactionRepository as never);

    await expect(
      createTransactionService(database).createTransaction(createInput())
    ).rejects.toMatchObject({
      name: 'UserFacingError',
      userMessage: 'La categoría elegida no coincide con el tipo de movimiento.',
    });
  });

  it('uses the system yield category when creating yield transactions', async () => {
    const createdTransaction = createTransaction({
      id: 'transaction_yield',
      type: 'yield',
      accountId: 'account_1',
      categoryId: yieldSystemCategoryId,
    });
    const accountRepository = {
      getById: jest.fn().mockResolvedValue(createAccount()),
      listActive: jest.fn(),
    };
    const categoryRepository = {
      getById: jest.fn().mockResolvedValue(
        createCategory({ id: yieldSystemCategoryId, type: 'yield' })
      ),
      listAll: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn().mockResolvedValue(createdTransaction),
      delete: jest.fn(),
      update: jest.fn(),
      listWithFilters: jest.fn(),
    };

    mockedCreateAccountRepository.mockReturnValue(accountRepository as never);
    mockedCreateCategoryRepository.mockReturnValue(categoryRepository as never);
    mockedCreateTransactionRepository.mockReturnValue(transactionRepository as never);

    const result = await createTransactionService(database).createTransaction(
      createInput({ type: 'yield', categoryId: null })
    );

    expect(categoryRepository.getById).toHaveBeenCalledWith(yieldSystemCategoryId);
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'yield',
        categoryId: yieldSystemCategoryId,
      })
    );
    expect(result).toBe(createdTransaction);
  });

  it('throws a user-facing error when deleting a missing transaction', async () => {
    const accountRepository = {
      getById: jest.fn(),
      listActive: jest.fn(),
    };
    const categoryRepository = {
      getById: jest.fn(),
      listAll: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn(),
      delete: jest.fn().mockResolvedValue(false),
      update: jest.fn(),
      listWithFilters: jest.fn(),
    };

    mockedCreateAccountRepository.mockReturnValue(accountRepository as never);
    mockedCreateCategoryRepository.mockReturnValue(categoryRepository as never);
    mockedCreateTransactionRepository.mockReturnValue(transactionRepository as never);

    await expect(
      createTransactionService(database).deleteTransaction('missing')
    ).rejects.toMatchObject({
      name: 'UserFacingError',
      userMessage: 'El movimiento ya no existe o no se pudo eliminar.',
    });
  });

  it('forwards optional list filters as undefined to the repository', async () => {
    const accountRepository = {
      getById: jest.fn(),
      listActive: jest.fn(),
    };
    const categoryRepository = {
      getById: jest.fn(),
      listAll: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      listWithFilters: jest.fn().mockResolvedValue([]),
    };

    mockedCreateAccountRepository.mockReturnValue(accountRepository as never);
    mockedCreateCategoryRepository.mockReturnValue(categoryRepository as never);
    mockedCreateTransactionRepository.mockReturnValue(transactionRepository as never);

    await createTransactionService(database).listTransactions({
      month: 6,
      year: 2026,
      type: null,
      accountId: null,
      categoryId: null,
    });

    expect(transactionRepository.listWithFilters).toHaveBeenCalledWith({
      month: 6,
      year: 2026,
      type: undefined,
      accountId: undefined,
      categoryId: undefined,
    });
  });
});
