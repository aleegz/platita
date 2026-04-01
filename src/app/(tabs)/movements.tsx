import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ActionButton,
  PeriodSwitcher,
  Screen,
  SectionIntro,
  SheetHeader,
  StateCard,
  SurfaceCard,
} from '../../components';
import { useAppStore } from '../../store/app.store';
import { useFiltersStore } from '../../store/filters.store';
import { colors } from '../../theme';
import type { Transaction, TransactionType } from '../../types/domain';
import {
  toSaveTransactionInput,
  toTransactionFormValues,
  formatMoneyInPesos,
  formatPeriodLabel,
  formatTransactionDate,
  getTransactionAmountPrefix,
  getTransactionTypeLabel,
  TransactionForm,
  transactionTypeOptions,
  useTransactionMutations,
  useTransactions,
} from '../../features/transactions';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function MovementsScreen() {
  const {
    accounts,
    categories,
    errorMessage,
    isLoading,
    refresh,
    selectedMonth,
    selectedYear,
    transactionFilters,
    transactions,
  } = useTransactions();
  const {
    deleteTransaction,
    errorMessage: mutationErrorMessage,
    isSubmitting,
    updateTransaction,
  } = useTransactionMutations();
  const goToPreviousMonth = useAppStore((state) => state.goToPreviousMonth);
  const goToNextMonth = useAppStore((state) => state.goToNextMonth);
  const setTransactionFilters = useFiltersStore(
    (state) => state.setTransactionFilters
  );
  const resetTransactionFilters = useFiltersStore(
    (state) => state.resetTransactionFilters
  );
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(
    null
  );
  const [transactionPendingDelete, setTransactionPendingDelete] =
    useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(
    null
  );
  const [openFilter, setOpenFilter] = useState<'type' | 'account' | 'category' | null>(
    null
  );
  const accountNameById = new Map(accounts.map((account) => [account.id, account.name]));
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name])
  );
  const filteredCategories = categories.filter((category) =>
    transactionFilters.type && transactionFilters.type !== 'transfer'
      ? category.type === transactionFilters.type
      : true
  );
  const typeOptions = [
    { id: 'all', label: 'Todos' },
    ...transactionTypeOptions.map((option) => ({
      id: option.value,
      label: option.label,
    })),
  ];
  const accountOptions = [
    { id: 'all', label: 'Todas' },
    ...accounts.map((account) => ({
      id: account.id,
      label: account.name,
    })),
  ];
  const categoryOptions = [
    { id: 'all', label: 'Todas' },
    ...filteredCategories.map((category) => ({
      id: category.id,
      label: category.name,
    })),
  ];

  function handleDeletePress(transaction: Transaction) {
    setTransactionPendingDelete(transaction);
  }

  async function confirmDeleteTransaction() {
    if (!transactionPendingDelete) {
      return;
    }

    const transactionId = transactionPendingDelete.id;

    setDeletingTransactionId(transactionId);

    try {
      await deleteTransaction(transactionId);
      setTransactionPendingDelete(null);
      await refresh();
    } finally {
      setDeletingTransactionId((current) =>
        current === transactionId ? null : current
      );
    }
  }

  async function handleEditSubmit(values: ReturnType<typeof toTransactionFormValues>) {
    if (!editingTransaction) {
      return;
    }

    await updateTransaction(
      editingTransaction.id,
      toSaveTransactionInput(values)
    );
    setEditingTransaction(null);
    await refresh();
  }

  return (
    <Screen
      eyebrow="Registro local"
      title="Movimientos"
      description="Consulta el detalle del período elegido y filtra tus registros guardados."
      topInset
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <PeriodSwitcher
          label="Período seleccionado"
          onNext={goToNextMonth}
          onPrevious={goToPreviousMonth}
          value={formatPeriodLabel(selectedMonth, selectedYear)}
        />

        <SurfaceCard style={styles.filtersBlock}>
          <View style={styles.filtersHeader}>
            <SectionIntro
              description="Ajusta tipo, cuenta y categoría para leer el registro con más foco."
              iconName="options-outline"
              style={styles.filtersIntro}
              title="Filtros rápidos"
            />
            <Pressable
              onPress={() => {
                resetTransactionFilters();
                setOpenFilter(null);
              }}
              style={styles.resetFiltersButton}
            >
              <Text style={styles.resetText}>Limpiar filtros</Text>
            </Pressable>
          </View>

          <FilterSelect
            iconName="swap-horizontal-outline"
            isOpen={openFilter === 'type'}
            label="Tipo"
            onToggle={() =>
              setOpenFilter((current) => (current === 'type' ? null : 'type'))
            }
            options={typeOptions}
            selectedId={transactionFilters.type ?? 'all'}
            onSelect={(value) => {
              setTransactionFilters({
                type: value === 'all' ? null : (value as TransactionType),
                categoryId: null,
              });
              setOpenFilter(null);
            }}
          />

          <FilterSelect
            iconName="wallet-outline"
            isOpen={openFilter === 'account'}
            label="Cuenta"
            onToggle={() =>
              setOpenFilter((current) => (current === 'account' ? null : 'account'))
            }
            options={accountOptions}
            selectedId={transactionFilters.accountId ?? 'all'}
            onSelect={(value) => {
              setTransactionFilters({
                accountId: value === 'all' ? null : value,
              });
              setOpenFilter(null);
            }}
          />

          {transactionFilters.type !== 'transfer' ? (
            <FilterSelect
              iconName="pricetags-outline"
              isOpen={openFilter === 'category'}
              label="Categoría"
              onToggle={() =>
                setOpenFilter((current) =>
                  current === 'category' ? null : 'category'
                )
              }
              options={categoryOptions}
              selectedId={transactionFilters.categoryId ?? 'all'}
              onSelect={(value) => {
                setTransactionFilters({
                  categoryId: value === 'all' ? null : value,
                });
                setOpenFilter(null);
              }}
            />
          ) : null}
        </SurfaceCard>

        {isLoading ? (
          <StateCard
            description="Cargando movimientos..."
            loading
            title="Preparando registros"
          />
        ) : null}

        {!isLoading && errorMessage ? (
          <StateCard
            description={errorMessage}
            iconName="alert-circle-outline"
            title="No se pudieron cargar los movimientos"
            tone="error"
          />
        ) : null}

        {!isLoading && !errorMessage && mutationErrorMessage ? (
          <StateCard
            description={mutationErrorMessage}
            iconName="close-circle-outline"
            title="No se pudo completar la acción"
            tone="error"
          />
        ) : null}

        {!isLoading && !errorMessage && transactions.length === 0 ? (
          <StateCard
            description="Ajusta el período o crea un nuevo movimiento desde la tab central."
            iconName="swap-horizontal-outline"
            title="No hay movimientos para este filtro"
          />
        ) : null}

        {!isLoading && !errorMessage
          ? transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIdentity}>
                    <View
                      style={[
                        styles.transactionBadge,
                        transaction.type === 'expense'
                          ? styles.transactionBadgeNegative
                          : transaction.type === 'transfer'
                            ? styles.transactionBadgeNeutral
                            : styles.transactionBadgePositive,
                      ]}
                    >
                      <Ionicons
                        color={
                          transaction.type === 'expense'
                            ? colors.danger
                            : transaction.type === 'transfer'
                              ? colors.text
                              : colors.success
                        }
                        name={getTransactionTypeIconName(transaction.type)}
                        size={18}
                      />
                    </View>
                    <View style={styles.transactionCopy}>
                      <Text style={styles.transactionType}>
                        {getTransactionTypeLabel(transaction.type)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatTransactionDate(transaction.date)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.type === 'expense'
                        ? styles.transactionAmountExpense
                        : transaction.type === 'transfer'
                          ? styles.transactionAmountTransfer
                          : styles.transactionAmountPositive,
                    ]}
                  >
                    {getTransactionAmountPrefix(transaction.type)}
                    {formatMoneyInPesos(transaction.amount)}
                  </Text>
                </View>

                <Text style={styles.transactionContext}>
                  {getTransactionContextLabel(
                    transaction,
                    accountNameById,
                    categoryNameById
                  )}
                </Text>

                {transaction.note ? (
                  <Text style={styles.transactionNote}>{transaction.note}</Text>
                ) : null}

                <View style={styles.transactionActions}>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => setEditingTransaction(transaction)}
                    style={[
                      styles.editButton,
                      isSubmitting ? styles.actionButtonDisabled : null,
                    ]}
                  >
                    <Ionicons color={colors.text} name="create-outline" size={16} />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => handleDeletePress(transaction)}
                    style={[
                      styles.deleteButton,
                      isSubmitting ? styles.actionButtonDisabled : null,
                    ]}
                  >
                    {deletingTransactionId === transaction.id ? (
                      <ActivityIndicator color={colors.danger} size="small" />
                    ) : (
                      <Ionicons
                        color={colors.danger}
                        name="trash-outline"
                        size={16}
                      />
                    )}
                    <Text style={styles.deleteButtonText}>
                      {deletingTransactionId === transaction.id
                        ? 'Eliminando...'
                        : 'Eliminar'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          : null}
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setEditingTransaction(null)}
        transparent
        visible={editingTransaction !== null}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            onPress={() => setEditingTransaction(null)}
            style={styles.modalBackdrop}
          />
          <View style={styles.editSheet}>
            <View style={styles.editSheetHandle} />
            {editingTransaction ? (
              <TransactionForm
                key={editingTransaction.id}
                accounts={accounts}
                categories={categories}
                defaultValues={toTransactionFormValues(editingTransaction)}
                description="Ajusta monto, cuentas, categoría o fecha sin salir del registro."
                errorMessage={mutationErrorMessage}
                isLoadingReferences={isLoading}
                isSubmitting={isSubmitting}
                onCancel={() => setEditingTransaction(null)}
                onSubmit={handleEditSubmit}
                presentation="sheet"
                referenceErrorMessage={errorMessage}
                submitLabel="Guardar cambios"
                title="Editar movimiento"
              />
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setTransactionPendingDelete(null)}
        transparent
        visible={transactionPendingDelete !== null}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            disabled={deletingTransactionId === transactionPendingDelete?.id}
            onPress={() => setTransactionPendingDelete(null)}
            style={styles.modalBackdrop}
          />
          <View style={styles.deleteSheet}>
            <View style={styles.editSheetHandle} />
            <SheetHeader
              description="Se quitará del registro y dejará de impactar en tus métricas y gráficos."
              iconName="trash-outline"
              title="Eliminar movimiento"
              tone="danger"
            />

            {transactionPendingDelete ? (
              <View style={styles.deleteSummaryCard}>
                <Text style={styles.deleteSummaryType}>
                  {getTransactionTypeLabel(transactionPendingDelete.type)}
                </Text>
                <Text style={styles.deleteSummaryAmount}>
                  {getTransactionAmountPrefix(transactionPendingDelete.type)}
                  {formatMoneyInPesos(transactionPendingDelete.amount)}
                </Text>
                <Text style={styles.deleteSummaryMeta}>
                  {formatTransactionDate(transactionPendingDelete.date)} -{' '}
                  {getTransactionContextLabel(
                    transactionPendingDelete,
                    accountNameById,
                    categoryNameById
                  )}
                </Text>
              </View>
            ) : null}

            <View style={styles.deleteActions}>
              <ActionButton
                disabled={deletingTransactionId === transactionPendingDelete?.id}
                label="Cancelar"
                onPress={() => setTransactionPendingDelete(null)}
                style={styles.deleteAction}
                variant="secondary"
              />
              <ActionButton
                disabled={deletingTransactionId === transactionPendingDelete?.id}
                iconName="trash-outline"
                label="Eliminar"
                loading={deletingTransactionId === transactionPendingDelete?.id}
                onPress={() => {
                  void confirmDeleteTransaction();
                }}
                style={styles.deleteAction}
                variant="danger"
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

type FilterOption = {
  id: string;
  label: string;
};

type FilterSelectProps = {
  iconName: IconName;
  isOpen: boolean;
  label: string;
  options: FilterOption[];
  selectedId: string;
  onToggle: () => void;
  onSelect: (id: string) => void;
};

function FilterSelect({
  iconName,
  isOpen,
  label,
  options,
  selectedId,
  onToggle,
  onSelect,
}: FilterSelectProps) {
  const selectedOption =
    options.find((item) => item.id === selectedId) ?? options[0] ?? null;

  return (
    <View style={styles.filterSelect}>
      <Pressable onPress={onToggle} style={styles.filterTrigger}>
        <View style={styles.filterTriggerMain}>
          <View style={styles.filterIcon}>
            <Ionicons color={colors.text} name={iconName} size={18} />
          </View>
          <View style={styles.filterTriggerCopy}>
            <Text style={styles.filterLabel}>{label}</Text>
            <Text style={styles.filterValue}>
              {selectedOption?.label ?? 'Selecciona una opción'}
            </Text>
          </View>
        </View>
        <Ionicons
          color={colors.muted}
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.filterMenu}>
          {options.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <Pressable
                key={item.id}
                onPress={() => onSelect(item.id)}
                style={[
                  styles.filterOption,
                  isSelected ? styles.filterOptionSelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    isSelected ? styles.filterOptionTextSelected : null,
                  ]}
                >
                  {item.label}
                </Text>
                {isSelected ? (
                  <Ionicons color={colors.text} name="checkmark" size={16} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function getTransactionContextLabel(
  transaction: Transaction,
  accountNameById: Map<string, string>,
  categoryNameById: Map<string, string>
) {
  if (transaction.type === 'transfer') {
    const fromAccountName =
      (transaction.fromAccountId
        ? accountNameById.get(transaction.fromAccountId)
        : null) ?? 'Cuenta origen';
    const toAccountName =
      (transaction.toAccountId ? accountNameById.get(transaction.toAccountId) : null) ??
      'Cuenta destino';

    return `${fromAccountName} -> ${toAccountName}`;
  }

  const accountName =
    (transaction.accountId ? accountNameById.get(transaction.accountId) : null) ??
    'Cuenta';
  const categoryName =
    (transaction.categoryId ? categoryNameById.get(transaction.categoryId) : null) ??
    'Categoría';

  return `${categoryName} - ${accountName}`;
}

function getTransactionTypeIconName(type: TransactionType): IconName {
  if (type === 'income') {
    return 'arrow-down-circle-outline';
  }

  if (type === 'expense') {
    return 'arrow-up-circle-outline';
  }

  if (type === 'yield') {
    return 'sparkles-outline';
  }

  return 'swap-horizontal-outline';
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 18,
    paddingBottom: 32,
  },
  filtersBlock: {
    gap: 16,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  filtersIntro: {
    flex: 1,
  },
  resetFiltersButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  resetText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterSelect: {
    gap: 10,
  },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  filterTriggerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  filterTriggerCopy: {
    flex: 1,
    gap: 2,
  },
  filterLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  filterValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  filterMenu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  filterOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterOptionSelected: {
    backgroundColor: colors.surfaceAccent,
  },
  filterOptionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  filterOptionTextSelected: {
    color: colors.text,
  },
  transactionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  transactionIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionBadgePositive: {
    backgroundColor: colors.surfaceSuccess,
  },
  transactionBadgeNegative: {
    backgroundColor: colors.surfaceError,
  },
  transactionBadgeNeutral: {
    backgroundColor: colors.surfaceAccent,
  },
  transactionCopy: {
    flex: 1,
    gap: 4,
  },
  transactionType: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  transactionDate: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionAmountPositive: {
    color: colors.success,
  },
  transactionAmountExpense: {
    color: colors.danger,
  },
  transactionAmountTransfer: {
    color: colors.text,
  },
  transactionContext: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  transactionNote: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  transactionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surfaceError,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonDisabled: {
    opacity: 0.72,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 9, 13, 0.62)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  editSheet: {
    height: '88%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },
  editSheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  deleteSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
    gap: 18,
  },
  deleteSummaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  deleteSummaryType: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deleteSummaryAmount: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  deleteSummaryMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteAction: {
    flex: 1,
    minHeight: 52,
  },
});
