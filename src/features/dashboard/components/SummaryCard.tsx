import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme';

type SummaryCardTone = 'default' | 'positive' | 'negative';

type SummaryCardProps = {
  label: string;
  value: string;
  description?: string;
  tone?: SummaryCardTone;
  detail?: string;
  detailTone?: SummaryCardTone;
};

export function SummaryCard({
  label,
  value,
  description,
  tone = 'default',
  detail,
  detailTone = 'default',
}: SummaryCardProps) {
  const detailOpacity = useRef(new Animated.Value(1)).current;
  const shouldAnimateDetail = Boolean(detail && detailTone !== 'default');

  useEffect(() => {
    if (!shouldAnimateDetail) {
      detailOpacity.stopAnimation();
      detailOpacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(detailOpacity, {
          toValue: 0.35,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(detailOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
      detailOpacity.stopAnimation();
      detailOpacity.setValue(1);
    };
  }, [detailOpacity, shouldAnimateDetail]);

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {detail ? (
          <Animated.Text
            style={[
              styles.detailText,
              detailTone === 'positive'
                ? styles.detailTextPositive
                : detailTone === 'negative'
                  ? styles.detailTextNegative
                  : styles.detailTextDefault,
              shouldAnimateDetail ? { opacity: detailOpacity } : null,
            ]}
          >
            {detail}
          </Animated.Text>
        ) : null}
      </View>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  detailText: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 12,
  },
  detailTextDefault: {
    color: colors.text,
  },
  detailTextPositive: {
    color: colors.success,
  },
  detailTextNegative: {
    color: colors.danger,
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
