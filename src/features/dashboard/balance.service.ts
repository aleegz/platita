import type { Account, Transaction } from '../../types/domain';

import type {
  DashboardAccountSnapshot,
  DashboardAnnualPoint,
  DashboardAnnualSummary,
  DashboardBalanceTotals,
  DashboardInsight,
  DashboardLifetimeSummary,
  DashboardRecentActivity,
  DashboardTopExpenseCategory,
  DashboardTrendPoint,
} from './types';
import { formatDashboardTrendLabel } from './types';

export function buildAccountSnapshot(
  account: Account,
  transactions: Transaction[]
): DashboardAccountSnapshot {
  const totals = calculateAccountTotals(account.id, transactions);
  const currentBalance =
    account.initialBalance +
    totals.income +
    totals.yield -
    totals.expense +
    totals.transferIn -
    totals.transferOut;

  return {
    id: account.id,
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance,
    currentBalance,
    totals,
  };
}

export function calculateTotalMoneyAvailable(
  snapshots: DashboardAccountSnapshot[]
) {
  return snapshots.reduce(
    (total, accountSnapshot) => total + accountSnapshot.currentBalance,
    0
  );
}

export function buildLifetimeSummary(
  transactions: Transaction[]
): DashboardLifetimeSummary {
  let income = 0;
  let expense = 0;
  let yieldAmount = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      income += transaction.amount;
      continue;
    }

    if (transaction.type === 'expense') {
      expense += transaction.amount;
      continue;
    }

    if (transaction.type === 'yield') {
      yieldAmount += transaction.amount;
    }
  }

  const balance = income + yieldAmount - expense;
  const incomeBase = income + yieldAmount;

  return {
    income,
    expense,
    yield: yieldAmount,
    balance,
    savingsRate: incomeBase > 0 ? (balance / incomeBase) * 100 : null,
  };
}

export function buildAnnualBreakdown(
  transactions: Transaction[],
  referenceDate = new Date()
): DashboardAnnualPoint[] {
  const referenceYear = getReferenceYear(transactions, referenceDate);
  const breakdown = new Map<number, DashboardAnnualPoint>();

  for (let month = 1; month <= 12; month += 1) {
    breakdown.set(month, {
      month,
      year: referenceYear,
      label: formatDashboardTrendLabel(month, referenceYear).split(' ')[0] ?? String(month),
      income: 0,
      expense: 0,
      yield: 0,
      balance: 0,
      cumulativeBalance: 0,
    });
  }

  for (const transaction of transactions) {
    const [yearLabel, monthLabel] = transaction.date.split('-').map(Number);

    if (
      Number.isNaN(yearLabel) ||
      Number.isNaN(monthLabel) ||
      yearLabel !== referenceYear
    ) {
      continue;
    }

    const point = breakdown.get(monthLabel);

    if (!point) {
      continue;
    }

    if (transaction.type === 'income') {
      point.income += transaction.amount;
    } else if (transaction.type === 'expense') {
      point.expense += transaction.amount;
    } else if (transaction.type === 'yield') {
      point.yield += transaction.amount;
    }
  }

  let cumulativeBalance = 0;

  return Array.from(breakdown.values()).map((point) => {
    const balance = point.income + point.yield - point.expense;
    cumulativeBalance += balance;

    return {
      ...point,
      balance,
      cumulativeBalance,
    };
  });
}

export function buildAnnualSummary(
  annualBreakdown: DashboardAnnualPoint[]
): DashboardAnnualSummary {
  const income = annualBreakdown.reduce((total, point) => total + point.income, 0);
  const expense = annualBreakdown.reduce((total, point) => total + point.expense, 0);
  const yieldAmount = annualBreakdown.reduce((total, point) => total + point.yield, 0);
  const moneyInFavor = income + yieldAmount - expense;
  const positiveBase = income + yieldAmount;
  const referenceYear = annualBreakdown[0]?.year ?? new Date().getFullYear();

  return {
    year: referenceYear,
    income,
    expense,
    yield: yieldAmount,
    moneyInFavor,
    expenseVsIncomePercentage:
      positiveBase > 0 ? (expense / positiveBase) * 100 : null,
  };
}

export function buildMonthlyTrend(
  transactions: Transaction[],
  months = 6,
  referenceDate = new Date()
): DashboardTrendPoint[] {
  const trend = new Map<string, DashboardTrendPoint>();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${String(month).padStart(2, '0')}`;

    trend.set(key, {
      month,
      year,
      label: formatDashboardTrendLabel(month, year),
      income: 0,
      expense: 0,
      yield: 0,
      balance: 0,
    });
  }

  for (const transaction of transactions) {
    const [yearLabel, monthLabel] = transaction.date.split('-');

    if (!yearLabel || !monthLabel) {
      continue;
    }

    const key = `${yearLabel}-${monthLabel}`;
    const point = trend.get(key);

    if (!point) {
      continue;
    }

    if (transaction.type === 'income') {
      point.income += transaction.amount;
    } else if (transaction.type === 'expense') {
      point.expense += transaction.amount;
    } else if (transaction.type === 'yield') {
      point.yield += transaction.amount;
    }
  }

  return Array.from(trend.values()).map((point) => ({
    ...point,
    balance: point.income + point.yield - point.expense,
  }));
}

export function buildTopExpenseCategories(
  transactions: Transaction[],
  categoryNamesById: Map<string, string>,
  limit = 4
): DashboardTopExpenseCategory[] {
  const totalsByCategoryId = new Map<string | null, number>();
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }

    totalExpense += transaction.amount;
    const currentTotal =
      totalsByCategoryId.get(transaction.categoryId ?? null) ?? 0;

    totalsByCategoryId.set(
      transaction.categoryId ?? null,
      currentTotal + transaction.amount
    );
  }

  return Array.from(totalsByCategoryId.entries())
    .map(([categoryId, totalAmount]) => ({
      categoryId,
      name: categoryId
        ? categoryNamesById.get(categoryId) ?? 'Categoría sin nombre'
        : 'Sin categoría',
      totalAmount,
      share: totalExpense > 0 ? totalAmount / totalExpense : 0,
    }))
    .sort((left, right) => right.totalAmount - left.totalAmount)
    .slice(0, limit);
}

export function buildRecentActivity(
  transactions: Transaction[],
  accountNamesById: Map<string, string>,
  categoryNamesById: Map<string, string>,
  limit = 6
): DashboardRecentActivity[] {
  return transactions.slice(0, limit).map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    title: getRecentActivityTitle(transaction, categoryNamesById),
    context: getRecentActivityContext(transaction, accountNamesById),
    amount: transaction.amount,
    date: transaction.date,
  }));
}

export function buildDashboardInsight(input: {
  activeAccountsCount: number;
  totalMoneyAvailable: number;
  lifetimeSummary: DashboardLifetimeSummary;
  monthlyTrend: DashboardTrendPoint[];
}): DashboardInsight {
  if (input.activeAccountsCount === 0) {
    return {
      title: 'Empieza por tus cuentas',
      description:
        'Carga al menos una cuenta activa para transformar la app en un tablero financiero claro.',
      tone: 'neutral',
    };
  }

  const latestTrendPoint = input.monthlyTrend[input.monthlyTrend.length - 1] ?? null;

  if (input.totalMoneyAvailable <= 0) {
    return {
      title: 'Hace falta recomponer el colchón',
      description:
        'Tu saldo disponible está muy ajustado. Prioriza cuentas, gastos fuertes y entradas recientes.',
      tone: 'warning',
    };
  }

  if (latestTrendPoint && latestTrendPoint.balance < 0) {
    return {
      title: 'Tu flujo reciente viene presionado',
      description:
        'En los últimos movimientos el gasto le está ganando a los ingresos. Revisa las categorías con mayor peso.',
      tone: 'warning',
    };
  }

  if (input.lifetimeSummary.balance > 0) {
    return {
      title: 'Tu panorama general se ve sano',
      description:
        'Estás acumulando balance positivo y manteniendo saldo disponible entre tus cuentas activas.',
      tone: 'positive',
    };
  }

  return {
    title: 'Ya tienes una base para decidir mejor',
    description:
      'El tablero ya centraliza saldos, tendencia y actividad reciente para que detectes desorden rápidamente.',
    tone: 'neutral',
  };
}

function calculateAccountTotals(
  accountId: string,
  transactions: Transaction[]
): DashboardBalanceTotals {
  const totals: DashboardBalanceTotals = {
    income: 0,
    expense: 0,
    yield: 0,
    transferIn: 0,
    transferOut: 0,
  };

  for (const transaction of transactions) {
    switch (transaction.type) {
      case 'income':
        if (transaction.accountId === accountId) {
          totals.income += transaction.amount;
        }
        break;
      case 'expense':
        if (transaction.accountId === accountId) {
          totals.expense += transaction.amount;
        }
        break;
      case 'yield':
        if (transaction.accountId === accountId) {
          totals.yield += transaction.amount;
        }
        break;
      case 'transfer':
        if (transaction.toAccountId === accountId) {
          totals.transferIn += transaction.amount;
        }

        if (transaction.fromAccountId === accountId) {
          totals.transferOut += transaction.amount;
        }
        break;
    }
  }

  return totals;
}

function getRecentActivityTitle(
  transaction: Transaction,
  categoryNamesById: Map<string, string>
) {
  if (transaction.type === 'transfer') {
    return 'Transferencia';
  }

  if (!transaction.categoryId) {
    return transaction.type === 'income'
      ? 'Ingreso sin categoría'
      : transaction.type === 'yield'
        ? 'Rendimiento'
        : 'Gasto sin categoría';
  }

  return categoryNamesById.get(transaction.categoryId) ?? 'Categoría';
}

function getRecentActivityContext(
  transaction: Transaction,
  accountNamesById: Map<string, string>
) {
  if (transaction.type === 'transfer') {
    const fromAccountName =
      (transaction.fromAccountId
        ? accountNamesById.get(transaction.fromAccountId)
        : null) ?? 'Cuenta origen';
    const toAccountName =
      (transaction.toAccountId ? accountNamesById.get(transaction.toAccountId) : null) ??
      'Cuenta destino';

    return `${fromAccountName} -> ${toAccountName}`;
  }

  return (
    (transaction.accountId ? accountNamesById.get(transaction.accountId) : null) ??
    'Cuenta'
  );
}

function getReferenceYear(
  transactions: Transaction[],
  referenceDate: Date
) {
  const latestTransaction = transactions[0] ?? null;
  const latestYear = latestTransaction
    ? Number(latestTransaction.date.slice(0, 4))
    : Number.NaN;

  return Number.isNaN(latestYear) ? referenceDate.getFullYear() : latestYear;
}
