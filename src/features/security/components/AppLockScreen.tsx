import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionButton } from '../../../components';
import { colors } from '../../../theme';
import logo from '../../../../assets/logo.png';

type AppLockScreenProps = {
  isAuthenticating: boolean;
  errorMessage?: string | null;
  onUnlock: () => Promise<boolean>;
};

export function AppLockScreen({
  isAuthenticating,
  errorMessage,
  onUnlock,
}: AppLockScreenProps) {
  return (
    <View style={styles.overlay}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
        <View style={styles.content}>
          <Image source={logo} style={styles.logo} />

          <View style={styles.actions}>
            <ActionButton
              iconName="lock-open-outline"
              label="Desbloquear"
              loading={isAuthenticating}
              onPress={() => {
                void onUnlock();
              }}
              style={styles.button}
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    gap: 36,
  },
  logo: {
    width: 224,
    height: 224,
    resizeMode: 'contain',
    marginTop: 128,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 14,
    marginBottom: 56,
  },
  button: {
    alignSelf: 'stretch',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});