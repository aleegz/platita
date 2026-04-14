import type {
  ComponentProps,
  ReactNode,
} from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  View,
} from 'react-native';

import { SectionIntro, SkeletonBlock } from '../../components';
import { colors } from '../../theme';

export function DashboardHeroSkeleton() {
  return (
    <View style={[styles.heroCard, styles.heroCardNeutral]}>
      <View style={styles.heroTopRow}>
        <SkeletonBlock height={32} style={styles.heroBadgeSkeleton} width="42%" />
        <SkeletonBlock height={32} style={styles.heroAccountsSkeleton} width={118} />
      </View>

      <View style={styles.heroValueBlock}>
        <SkeletonBlock height={12} width="30%" />
        <SkeletonBlock height={36} width="64%" />
        <SkeletonBlock height={24} width="48%" />
        <SkeletonBlock height={14} width="92%" />
        <SkeletonBlock height={14} width="70%" />
      </View>

      <View style={styles.heroMetricsRow}>
        {Array.from({ length: 2 }).map((_, index) => (
          <View key={index} style={styles.heroMetricCard}>
            <SkeletonBlock height={32} style={styles.heroMetricIcon} width={32} />
            <View style={styles.heroMetricCopy}>
              <SkeletonBlock height={12} width="50%" />
              <SkeletonBlock height={18} width="72%" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function DashboardSectionsSkeleton() {
  return (
    <>
      <View style={styles.section}>
        <SectionIntro
          description="Indicadores clave para leer si tu sistema financiero está respirando bien."
          iconName="apps-outline"
          title="Radar general"
        />
        <View style={styles.metricGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <SkeletonBlock height={34} style={styles.metricCardIcon} width={34} />
                <SkeletonBlock height={12} width="40%" />
              </View>
              <SkeletonBlock height={26} width="62%" />
              <SkeletonBlock height={12} width="92%" />
              <SkeletonBlock height={12} width="70%" />
            </View>
          ))}
        </View>
      </View>

      <DashboardChartSkeleton
        description="Lectura anual detallada con relación de gasto, dinero a favor y tendencia mensual."
        iconName="stats-chart-outline"
        title="Análisis anual"
      >
        <View style={styles.chartMetricGrid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.chartMetricCard}>
              <SkeletonBlock height={12} width="52%" />
              <SkeletonBlock height={22} width="72%" />
            </View>
          ))}
        </View>
        <View style={styles.chartSurface}>
          <View style={styles.annualBarsRow}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.annualBarColumn}>
                <SkeletonBlock height={84 - index * 8} style={styles.annualBar} width={10} />
                <SkeletonBlock height={10} width={26} />
              </View>
            ))}
          </View>
        </View>
      </DashboardChartSkeleton>

      <DashboardChartSkeleton
        description="Así se reparte hoy tu saldo entre las cuentas activas."
        iconName="wallet-outline"
        title="Distribución por cuentas"
      >
        <View style={styles.accountDistributionCard}>
          <View style={styles.accountDistributionCircle}>
            <View style={styles.accountDistributionInnerCircle}>
              <SkeletonBlock height={14} width={72} />
              <SkeletonBlock height={24} width={88} />
            </View>
          </View>
          <View style={styles.accountLegend}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.accountLegendRow}>
                <SkeletonBlock height={10} style={styles.legendDot} width={10} />
                <View style={styles.accountLegendCopy}>
                  <SkeletonBlock height={12} width="58%" />
                  <SkeletonBlock height={12} width="34%" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </DashboardChartSkeleton>

      <DashboardChartSkeleton
        description="Lectura compacta de los últimos 6 meses para detectar aceleraciones o caídas."
        iconName="bar-chart-outline"
        title="Tendencia reciente"
      >
        <View style={styles.chartSurface}>
          <View style={styles.trendColumns}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.trendColumn}>
                <SkeletonBlock height={56 + ((index % 3) + 1) * 16} style={styles.trendBar} width={18} />
                <SkeletonBlock height={10} width={24} />
              </View>
            ))}
          </View>
        </View>
      </DashboardChartSkeleton>

      <DashboardChartSkeleton
        description="Categorías que hoy tienen más peso dentro del gasto acumulado."
        iconName="pricetags-outline"
        title="Focos de gasto"
      >
        <View style={styles.chartSurface}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.expenseRow}>
              <View style={styles.expenseRowCopy}>
                <SkeletonBlock height={12} width="44%" />
                <SkeletonBlock height={12} width="24%" />
              </View>
              <SkeletonBlock height={10} style={styles.expenseBar} width={`${92 - index * 14}%`} />
            </View>
          ))}
        </View>
      </DashboardChartSkeleton>

      <DashboardChartSkeleton
        description="Lo último que se movió en tu sistema financiero local."
        iconName="time-outline"
        title="Última actividad"
      >
        <View style={styles.activityCard}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.activityRow}>
              <SkeletonBlock height={38} style={styles.activityIcon} width={38} />
              <View style={styles.activityCopy}>
                <SkeletonBlock height={14} width="52%" />
                <SkeletonBlock height={12} width="82%" />
              </View>
              <View style={styles.activityMeta}>
                <SkeletonBlock height={14} width={72} />
                <SkeletonBlock height={12} width={52} />
              </View>
            </View>
          ))}
        </View>
      </DashboardChartSkeleton>
    </>
  );
}

type DashboardChartSkeletonProps = {
  iconName: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  children: ReactNode;
};

function DashboardChartSkeleton({
  iconName,
  title,
  description,
  children,
}: DashboardChartSkeletonProps) {
  return (
    <View style={styles.section}>
      <SectionIntro description={description} iconName={iconName} title={title} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  heroCard: {
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 18,
  },
  heroCardNeutral: {
    backgroundColor: colors.surface,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroBadgeSkeleton: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroAccountsSkeleton: {
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  heroValueBlock: {
    gap: 8,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroMetricCard: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroMetricIcon: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroMetricCopy: {
    flex: 1,
    gap: 8,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricCardIcon: {
    borderRadius: 17,
    backgroundColor: colors.surfaceAccent,
  },
  chartMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chartMetricCard: {
    flex: 1,
    minWidth: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },
  chartSurface: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },
  annualBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 120,
  },
  annualBarColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  annualBar: {
    borderRadius: 999,
  },
  accountDistributionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 18,
    alignItems: 'center',
  },
  accountDistributionCircle: {
    width: 208,
    height: 208,
    borderRadius: 104,
    borderWidth: 24,
    borderColor: colors.surfaceAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDistributionInnerCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  accountLegend: {
    width: '100%',
    gap: 12,
  },
  accountLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAccent,
  },
  accountLegendCopy: {
    flex: 1,
    gap: 8,
  },
  trendColumns: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 132,
  },
  trendColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  trendBar: {
    borderRadius: 999,
  },
  expenseRow: {
    gap: 10,
  },
  expenseRowCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  expenseBar: {
    borderRadius: 999,
  },
  activityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  activityIcon: {
    borderRadius: 19,
    backgroundColor: colors.surfaceAccent,
  },
  activityCopy: {
    flex: 1,
    gap: 8,
  },
  activityMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
});
