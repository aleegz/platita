import type { ComponentProps, PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ActionButton,
  FormFieldLabel,
  Screen,
  SheetHeader,
  StateCard,
  SurfaceCard,
} from '../../../components';
import { animateNextLayout } from '../../../lib/motion';
import { colors } from '../../../theme';
import type { Account, Category, TransactionType } from '../../../types/domain';
import { transactionFormSchema } from '../schema';
import {
  createDefaultTransactionFormValues,
  formatMoneyInPesos,
  getTransactionTypeLabel,
  getTransactionTypeDescription,
  transactionTypeOptions,
  type TransactionFormValues,
} from '../types';

type IconName = ComponentProps<typeof Ionicons>['name'];

type TransactionFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  accounts: Account[];
  categories: Category[];
  requireConfirmation?: boolean;
  groupFieldsInCards?: boolean;
  isLoadingReferences?: boolean;
  referenceErrorMessage?: string | null;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  defaultValues?: TransactionFormValues;
  onCancel?: () => void;
  onSubmit: (values: TransactionFormValues) => Promise<void> | void;
  presentation?: 'screen' | 'sheet';
};

export function TransactionForm({
  title,
  description,
  submitLabel,
  accounts,
  categories,
  requireConfirmation = false,
  groupFieldsInCards = false,
  isLoadingReferences = false,
  referenceErrorMessage,
  errorMessage,
  isSubmitting = false,
  defaultValues = createDefaultTransactionFormValues(),
  onCancel,
  onSubmit,
  presentation = 'screen',
}: TransactionFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [pendingConfirmation, setPendingConfirmation] =
    useState<TransactionFormValues | null>(null);
  const selectedType = watch('type');
  const previousTypeRef = useRef(selectedType);
  const filteredCategories = categories.filter(
    (category) => selectedType !== 'transfer' && category.type === selectedType
  );
  const selectedCategoriesAvailable =
    selectedType === 'transfer' ? true : filteredCategories.length > 0;
  const submitDisabled =
    isSubmitting ||
    isLoadingReferences ||
    accounts.length === 0 ||
    !selectedCategoriesAvailable;
  const contentBottomInset =
    presentation === 'screen' ? bottomTabBarHeight + 48 : 28;

  function closeConfirmationModal() {
    if (isSubmitting) {
      return;
    }

    setPendingConfirmation(null);
  }

  async function confirmPendingTransaction() {
    if (!pendingConfirmation) {
      return;
    }

    try {
      await onSubmit(pendingConfirmation);
      setPendingConfirmation(null);
    } catch {
      setPendingConfirmation(null);
    }
  }

  async function submitTransaction(values: TransactionFormValues) {
    if (requireConfirmation) {
      setPendingConfirmation(values);
      return;
    }

    await onSubmit(values);
  }

  useEffect(() => {
    if (previousTypeRef.current === selectedType) {
      return;
    }

    previousTypeRef.current = selectedType;
    animateNextLayout();
    setValue('categoryId', '');

    if (selectedType === 'transfer') {
      setValue('accountId', '');
      return;
    }

    setValue('fromAccountId', '');
    setValue('toAccountId', '');
  }, [selectedType, setValue]);

  const formContent = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardArea}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomInset },
          presentation === 'sheet' ? styles.sheetScrollContent : null,
        ]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.form, presentation === 'sheet' ? styles.sheetForm : null]}>
          {presentation === 'sheet' ? (
            <SheetHeader
              description={description}
              iconName="create-outline"
              onClose={onCancel}
              title={title}
            />
          ) : null}

          <FormSectionCard
            description="Elige cómo impactará este movimiento en tus cuentas."
            enabled={groupFieldsInCards}
            iconName="swap-horizontal-outline"
            title="Tipo de movimiento"
          >
            <View style={styles.fieldGroup}>
              <FormFieldLabel iconName="swap-horizontal-outline" label="Tipo" />
              <Text style={styles.helperText}>
                {getTransactionTypeDescription(selectedType)}
              </Text>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <View style={styles.optionGrid}>
                    {transactionTypeOptions.map((option) => {
                      const isSelected = field.value === option.value;

                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => field.onChange(option.value)}
                          style={[
                            styles.choiceCard,
                            isSelected ? styles.choiceCardSelected : null,
                          ]}
                        >
                          <Ionicons
                            color={isSelected ? colors.primaryText : colors.text}
                            name={getTransactionTypeIconName(option.value)}
                            size={18}
                          />
                          <Text
                            style={[
                              styles.choiceLabel,
                              isSelected ? styles.choiceLabelSelected : null,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
              {errors.type?.message ? (
                <Text style={styles.errorText}>{errors.type.message}</Text>
              ) : null}
            </View>
          </FormSectionCard>

          <FormSectionCard
            description="Carga el importe que quieres registrar."
            enabled={groupFieldsInCards}
            iconName="cash-outline"
            title="Monto"
          >
            <View style={styles.fieldGroup}>
            <FormFieldLabel iconName="cash-outline" label="Monto" />
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <TextInput
                  keyboardType="number-pad"
                  onBlur={field.onBlur}
                  onChangeText={(value) => field.onChange(parseMoneyInput(value))}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  style={[
                    styles.input,
                    errors.amount ? styles.inputError : null,
                  ]}
                  value={field.value > 0 ? String(field.value) : ''}
                />
              )}
            />
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Text style={styles.previewText}>
                  Vista previa: {formatMoneyInPesos(field.value)}
                </Text>
              )}
            />
            <Text style={styles.helperText}>
              Escribe solo números. Los últimos dos dígitos son los centavos.
            </Text>
            {errors.amount?.message ? (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            ) : null}
            </View>
          </FormSectionCard>

          <FormSectionCard
            description={
              selectedType === 'transfer'
                ? 'Define desde qué cuenta sale el dinero y a cuál entra.'
                : 'Selecciona la cuenta que impacta y la categoría asociada.'
            }
            enabled={groupFieldsInCards}
            iconName={selectedType === 'transfer' ? 'swap-horizontal-outline' : 'wallet-outline'}
            title={selectedType === 'transfer' ? 'Cuentas involucradas' : 'Cuenta y categoría'}
          >
            {selectedType === 'transfer' ? (
              <>
              <AccountSelectionField
                accounts={accounts}
                control={control}
                errorMessage={errors.fromAccountId?.message}
                label="Cuenta de origen"
                name="fromAccountId"
              />
              <AccountSelectionField
                accounts={accounts}
                control={control}
                errorMessage={errors.toAccountId?.message}
                label="Cuenta de destino"
                name="toAccountId"
              />
            </>
          ) : (
            <>
              <AccountSelectionField
                accounts={accounts}
                control={control}
                errorMessage={errors.accountId?.message}
                label="Cuenta"
                name="accountId"
              />
              <CategorySelectionField
                categories={filteredCategories}
                control={control}
                errorMessage={errors.categoryId?.message}
              />
              </>
            )}
          </FormSectionCard>

          <FormSectionCard
            description="Elige la fecha que corresponde a este movimiento."
            enabled={groupFieldsInCards}
            iconName="calendar-outline"
            title="Fecha"
          >
            <View style={styles.fieldGroup}>
              <FormFieldLabel iconName="calendar-outline" label="Fecha" />
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DateField
                    errorMessage={errors.date?.message}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
            </View>
          </FormSectionCard>

          <FormSectionCard
            description="Agrega contexto extra para recordar mejor este movimiento."
            enabled={groupFieldsInCards}
            iconName="document-text-outline"
            title="Notas"
          >
            <View style={styles.fieldGroup}>
              <FormFieldLabel iconName="document-text-outline" label="Nota" />
              <Controller
                control={control}
                name="note"
                render={({ field }) => (
                  <TextInput
                    multiline
                    numberOfLines={3}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder="Opcional"
                    placeholderTextColor={colors.muted}
                    style={[styles.input, styles.textArea]}
                    textAlignVertical="top"
                    value={field.value}
                  />
                )}
              />
              {errors.note?.message ? (
                <Text style={styles.errorText}>{errors.note.message}</Text>
              ) : null}
            </View>
          </FormSectionCard>

          {isLoadingReferences ? (
            <StateCard
              align="left"
              description="Cargando cuentas y categorías..."
              loading
              title="Preparando referencias"
            />
          ) : null}

          {!isLoadingReferences && accounts.length === 0 ? (
            <StateCard
              align="left"
              description="Necesitas al menos una cuenta activa para registrar movimientos."
              iconName="wallet-outline"
              title="Falta una cuenta activa"
              tone="warning"
            />
          ) : null}

          {!isLoadingReferences &&
          selectedType !== 'transfer' &&
          filteredCategories.length === 0 ? (
            <StateCard
              align="left"
              description="No hay categorías activas disponibles para este tipo de movimiento."
              iconName="pricetags-outline"
              title="Faltan categorías disponibles"
              tone="warning"
            />
          ) : null}

          {referenceErrorMessage ? (
            <StateCard
              align="left"
              description={referenceErrorMessage}
              iconName="alert-circle-outline"
              title="No se pudieron cargar las referencias"
              tone="error"
            />
          ) : null}

          {errorMessage ? (
            <StateCard
              align="left"
              description={errorMessage}
              iconName="close-circle-outline"
              title="No se pudo guardar el movimiento"
              tone="error"
            />
          ) : null}

          <ActionButton
            disabled={submitDisabled}
            iconName="checkmark-circle-outline"
            label={submitLabel}
            loading={isSubmitting}
            onPress={handleSubmit(submitTransaction)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const confirmationModal = requireConfirmation ? (
    <TransactionConfirmationModal
      accounts={accounts}
      categories={categories}
      isSubmitting={isSubmitting}
      onCancel={closeConfirmationModal}
      onConfirm={confirmPendingTransaction}
      value={pendingConfirmation}
    />
  ) : null;

  if (presentation === 'sheet') {
    return (
      <>
        {formContent}
        {confirmationModal}
      </>
    );
  }

  return (
    <>
      <Screen title={title} description={description} topInset>
        <StatusBar style="light" />
        {formContent}
      </Screen>
      {confirmationModal}
    </>
  );
}

type FormSectionCardProps = PropsWithChildren<{
  title: string;
  description: string;
  iconName: IconName;
  enabled: boolean;
}>;

function FormSectionCard({
  title,
  description,
  iconName,
  enabled,
  children,
}: FormSectionCardProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <SurfaceCard style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionCardIcon}>
          <Ionicons color={colors.text} name={iconName} size={18} />
        </View>
        <View style={styles.sectionCardCopy}>
          <Text style={styles.sectionCardTitle}>{title}</Text>
          <Text style={styles.sectionCardDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.sectionCardContent}>{children}</View>
    </SurfaceCard>
  );
}

type TransactionConfirmationModalProps = {
  value: TransactionFormValues | null;
  accounts: Account[];
  categories: Category[];
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function TransactionConfirmationModal({
  value,
  accounts,
  categories,
  isSubmitting,
  onCancel,
  onConfirm,
}: TransactionConfirmationModalProps) {
  if (!value) {
    return null;
  }

  const summaryItems = getTransactionConfirmationItems(value, accounts, categories);

  return (
    <Modal
      animationType="fade"
      onRequestClose={isSubmitting ? () => undefined : onCancel}
      transparent
      visible
    >
      <View style={[styles.overlay, styles.overlayCenter, styles.confirmationOverlay]}>
        {!isSubmitting ? (
          <Pressable onPress={onCancel} style={styles.overlayBackdrop} />
        ) : null}
        <View style={styles.confirmationCard}>
          <View style={styles.confirmationHeader}>
            <View style={styles.confirmationIcon}>
              <Ionicons
                color={colors.text}
                name={getTransactionTypeIconName(value.type)}
                size={24}
              />
            </View>
            <View style={styles.confirmationCopy}>
              <Text style={styles.confirmationTitle}>Confirmar movimiento</Text>
              <Text style={styles.confirmationDescription}>
                Revisa el resumen antes de guardar este movimiento.
              </Text>
            </View>
          </View>

          <View style={styles.confirmationSummary}>
            {summaryItems.map((item) => (
              <View key={item.label} style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>{item.label}</Text>
                <Text
                  style={[
                    styles.confirmationValue,
                    item.emphasis ? styles.confirmationValueEmphasis : null,
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.confirmationActions}>
            <ActionButton
              disabled={isSubmitting}
              label="Cancelar"
              onPress={onCancel}
              style={styles.confirmationAction}
              variant="secondary"
            />
            <ActionButton
              iconName="checkmark-circle-outline"
              label="Confirmar"
              loading={isSubmitting}
              onPress={onConfirm}
              style={styles.confirmationAction}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

type DateFieldProps = {
  value: string;
  errorMessage?: string;
  onBlur: () => void;
  onChange: (value: string) => void;
};

function DateField({ value, errorMessage, onBlur, onChange }: DateFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setIsPickerVisible(true)}
        style={[styles.dateButton, errorMessage ? styles.inputError : null]}
      >
        <View style={styles.dateButtonCopy}>
          <Text style={styles.dateButtonLabel}>
            {formatDateLongLabel(value)}
          </Text>
          <Text style={styles.dateButtonValue}>{value}</Text>
        </View>
        <Ionicons color={colors.muted} name="chevron-forward" size={18} />
      </Pressable>
      <Text style={styles.helperText}>
        Se completa con el día actual y puedes ajustarla desde el modal.
      </Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <DatePickerModal
        visible={isPickerVisible}
        value={value}
        onClose={() => setIsPickerVisible(false)}
        onConfirm={(nextValue) => {
          onChange(nextValue);
          onBlur();
          setIsPickerVisible(false);
        }}
      />
    </>
  );
}

type DatePickerModalProps = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

function DatePickerModal({
  visible,
  value,
  onClose,
  onConfirm,
}: DatePickerModalProps) {
  const fallbackDate = parseIsoDate(value) ?? new Date();
  const [draftYear, setDraftYear] = useState(fallbackDate.getFullYear());
  const [draftMonth, setDraftMonth] = useState(fallbackDate.getMonth() + 1);
  const [draftDay, setDraftDay] = useState(fallbackDate.getDate());
  const currentYear = new Date().getFullYear();
  const yearStart = Math.min(draftYear, currentYear) - 10;
  const yearEnd = Math.max(draftYear, currentYear) + 4;
  const yearOptions = Array.from(
    { length: yearEnd - yearStart + 1 },
    (_, index) => yearStart + index
  ).reverse();
  const dayOptions = Array.from(
    { length: getDaysInMonth(draftYear, draftMonth) },
    (_, index) => index + 1
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const nextDate = parseIsoDate(value) ?? new Date();

    setDraftYear(nextDate.getFullYear());
    setDraftMonth(nextDate.getMonth() + 1);
    setDraftDay(nextDate.getDate());
  }, [value, visible]);

  useEffect(() => {
    setDraftDay((currentDay) =>
      Math.min(currentDay, getDaysInMonth(draftYear, draftMonth))
    );
  }, [draftMonth, draftYear]);

  function applyRelativeDate(offsetInDays: number) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + offsetInDays);

    setDraftYear(nextDate.getFullYear());
    setDraftMonth(nextDate.getMonth() + 1);
    setDraftDay(nextDate.getDate());
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.overlayBackdrop} />
        <View style={styles.dateModalCard}>
          <View style={styles.sheetHandle} />
          <View style={styles.dateModalHeader}>
            <Pressable onPress={onClose} style={styles.sheetSecondaryAction}>
              <Text style={styles.sheetSecondaryActionText}>Cancelar</Text>
            </Pressable>
            <Text style={styles.dateModalTitle}>Elegir fecha</Text>
            <Pressable
              onPress={() =>
                onConfirm(buildIsoDate(draftYear, draftMonth, draftDay))
              }
              style={styles.sheetPrimaryAction}
            >
              <Text style={styles.sheetPrimaryActionText}>Listo</Text>
            </Pressable>
          </View>

          <Text style={styles.datePreview}>
            {formatDateLongLabel(buildIsoDate(draftYear, draftMonth, draftDay))}
          </Text>

          <View style={styles.quickActionRow}>
            <QuickDateAction label="Hoy" onPress={() => applyRelativeDate(0)} />
            <QuickDateAction label="Ayer" onPress={() => applyRelativeDate(-1)} />
          </View>

          <View style={styles.datePickerColumns}>
            <PickerColumn
              label="Dia"
              options={dayOptions}
              selectedValue={draftDay}
              onSelect={setDraftDay}
              renderLabel={(option) => String(option).padStart(2, '0')}
            />
            <PickerColumn
              label="Mes"
              options={monthOptions.map((_, index) => index + 1)}
              selectedValue={draftMonth}
              onSelect={setDraftMonth}
              renderLabel={(option) => monthOptions[option - 1] ?? String(option)}
            />
            <PickerColumn
              label="Año"
              options={yearOptions}
              selectedValue={draftYear}
              onSelect={setDraftYear}
              renderLabel={(option) => String(option)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

type PickerColumnProps = {
  label: string;
  options: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  renderLabel: (value: number) => string;
};

function PickerColumn({
  label,
  options,
  selectedValue,
  onSelect,
  renderLabel,
}: PickerColumnProps) {
  return (
    <View style={styles.pickerColumn}>
      <Text style={styles.pickerColumnLabel}>{label}</Text>
      <ScrollView
        contentContainerStyle={styles.pickerColumnContent}
        showsVerticalScrollIndicator={false}
        style={styles.pickerColumnList}
      >
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <Pressable
              key={`${label}-${option}`}
              onPress={() => onSelect(option)}
              style={[
                styles.pickerOption,
                isSelected ? styles.pickerOptionSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  isSelected ? styles.pickerOptionTextSelected : null,
                ]}
              >
                {renderLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

type QuickDateActionProps = {
  label: string;
  onPress: () => void;
};

function QuickDateAction({ label, onPress }: QuickDateActionProps) {
  return (
    <Pressable onPress={onPress} style={styles.quickActionButton}>
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

type AccountSelectionFieldProps = {
  accounts: Account[];
  control: ReturnType<typeof useForm<TransactionFormValues>>['control'];
  errorMessage?: string;
  label: string;
  name: 'accountId' | 'fromAccountId' | 'toAccountId';
};

function AccountSelectionField({
  accounts,
  control,
  errorMessage,
  label,
  name,
}: AccountSelectionFieldProps) {
  const iconName =
    name === 'fromAccountId'
      ? 'arrow-up-circle-outline'
      : name === 'toAccountId'
        ? 'arrow-down-circle-outline'
        : 'wallet-outline';

  return (
    <View style={styles.fieldGroup}>
      <FormFieldLabel iconName={iconName} label={label} />
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <View style={styles.optionGrid}>
            {accounts.map((account) => {
              const isSelected = field.value === account.id;

              return (
                <Pressable
                  key={account.id}
                  onPress={() => field.onChange(account.id)}
                  style={[
                    styles.choiceCard,
                    isSelected ? styles.choiceCardSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceLabel,
                      isSelected ? styles.choiceLabelSelected : null,
                    ]}
                  >
                    {account.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

type CategorySelectionFieldProps = {
  categories: Category[];
  control: ReturnType<typeof useForm<TransactionFormValues>>['control'];
  errorMessage?: string;
};

function CategorySelectionField({
  categories,
  control,
  errorMessage,
}: CategorySelectionFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <FormFieldLabel iconName="pricetags-outline" label="Categoría" />
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <View style={styles.optionGrid}>
            {categories.map((category) => {
              const isSelected = field.value === category.id;

              return (
                <Pressable
                  key={category.id}
                  onPress={() => field.onChange(category.id)}
                  style={[
                    styles.choiceCard,
                    isSelected ? styles.choiceCardSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceLabel,
                      isSelected ? styles.choiceLabelSelected : null,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

type TransactionConfirmationItem = {
  label: string;
  value: string;
  emphasis?: boolean;
};

function getTransactionTypeIconName(type: TransactionType): IconName {
  switch (type) {
    case 'income':
      return 'arrow-down-circle-outline';
    case 'expense':
      return 'arrow-up-circle-outline';
    case 'transfer':
      return 'swap-horizontal-outline';
    case 'yield':
      return 'sparkles-outline';
  }
}

function getTransactionConfirmationItems(
  values: TransactionFormValues,
  accounts: Account[],
  categories: Category[]
): TransactionConfirmationItem[] {
  const items: TransactionConfirmationItem[] = [
    {
      label: 'Tipo',
      value: getTransactionTypeLabel(values.type),
    },
    {
      label: 'Monto',
      value: formatMoneyInPesos(values.amount),
      emphasis: true,
    },
    {
      label: 'Fecha',
      value: formatDateLongLabel(values.date),
    },
  ];

  if (values.type === 'transfer') {
    items.push(
      {
        label: 'Cuenta de origen',
        value: getAccountNameById(accounts, values.fromAccountId),
      },
      {
        label: 'Cuenta de destino',
        value: getAccountNameById(accounts, values.toAccountId),
      }
    );
  } else {
    items.push(
      {
        label: 'Cuenta',
        value: getAccountNameById(accounts, values.accountId),
      },
      {
        label: 'Categoría',
        value: getCategoryNameById(categories, values.categoryId),
      }
    );
  }

  const normalizedNote = values.note.trim();

  if (normalizedNote.length > 0) {
    items.push({
      label: 'Nota',
      value: normalizedNote,
    });
  }

  return items;
}

function getAccountNameById(accounts: Account[], accountId: string) {
  return accounts.find((account) => account.id === accountId)?.name ?? 'Sin seleccionar';
}

function getCategoryNameById(categories: Category[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Sin seleccionar';
}

function parseMoneyInput(value: string) {
  const digits = value.replace(/[^\d]/g, '');

  return digits.length > 0 ? Number(digits) : 0;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function buildIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatDateLongLabel(value: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return 'Selecciona una fecha';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const monthLabel = fullMonthOptions[date.getMonth()] ?? '';
  const year = date.getFullYear();

  return `${day} ${monthLabel} ${year}`;
}

const monthOptions = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const;

const fullMonthOptions = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const styles = StyleSheet.create({
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  sheetScrollContent: {
    paddingTop: 4,
  },
  form: {
    gap: 20,
  },
  sheetForm: {
    gap: 22,
  },
  sectionCard: {
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  sectionCardCopy: {
    flex: 1,
    gap: 4,
  },
  sectionCardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCardDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCardContent: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 104,
  },
  dateButton: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonCopy: {
    flex: 1,
    gap: 4,
  },
  dateButtonLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  dateButtonValue: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  previewText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceCard: {
    flexBasis: '48%',
    flexGrow: 1,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  choiceCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  choiceLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  choiceLabelSelected: {
    color: colors.primaryText,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 9, 13, 0.56)',
  },
  overlayCenter: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmationOverlay: {
    backgroundColor: 'rgba(7, 9, 13, 0.68)',
  },
  confirmationCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 18,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  confirmationIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  confirmationCopy: {
    flex: 1,
    gap: 4,
  },
  confirmationTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  confirmationDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  confirmationSummary: {
    gap: 10,
  },
  confirmationRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  confirmationLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  confirmationValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  confirmationValueEmphasis: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmationAction: {
    flex: 1,
  },
  dateModalCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateModalTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  sheetSecondaryAction: {
    minWidth: 74,
    minHeight: 36,
    justifyContent: 'center',
  },
  sheetSecondaryActionText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  sheetPrimaryAction: {
    minWidth: 74,
    minHeight: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
  },
  sheetPrimaryActionText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '800',
  },
  datePreview: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  datePickerColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerColumn: {
    flex: 1,
    gap: 10,
  },
  pickerColumnList: {
    height: 224,
  },
  pickerColumnLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  pickerColumnContent: {
    gap: 8,
    paddingBottom: 6,
  },
  pickerOption: {
    minHeight: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
  },
  pickerOptionSelected: {
    backgroundColor: colors.accent,
  },
  pickerOptionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  pickerOptionTextSelected: {
    color: colors.primaryText,
    fontWeight: '800',
  },
});
