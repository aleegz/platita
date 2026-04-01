import {
  openDatabaseAsync,
  type SQLiteDatabase,
  type SQLiteOpenOptions,
} from 'expo-sqlite';

export const DATABASE_NAME = 'platita.db';

export const DATABASE_OPTIONS: SQLiteOpenOptions = {
  enableChangeListener: false,
};

export type AppDatabase = SQLiteDatabase;

export function openAppDatabaseAsync() {
  return openDatabaseAsync(DATABASE_NAME, DATABASE_OPTIONS);
}

