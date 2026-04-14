import {
  openDatabaseAsync,
  type SQLiteDatabase,
  type SQLiteOpenOptions,
} from 'expo-sqlite';

export const DATABASE_NAME = 'platita.db';
const SQLITE_HEADER_BYTES = [
  0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66,
  0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
] as const;
const SQLITE_READ_VERSION_OFFSET = 18;
const SQLITE_WRITE_VERSION_OFFSET = 19;
const SQLITE_ROLLBACK_JOURNAL_MODE = 1;

export const DATABASE_OPTIONS: SQLiteOpenOptions = {
  enableChangeListener: false,
};

export type AppDatabase = SQLiteDatabase;

export function openAppDatabaseAsync(
  options?: Partial<SQLiteOpenOptions>
) {
  return openDatabaseAsync(DATABASE_NAME, {
    ...DATABASE_OPTIONS,
    ...options,
  });
}

export function normalizeBackupBytesForDeserialize(bytes: Uint8Array) {
  const normalizedBytes = new Uint8Array(bytes);

  if (normalizedBytes.length < SQLITE_WRITE_VERSION_OFFSET + 1) {
    return normalizedBytes;
  }

  const hasSqliteHeader = SQLITE_HEADER_BYTES.every(
    (byte, index) => normalizedBytes[index] === byte
  );

  if (!hasSqliteHeader) {
    return normalizedBytes;
  }

  // SQLite deserialize does not accept database images marked as WAL.
  // For Platita backups we force the read/write versions back to rollback mode.
  normalizedBytes[SQLITE_READ_VERSION_OFFSET] = SQLITE_ROLLBACK_JOURNAL_MODE;
  normalizedBytes[SQLITE_WRITE_VERSION_OFFSET] = SQLITE_ROLLBACK_JOURNAL_MODE;

  return normalizedBytes;
}
