import { Stack, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  PeriodSwitcher,
  Screen,
  SectionIntro,
  StateCard,
  TopBarBackButton,
} from '../../components';
import {
  EconomicDataForm,
  formatEconomicDataMoney,
  formatEconomicPeriod,
  formatInflationPercentage,
  useEconomicData,
  useEconomicDataMutations,
} from '../../features/economicData';
import { useAppStore } from '../../store/app.store';
import { colors } from '../../theme';

const settingsRoute = '/(tabs)/settings' as Href;

export default function EconomicDataScreen() {
  const router = useRouter();
  const {
    data,
    errorMessage,
    isLoading,
    refresh,
    selectedMonth,
    selectedYear,
  } = useEconomicData();
  const {
    errorMessage: submitErrorMessage,
    isSubmitting,
    upsertEconomicData,
  } = useEconomicDataMutations();
  const goToPreviousMonth = useAppStore((state) => state.goToPreviousMonth);
  const goToNextMonth = useAppStore((state) => state.goToNextMonth);

  function returnToSettings() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(settingsRoute);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        eyebrow="Indicadores locales"
        title="Datos económicos"
        description="Gestiona el dólar oficial y la inflación mensual para alimentar conversiones y análisis salariales."
        topBar={<TopBarBackButton label="Ajustes" onPress={returnToSettings} />}
        topInset
      >
        <StatusBar style="light" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardArea}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <PeriodSwitcher
              label="Período"
              onNext={goToNextMonth}
              onPrevious={goToPreviousMonth}
              value={formatEconomicPeriod(selectedMonth, selectedYear)}
            />

            <EconomicDataForm
              key={`${selectedMonth}-${selectedYear}-${data.currentEntry?.id ?? 'new'}`}
              defaultValues={{
                dollarOfficial: data.currentEntry?.dollarOfficial ?? 0,
                inflationMonthlyBasisPoints:
                  data.currentEntry?.inflationMonthlyBasisPoints ?? 0,
              }}
              errorMessage={submitErrorMessage}
              isSubmitting={isSubmitting}
              month={selectedMonth}
              year={selectedYear}
              onSubmit={async (values) => {
                await upsertEconomicData({
                  month: selectedMonth,
                  year: selectedYear,
                  dollarOfficial: values.dollarOfficial,
                  inflationMonthlyBasisPoints:
                    values.inflationMonthlyBasisPoints,
                });
                await refresh();
              }}
            />

            {isLoading ? (
              <StateCard
                description="Cargando datos económicos..."
                loading
                title="Preparando indicadores"
              />
            ) : null}

            {!isLoading && errorMessage ? (
              <StateCard
                description={errorMessage}
                iconName="alert-circle-outline"
                title="No se pudieron cargar los datos"
                tone="error"
              />
            ) : null}

            <View style={styles.section}>
              <SectionIntro
                description="Historial guardado para revisar rápidamente valores previos por mes."
                iconName="time-outline"
                style={styles.sectionIntro}
                title="Períodos cargados"
              />
              {data.entries.length > 0 ? (
                <View style={styles.entryList}>
                  {data.entries.map((entry) => (
                    <View key={entry.id} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryPeriod}>
                          {formatEconomicPeriod(entry.month, entry.year)}
                        </Text>
                        {entry.month === selectedMonth && entry.year === selectedYear ? (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Actual</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.entryMetric}>
                        Dólar oficial: {formatEconomicDataMoney(entry.dollarOfficial)}
                      </Text>
                      <Text style={styles.entryMetric}>
                        Inflación: {formatInflationPercentage(entry.inflationMonthlyBasisPoints)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <StateCard
                  description="Guarda el valor oficial del dólar y la inflación del período para habilitar conversiones y comparaciones reales."
                  iconName="stats-chart-outline"
                  title="Todavía no hay datos económicos"
                />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 18,
    paddingBottom: 48,
  },
  section: {
    gap: 12,
  },
  sectionIntro: {
    marginBottom: 2,
  },
  entryList: {
    gap: 12,
  },
  entryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  entryPeriod: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  currentBadge: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  currentBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  entryMetric: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
