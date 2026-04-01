import type {
  PropsWithChildren,
  ReactNode,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';

type ScreenProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  topInset?: boolean;
  headerHidden?: boolean;
  topBar?: ReactNode;
}>;

export function Screen({
  eyebrow = 'Platita',
  title = '',
  description = '',
  topInset = false,
  headerHidden = false,
  topBar,
  children,
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={topInset ? ['top', 'left', 'right', 'bottom'] : ['left', 'right', 'bottom']}
      style={styles.container}
    >
      <View pointerEvents="none" style={[styles.backgroundGlow, styles.backgroundGlowTop]} />
      <View
        pointerEvents="none"
        style={[styles.backgroundGlow, styles.backgroundGlowBottom]}
      />
      <View style={styles.frame}>
        {topBar ? <View style={styles.topBar}>{topBar}</View> : null}
        {!headerHidden ? (
          <View style={styles.header}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  backgroundGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  backgroundGlowTop: {
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    backgroundColor: colors.accent,
  },
  backgroundGlowBottom: {
    bottom: 80,
    left: -120,
    width: 220,
    height: 220,
    backgroundColor: '#3ABEFF',
    opacity: 0.08,
  },
  frame: {
    flex: 1,
  },
  topBar: {
    marginBottom: 16,
  },
  header: {
    gap: 6,
    marginBottom: 20,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 560,
  },
  content: {
    flex: 1,
    minHeight: 0,
    gap: 16,
  },
});
