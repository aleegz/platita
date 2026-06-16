import {
  buildInterannualInflationSeries,
  buildTrendFromNumbers,
  buildTrendFromPoints,
  buildTrendFromVariation,
  getLatestByDate,
  getPreviousByDate,
  mapDolarApiQuote,
} from './live-indicators';

function createPoint(fecha: string, valor: number) {
  return { fecha, valor };
}

describe('economic live indicator helpers', () => {
  it('builds interannual inflation with 12-month compounding over sorted input', () => {
    const points = [
      createPoint('2025-03-01', 1),
      createPoint('2024-07-01', 1),
      createPoint('2024-11-01', 1),
      createPoint('2024-04-01', 1),
      createPoint('2024-10-01', 1),
      createPoint('2025-01-01', 1),
      createPoint('2024-05-01', 1),
      createPoint('2024-12-01', 1),
      createPoint('2024-08-01', 1),
      createPoint('2024-09-01', 1),
      createPoint('2025-02-01', 1),
      createPoint('2024-06-01', 1),
    ];

    const [entry] = buildInterannualInflationSeries(points);

    expect(entry?.fecha).toBe('2025-03-01');
    expect(entry?.valor ?? 0).toBeCloseTo(12.6825, 4);
  });

  it('returns no interannual values when there are fewer than 12 points', () => {
    expect(
      buildInterannualInflationSeries([
        createPoint('2025-01-01', 2),
        createPoint('2025-02-01', 2),
      ])
    ).toEqual([]);
  });

  it('builds up, down and flat trends from numbers and optional points', () => {
    expect(buildTrendFromNumbers(10, 8)).toEqual({
      direction: 'up',
      label: '▴',
      tone: 'negative',
    });
    expect(buildTrendFromNumbers(8, 10)).toEqual({
      direction: 'down',
      label: '▾',
      tone: 'positive',
    });
    expect(buildTrendFromPoints(createPoint('2025-02-01', 10), createPoint('2025-01-01', 10))).toEqual({
      direction: 'flat',
      label: '•',
      tone: 'default',
    });
    expect(buildTrendFromPoints(createPoint('2025-02-01', 10), null)).toBeNull();
  });

  it('builds trends from variation and ignores null or NaN values', () => {
    expect(buildTrendFromVariation(0)).toEqual({
      direction: 'flat',
      label: '•',
      tone: 'default',
    });
    expect(buildTrendFromVariation(1.25)).toEqual({
      direction: 'up',
      label: '▴',
      tone: 'negative',
    });
    expect(buildTrendFromVariation(-0.5)).toEqual({
      direction: 'down',
      label: '▾',
      tone: 'positive',
    });
    expect(buildTrendFromVariation(null)).toBeNull();
    expect(buildTrendFromVariation(Number.NaN)).toBeNull();
  });

  it('selects latest and previous points by date regardless of input order', () => {
    const points = [
      createPoint('2025-01-01', 1),
      createPoint('2025-03-01', 3),
      createPoint('2025-02-01', 2),
    ];

    expect(getLatestByDate(points)).toEqual(createPoint('2025-03-01', 3));
    expect(getPreviousByDate(points)).toEqual(createPoint('2025-02-01', 2));
    expect(getPreviousByDate([createPoint('2025-03-01', 3)])).toBeNull();
  });

  it('maps dollar api payloads to the domain quote shape', () => {
    expect(
      mapDolarApiQuote({
        compra: 1111,
        venta: 1234,
        casa: 'oficial',
        nombre: 'Oficial',
        moneda: 'ARS',
        fechaActualizacion: '2026-06-16T10:00:00.000Z',
      })
    ).toEqual({
      compra: 1111,
      venta: 1234,
      casa: 'oficial',
      moneda: 'ARS',
      fecha: '2026-06-16T10:00:00.000Z',
    });
  });
});
