import type {
  ComponentProps,
  PropsWithChildren,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type SurfaceCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

type SectionIntroProps = {
  iconName: IconName;
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
};

type StateCardProps = {
  description: string;
  title?: string;
  iconName?: IconName;
  tone?: 'default' | 'warning' | 'error' | 'success';
  align?: 'center' | 'left';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

type ActionButtonProps = {
  label: string;
  onPress?: () => void;
  iconName?: IconName;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  compact?: boolean;
};

type PeriodSwitcherProps = {
  label: string;
  value: string;
  onPrevious: () => void;
  onNext: () => void;
  previousLabel?: string;
  nextLabel?: string;
  style?: StyleProp<ViewStyle>;
};

type SheetHeaderProps = {
  title: string;
  description?: string;
  iconName?: IconName;
  onClose?: () => void;
  tone?: 'default' | 'danger';
  style?: StyleProp<ViewStyle>;
};

type FormFieldLabelProps = {
  iconName: IconName;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <View style={[styles.surfaceCard, style]}>{children}</View>;
}

export function SectionIntro({
  iconName,
  title,
  description,
  style,
}: SectionIntroProps) {
  return (
    <View style={[styles.sectionIntro, style]}>
      <View style={styles.sectionIntroIcon}>
        <Ionicons color={colors.text} name={iconName} size={18} />
      </View>
      <View style={styles.sectionIntroCopy}>
        <Text style={styles.sectionIntroTitle}>{title}</Text>
        <Text style={styles.sectionIntroDescription}>{description}</Text>
      </View>
    </View>
  );
}

export function StateCard({
  description,
  title,
  iconName = 'information-circle-outline',
  tone = 'default',
  align = 'center',
  loading = false,
  style,
}: StateCardProps) {
  const toneStyles =
    tone === 'error'
      ? styles.stateCardError
      : tone === 'warning'
        ? styles.stateCardWarning
        : tone === 'success'
          ? styles.stateCardSuccess
          : styles.stateCardDefault;
  const iconToneStyles =
    tone === 'error'
      ? styles.stateIconError
      : tone === 'warning'
        ? styles.stateIconWarning
        : tone === 'success'
          ? styles.stateIconSuccess
          : styles.stateIconDefault;

  return (
    <View
      style={[
        styles.stateCard,
        toneStyles,
        align === 'left' ? styles.stateCardLeft : styles.stateCardCenter,
        style,
      ]}
    >
      <View style={[styles.stateIcon, iconToneStyles]}>
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <Ionicons color={colors.text} name={iconName} size={20} />
        )}
      </View>
      <View style={align === 'left' ? styles.stateCopyLeft : styles.stateCopyCenter}>
        {title ? (
          <Text
            style={[
              styles.stateTitle,
              align === 'center' ? styles.stateTextCenter : null,
            ]}
          >
            {title}
          </Text>
        ) : null}
        <Text
          style={[
            styles.stateDescription,
            tone === 'error' ? styles.stateDescriptionError : null,
            align === 'center' ? styles.stateTextCenter : null,
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  iconName,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  compact = false,
}: ActionButtonProps) {
  const buttonVariantStyle =
    variant === 'secondary'
      ? styles.actionButtonSecondary
      : variant === 'danger'
        ? styles.actionButtonDanger
        : styles.actionButtonPrimary;
  const textVariantStyle =
    variant === 'secondary'
      ? styles.actionButtonTextSecondary
      : styles.actionButtonTextPrimary;
  const spinnerColor =
    variant === 'secondary' ? colors.text : colors.primaryText;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.actionButton,
        compact ? styles.actionButtonCompact : null,
        buttonVariantStyle,
        (disabled || loading) ? styles.actionButtonDisabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.actionButtonContent}>
          {iconName ? (
            <Ionicons
              color={variant === 'secondary' ? colors.text : colors.primaryText}
              name={iconName}
              size={18}
            />
          ) : null}
          <Text style={[styles.actionButtonText, textVariantStyle, textStyle]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function PeriodSwitcher({
  label,
  value,
  onPrevious,
  onNext,
  previousLabel = 'Anterior',
  nextLabel = 'Siguiente',
  style,
}: PeriodSwitcherProps) {
  return (
    <SurfaceCard style={[styles.periodSwitcher, style]}>
      <ActionButton
        compact
        iconName="chevron-back"
        label={previousLabel}
        onPress={onPrevious}
        style={styles.periodButton}
        variant="secondary"
      />
      <View style={styles.periodCopy}>
        <Text style={styles.periodLabel}>{label}</Text>
        <Text style={styles.periodValue}>{value}</Text>
      </View>
      <ActionButton
        compact
        iconName="chevron-forward"
        label={nextLabel}
        onPress={onNext}
        style={styles.periodButton}
        variant="secondary"
      />
    </SurfaceCard>
  );
}

export function SheetHeader({
  title,
  description,
  iconName,
  onClose,
  tone = 'default',
  style,
}: SheetHeaderProps) {
  return (
    <View style={[styles.sheetHeader, style]}>
      <View style={styles.sheetHeaderMain}>
        {iconName ? (
          <View
            style={[
              styles.sheetHeaderIcon,
              tone === 'danger' ? styles.sheetHeaderIconDanger : null,
            ]}
          >
            <Ionicons
              color={tone === 'danger' ? colors.danger : colors.text}
              name={iconName}
              size={18}
            />
          </View>
        ) : null}
        <View style={styles.sheetHeaderCopy}>
          <Text style={styles.sheetHeaderTitle}>{title}</Text>
          {description ? (
            <Text style={styles.sheetHeaderDescription}>{description}</Text>
          ) : null}
        </View>
      </View>
      {onClose ? (
        <Pressable onPress={onClose} style={styles.sheetCloseButton}>
          <Ionicons color={colors.text} name="close" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function FormFieldLabel({
  iconName,
  label,
  style,
}: FormFieldLabelProps) {
  return (
    <View style={[styles.formFieldLabel, style]}>
      <View style={styles.formFieldLabelIcon}>
        <Ionicons color={colors.text} name={iconName} size={16} />
      </View>
      <Text style={styles.formFieldLabelText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surfaceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionIntro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionIntroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  sectionIntroCopy: {
    flex: 1,
    gap: 4,
  },
  sectionIntroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionIntroDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  stateCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  stateCardCenter: {
    alignItems: 'center',
  },
  stateCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stateCardDefault: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stateCardWarning: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  stateCardError: {
    borderColor: 'rgba(255, 105, 97, 0.18)',
    backgroundColor: colors.surfaceError,
  },
  stateCardSuccess: {
    borderColor: 'rgba(48, 209, 88, 0.18)',
    backgroundColor: colors.surfaceSuccess,
  },
  stateIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIconDefault: {
    backgroundColor: colors.surfaceAccent,
  },
  stateIconWarning: {
    backgroundColor: colors.surfaceAccent,
  },
  stateIconError: {
    backgroundColor: 'rgba(255, 105, 97, 0.14)',
  },
  stateIconSuccess: {
    backgroundColor: 'rgba(48, 209, 88, 0.14)',
  },
  stateCopyCenter: {
    gap: 4,
  },
  stateCopyLeft: {
    flex: 1,
    gap: 4,
  },
  stateTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  stateDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  stateDescriptionError: {
    color: colors.danger,
  },
  stateTextCenter: {
    textAlign: 'center',
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonCompact: {
    minHeight: 42,
    paddingHorizontal: 14,
  },
  actionButtonPrimary: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  actionButtonSecondary: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAccent,
  },
  actionButtonDanger: {
    backgroundColor: colors.danger,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonTextPrimary: {
    color: colors.primaryText,
  },
  actionButtonTextSecondary: {
    color: colors.text,
  },
  periodSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodButton: {
    minWidth: 98,
  },
  periodCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
  },
  periodLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  periodValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetHeaderMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sheetHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  sheetHeaderIconDanger: {
    backgroundColor: 'rgba(255, 105, 97, 0.14)',
  },
  sheetHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  sheetHeaderTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sheetHeaderDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  formFieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  formFieldLabelIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  formFieldLabelText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
