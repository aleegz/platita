import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBar } from 'expo-status-bar';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
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
  SurfaceCard,
} from '../../../components';
import { colors } from '../../../theme';
import type { CategoryType } from '../../../types/domain';
import {
  categoryTypeOptions,
  defaultCategoryFormValues,
  getCategoryTypeLabel,
  type SaveCategoryInput,
} from '../types';
import { categoryFormSchema, type CategoryFormValues } from '../schema';

type IconName = ComponentProps<typeof Ionicons>['name'];

type CategoryFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  backLabel?: string;
  defaultValues?: SaveCategoryInput;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onBackPress?: () => void;
  showActiveField?: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
};

type FormSectionCardProps = {
  title: string;
  description: string;
  iconName: IconName;
  children: React.ReactNode;
};

type PreviewPillProps = {
  label: string;
  tone?: 'default' | 'success' | 'muted';
};

export function CategoryForm({
  title,
  description,
  submitLabel,
  backLabel = 'Volver',
  defaultValues = defaultCategoryFormValues,
  errorMessage,
  isSubmitting = false,
  onBackPress,
  showActiveField = false,
  onSubmit,
}: CategoryFormProps) {
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });
  const categoryName = watch('name');
  const categoryType = watch('type');
  const isActive = watch('active');
  const normalizedName = categoryName.trim();
  const previewName = normalizedName.length > 0 ? normalizedName : 'Sin nombre todavía';

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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <SurfaceCard style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewIcon}>
                  <Ionicons
                    color={colors.text}
                    name={getCategoryTypeIconName(categoryType)}
                    size={22}
                  />
                </View>
                <View style={styles.previewCopy}>
                  <Text style={styles.previewEyebrow}>Vista previa</Text>
                  <Text style={styles.previewTitle}>{previewName}</Text>
                  <Text style={styles.previewDescription}>
                    {getCategoryPreviewDescription(categoryType, isActive)}
                  </Text>
                </View>
              </View>

              <View style={styles.previewPillRow}>
                <PreviewPill label={getCategoryTypeLabel(categoryType)} />
                <PreviewPill
                  label={isActive ? 'Activa' : 'Inactiva'}
                  tone={isActive ? 'success' : 'muted'}
                />
              </View>
            </SurfaceCard>

            <FormSectionCard
              description="Usa un nombre corto y fácil de reconocer en tus formularios y reportes."
              iconName="pricetags-outline"
              title="Nombre"
            >
              <View style={styles.fieldGroup}>
                <FormFieldLabel iconName="pricetags-outline" label="Nombre visible" />
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <TextInput
                      autoCapitalize="words"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      placeholder={getCategoryNamePlaceholder(categoryType)}
                      placeholderTextColor={colors.muted}
                      returnKeyType="done"
                      style={[
                        styles.input,
                        errors.name ? styles.inputError : null,
                      ]}
                      value={field.value}
                    />
                  )}
                />
                <Text style={styles.helperText}>
                  Ejemplo: Supermercado, Alquiler, Sueldo o Intereses.
                </Text>
                {errors.name?.message ? (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                ) : null}
              </View>
            </FormSectionCard>

            <FormSectionCard
              description="Define cómo se comportará esta categoría dentro de la app."
              iconName="layers-outline"
              title="Tipo de categoría"
            >
              <View style={styles.typeList}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <>
                      {categoryTypeOptions.map((option) => {
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
                            <View style={styles.typeCardMain}>
                              <View
                                style={[
                                  styles.typeCardIcon,
                                  isSelected ? styles.typeCardIconSelected : null,
                                ]}
                              >
                                <Ionicons
                                  color={isSelected ? colors.primaryText : colors.text}
                                  name={getCategoryTypeIconName(option.value)}
                                  size={18}
                                />
                              </View>
                              <View style={styles.typeCardCopy}>
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
                                <Text
                                  style={[
                                    styles.typeExample,
                                    isSelected ? styles.typeExampleSelected : null,
                                  ]}
                                >
                                  {getCategoryTypeExample(option.value)}
                                </Text>
                              </View>
                              <Ionicons
                                color={isSelected ? colors.primaryText : colors.muted}
                                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                                size={20}
                              />
                            </View>
                          </Pressable>
                        );
                      })}
                    </>
                  )}
                />
              </View>
              <Text style={styles.helperText}>
                {showActiveField
                  ? 'Si la categoría ya tiene movimientos o presupuestos, su tipo no podrá cambiarse.'
                  : 'El tipo ayuda a que la categoría aparezca en el lugar correcto al registrar movimientos.'}
              </Text>
              {errors.type?.message ? (
                <Text style={styles.errorText}>{errors.type.message}</Text>
              ) : null}
            </FormSectionCard>

            {showActiveField ? (
              <FormSectionCard
                description="Controla si quieres seguir ofreciéndola para nuevos registros."
                iconName="eye-outline"
                title="Disponibilidad"
              >
                <Controller
                  control={control}
                  name="active"
                  render={({ field }) => (
                    <View style={styles.availabilityCard}>
                      <View style={styles.availabilityCopy}>
                        <Text style={styles.availabilityTitle}>
                          {field.value
                            ? 'Visible en nuevos movimientos y presupuestos'
                            : 'Oculta para nuevos registros'}
                        </Text>
                        <Text style={styles.availabilityDescription}>
                          {field.value
                            ? 'La categoría se podrá seguir seleccionando normalmente en los formularios.'
                            : 'Tus movimientos anteriores se conservan; solo deja de aparecer en nuevas cargas.'}
                        </Text>
                      </View>
                      <Switch
                        onValueChange={field.onChange}
                        trackColor={{
                          false: colors.surfaceMuted,
                          true: colors.surfaceAccent,
                        }}
                        thumbColor={field.value ? colors.text : colors.surface}
                        value={field.value}
                      />
                    </View>
                  )}
                />
              </FormSectionCard>
            ) : null}

            {errorMessage ? (
              <StateCard
                align="left"
                description={errorMessage}
                iconName="close-circle-outline"
                title="No se pudo guardar la categoría"
                tone="error"
              />
            ) : null}

            <ActionButton
              iconName="checkmark-circle-outline"
              label={submitLabel}
              loading={isSubmitting}
              onPress={handleSubmit(async (values) => {
                await onSubmit(values);
              })}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function FormSectionCard({
  title,
  description,
  iconName,
  children,
}: FormSectionCardProps) {
  return (
    <SurfaceCard style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons color={colors.text} name={iconName} size={18} />
        </View>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </SurfaceCard>
  );
}

function PreviewPill({ label, tone = 'default' }: PreviewPillProps) {
  return (
    <View
      style={[
        styles.previewPill,
        tone === 'success'
          ? styles.previewPillSuccess
          : tone === 'muted'
            ? styles.previewPillMuted
            : null,
      ]}
    >
      <Text
        style={[
          styles.previewPillText,
          tone === 'success'
            ? styles.previewPillTextSuccess
            : tone === 'muted'
              ? styles.previewPillTextMuted
              : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function getCategoryTypeIconName(type: CategoryType): IconName {
  switch (type) {
    case 'income':
      return 'arrow-down-circle-outline';
    case 'expense':
      return 'arrow-up-circle-outline';
    case 'yield':
      return 'sparkles-outline';
    default:
      return 'pricetags-outline';
  }
}

function getCategoryTypeExample(type: CategoryType) {
  switch (type) {
    case 'income':
      return 'Ejemplos: sueldo, ventas, reintegros.';
    case 'expense':
      return 'Ejemplos: supermercado, alquiler, transporte.';
    case 'yield':
      return 'Ejemplos: intereses, dividendos, retornos.';
    default:
      return '';
  }
}

function getCategoryNamePlaceholder(type: CategoryType) {
  switch (type) {
    case 'income':
      return 'Ejemplo: Sueldo';
    case 'expense':
      return 'Ejemplo: Supermercado';
    case 'yield':
      return 'Ejemplo: Intereses';
    default:
      return 'Ejemplo: Categoría';
  }
}

function getCategoryPreviewDescription(type: CategoryType, isActive: boolean) {
  const statusLabel = isActive
    ? 'Quedará disponible para nuevos registros.'
    : 'Quedará oculta para nuevas cargas.';

  switch (type) {
    case 'income':
      return `Se usará para entradas de dinero. ${statusLabel}`;
    case 'expense':
      return `Se usará para consumos y egresos. ${statusLabel}`;
    case 'yield':
      return `Se usará para ganancias y retornos. ${statusLabel}`;
    default:
      return statusLabel;
  }
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
    gap: 18,
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
  previewCard: {
    gap: 16,
    backgroundColor: colors.surfaceSoft,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  previewCopy: {
    flex: 1,
    gap: 4,
  },
  previewEyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  previewTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  previewDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  previewPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewPill: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewPillSuccess: {
    backgroundColor: colors.surfaceSuccess,
  },
  previewPillMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  previewPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  previewPillTextSuccess: {
    color: colors.success,
  },
  previewPillTextMuted: {
    color: colors.muted,
  },
  sectionCard: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionContent: {
    gap: 12,
  },
  fieldGroup: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surfaceAccent,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  helperText: {
    color: colors.muted,
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
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  typeCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  typeCardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  typeCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  typeCardIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  typeCardCopy: {
    flex: 1,
    gap: 4,
  },
  typeLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  typeLabelSelected: {
    color: colors.primaryText,
  },
  typeDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  typeDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.92)',
  },
  typeExample: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  typeExampleSelected: {
    color: 'rgba(255, 255, 255, 0.84)',
  },
  availabilityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  availabilityCopy: {
    flex: 1,
    gap: 6,
  },
  availabilityTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  availabilityDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
});