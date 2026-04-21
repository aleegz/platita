import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  PeriodSwitcher,
  Screen,
  SectionIntro,
  StateCard,
  TopBarBackButton,
} from '../../../../components';
import {
  formatDashboardPeriod,
} from '../../../../features/dashboard';
import {
  createMonthlyAnalysisRoute,
  ExpenseCategoryBreakdownSection,
  getRelativePeriod,
  MonthlyAccountDistributionSection,
  MonthlyOverviewSection,
  resolveMonthYearParams,
  useMonthlyAnalysis,
} from '../../../../features/monthlyAnalysis';
import { SalarySummarySection } from '../../../../features/salary';

const dashboardRoute = '/(tabs)' as Href;

export default function MonthlyAnalysisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ year?: string | string[]; month?: string | string[] }>();
  const period = resolveMonthYearParams(params);
  const previousPeriod = getRelativePeriod(period.month, period.year, -1);
  const nextPeriod = getRelativePeriod(period.month, period.year, 1);
  const { data, errorMessage, isLoading } = useMonthlyAnalysis(
    period.month,
    period.year
  );

  function returnToDashboard() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(dashboardRoute);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        eyebrow="Análisis"
        title="Mes a mes"
        description="Abrí cada período sin mover el resto de la app y leé rápido cómo cerró tu flujo mensual y tu sueldo."
        topBar={<TopBarBackButton label="Volver" onPress={returnToDashboard} />}
        topInset
      >
        <StatusBar style="light" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <PeriodSwitcher
            label="Período"
            onNext={() => router.replace(createMonthlyAnalysisRoute(nextPeriod.year, nextPeriod.month))}
            onPrevious={() =>
              router.replace(
                createMonthlyAnalysisRoute(previousPeriod.year, previousPeriod.month)
              )
            }
            value={formatDashboardPeriod(period.month, period.year)}
          />

          {isLoading ? (
            <StateCard
              description="Procesando ingresos, gastos y señales del período..."
              loading
              title="Armando el análisis mensual"
            />
          ) : null}

          {!isLoading && errorMessage ? (
            <StateCard
              description={errorMessage}
              iconName="alert-circle-outline"
              title="No se pudo cargar el análisis mensual"
              tone="error"
            />
          ) : null}

            {!isLoading && !errorMessage ? (
              <>
                <MonthlyOverviewSection data={data} />
                <MonthlyAccountDistributionSection data={data} />
                <ExpenseCategoryBreakdownSection data={data} />

                {!data.hasActivity ? (
                  <StateCard
                  align="left"
                  description="Este período todavía no tiene movimientos. Igual podés navegar mes a mes y cargar datos para empezar a leer tendencias."
                  iconName="calendar-clear-outline"
                  title="Todavía no hay actividad en este mes"
                />
              ) : null}
            </>
          ) : null}

          <View style={styles.section}>
            <SectionIntro
              description={`Lectura salarial puntual para ${formatDashboardPeriod(period.month, period.year)} sin depender del período global.`}
              iconName="cash-outline"
              title="Análisis salarial"
            />
            <SalarySummarySection month={period.month} year={period.year} />
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 18,
    paddingBottom: 48,
  },
  section: {
    gap: 12,
  },
});
