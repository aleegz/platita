import { create } from 'zustand';

export type DomainInvalidationStoreState = {
  transactionsVersion: number;
  transactionReferencesVersion: number;
  budgetsVersion: number;
  invalidateTransactions: () => void;
  invalidateTransactionReferences: () => void;
  invalidateBudgets: () => void;
};

export const useDomainInvalidationStore = create<DomainInvalidationStoreState>((set) => ({
  transactionsVersion: 0,
  transactionReferencesVersion: 0,
  budgetsVersion: 0,
  invalidateTransactions: () =>
    set((state) => ({
      transactionsVersion: state.transactionsVersion + 1,
    })),
  invalidateTransactionReferences: () =>
    set((state) => ({
      transactionReferencesVersion: state.transactionReferencesVersion + 1,
    })),
  invalidateBudgets: () =>
    set((state) => ({
      budgetsVersion: state.budgetsVersion + 1,
    })),
}));

export const domainInvalidationStoreSelectors = {
  transactionsVersion: (state: DomainInvalidationStoreState) =>
    state.transactionsVersion,
  transactionReferencesVersion: (state: DomainInvalidationStoreState) =>
    state.transactionReferencesVersion,
  budgetsVersion: (state: DomainInvalidationStoreState) => state.budgetsVersion,
} as const;
