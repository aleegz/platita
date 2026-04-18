import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import {
  ActionButton,
  Screen,
  SectionIntro,
  StateCard,
} from '../../components';
import { getAccountTypeLabel, isCreditAccountType } from '../../features/accounts';
import {
  LiveEconomicIndicatorsSection,
  useLiveEconomicIndicators,
} from '../../features/economicData';
import {
  DashboardHeroSkeleton,
  DashboardSectionsSkeleton,
  formatDashboardMoney,
  formatDashboardPercentage,
  type DashboardAccountSnapshot,
  type DashboardAnnualPoint,
  type DashboardAnnualSummary,
  type DashboardRecentActivity,
  type DashboardTopExpenseCategory,
  type DashboardTrendPoint,
  useDashboard,
} from '../../features/dashboard';
import {
  createMonthlyAnalysisRoute,
} from '../../features/monthlyAnalysis';
import {
  formatTransactionDate,
  getTransactionAmountPrefix,
} from '../../features/transactions';
import { useUserProfile } from '../../features/settings';
import { colors } from '../../theme';
import logo from '../../../assets/logo.png';

type IconName = ComponentProps<typeof Ionicons>['name'];

const accountDistributionColors = [
  '#0A84FF',
  '#5AC8FA',
  '#30D158',
  '#FFD60A',
  '#FF9F0A',
  '#FF375F',
  '#64D2FF',
  '#BF5AF2',
] as const;
const accountPieSize = 208;
const accountPieStrokeWidth = 24;
const accountPieRadius = (accountPieSize - accountPieStrokeWidth) / 2;
const accountPieCircumference = 2 * Math.PI * accountPieRadius;
const accountPieGap = 4;
const accountPieCenterSize = 144;
const accountPieCenterInset = (accountPieSize - accountPieCenterSize) / 2;

export default function HomeScreen() {
  const { data, errorMessage, isLoading } = useDashboard();
  const {
    data: liveEconomicIndicators,
    errorMessage: liveEconomicIndicatorsErrorMessage,
    isLoading: isLiveEconomicIndicatorsLoading,
  } = useLiveEconomicIndicators();
  const { profile } = useUserProfile();
  const displayName = profile?.displayName ?? 'Usuario';

  return (
    <Screen headerHidden topInset>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader displayName={displayName} />

        {isLoading ? (
          <DashboardHeroSkeleton />
        ) : (
          <HeroCard
            activeAccountsCount={data.activeAccountsCount}
            balance={data.lifetimeSummary.balance}
            insightDescription={data.insight.description}
            insightTitle={data.insight.title}
            savingsRate={data.lifetimeSummary.savingsRate}
            tone={data.insight.tone}
            totalMoneyAvailable={data.totalMoneyAvailable}
          />
        )}

        <LiveEconomicIndicatorsSection
          data={liveEconomicIndicators}
          errorMessage={liveEconomicIndicatorsErrorMessage}
          isLoading={isLiveEconomicIndicatorsLoading}
        />

        {isLoading ? <DashboardSectionsSkeleton /> : null}

        {!isLoading && errorMessage ? (
          <StateCard
            description={errorMessage}
            iconName="alert-circle-outline"
            title="No se pudo cargar el inicio"
            tone="error"
          />
        ) : null}

        {!isLoading && !errorMessage ? (
          <>
            <View style={styles.section}>
              <SectionHeader
                description="Indicadores clave para leer si tu sistema financiero está respirando bien."
                iconName="apps-outline"
                title="Radar general"
              />
              <View style={styles.metricGrid}>
                <OverviewMetricCard
                  description="Entradas acumuladas registradas."
                  iconName="arrow-down-circle-outline"
                  label="Ingresos"
                  tone="positive"
                  value={formatDashboardMoney(data.lifetimeSummary.income)}
                />
                <OverviewMetricCard
                  description="Salidas acumuladas registradas."
                  iconName="arrow-up-circle-outline"
                  label="Gastos"
                  tone="negative"
                  value={formatDashboardMoney(data.lifetimeSummary.expense)}
                />
                <OverviewMetricCard
                  description="Retornos y ganancias financieras."
                  iconName="sparkles-outline"
                  label="Rendimientos"
                  tone="positive"
                  value={formatDashboardMoney(data.lifetimeSummary.yield)}
                />
                <OverviewMetricCard
                  description="Balance neto sobre ingresos y rendimientos."
                  iconName="pie-chart-outline"
                  label="Tasa de ahorro"
                  tone="default"
                  value={formatDashboardPercentage(data.lifetimeSummary.savingsRate)}
                />
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader
                description="Lectura anual detallada con relación de gasto, dinero a favor y tendencia mensual."
                iconName="stats-chart-outline"
                title="Análisis anual"
              />
              {data.annualSummary.income > 0 ||
              data.annualSummary.expense > 0 ||
              data.annualSummary.yield > 0 ? (
                <AnnualAnalysisSection
                  points={data.annualBreakdown}
                  summary={data.annualSummary}
                />
              ) : (
                <EmptyStateCard
                  description="Cuando cargues ingresos y gastos suficientes, aquí vas a tener una lectura anual completa."
                  iconName="stats-chart-outline"
                  title="Todavía no hay análisis anual"
                />
              )}
            </View>

            <View style={styles.section}>
              <SectionHeader
                description="Así se reparte hoy tu saldo entre las cuentas activas."
                iconName="wallet-outline"
                title="Distribución por cuentas"
              />
              {data.accountSnapshots.length > 0 ? (
                <AccountAllocationChart accounts={data.accountSnapshots} />
              ) : (
                <EmptyStateCard
                  description="Cuando cargues cuentas y movimientos, aquí vas a ver dónde está concentrado tu dinero."
                  iconName="wallet-outline"
                  title="Todavía no hay cuentas para distribuir"
                />
              )}
            </View>

            <View style={styles.section}>
              <SectionHeader
                description="Lectura compacta de los últimos 6 meses para detectar aceleraciones o caídas."
                iconName="bar-chart-outline"
                title="Tendencia reciente"
              />
              {data.monthlyTrend.length > 0 ? (
                <TrendChart points={data.monthlyTrend} />
              ) : (
                <EmptyStateCard
                  description="Sin movimientos registrados no hay una tendencia para dibujar todavía."
                  iconName="bar-chart-outline"
                  title="Todavía no hay tendencia"
                />
              )}
            </View>

            <View style={styles.section}>
              <SectionHeader
                description="Categorías que hoy tienen más peso dentro del gasto acumulado."
                iconName="pricetags-outline"
                title="Focos de gasto"
              />
              {data.topExpenseCategories.length > 0 ? (
                <ExpenseBreakdownChart items={data.topExpenseCategories} />
              ) : (
                <EmptyStateCard
                  description="Registra algunos gastos y esta vista te mostrará rápidamente dónde se te va más plata."
                  iconName="pricetags-outline"
                  title="Todavía no hay focos detectados"
                />
              )}
            </View>

            <View style={styles.section}>
              <SectionHeader
                description="Lo último que se movió en tu sistema financiero local."
                iconName="time-outline"
                title="Última actividad"
              />
              {data.recentActivity.length > 0 ? (
                <RecentActivityList items={data.recentActivity} />
              ) : (
                <EmptyStateCard
                  description="Tus ingresos, gastos, transferencias y rendimientos recientes aparecerán aquí."
                  iconName="time-outline"
                  title="Todavía no hay actividad"
                />
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function WelcomeHeader({ displayName }: { displayName: string }) {
  return (
    <View style={styles.welcomeHeader}>
      <View style={styles.welcomeEyebrow}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.text}>Inicio</Text>
      </View>
      <Text style={styles.welcomeTitle}>Hola, {displayName}</Text>
      <Text style={styles.welcomeDescription}>
        Este es tu panorama global para entrar, entender y decidir rápido.
      </Text>
    </View>
  );
}

type HeroCardProps = {
  totalMoneyAvailable: number;
  balance: number;
  activeAccountsCount: number;
  savingsRate: number | null;
  insightTitle: string;
  insightDescription: string;
  tone: 'positive' | 'warning' | 'neutral';
};

function HeroCard({
  totalMoneyAvailable,
  balance,
  activeAccountsCount,
  savingsRate,
  insightTitle,
  insightDescription,
  tone,
}: HeroCardProps) {
  const toneStyles =
    tone === 'positive'
      ? styles.heroCardPositive
      : tone === 'warning'
        ? styles.heroCardWarning
        : styles.heroCardNeutral;
  const badgeIcon = tone === 'positive' ? 'sparkles-outline' : tone === 'warning' ? 'alert-circle-outline' : 'scan-outline';
  const badgeLabel = tone === 'positive' ? 'Panorama ordenado' : tone === 'warning' ? 'Atención temprana' : 'Visión central';

  return (
    <View style={[styles.heroCard, toneStyles]}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroBadge}>
          <Ionicons color={colors.text} name={badgeIcon} size={16} />
          <Text style={styles.heroBadgeText}>{badgeLabel}</Text>
        </View>
        <View style={styles.heroAccountsPill}>
          <Ionicons color={colors.muted} name="layers-outline" size={14} />
          <Text style={styles.heroAccountsText}>
            {activeAccountsCount} {activeAccountsCount === 1 ? 'cuenta activa' : 'cuentas activas'}
          </Text>
        </View>
      </View>

      <View style={styles.heroValueBlock}>
        <Text style={styles.heroLabel}>Patrimonio disponible</Text>
        <Text style={styles.heroValue}>{formatDashboardMoney(totalMoneyAvailable)}</Text>
        <Text style={styles.heroTitle}>{insightTitle}</Text>
        <Text style={styles.heroDescription}>{insightDescription}</Text>
      </View>

      <View style={styles.heroMetricsRow}>
        <HeroMetric
          iconName="pulse-outline"
          label="Balance neto"
          value={formatDashboardMoney(balance)}
        />
        <HeroMetric
          iconName="pie-chart-outline"
          label="Ahorro"
          value={formatDashboardPercentage(savingsRate)}
        />
      </View>
    </View>
  );
}

type HeroMetricProps = {
  iconName: IconName;
  label: string;
  value: string;
};

function HeroMetric({ iconName, label, value }: HeroMetricProps) {
  return (
    <View style={styles.heroMetricCard}>
      <View style={styles.heroMetricIcon}>
        <Ionicons color={colors.text} name={iconName} size={16} />
      </View>
      <View style={styles.heroMetricCopy}>
        <Text style={styles.heroMetricLabel}>{label}</Text>
        <Text style={styles.heroMetricValue}>{value}</Text>
      </View>
    </View>
  );
}

type SectionHeaderProps = {
  iconName: IconName;
  title: string;
  description: string;
};

function SectionHeader({ iconName, title, description }: SectionHeaderProps) {
  return (
    <SectionIntro
      description={description}
      iconName={iconName}
      title={title}
    />
  );
}

type OverviewMetricCardProps = {
  iconName: IconName;
  label: string;
  value: string;
  description: string;
  tone: 'default' | 'positive' | 'negative';
};

function OverviewMetricCard({
  iconName,
  label,
  value,
  description,
  tone,
}: OverviewMetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricCardHeader}>
        <View style={styles.metricCardIcon}>
          <Ionicons color={colors.text} name={iconName} size={18} />
        </View>
        <Text style={styles.metricCardLabel}>{label}</Text>
      </View>
      <Text
        style={[
          styles.metricCardValue,
          tone === 'positive'
            ? styles.metricCardValuePositive
            : tone === 'negative'
              ? styles.metricCardValueNegative
              : null,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.metricCardDescription}>{description}</Text>
    </View>
  );
}

type AnnualAnalysisSectionProps = {
  summary: DashboardAnnualSummary;
  points: DashboardAnnualPoint[];
};

function AnnualAnalysisSection({
  summary,
  points,
}: AnnualAnalysisSectionProps) {
  const router = useRouter();
  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 116;
  const resolvedChartWidth = chartWidth > 0 ? chartWidth : 320;
  const slotWidth = resolvedChartWidth / Math.max(points.length, 1);
  const barWidth = Math.min(Math.max(slotWidth * 0.26, 6), 10);
  const barGap = Math.min(Math.max(slotWidth * 0.12, 2), 6);
  const maxBarValue = Math.max(
    ...points.flatMap((point) => [point.income, point.expense]),
    1
  );
  const lineMin = Math.min(...points.map((point) => point.cumulativeBalance), 0);
  const lineMax = Math.max(...points.map((point) => point.cumulativeBalance), 0);
  const lineRange = Math.max(lineMax - lineMin, 1);
  const pointPositions = points.map((point, index) => {
    const x = index * slotWidth + slotWidth / 2;
    const ratio = (point.cumulativeBalance - lineMin) / lineRange;
    const y = chartHeight - ratio * chartHeight;

    return {
      x,
      y,
    };
  });

  function handleChartLayout(event: LayoutChangeEvent) {
    const nextWidth = Math.max(
      Math.round(event.nativeEvent.layout.width),
      0
    );

    setChartWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.annualHeader}>
        <View style={styles.annualHeaderCopy}>
          <Text style={styles.annualLabel}>Lectura del año</Text>
          <Text style={styles.annualTitle}>Balance anual</Text>
          <Text style={styles.annualDescription}>
            Compara ingresos y egresos por mes, mientras la línea marca la tendencia acumulada.
          </Text>
        </View>
        <View style={styles.annualYearPill}>
          <Ionicons color={colors.text} name="calendar-outline" size={14} />
          <Text style={styles.annualYearText}>{summary.year}</Text>
        </View>
      </View>

      <View style={styles.annualMetricGrid}>
        <AnnualMetricCard
          iconName="arrow-down-circle-outline"
          label="Ingresos"
          tone="positive"
          value={formatDashboardMoney(summary.income)}
        />
        <AnnualMetricCard
          iconName="arrow-up-circle-outline"
          label="Egresos"
          tone="negative"
          value={formatDashboardMoney(summary.expense)}
        />
        <AnnualMetricCard
          iconName="pulse-outline"
          label="Dinero a favor"
          tone={summary.moneyInFavor >= 0 ? 'positive' : 'negative'}
          value={formatDashboardMoney(summary.moneyInFavor)}
        />
        <AnnualMetricCard
          iconName="pie-chart-outline"
          label="Gasto sobre ingresos"
          value={formatDashboardPercentage(summary.expenseVsIncomePercentage)}
        />
      </View>

      <ActionButton
        compact
        iconName="calendar-outline"
        label="Ver análisis mensual"
        onPress={() => {
          const entryPoint = getAnnualAnalysisEntryPoint(points, summary.year);

          router.push(createMonthlyAnalysisRoute(entryPoint.year, entryPoint.month));
        }}
        style={styles.annualActionButton}
        variant="secondary"
      />

      <View style={styles.annualLegend}>
        <LegendDot color={colors.success} label="Ingresos" />
        <LegendDot color={colors.danger} label="Egresos" />
        <LegendDot color={colors.warning} label="Tendencia" />
      </View>

      <View style={styles.annualChartCard}>
        <View onLayout={handleChartLayout} style={styles.annualChartFrame}>
          <View style={[styles.annualChart, { width: resolvedChartWidth }]}>
            {pointPositions.map((point, index) => {
              const nextPoint = pointPositions[index + 1];

              if (!nextPoint) {
                return null;
              }

              const deltaX = nextPoint.x - point.x;
              const deltaY = nextPoint.y - point.y;
              const width = Math.sqrt(deltaX ** 2 + deltaY ** 2);
              const angle = `${Math.atan2(deltaY, deltaX)}rad` as const;

              return (
                <View
                  key={`line-${points[index]?.month ?? index}`}
                  style={[
                    styles.annualLineSegment,
                    {
                      left: point.x + deltaX / 2 - width / 2,
                      top: point.y + deltaY / 2 - 1,
                      width,
                      transform: [{ rotate: angle }],
                    },
                  ]}
                />
              );
            })}

            {points.map((point, index) => {
              const incomeHeight = Math.max(
                (point.income / maxBarValue) * chartHeight,
                point.income > 0 ? 10 : 0
              );
              const expenseHeight = Math.max(
                (point.expense / maxBarValue) * chartHeight,
                point.expense > 0 ? 10 : 0
              );
              const marker = pointPositions[index];
              const performance = getAnnualPointPerformance(point);

              return (
                <Pressable
                  accessibilityHint={`Abrir análisis mensual de ${point.label} ${point.year}`}
                  accessibilityRole="button"
                  key={`${point.year}-${point.month}`}
                  onPress={() =>
                    router.push(createMonthlyAnalysisRoute(point.year, point.month))
                  }
                  style={[
                    styles.annualColumn,
                    {
                      left: index * slotWidth,
                      width: slotWidth,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.annualBars,
                      {
                        gap: barGap,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.annualBar,
                        styles.annualIncomeBar,
                        {
                          height: incomeHeight,
                          width: barWidth,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.annualBar,
                        styles.annualExpenseBar,
                        {
                          height: expenseHeight,
                          width: barWidth,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.annualMonthLabel}>{point.label}</Text>
                  <Text
                    style={[
                      styles.annualMonthValue,
                      performance > 0
                        ? styles.annualMonthValuePositive
                        : performance < 0
                          ? styles.annualMonthValueNegative
                          : null,
                    ]}
                  >
                    {formatSignedPercentage(performance)}
                  </Text>
                  <View
                    style={[
                      styles.annualMarker,
                      {
                        left: slotWidth / 2 - 4,
                        top: marker.y - 4,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

type AnnualMetricCardProps = {
  iconName: IconName;
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
};

function AnnualMetricCard({
  iconName,
  label,
  value,
  tone = 'default',
}: AnnualMetricCardProps) {
  return (
    <View style={styles.annualMetricCard}>
      <View style={styles.annualMetricHeader}>
        <View style={styles.annualMetricIcon}>
          <Ionicons color={colors.text} name={iconName} size={16} />
        </View>
        <Text style={styles.annualMetricLabel}>{label}</Text>
      </View>
      <Text
        style={[
          styles.annualMetricValue,
          tone === 'positive'
            ? styles.metricCardValuePositive
            : tone === 'negative'
              ? styles.metricCardValueNegative
              : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function getAnnualAnalysisEntryPoint(
  points: DashboardAnnualPoint[],
  fallbackYear: number
) {
  const activePoint = [...points]
    .reverse()
    .find((point) => point.income > 0 || point.expense > 0 || point.yield > 0);

  if (activePoint) {
    return activePoint;
  }

  return {
    month: 1,
    year: fallbackYear,
  };
}

type AccountAllocationChartProps = {
  accounts: DashboardAccountSnapshot[];
};

function AccountAllocationChart({ accounts }: AccountAllocationChartProps) {
  const positiveAccounts = [...accounts]
    .filter((account) => account.currentBalance > 0 && !isCreditAccountType(account.type))
    .sort((left, right) => right.currentBalance - left.currentBalance);
  const pieSlices = buildAccountDistributionSlices(positiveAccounts);
  const maxBalance = Math.max(
    ...accounts.map((account) => Math.abs(account.currentBalance)),
    1
  );
  const totalBalance = Math.max(
    positiveAccounts.reduce((total, account) => total + account.currentBalance, 0),
    1
  );
  const accountColorById = new Map(
    pieSlices.map((slice) => [slice.id, slice.color] as const)
  );

  return (
    <View style={styles.chartCard}>
      <View style={styles.accountChartIntro}>
        <View style={styles.accountPie}>
          <Svg
            height={accountPieSize}
            style={styles.accountPieSvg}
            width={accountPieSize}
          >
            <Circle
              cx={accountPieSize / 2}
              cy={accountPieSize / 2}
              fill="none"
              r={accountPieRadius}
              stroke={colors.surfaceAccent}
              strokeWidth={accountPieStrokeWidth}
            />
            {pieSlices.map((slice) => (
              <Circle
                key={`account-slice-${slice.id}`}
                cx={accountPieSize / 2}
                cy={accountPieSize / 2}
                fill="none"
                r={accountPieRadius}
                rotation={-90}
                origin={`${accountPieSize / 2}, ${accountPieSize / 2}`}
                stroke={slice.color}
                strokeDasharray={`${slice.strokeLength} ${accountPieCircumference}`}
                strokeDashoffset={-slice.strokeOffset}
                strokeWidth={accountPieStrokeWidth}
              />
            ))}
          </Svg>
          <View style={styles.accountPieCenter}>
            <Text style={styles.accountPieLabel}>Total</Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              numberOfLines={1}
              style={styles.accountPieValue}
            >
              {positiveAccounts.length > 0
                ? formatDashboardMoney(totalBalance)
                : 'Sin saldo'}
            </Text>
          </View>
        </View>
        <Text style={styles.accountChartHint}>
          {positiveAccounts.length > 0
            ? 'El gráfico muestra cómo se reparte el dinero disponible entre tus cuentas con saldo positivo.'
            : 'Todavía no hay saldo positivo para dibujar la distribución circular.'}
        </Text>
      </View>

      {accounts.map((account) => {
        const share =
          account.currentBalance > 0 && !isCreditAccountType(account.type)
            ? account.currentBalance / totalBalance
            : 0;
        const trackRatio =
          account.currentBalance > 0
            ? share
            : Math.abs(account.currentBalance) / maxBalance;
        const width =
          trackRatio > 0
            ? (`${Math.max(trackRatio * 100, 12)}%` as const)
            : ('0%' as const);
        const accentColor =
          account.currentBalance > 0
            ? (accountColorById.get(account.id) ?? colors.success)
            : account.currentBalance < 0
              ? colors.danger
              : colors.border;

        return (
          <View key={account.id} style={styles.accountRow}>
            <View style={styles.accountRowHeader}>
              <View style={[styles.accountBadge, { backgroundColor: `${accentColor}22` }]}>
                <Ionicons
                  color={accentColor}
                  name={getAccountIconName(account.type)}
                  size={18}
                />
              </View>
              <View style={styles.accountCopy}>
                <View style={styles.accountNameRow}>
                  <View style={[styles.accountDot, { backgroundColor: accentColor }]} />
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <Text style={styles.accountMeta}>
                  {getAccountDistributionMeta(account, share)}
                </Text>
              </View>
              <Text style={styles.accountBalance}>
                {formatDashboardMoney(account.currentBalance)}
              </Text>
            </View>
            <View style={styles.accountTrack}>
              <View
                style={[
                  styles.accountFill,
                  {
                    width,
                    backgroundColor: accentColor,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

type AccountDistributionSlice = {
  id: string;
  color: string;
  share: number;
  strokeLength: number;
  strokeOffset: number;
};

function buildAccountDistributionSlices(accounts: DashboardAccountSnapshot[]) {
  const totalBalance = accounts.reduce(
    (total, account) => total + Math.max(account.currentBalance, 0),
    0
  );

  if (totalBalance <= 0) {
    return [] satisfies AccountDistributionSlice[];
  }

  let currentOffset = 0;

  return accounts.map((account, index) => {
    const share = Math.max(account.currentBalance, 0) / totalBalance;
    const rawStrokeLength = share * accountPieCircumference;
    const strokeLength = Math.max(rawStrokeLength - accountPieGap, 0);
    const slice: AccountDistributionSlice = {
      id: account.id,
      color: accountDistributionColors[index % accountDistributionColors.length] ?? colors.accent,
      share,
      strokeLength,
      strokeOffset: currentOffset,
    };

    currentOffset += rawStrokeLength;

    return slice;
  });
}

function getAccountDistributionMeta(
  account: DashboardAccountSnapshot,
  share: number
) {
  const accountTypeLabel = getAccountTypeLabel(account.type);

  if (isCreditAccountType(account.type)) {
    if (account.currentBalance < 0) {
      return `${accountTypeLabel} - deuda pendiente`;
    }

    if (account.currentBalance > 0) {
      return `${accountTypeLabel} - saldo a favor`;
    }

    return `${accountTypeLabel} - sin deuda`;
  }

  if (account.currentBalance > 0) {
    return `${accountTypeLabel} - ${Math.round(share * 100)}% del total`;
  }

  if (account.currentBalance < 0) {
    return `${accountTypeLabel} - saldo en rojo`;
  }

  return `${accountTypeLabel} - sin saldo disponible`;
}
type TrendChartProps = {
  points: DashboardTrendPoint[];
};

function TrendChart({ points }: TrendChartProps) {
  const maxAbsBalance = Math.max(
    ...points.map((point) => Math.abs(point.balance)),
    1
  );

  return (
    <View style={styles.chartCard}>
      <View style={styles.trendLegend}>
        <LegendDot color={colors.success} label="Mes positivo" />
        <LegendDot color={colors.danger} label="Mes en rojo" />
      </View>
      <View style={styles.trendChart}>
        {points.map((point) => {
          const scaledHeight = Math.max(
            Math.round((Math.abs(point.balance) / maxAbsBalance) * 48),
            point.balance === 0 ? 4 : 14
          );

          return (
            <View key={`${point.year}-${point.month}`} style={styles.trendColumn}>
              <View style={styles.trendBarStack}>
                <View style={styles.trendHalf}>
                  {point.balance > 0 ? (
                    <View
                      style={[
                        styles.trendBar,
                        styles.trendBarPositive,
                        { height: scaledHeight },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.trendBaseline} />
                <View style={[styles.trendHalf, styles.trendHalfBottom]}>
                  {point.balance < 0 ? (
                    <View
                      style={[
                        styles.trendBar,
                        styles.trendBarNegative,
                        { height: scaledHeight },
                      ]}
                    />
                  ) : null}
                </View>
              </View>
              <Text style={styles.trendValue}>{formatCompactAmount(point.balance)}</Text>
              <Text style={styles.trendLabel}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type LegendDotProps = {
  color: string;
  label: string;
};

function LegendDot({ color, label }: LegendDotProps) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

type ExpenseBreakdownChartProps = {
  items: DashboardTopExpenseCategory[];
};

function ExpenseBreakdownChart({ items }: ExpenseBreakdownChartProps) {
  return (
    <View style={styles.chartCard}>
      {items.map((item, index) => {
        const width = `${Math.max(item.share * 100, 12)}%` as const;

        return (
          <View key={`${item.categoryId ?? 'none'}-${index}`} style={styles.expenseRow}>
            <View style={styles.expenseRank}>
              <Text style={styles.expenseRankText}>{index + 1}</Text>
            </View>
            <View style={styles.expenseCopy}>
              <View style={styles.expenseHeader}>
                <Text style={styles.expenseName}>{item.name}</Text>
                <Text style={styles.expenseAmount}>
                  {formatDashboardMoney(item.totalAmount)}
                </Text>
              </View>
              <View style={styles.expenseTrack}>
                <View
                  style={[
                    styles.expenseFill,
                    { width },
                  ]}
                />
              </View>
              <Text style={styles.expenseMeta}>{Math.round(item.share * 100)}% del gasto total</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

type RecentActivityListProps = {
  items: DashboardRecentActivity[];
};

function RecentActivityList({ items }: RecentActivityListProps) {
  return (
    <View style={styles.chartCard}>
      {items.map((item) => (
        <View key={item.id} style={styles.activityRow}>
          <View
            style={[
              styles.activityIcon,
              item.type === 'expense'
                ? styles.activityIconNegative
                : item.type === 'transfer'
                  ? styles.activityIconNeutral
                  : styles.activityIconPositive,
            ]}
          >
            <Ionicons
              color={colors.text}
              name={getTransactionIconName(item.type)}
              size={18}
            />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.activityContext}>{item.context}</Text>
          </View>
          <View style={styles.activityMeta}>
            <Text
              style={[
                styles.activityAmount,
                item.type === 'expense'
                  ? styles.activityAmountNegative
                  : item.type === 'transfer'
                    ? null
                    : styles.activityAmountPositive,
              ]}
            >
              {getTransactionAmountPrefix(item.type)}
              {formatDashboardMoney(item.amount)}
            </Text>
            <Text style={styles.activityDate}>{formatTransactionDate(item.date)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

type EmptyStateCardProps = {
  iconName: IconName;
  title: string;
  description: string;
};

function EmptyStateCard({ iconName, title, description }: EmptyStateCardProps) {
  return (
    <StateCard
      description={description}
      iconName={iconName}
      title={title}
    />
  );
}

function getAccountIconName(type: DashboardAccountSnapshot['type']): IconName {
  switch (type) {
    case 'cash':
      return 'cash-outline';
    case 'wallet':
      return 'wallet-outline';
    case 'investment':
      return 'trending-up-outline';
    case 'credit':
      return 'card-outline';
    default:
      return 'business-outline';
  }
}

function getTransactionIconName(type: DashboardRecentActivity['type']): IconName {
  switch (type) {
    case 'income':
      return 'arrow-down-circle-outline';
    case 'expense':
      return 'arrow-up-circle-outline';
    case 'yield':
      return 'sparkles-outline';
    default:
      return 'swap-horizontal-outline';
  }
}

function formatCompactAmount(valueInCents: number) {
  const amount = Math.round(valueInCents / 100);
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  const absoluteValue = Math.abs(amount);

  if (absoluteValue >= 1000) {
    return `${sign}${Math.round(absoluteValue / 1000)}k`;
  }

  return `${sign}${absoluteValue}`;
}

function getAnnualPointPerformance(point: DashboardAnnualPoint) {
  const positiveBase = point.income + point.yield;

  if (positiveBase <= 0) {
    return point.expense > 0 ? -100 : 0;
  }

  return (point.balance / positiveBase) * 100;
}

function formatSignedPercentage(value: number) {
  const roundedValue = Math.round(value);

  if (roundedValue === 0) {
    return '0%';
  }

  return `${roundedValue > 0 ? '+' : ''}${roundedValue}%`;
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingBottom: 40,
  },
  welcomeHeader: {
    gap: 4,
  },
  welcomeEyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    alignItems: 'center',
    gap: 5,
    flexDirection: 'row',
  },
  text: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 5,
  },
  welcomeTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  welcomeDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 18,
  },
  heroCardPositive: {
    backgroundColor: '#26382D',
  },
  heroCardWarning: {
    backgroundColor: '#3A3021',
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
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroAccountsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroAccountsText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  heroValueBlock: {
    gap: 6,
  },
  heroLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  heroDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroMetricCopy: {
    flex: 1,
    gap: 2,
  },
  heroMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  heroMetricValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
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
    borderRadius: 18,
    backgroundColor: colors.surfaceError,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorCardText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  metricCardLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  metricCardValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  metricCardValuePositive: {
    color: colors.success,
  },
  metricCardValueNegative: {
    color: colors.danger,
  },
  metricCardDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  annualHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  annualHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  annualLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  annualTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  annualDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  annualYearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  annualYearText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  annualMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  annualActionButton: {
    alignSelf: 'flex-start',
  },
  annualMetricCard: {
    flex: 1,
    minWidth: 132,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 14,
    gap: 8,
  },
  annualMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  annualMetricIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  annualMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  annualMetricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  annualLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  annualChartCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 14,
    alignItems: 'stretch',
  },
  annualChartFrame: {
    width: '100%',
  },
  annualChart: {
    position: 'relative',
    height: 160,
  },
  annualLineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.warning,
  },
  annualColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  annualBars: {
    height: 116,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  annualBar: {
    width: 8,
    borderRadius: 999,
  },
  annualIncomeBar: {
    backgroundColor: colors.success,
  },
  annualExpenseBar: {
    backgroundColor: colors.danger,
  },
  annualMarker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  annualMonthLabel: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  annualMonthValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  annualMonthValuePositive: {
    color: colors.success,
  },
  annualMonthValueNegative: {
    color: colors.danger,
  },
  chartCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  accountRow: {
    gap: 10,
  },
  accountChartIntro: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  accountPie: {
    width: accountPieSize,
    height: accountPieSize,
    borderRadius: accountPieSize / 2,
    position: 'relative',
  },
  accountPieSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  accountPieCenter: {
    position: 'absolute',
    top: accountPieCenterInset,
    left: accountPieCenterInset,
    width: accountPieCenterSize,
    height: accountPieCenterSize,
    borderRadius: accountPieCenterSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    gap: 6,
  },
  accountPieLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  accountPieValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    width: '100%',
  },
  accountChartHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  accountRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  accountCopy: {
    flex: 1,
    gap: 2,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  accountName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  accountMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  accountBalance: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  accountTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  accountFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  accountFillNegative: {
    backgroundColor: colors.danger,
  },
  trendLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  trendColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  trendBarStack: {
    width: '100%',
    maxWidth: 42,
    alignItems: 'center',
    gap: 2,
  },
  trendHalf: {
    width: '100%',
    height: 52,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  trendHalfBottom: {
    justifyContent: 'flex-start',
  },
  trendBaseline: {
    width: '100%',
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  trendBar: {
    width: 20,
    borderRadius: 999,
  },
  trendBarPositive: {
    backgroundColor: colors.success,
  },
  trendBarNegative: {
    backgroundColor: colors.danger,
  },
  trendValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  trendLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  expenseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  expenseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  expenseRankText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  expenseCopy: {
    flex: 1,
    gap: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  expenseName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  expenseAmount: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  expenseTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  expenseFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.warning,
  },
  expenseMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconPositive: {
    backgroundColor: colors.surfaceSuccess,
  },
  activityIconNegative: {
    backgroundColor: colors.surfaceError,
  },
  activityIconNeutral: {
    backgroundColor: colors.surfaceAccent,
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  activityType: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  activityContext: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  activityMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activityAmount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  activityAmountPositive: {
    color: colors.success,
  },
  activityAmountNegative: {
    color: colors.danger,
  },
  activityDate: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 10,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    opacity: 0.9,
  },
});
