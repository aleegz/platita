import { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useRouter, type Href } from 'expo-router';

import {
  createDefaultTransactionFormValues,
  toSaveTransactionInput,
  TransactionForm,
  useTransactionMutations,
  useTransactionReferenceData,
} from '../../features/transactions';

const movementsRoute = '/(tabs)/movements' as Href;

export default function NewMovementScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const { createTransaction, errorMessage, isSubmitting } =
    useTransactionMutations();
  const {
    accounts,
    categories,
    errorMessage: referenceErrorMessage,
    isLoading,
  } = useTransactionReferenceData();
  const tabNavigation = navigation as typeof navigation & {
    addListener: (eventName: string, callback: () => void) => () => void;
  };

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    setFormInstanceKey((current) => current + 1);
  }, [isFocused]);

  useEffect(() => {
    const unsubscribe = tabNavigation.addListener('tabPress', () => {
      if (!navigation.isFocused()) {
        return;
      }

      setFormInstanceKey((current) => current + 1);
    });

    return unsubscribe;
  }, [navigation, tabNavigation]);

  return (
    <TransactionForm
      key={formInstanceKey}
      accounts={accounts}
      categories={categories}
      defaultValues={createDefaultTransactionFormValues()}
      description="Carga ingresos, gastos, transferencias, pagos de tarjeta y rendimientos en tu base local."
      errorMessage={errorMessage}
      isLoadingReferences={isLoading}
      isSubmitting={isSubmitting}
      requireConfirmation
      referenceErrorMessage={referenceErrorMessage}
      submitLabel="Guardar movimiento"
      title="Nuevo movimiento"
      onSubmit={async (values) => {
        await createTransaction(toSaveTransactionInput(values));
        router.replace(movementsRoute);
      }}
    />
  );
}
