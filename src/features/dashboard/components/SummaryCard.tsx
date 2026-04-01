import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme';

type SummaryCardTone = 'default' | 'positive' | 'negative';

type SummaryCardProps = {
  label: string;
  value: string;
  description?: string;
  tone?: SummaryCardTone;
};

export function SummaryCard({
  label,
  value,
  description,
  tone = 'default',
}: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          tone === 'positive'
            ? styles.valuePositive
            : tone === 'negative'
              ? styles.valueNegative
              : null,
        ]}
      >
        {value}
      </Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  valuePositive: {
    color: colors.success,
  },
  valueNegative: {
    color: colors.danger,
  },
  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
