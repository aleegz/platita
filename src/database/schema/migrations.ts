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
  {
    version: 4,
    name: 'credit-accounts',
    up: async (database) => {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS accounts_next (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'wallet', 'investment', 'credit')),
          initial_balance INTEGER NOT NULL DEFAULT 0,
          active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await database.execAsync(`
        INSERT INTO accounts_next (
          id,
          name,
          type,
          initial_balance,
          active,
          created_at,
          updated_at
        )
        SELECT
          id,
          name,
          type,
          initial_balance,
          active,
          created_at,
          updated_at
        FROM accounts;
      `);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions_next (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'yield')),
          amount INTEGER NOT NULL CHECK (amount > 0),
          date TEXT NOT NULL,
          account_id TEXT,
          from_account_id TEXT,
          to_account_id TEXT,
          category_id TEXT,
          note TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (account_id) REFERENCES accounts_next(id) ON DELETE SET NULL,
          FOREIGN KEY (from_account_id) REFERENCES accounts_next(id) ON DELETE SET NULL,
          FOREIGN KEY (to_account_id) REFERENCES accounts_next(id) ON DELETE SET NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );
      `);

      await database.execAsync(`
        INSERT INTO transactions_next (
          id,
          type,
          amount,
          date,
          account_id,
          from_account_id,
          to_account_id,
          category_id,
          note,
          created_at,
          updated_at
        )
        SELECT
          id,
          type,
          amount,
          date,
          account_id,
          from_account_id,
          to_account_id,
          category_id,
          note,
          created_at,
          updated_at
        FROM transactions;
      `);

      await database.execAsync('DROP TABLE transactions');
      await database.execAsync('DROP TABLE accounts');
      await database.execAsync('ALTER TABLE accounts_next RENAME TO accounts');
      await database.execAsync('ALTER TABLE transactions_next RENAME TO transactions');
      await executeStatementsAsync(database, createIndexStatements);
    },
  },
  {
    version: 5,
    name: 'app-lock-preference',
    up: async (database) => {
      await database.execAsync(`
        ALTER TABLE user_profile
        ADD COLUMN app_lock_enabled INTEGER NOT NULL DEFAULT 0;
      `);
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