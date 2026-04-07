import type { CategoryRow, RepositoryDatabase } from '../../types/database';
import {
  mapCategoryRow,
  toDatabaseBoolean,
} from '../../types/database';
import type { Category, CategoryType } from '../../types/domain';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../../types/dto';

const categorySelectStatement = `
  SELECT id, name, type, active, created_at, updated_at
  FROM categories
`;

export type CategoryRepository = {
  create(input: CreateCategoryDTO): Promise<Category>;
  update(id: string, input: UpdateCategoryDTO): Promise<Category | null>;
  listAll(): Promise<Category[]>;
  listByType(type: CategoryType): Promise<Category[]>;
  listActive(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
};

export function createCategoryRepository(
  database: RepositoryDatabase
): CategoryRepository {
  async function getById(id: string) {
    const row = await database.getFirstAsync<CategoryRow>(
      `${categorySelectStatement} WHERE id = ?`,
      [id]
    );

    return row ? mapCategoryRow(row) : null;
  }

  async function create(input: CreateCategoryDTO) {
    await database.runAsync(
      `
        INSERT INTO categories (
          id,
          name,
          type,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.id,
        input.name,
        input.type,
        toDatabaseBoolean(input.active),
        input.createdAt,
        input.updatedAt,
      ]
    );

    const category = await getById(input.id);

    if (!category) {
      throw new Error(`Failed to load category ${input.id} after insert.`);
    }

    return category;
  }

  async function update(id: string, input: UpdateCategoryDTO) {
    const assignments: string[] = [];
    const parameters: Array<string | number> = [];

    if (input.name !== undefined) {
      assignments.push('name = ?');
      parameters.push(input.name);
    }

    if (input.type !== undefined) {
      assignments.push('type = ?');
      parameters.push(input.type);
    }

    if (input.active !== undefined) {
      assignments.push('active = ?');
      parameters.push(toDatabaseBoolean(input.active));
    }

    assignments.push('updated_at = ?');
    parameters.push(input.updatedAt);
    parameters.push(id);

    const result = await database.runAsync(
      `UPDATE categories SET ${assignments.join(', ')} WHERE id = ?`,
      parameters
    );

    if (result.changes === 0) {
      return null;
    }

    return getById(id);
  }

  async function listAll() {
    const rows = await database.getAllAsync<CategoryRow>(
      `${categorySelectStatement} ORDER BY type ASC, active DESC, name ASC`
    );

    return rows.map(mapCategoryRow);
  }

  async function listByType(type: CategoryType) {
    const rows = await database.getAllAsync<CategoryRow>(
      `${categorySelectStatement} WHERE type = ? ORDER BY active DESC, name ASC`,
      [type]
    );

    return rows.map(mapCategoryRow);
  }

  async function listActive() {
    const rows = await database.getAllAsync<CategoryRow>(
      `${categorySelectStatement} WHERE active = 1 ORDER BY type ASC, name ASC`
    );

    return rows.map(mapCategoryRow);
  }

  return {
    create,
    update,
    listAll,
    listByType,
    listActive,
    getById,
  };
}