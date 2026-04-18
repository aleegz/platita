import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import type { RepositoryDatabase } from '../../types/database';
import type { Transaction } from '../../types/domain';

import {
  createEmptyMonthlyAnalysisData,
  type MonthlyAnalysisData,
  type MonthlyExpenseCategoryBreakdown,
} from './types';

export type MonthlyAnalysisService = {
  getMonthlyAnalysis(month: number, year: number): Promise<MonthlyAnalysisData>;
};

export function createMonthlyAnalysisService(
  database: RepositoryDatabase
): MonthlyAnalysisService {
  const categoryRepository = createCategoryRepository(database);
  const transactionRepository = createTransactionRepository(database);

  return {
    async getMonthlyAnalysis(month, year) {
      const [categories, transactions] = await Promise.all([
        categoryRepository.listAll(),
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

      return {
        ...data,
        balance,
        savingsAmount: balance > 0 ? balance : null,
        savingsRate: positiveFlow > 0 ? (balance / positiveFlow) * 100 : null,
        expenseVsIncomePercentage:
          positiveFlow > 0 ? (data.expense / positiveFlow) * 100 : null,
        expenseCategoryCount: expenseBreakdown.totalCategories,
        topExpenseCategories: expenseBreakdown.items,
        hasActivity: transactions.length > 0,
      };
    },
  };
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
