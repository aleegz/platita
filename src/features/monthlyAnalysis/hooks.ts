import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';

import { createMonthlyAnalysisService } from './service';
import {
  createEmptyMonthlyAnalysisData,
  type MonthlyAnalysisData,
} from './types';

type MonthlyAnalysisState = {
  data: MonthlyAnalysisData;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

export function useMonthlyAnalysis(
  month: number,
  year: number
): MonthlyAnalysisState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [data, setData] = useState<MonthlyAnalysisData>(() =>
    createEmptyMonthlyAnalysisData(month, year)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextData = await createMonthlyAnalysisService(database).getMonthlyAnalysis(
        month,
        year
      );

      setData(nextData);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo cargar el análisis mensual.');
      setData(createEmptyMonthlyAnalysisData(month, year));
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
    refresh,
  };
}
