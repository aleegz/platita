import type { BasisPoints, EconomicData, MoneyInCents } from '../../types/domain';
import { createCurrencyFormatter } from '../../lib/formatters';

export type EconomicDataManagementData = {
  month: number;
  year: number;
  currentEntry: EconomicData | null;
  entries: EconomicData[];
};

export type SaveEconomicDataInput = {
  month: number;
  year: number;
  dollarOfficial: MoneyInCents;
  inflationMonthlyBasisPoints: BasisPoints;
};

export type EconomicIndicatorPoint = {
  fecha: string;
  valor: number;
};

export type EconomicDollarQuote = {
  moneda: string;
  casa: string;
  fecha: string;
  compra: number;
  venta: number;
};

export type EconomicIndicatorTrend = {
  direction: 'up' | 'down' | 'flat';
  label: string;
  tone: 'default' | 'positive' | 'negative';
};

export type LiveEconomicIndicators = {
  monthlyInflation: EconomicIndicatorPoint | null;
  interannualInflation: EconomicIndicatorPoint | null;
  monthlyInflationTrend: EconomicIndicatorTrend | null;
  interannualInflationTrend: EconomicIndicatorTrend | null;
  riskCountry: EconomicIndicatorPoint | null;
  riskCountryTrend: EconomicIndicatorTrend | null;
  officialDollar: EconomicDollarQuote | null;
  officialDollarTrend: EconomicIndicatorTrend | null;
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

const moneyFormatter = createCurrencyFormatter({
  currency: 'ARS',
});

export function createEmptyEconomicDataManagementData(
  month: number,
  year: number
): EconomicDataManagementData {
  return {
    month,
    year,
    currentEntry: null,
    entries: [],
  };
}

export function createEmptyLiveEconomicIndicators(): LiveEconomicIndicators {
  return {
    monthlyInflation: null,
    interannualInflation: null,
    monthlyInflationTrend: null,
    interannualInflationTrend: null,
    riskCountry: null,
    riskCountryTrend: null,
    officialDollar: null,
    officialDollarTrend: null,
  };
}

export function formatEconomicDataMoney(valueInCents: number) {
  return moneyFormatter.format(valueInCents / 100);
}

export function formatInflationPercentage(valueInBasisPoints: number) {
  return `${(valueInBasisPoints / 100).toFixed(2)}%`;
}

export function formatMonthlyEconomicIndicatorPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatEconomicIndicatorPercentage(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatRiskCountryPoints(value: number) {
  return `${Math.round(value)} pb`;
}

export function formatLiveDollarMoney(value: number) {
  return formatEconomicDataMoney(Math.round(value * 100));
}

export function formatEconomicIndicatorMonth(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-AR', {
    month: 'short',
    year: 'numeric',
  });
}

export function formatEconomicIndicatorDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-AR');
}

export function formatEconomicPeriod(month: number, year: number) {
  const monthLabel = monthLabels[month - 1];

  return `${monthLabel ?? month}/${year}`;
}