import type {
  AggregateTotalRow,
  MonthlyBudgetRow,
  RepositoryDatabase,
} from '../../types/database';
import { mapMonthlyBudgetRow } from '../../types/database';
import type { MonthlyBudget } from '../../types/domain';
import type {
  GetBudgetByCategoryMonthYearDTO,
  MonthYearDTO,
  UpsertMonthlyBudgetDTO,
} from '../../types/dto';

const monthlyBudgetSelectStatement = `
  SELECT
    id,
    category_id,
    month,
    year,
    budget_amount,
    created_at,
    updated_at
  FROM monthly_budgets
`;

export type BudgetRepository = {
  upsertMonthlyBudget(input: UpsertMonthlyBudgetDTO): Promise<MonthlyBudget>;
  getBudgetsByMonthYear(input: MonthYearDTO): Promise<MonthlyBudget[]>;
  getBudgetByCategoryMonthYear(
    input: GetBudgetByCategoryMonthYearDTO
  ): Promise<MonthlyBudget | null>;
  countByCategoryId(categoryId: string): Promise<number>;
};

export function createBudgetRepository(
  database: RepositoryDatabase
): BudgetRepository {
  async function getBudgetByCategoryMonthYear(
    input: GetBudgetByCategoryMonthYearDTO
  ) {
    const row = await database.getFirstAsync<MonthlyBudgetRow>(
      `
        ${monthlyBudgetSelectStatement}
        WHERE category_id = ? AND month = ? AND year = ?
      `,
      [input.categoryId, input.month, input.year]
    );

    return row ? mapMonthlyBudgetRow(row) : null;
  }

  async function upsertMonthlyBudget(input: UpsertMonthlyBudgetDTO) {
    await database.runAsync(
      `
        INSERT INTO monthly_budgets (
          id,
          category_id,
          month,
          year,
          budget_amount,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(category_id, month, year) DO UPDATE SET
          budget_amount = excluded.budget_amount,
          updated_at = excluded.updated_at
      `,
      [
        input.id,
        input.categoryId,
        input.month,
        input.year,
        input.budgetAmount,
        input.createdAt,
        input.updatedAt,
      ]
    );

    const budget = await getBudgetByCategoryMonthYear({
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
    });

    if (!budget) {
      throw new Error(
        `Failed to load monthly budget for ${input.categoryId}/${input.month}/${input.year}.`
      );
    }

    return budget;
  }

  async function getBudgetsByMonthYear(input: MonthYearDTO) {
    const rows = await database.getAllAsync<MonthlyBudgetRow>(
      `
        ${monthlyBudgetSelectStatement}
        WHERE month = ? AND year = ?
        ORDER BY category_id ASC
      `,
      [input.month, input.year]
    );

    return rows.map(mapMonthlyBudgetRow);
  }

  async function countByCategoryId(categoryId: string) {
    const row = await database.getFirstAsync<AggregateTotalRow>(
      `
        SELECT COUNT(*) AS total
        FROM monthly_budgets
        WHERE category_id = ?
      `,
      [categoryId]
    );

    return row?.total ?? 0;
  }

  return {
    upsertMonthlyBudget,
    getBudgetsByMonthYear,
    getBudgetByCategoryMonthYear,
    countByCategoryId,
  };
}