import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { initializeDatabaseAsync } from '../schema/migrations';
import { useAppStore } from '../../store/app.store';
import { useUiStore } from '../../store/ui.store';
import type { AppDatabase } from './sqlite';
import { openAppDatabaseAsync } from './sqlite';
import { colors } from '../../theme';

const DatabaseContext = createContext<AppDatabase | null>(null);

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [database, setDatabase] = useState<AppDatabase | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let openedDatabase: AppDatabase | null = null;

    async function initialize() {
      useUiStore.getState().setLoadingFlag('appBootstrap', true);

      try {
        const databaseInstance = await openAppDatabaseAsync();
        openedDatabase = databaseInstance;

        await initializeDatabaseAsync(databaseInstance);

        if (!isMounted) {
          await databaseInstance.closeAsync();
          return;
        }

        setDatabase(databaseInstance);
        useAppStore.getState().markAppAsLoaded();
      } catch (error) {
        if (openedDatabase) {
          await openedDatabase.closeAsync().catch(() => undefined);
        }

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

      if (openedDatabase) {
        void openedDatabase.closeAsync().catch(() => undefined);
      }
    };
  }, []);

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
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const database = useContext(DatabaseContext);

  if (!database) {
    throw new Error('useDatabase must be used within DatabaseProvider.');
  }

  return database;
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
