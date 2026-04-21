import { createAccountRepository } from '../../database/repositories/account.repository';
import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import type { RepositoryDatabase } from '../../types/database';
import {
  isCreditAccountType,
  type Account,
  type Transaction,
} from '../../types/domain';

import {
  createEmptyMonthlyAnalysisData,
  type MonthlyAnalysisData,
  type MonthlyExpenseCategoryBreakdown,
  type MonthlyOpeningAccountSnapshot,
} from './types';

export type MonthlyAnalysisService = {
  getMonthlyAnalysis(month: number, year: number): Promise<MonthlyAnalysisData>;
};

export function createMonthlyAnalysisService(
  database: RepositoryDatabase
): MonthlyAnalysisService {
  const accountRepository = createAccountRepository(database);
  const categoryRepository = createCategoryRepository(database);
  const transactionRepository = createTransactionRepository(database);

  return {
    async getMonthlyAnalysis(month, year) {
      const openingDate = getMonthOpeningDate(month, year);
      const openingTransactionsEndDate = getDayBefore(openingDate);
      const [accounts, categories, openingTransactions, transactions] = await Promise.all([
        accountRepository.listActive(),
        categoryRepository.listAll(),
        transactionRepository.listWithFilters({
          dateTo: openingTransactionsEndDate,
        }),
        transactionRepository.listWithFilters({
          month,
          year,
        }),
      ]);
      const data = createEmptyMonthlyAnalysisData(month, year);
      const categoryNamesById = new Map(
        categories.map((category) => [category.id, category.name])
      );

      for (const transaction of transactions) {
        if (transaction.type === 'income') {
          data.income += transaction.amount;
          continue;
        }

        if (transaction.type === 'expense') {
          data.expense += transaction.amount;
          continue;
        }

        if (transaction.type === 'yield') {
          data.yield += transaction.amount;
        }
      }

      const positiveFlow = data.income + data.yield;
      const balance = positiveFlow - data.expense;
      const expenseBreakdown = buildExpenseCategoryBreakdown(
        transactions,
        categoryNamesById
      );
      const openingAccountDistribution = buildOpeningAccountDistribution(
        accounts,
        openingTransactions
      );

      return {
        ...data,
        balance,
        savingsAmount: balance > 0 ? balance : null,
        savingsRate: positiveFlow > 0 ? (balance / positiveFlow) * 100 : null,
        expenseVsIncomePercentage:
          positiveFlow > 0 ? (data.expense / positiveFlow) * 100 : null,
        expenseCategoryCount: expenseBreakdown.totalCategories,
        topExpenseCategories: expenseBreakdown.items,
        openingBalanceTotal: openingAccountDistribution.total,
        openingPositiveBalanceBase: openingAccountDistribution.positiveBase,
        openingAccountCount: openingAccountDistribution.accountCount,
        openingAccountsWithBalanceCount: openingAccountDistribution.accountsWithBalanceCount,
        openingAccountSnapshots: openingAccountDistribution.items,
        hasActivity: transactions.length > 0,
      };
    },
  };
}

function buildOpeningAccountDistribution(
  accounts: Account[],
  transactions: Transaction[]
): {
  total: number;
  positiveBase: number;
  accountCount: number;
  accountsWithBalanceCount: number;
  items: MonthlyOpeningAccountSnapshot[];
} {
  const balances = accounts.map((account) => ({
    account,
    openingBalance: calculateOpeningBalance(account, transactions),
  }));
  const positiveBase = balances.reduce(
    (total, item) => total + Math.max(item.openingBalance, 0),
    0
  );

  return {
    total: balances.reduce((total, item) => total + item.openingBalance, 0),
    positiveBase,
    accountCount: balances.length,
    accountsWithBalanceCount: balances.filter((item) => item.openingBalance !== 0).length,
    items: balances
      .map(({ account, openingBalance }) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        openingBalance,
        distributionShare:
          openingBalance > 0 && positiveBase > 0 ? openingBalance / positiveBase : null,
      }))
      .sort((left, right) => right.openingBalance - left.openingBalance),
  };
}

function calculateOpeningBalance(account: Account, transactions: Transaction[]) {
  let balance = isCreditAccountType(account.type)
    ? -account.initialBalance
    : account.initialBalance;

  for (const transaction of transactions) {
    switch (transaction.type) {
      case 'income':
        if (transaction.accountId === account.id) {
          balance += transaction.amount;
        }
        break;
      case 'expense':
        if (transaction.accountId === account.id) {
          balance -= transaction.amount;
        }
        break;
      case 'yield':
        if (transaction.accountId === account.id) {
          balance += transaction.amount;
        }
        break;
      case 'transfer':
        if (transaction.toAccountId === account.id) {
          balance += transaction.amount;
        }

        if (transaction.fromAccountId === account.id) {
          balance -= transaction.amount;
        }
        break;
    }
  }

  return balance;
}

function buildExpenseCategoryBreakdown(
  transactions: Transaction[],
  categoryNamesById: Map<string, string>,
  limit = 5
): {
  totalCategories: number;
  items: MonthlyExpenseCategoryBreakdown[];
} {
  const totalsByCategoryId = new Map<string | null, number>();
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }

    totalExpense += transaction.amount;
    const categoryId = transaction.categoryId ?? null;
    const currentTotal = totalsByCategoryId.get(categoryId) ?? 0;

    totalsByCategoryId.set(categoryId, currentTotal + transaction.amount);
  }

  return {
    totalCategories: totalsByCategoryId.size,
    items: Array.from(totalsByCategoryId.entries())
      .map(([categoryId, totalAmount]) => ({
        categoryId,
        name: categoryId
          ? categoryNamesById.get(categoryId) ?? 'Categoría sin nombre'
          : 'Sin categoría',
        totalAmount,
        share: totalExpense > 0 ? totalAmount / totalExpense : 0,
      }))
      .sort((left, right) => right.totalAmount - left.totalAmount)
      .slice(0, limit),
  };
}

function getMonthOpeningDate(month: number, year: number) {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function getDayBefore(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);

  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
