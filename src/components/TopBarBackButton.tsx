import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '../theme';

type TopBarBackButtonProps = {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TopBarBackButton({
  label,
  onPress,
  style,
}: TopBarBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonPressed : null,
        style,
      ]}
    >
      <Ionicons color={colors.text} name="chevron-back" size={18} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 10,
  },
  buttonPressed: {
    opacity: 0.88,
    backgroundColor: colors.surfaceAccent,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
