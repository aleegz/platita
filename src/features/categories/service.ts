import { createBudgetRepository } from '../../database/repositories/budget.repository';
import { createCategoryRepository } from '../../database/repositories/category.repository';
import { createTransactionRepository } from '../../database/repositories/transaction.repository';
import { createUserFacingError } from '../../lib/errors';
import type { RepositoryDatabase } from '../../types/database';
import type { Category } from '../../types/domain';

import {
  isCategoryVisibleInCrud,
  isProtectedSystemCategoryId,
  type SaveCategoryInput,
} from './types';

export type CategoryService = {
  createCategory(input: SaveCategoryInput): Promise<Category>;
  updateCategory(id: string, input: SaveCategoryInput): Promise<Category | null>;
  listCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
};

export function createCategoryService(
  database: RepositoryDatabase
): CategoryService {
  const repository = createCategoryRepository(database);
  const transactionRepository = createTransactionRepository(database);
  const budgetRepository = createBudgetRepository(database);

  return {
    async createCategory(input) {
      const timestamp = createTimestamp();

      try {
        return await repository.create({
          id: createCategoryId(),
          name: input.name.trim(),
          type: input.type,
          active: input.active,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      } catch (error) {
        throw toCategoryUserFacingError(error);
      }
    },
    async updateCategory(id, input) {
      if (isProtectedSystemCategoryId(id)) {
        throw createUserFacingError(
          'Esta categoría forma parte del sistema y no se puede modificar desde este catálogo.'
        );
      }

      const existingCategory = await repository.getById(id);

      if (!existingCategory || !isCategoryVisibleInCrud(existingCategory)) {
        return null;
      }

      if (input.type !== existingCategory.type) {
        const [transactionCount, budgetCount] = await Promise.all([
          transactionRepository.countByCategoryId(id),
          budgetRepository.countByCategoryId(id),
        ]);

        if (transactionCount > 0 || budgetCount > 0) {
          throw createUserFacingError(
            'No puedes cambiar el tipo de una categoría que ya tiene movimientos o presupuestos.'
          );
        }
      }

      try {
        return await repository.update(id, {
          name: input.name.trim(),
          type: input.type,
          active: input.active,
          updatedAt: createTimestamp(),
        });
      } catch (error) {
        throw toCategoryUserFacingError(error);
      }
    },
    async listCategories() {
      const categories = await repository.listAll();

      return categories.filter(isCategoryVisibleInCrud);
    },
    async getCategoryById(id) {
      if (isProtectedSystemCategoryId(id)) {
        return null;
      }

      return repository.getById(id);
    },
  };
}

function createTimestamp() {
  return new Date().toISOString();
}

function createCategoryId() {
  return `category_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toCategoryUserFacingError(error: unknown) {
  if (isDuplicateCategoryError(error)) {
    return createUserFacingError(
      'Ya existe una categoría con ese nombre para el mismo tipo.'
    );
  }

  return error;
}

function isDuplicateCategoryError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return message.includes('unique') && message.includes('categories');
}