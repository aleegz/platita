import type { EntityId, TransactionType } from './domain';

export type SelectedPeriod = {
  month: number;
  year: number;
};

export type TransactionFiltersState = {
  type: TransactionType | null;
  accountId: EntityId | null;
  categoryId: EntityId | null;
};

export type UiLoadingFlagKey =
  | 'appBootstrap'
  | 'accounts'
  | 'categories'
  | 'transactions'
  | 'budgets'
  | 'economicData'
  | 'dashboard';

export type UiLoadingFlags = Record<UiLoadingFlagKey, boolean>;

export type SnackbarVariant = 'info' | 'success' | 'error';

export type SnackbarState = {
  visible: boolean;
  message: string;
  variant: SnackbarVariant;
};

export type UiOverlayState = {
  key: string | null;
  params: Record<string, unknown> | null;
};

