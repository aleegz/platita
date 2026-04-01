import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import { getUserFacingMessage } from '../../lib/errors';
import { animateNextLayout } from '../../lib/motion';
import { appStoreSelectors, useAppStore } from '../../store/app.store';
import type { MonthlyBudget } from '../../types/domain';

import { createBudgetService } from './service';
import { createEmptyBudgetsData, type BudgetsData, type UpsertBudgetInput } from './types';

type BudgetsState = {
  data: BudgetsData;
  isLoading: boolean;
  errorMessage: string | null;
  selectedMonth: number;
  selectedYear: number;
  refresh: () => Promise<void>;
};

type BudgetMutations = {
  isSubmitting: boolean;
  errorMessage: string | null;
  upsertBudget: (input: UpsertBudgetInput) => Promise<MonthlyBudget>;
};

export function useBudgets(): BudgetsState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const selectedMonth = useAppStore(appStoreSelectors.selectedMonth);
  const selectedYear = useAppStore(appStoreSelectors.selectedYear);
  const [data, setData] = useState<BudgetsData>(() =>
    createEmptyBudgetsData(selectedMonth, selectedYear)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextData = await createBudgetService(database).getBudgetsData(
        selectedMonth,
        selectedYear
      );

      animateNextLayout();
      setData(nextData);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudieron cargar los presupuestos del período.');
      setData(createEmptyBudgetsData(selectedMonth, selectedYear));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [database, isFocused, selectedMonth, selectedYear]);

  return {
    data,
    isLoading,
    errorMessage,
    selectedMonth,
    selectedYear,
    refresh,
  };
}

export function useBudgetMutations(): BudgetMutations {
  const database = useDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function upsertBudget(input: UpsertBudgetInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      return await createBudgetService(database).upsertBudget(input);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(error, 'No se pudo guardar el presupuesto.')
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    errorMessage,
    upsertBudget,
  };
}
