import { useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import brandMark from '../../assets/A-VA_01.png';
import logo from '../../assets/logo_bw.png';

const LAUNCH_BACKGROUND = '#070707';

type LaunchScreenProps = {
  onReady?: () => void;
};

export function LaunchScreen({ onReady }: LaunchScreenProps) {
  const hasNotifiedReadyRef = useRef(false);

  function handleLayout() {
    if (hasNotifiedReadyRef.current) {
      return;
    }

    hasNotifiedReadyRef.current = true;
    onReady?.();
  }

  return (
    <SafeAreaView edges={["top", "right", "bottom", "left"]} style={styles.safeArea}>
      <StatusBar backgroundColor={LAUNCH_BACKGROUND} style="light" />
      <View onLayout={handleLayout} style={styles.container}>
        <View style={styles.centerSlot}>
          <Image resizeMode="contain" source={logo} style={styles.logo} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.poweredBy}>Powered by</Text>
          <Image resizeMode="contain" source={brandMark} style={styles.brandMark} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LAUNCH_BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: LAUNCH_BACKGROUND,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 44,
  },
  logo: {
    width: 220,
    maxWidth: '78%',
    height: 220,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  poweredBy: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  brandMark: {
    width: 132,
    height: 34,
  },
});
