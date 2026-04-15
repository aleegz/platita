import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBar } from 'expo-status-bar';
import {
  Controller,
  useForm,
  type FieldErrors,
  type SubmitErrorHandler,
} from 'react-hook-form';
import {
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActionButton,
  FormFieldLabel,
  Screen,
  StateCard,
} from '../../../components';
import { createCurrencyFormatter } from '../../../lib/formatters';
import { useKeyboardAwareScroll } from '../../../lib/useKeyboardAwareScroll';
import { colors } from '../../../theme';
import {
  accountTypeOptions,
  defaultAccountFormValues,
  getAccountOpeningBalanceHelperText,
  getAccountOpeningBalanceLabel,
  getAccountOpeningBalancePreviewLabel,
  type SaveAccountInput,
} from '../types';
import { accountFormSchema, type AccountFormValues } from '../schema';

type FormSectionAnchor = 'name' | 'type' | 'initialBalance' | 'submit';

type AccountFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  backLabel?: string;
  defaultValues?: SaveAccountInput;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onBackPress?: () => void;
  showActiveField?: boolean;
  onSubmit: (values: AccountFormValues) => Promise<void> | void;
};

const currencyFormatter = createCurrencyFormatter({
  currency: 'ARS',
});

export function AccountForm({
  title,
  description,
  submitLabel,
  backLabel = 'Volver',
  defaultValues = defaultAccountFormValues,
  errorMessage,
  isSubmitting = false,
  onBackPress,
  showActiveField = false,
  onSubmit,
}: AccountFormProps) {
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });
  const selectedType = watch('type');
  const openingBalanceLabel = getAccountOpeningBalanceLabel(selectedType);
  const openingBalanceHelperText = getAccountOpeningBalanceHelperText(selectedType);
  const openingBalancePreviewLabel =
    getAccountOpeningBalancePreviewLabel(selectedType);
  const { scrollViewRef, createFocusHandler } = useKeyboardAwareScroll();
  const [showSubmitValidationFeedback, setShowSubmitValidationFeedback] = useState(false);
  const sectionOffsetsRef = useRef<Partial<Record<FormSectionAnchor, number>>>({});
  const validationFeedbackMessage =
    showSubmitValidationFeedback && Object.keys(errors).length > 0
      ? 'Revisá los campos marcados antes de continuar.'
      : null;

  function registerSectionOffset(
    anchor: FormSectionAnchor,
    event: LayoutChangeEvent
  ) {
    sectionOffsetsRef.current[anchor] = event.nativeEvent.layout.y;
  }

  function scrollToAnchor(anchor: FormSectionAnchor) {
    const offset = sectionOffsetsRef.current[anchor];

    if (typeof offset !== 'number') {
      return;
    }

    scrollViewRef.current?.scrollTo({
      y: Math.max(offset - 24, 0),
      animated: true,
    });
  }

  function resolveFirstErrorAnchor(
    formErrors: FieldErrors<AccountFormValues>
  ): FormSectionAnchor {
    const orderedFields: Array<{
      anchor: FormSectionAnchor;
      fields: Array<keyof AccountFormValues>;
    }> = [
      { anchor: 'name', fields: ['name'] },
      { anchor: 'type', fields: ['type'] },
      { anchor: 'initialBalance', fields: ['initialBalance'] },
    ];

    const matchingSection = orderedFields.find(({ fields }) =>
      fields.some((fieldName) => Boolean(formErrors[fieldName]))
    );

    return matchingSection?.anchor ?? 'submit';
  }

  const handleInvalidSubmit: SubmitErrorHandler<AccountFormValues> = (formErrors) => {
    setShowSubmitValidationFeedback(true);
    scrollToAnchor(resolveFirstErrorAnchor(formErrors));
  };

  useEffect(() => {
    if (showSubmitValidationFeedback && Object.keys(errors).length === 0) {
      setShowSubmitValidationFeedback(false);
    }
  }, [errors, showSubmitValidationFeedback]);

  return (
    <Screen
      description={description}
      title={title}
      topBar={onBackPress ? (
        <View style={styles.navigationBar}>
          <Pressable
            accessibilityRole="button"
            onPress={onBackPress}
            style={styles.backButton}
          >
            <Ionicons color={colors.text} name="chevron-back" size={20} />
            <Text style={styles.backButtonLabel}>{backLabel}</Text>
          </Pressable>
        </View>
      ) : null}
      topInset={Boolean(onBackPress)}
    >
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardArea}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View
              onLayout={(event) => registerSectionOffset('name', event)}
              style={styles.fieldGroup}
            >
              <FormFieldLabel iconName="card-outline" label="Nombre" />
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextInput
                    autoCapitalize="words"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    onFocus={createFocusHandler()}
                    placeholder="Ejemplo: Mercado Pago"
                    placeholderTextColor={colors.muted}
                    style={[
                      styles.input,
                      errors.name ? styles.inputError : null,
                    ]}
                    value={field.value}
                  />
                )}
              />
              {errors.name?.message ? (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              ) : null}
            </View>

            <View
              onLayout={(event) => registerSectionOffset('type', event)}
              style={styles.fieldGroup}
            >
              <FormFieldLabel iconName="layers-outline" label="Tipo de cuenta" />
              <View style={styles.typeList}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <>
                      {accountTypeOptions.map((option) => {
                        const isSelected = field.value === option.value;

                        return (
                          <Pressable
                            key={option.value}
                            onPress={() => field.onChange(option.value)}
                            style={[
                              styles.typeCard,
                              isSelected ? styles.typeCardSelected : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.typeLabel,
                                isSelected ? styles.typeLabelSelected : null,
                              ]}
                            >
                              {option.label}
                            </Text>
                            <Text
                              style={[
                                styles.typeDescription,
                                isSelected
                                  ? styles.typeDescriptionSelected
                                  : null,
                              ]}
                            >
                              {option.description}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </>
                  )}
                />
              </View>
              {errors.type?.message ? (
                <Text style={styles.errorText}>{errors.type.message}</Text>
              ) : null}
            </View>

            <View
              onLayout={(event) => registerSectionOffset('initialBalance', event)}
              style={styles.fieldGroup}
            >
              <FormFieldLabel iconName="cash-outline" label={openingBalanceLabel} />
              <Controller
                control={control}
                name="initialBalance"
                render={({ field }) => (
                  <TextInput
                    keyboardType="number-pad"
                    onBlur={field.onBlur}
                    onChangeText={(value) => field.onChange(parseMoneyInput(value))}
                    onFocus={createFocusHandler()}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    style={[
                      styles.input,
                      errors.initialBalance ? styles.inputError : null,
                    ]}
                    value={String(field.value)}
                  />
                )}
              />
              <Text style={styles.helperText}>{openingBalanceHelperText}</Text>
              <Controller
                control={control}
                name="initialBalance"
                render={({ field }) => (
                  <Text style={styles.previewText}>
                    {openingBalancePreviewLabel}:{' '}
                    {currencyFormatter.format(field.value / 100)}
                  </Text>
                )}
              />
              {errors.initialBalance?.message ? (
                <Text style={styles.errorText}>
                  {errors.initialBalance.message}
                </Text>
              ) : null}
            </View>

            {showActiveField ? (
              <View style={styles.switchCard}>
                <View style={styles.switchContent}>
                  <FormFieldLabel
                    iconName="checkmark-circle-outline"
                    label="Cuenta activa"
                  />
                  <Text style={styles.switchDescription}>
                    Solo las cuentas activas aparecen en la lista principal.
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="active"
                  render={({ field }) => (
                    <Switch
                      onValueChange={field.onChange}
                      trackColor={{
                        false: colors.surfaceMuted,
                        true: colors.surfaceAccent,
                      }}
                      thumbColor={field.value ? colors.text : colors.surface}
                      value={field.value}
                    />
                  )}
                />
              </View>
            ) : null}

            {errorMessage ? (
              <StateCard
                align="left"
                description={errorMessage}
                iconName="close-circle-outline"
                title="No se pudo guardar la cuenta"
                tone="error"
              />
            ) : null}

            <View
              onLayout={(event) => registerSectionOffset('submit', event)}
              style={styles.submitSection}
            >
              {validationFeedbackMessage ? (
                <View style={styles.submitFeedback}>
                  <Ionicons color={colors.warning} name="alert-circle-outline" size={18} />
                  <Text style={styles.submitFeedbackText}>{validationFeedbackMessage}</Text>
                </View>
              ) : null}
              <ActionButton
                iconName="checkmark-circle-outline"
                label={submitLabel}
                loading={isSubmitting}
                onPress={handleSubmit(async (values) => {
                  setShowSubmitValidationFeedback(false);
                  await onSubmit(values);
                }, handleInvalidSubmit)}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function parseMoneyInput(value: string) {
  const digits = value.replace(/[^\d]/g, '');

  return digits.length > 0 ? Number(digits) : 0;
}

const styles = StyleSheet.create({
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  form: {
    gap: 22,
  },
  submitSection: {
    gap: 10,
  },
  navigationBar: {
    minHeight: 32,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: -4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  backButtonLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  fieldGroup: {
    gap: 10,
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
    borderColor: '#C7604A',
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  submitFeedback: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  submitFeedbackText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  typeList: {
    gap: 10,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  typeCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceAccent,
  },
  typeLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  typeLabelSelected: {
    color: colors.text,
  },
  typeDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  typeDescriptionSelected: {
    color: colors.text,
  },
  switchCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchContent: {
    flex: 1,
    gap: 8,
  },
  switchDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
