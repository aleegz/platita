import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { LaunchScreen } from '../components';
import { DatabaseProvider } from '../database/client/provider';
import {
  ProfileNameModal,
  useUserProfileBootstrap,
  useUserProfileMutations,
} from '../features/settings';
import { AppLockScreen, useAppLock } from '../features/security';
import { enableLayoutAnimations } from '../lib/motion';
import { colors } from '../theme';

void SplashScreen.preventAutoHideAsync().catch(() => {});

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

const MINIMUM_LAUNCH_SCREEN_DURATION_MS = 1000;

export default function RootLayout() {
  useEffect(() => {
    enableLayoutAnimations();
  }, []);

  return (
    <DatabaseProvider>
      <RootNavigation />
    </DatabaseProvider>
  );
}

function RootNavigation() {
  const { isLoading, profile } = useUserProfileBootstrap();
  const [isLaunchScreenVisible, setIsLaunchScreenVisible] = useState(true);
  const {
    errorMessage,
    isSubmitting,
    saveProfile,
  } = useUserProfileMutations();
  const {
    errorMessage: appLockErrorMessage,
    isAuthenticating: isAuthenticatingAppLock,
    isLocked,
    unlock,
  } = useAppLock(
    profile?.appLockEnabled ?? false,
    !isLoading && profile !== null && !isLaunchScreenVisible
  );
  const hasHiddenNativeSplashRef = useRef(false);
  const launchStartedAtRef = useRef(Date.now());

  function hideNativeSplash() {
    if (hasHiddenNativeSplashRef.current) {
      return;
    }

    hasHiddenNativeSplashRef.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const elapsed = Date.now() - launchStartedAtRef.current;
    const remaining = Math.max(0, MINIMUM_LAUNCH_SCREEN_DURATION_MS - elapsed);
    const timeout = setTimeout(() => {
      setIsLaunchScreenVisible(false);
    }, remaining);

    return () => {
      clearTimeout(timeout);
    };
  }, [isLoading]);

  if (isLoading || isLaunchScreenVisible) {
    return <LaunchScreen onReady={hideNativeSplash} />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          freezeOnBlur: false,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            freezeOnBlur: false,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="accounts/new"
          options={{
            animation: 'none',
            contentStyle: {
              backgroundColor: colors.background,
            },
            freezeOnBlur: false,
            headerShown: false,
            navigationBarColor: colors.background,
            presentation: 'card',
            statusBarAnimation: 'fade',
            statusBarStyle: 'light',
          }}
        />
        <Stack.Screen
          name="accounts/[id]"
          options={{
            animation: 'none',
            contentStyle: {
              backgroundColor: colors.background,
            },
            freezeOnBlur: false,
            headerShown: false,
            navigationBarColor: colors.background,
            presentation: 'card',
            statusBarAnimation: 'fade',
            statusBarStyle: 'light',
          }}
        />
      </Stack>

      <ProfileNameModal
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        mode="welcome"
        onSubmit={async (values) => {
          await saveProfile(values);
        }}
        visible={profile === null}
      />

      {profile?.appLockEnabled && isLocked ? (
        <AppLockScreen
          errorMessage={appLockErrorMessage}
          isAuthenticating={isAuthenticatingAppLock}
          onUnlock={unlock}
        />
      ) : null}
    </>
  );
}
