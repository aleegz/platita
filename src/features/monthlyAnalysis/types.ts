import type {
  AccountType,
  EntityId,
  MoneyInCents,
} from '../../types/domain';

export type MonthlyAnalysisData = {
  month: number;
  year: number;
  income: number;
  expense: number;
  yield: number;
  balance: number;
  savingsAmount: number | null;
  savingsRate: number | null;
  expenseVsIncomePercentage: number | null;
  expenseCategoryCount: number;
  topExpenseCategories: MonthlyExpenseCategoryBreakdown[];
  openingBalanceTotal: MoneyInCents;
  openingPositiveBalanceBase: MoneyInCents;
  openingAccountCount: number;
  openingAccountsWithBalanceCount: number;
  openingAccountSnapshots: MonthlyOpeningAccountSnapshot[];
  hasActivity: boolean;
};

export type MonthlyOpeningAccountSnapshot = {
  id: EntityId;
  name: string;
  type: AccountType;
  openingBalance: MoneyInCents;
  distributionShare: number | null;
};

export type MonthlyExpenseCategoryBreakdown = {
  categoryId: string | null;
  name: string;
  totalAmount: number;
  share: number;
};

export function createEmptyMonthlyAnalysisData(
  month: number,
  year: number
): MonthlyAnalysisData {
  return {
    month,
    year,
    income: 0,
    expense: 0,
    yield: 0,
    balance: 0,
    savingsAmount: null,
    savingsRate: null,
    expenseVsIncomePercentage: null,
    expenseCategoryCount: 0,
    topExpenseCategories: [],
    openingBalanceTotal: 0,
    openingPositiveBalanceBase: 0,
    openingAccountCount: 0,
    openingAccountsWithBalanceCount: 0,
    openingAccountSnapshots: [],
    hasActivity: false,
  };
}

export function getRelativePeriod(month: number, year: number, offset: number) {
  const date = new Date(year, month - 1 + offset, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function resolveMonthYearParams(input: {
  month?: string | string[];
  year?: string | string[];
}) {
  const fallbackDate = new Date();
  const monthValue = Number(Array.isArray(input.month) ? input.month[0] : input.month);
  const yearValue = Number(Array.isArray(input.year) ? input.year[0] : input.year);
  const hasValidMonth = Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12;
  const hasValidYear = Number.isInteger(yearValue) && yearValue >= 1900 && yearValue <= 9999;

  return {
    month: hasValidMonth ? monthValue : fallbackDate.getMonth() + 1,
    year: hasValidYear ? yearValue : fallbackDate.getFullYear(),
  };
}
