import { StyleSheet, View } from 'react-native';

import { SectionIntro, StateCard } from '../../../components';
import { SummaryCard } from '../../dashboard';
import {
  formatEconomicIndicatorDate,
  formatEconomicIndicatorMonth,
  formatEconomicIndicatorPercentage,
  formatLiveDollarMoney,
  formatMonthlyEconomicIndicatorPercentage,
  formatRiskCountryPoints,
  type LiveEconomicIndicators,
} from '../types';

type LiveEconomicIndicatorsSectionProps = {
  data: LiveEconomicIndicators;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function LiveEconomicIndicatorsSection({
  data,
  isLoading = false,
  errorMessage,
}: LiveEconomicIndicatorsSectionProps) {
  return (
    <View style={styles.section}>
      <SectionIntro
        description="Lectura rápida del contexto local para poner tus números en perspectiva."
        iconName="globe-outline"
        title="Pulso económico"
      />

      {isLoading ? (
        <StateCard
          description="Consultando inflación, dólar y riesgo país..."
          loading
          title="Actualizando indicadores"
        />
      ) : null}

      {!isLoading && errorMessage ? (
        <StateCard
          description={errorMessage}
          iconName="alert-circle-outline"
          title="No se pudo cargar el contexto económico"
          tone="error"
        />
      ) : null}

      {!isLoading && !errorMessage ? (
        <View style={styles.grid}>
          <SummaryCard
            description={
              data.monthlyInflation
                ? `Último dato: ${formatEconomicIndicatorMonth(data.monthlyInflation.fecha)}`
                : 'Sin dato disponible.'
            }
            detail={data.monthlyInflationTrend?.label}
            detailTone={data.monthlyInflationTrend?.tone}
            label="Inflación mensual"
            value={
              data.monthlyInflation
                ? formatMonthlyEconomicIndicatorPercentage(data.monthlyInflation.valor)
                : 'Sin dato'
            }
          />
          <SummaryCard
            description={
              data.interannualInflation
                ? `Calculada a ${formatEconomicIndicatorMonth(data.interannualInflation.fecha)}`
                : 'Faltan 12 meses para calcularla.'
            }
            detail={data.interannualInflationTrend?.label}
            detailTone={data.interannualInflationTrend?.tone}
            label="Inflación interanual"
            value={
              data.interannualInflation
                ? formatEconomicIndicatorPercentage(data.interannualInflation.valor)
                : 'Sin dato'
            }
          />
          <SummaryCard
            description={
              data.riskCountry
                ? `Último cierre: ${formatEconomicIndicatorDate(data.riskCountry.fecha)}`
                : 'Sin dato disponible.'
            }
            detail={data.riskCountryTrend?.label}
            detailTone={data.riskCountryTrend?.tone}
            label="Riesgo país"
            value={
              data.riskCountry
                ? formatRiskCountryPoints(data.riskCountry.valor)
                : 'Sin dato'
            }
          />
          <SummaryCard
            description={
              data.officialDollar
                ? `Última fecha: ${formatEconomicIndicatorDate(data.officialDollar.fecha)}`
                : 'Sin dato disponible.'
            }
            detail={data.officialDollarTrend?.label}
            detailTone={data.officialDollarTrend?.tone}
            label="Dólar oficial"
            value={
              data.officialDollar
                ? formatLiveDollarMoney(data.officialDollar.venta)
                : 'Sin dato'
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});