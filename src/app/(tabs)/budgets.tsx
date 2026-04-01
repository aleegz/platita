import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
} from '../../components';
import { useAppStore } from '../../store/app.store';
import { colors } from '../../theme';
import type { BudgetListItem } from '../../features/budgets/types';
import {
  BudgetEditorForm,
  BudgetStatusBadge,
  formatBudgetMoney,
  formatBudgetPeriod,
  formatBudgetUsagePercentage,
  useBudgets,
  useBudgetMutations,
} from '../../features/budgets';

export default function BudgetsScreen() {
  const { data, errorMessage, isLoading, refresh, selectedMonth, selectedYear } =
    useBudgets();
  const { errorMessage: submitErrorMessage, isSubmitting, upsertBudget } =
    useBudgetMutations();
  const goToPreviousMonth = useAppStore((state) => state.goToPreviousMonth);
  const goToNextMonth = useAppStore((state) => state.goToNextMonth);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const editingItem = useMemo(
    () =>
      data.items.find((item) => item.categoryId === editingCategoryId) ?? null,
    [data.items, editingCategoryId]
  );

  useEffect(() => {
    if (!editingCategoryId) {
      return;
    }

    const exists = data.items.some((item) => item.categoryId === editingCategoryId);

    if (!exists) {
      setEditingCategoryId(null);
    }
  }, [data.items, editingCategoryId]);

  return (
    <Screen
      description="Define un presupuesto por categoría de gasto y compara el uso real del período seleccionado."
      eyebrow="Control mensual"
      title="Presupuestos"
      topInset
    >
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PeriodSwitcher
            label="Período"
            onNext={goToNextMonth}
            onPrevious={goToPreviousMonth}
            value={formatBudgetPeriod(selectedMonth, selectedYear)}
          />

          {isLoading ? (
            <StateCard
              description="Cargando presupuestos..."
              loading
              title="Preparando categorías"
            />
          ) : null}

          {!isLoading && errorMessage ? (
            <StateCard
              description={errorMessage}
              iconName="alert-circle-outline"
              title="No se pudieron cargar los presupuestos"
              tone="error"
            />
          ) : null}

          {!isLoading && !errorMessage && data.items.length === 0 ? (
            <StateCard
              description="Cuando tengas categorías de gasto activas, acá podrás definir su presupuesto mensual."
              iconName="wallet-outline"
              title="No hay categorías de gasto activas"
            />
          ) : null}

          {!isLoading && !errorMessage ? (
            <View style={styles.list}>
              <SectionIntro
                description="Cada categoría conserva como base el valor del mes anterior, pero puedes personalizarla cuando lo necesites."
                iconName="pie-chart-outline"
                style={styles.sectionIntro}
                title="Panorama mensual"
              />
              {data.items.map((item) => (
                <View key={item.categoryId} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetCopy}>
                      <Text style={styles.categoryName}>{item.categoryName}</Text>
                      <Text style={styles.categoryDescription}>
                        {getBudgetDescription(item)}
                      </Text>
                    </View>
                    <BudgetStatusBadge status={item.status} />
                  </View>

                  <View style={styles.metricsStack}>
                    <BudgetValueRow
                      hint={
                        item.source === 'previous_month' && item.fallbackBudget
                          ? `Tomado por defecto de ${formatBudgetPeriod(
                              item.fallbackBudget.month,
                              item.fallbackBudget.year
                            )}`
                          : null
                      }
                      label="Presupuesto"
                      value={
                        item.budgetAmount !== null
                          ? formatBudgetMoney(item.budgetAmount)
                          : 'Sin definir'
                      }
                    />
                    <BudgetUsageRow item={item} />
                    <BudgetValueRow
                      label="Gasto total"
                      tone="negative"
                      value={formatBudgetMoney(item.spentAmount)}
                    />
                    <BudgetValueRow
                      label="Restante"
                      tone={
                        item.remainingAmount !== null && item.remainingAmount < 0
                          ? 'negative'
                          : 'default'
                      }
                      value={
                        item.remainingAmount !== null
                          ? formatBudgetMoney(item.remainingAmount)
                          : '-'
                      }
                    />
                  </View>

                  <Pressable
                    onPress={() => setEditingCategoryId(item.categoryId)}
                    style={[
                      styles.editButton,
                      editingCategoryId === item.categoryId
                        ? styles.editButtonActive
                        : null,
                    ]}
                  >
                    <Text style={styles.editButtonText}>
                      {item.source === 'current'
                        ? editingCategoryId === item.categoryId
                          ? 'Editando presupuesto'
                          : 'Editar presupuesto'
                        : item.source === 'previous_month'
                          ? editingCategoryId === item.categoryId
                            ? 'Personalizando presupuesto'
                            : 'Personalizar presupuesto'
                        : editingCategoryId === item.categoryId
                          ? 'Configurando presupuesto'
                          : 'Configurar presupuesto'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        onRequestClose={() => setEditingCategoryId(null)}
        transparent
        visible={editingItem !== null}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            onPress={() => setEditingCategoryId(null)}
            style={styles.modalBackdrop}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardArea}
          >
            <View style={styles.editSheet}>
              <View style={styles.editSheetHandle} />
              {editingItem ? (
                <BudgetEditorForm
                  key={`${editingItem.categoryId}-${selectedMonth}-${selectedYear}-${editingItem.budgetAmount ?? 'new'}`}
                  categoryName={editingItem.categoryName}
                  defaultBudgetAmount={editingItem.budgetAmount ?? 0}
                  defaultHint={getBudgetDefaultHint(editingItem)}
                  errorMessage={submitErrorMessage}
                  isSubmitting={isSubmitting}
                  month={selectedMonth}
                  presentation="sheet"
                  year={selectedYear}
                  onCancel={() => setEditingCategoryId(null)}
                  onSubmit={async (values) => {
                    await upsertBudget({
                      categoryId: editingItem.categoryId,
                      month: selectedMonth,
                      year: selectedYear,
                      budgetAmount: values.budgetAmount,
                    });
                    await refresh();
                    setEditingCategoryId(null);
                  }}
                />
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Screen>
  );
}

type BudgetValueRowProps = {
  label: string;
  value: string;
  tone?: 'default' | 'negative';
  hint?: string | null;
};

function BudgetValueRow({
  label,
  value,
  tone = 'default',
  hint = null,
}: BudgetValueRowProps) {
  return (
    <View style={styles.metricRowBlock}>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text
          style={[
            styles.metricValue,
            tone === 'negative' ? styles.metricValueNegative : null,
          ]}
        >
          {value}
        </Text>
      </View>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

function BudgetUsageRow({ item }: { item: BudgetListItem }) {
  const usageFillWidth =
    item.usageRatio !== null
      ? (`${Math.min(Math.max(item.usageRatio, 0), 1) * 100}%` as const)
      : ('0%' as const);

  return (
    <View style={styles.metricRowBlock}>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Uso</Text>
        <Text
          style={[
            styles.metricValue,
            item.status === 'warning'
              ? styles.metricValueWarning
              : item.status === 'exceeded'
                ? styles.metricValueNegative
                : null,
          ]}
        >
          {formatBudgetUsagePercentage(item.usagePercentage)}
        </Text>
      </View>

      <View style={styles.usageTrack}>
        <View
          style={[
            styles.usageFill,
            item.status === 'warning'
              ? styles.usageFillWarning
              : item.status === 'exceeded'
                ? styles.usageFillExceeded
                : item.usageRatio !== null
                  ? styles.usageFillNormal
                  : styles.usageFillIdle,
            {
              width: usageFillWidth,
            },
          ]}
        />
      </View>

      <Text style={styles.metricHint}>{getBudgetUsageHint(item)}</Text>
    </View>
  );
}

function getBudgetDescription(item: BudgetListItem) {
  if (item.source === 'none' || item.budgetAmount === null) {
    return 'Todavía no tiene un presupuesto configurado para este mes.';
  }

  if (item.source === 'previous_month' && item.fallbackBudget) {
    return `Se usa por defecto el valor de ${formatBudgetPeriod(
      item.fallbackBudget.month,
      item.fallbackBudget.year
    )} hasta que lo cambies manualmente.`;
  }

  if (item.usagePercentage === null) {
    return 'Presupuesto cargado. El uso se calculará cuando haya una base válida.';
  }

  return `Uso actual: ${formatBudgetUsagePercentage(item.usagePercentage)} del presupuesto mensual.`;
}

function getBudgetDefaultHint(item: BudgetListItem) {
  if (item.source === 'previous_month' && item.fallbackBudget) {
    return `Se precarga ${formatBudgetMoney(
      item.fallbackBudget.budgetAmount
    )} desde ${formatBudgetPeriod(
      item.fallbackBudget.month,
      item.fallbackBudget.year
    )}. Puedes cambiarlo manualmente.`;
  }

  return null;
}

function getBudgetUsageHint(item: BudgetListItem) {
  if (item.source === 'none' || item.usagePercentage === null) {
    return 'Sin presupuesto base para medir el uso.';
  }

  if (item.status === 'exceeded') {
    return 'El gasto ya superó el presupuesto del período.';
  }

  if (item.status === 'warning') {
    return 'El consumo está cerca del límite previsto.';
  }

  return 'Consumo actual respecto del presupuesto disponible.';
}

const styles = StyleSheet.create({
  keyboardArea: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingBottom: 48,
  },
  list: {
    gap: 12,
  },
  sectionIntro: {
    marginBottom: 2,
  },
  budgetCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  budgetCopy: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  categoryDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  metricsStack: {
    gap: 12,
  },
  metricRowBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  metricValueNegative: {
    color: colors.danger,
  },
  metricValueWarning: {
    color: colors.warning,
  },
  metricHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  usageTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceAccent,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: 999,
  },
  usageFillIdle: {
    backgroundColor: colors.border,
  },
  usageFillNormal: {
    backgroundColor: colors.success,
  },
  usageFillWarning: {
    backgroundColor: colors.warning,
  },
  usageFillExceeded: {
    backgroundColor: colors.danger,
  },
  editButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 16,
  },
  editButtonActive: {
    backgroundColor: colors.surfaceMuted,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 14,
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
  modalKeyboardArea: {
    justifyContent: 'flex-end',
  },
  editSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  editSheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
});
