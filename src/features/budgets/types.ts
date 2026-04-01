import type { EntityId, MoneyInCents, MonthlyBudget } from '../../types/domain';
import { createCurrencyFormatter } from '../../lib/formatters';

export type BudgetStatus = 'not_set' | 'normal' | 'warning' | 'exceeded';
export type BudgetSource = 'current' | 'previous_month' | 'none';

export type BudgetListItem = {
  categoryId: EntityId;
  categoryName: string;
  budget: MonthlyBudget | null;
  fallbackBudget: MonthlyBudget | null;
  budgetAmount: MoneyInCents | null;
  spentAmount: MoneyInCents;
  remainingAmount: MoneyInCents | null;
  usageRatio: number | null;
  usagePercentage: number | null;
  status: BudgetStatus;
  source: BudgetSource;
};

export type BudgetsData = {
  month: number;
  year: number;
  items: BudgetListItem[];
};

export type UpsertBudgetInput = {
  categoryId: EntityId;
  month: number;
  year: number;
  budgetAmount: MoneyInCents;
};

const monthLabels = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const currencyFormatter = createCurrencyFormatter({
  currency: 'ARS',
});

export function createEmptyBudgetsData(
  month: number,
  year: number
): BudgetsData {
  return {
    month,
    year,
    items: [],
  };
}

export function formatBudgetMoney(valueInCents: number) {
  return currencyFormatter.format(valueInCents / 100);
}

export function formatBudgetPeriod(month: number, year: number) {
  const monthLabel = monthLabels[month - 1];

  return `${monthLabel ?? month}/${year}`;
}

export function formatBudgetUsagePercentage(value: number | null) {
  if (value === null) {
    return '-';
  }

  return `${Math.round(value)}%`;
}

export function getBudgetStatusLabel(status: BudgetStatus) {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'warning':
      return 'En alerta';
    case 'exceeded':
      return 'Excedido';
    default:
      return 'Sin definir';
  }
}
