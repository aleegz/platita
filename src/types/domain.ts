export type EntityId = string;
export type IsoDateString = string;
export type MoneyInCents = number;
export type BasisPoints = number;

export type AccountType = 'cash' | 'bank' | 'wallet' | 'investment' | 'credit';
export type CategoryType = 'income' | 'expense' | 'yield';
export type TransactionType = 'income' | 'expense' | 'transfer' | 'yield';

export type Account = {
  id: EntityId;
  name: string;
  type: AccountType;
  initialBalance: MoneyInCents;
  active: boolean;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type Category = {
  id: EntityId;
  name: string;
  type: CategoryType;
  active: boolean;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type Transaction = {
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

export type MonthlyBudget = {
  id: EntityId;
  categoryId: EntityId;
  month: number;
  year: number;
  budgetAmount: MoneyInCents;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type EconomicData = {
  id: EntityId;
  month: number;
  year: number;
  dollarOfficial: MoneyInCents;
  inflationMonthlyBasisPoints: BasisPoints;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type EconomicDataPeriod = {
  month: number;
  year: number;
};

export type AccountTransferSummary = {
  incoming: MoneyInCents;
  outgoing: MoneyInCents;
};

export type UserProfile = {
  id: EntityId;
  displayName: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export function isCreditAccountType(type: AccountType) {
  return type === 'credit';
}
