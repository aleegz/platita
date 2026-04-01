import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import {
  createUserFacingError,
  getUserFacingMessage,
} from '../../lib/errors';
import { animateNextLayout } from '../../lib/motion';
import { useAppStore, appStoreSelectors } from '../../store/app.store';
import {
  useFiltersStore,
  filtersStoreSelectors,
} from '../../store/filters.store';
import type { Account, Category, Transaction } from '../../types/domain';
import { createTransactionService } from './service';
import type {
  SaveTransactionInput,
  TransactionListFilters,
} from './types';

type TransactionReferenceState = {
  accounts: Account[];
  categories: Category[];
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

type TransactionsState = TransactionReferenceState & {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  transactionFilters: ReturnType<typeof filtersStoreSelectors.transactionFilters>;
};

type TransactionMutations = {
  isSubmitting: boolean;
  errorMessage: string | null;
  createTransaction: (input: SaveTransactionInput) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (
    id: string,
    input: SaveTransactionInput
  ) => Promise<Transaction>;
};

export function useTransactionReferenceData(): TransactionReferenceState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await createTransactionService(database).loadReferenceData();

      animateNextLayout();
      setAccounts(data.accounts);
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudieron cargar cuentas y categorías.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [database, isFocused]);

  return {
    accounts,
    categories,
    isLoading,
    errorMessage,
    refresh,
  };
}

export function useTransactions(): TransactionsState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const selectedMonth = useAppStore(appStoreSelectors.selectedMonth);
  const selectedYear = useAppStore(appStoreSelectors.selectedYear);
  const transactionFilters = useFiltersStore(
    filtersStoreSelectors.transactionFilters
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const service = createTransactionService(database);
      const filters: TransactionListFilters = {
        month: selectedMonth,
        year: selectedYear,
        type: transactionFilters.type,
        accountId: transactionFilters.accountId,
        categoryId: transactionFilters.categoryId,
      };

      const [items, data] = await Promise.all([
        service.listTransactions(filters),
        service.loadReferenceData(),
      ]);

      animateNextLayout();
      setTransactions(items);
      setAccounts(data.accounts);
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudieron cargar los movimientos.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [
    database,
    isFocused,
    selectedMonth,
    selectedYear,
    transactionFilters.type,
    transactionFilters.accountId,
    transactionFilters.categoryId,
  ]);

  return {
    transactions,
    accounts,
    categories,
    isLoading,
    errorMessage,
    refresh,
    selectedMonth,
    selectedYear,
    transactionFilters,
  };
}

export function useTransactionMutations(): TransactionMutations {
  const database = useDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function createTransaction(input: SaveTransactionInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      return await createTransactionService(database).createTransaction(input);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(error, 'No se pudo guardar el movimiento.')
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteTransaction(id: string) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createTransactionService(database).deleteTransaction(id);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(error, 'No se pudo eliminar el movimiento.')
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateTransaction(id: string, input: SaveTransactionInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const transaction = await createTransactionService(database).updateTransaction(
        id,
        input
      );

      if (!transaction) {
        throw createUserFacingError(
          'El movimiento ya no existe o no está disponible.'
        );
      }

      return transaction;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(error, 'No se pudo actualizar el movimiento.')
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    errorMessage,
    createTransaction,
    deleteTransaction,
    updateTransaction,
  };
}
