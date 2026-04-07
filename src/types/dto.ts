import type {
  AccountType,
  CategoryType,
  EntityId,
  IsoDateString,
  MoneyInCents,
  TransactionType,
} from './domain';

export type MonthYearDTO = {
  month: number;
  year: number;
};

export type DateRangeDTO = {
  dateFrom?: IsoDateString;
  dateTo?: IsoDateString;
};

export type CreateAccountDTO = {
  id: EntityId;
  name: string;
  type: AccountType;
  initialBalance: MoneyInCents;
  active: boolean;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type UpdateAccountDTO = {
  name?: string;
  type?: AccountType;
  initialBalance?: MoneyInCents;
  active?: boolean;
  updatedAt: IsoDateString;
};

export type CreateCategoryDTO = {
  id: EntityId;
  name: string;
  type: CategoryType;
  active: boolean;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type UpdateCategoryDTO = {
  name?: string;
  type?: CategoryType;
  active?: boolean;
  updatedAt: IsoDateString;
};

export type CreateTransactionDTO = {
  id: EntityId;
  type: TransactionType;
  amount: MoneyInCents;
  date: IsoDateString;
  accountId: EntityId | null;
  fromAccountId: EntityId | null;
  toAccountId: EntityId | null;
  categoryId: EntityId | null;
  note: string | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type UpdateTransactionDTO = {
  type?: TransactionType;
  amount?: MoneyInCents;
  date?: IsoDateString;
  accountId?: EntityId | null;
  fromAccountId?: EntityId | null;
  toAccountId?: EntityId | null;
  categoryId?: EntityId | null;
  note?: string | null;
  updatedAt: IsoDateString;
};

export type ListTransactionsByMonthDTO = MonthYearDTO;

export type ListTransactionsByAccountDTO = {
  accountId: EntityId;
};

export type ListTransactionsFiltersDTO = DateRangeDTO & {
  type?: TransactionType;
  categoryId?: EntityId;
  accountId?: EntityId;
  fromAccountId?: EntityId;
  toAccountId?: EntityId;
  month?: number;
  year?: number;
};

export type SumTransactionsByTypeAndMonthDTO = MonthYearDTO & {
  type: TransactionType;
};

export type SumTransferInOutByAccountDTO = {
  accountId: EntityId;
};

export type UpsertMonthlyBudgetDTO = {
  id: EntityId;
  categoryId: EntityId;
  month: number;
  year: number;
  budgetAmount: MoneyInCents;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type GetBudgetByCategoryMonthYearDTO = MonthYearDTO & {
  categoryId: EntityId;
};

export type UpsertEconomicDataDTO = {
  id: EntityId;
  month: number;
  year: number;
  dollarOfficial: MoneyInCents;
  inflationMonthlyBasisPoints: number;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type GetEconomicDataByMonthYearDTO = MonthYearDTO;

export type UpsertUserProfileDTO = {
  id: EntityId;
  displayName: string;
  appLockEnabled: boolean;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};