import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  Account,
  AccountTransferSummary,
  AccountType,
  Category,
  CategoryType,
  EconomicData,
  EconomicDataPeriod,
  MonthlyBudget,
  Transaction,
  TransactionType,
  UserProfile,
} from './domain';

export type DatabaseBoolean = 0 | 1;

export type RepositoryDatabase = Pick<
  SQLiteDatabase,
  'getAllAsync' | 'getFirstAsync' | 'runAsync'
>;

export type AccountRow = {
  id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  active: DatabaseBoolean;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  type: CategoryType;
  active: DatabaseBoolean;
  created_at: string;
  updated_at: string;
};

export type TransactionRow = {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  account_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  category_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type MonthlyBudgetRow = {
  id: string;
  category_id: string;
  month: number;
  year: number;
  budget_amount: number;
  created_at: string;
  updated_at: string;
};

export type EconomicDataRow = {
  id: string;
  month: number;
  year: number;
  dollar_official: number;
  inflation_monthly_basis_points: number;
  created_at: string;
  updated_at: string;
};

export type UserProfileRow = {
  id: string;
  display_name: string;
  app_lock_enabled: DatabaseBoolean;
  created_at: string;
  updated_at: string;
};

export type AggregateTotalRow = {
  total: number;
};

export type TransferSummaryRow = {
  incoming: number;
  outgoing: number;
};

export type EconomicDataPeriodRow = {
  month: number;
  year: number;
};

export function toDatabaseBoolean(value: boolean): DatabaseBoolean {
  return value ? 1 : 0;
}

export function mapAccountRow(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    initialBalance: row.initial_balance,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    date: row.date,
    accountId: row.account_id,
    fromAccountId: row.from_account_id,
    toAccountId: row.to_account_id,
    categoryId: row.category_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMonthlyBudgetRow(row: MonthlyBudgetRow): MonthlyBudget {
  return {
    id: row.id,
    categoryId: row.category_id,
    month: row.month,
    year: row.year,
    budgetAmount: row.budget_amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEconomicDataRow(row: EconomicDataRow): EconomicData {
  return {
    id: row.id,
    month: row.month,
    year: row.year,
    dollarOfficial: row.dollar_official,
    inflationMonthlyBasisPoints: row.inflation_monthly_basis_points,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUserProfileRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    appLockEnabled: row.app_lock_enabled === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEconomicDataPeriodRow(
  row: EconomicDataPeriodRow
): EconomicDataPeriod {
  return {
    month: row.month,
    year: row.year,
  };
}

export function mapTransferSummaryRow(
  row: TransferSummaryRow
): AccountTransferSummary {
  return {
    incoming: row.incoming,
    outgoing: row.outgoing,
  };
}