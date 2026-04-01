import { useRouter, type Href } from 'expo-router';

import {
  AccountForm,
  defaultAccountFormValues,
  useAccountMutations,
} from '../../features/accounts';

const settingsRoute = '/(tabs)/settings' as Href;

export default function NewAccountScreen() {
  const router = useRouter();
  const { createAccount, errorMessage, isSubmitting } = useAccountMutations();

  function returnToSettings() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(settingsRoute);
  }

  return (
    <AccountForm
      backLabel="Ajustes"
      defaultValues={defaultAccountFormValues}
      description="Guarda una cuenta para empezar a registrar saldos y movimientos."
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onBackPress={returnToSettings}
      submitLabel="Guardar cuenta"
      title="Nueva cuenta"
      onSubmit={async (values) => {
        await createAccount(values);
        returnToSettings();
      }}
    />
  );
}
