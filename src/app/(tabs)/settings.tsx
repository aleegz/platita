import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, type Href } from 'expo-router';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';

import {
  ActionButton,
  Screen,
  SectionIntro,
  StateCard,
  SurfaceCard,
} from '../../components';
import {
  getAccountOpeningBalanceLabel,
  getAccountTypeLabel,
  useAccounts,
} from '../../features/accounts';
import { useDeviceAuthenticationAvailability } from '../../features/security';
import { createCurrencyFormatter } from '../../lib/formatters';
import {
  ProfileNameModal,
  useUserProfile,
  useUserProfileMutations,
} from '../../features/settings';
import { colors } from '../../theme';
import logo from '../../../assets/A-VA_01.png';
import logoBW from '../../../assets/logo_bw.png';

const currencyFormatter = createCurrencyFormatter({
  currency: 'ARS',
});

const newAccountRoute = '/accounts/new' as Href;
const economicDataRoute = '/economic-data' as Href;
const settingsAccountRoute = (id: string) =>
  ({
    pathname: '/accounts/[id]',
    params: { id },
  }) as unknown as Href;

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function SettingsScreen() {
  const router = useRouter();
  const { accounts, errorMessage, isLoading } = useAccounts();
  const { profile } = useUserProfile();
  const {
    appLockErrorMessage,
    errorMessage: profileErrorMessage,
    isSavingProfile,
    isUpdatingAppLock,
    saveProfile,
    setAppLockEnabled,
  } = useUserProfileMutations();
  const {
    errorMessage: deviceAuthenticationErrorMessage,
    hasFingerprint,
    isLoading: isCheckingDeviceAuthentication,
    isSupported: isDeviceAuthenticationSupported,
  } = useDeviceAuthenticationAvailability();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const accountSummaryLabel = isLoading
    ? 'Sincronizando cuentas'
    : `${accounts.length} ${accounts.length === 1 ? 'cuenta activa' : 'cuentas activas'}`;
  const isAppLockEnabled = profile?.appLockEnabled ?? false;
  const isAppLockSwitchDisabled =
    isCheckingDeviceAuthentication ||
    isUpdatingAppLock ||
    profile === null ||
    (!isDeviceAuthenticationSupported && !isAppLockEnabled);
  const appLockDescription = isCheckingDeviceAuthentication
    ? 'Verificando la seguridad disponible en este dispositivo...'
    : !isDeviceAuthenticationSupported
      ? 'Activa un método de desbloqueo en tu dispositivo para proteger la app.'
      : hasFingerprint
        ? 'Protege tus saldos y movimientos con huella o con el bloqueo del dispositivo.'
        : 'Protege tus saldos y movimientos con el bloqueo del dispositivo.';

  async function handleAppLockChange(nextValue: boolean) {
    if (isAppLockSwitchDisabled) {
      return;
    }

    try {
      await setAppLockEnabled(nextValue);
    } catch {
      // El mensaje visible se maneja desde el hook de perfil.
    }
  }

  return (
    <Screen
      eyebrow="Configuración"
      title="Ajustes"
      description="Configura los datos base de la app y administra tus cuentas de dinero y crédito."
      topInset
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <SurfaceCard style={styles.summaryCard}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryEyebrow}>Configuración base</Text>
            <Text style={styles.summaryTitle}>{accountSummaryLabel}</Text>
            <Text style={styles.summaryDescription}>
              Administra dónde guardas tu dinero, tus tarjetas y el acceso a las herramientas de carga.
            </Text>
          </View>
          <ActionButton
            iconName="add-circle-outline"
            label="Agregar cuenta"
            onPress={() => router.push(newAccountRoute)}
          />
        </SurfaceCard>

        <SurfaceCard style={styles.profileCard}>
          <SectionIntro
            description="El nombre se usa para personalizar tu bienvenida en Inicio."
            iconName="person-outline"
            title="Perfil"
          />
          <View style={styles.profileRow}>
            <View style={styles.profileIdentity}>
              <View style={styles.profileIcon}>
                <Ionicons color={colors.text} name="person-circle-outline" size={20} />
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileLabel}>Nombre visible</Text>
                <Text style={styles.profileValue}>
                  {profile?.displayName ?? 'Sin definir'}
                </Text>
              </View>
            </View>
            <ActionButton
              compact
              iconName="create-outline"
              label={profile ? 'Editar' : 'Definir'}
              onPress={() => setIsProfileModalVisible(true)}
              style={styles.profileButton}
              variant="secondary"
            />
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.securityCard}>
          <SectionIntro
            description="Protege tus saldos y movimientos cuando vuelves a abrir la app."
            iconName="shield-checkmark-outline"
            title="Seguridad"
          />
          <View style={styles.securityRow}>
            <View style={styles.securityCopy}>
              <Text style={styles.securityLabel}>Bloqueo de la app</Text>
              <Text style={styles.securityDescription}>{appLockDescription}</Text>
            </View>
            <Switch
              disabled={isAppLockSwitchDisabled}
              onValueChange={(nextValue) => {
                void handleAppLockChange(nextValue);
              }}
              thumbColor={isAppLockEnabled ? colors.text : colors.surface}
              trackColor={{
                false: colors.surfaceMuted,
                true: colors.surfaceAccent,
              }}
              value={isAppLockEnabled}
            />
          </View>
          {isAppLockEnabled && !appLockErrorMessage ? (
            <Text style={styles.securityMeta}>
              La app pedirá desbloqueo al abrirse o al volver al frente.
            </Text>
          ) : null}
          {appLockErrorMessage ? (
            <Text style={[styles.securityMeta, styles.securityMetaError]}>
              {appLockErrorMessage}
            </Text>
          ) : null}
          {!appLockErrorMessage && deviceAuthenticationErrorMessage ? (
            <Text style={[styles.securityMeta, styles.securityMetaError]}>
              {deviceAuthenticationErrorMessage}
            </Text>
          ) : null}
        </SurfaceCard>

        <View style={styles.sectionBlock}>
          <SectionIntro
            description="Edita nombre, tipo, saldo o deuda inicial y estado de cada cuenta activa."
            iconName="wallet-outline"
            title="Cuentas"
          />

          {isLoading ? (
            <StateCard
              description="Cargando cuentas activas..."
              loading
              title="Sincronizando cuentas"
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
              description="Crea tu primera cuenta para empezar a registrar saldos y movimientos."
              iconName="wallet-outline"
              title="Todavía no hay cuentas activas"
            />
          ) : null}

          {!isLoading && !errorMessage ? (
            <View style={styles.accountList}>
              {accounts.map((account) => (
                <Pressable
                  key={account.id}
                  onPress={() => router.push(settingsAccountRoute(account.id))}
                  style={styles.accountCard}
                >
                  <View style={styles.accountHeader}>
                    <View style={styles.accountIdentity}>
                      <View style={styles.accountIcon}>
                        <Ionicons
                          color={colors.text}
                          name={getAccountIconName(account.type)}
                          size={18}
                        />
                      </View>
                      <View style={styles.accountCopy}>
                        <Text style={styles.accountName}>{account.name}</Text>
                        <Text style={styles.accountType}>
                          {getAccountTypeLabel(account.type)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      color={colors.muted}
                      name="chevron-forward"
                      size={18}
                    />
                  </View>
                  <Text style={styles.accountBalance}>
                    {getAccountOpeningBalanceLabel(account.type)}:{' '}
                    {currencyFormatter.format(account.initialBalance / 100)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <SurfaceCard style={styles.securityCard}>
          <SectionIntro
            description="Protege tus saldos y movimientos cuando vuelves a abrir la app."
            iconName="shield-checkmark-outline"
            title="Seguridad"
          />
          <View style={styles.securityRow}>
            <View style={styles.securityCopy}>
              <Text style={styles.securityLabel}>Bloqueo de la app</Text>
              <Text style={styles.securityDescription}>{appLockDescription}</Text>
            </View>
            <Switch
              disabled={isAppLockSwitchDisabled}
              onValueChange={(nextValue) => {
                void handleAppLockChange(nextValue);
              }}
              thumbColor={isAppLockEnabled ? colors.text : colors.surface}
              trackColor={{
                false: colors.surfaceMuted,
                true: colors.surfaceAccent,
              }}
              value={isAppLockEnabled}
            />
          </View>
          {isAppLockEnabled && !appLockErrorMessage ? (
            <Text style={styles.securityMeta}>
              La app pedirá desbloqueo al abrirse o al volver al frente.
            </Text>
          ) : null}
          {appLockErrorMessage ? (
            <Text style={[styles.securityMeta, styles.securityMetaError]}>
              {appLockErrorMessage}
            </Text>
          ) : null}
          {!appLockErrorMessage && deviceAuthenticationErrorMessage ? (
            <Text style={[styles.securityMeta, styles.securityMetaError]}>
              {deviceAuthenticationErrorMessage}
            </Text>
          ) : null}
        </SurfaceCard>

        <View style={styles.sectionBlock}>
          <SectionIntro
            description="Accesos rápidos para alimentar la app y administrar tus datos base."
            iconName="build-outline"
            title="Herramientas"
          />
          <View style={styles.linkList}>
            <Pressable
              onPress={() => router.push(economicDataRoute)}
              style={styles.linkCard}
            >
              <View style={styles.linkHeader}>
                <View style={styles.linkIcon}>
                  <Ionicons
                    color={colors.text}
                    name="stats-chart-outline"
                    size={18}
                  />
                </View>
                <View style={styles.linkCopy}>
                  <Text style={styles.linkTitle}>Datos económicos</Text>
                  <Text style={styles.linkDescription}>
                    Carga de dólar oficial e inflación mensual.
                  </Text>
                </View>
                <Ionicons
                  color={colors.muted}
                  name="chevron-forward"
                  size={18}
                />
              </View>
            </Pressable>
            
            <View style={styles.linkCard}>
              <View style={styles.linkHeader}>
                <View style={styles.linkIcon}>
                  <Ionicons
                    color={colors.text}
                    name="archive-outline"
                    size={18}
                  />
                </View>
                <View style={styles.linkCopy}>
                  <Text style={styles.linkTitle}>Respaldo</Text>
                  <Text style={styles.linkDescription}>
                    Se incorporará en versiones posteriores del MVP.
                  </Text>
                </View>
                <Ionicons
                  color={colors.muted}
                  name="hourglass-outline"
                  size={18}
                />
              </View>
            </View>

            <View style={styles.linkCard}>
              <View style={styles.linkHeader}>
                <View style={styles.linkIcon}>
                  <Ionicons
                    color={colors.text}
                    name="pricetags-outline"
                    size={18}
                  />
                </View>
                <View style={styles.linkCopy}>
                  <Text style={styles.linkTitle}>Categorías</Text>
                  <Text style={styles.linkDescription}>
                    Se incorporará en versiones posteriores del MVP.
                  </Text>
                </View>
                <Ionicons
                  color={colors.muted}
                  name="hourglass-outline"
                  size={18}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Image source={logo} style={styles.logo} />

          <View style={styles.textRow}>
            <Text style={styles.text}>Desarrollado por</Text>

            <Pressable onPress={() => Linking.openURL('https://github.com/aleegz')}>
              <Text style={styles.link}>Alejandro Gómez</Text>
            </Pressable>
          </View>
          
          <View style={styles.version}>
            <Image source={logoBW} style={styles.logoBW} />
            <Text style={styles.text}>Platita v1.0.0 • Beta</Text>
          </View>
        </View>
      </ScrollView>

      <ProfileNameModal
        defaultValue={profile?.displayName ?? ''}
        errorMessage={profileErrorMessage}
        isSubmitting={isSavingProfile}
        mode="edit"
        onClose={() => setIsProfileModalVisible(false)}
        onSubmit={async (values) => {
          await saveProfile(values);
          setIsProfileModalVisible(false);
        }}
        visible={isProfileModalVisible}
      />
    </Screen>
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
  profileCard: {
    gap: 16,
  },
  securityCard: {
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  profileLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  profileValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  profileButton: {
    minWidth: 108,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  securityCopy: {
    flex: 1,
    gap: 6,
  },
  securityLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  securityDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  securityMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  securityMetaError: {
    color: colors.danger,
  },
  accountCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  accountCopy: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  accountType: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  accountBalance: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBlock: {
    gap: 12,
  },
  accountList: {
    gap: 12,
  },
  linkList: {
    gap: 12,
  },
  linkCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  linkCopy: {
    flex: 1,
    gap: 6,
  },
  linkTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  linkDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 28,
    gap: 8,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    opacity: 0.9,
  },
  logoBW: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    opacity: 0.9,
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  text: {
    fontSize: 12,
    color: colors.muted,
  },
  link: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    textDecorationLine: 'none',
  },
  version: {
    fontSize: 12,
    color: colors.muted,
    alignItems: 'center',
    gap: 5,
    flexDirection: 'row',
  },
});

function getAccountIconName(type: Parameters<typeof getAccountTypeLabel>[0]): IconName {
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
