jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => {
  class MockDirectory {
    uri: string;

    constructor(...parts: Array<string | { uri?: string }>) {
      this.uri = parts
        .map((part) => (typeof part === 'string' ? part : part.uri ?? ''))
        .filter(Boolean)
        .join('/');
    }

    create() {}
  }

  class MockFile {
    exists = false;
    uri: string;
    size = 0;

    constructor(...parts: Array<string | { uri?: string }>) {
      this.uri = parts
        .map((part) => (typeof part === 'string' ? part : part.uri ?? ''))
        .filter(Boolean)
        .join('/');
    }

    async bytes() {
      return new Uint8Array();
    }

    delete() {}

    info() {
      return { size: 0 };
    }
  }

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: {
      document: 'document',
    },
  };
});

jest.mock('expo-sqlite', () => ({
  backupDatabaseAsync: jest.fn(),
  deserializeDatabaseAsync: jest.fn(),
  openDatabaseAsync: jest.fn(),
}));

import * as SQLite from 'expo-sqlite';

import { DATABASE_VERSION } from '../../database/schema/migrations';

import { createBackupService } from './service';

const mockedDeserializeDatabaseAsync = jest.mocked(SQLite.deserializeDatabaseAsync);

function createImportedDatabase(overrides: {
  integrityCheck?: string;
  schemaVersion?: number;
  tableNames?: string[];
  counts?: Partial<Record<string, number>>;
  profileDisplayName?: string | null;
} = {}) {
  const counts = overrides.counts ?? {};
  const tableNames = overrides.tableNames ?? [
    'accounts',
    'categories',
    'transactions',
    'monthly_budgets',
    'economic_data',
    'user_profile',
  ];

  return {
    closeAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn(async (statement: string) => {
      if (statement === 'PRAGMA user_version') {
        return { user_version: overrides.schemaVersion ?? DATABASE_VERSION };
      }

      if (statement === 'PRAGMA integrity_check') {
        return { integrity_check: overrides.integrityCheck ?? 'ok' };
      }

      if (statement.includes('FROM user_profile')) {
        return { display_name: overrides.profileDisplayName ?? 'Ale' };
      }

      const match = statement.match(/FROM\s+([a-z_]+)/i);

      if (match) {
        return { total: counts[match[1]] ?? 0 };
      }

      return null;
    }),
    getAllAsync: jest.fn(async () => tableNames.map((name) => ({ name }))),
  };
}

describe('createBackupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('returns a user-facing not found error when the selected file is missing on web', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      arrayBuffer: jest.fn(),
    });

    const service = createBackupService({} as never);

    await expect(service.readBackupBytesAsync('https://example.com/backup.sqlite')).rejects.toMatchObject({
      name: 'UserFacingError',
      userMessage: 'No se encontró el archivo de respaldo seleccionado.',
    });
  });

  it('rejects backups created by a newer app version and still closes the imported database', async () => {
    const importedDatabase = createImportedDatabase({
      schemaVersion: DATABASE_VERSION + 1,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    });
    mockedDeserializeDatabaseAsync.mockResolvedValue(importedDatabase as never);

    const service = createBackupService({} as never);

    await expect(
      service.inspectBackupFileAsync({
        fileName: 'backup.sqlite',
        fileUri: 'https://example.com/backup.sqlite',
        fileSize: 512,
        lastModifiedAt: null,
      })
    ).rejects.toMatchObject({
      name: 'UserFacingError',
      userMessage:
        'Ese respaldo fue generado por una versión más nueva de Platita. Actualiza la app antes de importarlo.',
    });
    expect(importedDatabase.closeAsync).toHaveBeenCalled();
  });

  it('rejects backups that are missing required tables', async () => {
    const importedDatabase = createImportedDatabase({
      tableNames: ['accounts', 'categories', 'transactions'],
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    });
    mockedDeserializeDatabaseAsync.mockResolvedValue(importedDatabase as never);

    const service = createBackupService({} as never);

    await expect(
      service.inspectBackupFileAsync({
        fileName: 'backup.sqlite',
        fileUri: 'https://example.com/backup.sqlite',
        fileSize: 512,
        lastModifiedAt: null,
      })
    ).rejects.toMatchObject({
      name: 'UserFacingError',
      userMessage:
        'El archivo seleccionado no parece ser un respaldo válido de Platita. Faltan tablas clave: monthly_budgets, economic_data.',
    });
  });

  it('builds an import preview summary for valid backups', async () => {
    const importedDatabase = createImportedDatabase({
      counts: {
        accounts: 2,
        categories: 5,
        transactions: 12,
        monthly_budgets: 3,
        economic_data: 4,
      },
      profileDisplayName: 'Platita User',
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    });
    mockedDeserializeDatabaseAsync.mockResolvedValue(importedDatabase as never);

    const service = createBackupService({} as never);
    const preview = await service.inspectBackupFileAsync({
      fileName: 'backup.sqlite',
      fileUri: 'https://example.com/backup.sqlite',
      fileSize: 512,
      lastModifiedAt: Date.parse('2026-06-16T12:00:00.000Z'),
    });

    expect(preview).toMatchObject({
      fileName: 'backup.sqlite',
      fileUri: 'https://example.com/backup.sqlite',
      fileSize: 512,
      lastModifiedAt: '2026-06-16T12:00:00.000Z',
      summary: {
        schemaVersion: DATABASE_VERSION,
        accountCount: 2,
        categoryCount: 5,
        transactionCount: 12,
        monthlyBudgetCount: 3,
        economicDataCount: 4,
        hasUserProfile: true,
        profileDisplayName: 'Platita User',
      },
    });
    expect(importedDatabase.closeAsync).toHaveBeenCalled();
  });
});
