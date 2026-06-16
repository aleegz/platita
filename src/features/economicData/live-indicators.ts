import type {
  EconomicDollarQuote,
  EconomicIndicatorPoint,
  EconomicIndicatorTrend,
} from './types';

export type DolarApiQuote = {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  moneda: string;
  fechaActualizacion: string;
};

export type DolarApiAmbitoQuote = DolarApiQuote & {
  variacion: number;
};

export function mapDolarApiQuote(input: DolarApiQuote): EconomicDollarQuote {
  return {
    moneda: input.moneda,
    casa: input.casa,
    fecha: input.fechaActualizacion,
    compra: input.compra,
    venta: input.venta,
  };
}

export function buildInterannualInflationSeries(
  points: EconomicIndicatorPoint[]
): EconomicIndicatorPoint[] {
  const sortedPoints = [...points].sort(
    (left, right) => getDateValue(left.fecha) - getDateValue(right.fecha)
  );

  if (sortedPoints.length < 12) {
    return [];
  }

  const series: EconomicIndicatorPoint[] = [];

  for (let index = 11; index < sortedPoints.length; index += 1) {
    const window = sortedPoints.slice(index - 11, index + 1);
    const latestPoint = window[window.length - 1] ?? null;

    if (!latestPoint) {
      continue;
    }

    const compoundedInflation = window.reduce(
      (accumulator, point) => accumulator * (1 + point.valor / 100),
      1
    );

    series.push({
      fecha: latestPoint.fecha,
      valor: (compoundedInflation - 1) * 100,
    });
  }

  return series;
}

export function buildTrendFromPoints(
  current: EconomicIndicatorPoint | null,
  previous: EconomicIndicatorPoint | null
): EconomicIndicatorTrend | null {
  if (!current || !previous) {
    return null;
  }

  return buildTrendFromNumbers(current.valor, previous.valor);
}

export function buildTrendFromVariation(
  variation: number | null
): EconomicIndicatorTrend | null {
  if (variation === null || Number.isNaN(variation)) {
    return null;
  }

  if (Math.abs(variation) < 0.0001) {
    return {
      direction: 'flat',
      label: '•',
      tone: 'default',
    };
  }

  return variation > 0
    ? {
        direction: 'up',
        label: '▴',
        tone: 'negative',
      }
    : {
        direction: 'down',
        label: '▾',
        tone: 'positive',
      };
}

export function buildTrendFromNumbers(
  current: number,
  previous: number
): EconomicIndicatorTrend {
  const delta = current - previous;

  if (Math.abs(delta) < 0.0001) {
    return {
      direction: 'flat',
      label: '•',
      tone: 'default',
    };
  }

  return delta > 0
    ? {
        direction: 'up',
        label: '▴',
        tone: 'negative',
      }
    : {
        direction: 'down',
        label: '▾',
        tone: 'positive',
      };
}

export function getLatestByDate<T extends { fecha: string }>(items: T[]) {
  if (items.length === 0) {
    return null;
  }

  return [...items].sort(
    (left, right) => getDateValue(right.fecha) - getDateValue(left.fecha)
  )[0] ?? null;
}

export function getPreviousByDate<T extends { fecha: string }>(items: T[]) {
  if (items.length < 2) {
    return null;
  }

  return [...items].sort(
    (left, right) => getDateValue(right.fecha) - getDateValue(left.fecha)
  )[1] ?? null;
}

function getDateValue(value: string) {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}
