import { createEconomicDataRepository } from '../../database/repositories/economicData.repository';
import type { EconomicData } from '../../types/domain';
import type { RepositoryDatabase } from '../../types/database';

import { createEconomicDataService } from './service';

jest.mock('../../database/repositories/economicData.repository', () => ({
  createEconomicDataRepository: jest.fn(),
}));

const mockedCreateEconomicDataRepository = jest.mocked(createEconomicDataRepository);

function createEntry(overrides: Partial<EconomicData> = {}): EconomicData {
  return {
    id: 'economic_data_1',
    month: 6,
    year: 2026,
    dollarOfficial: 120000,
    inflationMonthlyBasisPoints: 250,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('createEconomicDataService', () => {
  const database = {} as RepositoryDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns current entry and filters missing historical periods', async () => {
    const currentEntry = createEntry({ id: 'current', month: 6, year: 2026 });
    const aprilEntry = createEntry({ id: 'april', month: 4, year: 2026 });
    const repository = {
      getByMonthYear: jest.fn(async ({ month, year }: { month: number; year: number }) => {
        if (month === 6 && year === 2026) {
          return currentEntry;
        }

        if (month === 4 && year === 2026) {
          return aprilEntry;
        }

        return null;
      }),
      listPeriods: jest.fn().mockResolvedValue([
        { month: 4, year: 2026 },
        { month: 5, year: 2026 },
        { month: 6, year: 2026 },
      ]),
      upsertMonthlyEconomicData: jest.fn(),
    };

    mockedCreateEconomicDataRepository.mockReturnValue(repository as never);

    const result = await createEconomicDataService(database).getManagementData(6, 2026);

    expect(result).toEqual({
      month: 6,
      year: 2026,
      currentEntry,
      entries: [aprilEntry, currentEntry],
    });
  });

  it('preserves id and createdAt when updating an existing period', async () => {
    const existingEntry = createEntry({
      id: 'economic_data_existing',
      createdAt: '2026-05-01T00:00:00.000Z',
    });
    const repository = {
      getByMonthYear: jest.fn().mockResolvedValue(existingEntry),
      listPeriods: jest.fn(),
      upsertMonthlyEconomicData: jest.fn().mockImplementation(async (input) => input),
    };

    mockedCreateEconomicDataRepository.mockReturnValue(repository as never);

    const result = await createEconomicDataService(database).upsertEconomicData({
      month: 6,
      year: 2026,
      dollarOfficial: 130000,
      inflationMonthlyBasisPoints: 300,
    });

    expect(repository.upsertMonthlyEconomicData).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'economic_data_existing',
        createdAt: '2026-05-01T00:00:00.000Z',
        month: 6,
        year: 2026,
        dollarOfficial: 130000,
        inflationMonthlyBasisPoints: 300,
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'economic_data_existing',
        createdAt: '2026-05-01T00:00:00.000Z',
      })
    );
  });
});
