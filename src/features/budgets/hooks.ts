import { useEffect, useState } from 'react';

import { useDatabase } from '../../database/client/provider';
import { getUserFacingMessage } from '../../lib/errors';
import { animateNextLayout } from '../../lib/motion';
import { appStoreSelectors, useAppStore } from '../../store/app.store';
import {
  domainInvalidationStoreSelectors,
  useDomainInvalidationStore,
} from '../../store/domain-invalidation.store';
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
  const selectedMonth = useAppStore(appStoreSelectors.selectedMonth);
  const selectedYear = useAppStore(appStoreSelectors.selectedYear);
  const budgetsVersion = useDomainInvalidationStore(
    domainInvalidationStoreSelectors.budgetsVersion
  );
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
    void refresh();
  }, [database, budgetsVersion, selectedMonth, selectedYear]);

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
  const invalidateBudgets = useDomainInvalidationStore(
    (state) => state.invalidateBudgets
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function upsertBudget(input: UpsertBudgetInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const budget = await createBudgetService(database).upsertBudget(input);

      invalidateBudgets();

      return budget;
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
