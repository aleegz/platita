import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '../theme';

type SkeletonBlockProps = {
  height: number;
  width?: ViewStyle['width'];
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({
  height,
  width = '100%',
  style,
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
      opacity.stopAnimation();
      opacity.setValue(0.5);
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          height,
          width,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
});
