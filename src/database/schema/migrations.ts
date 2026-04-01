import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { seedDefaultCategoriesAsync } from '../seeds/defaultCategories';
import { createIndexStatements } from './indexes';
import {
  createTableStatements,
  createUserProfileTableStatement,
} from './tables';

type DatabaseExecutor = Pick<
  SQLiteDatabase,
  'execAsync' | 'getFirstAsync' | 'runAsync'
>;

type Migration = {
  version: number;
  name: string;
  up: (database: DatabaseExecutor) => Promise<void>;
};

const migrations: readonly Migration[] = [
  {
    version: 1,
    name: 'bootstrap',
    up: async () => {
      // Reserved for the first schema bootstrap step.
    },
  },
  {
    version: 2,
    name: 'mvp-schema',
    up: async (database) => {
      await executeStatementsAsync(database, createTableStatements);
      await executeStatementsAsync(database, createIndexStatements);
      await seedDefaultCategoriesAsync(database);
    },
  },
  {
    version: 3,
    name: 'user-profile',
    up: async (database) => {
      await executeStatementsAsync(database, [createUserProfileTableStatement]);
    },
  },
];

export const DATABASE_VERSION = migrations[migrations.length - 1]?.version ?? 0;

export async function initializeDatabaseAsync(database: SQLiteDatabase) {
  await configureConnectionAsync(database);

  let currentVersion = await getDatabaseVersionAsync(database);

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await runMigrationAsync(database, migration);

    currentVersion = migration.version;
  }
}

async function runMigrationAsync(database: SQLiteDatabase, migration: Migration) {
  if (Platform.OS === 'web') {
    await database.withTransactionAsync(async () => {
      await migration.up(database);
      await database.execAsync(`PRAGMA user_version = ${migration.version}`);
    });

    return;
  }

  await database.withExclusiveTransactionAsync(async (transaction) => {
    await migration.up(transaction);
    await transaction.execAsync(`PRAGMA user_version = ${migration.version}`);
  });
}

async function configureConnectionAsync(database: DatabaseExecutor) {
  await database.execAsync("PRAGMA journal_mode = WAL");
  await database.execAsync('PRAGMA foreign_keys = ON');
}

async function getDatabaseVersionAsync(database: DatabaseExecutor) {
  const result = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );

  return result?.user_version ?? 0;
}

async function executeStatementsAsync(
  database: Pick<SQLiteDatabase, 'execAsync'>,
  statements: readonly string[]
) {
  for (const statement of statements) {
    await database.execAsync(statement);
  }
}
