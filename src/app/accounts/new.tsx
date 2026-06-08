import { useRouter, type Href } from 'expo-router';

import {
  AccountForm,
  defaultAccountFormValues,
  useAccountMutations,
} from '../../features/accounts';

const accountsRoute = '/accounts' as Href;

export default function NewAccountScreen() {
  const router = useRouter();
  const { createAccount, errorMessage, isSubmitting } = useAccountMutations();

  function returnToAccounts() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(accountsRoute);
  }

  return (
    <AccountForm
      backLabel="Cuentas"
      defaultValues={defaultAccountFormValues}
      description="Guarda una cuenta para empezar a registrar saldos, deudas y movimientos."
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onBackPress={returnToAccounts}
      submitLabel="Guardar cuenta"
      title="Nueva cuenta"
      onSubmit={async (values) => {
        await createAccount(values);
        returnToAccounts();
      }}
    />
  );
}
