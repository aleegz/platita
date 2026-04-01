import { create } from 'zustand';

import type { SelectedPeriod } from '../types/store';

export type AppStoreState = {
  selectedMonth: number;
  selectedYear: number;
  appLoaded: boolean;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setSelectedPeriod: (month: number, year: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  markAppAsLoaded: () => void;
  resetAppLoaded: () => void;
};

const initialPeriod = getCurrentPeriod();

export const useAppStore = create<AppStoreState>((set) => ({
  selectedMonth: initialPeriod.month,
  selectedYear: initialPeriod.year,
  appLoaded: false,
  setSelectedMonth: (month) =>
    set((state) => {
      const nextPeriod = normalizePeriod(month, state.selectedYear);

      return {
        selectedMonth: nextPeriod.month,
        selectedYear: nextPeriod.year,
      };
    }),
  setSelectedYear: (year) =>
    set((state) => {
      const nextPeriod = normalizePeriod(state.selectedMonth, year);

      return {
        selectedMonth: nextPeriod.month,
        selectedYear: nextPeriod.year,
      };
    }),
  setSelectedPeriod: (month, year) => {
    const nextPeriod = normalizePeriod(month, year);

    set({
      selectedMonth: nextPeriod.month,
      selectedYear: nextPeriod.year,
    });
  },
  goToPreviousMonth: () =>
    set((state) => {
      const nextPeriod = normalizePeriod(
        state.selectedMonth - 1,
        state.selectedYear
      );

      return {
        selectedMonth: nextPeriod.month,
        selectedYear: nextPeriod.year,
      };
    }),
  goToNextMonth: () =>
    set((state) => {
      const nextPeriod = normalizePeriod(
        state.selectedMonth + 1,
        state.selectedYear
      );

      return {
        selectedMonth: nextPeriod.month,
        selectedYear: nextPeriod.year,
      };
    }),
  markAppAsLoaded: () => set({ appLoaded: true }),
  resetAppLoaded: () => set({ appLoaded: false }),
}));

export const appStoreSelectors = {
  selectedMonth: (state: AppStoreState) => state.selectedMonth,
  selectedYear: (state: AppStoreState) => state.selectedYear,
  appLoaded: (state: AppStoreState) => state.appLoaded,
  selectedPeriod: (state: AppStoreState) => ({
    month: state.selectedMonth,
    year: state.selectedYear,
  }),
} as const;

function getCurrentPeriod(): SelectedPeriod {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function normalizePeriod(month: number, year: number): SelectedPeriod {
  const normalizedDate = new Date(year, month - 1, 1);

  return {
    month: normalizedDate.getMonth() + 1,
    year: normalizedDate.getFullYear(),
  };
}

