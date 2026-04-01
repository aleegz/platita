import type { Category, MonthlyBudget, Transaction } from '../../types/domain';

import type { BudgetListItem, BudgetStatus } from './types';

export function buildBudgetListItems(input: {
  categories: Category[];
  budgets: MonthlyBudget[];
  fallbackBudgets: MonthlyBudget[];
  expenseTransactions: Transaction[];
}): BudgetListItem[] {
  const budgetByCategoryId = new Map(
    input.budgets.map((budget) => [budget.categoryId, budget])
  );
  const fallbackBudgetByCategoryId = new Map(
    input.fallbackBudgets.map((budget) => [budget.categoryId, budget])
  );
  const spentByCategoryId = new Map<string, number>();

  for (const transaction of input.expenseTransactions) {
    if (!transaction.categoryId) {
      continue;
    }

    const currentSpent = spentByCategoryId.get(transaction.categoryId) ?? 0;

    spentByCategoryId.set(
      transaction.categoryId,
      currentSpent + transaction.amount
    );
  }

  return input.categories
    .map((category) => {
      const budget = budgetByCategoryId.get(category.id) ?? null;
      const fallbackBudget = fallbackBudgetByCategoryId.get(category.id) ?? null;
      const budgetAmount =
        budget?.budgetAmount ?? fallbackBudget?.budgetAmount ?? null;
      const spentAmount = spentByCategoryId.get(category.id) ?? 0;
      const usage = calculateBudgetUsage(budgetAmount, spentAmount);

      return {
        categoryId: category.id,
        categoryName: category.name,
        budget,
        fallbackBudget,
        budgetAmount,
        spentAmount,
        remainingAmount: usage.remainingAmount,
        usageRatio: usage.usageRatio,
        usagePercentage: usage.usagePercentage,
        status: usage.status,
        source: budget
          ? ('current' as const)
          : fallbackBudget
            ? ('previous_month' as const)
            : ('none' as const),
      };
    })
    .sort((left, right) =>
      left.categoryName.localeCompare(right.categoryName, 'es-AR')
    );
}

type CalculatedBudgetUsage = {
  remainingAmount: number | null;
  usageRatio: number | null;
  usagePercentage: number | null;
  status: BudgetStatus;
};

function calculateBudgetUsage(
  budgetAmount: number | null,
  spentAmount: number
): CalculatedBudgetUsage {
  if (budgetAmount === null) {
    return {
      remainingAmount: null,
      usageRatio: null,
      usagePercentage: null,
      status: 'not_set',
    };
  }

  if (budgetAmount <= 0) {
    return {
      remainingAmount: budgetAmount - spentAmount,
      usageRatio: spentAmount > 0 ? null : 0,
      usagePercentage: spentAmount > 0 ? null : 0,
      status: spentAmount > 0 ? 'exceeded' : 'normal',
    };
  }

  const usageRatio = spentAmount / budgetAmount;
  const usagePercentage = usageRatio * 100;
  const remainingAmount = budgetAmount - spentAmount;

  return {
    remainingAmount,
    usageRatio,
    usagePercentage,
    status: getBudgetStatus(usageRatio),
  };
}

function getBudgetStatus(usageRatio: number): BudgetStatus {
  if (usageRatio > 1) {
    return 'exceeded';
  }

  if (usageRatio >= 0.8) {
    return 'warning';
  }

  return 'normal';
}
