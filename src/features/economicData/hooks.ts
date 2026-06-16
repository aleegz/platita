import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useDatabase } from '../../database/client/provider';
import { getUserFacingMessage } from '../../lib/errors';
import { animateNextLayout } from '../../lib/motion';
import { appStoreSelectors, useAppStore } from '../../store/app.store';
import type { EconomicData } from '../../types/domain';

import {
  createEmptyEconomicDataManagementData,
  createEmptyLiveEconomicIndicators,
  type EconomicDataManagementData,
  type EconomicIndicatorPoint,
  type LiveEconomicIndicators,
  type SaveEconomicDataInput,
} from './types';
import {
  buildInterannualInflationSeries,
  buildTrendFromPoints,
  buildTrendFromVariation,
  getLatestByDate,
  getPreviousByDate,
  mapDolarApiQuote,
  type DolarApiAmbitoQuote,
  type DolarApiQuote,
} from './live-indicators';
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

type LiveEconomicIndicatorsState = {
  data: LiveEconomicIndicators;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

const inflationEndpoint =
  'https://api.argentinadatos.com/v1/finanzas/indices/inflacion';
const riskCountrySeriesEndpoint =
  'https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais';
const riskCountryLatestEndpoint =
  'https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo';
const officialDollarEndpoint =
  'https://dolarapi.com/v1/dolares/oficial';
const officialDollarTrendEndpoint =
  'https://dolarapi.com/v1/ambito/dolares/oficial';

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

export function useLiveEconomicIndicators(): LiveEconomicIndicatorsState {
  const isFocused = useIsFocused();
  const [data, setData] = useState<LiveEconomicIndicators>(() =>
    createEmptyLiveEconomicIndicators()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        monthlyInflationSeries,
        riskCountrySeries,
        riskCountryLatest,
        officialDollarQuote,
        officialDollarTrendQuote,
      ] = await Promise.all([
        fetchJson<EconomicIndicatorPoint[]>(inflationEndpoint),
        fetchOptionalJson<EconomicIndicatorPoint[]>(riskCountrySeriesEndpoint),
        fetchJson<EconomicIndicatorPoint>(riskCountryLatestEndpoint),
        fetchJson<DolarApiQuote>(officialDollarEndpoint),
        fetchOptionalJson<DolarApiAmbitoQuote>(officialDollarTrendEndpoint),
      ]);
      const interannualInflationSeries = buildInterannualInflationSeries(
        monthlyInflationSeries
      );
      const latestMonthlyInflation = getLatestByDate(monthlyInflationSeries);
      const previousMonthlyInflation = getPreviousByDate(monthlyInflationSeries);
      const latestInterannualInflation =
        interannualInflationSeries[interannualInflationSeries.length - 1] ?? null;
      const previousInterannualInflation =
        interannualInflationSeries[interannualInflationSeries.length - 2] ?? null;
      const latestRiskCountry = getLatestByDate(riskCountrySeries ?? []) ?? riskCountryLatest;
      const previousRiskCountry = getPreviousByDate(riskCountrySeries ?? []);

      animateNextLayout();
      setData({
        monthlyInflation: latestMonthlyInflation,
        interannualInflation: latestInterannualInflation,
        monthlyInflationTrend: buildTrendFromPoints(
          latestMonthlyInflation,
          previousMonthlyInflation
        ),
        interannualInflationTrend: buildTrendFromPoints(
          latestInterannualInflation,
          previousInterannualInflation
        ),
        riskCountry: latestRiskCountry,
        riskCountryTrend: buildTrendFromPoints(
          latestRiskCountry,
          previousRiskCountry
        ),
        officialDollar: mapDolarApiQuote(officialDollarQuote),
        officialDollarTrend: buildTrendFromVariation(
          officialDollarTrendQuote?.variacion ?? null
        ),
      });
    } catch (error) {
      console.error(error);
      animateNextLayout();
      setErrorMessage('No se pudieron cargar los indicadores económicos en vivo.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refresh();
  }, [isFocused]);

  return {
    data,
    isLoading,
    errorMessage,
    refresh,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchOptionalJson<T>(url: string): Promise<T | null> {
  try {
    return await fetchJson<T>(url);
  } catch {
    return null;
  }
}
