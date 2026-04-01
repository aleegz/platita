import { create } from 'zustand';

import type { TransactionType } from '../types/domain';
import type { TransactionFiltersState } from '../types/store';

export type FiltersStoreState = {
  transactionFilters: TransactionFiltersState;
  setTransactionType: (type: TransactionType | null) => void;
  setTransactionAccountId: (accountId: string | null) => void;
  setTransactionCategoryId: (categoryId: string | null) => void;
  setTransactionFilters: (
    filters: Partial<TransactionFiltersState>
  ) => void;
  resetTransactionFilters: () => void;
};

const initialTransactionFilters: TransactionFiltersState = {
  type: null,
  accountId: null,
  categoryId: null,
};

export const useFiltersStore = create<FiltersStoreState>((set) => ({
  transactionFilters: initialTransactionFilters,
  setTransactionType: (type) =>
    set((state) => ({
      transactionFilters: {
        ...state.transactionFilters,
        type,
      },
    })),
  setTransactionAccountId: (accountId) =>
    set((state) => ({
      transactionFilters: {
        ...state.transactionFilters,
        accountId,
      },
    })),
  setTransactionCategoryId: (categoryId) =>
    set((state) => ({
      transactionFilters: {
        ...state.transactionFilters,
        categoryId,
      },
    })),
  setTransactionFilters: (filters) =>
    set((state) => ({
      transactionFilters: {
        ...state.transactionFilters,
        ...filters,
      },
    })),
  resetTransactionFilters: () =>
    set({
      transactionFilters: initialTransactionFilters,
    }),
}));

export const filtersStoreSelectors = {
  transactionFilters: (state: FiltersStoreState) => state.transactionFilters,
  transactionType: (state: FiltersStoreState) => state.transactionFilters.type,
  transactionAccountId: (state: FiltersStoreState) =>
    state.transactionFilters.accountId,
  transactionCategoryId: (state: FiltersStoreState) =>
    state.transactionFilters.categoryId,
} as const;

