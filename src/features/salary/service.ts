import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createEconomicDataRepository } from '../../database/repositories/economicData.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import type { RepositoryDatabase } from '../../types/database';

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
      const [currentTransactions, previousTransactions, economicData] =
        await Promise.all([
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
        ]);

      const currentSalaryArs = sumTransactionAmounts(currentTransactions);
      const previousSalaryArs = sumTransactionAmounts(previousTransactions);
      const hasCurrentSalary = currentTransactions.length > 0;
      const hasPreviousSalary = previousTransactions.length > 0;
      const nominalVariationPercentage =
        hasPreviousSalary && previousSalaryArs > 0
          ? ((currentSalaryArs - previousSalaryArs) / previousSalaryArs) * 100
          : null;
      const inflationRate =
        economicData !== null
          ? economicData.inflationMonthlyBasisPoints / 10000
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
          hasCurrentSalary &&
          economicData !== null &&
          economicData.dollarOfficial > 0
            ? currentSalaryArs / economicData.dollarOfficial
            : null,
        dollarOfficial: economicData?.dollarOfficial ?? null,
        inflationMonthlyBasisPoints:
          economicData?.inflationMonthlyBasisPoints ?? null,
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
    incomeCategories.find(
      (category) => category.active && normalizeCategoryName(category.name) === 'sueldo'
    ) ?? null
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
