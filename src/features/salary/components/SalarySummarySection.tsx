import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme';
import { useSalaryAnalysisForPeriod } from '../hooks';
import {
  formatSalaryMoneyArs,
  formatSalaryMoneyUsd,
  formatSalaryPercentage,
} from '../types';

type SalarySummarySectionProps = {
  month: number;
  year: number;
  title?: string | null;
};

export function SalarySummarySection({
  month,
  year,
  title = null,
}: SalarySummarySectionProps) {
  const { data, errorMessage, isLoading } = useSalaryAnalysisForPeriod(month, year);

  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Análisis salarial</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.infoCard}>
          <ActivityIndicator color={colors.text} size="small" />
          <Text style={styles.infoCardText}>Calculando resumen salarial…</Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorCardText}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage ? (
        <View style={styles.card}>
          <View style={styles.summaryGrid}>
            <SalaryMetricCard
              label="Sueldo en ARS"
              tone={data.hasCurrentSalary ? 'positive' : 'default'}
              value={
                data.hasCurrentSalary
                  ? formatSalaryMoneyArs(data.currentSalaryArs)
                  : 'Sin sueldo'
              }
            />
            <SalaryMetricCard
              label="Sueldo en USD"
              tone={data.salaryUsd !== null ? 'positive' : 'default'}
              value={
                data.salaryUsd !== null
                  ? formatSalaryMoneyUsd(data.salaryUsd)
                  : 'Sin dato'
              }
            />
            <SalaryMetricCard
              label="Variación nominal"
              tone={
                data.nominalVariationPercentage === null
                  ? 'default'
                  : data.nominalVariationPercentage >= 0
                    ? 'positive'
                    : 'negative'
              }
              value={formatSalaryPercentage(data.nominalVariationPercentage)}
            />
            <SalaryMetricCard
              label="Variación real"
              tone={
                data.realVariationPercentage === null
                  ? 'default'
                  : data.realVariationPercentage >= 0
                    ? 'positive'
                    : 'negative'
              }
              value={formatSalaryPercentage(data.realVariationPercentage)}
            />
          </View>

          <View style={styles.notesGroup}>
            {!data.salaryCategoryFound ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>
                  Falta una categoría activa llamada Sueldo para usar este análisis.
                </Text>
              </View>
            ) : null}

            {data.salaryCategoryFound && !data.hasCurrentSalary ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>No hay movimientos de sueldo en este período.</Text>
              </View>
            ) : null}

            {data.hasCurrentSalary && data.salaryUsd === null ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>Falta el dólar oficial para calcular USD.</Text>
              </View>
            ) : null}

            {data.hasCurrentSalary && data.inflationMonthlyBasisPoints === null ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>Falta la inflación mensual para calcular la variación real.</Text>
              </View>
            ) : null}

            {data.hasCurrentSalary && !data.hasPreviousSalary ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>Todavía no hay sueldo previo para comparar.</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SalaryMetricCard({
  label,
  tone = 'default',
  value,
}: {
  label: string;
  tone?: 'default' | 'positive' | 'negative';
  value: string;
}) {
  return (
    <View
      style={[
        styles.metricCard,
        tone === 'positive' ? styles.metricCardPositive : null,
        tone === 'negative' ? styles.metricCardNegative : null,
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          tone === 'positive'
            ? styles.metricValuePositive
            : tone === 'negative'
              ? styles.metricValueNegative
              : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  card: {
    borderRadius: 36,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  metricCardPositive: {
    backgroundColor: 'rgba(48, 209, 88, 0.08)',
  },
  metricCardNegative: {
    backgroundColor: 'rgba(255, 105, 97, 0.08)',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  metricValuePositive: {
    color: colors.success,
  },
  metricValueNegative: {
    color: colors.danger,
  },
  infoCard: {
    borderRadius: 30,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  infoCardText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: 30,
    backgroundColor: 'rgba(255, 105, 97, 0.12)',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  errorCardText: {
    color: '#FFD6D2',
    fontSize: 14,
    lineHeight: 20,
  },
  notesGroup: {
    gap: 10,
  },
  noteCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noteText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
