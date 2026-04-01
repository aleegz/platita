type NumberFormatter = {
  format: (value: number) => string;
};

type CurrencyFormatterOptions = {
  locale?: string;
  currency: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export function createCurrencyFormatter({
  locale = 'es-AR',
  currency,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
}: CurrencyFormatterOptions): NumberFormatter {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });
  } catch {
    return {
      format(value: number) {
        return `${currency} ${value.toFixed(maximumFractionDigits)}`;
      },
    };
  }
}
