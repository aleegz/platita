import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
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
  economicDataFormSchema,
  type EconomicDataFormValues,
} from '../schema';
import {
  formatEconomicDataMoney,
  formatEconomicPeriod,
  formatInflationPercentage,
} from '../types';

type EconomicDataFormProps = {
  month: number;
  year: number;
  defaultValues: EconomicDataFormValues;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: EconomicDataFormValues) => Promise<void> | void;
};

export function EconomicDataForm({
  month,
  year,
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: EconomicDataFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EconomicDataFormValues>({
    resolver: zodResolver(economicDataFormSchema),
    defaultValues,
  });

  return (
    <View style={styles.card}>
      <SheetHeader
        description={`Completa dólar oficial e inflación para ${formatEconomicPeriod(
          month,
          year
        )}.`}
        iconName="stats-chart-outline"
        title="Carga mensual"
      />

      <View style={styles.fieldGroup}>
        <FormFieldLabel iconName="cash-outline" label="Dólar oficial" />
        <Controller
          control={control}
          name="dollarOfficial"
          render={({ field }) => (
            <TextInput
              keyboardType="number-pad"
              onBlur={field.onBlur}
              onChangeText={(value) => field.onChange(parseIntegerInput(value))}
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                errors.dollarOfficial ? styles.inputError : null,
              ]}
              value={String(field.value)}
            />
          )}
        />
        <Controller
          control={control}
          name="dollarOfficial"
          render={({ field }) => (
            <Text style={styles.helperText}>
              Vista previa: {formatEconomicDataMoney(field.value)}
            </Text>
          )}
        />
        <Text style={styles.helperText}>
          Escribe solo números. Los últimos dos dígitos son los centavos.
        </Text>
        {errors.dollarOfficial?.message ? (
          <Text style={styles.errorText}>{errors.dollarOfficial.message}</Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <FormFieldLabel
          iconName="trending-up-outline"
          label="Inflación mensual"
        />
        <Controller
          control={control}
          name="inflationMonthlyBasisPoints"
          render={({ field }) => (
            <TextInput
              keyboardType="number-pad"
              onBlur={field.onBlur}
              onChangeText={(value) => field.onChange(parseIntegerInput(value))}
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                errors.inflationMonthlyBasisPoints ? styles.inputError : null,
              ]}
              value={String(field.value)}
            />
          )}
        />
        <Controller
          control={control}
          name="inflationMonthlyBasisPoints"
          render={({ field }) => (
            <Text style={styles.helperText}>
              Vista previa: {formatInflationPercentage(field.value)}
            </Text>
          )}
        />
        <Text style={styles.helperText}>
          Escribe solo números. El valor se guarda en puntos básicos.
        </Text>
        {errors.inflationMonthlyBasisPoints?.message ? (
          <Text style={styles.errorText}>
            {errors.inflationMonthlyBasisPoints.message}
          </Text>
        ) : null}
      </View>

      {errorMessage ? (
        <StateCard
          align="left"
          description={errorMessage}
          iconName="close-circle-outline"
          title="No se pudieron guardar los datos"
          tone="error"
        />
      ) : null}

      <ActionButton
        iconName="checkmark-circle-outline"
        label="Guardar datos"
        loading={isSubmitting}
        onPress={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      />
    </View>
  );
}

function parseIntegerInput(value: string) {
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
});
