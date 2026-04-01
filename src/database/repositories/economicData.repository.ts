import type {
  EconomicDataPeriodRow,
  EconomicDataRow,
  RepositoryDatabase,
} from '../../types/database';
import {
  mapEconomicDataPeriodRow,
  mapEconomicDataRow,
} from '../../types/database';
import type { EconomicData, EconomicDataPeriod } from '../../types/domain';
import type {
  GetEconomicDataByMonthYearDTO,
  UpsertEconomicDataDTO,
} from '../../types/dto';

const economicDataSelectStatement = `
  SELECT
    id,
    month,
    year,
    dollar_official,
    inflation_monthly_basis_points,
    created_at,
    updated_at
  FROM economic_data
`;

export type EconomicDataRepository = {
  upsertMonthlyEconomicData(input: UpsertEconomicDataDTO): Promise<EconomicData>;
  getByMonthYear(
    input: GetEconomicDataByMonthYearDTO
  ): Promise<EconomicData | null>;
  listPeriods(): Promise<EconomicDataPeriod[]>;
};

export function createEconomicDataRepository(
  database: RepositoryDatabase
): EconomicDataRepository {
  async function getByMonthYear(input: GetEconomicDataByMonthYearDTO) {
    const row = await database.getFirstAsync<EconomicDataRow>(
      `
        ${economicDataSelectStatement}
        WHERE month = ? AND year = ?
      `,
      [input.month, input.year]
    );

    return row ? mapEconomicDataRow(row) : null;
  }

  async function upsertMonthlyEconomicData(input: UpsertEconomicDataDTO) {
    await database.runAsync(
      `
        INSERT INTO economic_data (
          id,
          month,
          year,
          dollar_official,
          inflation_monthly_basis_points,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(month, year) DO UPDATE SET
          dollar_official = excluded.dollar_official,
          inflation_monthly_basis_points = excluded.inflation_monthly_basis_points,
          updated_at = excluded.updated_at
      `,
      [
        input.id,
        input.month,
        input.year,
        input.dollarOfficial,
        input.inflationMonthlyBasisPoints,
        input.createdAt,
        input.updatedAt,
      ]
    );

    const economicData = await getByMonthYear({
      month: input.month,
      year: input.year,
    });

    if (!economicData) {
      throw new Error(
        `Failed to load economic data for ${input.month}/${input.year}.`
      );
    }

    return economicData;
  }

  async function listPeriods() {
    const rows = await database.getAllAsync<EconomicDataPeriodRow>(
      `
        SELECT month, year
        FROM economic_data
        ORDER BY year DESC, month DESC
      `
    );

    return rows.map(mapEconomicDataPeriodRow);
  }

  return {
    upsertMonthlyEconomicData,
    getByMonthYear,
    listPeriods,
  };
}

