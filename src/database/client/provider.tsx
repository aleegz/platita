import * as SQLite from 'expo-sqlite';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { initializeDatabaseAsync } from '../schema/migrations';
import { useAppStore } from '../../store/app.store';
import { useProfileStore } from '../../store/profile.store';
import { useUiStore } from '../../store/ui.store';
import type { AppDatabase } from './sqlite';
import {
  DATABASE_OPTIONS,
  normalizeBackupBytesForDeserialize,
  openAppDatabaseAsync,
} from './sqlite';
import { colors } from '../../theme';

const DatabaseContext = createContext<AppDatabase | null>(null);
const DatabaseMaintenanceContext = createContext<{
  replaceDatabaseAsync: (bytes: Uint8Array) => Promise<void>;
} | null>(null);

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [database, setDatabase] = useState<AppDatabase | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const databaseRef = useRef<AppDatabase | null>(null);

  const setDatabaseInstance = useCallback((nextDatabase: AppDatabase | null) => {
    databaseRef.current = nextDatabase;
    setDatabase(nextDatabase);
  }, []);

  const openInitializedDatabaseAsync = useCallback(
    async (useNewConnection = false) => {
      const databaseInstance = await openAppDatabaseAsync({
        useNewConnection,
      });

      await initializeDatabaseAsync(databaseInstance);

      return databaseInstance;
    },
    []
  );

  const closeDatabaseAsync = useCallback(async (databaseInstance?: AppDatabase | null) => {
    await databaseInstance?.closeAsync().catch(() => undefined);
  }, []);

  const recoverDatabaseAsync = useCallback(async () => {
    const recoveredDatabase = await openInitializedDatabaseAsync(true);

    setErrorMessage(null);
    setDatabaseInstance(recoveredDatabase);
    useAppStore.getState().markAppAsLoaded();
  }, [openInitializedDatabaseAsync, setDatabaseInstance]);

  const replaceDatabaseAsync = useCallback(
    async (bytes: Uint8Array) => {
      let importedDatabase: AppDatabase | null = null;
      let writableDatabase: AppDatabase | null = null;

      useUiStore.getState().setLoadingFlag('appBootstrap', true);
      setErrorMessage(null);

      try {
        const importedBytes = normalizeBackupBytesForDeserialize(bytes);

        importedDatabase = await SQLite.deserializeDatabaseAsync(
          importedBytes,
          DATABASE_OPTIONS
        );

        const currentDatabase = databaseRef.current;

        if (currentDatabase) {
          await closeDatabaseAsync(currentDatabase);
        }

        setDatabaseInstance(null);

        writableDatabase = await openAppDatabaseAsync({
          useNewConnection: true,
        });

        await SQLite.backupDatabaseAsync({
          sourceDatabase: importedDatabase,
          sourceDatabaseName: 'main',
          destDatabase: writableDatabase,
          destDatabaseName: 'main',
        });

        await initializeDatabaseAsync(writableDatabase);
        await closeDatabaseAsync(writableDatabase);
        writableDatabase = null;
        await closeDatabaseAsync(importedDatabase);
        importedDatabase = null;

        useProfileStore.getState().reset();

        const liveDatabase = await openInitializedDatabaseAsync(true);

        setDatabaseInstance(liveDatabase);
        useAppStore.getState().markAppAsLoaded();
      } catch (error) {
        console.error(error);

        await closeDatabaseAsync(writableDatabase);
        await closeDatabaseAsync(importedDatabase);

        try {
          await recoverDatabaseAsync();
        } catch (recoveryError) {
          console.error(recoveryError);
          setErrorMessage(
            'No se pudo recuperar la base SQLite local después de restaurar el respaldo.'
          );
          useAppStore.getState().markAppAsLoaded();
        }

        throw error;
      } finally {
        useUiStore.getState().setLoadingFlag('appBootstrap', false);
      }
    },
    [
      closeDatabaseAsync,
      openInitializedDatabaseAsync,
      recoverDatabaseAsync,
      setDatabaseInstance,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      useUiStore.getState().setLoadingFlag('appBootstrap', true);

      try {
        const databaseInstance = await openInitializedDatabaseAsync();

        if (!isMounted) {
          await closeDatabaseAsync(databaseInstance);
          return;
        }

        setDatabaseInstance(databaseInstance);
        useAppStore.getState().markAppAsLoaded();
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(error);

        setErrorMessage('No se pudo abrir o preparar la base SQLite local.');
        useAppStore.getState().markAppAsLoaded();
      } finally {
        useUiStore.getState().setLoadingFlag('appBootstrap', false);
      }
    }

    void initialize();

    return () => {
      isMounted = false;
      void closeDatabaseAsync(databaseRef.current);
    };
  }, [closeDatabaseAsync, openInitializedDatabaseAsync, setDatabaseInstance]);

  if (errorMessage) {
    return (
      <DatabaseStatusScreen
        title="Error en la base local"
        description={errorMessage}
      />
    );
  }

  if (!database) {
    return (
      <DatabaseStatusScreen
        title="Preparando datos locales"
        description="Inicializando la base SQLite de la app."
        isLoading
      />
    );
  }

  return (
    <DatabaseMaintenanceContext.Provider value={{ replaceDatabaseAsync }}>
      <DatabaseContext.Provider value={database}>
        {children}
      </DatabaseContext.Provider>
    </DatabaseMaintenanceContext.Provider>
  );
}

export function useDatabase() {
  const database = useContext(DatabaseContext);

  if (!database) {
    throw new Error('useDatabase must be used within DatabaseProvider.');
  }

  return database;
}

export function useDatabaseMaintenance() {
  const maintenance = useContext(DatabaseMaintenanceContext);

  if (!maintenance) {
    throw new Error(
      'useDatabaseMaintenance must be used within DatabaseProvider.'
    );
  }

  return maintenance;
}

type DatabaseStatusScreenProps = {
  title: string;
  description: string;
  isLoading?: boolean;
};

function DatabaseStatusScreen({
  title,
  description,
  isLoading = false,
}: DatabaseStatusScreenProps) {
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
