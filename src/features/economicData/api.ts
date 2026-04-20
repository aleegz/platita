type MonthlyInflationPoint = {
  fecha: string;
  valor: number;
};

type OfficialDollarQuotePoint = {
  casa: string;
  compra: number;
  venta: number;
  fecha: string;
};

const inflationEndpoint =
  'https://api.argentinadatos.com/v1/finanzas/indices/inflacion';
const officialDollarHistoryEndpoint =
  'https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial';

let monthlyInflationSeriesPromise: Promise<MonthlyInflationPoint[]> | null = null;
let officialDollarSeriesPromise: Promise<OfficialDollarQuotePoint[]> | null = null;

export type { MonthlyInflationPoint, OfficialDollarQuotePoint };

export function fetchMonthlyInflationSeries() {
  if (!monthlyInflationSeriesPromise) {
    monthlyInflationSeriesPromise = fetchJson<MonthlyInflationPoint[]>(inflationEndpoint).catch(
      (error) => {
        monthlyInflationSeriesPromise = null;
        throw error;
      }
    );
  }

  return monthlyInflationSeriesPromise;
}

export function fetchOfficialDollarSeries() {
  if (!officialDollarSeriesPromise) {
    officialDollarSeriesPromise = fetchJson<OfficialDollarQuotePoint[]>(
      officialDollarHistoryEndpoint
    ).catch((error) => {
      officialDollarSeriesPromise = null;
      throw error;
    });
  }

  return officialDollarSeriesPromise;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
