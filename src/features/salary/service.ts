import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createEconomicDataRepository } from '../../database/repositories/economicData.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import type { RepositoryDatabase } from '../../types/database';
import type { EconomicData, Transaction } from '../../types/domain';

import {
  fetchMonthlyInflationSeries,
  fetchOfficialDollarSeries,
  type MonthlyInflationPoint,
  type OfficialDollarQuotePoint,
} from '../economicData/api';

import {
  createEmptySalaryAnalysisData,
  type SalaryAnalysisData,
} from './types';

export type SalaryService = {
  getSalaryAnalysis(month: number, year: number): Promise<SalaryAnalysisData>;
};

export function createSalaryService(
  database: RepositoryDatabase
): SalaryService {
  const categoryRepository = createCategoryRepository(database);
  const transactionRepository = createTransactionRepository(database);
  const economicDataRepository = createEconomicDataRepository(database);

  return {
    async getSalaryAnalysis(month, year) {
      const salaryCategory = await findSalaryCategory(categoryRepository);

      if (!salaryCategory) {
        return createEmptySalaryAnalysisData(month, year);
      }

      const previousPeriod = getPreviousPeriod(month, year);
      const [
        currentTransactions,
        previousTransactions,
        economicData,
        monthlyInflationSeries,
        officialDollarSeries,
      ] = await Promise.all([
        transactionRepository.listWithFilters({
          month,
          year,
          type: 'income',
          categoryId: salaryCategory.id,
        }),
        transactionRepository.listWithFilters({
          month: previousPeriod.month,
          year: previousPeriod.year,
          type: 'income',
          categoryId: salaryCategory.id,
        }),
        economicDataRepository.getByMonthYear({ month, year }),
        safeFetchMonthlyInflationSeries(),
        safeFetchOfficialDollarSeries(),
      ]);

      const currentSalaryArs = sumTransactionAmounts(currentTransactions);
      const previousSalaryArs = sumTransactionAmounts(previousTransactions);
      const hasCurrentSalary = currentTransactions.length > 0;
      const hasPreviousSalary = previousTransactions.length > 0;
      const inflationMonthlyBasisPoints = resolveInflationMonthlyBasisPoints({
        month,
        year,
        monthlyInflationSeries,
        fallbackEconomicData: economicData,
      });
      const dollarOfficial = resolveDollarOfficial({
        currentTransactions,
        officialDollarSeries,
        fallbackEconomicData: economicData,
      });
      const nominalVariationPercentage =
        hasPreviousSalary && previousSalaryArs > 0
          ? ((currentSalaryArs - previousSalaryArs) / previousSalaryArs) * 100
          : null;
      const inflationRate =
        inflationMonthlyBasisPoints !== null
          ? inflationMonthlyBasisPoints / 10000
          : null;
      const realVariationPercentage =
        nominalVariationPercentage !== null && inflationRate !== null
          ? (((1 + nominalVariationPercentage / 100) / (1 + inflationRate)) - 1) *
            100
          : null;

      return {
        month,
        year,
        salaryCategoryId: salaryCategory.id,
        salaryCategoryFound: true,
        hasCurrentSalary,
        hasPreviousSalary,
        currentSalaryArs,
        previousSalaryArs: hasPreviousSalary ? previousSalaryArs : null,
        salaryUsd:
          hasCurrentSalary && dollarOfficial !== null && dollarOfficial > 0
            ? currentSalaryArs / dollarOfficial
            : null,
        dollarOfficial,
        inflationMonthlyBasisPoints,
        nominalVariationPercentage,
        realVariationPercentage,
      };
    },
  };
}

async function findSalaryCategory(
  repository: ReturnType<typeof createCategoryRepository>
) {
  const incomeCategories = await repository.listByType('income');

  return (
    incomeCategories.find((category) => category.id === 'income-salary' && category.active) ??
    incomeCategories.find(
      (category) => category.active && normalizeCategoryName(category.name) === 'sueldo'
    ) ??
    null
  );
}

function normalizeCategoryName(value: string) {
  return value.trim().toLocaleLowerCase('es-AR');
}

function getPreviousPeriod(month: number, year: number) {
  const date = new Date(year, month - 2, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function sumTransactionAmounts(transactions: Array<{ amount: number }>) {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

async function safeFetchMonthlyInflationSeries() {
  try {
    return await fetchMonthlyInflationSeries();
  } catch {
    return null;
  }
}

async function safeFetchOfficialDollarSeries() {
  try {
    return await fetchOfficialDollarSeries();
  } catch {
    return null;
  }
}

function resolveInflationMonthlyBasisPoints({
  month,
  year,
  monthlyInflationSeries,
  fallbackEconomicData,
}: {
  month: number;
  year: number;
  monthlyInflationSeries: MonthlyInflationPoint[] | null;
  fallbackEconomicData: EconomicData | null;
}) {
  const apiPoint = monthlyInflationSeries?.find(
    (point) => getYearMonthKey(point.fecha) === getMonthYearKey(month, year)
  );

  if (apiPoint) {
    return Math.round(apiPoint.valor * 100);
  }

  return fallbackEconomicData?.inflationMonthlyBasisPoints ?? null;
}

function resolveDollarOfficial({
  currentTransactions,
  officialDollarSeries,
  fallbackEconomicData,
}: {
  currentTransactions: Transaction[];
  officialDollarSeries: OfficialDollarQuotePoint[] | null;
  fallbackEconomicData: EconomicData | null;
}) {
  if (currentTransactions.length === 0) {
    return fallbackEconomicData?.dollarOfficial ?? null;
  }

  const weightedDollarOfficial = officialDollarSeries
    ? calculateWeightedDollarOfficial(currentTransactions, officialDollarSeries)
    : null;

  if (weightedDollarOfficial !== null) {
    return weightedDollarOfficial;
  }

  return fallbackEconomicData?.dollarOfficial ?? null;
}

function calculateWeightedDollarOfficial(
  transactions: Transaction[],
  officialDollarSeries: OfficialDollarQuotePoint[]
) {
  const quotesByDate = new Map(
    officialDollarSeries.map((quote) => [quote.fecha, quote] as const)
  );
  let weightedTotal = 0;
  let totalAmount = 0;

  for (const transaction of transactions) {
    const quote = quotesByDate.get(transaction.date);

    if (!quote || quote.venta <= 0) {
      return null;
    }

    weightedTotal += transaction.amount * Math.round(quote.venta * 100);
    totalAmount += transaction.amount;
  }

  if (totalAmount <= 0) {
    return null;
  }

  return Math.round(weightedTotal / totalAmount);
}

function getMonthYearKey(month: number, year: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getYearMonthKey(value: string) {
  return value.slice(0, 7);
}
