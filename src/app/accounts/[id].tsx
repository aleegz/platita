import { useState } from 'react';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ActionButton,
  Screen,
  SheetHeader,
  StateCard,
  TopBarBackButton,
} from '../../components';
import {
  AccountForm,
  toAccountFormValues,
  useAccount,
  useAccountMutations,
} from '../../features/accounts';
import { getUserFacingMessage } from '../../lib/errors';
import { useFiltersStore } from '../../store/filters.store';
import { colors } from '../../theme';

const accountsRoute = '/accounts' as Href;
const movementsRoute = '/(tabs)/movements' as Href;
const deleteBlockedByMovementsMessage =
  'No puedes eliminar una cuenta que ya tiene movimientos asociados.';

export default function AccountDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const accountId = typeof params.id === 'string' ? params.id : undefined;
  const { account, errorMessage, isLoading } = useAccount(accountId);
  const {
    errorMessage: submitErrorMessage,
    isSubmitting,
    deleteAccount,
    updateAccount,
  } = useAccountMutations();
  const setTransactionFilters = useFiltersStore((state) => state.setTransactionFilters);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [isDeleteSuccessVisible, setIsDeleteSuccessVisible] = useState(false);
  const [isDeleteBlockedVisible, setIsDeleteBlockedVisible] = useState(false);

  const formErrorMessage =
    submitErrorMessage === deleteBlockedByMovementsMessage ? null : submitErrorMessage;
  const currentErrorMessage = errorMessage ?? formErrorMessage;

  function returnToAccounts() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(accountsRoute);
  }

  function handleDeletePress() {
    if (!account || account.active || isSubmitting) {
      return;
    }

    setIsDeleteConfirmationVisible(true);
  }

  function closeDeleteConfirmation() {
    if (isSubmitting) {
      return;
    }

    setIsDeleteConfirmationVisible(false);
  }

  async function confirmDeleteAccount() {
    if (!account || account.active || isSubmitting) {
      return;
    }

    setIsDeleteConfirmationVisible(false);

    try {
      await deleteAccount(account.id);
      setIsDeleteSuccessVisible(true);
    } catch (error) {
      const userMessage = getUserFacingMessage(error, 'No se pudo eliminar la cuenta.');

      if (userMessage === deleteBlockedByMovementsMessage) {
        setIsDeleteBlockedVisible(true);
      }
    }
  }

  function closeDeleteSuccess() {
    setIsDeleteSuccessVisible(false);
    router.replace(accountsRoute);
  }

  function closeDeleteBlockedModal() {
    if (isSubmitting) {
      return;
    }

    setIsDeleteBlockedVisible(false);
  }

  function reviewAccountMovements() {
    if (!account) {
      return;
    }

    setIsDeleteBlockedVisible(false);
    setTransactionFilters({
      accountId: account.id,
      categoryId: null,
      type: null,
    });
    router.push(movementsRoute);
  }

  if (isLoading) {
    return (
      <Screen
        title="Editar cuenta"
        description="Cargando los datos de la cuenta seleccionada."
        topBar={<TopBarBackButton label="Cuentas" onPress={returnToAccounts} />}
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
        topBar={<TopBarBackButton label="Cuentas" onPress={returnToAccounts} />}
        topInset
      >
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            {currentErrorMessage ?? 'La cuenta ya no existe o no está disponible.'}
          </Text>
        </View>
        <Pressable
          onPress={returnToAccounts}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Volver a cuentas</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <>
      <AccountForm
        backLabel="Cuentas"
        key={account.id}
        defaultValues={toAccountFormValues(account)}
        description="Actualiza nombre, tipo, saldo o deuda inicial y estado de la cuenta."
        errorMessage={formErrorMessage}
        isSubmitting={isSubmitting}
        onBackPress={returnToAccounts}
        destructiveActionDescription="Disponible solo para cuentas inactivas. Si la cuenta tiene movimientos asociados, primero tendrás que conservarla o resolver esas referencias."
        destructiveActionLabel={account.active ? undefined : 'Eliminar cuenta'}
        onDestructiveAction={account.active ? undefined : handleDeletePress}
        showActiveField
        submitLabel="Guardar cambios"
        title="Editar cuenta"
        onSubmit={async (values) => {
          await updateAccount(account.id, values);
          returnToAccounts();
        }}
      />

      <DeleteAccountConfirmationModal
        accountName={account.name}
        onCancel={closeDeleteConfirmation}
        onConfirm={() => {
          void confirmDeleteAccount();
        }}
        visible={isDeleteConfirmationVisible && !account.active}
      />

      <PostDeleteStatusModal
        actionLabel="Aceptar"
        description="La cuenta se elimino correctamente del catalogo y ya no aparecera en tus listados."
        onAction={closeDeleteSuccess}
        title="Cuenta eliminada"
        tone="success"
        visible={isDeleteSuccessVisible}
      />

      <PostDeleteStatusModal
        actionLabel="Revisar movimientos"
        description="Esta cuenta sigue referenciada en movimientos existentes. Revisalos antes de volver a intentar la eliminacion."
        onAction={reviewAccountMovements}
        onDismiss={closeDeleteBlockedModal}
        secondaryActionLabel="Volver"
        title="No se puede eliminar la cuenta"
        tone="error"
        visible={isDeleteBlockedVisible}
      />
    </>
  );
}

type DeleteAccountConfirmationModalProps = {
  visible: boolean;
  accountName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

type PostDeleteStatusModalProps = {
  visible: boolean;
  title: string;
  description: string;
  tone: 'success' | 'error';
  actionLabel: string;
  onAction: () => void;
  onDismiss?: () => void;
  secondaryActionLabel?: string;
};

function DeleteAccountConfirmationModal({
  visible,
  accountName,
  onCancel,
  onConfirm,
}: DeleteAccountConfirmationModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <Pressable onPress={onCancel} style={styles.modalBackdrop} />
        <View style={styles.modalCard}>
          <SheetHeader
            description="La cuenta se elimina del catalogo y no podras deshacer esta accion."
            iconName="trash-outline"
            onClose={onCancel}
            title="Confirmar eliminacion"
            tone="danger"
          />

          <View style={styles.accountPreviewCard}>
            <Text style={styles.accountPreviewLabel}>Cuenta seleccionada</Text>
            <Text style={styles.accountPreviewName}>{accountName}</Text>
            <Text style={styles.accountPreviewDescription}>
              Si tiene movimientos asociados, Platita bloqueara la eliminacion.
            </Text>
          </View>

          <StateCard
            align="left"
            description="Esta accion es solo para cuentas inactivas y quita la cuenta de forma permanente cuando no existan referencias pendientes."
            iconName="alert-circle-outline"
            title="Accion destructiva"
            tone="error"
          />

          <View style={styles.modalActions}>
            <ActionButton
              label="Cancelar"
              onPress={onCancel}
              style={styles.modalAction}
              variant="secondary"
            />
            <ActionButton
              iconName="trash-outline"
              label="Eliminar cuenta"
              onPress={onConfirm}
              style={styles.modalAction}
              variant="danger"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PostDeleteStatusModal({
  visible,
  title,
  description,
  tone,
  actionLabel,
  onAction,
  onDismiss,
  secondaryActionLabel,
}: PostDeleteStatusModalProps) {
  const isSuccess = tone === 'success';

  return (
    <Modal
      animationType="fade"
      onRequestClose={onDismiss ?? onAction}
      transparent
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        {onDismiss ? <Pressable onPress={onDismiss} style={styles.modalBackdrop} /> : null}
        <View style={styles.modalCard}>
          <SheetHeader
            description={description}
            iconName={isSuccess ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            onClose={onDismiss}
            title={title}
            tone={isSuccess ? 'default' : 'danger'}
          />

          <StateCard
            align="left"
            description={description}
            iconName={isSuccess ? 'sparkles-outline' : 'git-branch-outline'}
            title={isSuccess ? 'El cambio ya fue aplicado' : 'Hay referencias por resolver'}
            tone={tone}
          />

          <View style={styles.modalActions}>
            {onDismiss && secondaryActionLabel ? (
              <ActionButton
                label={secondaryActionLabel}
                onPress={onDismiss}
                style={styles.modalAction}
                textStyle={styles.modalActionText}
                variant="secondary"
              />
            ) : null}
            <ActionButton
              iconName={isSuccess ? 'checkmark-outline' : undefined}
              label={actionLabel}
              onPress={onAction}
              style={onDismiss ? styles.modalAction : styles.singleModalAction}
              textStyle={styles.modalActionText}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(7, 9, 13, 0.62)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 18,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  accountPreviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  accountPreviewLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  accountPreviewName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  accountPreviewDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalAction: {
    flex: 1,
  },
  modalActionText: {
    textAlign: 'center',
  },
  singleModalAction: {
    flex: 1,
    alignSelf: 'stretch',
  },
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
