import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme';
import { getBudgetStatusLabel, type BudgetStatus } from '../types';

type BudgetStatusBadgeProps = {
  status: BudgetStatus;
};

export function BudgetStatusBadge({ status }: BudgetStatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        status === 'normal'
          ? styles.badgeNormal
          : status === 'warning'
            ? styles.badgeWarning
            : status === 'exceeded'
              ? styles.badgeExceeded
              : styles.badgeUnset,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          status === 'normal'
            ? styles.badgeTextNormal
            : status === 'warning'
              ? styles.badgeTextWarning
              : status === 'exceeded'
                ? styles.badgeTextExceeded
                : styles.badgeTextUnset,
        ]}
      >
        {getBudgetStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeNormal: {
    backgroundColor: colors.surfaceSuccess,
  },
  badgeWarning: {
    backgroundColor: colors.surfaceAccent,
  },
  badgeExceeded: {
    backgroundColor: colors.surfaceError,
  },
  badgeUnset: {
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextNormal: {
    color: colors.success,
  },
  badgeTextWarning: {
    color: colors.warning,
  },
  badgeTextExceeded: {
    color: colors.danger,
  },
  badgeTextUnset: {
    color: colors.text,
  },
});
