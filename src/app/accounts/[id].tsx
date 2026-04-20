import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen, TopBarBackButton } from '../../components';
import {
  AccountForm,
  toAccountFormValues,
  useAccount,
  useAccountMutations,
} from '../../features/accounts';
import { colors } from '../../theme';

const settingsRoute = '/(tabs)/settings' as Href;

export default function AccountDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const accountId = typeof params.id === 'string' ? params.id : undefined;
  const { account, errorMessage, isLoading } = useAccount(accountId);
  const {
    errorMessage: submitErrorMessage,
    isSubmitting,
    updateAccount,
  } = useAccountMutations();

  const currentErrorMessage = errorMessage ?? submitErrorMessage;

  function returnToSettings() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(settingsRoute);
  }

  if (isLoading) {
    return (
      <Screen
        title="Editar cuenta"
        description="Cargando los datos de la cuenta seleccionada."
        topBar={<TopBarBackButton label="Ajustes" onPress={returnToSettings} />}
        topInset
      >
        <View style={styles.centeredCard}>
          <ActivityIndicator color={colors.text} size="small" />
          <Text style={styles.centeredText}>Cargando cuenta...</Text>
        </View>
      </Screen>
    );
  }

  if (!accountId || !account) {
    return (
      <Screen
        title="Cuenta no encontrada"
        description="No fue posible abrir la cuenta seleccionada."
        topBar={<TopBarBackButton label="Ajustes" onPress={returnToSettings} />}
        topInset
      >
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            {currentErrorMessage ?? 'La cuenta ya no existe o no está disponible.'}
          </Text>
        </View>
        <Pressable
          onPress={returnToSettings}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Volver a ajustes</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <AccountForm
      backLabel="Ajustes"
      key={account.id}
      defaultValues={toAccountFormValues(account)}
      description="Actualiza nombre, tipo, saldo o deuda inicial y estado de la cuenta."
      errorMessage={submitErrorMessage}
      isSubmitting={isSubmitting}
      onBackPress={returnToSettings}
      showActiveField
      submitLabel="Guardar cambios"
      title="Editar cuenta"
      onSubmit={async (values) => {
        await updateAccount(account.id, values);
        returnToSettings();
      }}
    />
  );
}

const styles = StyleSheet.create({
  centeredCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  centeredText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  messageCard: {
    borderRadius: 16,
    backgroundColor: colors.surfaceError,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
