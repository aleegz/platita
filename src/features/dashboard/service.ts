import { createAccountRepository } from '../../database/repositories/account.repository';
import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import type { RepositoryDatabase } from '../../types/database';

import {
  buildAccountSnapshot,
  buildAnnualBreakdown,
  buildAnnualSummary,
  buildDashboardInsight,
  buildLifetimeSummary,
  buildMonthlyTrend,
  buildRecentActivity,
  buildTopExpenseCategories,
  calculateTotalMoneyAvailable,
} from './balance.service';
import type { DashboardData } from './types';

export type DashboardService = {
  getDashboardData(): Promise<DashboardData>;
};

export function createDashboardService(
  database: RepositoryDatabase
): DashboardService {
  const accountRepository = createAccountRepository(database);
  const categoryRepository = createCategoryRepository(database);
  const transactionRepository = createTransactionRepository(database);

  return {
    async getDashboardData() {
      const [accounts, categories, transactions] = await Promise.all([
        accountRepository.listActive(),
        categoryRepository.listActive(),
        transactionRepository.listWithFilters({}),
      ]);

      const accountSnapshots = accounts.map((account) =>
        buildAccountSnapshot(account, transactions)
      );
      const totalMoneyAvailable = calculateTotalMoneyAvailable(accountSnapshots);
      const lifetimeSummary = buildLifetimeSummary(transactions);
      const annualBreakdown = buildAnnualBreakdown(transactions);
      const monthlyTrend = buildMonthlyTrend(transactions);
      const categoryNamesById = new Map(
        categories.map((category) => [category.id, category.name])
      );
      const accountNamesById = new Map(
        accounts.map((account) => [account.id, account.name])
      );

      return {
        totalMoneyAvailable,
        activeAccountsCount: accountSnapshots.length,
        accountSnapshots,
        lifetimeSummary,
        annualSummary: buildAnnualSummary(annualBreakdown),
        annualBreakdown,
        monthlyTrend,
        topExpenseCategories: buildTopExpenseCategories(
          transactions,
          categoryNamesById
        ),
        recentActivity: buildRecentActivity(
          transactions,
          accountNamesById,
          categoryNamesById
        ),
        insight: buildDashboardInsight({
          activeAccountsCount: accountSnapshots.length,
          totalMoneyAvailable,
          lifetimeSummary,
          monthlyTrend,
        }),
      };
    },
  };
}
