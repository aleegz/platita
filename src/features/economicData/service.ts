import { createEconomicDataRepository } from '../../database/repositories/economicData.repository';
import type { RepositoryDatabase } from '../../types/database';
import type { EconomicData } from '../../types/domain';

import type {
  EconomicDataManagementData,
  SaveEconomicDataInput,
} from './types';

export type EconomicDataService = {
  getManagementData(
    month: number,
    year: number
  ): Promise<EconomicDataManagementData>;
  upsertEconomicData(input: SaveEconomicDataInput): Promise<EconomicData>;
};

export function createEconomicDataService(
  database: RepositoryDatabase
): EconomicDataService {
  const repository = createEconomicDataRepository(database);

  return {
    async getManagementData(month, year) {
      const [currentEntry, periods] = await Promise.all([
        repository.getByMonthYear({ month, year }),
        repository.listPeriods(),
      ]);

      const entries = await Promise.all(
        periods.map(async (period) =>
          repository.getByMonthYear({
            month: period.month,
            year: period.year,
          })
        )
      );

      return {
        month,
        year,
        currentEntry,
        entries: entries.filter((entry): entry is EconomicData => entry !== null),
      };
    },
    async upsertEconomicData(input) {
      const existingEntry = await repository.getByMonthYear({
        month: input.month,
        year: input.year,
      });
      const timestamp = createTimestamp();

      return repository.upsertMonthlyEconomicData({
        id: existingEntry?.id ?? createEconomicDataId(),
        month: input.month,
        year: input.year,
        dollarOfficial: input.dollarOfficial,
        inflationMonthlyBasisPoints: input.inflationMonthlyBasisPoints,
        createdAt: existingEntry?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
    },
  };
}

function createTimestamp() {
  return new Date().toISOString();
}

function createEconomicDataId() {
  return `economic_data_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
