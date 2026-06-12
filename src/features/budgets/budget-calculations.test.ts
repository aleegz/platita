import type { Category, MonthlyBudget, Transaction } from '../../types/domain';

import { buildBudgetListItems } from './budget-calculations';

function createCategory(id: string, name: string): Category {
  return {
    id,
    name,
    type: 'expense',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function createBudget(input: {
  id: string;
  categoryId: string;
  budgetAmount: number;
}): MonthlyBudget {
  return {
    id: input.id,
    categoryId: input.categoryId,
    month: 1,
    year: 2026,
    budgetAmount: input.budgetAmount,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function createExpenseTransaction(input: {
  id: string;
  categoryId: string | null;
  amount: number;
}): Transaction {
  return {
    id: input.id,
    type: 'expense',
    amount: input.amount,
    date: '2026-01-15',
    accountId: 'account_1',
    fromAccountId: null,
    toAccountId: null,
    categoryId: input.categoryId,
    note: null,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
  };
}

describe('buildBudgetListItems', () => {
  it('uses current budgets, fallback budgets and sorts categories alphabetically', () => {
    const items = buildBudgetListItems({
      categories: [
        createCategory('food', 'Comida'),
        createCategory('transport', 'Transporte'),
      ],
      budgets: [createBudget({ id: 'budget_food', categoryId: 'food', budgetAmount: 10_000 })],
      fallbackBudgets: [
        createBudget({
          id: 'budget_transport_prev',
          categoryId: 'transport',
          budgetAmount: 5_000,
        }),
      ],
      expenseTransactions: [
        createExpenseTransaction({ id: 'expense_1', categoryId: 'food', amount: 8_500 }),
        createExpenseTransaction({ id: 'expense_2', categoryId: 'transport', amount: 5_500 }),
      ],
    });

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.categoryName)).toEqual(['Comida', 'Transporte']);

    expect(items[0]).toMatchObject({
      categoryId: 'food',
      source: 'current',
      spentAmount: 8_500,
      remainingAmount: 1_500,
      status: 'warning',
    });

    expect(items[1]).toMatchObject({
      categoryId: 'transport',
      source: 'previous_month',
      spentAmount: 5_500,
      remainingAmount: -500,
      status: 'exceeded',
    });
  });

  it('marks categories without budget as not_set', () => {
    const [item] = buildBudgetListItems({
      categories: [createCategory('health', 'Salud')],
      budgets: [],
      fallbackBudgets: [],
      expenseTransactions: [
        createExpenseTransaction({ id: 'expense_3', categoryId: 'health', amount: 1_200 }),
      ],
    });

    expect(item).toMatchObject({
      categoryId: 'health',
      budgetAmount: null,
      spentAmount: 1_200,
      remainingAmount: null,
      usageRatio: null,
      usagePercentage: null,
      source: 'none',
      status: 'not_set',
    });
  });
});
