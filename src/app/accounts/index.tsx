import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ActionButton,
  Screen,
  SectionIntro,
  StateCard,
  SurfaceCard,
  TopBarBackButton,
} from '../../components';
import {
  getAccountOpeningBalanceLabel,
  getAccountTypeIconName,
  getAccountTypeLabel,
  useAccounts,
} from '../../features/accounts';
import { createCurrencyFormatter } from '../../lib/formatters';
import { colors } from '../../theme';
import type { Account } from '../../types/domain';

const settingsRoute = '/(tabs)/settings' as Href;
const newAccountRoute = '/accounts/new' as Href;
const accountDetailRoute = (id: string) =>
  ({
    pathname: '/accounts/[id]',
    params: { id },
  }) as unknown as Href;

const currencyFormatter = createCurrencyFormatter({
  currency: 'ARS',
});

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function AccountsScreen() {
  const router = useRouter();
  const { accounts, errorMessage, isLoading } = useAccounts({
    includeInactive: true,
  });
  const activeAccounts = accounts.filter((account) => account.active);
  const inactiveAccounts = accounts.filter((account) => !account.active);

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
        description="Administra tus cuentas activas e inactivas sin sobrecargar la pantalla de ajustes."
        eyebrow="Catálogo local"
        title="Cuentas"
        topBar={<TopBarBackButton label="Ajustes" onPress={returnToSettings} />}
        topInset
      >
        <StatusBar style="light" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SurfaceCard style={styles.summaryCard}>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryEyebrow}>Panorama actual</Text>
              <Text style={styles.summaryTitle}>{activeAccounts.length} activas</Text>
              <Text style={styles.summaryDescription}>
                Las cuentas activas siguen apareciendo en movimientos. Las inactivas
                quedan fuera de formularios, pero conservan su historial.
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricPill label="Totales" value={String(accounts.length)} />
              <MetricPill label="Activas" value={String(activeAccounts.length)} />
              <MetricPill label="Inactivas" value={String(inactiveAccounts.length)} />
            </View>

            <ActionButton
              iconName="add-circle-outline"
              label="Nueva cuenta"
              onPress={() => router.push(newAccountRoute)}
            />
          </SurfaceCard>

          {isLoading ? (
            <StateCard
              description="Cargando cuentas..."
              loading
              title="Sincronizando catálogo"
            />
          ) : null}

          {!isLoading && errorMessage ? (
            <StateCard
              description={errorMessage}
              iconName="alert-circle-outline"
              title="No se pudieron cargar las cuentas"
              tone="error"
            />
          ) : null}

          {!isLoading && !errorMessage && accounts.length === 0 ? (
            <StateCard
              description="Crea tu primera cuenta para empezar a registrar saldos, deudas y movimientos."
              iconName="wallet-outline"
              title="Todavía no hay cuentas"
            />
          ) : null}

          {!isLoading && !errorMessage && accounts.length > 0 ? (
            <View style={styles.groupList}>
              <SurfaceCard style={styles.groupCard}>
                <SectionIntro
                  description="Disponibles en formularios y referencias de movimientos."
                  iconName="checkmark-circle-outline"
                  title="Cuentas activas"
                />

                <View style={styles.groupMetricsRow}>
                  <AccountStatusPill
                    iconName="wallet-outline"
                    label={`${activeAccounts.length} ${
                      activeAccounts.length === 1 ? 'cuenta' : 'cuentas'
                    }`}
                  />
                  <AccountStatusPill
                    iconName="git-branch-outline"
                    label="Usadas en movimientos"
                    tone="success"
                  />
                </View>

                {activeAccounts.length > 0 ? (
                  <View style={styles.accountList}>
                    {activeAccounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        account={account}
                        onPress={() => router.push(accountDetailRoute(account.id))}
                      />
                    ))}
                  </View>
                ) : (
                  <StateCard
                    description="Todas tus cuentas están inactivas. Reactiva alguna para volver a usarla en movimientos."
                    iconName="pause-circle-outline"
                    title="No hay cuentas activas"
                  />
                )}
              </SurfaceCard>

              <SurfaceCard style={styles.groupCard}>
                <SectionIntro
                  description="No aparecen al cargar movimientos, pero siguen disponibles para consulta y reactivación."
                  iconName="eye-off-outline"
                  title="Cuentas inactivas"
                />

                <View style={styles.groupMetricsRow}>
                  <AccountStatusPill
                    iconName="albums-outline"
                    label={`${inactiveAccounts.length} ${
                      inactiveAccounts.length === 1 ? 'cuenta' : 'cuentas'
                    }`}
                  />
                  {inactiveAccounts.length > 0 ? (
                    <AccountStatusPill
                      iconName="archive-outline"
                      label="Fuera de formularios"
                      tone="muted"
                    />
                  ) : null}
                </View>

                {inactiveAccounts.length > 0 ? (
                  <View style={styles.accountList}>
                    {inactiveAccounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        account={account}
                        onPress={() => router.push(accountDetailRoute(account.id))}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.groupFootnote}>
                    No hay cuentas inactivas por ahora.
                  </Text>
                )}
              </SurfaceCard>
            </View>
          ) : null}
        </ScrollView>
      </Screen>
    </>
  );
}

type MetricPillProps = {
  label: string;
  value: string;
};

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

type AccountStatusPillProps = {
  label: string;
  iconName: IconName;
  tone?: 'default' | 'success' | 'muted';
};

function AccountStatusPill({
  label,
  iconName,
  tone = 'default',
}: AccountStatusPillProps) {
  return (
    <View
      style={[
        styles.accountStatusPill,
        tone === 'success'
          ? styles.accountStatusPillSuccess
          : tone === 'muted'
            ? styles.accountStatusPillMuted
            : null,
      ]}
    >
      <Ionicons
        color={
          tone === 'success'
            ? colors.success
            : tone === 'muted'
              ? colors.muted
              : colors.text
        }
        name={iconName}
        size={14}
      />
      <Text
        style={[
          styles.accountStatusPillText,
          tone === 'success'
            ? styles.accountStatusPillTextSuccess
            : tone === 'muted'
              ? styles.accountStatusPillTextMuted
              : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type AccountRowProps = {
  account: Account;
  onPress: () => void;
};

function AccountRow({ account, onPress }: AccountRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.accountCard,
        !account.active ? styles.accountCardInactive : null,
      ]}
    >
      <View style={styles.accountHeader}>
        <View style={styles.accountIdentity}>
          <View
            style={[
              styles.accountIcon,
              !account.active ? styles.accountIconInactive : null,
            ]}
          >
            <Ionicons
              color={account.active ? colors.text : colors.muted}
              name={getAccountTypeIconName(account.type)}
              size={18}
            />
          </View>
          <View style={styles.accountCopy}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountMeta}>
              {getAccountTypeLabel(account.type)} · {getAccountOpeningBalanceLabel(account.type)}:{' '}
              {currencyFormatter.format(account.initialBalance / 100)}
            </Text>
          </View>
        </View>

        <View style={styles.accountAside}>
          <View
            style={[
              styles.statusBadge,
              account.active ? styles.statusBadgeActive : styles.statusBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                account.active
                  ? styles.statusBadgeTextActive
                  : styles.statusBadgeTextInactive,
              ]}
            >
              {account.active ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
          <Ionicons color={colors.muted} name="chevron-forward" size={18} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 18,
    paddingBottom: 24,
  },
  summaryCard: {
    gap: 16,
  },
  summaryCopy: {
    gap: 4,
  },
  summaryEyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  summaryDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricPill: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  groupList: {
    gap: 18,
  },
  groupCard: {
    gap: 14,
  },
  groupMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  accountStatusPillSuccess: {
    backgroundColor: colors.surfaceSuccess,
  },
  accountStatusPillMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  accountStatusPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  accountStatusPillTextSuccess: {
    color: colors.success,
  },
  accountStatusPillTextMuted: {
    color: colors.muted,
  },
  accountList: {
    gap: 12,
  },
  accountCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accountCardInactive: {
    backgroundColor: colors.surface,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  accountIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  accountIconInactive: {
    backgroundColor: colors.surfaceMuted,
  },
  accountCopy: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  accountMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  accountAside: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeActive: {
    backgroundColor: colors.surfaceSuccess,
  },
  statusBadgeInactive: {
    backgroundColor: colors.surfaceAccent,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextActive: {
    color: colors.success,
  },
  statusBadgeTextInactive: {
    color: colors.muted,
  },
  groupFootnote: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
