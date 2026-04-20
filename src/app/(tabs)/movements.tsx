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
  SheetHeader,
  StateCard,
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
  const selectedTypeLabel =
    typeOptions.find((option) => option.id === (transactionFilters.type ?? 'all'))?.label ??
    'Todos';
  const selectedAccountLabel =
    accountOptions.find((option) => option.id === (transactionFilters.accountId ?? 'all'))
      ?.label ?? 'Todas';
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.id === (transactionFilters.categoryId ?? 'all'))
      ?.label ?? 'Todas';
  const hasActiveFilters =
    transactionFilters.type !== null ||
    transactionFilters.accountId !== null ||
    transactionFilters.categoryId !== null;
  const activeFilterConfig =
    openFilter === 'type'
      ? {
          iconName: 'swap-horizontal-outline' as const,
          title: 'Filtrar por tipo',
          description: 'Elige qué movimientos querés ver en la lista.',
          options: typeOptions,
          selectedId: transactionFilters.type ?? 'all',
          onSelect: (value: string) => {
            setTransactionFilters({
              type: value === 'all' ? null : (value as TransactionType),
              categoryId: null,
            });
            setOpenFilter(null);
          },
        }
      : openFilter === 'account'
        ? {
            iconName: 'wallet-outline' as const,
            title: 'Filtrar por cuenta',
            description: 'Mostrá solo los movimientos de una cuenta puntual.',
            options: accountOptions,
            selectedId: transactionFilters.accountId ?? 'all',
            onSelect: (value: string) => {
              setTransactionFilters({
                accountId: value === 'all' ? null : value,
              });
              setOpenFilter(null);
            },
          }
        : openFilter === 'category'
          ? {
              iconName: 'pricetags-outline' as const,
              title: 'Filtrar por categoría',
              description: 'Afiná la lista con una categoría específica.',
              options: categoryOptions,
              selectedId: transactionFilters.categoryId ?? 'all',
              onSelect: (value: string) => {
                setTransactionFilters({
                  categoryId: value === 'all' ? null : value,
                });
                setOpenFilter(null);
              },
            }
          : null;

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

        <View style={styles.filtersBlock}>
          <View style={styles.filtersHeader}>
            <View style={styles.filtersHeaderCopy}>
              <Text style={styles.filtersEyebrow}>Filtros rápidos</Text>
              <Text style={styles.filtersTitle}>Ajustá la lista sin tapar movimientos</Text>
            </View>
            <Pressable
              disabled={!hasActiveFilters}
              onPress={() => {
                resetTransactionFilters();
                setOpenFilter(null);
              }}
              style={[
                styles.resetFiltersButton,
                !hasActiveFilters ? styles.resetFiltersButtonDisabled : null,
              ]}
            >
              <Text
                style={[
                  styles.resetText,
                  !hasActiveFilters ? styles.resetTextDisabled : null,
                ]}
              >
                Limpiar
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.filtersRail}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <FilterChip
              iconName="swap-horizontal-outline"
              isActive={transactionFilters.type !== null}
              label="Tipo"
              onPress={() =>
                setOpenFilter((current) => (current === 'type' ? null : 'type'))
              }
              value={selectedTypeLabel}
            />

            <FilterChip
              iconName="wallet-outline"
              isActive={transactionFilters.accountId !== null}
              label="Cuenta"
              onPress={() =>
                setOpenFilter((current) => (current === 'account' ? null : 'account'))
              }
              value={selectedAccountLabel}
            />

            {transactionFilters.type !== 'transfer' ? (
              <FilterChip
                iconName="pricetags-outline"
                isActive={transactionFilters.categoryId !== null}
                label="Categoría"
                onPress={() =>
                  setOpenFilter((current) =>
                    current === 'category' ? null : 'category'
                  )
                }
                value={selectedCategoryLabel}
              />
            ) : null}

            {hasActiveFilters ? (
              <Pressable
                onPress={() => {
                  resetTransactionFilters();
                  setOpenFilter(null);
                }}
                style={styles.clearRailChip}
              >
                <Ionicons color={colors.muted} name="close-circle-outline" size={16} />
                <Text style={styles.clearRailChipText}>Limpiar filtros</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>

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
        animationType="slide"
        onRequestClose={() => setOpenFilter(null)}
        transparent
        visible={activeFilterConfig !== null}
      >
        <View style={styles.modalOverlay}>
          <Pressable onPress={() => setOpenFilter(null)} style={styles.modalBackdrop} />
          <View style={styles.filterSheet}>
            <View style={styles.editSheetHandle} />
            {activeFilterConfig ? (
              <>
                <SheetHeader
                  description={activeFilterConfig.description}
                  iconName={activeFilterConfig.iconName}
                  onClose={() => setOpenFilter(null)}
                  title={activeFilterConfig.title}
                />
                <ScrollView
                  contentContainerStyle={styles.filterSheetContent}
                  showsVerticalScrollIndicator={false}
                >
                  {activeFilterConfig.options.map((item) => {
                    const isSelected = item.id === activeFilterConfig.selectedId;

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => activeFilterConfig.onSelect(item.id)}
                        style={[
                          styles.filterSheetOption,
                          isSelected ? styles.filterSheetOptionSelected : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterSheetOptionText,
                            isSelected ? styles.filterSheetOptionTextSelected : null,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected ? (
                          <Ionicons color={colors.text} name="checkmark-circle" size={18} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

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

type FilterChipProps = {
  iconName: IconName;
  label: string;
  value: string;
  isActive: boolean;
  onPress: () => void;
};

function FilterChip({
  iconName,
  label,
  value,
  isActive,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
    >
      <View style={[styles.filterChipIcon, isActive ? styles.filterChipIconActive : null]}>
        <Ionicons
          color={isActive ? colors.text : colors.muted}
          name={iconName}
          size={16}
        />
      </View>
      <View style={styles.filterChipCopy}>
        <Text numberOfLines={1} style={styles.filterChipLabel}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.filterChipValue}>
          {value}
        </Text>
      </View>
      <Ionicons
        color={isActive ? colors.text : colors.muted}
        name="chevron-down"
        size={16}
      />
    </Pressable>
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
    gap: 12,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filtersHeaderCopy: {
    flex: 1,
  },
  filtersEyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  filtersTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  resetFiltersButton: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  resetFiltersButtonDisabled: {
    opacity: 0.55,
  },
  resetText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  resetTextDisabled: {
    color: colors.muted,
  },
  filtersRail: {
    gap: 10,
    paddingRight: 4,
  },
  filterChip: {
    minWidth: 144,
    maxWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 10,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceAccent,
  },
  filterChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  filterChipIconActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.18)',
  },
  filterChipCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  filterChipLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  filterChipValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  clearRailChip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
  },
  clearRailChipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterSheet: {
    maxHeight: '72%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  filterSheetContent: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterSheetOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterSheetOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceAccent,
  },
  filterSheetOptionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  filterSheetOptionTextSelected: {
    fontWeight: '700',
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
