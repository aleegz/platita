import {
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

let layoutAnimationsEnabled = false;

export function enableLayoutAnimations() {
  if (layoutAnimationsEnabled || Platform.OS !== 'android') {
    layoutAnimationsEnabled = true;
    return;
  }

  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  layoutAnimationsEnabled = true;
}

export function animateNextLayout() {
  if (Platform.OS === 'web') {
    return;
  }

  LayoutAnimation.configureNext({
    duration: 220,
    create: {
      type: 'easeInEaseOut',
      property: 'opacity',
    },
    update: {
      type: 'easeInEaseOut',
    },
    delete: {
      type: 'easeInEaseOut',
      property: 'opacity',
    },
  });
}
