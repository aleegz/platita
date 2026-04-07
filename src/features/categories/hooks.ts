import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import {
  createUserFacingError,
  getUserFacingMessage,
} from '../../lib/errors';
import { animateNextLayout } from '../../lib/motion';
import type { Category } from '../../types/domain';

import { createCategoryService } from './service';
import type { SaveCategoryInput } from './types';

type CategoriesState = {
  categories: Category[];
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

type CategoryState = {
  category: Category | null;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

type CategoryMutations = {
  isSubmitting: boolean;
  errorMessage: string | null;
  createCategory: (input: SaveCategoryInput) => Promise<Category>;
  updateCategory: (id: string, input: SaveCategoryInput) => Promise<Category>;
};

export function useCategories(): CategoriesState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextCategories = await createCategoryService(database).listCategories();

      animateNextLayout();
      setCategories(nextCategories);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudieron cargar las categorías.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [isFocused, database]);

  return {
    categories,
    isLoading,
    errorMessage,
    refresh,
  };
}

export function useCategory(categoryId?: string): CategoryState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(categoryId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    if (!categoryId) {
      animateNextLayout();
      setCategory(null);
      setErrorMessage('No se encontró la categoría solicitada.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextCategory = await createCategoryService(database).getCategoryById(
        categoryId
      );

      if (!nextCategory) {
        animateNextLayout();
        setCategory(null);
        setErrorMessage('La categoría ya no existe o no está disponible.');
        return;
      }

      animateNextLayout();
      setCategory(nextCategory);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudo cargar la categoría.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [categoryId, isFocused, database]);

  return {
    category,
    isLoading,
    errorMessage,
    refresh,
  };
}

export function useCategoryMutations(): CategoryMutations {
  const database = useDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function createCategory(input: SaveCategoryInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      return await createCategoryService(database).createCategory(input);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(error, 'No se pudo guardar la categoría.')
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateCategory(id: string, input: SaveCategoryInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const category = await createCategoryService(database).updateCategory(id, input);

      if (!category) {
        throw createUserFacingError(
          'La categoría ya no existe o no está disponible.'
        );
      }

      return category;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(error, 'No se pudo actualizar la categoría.')
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    errorMessage,
    createCategory,
    updateCategory,
  };
}