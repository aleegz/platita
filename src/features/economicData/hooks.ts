import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import { getUserFacingMessage } from '../../lib/errors';
import { animateNextLayout } from '../../lib/motion';
import { appStoreSelectors, useAppStore } from '../../store/app.store';
import type { EconomicData } from '../../types/domain';

import { createEmptyEconomicDataManagementData, type EconomicDataManagementData, type SaveEconomicDataInput } from './types';
import { createEconomicDataService } from './service';

type EconomicDataState = {
  data: EconomicDataManagementData;
  isLoading: boolean;
  errorMessage: string | null;
  selectedMonth: number;
  selectedYear: number;
  refresh: () => Promise<void>;
};

type EconomicDataMutations = {
  isSubmitting: boolean;
  errorMessage: string | null;
  upsertEconomicData: (input: SaveEconomicDataInput) => Promise<EconomicData>;
};

export function useEconomicData(): EconomicDataState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const selectedMonth = useAppStore(appStoreSelectors.selectedMonth);
  const selectedYear = useAppStore(appStoreSelectors.selectedYear);
  const [data, setData] = useState<EconomicDataManagementData>(() =>
    createEmptyEconomicDataManagementData(selectedMonth, selectedYear)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextData = await createEconomicDataService(database).getManagementData(
        selectedMonth,
        selectedYear
      );

      animateNextLayout();
      setData(nextData);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudieron cargar los datos económicos.');
      setData(createEmptyEconomicDataManagementData(selectedMonth, selectedYear));
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

export function useEconomicDataMutations(): EconomicDataMutations {
  const database = useDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function upsertEconomicData(input: SaveEconomicDataInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      return await createEconomicDataService(database).upsertEconomicData(input);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getUserFacingMessage(
          error,
          'No se pudieron guardar los datos económicos.'
        )
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    errorMessage,
    upsertEconomicData,
  };
}
