import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  useForm,
  type SubmitErrorHandler,
} from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  userProfileSchema,
  type UserProfileFormValues,
} from '../schema';

type ProfileNameModalProps = {
  visible: boolean;
  defaultValue?: string;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  mode: 'welcome' | 'edit';
  onClose?: () => void;
  onSubmit: (values: UserProfileFormValues) => Promise<void> | void;
};

export function ProfileNameModal({
  visible,
  defaultValue = '',
  errorMessage,
  isSubmitting = false,
  mode,
  onClose,
  onSubmit,
}: ProfileNameModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      displayName: defaultValue,
    },
  });
  const [showSubmitValidationFeedback, setShowSubmitValidationFeedback] = useState(false);
  const displayNameInputRef = useRef<TextInput | null>(null);
  const validationFeedbackMessage =
    showSubmitValidationFeedback && Object.keys(errors).length > 0
      ? 'Revisá los campos marcados antes de continuar.'
      : null;

  useEffect(() => {
    if (!visible) {
      return;
    }

    reset({
      displayName: defaultValue,
    });
    setShowSubmitValidationFeedback(false);
  }, [defaultValue, reset, visible]);

  const handleInvalidSubmit: SubmitErrorHandler<UserProfileFormValues> = (
    formErrors
  ) => {
    setShowSubmitValidationFeedback(true);

    if (formErrors.displayName) {
      displayNameInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (showSubmitValidationFeedback && Object.keys(errors).length === 0) {
      setShowSubmitValidationFeedback(false);
    }
  }, [errors, showSubmitValidationFeedback]);

  const isWelcome = mode === 'welcome';

  return (
    <Modal
      animationType="fade"
      onRequestClose={isWelcome ? undefined : onClose}
      transparent
      visible={visible}
    >
      <View
        style={[
          styles.overlay,
          isWelcome ? styles.overlayCenter : styles.overlayBottom,
        ]}
      >
        {!isWelcome ? (
          <Pressable onPress={onClose} style={styles.overlayBackdrop} />
        ) : null}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={isWelcome ? styles.centerKeyboardArea : styles.sheetKeyboardArea}
        >
          <View
            style={[
              styles.card,
              isWelcome ? styles.welcomeCard : styles.sheetCard,
            ]}
          >
            {!isWelcome ? <View style={styles.sheetHandle} /> : null}

            {isWelcome ? (
              <View style={styles.welcomeHeader}>
                <View style={styles.welcomeIcon}>
                  <Ionicons color={colors.text} name="person-circle-outline" size={22} />
                </View>
                <Text style={styles.welcomeTitle}>Bienvenido a Platita</Text>
                <Text style={styles.welcomeDescription}>
                  Define cómo quieres que te saludemos al entrar. Después podrás
                  cambiarlo desde Ajustes.
                </Text>
              </View>
            ) : (
              <SheetHeader
                description="Cambia el nombre que aparece en tu saludo de inicio."
                iconName="person-outline"
                onClose={onClose}
                title="Tu nombre"
              />
            )}

            <View style={styles.fieldGroup}>
              <FormFieldLabel iconName="person-outline" label="Nombre de usuario" />
              <Controller
                control={control}
                name="displayName"
                render={({ field }) => (
                  <TextInput
                    autoCapitalize="words"
                    autoFocus={visible}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder="Ejemplo: Alejandro"
                    placeholderTextColor={colors.muted}
                    ref={displayNameInputRef}
                    returnKeyType="done"
                    style={[
                      styles.input,
                      errors.displayName ? styles.inputError : null,
                    ]}
                    value={field.value}
                  />
                )}
              />
              <Text style={styles.helperText}>
                Se usará solo para personalizar la experiencia dentro de la app.
              </Text>
              {errors.displayName?.message ? (
                <Text style={styles.errorText}>{errors.displayName.message}</Text>
              ) : null}
            </View>

            {errorMessage ? (
              <StateCard
                align="left"
                description={errorMessage}
                iconName="close-circle-outline"
                title="No se pudo guardar tu nombre"
                tone="error"
              />
            ) : null}

            <View style={styles.actions}>
              {!isWelcome && onClose ? (
                <ActionButton
                  disabled={isSubmitting}
                  label="Cancelar"
                  onPress={onClose}
                  style={styles.action}
                  variant="secondary"
                />
              ) : null}
              <View style={styles.primaryActionSection}>
                {validationFeedbackMessage ? (
                  <View style={styles.submitFeedback}>
                    <Ionicons color={colors.warning} name="alert-circle-outline" size={18} />
                    <Text style={styles.submitFeedbackText}>{validationFeedbackMessage}</Text>
                  </View>
                ) : null}
                <ActionButton
                  iconName="checkmark-circle-outline"
                  label={isWelcome ? 'Continuar' : 'Guardar'}
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 9, 13, 0.62)',
  },
  overlayCenter: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerKeyboardArea: {
    justifyContent: 'center',
  },
  sheetKeyboardArea: {
    justifyContent: 'flex-end',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 18,
  },
  welcomeCard: {
    borderRadius: 28,
  },
  sheetCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  welcomeHeader: {
    alignItems: 'center',
    gap: 10,
  },
  welcomeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  welcomeTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  welcomeDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
    borderColor: colors.danger,
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
