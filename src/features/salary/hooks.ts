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

export function useSalaryAnalysisForPeriod(
  month: number,
  year: number
): SalaryAnalysisState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [data, setData] = useState<SalaryAnalysisData>(() =>
    createEmptySalaryAnalysisData(month, year)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextData = await createSalaryService(database).getSalaryAnalysis(month, year);

      setData(nextData);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo calcular el análisis salarial.');
      setData(createEmptySalaryAnalysisData(month, year));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [database, isFocused, month, year]);

  return {
    data,
    isLoading,
    errorMessage,
    selectedMonth: month,
    selectedYear: year,
    refresh,
  };
}

export function useSalaryAnalysis(): SalaryAnalysisState {
  const selectedMonth = useAppStore(appStoreSelectors.selectedMonth);
  const selectedYear = useAppStore(appStoreSelectors.selectedYear);

  return useSalaryAnalysisForPeriod(selectedMonth, selectedYear);
}
