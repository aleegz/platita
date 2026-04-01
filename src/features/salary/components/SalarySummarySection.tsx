import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SummaryCard } from '../../dashboard';
import { colors } from '../../../theme';
import { useSalaryAnalysis } from '../hooks';
import {
  formatSalaryMoneyArs,
  formatSalaryMoneyUsd,
  formatSalaryPercentage,
} from '../types';

export function SalarySummarySection() {
  const { data, errorMessage, isLoading } = useSalaryAnalysis();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Análisis salarial</Text>

      {isLoading ? (
        <View style={styles.infoCard}>
          <ActivityIndicator color={colors.text} size="small" />
          <Text style={styles.infoCardText}>Calculando sueldo del período...</Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorCardText}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          <View style={styles.summaryGrid}>
            <SummaryCard
              description="Ingresos con categoría Sueldo."
              label="Sueldo en ARS"
              tone={data.hasCurrentSalary ? 'positive' : 'default'}
              value={
                data.hasCurrentSalary
                  ? formatSalaryMoneyArs(data.currentSalaryArs)
                  : 'Sin sueldo'
              }
            />
            <SummaryCard
              description="Conversión usando dólar oficial del período."
              label="Sueldo en USD"
              tone={data.salaryUsd !== null ? 'positive' : 'default'}
              value={
                data.salaryUsd !== null
                  ? formatSalaryMoneyUsd(data.salaryUsd)
                  : 'Sin dato'
              }
            />
            <SummaryCard
              description="Comparación nominal contra el mes anterior."
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
            <SummaryCard
              description="Ajustada por inflación mensual del período."
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

          {!data.salaryCategoryFound ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                No existe una categoría activa llamada Sueldo. El análisis salarial
                usará exclusivamente esa categoría cuando esté disponible.
              </Text>
            </View>
          ) : null}

          {data.salaryCategoryFound && !data.hasCurrentSalary ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                No hay movimientos de sueldo cargados en el período seleccionado.
              </Text>
            </View>
          ) : null}

          {data.hasCurrentSalary && data.salaryUsd === null ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Falta cargar el dólar oficial del período para calcular el sueldo en USD.
              </Text>
            </View>
          ) : null}

          {data.hasCurrentSalary && data.inflationMonthlyBasisPoints === null ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Falta cargar la inflación mensual del período para calcular la variación real.
              </Text>
            </View>
          ) : null}

          {data.hasCurrentSalary && !data.hasPreviousSalary ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                No hay sueldo del mes anterior para comparar la variación salarial.
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 10,
  },
  infoCardText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: 16,
    backgroundColor: colors.surfaceError,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorCardText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noteText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
