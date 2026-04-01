import { createBudgetRepository } from '../../database/repositories/budget.repository';
import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import { createUserFacingError } from '../../lib/errors';
import type { RepositoryDatabase } from '../../types/database';
import type { MonthlyBudget } from '../../types/domain';

import { buildBudgetListItems } from './budget-calculations';
import type { BudgetsData, UpsertBudgetInput } from './types';

export type BudgetService = {
  getBudgetsData(month: number, year: number): Promise<BudgetsData>;
  upsertBudget(input: UpsertBudgetInput): Promise<MonthlyBudget>;
};

export function createBudgetService(
  database: RepositoryDatabase
): BudgetService {
  const budgetRepository = createBudgetRepository(database);
  const categoryRepository = createCategoryRepository(database);
  const transactionRepository = createTransactionRepository(database);

  return {
    async getBudgetsData(month, year) {
      const previousPeriod = getPreviousBudgetPeriod(month, year);
      const [categories, budgets, fallbackBudgets, expenseTransactions] =
        await Promise.all([
        categoryRepository.listByType('expense'),
        budgetRepository.getBudgetsByMonthYear({ month, year }),
        budgetRepository.getBudgetsByMonthYear(previousPeriod),
        transactionRepository.listWithFilters({
          month,
          year,
          type: 'expense',
        }),
        ]);
      const activeExpenseCategories = categories.filter((category) => category.active);

      return {
        month,
        year,
        items: buildBudgetListItems({
          categories: activeExpenseCategories,
          budgets,
          fallbackBudgets,
          expenseTransactions,
        }),
      };
    },
    async upsertBudget(input) {
      const category = await categoryRepository.getById(input.categoryId);

      if (!category || !category.active || category.type !== 'expense') {
        throw createUserFacingError(
          'La categoría elegida debe ser una categoría de gasto activa.'
        );
      }

      const existingBudget = await budgetRepository.getBudgetByCategoryMonthYear({
        categoryId: input.categoryId,
        month: input.month,
        year: input.year,
      });
      const timestamp = createTimestamp();

      return budgetRepository.upsertMonthlyBudget({
        id: existingBudget?.id ?? createBudgetId(),
        categoryId: input.categoryId,
        month: input.month,
        year: input.year,
        budgetAmount: input.budgetAmount,
        createdAt: existingBudget?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
    },
  };
}

function createTimestamp() {
  return new Date().toISOString();
}

function createBudgetId() {
  return `budget_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getPreviousBudgetPeriod(month: number, year: number) {
  if (month === 1) {
    return {
      month: 12,
      year: year - 1,
    };
  }

  return {
    month: month - 1,
    year,
  };
}
