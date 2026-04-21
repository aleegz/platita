import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatDashboardMoney, formatDashboardPercentage } from '../../dashboard';
import { colors } from '../../../theme';

import type { MonthlyAnalysisData } from '../types';

type MonthlyOverviewSectionProps = {
  data: MonthlyAnalysisData;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

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
            <View style={styles.heroLabelRow}>
              <View style={styles.heroLabelIcon}>
                <Ionicons color={colors.text} name="analytics-outline" size={14} />
              </View>
              <Text style={styles.periodLabel}>Saldo</Text>
            </View>
            <View style={styles.balancePill}>
              <Ionicons color={colors.muted} name="calendar-outline" size={13} />
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
          <PrimaryMetricCard
            iconName="arrow-down-circle-outline"
            label="Ingresos"
            value={formatDashboardMoney(data.income)}
          />
          <PrimaryMetricCard
            iconName="arrow-up-circle-outline"
            label="Gastos"
            tone="muted"
            value={formatDashboardMoney(data.expense)}
          />
          <PrimaryMetricCard
            iconName="sparkles-outline"
            label="Rendimientos"
            tone="accent"
            value={data.yield > 0 ? formatDashboardMoney(data.yield) : 'Sin rendimientos'}
          />
        </View>

        <View style={styles.secondaryCard}>
          <View style={styles.secondaryHeader}>
            <Text style={styles.secondaryTitle}>Lectura rápida</Text>
          </View>

          <View style={styles.metricGroup}>
            <MetricRow
              iconName="pie-chart-outline"
              isFirst
              detail={data.savingsRate !== null ? 'del flujo positivo' : 'sin base suficiente'}
              label="Tasa de ahorro"
              value={formatDashboardPercentage(data.savingsRate)}
            />
            <MetricRow
              iconName="wallet-outline"
              detail={data.savingsAmount !== null ? 'saldo a favor' : 'sin excedente'}
              label="Ahorro"
              value={savingsValue}
            />
            <MetricRow
              iconName="receipt-outline"
              detail={positiveFlow > 0 ? 'sobre ingresos + rendimientos' : 'sin referencia'}
              label="Peso del gasto"
              value={expenseShare}
            />
            <MetricRow
              iconName="pricetag-outline"
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
  iconName,
  label,
  tone = 'default',
  value,
}: {
  iconName: IconName;
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
      <View style={styles.primaryMetricHeader}>
        <View style={styles.primaryMetricIcon}>
          <Ionicons color={colors.text} name={iconName} size={16} />
        </View>
        <Text style={styles.primaryMetricLabel}>{label}</Text>
      </View>
      <Text style={styles.primaryMetricValue}>{value}</Text>
    </View>
  );
}

function MetricRow({
  detail,
  iconName,
  isFirst = false,
  label,
  value,
}: {
  detail?: string;
  iconName: IconName;
  isFirst?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.metricRow, isFirst ? styles.metricRowFirst : null]}>
      <View style={styles.metricCopy}>
        <View style={styles.metricLabelRow}>
          <View style={styles.metricIcon}>
            <Ionicons color={colors.muted} name={iconName} size={15} />
          </View>
          <Text style={styles.metricLabel}>{label}</Text>
        </View>
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  card: {
    borderRadius: 36,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  heroCard: {
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroLabelIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBlock: {
    gap: 8,
  },
  periodLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.1,
  },
  balanceValuePositive: {
    color: colors.text,
  },
  balanceValueNegative: {
    color: '#FFD6D2',
  },
  balanceNarrative: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryMetricCard: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  primaryMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryMetricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryMetricCardMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  primaryMetricCardAccent: {
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
  },
  primaryMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryMetricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  secondaryCard: {
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  secondaryHeader: {
    gap: 2,
  },
  secondaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  metricGroup: {
    gap: 0,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  metricCopy: {
    flex: 1,
    gap: 3,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: colors.text,
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'right',
  },
});
