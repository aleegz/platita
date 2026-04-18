import { StyleSheet, Text, View } from 'react-native';

import {
  formatDashboardMoney,
  formatDashboardPercentage,
  formatDashboardPeriod,
} from '../../dashboard';
import { colors } from '../../../theme';

import type { MonthlyAnalysisData } from '../types';

type MonthlyOverviewSectionProps = {
  data: MonthlyAnalysisData;
};

export function MonthlyOverviewSection({ data }: MonthlyOverviewSectionProps) {
  const positiveFlow = data.income + data.yield;
  const expenseShare =
    positiveFlow > 0 ? formatDashboardPercentage(data.expenseVsIncomePercentage) : 'Sin base';
  const savingsValue =
    data.savingsAmount !== null ? formatDashboardMoney(data.savingsAmount) : 'Sin ahorro';
  const largestExpenseCategory = data.topExpenseCategories[0] ?? null;
  const balanceTone =
    data.balance > 0
      ? styles.balanceValuePositive
      : data.balance < 0
        ? styles.balanceValueNegative
        : null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Panorama del período</Text>
        <Text style={styles.title}>Tu mes, de un vistazo</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.periodLabel}>{formatDashboardPeriod(data.month, data.year)}</Text>
            <View style={styles.balancePill}>
              <Text style={styles.balancePillText}>Balance del mes</Text>
            </View>
          </View>

          <View style={styles.summaryBlock}>
            <Text style={[styles.balanceValue, balanceTone]}>
              {formatDashboardMoney(data.balance)}
            </Text>
            <Text style={styles.balanceNarrative}>{getBalanceNarrative(data)}</Text>
          </View>
        </View>

        <View style={styles.primaryMetricsRow}>
          <PrimaryMetricCard label="Ingresos" value={formatDashboardMoney(data.income)} />
          <PrimaryMetricCard
            label="Gastos"
            tone="muted"
            value={formatDashboardMoney(data.expense)}
          />
          <PrimaryMetricCard
            label="Rendimientos"
            tone="accent"
            value={data.yield > 0 ? formatDashboardMoney(data.yield) : 'Sin rendimientos'}
          />
        </View>

        <View style={styles.secondaryCard}>
          <View style={styles.secondaryHeader}>
            <Text style={styles.secondaryTitle}>Lectura rápida</Text>
            <Text style={styles.secondaryDescription}>
              Métricas útiles para entender cómo cerró el período.
            </Text>
          </View>

          <View style={styles.metricGroup}>
            <MetricRow
              isFirst
              detail={data.savingsRate !== null ? 'del flujo positivo' : 'sin base suficiente'}
              label="Tasa de ahorro"
              value={formatDashboardPercentage(data.savingsRate)}
            />
            <MetricRow
              detail={data.savingsAmount !== null ? 'saldo a favor' : 'sin excedente'}
              label="Ahorro"
              value={savingsValue}
            />
            <MetricRow
              detail={positiveFlow > 0 ? 'sobre ingresos + rendimientos' : 'sin referencia'}
              label="Peso del gasto"
              value={expenseShare}
            />
            <MetricRow
              detail={largestExpenseCategory ? 'categoría con más peso' : 'sin categoría dominante'}
              label="Categoría principal"
              value={largestExpenseCategory?.name ?? 'Sin datos'}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function PrimaryMetricCard({
  label,
  tone = 'default',
  value,
}: {
  label: string;
  tone?: 'default' | 'muted' | 'accent';
  value: string;
}) {
  return (
    <View
      style={[
        styles.primaryMetricCard,
        tone === 'muted' ? styles.primaryMetricCardMuted : null,
        tone === 'accent' ? styles.primaryMetricCardAccent : null,
      ]}
    >
      <Text style={styles.primaryMetricLabel}>{label}</Text>
      <Text style={styles.primaryMetricValue}>{value}</Text>
    </View>
  );
}

function MetricRow({
  detail,
  isFirst = false,
  label,
  value,
}: {
  detail?: string;
  isFirst?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.metricRow, isFirst ? styles.metricRowFirst : null]}>
      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
        {detail ? <Text style={styles.metricDetail}>{detail}</Text> : null}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getBalanceNarrative(data: MonthlyAnalysisData) {
  if (!data.hasActivity) {
    return 'Todavía no hay movimientos en este período.';
  }

  if (data.balance > 0) {
    return 'Cerró con margen a favor.';
  }

  if (data.balance < 0) {
    return 'Cerró con más salida que entrada.';
  }

  return 'Cerró prácticamente en equilibrio.';
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
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  card: {
    borderRadius: 32,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 14,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryBlock: {
    gap: 8,
  },
  periodLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  balancePill: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  balancePillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.4,
  },
  balanceValuePositive: {
    color: colors.text,
  },
  balanceValueNegative: {
    color: '#FFD6D2',
  },
  balanceNarrative: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryMetricCard: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 24,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  primaryMetricCardMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  primaryMetricCardAccent: {
    backgroundColor: colors.surfaceAccent,
  },
  primaryMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryMetricValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  secondaryCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  secondaryHeader: {
    gap: 4,
  },
  secondaryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  secondaryDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  metricGroup: {
    gap: 0,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  metricCopy: {
    flex: 1,
    gap: 3,
  },
  metricLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  metricDetail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  metricValue: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'right',
  },
});
