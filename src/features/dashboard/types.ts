import type {
  AccountType,
  EntityId,
  MoneyInCents,
  TransactionType,
} from '../../types/domain';
import { createCurrencyFormatter } from '../../lib/formatters';

export type DashboardBalanceTotals = {
  income: MoneyInCents;
  expense: MoneyInCents;
  yield: MoneyInCents;
  transferIn: MoneyInCents;
  transferOut: MoneyInCents;
};

export type DashboardAccountSnapshot = {
  id: EntityId;
  name: string;
  type: AccountType;
  initialBalance: MoneyInCents;
  currentBalance: MoneyInCents;
  totals: DashboardBalanceTotals;
};

export type DashboardLifetimeSummary = {
  income: MoneyInCents;
  expense: MoneyInCents;
  yield: MoneyInCents;
  balance: MoneyInCents;
  savingsRate: number | null;
};

export type DashboardTrendPoint = {
  month: number;
  year: number;
  label: string;
  income: MoneyInCents;
  expense: MoneyInCents;
  yield: MoneyInCents;
  balance: MoneyInCents;
};

export type DashboardAnnualSummary = {
  year: number;
  income: MoneyInCents;
  expense: MoneyInCents;
  yield: MoneyInCents;
  moneyInFavor: MoneyInCents;
  expenseVsIncomePercentage: number | null;
};

export type DashboardAnnualPoint = {
  month: number;
  year: number;
  label: string;
  income: MoneyInCents;
  expense: MoneyInCents;
  yield: MoneyInCents;
  balance: MoneyInCents;
  cumulativeBalance: MoneyInCents;
};

export type DashboardTopExpenseCategory = {
  categoryId: EntityId | null;
  name: string;
  totalAmount: MoneyInCents;
  share: number;
};

export type DashboardRecentActivity = {
  id: EntityId;
  type: TransactionType;
  title: string;
  context: string;
  amount: MoneyInCents;
  date: string;
};

export type DashboardInsight = {
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'neutral';
};

export type DashboardData = {
  totalMoneyAvailable: MoneyInCents;
  activeAccountsCount: number;
  accountSnapshots: DashboardAccountSnapshot[];
  lifetimeSummary: DashboardLifetimeSummary;
  annualSummary: DashboardAnnualSummary;
  annualBreakdown: DashboardAnnualPoint[];
  monthlyTrend: DashboardTrendPoint[];
  topExpenseCategories: DashboardTopExpenseCategory[];
  recentActivity: DashboardRecentActivity[];
  insight: DashboardInsight;
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

const shortMonthLabels = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const;

const currencyFormatter = createCurrencyFormatter({
  currency: 'ARS',
});

export function createEmptyDashboardData(): DashboardData {
  return {
    totalMoneyAvailable: 0,
    activeAccountsCount: 0,
    accountSnapshots: [],
    lifetimeSummary: {
      income: 0,
      expense: 0,
      yield: 0,
      balance: 0,
      savingsRate: null,
    },
    annualSummary: {
      year: new Date().getFullYear(),
      income: 0,
      expense: 0,
      yield: 0,
      moneyInFavor: 0,
      expenseVsIncomePercentage: null,
    },
    annualBreakdown: [],
    monthlyTrend: [],
    topExpenseCategories: [],
    recentActivity: [],
    insight: {
      title: 'Empieza por tus cuentas',
      description: 'Carga una cuenta y algunos movimientos para ver un panorama financiero global.',
      tone: 'neutral',
    },
  };
}

export function formatDashboardMoney(valueInCents: number) {
  return currencyFormatter.format(valueInCents / 100);
}

export function formatDashboardPeriod(month: number, year: number) {
  const monthLabel = monthLabels[month - 1];

  return `${monthLabel ?? month}/${year}`;
}

export function formatDashboardTrendLabel(month: number, year: number) {
  const monthLabel = shortMonthLabels[month - 1];

  return `${monthLabel ?? month} ${String(year).slice(-2)}`;
}

export function formatDashboardPercentage(value: number | null) {
  if (value === null) {
    return 'Sin base';
  }

  return `${Math.round(value)}%`;
}
