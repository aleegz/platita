import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import { animateNextLayout } from '../../lib/motion';

import { createDashboardService } from './service';
import { createEmptyDashboardData, type DashboardData } from './types';

type DashboardState = {
  data: DashboardData;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

export function useDashboard(): DashboardState {
  const database = useDatabase();
  const isFocused = useIsFocused();
  const [data, setData] = useState<DashboardData>(() => createEmptyDashboardData());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextData = await createDashboardService(database).getDashboardData();

      animateNextLayout();
      setData(nextData);
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudo cargar el resumen principal.');
      setData(createEmptyDashboardData());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [database, isFocused]);

  return {
    data,
    isLoading,
    errorMessage,
    refresh,
  };
}
