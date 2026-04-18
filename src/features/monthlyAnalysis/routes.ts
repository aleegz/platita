import type { Href } from 'expo-router';

export function createMonthlyAnalysisRoute(year: number, month: number): Href {
  return `/analysis/monthly/${year}/${month}` as Href;
}
