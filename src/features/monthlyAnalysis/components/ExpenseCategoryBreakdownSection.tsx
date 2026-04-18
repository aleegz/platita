import { StyleSheet, Text, View } from 'react-native';

import {
  formatDashboardMoney,
  formatDashboardPercentage,
  formatDashboardPeriod,
} from '../../dashboard';
import { colors } from '../../../theme';

import type { MonthlyAnalysisData } from '../types';

type ExpenseCategoryBreakdownSectionProps = {
  data: MonthlyAnalysisData;
};

export function ExpenseCategoryBreakdownSection({
  data,
}: ExpenseCategoryBreakdownSectionProps) {
  const listedShare = data.topExpenseCategories.reduce((total, item) => total + item.share, 0);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Categorías de gasto</Text>
        <Text style={styles.title}>En qué se fue el mes</Text>
        <Text style={styles.description}>{formatDashboardPeriod(data.month, data.year)}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <SummaryMetric label="Gasto total" value={formatDashboardMoney(data.expense)} />
          <SummaryMetric label="Categorías" value={String(data.expenseCategoryCount)} />
          <SummaryMetric label="Cobertura top" value={formatDashboardPercentage(listedShare * 100)} />
        </View>

        {data.expense <= 0 || data.topExpenseCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Todavía no hay gastos para desglosar.</Text>
            <Text style={styles.emptyDescription}>
              Cuando aparezcan movimientos, vas a ver cuáles concentran más peso.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {data.topExpenseCategories.map((item, index) => {
              const width = `${Math.max(item.share * 100, 8)}%` as const;

              return (
                <View key={`${item.categoryId ?? 'none'}-${index}`} style={styles.rowCard}>
                  <View style={styles.rowHeader}>
                    <View style={styles.rowCopy}>
                      <Text style={styles.categoryName}>{item.name}</Text>
                      <Text style={styles.categoryMeta}>
                        {formatDashboardPercentage(item.share * 100)} del gasto mensual
                      </Text>
                    </View>

                    <Text style={styles.categoryAmount}>{formatDashboardMoney(item.totalAmount)}</Text>
                  </View>

                  <View style={styles.track}>
                    <View style={[styles.trackFill, { width }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
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
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 32,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 14,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryMetric: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 24,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  emptyState: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
  rowCard: {
    borderRadius: 24,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  categoryMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  categoryAmount: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: -0.2,
  },
  track: {
    overflow: 'hidden',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  trackFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
});
