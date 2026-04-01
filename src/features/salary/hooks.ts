import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import { appStoreSelectors, useAppStore } from '../../store/app.store';

import { createSalaryService } from './service';
import {
  createEmptySalaryAnalysisData,
  type SalaryAnalysisData,
} from './types';

type SalaryAnalysisState = {
  data: SalaryAnalysisData;
  isLoading: boolean;
  errorMessage: string | null;
  selectedMonth: number;
  selectedYear: number;
  refresh: () => Promise<void>;
};

export function useSalaryAnalysis(): SalaryAnalysisState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const selectedMonth = useAppStore(appStoreSelectors.selectedMonth);
  const selectedYear = useAppStore(appStoreSelectors.selectedYear);
  const [data, setData] = useState<SalaryAnalysisData>(() =>
    createEmptySalaryAnalysisData(selectedMonth, selectedYear)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextData = await createSalaryService(database).getSalaryAnalysis(
        selectedMonth,
        selectedYear
      );

      setData(nextData);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo calcular el análisis salarial.');
      setData(createEmptySalaryAnalysisData(selectedMonth, selectedYear));
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
