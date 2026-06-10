import { useEffect, useRef, useState } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

type DeviceAuthenticationAvailability = {
  isLoading: boolean;
  isSupported: boolean;
  hasFingerprint: boolean;
  errorMessage: string | null;
};

type DeviceAuthenticationSnapshot = Omit<
  DeviceAuthenticationAvailability,
  'isLoading'
>;

type AppLockState = {
  isLocked: boolean;
  isAuthenticating: boolean;
  errorMessage: string | null;
  unlock: () => Promise<boolean>;
};

const APP_LOCK_BACKGROUND_GRACE_PERIOD_MS = 60_000;

const unavailableDeviceAuthenticationMessage =
  'Activa un método de desbloqueo en tu dispositivo para proteger la app.';

export function useDeviceAuthenticationAvailability(): DeviceAuthenticationAvailability {
  const [state, setState] = useState<DeviceAuthenticationAvailability>({
    isLoading: true,
    isSupported: false,
    hasFingerprint: false,
    errorMessage: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability() {
      const availability = await getDeviceAuthenticationAvailabilityAsync();

      if (!isMounted) {
        return;
      }

      setState({
        ...availability,
        isLoading: false,
      });
    }

    void loadAvailability();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

export function useAppLock(enabled: boolean, isReady: boolean): AppLockState {
  const [isLocked, setIsLocked] = useState(enabled && isReady);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtRef = useRef<number | null>(null);
  const shouldRelockOnForegroundRef = useRef(false);
  const enabledRef = useRef(enabled);
  const isReadyRef = useRef(isReady);
  const isAuthenticatingRef = useRef(false);
  const isLockedRef = useRef(enabled && isReady);

  function updateLockState(nextIsLocked: boolean) {
    isLockedRef.current = nextIsLocked;
    setIsLocked(nextIsLocked);
  }

  async function unlock() {
    if (!enabledRef.current || !isReadyRef.current) {
      updateLockState(false);
      setErrorMessage(null);
      return true;
    }

    const availability = await getDeviceAuthenticationAvailabilityAsync();

    if (!availability.isSupported) {
      updateLockState(false);
      setErrorMessage(availability.errorMessage);
      return false;
    }

    setErrorMessage(null);
    setIsAuthenticating(true);
    isAuthenticatingRef.current = true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Usá tu huella para continuar',
        // promptSubtitle: 'Tus datos siguen protegidos',
        // promptDescription:
        //  'Usa tu huella o el bloqueo del dispositivo para continuar.',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar código del dispositivo',
        biometricsSecurityLevel: 'strong',
      });

      if (result.success) {
        updateLockState(false);
        setErrorMessage(null);
        return true;
      }

      const nextErrorMessage = getAuthenticationErrorMessage(result.error);

      if (isDeviceConfigurationError(result.error)) {
        updateLockState(false);
        setErrorMessage(nextErrorMessage);
        return false;
      }

      updateLockState(true);
      setErrorMessage(nextErrorMessage);
      return false;
    } catch (error) {
      console.error(error);
      updateLockState(true);
      setErrorMessage('No se pudo abrir el bloqueo del dispositivo.');
      return false;
    } finally {
      setIsAuthenticating(false);
      isAuthenticatingRef.current = false;
    }
  }

  useEffect(() => {
    enabledRef.current = enabled;
    isReadyRef.current = isReady;

    if (!enabled || !isReady) {
      backgroundedAtRef.current = null;
      shouldRelockOnForegroundRef.current = false;
      updateLockState(false);
      setErrorMessage(null);
      return;
    }

    backgroundedAtRef.current = null;
    shouldRelockOnForegroundRef.current = false;
    updateLockState(true);
    void unlock();
  }, [enabled, isReady]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (
        !enabledRef.current ||
        !isReadyRef.current ||
        isAuthenticatingRef.current
      ) {
        return;
      }

      const movedToBackground =
        previousAppState === 'active' &&
        (nextAppState === 'inactive' || nextAppState === 'background');

      if (movedToBackground) {
        if (isLockedRef.current) {
          backgroundedAtRef.current = null;
          shouldRelockOnForegroundRef.current = false;
          return;
        }

        backgroundedAtRef.current = Date.now();
        shouldRelockOnForegroundRef.current = true;
        return;
      }

      const returnedToForeground =
        (previousAppState === 'inactive' || previousAppState === 'background') &&
        nextAppState === 'active';

      if (returnedToForeground && shouldRelockOnForegroundRef.current) {
        const backgroundedAt = backgroundedAtRef.current;
        const timeInBackground =
          backgroundedAt === null ? 0 : Date.now() - backgroundedAt;

        backgroundedAtRef.current = null;
        shouldRelockOnForegroundRef.current = false;

        if (timeInBackground >= APP_LOCK_BACKGROUND_GRACE_PERIOD_MS) {
          updateLockState(true);
          setErrorMessage(null);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    isLocked,
    isAuthenticating,
    errorMessage,
    unlock,
  };
}

async function getDeviceAuthenticationAvailabilityAsync(): Promise<DeviceAuthenticationSnapshot> {
  if (Platform.OS === 'web') {
    return {
      isSupported: false,
      hasFingerprint: false,
      errorMessage: unavailableDeviceAuthenticationMessage,
    };
  }

  try {
    const [enrolledLevel, supportedAuthenticationTypes] = await Promise.all([
      LocalAuthentication.getEnrolledLevelAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync().catch(() => [] as LocalAuthentication.AuthenticationType[]),
    ]);

    const isSupported = enrolledLevel !== LocalAuthentication.SecurityLevel.NONE;

    return {
      isSupported,
      hasFingerprint: supportedAuthenticationTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      ),
      errorMessage: isSupported ? null : unavailableDeviceAuthenticationMessage,
    };
  } catch (error) {
    console.error(error);

    return {
      isSupported: false,
      hasFingerprint: false,
      errorMessage: unavailableDeviceAuthenticationMessage,
    };
  }
}

function isDeviceConfigurationError(error: LocalAuthentication.LocalAuthenticationError) {
  return (
    error === 'not_available' ||
    error === 'not_enrolled' ||
    error === 'passcode_not_set'
  );
}

function getAuthenticationErrorMessage(
  error: LocalAuthentication.LocalAuthenticationError
) {
  switch (error) {
    case 'user_cancel':
    case 'app_cancel':
    case 'system_cancel':
      return null;
    case 'lockout':
      return 'Se agotaron los intentos. Usa el bloqueo del dispositivo para continuar.';
    case 'not_available':
    case 'not_enrolled':
    case 'passcode_not_set':
      return unavailableDeviceAuthenticationMessage;
    case 'timeout':
      return 'La verificación tardó demasiado. Inténtalo otra vez.';
    case 'authentication_failed':
    case 'unable_to_process':
      return 'No se pudo validar tu identidad. Inténtalo nuevamente.';
    default:
      return 'No se pudo desbloquear la app en este momento.';
  }
}
