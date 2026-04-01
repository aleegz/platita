import { useEffect } from 'react';
import { Stack } from 'expo-router';

import { DatabaseProvider } from '../database/client/provider';
import {
  ProfileNameModal,
  useUserProfileBootstrap,
  useUserProfileMutations,
} from '../features/settings';
import { enableLayoutAnimations } from '../lib/motion';
import { colors } from '../theme';

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
  const {
    errorMessage,
    isSubmitting,
    saveProfile,
  } = useUserProfileMutations();

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
        visible={!isLoading && profile === null}
      />
    </>
  );
}
