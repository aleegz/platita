import type {
  BasisPoints,
  EntityId,
  MoneyInCents,
} from '../../types/domain';
import { createCurrencyFormatter } from '../../lib/formatters';

export type SalaryAnalysisData = {
  month: number;
  year: number;
  salaryCategoryId: EntityId | null;
  salaryCategoryFound: boolean;
  hasCurrentSalary: boolean;
  hasPreviousSalary: boolean;
  currentSalaryArs: MoneyInCents;
  previousSalaryArs: MoneyInCents | null;
  salaryUsd: number | null;
  dollarOfficial: MoneyInCents | null;
  inflationMonthlyBasisPoints: BasisPoints | null;
  nominalVariationPercentage: number | null;
  realVariationPercentage: number | null;
};

const arsFormatter = createCurrencyFormatter({
  currency: 'ARS',
});

const usdFormatter = createCurrencyFormatter({
  currency: 'USD',
});

export function createEmptySalaryAnalysisData(
  month: number,
  year: number
): SalaryAnalysisData {
  return {
    month,
    year,
    salaryCategoryId: null,
    salaryCategoryFound: false,
    hasCurrentSalary: false,
    hasPreviousSalary: false,
    currentSalaryArs: 0,
    previousSalaryArs: null,
    salaryUsd: null,
    dollarOfficial: null,
    inflationMonthlyBasisPoints: null,
    nominalVariationPercentage: null,
    realVariationPercentage: null,
  };
}

export function formatSalaryMoneyArs(valueInCents: number) {
  return arsFormatter.format(valueInCents / 100);
}

export function formatSalaryMoneyUsd(value: number) {
  return usdFormatter.format(value);
}

export function formatSalaryPercentage(value: number | null) {
  if (value === null) {
    return '-';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
