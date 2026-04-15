import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  useForm,
  type SubmitErrorHandler,
} from 'react-hook-form';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ActionButton,
  FormFieldLabel,
  SheetHeader,
  StateCard,
} from '../../../components';
import { colors } from '../../../theme';
import {
  budgetEditorSchema,
  type BudgetEditorFormValues,
} from '../schema';
import { formatBudgetMoney, formatBudgetPeriod } from '../types';

type BudgetEditorFormProps = {
  categoryName: string;
  month: number;
  year: number;
  defaultBudgetAmount: number;
  defaultHint?: string | null;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  presentation?: 'inline' | 'sheet';
  onCancel: () => void;
  onSubmit: (values: BudgetEditorFormValues) => Promise<void> | void;
};

export function BudgetEditorForm({
  categoryName,
  month,
  year,
  defaultBudgetAmount,
  defaultHint,
  errorMessage,
  isSubmitting = false,
  presentation = 'inline',
  onCancel,
  onSubmit,
}: BudgetEditorFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetEditorFormValues>({
    resolver: zodResolver(budgetEditorSchema),
    defaultValues: {
      budgetAmount: defaultBudgetAmount,
    },
  });
  const [showSubmitValidationFeedback, setShowSubmitValidationFeedback] = useState(false);
  const budgetAmountInputRef = useRef<TextInput | null>(null);
  const validationFeedbackMessage =
    showSubmitValidationFeedback && Object.keys(errors).length > 0
      ? 'Revisá los campos marcados antes de continuar.'
      : null;

  const handleInvalidSubmit: SubmitErrorHandler<BudgetEditorFormValues> = (
    formErrors
  ) => {
    setShowSubmitValidationFeedback(true);

    if (formErrors.budgetAmount) {
      budgetAmountInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (showSubmitValidationFeedback && Object.keys(errors).length === 0) {
      setShowSubmitValidationFeedback(false);
    }
  }, [errors, showSubmitValidationFeedback]);

  return (
    <View style={[styles.card, presentation === 'sheet' ? styles.cardSheet : null]}>
      <SheetHeader
        description={`${categoryName} · ${formatBudgetPeriod(month, year)}`}
        iconName="wallet-outline"
        onClose={presentation === 'sheet' ? onCancel : undefined}
        title="Editar presupuesto"
      />
      {defaultHint ? <Text style={styles.defaultHint}>{defaultHint}</Text> : null}

      <View style={styles.fieldGroup}>
        <FormFieldLabel iconName="cash-outline" label="Monto mensual" />
        <Controller
          control={control}
          name="budgetAmount"
          render={({ field }) => (
            <TextInput
              keyboardType="number-pad"
              onBlur={field.onBlur}
              onChangeText={(value) => field.onChange(parseMoneyInput(value))}
              placeholder="0"
              placeholderTextColor={colors.muted}
              ref={budgetAmountInputRef}
              style={[
                styles.input,
                errors.budgetAmount ? styles.inputError : null,
              ]}
              value={String(field.value)}
            />
          )}
        />
        <Controller
          control={control}
          name="budgetAmount"
          render={({ field }) => (
            <Text style={styles.helperText}>
              Vista previa: {formatBudgetMoney(field.value)}
            </Text>
          )}
        />
        <Text style={styles.helperText}>
          Escribe solo números. Los últimos dos dígitos son los centavos.
        </Text>
        {errors.budgetAmount?.message ? (
          <Text style={styles.errorText}>{errors.budgetAmount.message}</Text>
        ) : null}
      </View>

      {errorMessage ? (
        <StateCard
          align="left"
          description={errorMessage}
          iconName="close-circle-outline"
          title="No se pudo guardar el presupuesto"
          tone="error"
        />
      ) : null}

      <View style={styles.actions}>
        <ActionButton
          disabled={isSubmitting}
          label="Cancelar"
          onPress={onCancel}
          style={styles.action}
          variant="secondary"
        />
        <View style={styles.primaryActionSection}>
          {validationFeedbackMessage ? (
            <View style={styles.submitFeedback}>
              <Ionicons color={colors.warning} name="alert-circle-outline" size={18} />
              <Text style={styles.submitFeedbackText}>{validationFeedbackMessage}</Text>
            </View>
          ) : null}
          <ActionButton
            iconName="checkmark-circle-outline"
            label="Guardar"
            loading={isSubmitting}
            onPress={handleSubmit(async (values) => {
              setShowSubmitValidationFeedback(false);
              await onSubmit(values);
            }, handleInvalidSubmit)}
            style={styles.action}
          />
        </View>
      </View>
    </View>
  );
}

function parseMoneyInput(value: string) {
  const digits = value.replace(/[^\d]/g, '');

  return digits.length > 0 ? Number(digits) : 0;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 16,
  },
  cardSheet: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  defaultHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  errorCard: {
    borderRadius: 16,
    backgroundColor: colors.surfaceError,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorCardText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionSection: {
    flex: 1,
    gap: 10,
  },
  action: {
    flex: 1,
    minHeight: 52,
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
});
