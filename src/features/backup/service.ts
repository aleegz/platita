import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { createUserFacingError } from '../../lib/errors';
import { DATABASE_VERSION } from '../../database/schema/migrations';
import {
  DATABASE_OPTIONS,
  normalizeBackupBytesForDeserialize,
  type AppDatabase,
} from '../../database/client/sqlite';

import type {
  BackupDatasetSummary,
  BackupImportPreview,
  StoredBackupFile,
} from './types';

type BackupFileDescriptor = {
  fileName: string;
  fileUri: string;
  fileSize: number;
  lastModifiedAt?: number | null;
};

type CountRow = {
  total: number;
};

type TableRow = {
  name: string;
};

type SchemaVersionRow = {
  user_version: number;
};

type IntegrityCheckRow = {
  integrity_check: string;
};

type UserProfilePreviewRow = {
  display_name: string;
};

const BACKUP_ROOT_DIRECTORY_NAME = 'platita-backups';
const EMERGENCY_DIRECTORY_NAME = 'emergency';
const REQUIRED_TABLES = [
  'accounts',
  'categories',
  'transactions',
  'monthly_budgets',
  'economic_data',
] as const;
const SQLITE_MIME_TYPE = 'application/x-sqlite3';
const SQLITE_UTI = 'public.database';

export type BackupService = {
  exportBackupAsync(): Promise<StoredBackupFile>;
  createEmergencyBackupAsync(): Promise<StoredBackupFile>;
  inspectBackupFileAsync(
    descriptor: BackupFileDescriptor
  ): Promise<BackupImportPreview>;
  readBackupBytesAsync(fileUri: string): Promise<Uint8Array>;
};

export function createBackupService(database: AppDatabase): BackupService {
  async function readBackupBytesAsync(fileUri: string) {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);

        if (!response.ok) {
          throw createUserFacingError(
            'No se encontró el archivo de respaldo seleccionado.'
          );
        }

        return new Uint8Array(await response.arrayBuffer());
      }

      const file = new File(fileUri);

      if (!file.exists) {
        throw createUserFacingError(
          'No se encontró el archivo de respaldo seleccionado.'
        );
      }

      return new Uint8Array(await file.bytes());
    } catch (error) {
      if (error instanceof Error && error.name === 'UserFacingError') {
        throw error;
      }

      throw createUserFacingError(
        'No se pudo leer el archivo del respaldo seleccionado.'
      );
    }
  }

  return {
    async exportBackupAsync() {
      const storedFile = await createBackupFileAsync(database, 'backup');
      const shared = await shareBackupFileIfPossibleAsync(storedFile.fileUri);

      return {
        ...storedFile,
        shared,
      };
    },
    async createEmergencyBackupAsync() {
      return createBackupFileAsync(database, 'emergency');
    },
    async inspectBackupFileAsync(descriptor) {
      const bytes = await readBackupBytesAsync(descriptor.fileUri);
      const summary = await inspectBackupBytesAsync(bytes);

      return {
        fileName: descriptor.fileName,
        fileUri: descriptor.fileUri,
        fileSize: descriptor.fileSize,
        importedAt: new Date().toISOString(),
        lastModifiedAt:
          descriptor.lastModifiedAt != null
            ? new Date(descriptor.lastModifiedAt).toISOString()
            : null,
        summary,
      };
    },
    readBackupBytesAsync,
  };
}

async function createBackupFileAsync(
  sourceDatabase: AppDatabase,
  mode: 'backup' | 'emergency'
): Promise<StoredBackupFile> {
  const createdAt = new Date().toISOString();
  const directory = getBackupDirectory(mode);
  const fileName =
    mode === 'emergency'
      ? `platita-emergency-${formatTimestampForFileName(createdAt)}.sqlite`
      : `platita-backup-${formatTimestampForFileName(createdAt)}.sqlite`;
  const file = new File(directory, fileName);
  let backupDatabase: AppDatabase | null = null;

  try {
    backupDatabase = await SQLite.openDatabaseAsync(
      fileName,
      DATABASE_OPTIONS,
      directory.uri
    );

    await SQLite.backupDatabaseAsync({
      sourceDatabase,
      sourceDatabaseName: 'main',
      destDatabase: backupDatabase,
      destDatabaseName: 'main',
    });
  } catch {
    if (file.exists) {
      file.delete();
    }

    throw createUserFacingError('No se pudo generar el archivo de respaldo local.');
  } finally {
    await backupDatabase?.closeAsync().catch(() => undefined);
  }

  const info = file.info();

  return {
    fileName,
    fileUri: file.uri,
    fileSize: info.size ?? file.size,
    createdAt,
    shared: false,
  };
}

function getBackupDirectory(mode: 'backup' | 'emergency') {
  const rootDirectory = new Directory(Paths.document, BACKUP_ROOT_DIRECTORY_NAME);

  rootDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  if (mode === 'backup') {
    return rootDirectory;
  }

  const emergencyDirectory = new Directory(rootDirectory, EMERGENCY_DIRECTORY_NAME);

  emergencyDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  return emergencyDirectory;
}

async function shareBackupFileIfPossibleAsync(fileUri: string) {
  try {
    const canShare = await Sharing.isAvailableAsync();

    if (!canShare) {
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      dialogTitle: 'Exportar respaldo de Platita',
      mimeType: SQLITE_MIME_TYPE,
      UTI: SQLITE_UTI,
    });

    return true;
  } catch {
    return false;
  }
}

async function inspectBackupBytesAsync(
  bytes: Uint8Array
): Promise<BackupDatasetSummary> {
  let importedDatabase: AppDatabase | null = null;

  try {
    importedDatabase = await SQLite.deserializeDatabaseAsync(
      normalizeBackupBytesForDeserialize(bytes),
      DATABASE_OPTIONS
    );

    const schemaVersion = await getSchemaVersionAsync(importedDatabase);

    if (schemaVersion > DATABASE_VERSION) {
      throw createUserFacingError(
        'Ese respaldo fue generado por una versión más nueva de Platita. Actualiza la app antes de importarlo.'
      );
    }

    await assertIntegrityAsync(importedDatabase);

    const tableNames = await listTableNamesAsync(importedDatabase);
    const missingTables = REQUIRED_TABLES.filter(
      (tableName) => !tableNames.includes(tableName)
    );

    if (missingTables.length > 0) {
      throw createUserFacingError(
        `El archivo seleccionado no parece ser un respaldo válido de Platita. Faltan tablas clave: ${missingTables.join(', ')}.`
      );
    }

    const hasUserProfile = tableNames.includes('user_profile');
    const profileDisplayName = hasUserProfile
      ? await getProfileDisplayNameAsync(importedDatabase)
      : null;

    return {
      schemaVersion,
      accountCount: await countRowsAsync(importedDatabase, 'accounts'),
      categoryCount: await countRowsAsync(importedDatabase, 'categories'),
      transactionCount: await countRowsAsync(importedDatabase, 'transactions'),
      monthlyBudgetCount: await countRowsAsync(
        importedDatabase,
        'monthly_budgets'
      ),
      economicDataCount: await countRowsAsync(importedDatabase, 'economic_data'),
      hasUserProfile,
      profileDisplayName,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'UserFacingError') {
      throw error;
    }

    throw createUserFacingError(
      'No se pudo validar el respaldo seleccionado. Verifica que sea un archivo generado por Platita.'
    );
  } finally {
    await importedDatabase?.closeAsync().catch(() => undefined);
  }
}

async function assertIntegrityAsync(database: AppDatabase) {
  const result = await database.getFirstAsync<IntegrityCheckRow>(
    'PRAGMA integrity_check'
  );

  if (result?.integrity_check !== 'ok') {
    throw createUserFacingError(
      'El respaldo seleccionado está corrupto o incompleto.'
    );
  }
}

async function listTableNamesAsync(database: AppDatabase) {
  const rows = await database.getAllAsync<TableRow>(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name ASC
  `);

  return rows.map((row) => row.name);
}

async function countRowsAsync(database: AppDatabase, tableName: string) {
  const row = await database.getFirstAsync<CountRow>(
    `SELECT COUNT(*) AS total FROM ${tableName}`
  );

  return row?.total ?? 0;
}

async function getProfileDisplayNameAsync(database: AppDatabase) {
  const row = await database.getFirstAsync<UserProfilePreviewRow>(`
    SELECT display_name
    FROM user_profile
    ORDER BY updated_at DESC
    LIMIT 1
  `);

  return row?.display_name ?? null;
}

async function getSchemaVersionAsync(database: AppDatabase) {
  const row = await database.getFirstAsync<SchemaVersionRow>('PRAGMA user_version');

  return row?.user_version ?? 0;
}

function formatTimestampForFileName(value: string) {
  return value.replace(/[:.]/g, '-');
}

