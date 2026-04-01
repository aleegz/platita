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

export function formatEconomicDataMoney(valueInCents: number) {
  return moneyFormatter.format(valueInCents / 100);
}

export function formatInflationPercentage(valueInBasisPoints: number) {
  return `${(valueInBasisPoints / 100).toFixed(2)}%`;
}

export function formatEconomicPeriod(month: number, year: number) {
  const monthLabel = monthLabels[month - 1];

  return `${monthLabel ?? month}/${year}`;
}
