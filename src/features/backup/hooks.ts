import { useEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

import {
  useDatabase,
  useDatabaseMaintenance,
} from '../../database/client/provider';
import {
  createUserFacingError,
  getUserFacingMessage,
} from '../../lib/errors';
import {
  backupStoreSelectors,
  useBackupStore,
} from '../../store/backup.store';

import { createBackupService } from './service';
import type {
  BackupImportPreview,
  StoredBackupFile,
} from './types';

type BackupHookState = {
  isExporting: boolean;
  exportErrorMessage: string | null;
  lastExport: StoredBackupFile | null;
  isSelectingImport: boolean;
  importErrorMessage: string | null;
  pendingImport: BackupImportPreview | null;
  isRestoring: boolean;
  restoreErrorMessage: string | null;
  lastRestore: {
    importedFileName: string;
    restoredAt: string;
    emergencyBackupFileName: string;
  } | null;
  exportBackup: () => Promise<void>;
  pickBackupToImport: () => Promise<void>;
  restorePendingImport: () => Promise<void>;
  clearPendingImport: () => void;
  clearLastRestore: () => void;
};

export function useBackup(): BackupHookState {
  const database = useDatabase();
  const { replaceDatabaseAsync } = useDatabaseMaintenance();
  const lastRestore = useBackupStore(backupStoreSelectors.lastRestore);
  const persistedRestoreErrorMessage = useBackupStore(
    backupStoreSelectors.lastRestoreErrorMessage
  );
  const setLastRestore = useBackupStore((state) => state.setLastRestore);
  const setLastRestoreErrorMessage = useBackupStore(
    (state) => state.setLastRestoreErrorMessage
  );
  const clearRestoreFeedback = useBackupStore(
    (state) => state.clearRestoreFeedback
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(
    null
  );
  const [lastExport, setLastExport] = useState<StoredBackupFile | null>(null);
  const [isSelectingImport, setIsSelectingImport] = useState(false);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(
    null
  );
  const [pendingImport, setPendingImport] = useState<BackupImportPreview | null>(
    null
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreErrorMessage, setRestoreErrorMessage] = useState<string | null>(
    null
  );
  const isMountedRef = useRef(true);
  const backupService = createBackupService(database);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function exportBackup() {
    setIsExporting(true);
    setExportErrorMessage(null);

    try {
      const exportedBackup = await backupService.exportBackupAsync();

      if (!isMountedRef.current) {
        return;
      }

      setLastExport(exportedBackup);
    } catch (error) {
      console.error(error);

      if (!isMountedRef.current) {
        return;
      }

      setExportErrorMessage(
        getUserFacingMessage(error, 'No se pudo exportar el respaldo local.')
      );
    } finally {
      if (isMountedRef.current) {
        setIsExporting(false);
      }
    }
  }

  async function pickBackupToImport() {
    setIsSelectingImport(true);
    setImportErrorMessage(null);
    setRestoreErrorMessage(null);
    clearRestoreFeedback();

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: '*/*',
      });

      if (result.canceled) {
        return;
      }

      const [asset] = result.assets;

      if (!asset) {
        throw createUserFacingError(
          'No se encontró ningún archivo para importar.'
        );
      }

      const preview = await backupService.inspectBackupFileAsync({
        fileName: asset.name,
        fileUri: asset.uri,
        fileSize: asset.size ?? 0,
        lastModifiedAt: asset.lastModified,
      });

      if (!isMountedRef.current) {
        return;
      }

      setPendingImport(preview);
    } catch (error) {
      console.error(error);

      if (!isMountedRef.current) {
        return;
      }

      setPendingImport(null);
      setImportErrorMessage(
        getUserFacingMessage(
          error,
          'No se pudo preparar el respaldo seleccionado.'
        )
      );
    } finally {
      if (isMountedRef.current) {
        setIsSelectingImport(false);
      }
    }
  }

  async function restorePendingImport() {
    if (!pendingImport) {
      throw createUserFacingError(
        'Selecciona un archivo de respaldo antes de restaurar.'
      );
    }

    setIsRestoring(true);
    setRestoreErrorMessage(null);
    setLastRestoreErrorMessage(null);

    try {
      const emergencyBackup = await backupService.createEmergencyBackupAsync();
      const bytes = await backupService.readBackupBytesAsync(
        pendingImport.fileUri
      );

      await replaceDatabaseAsync(bytes);

      setLastRestore({
        importedFileName: pendingImport.fileName,
        restoredAt: new Date().toISOString(),
        emergencyBackupFileName: emergencyBackup.fileName,
      });

      if (!isMountedRef.current) {
        return;
      }

      setPendingImport(null);
    } catch (error) {
      console.error(error);

      const message = getUserFacingMessage(
        error,
        'No se pudo restaurar el respaldo seleccionado.'
      );

      setLastRestoreErrorMessage(message);

      if (!isMountedRef.current) {
        return;
      }

      setRestoreErrorMessage(message);
    } finally {
      if (isMountedRef.current) {
        setIsRestoring(false);
      }
    }
  }

  function clearPendingImport() {
    setPendingImport(null);
    setImportErrorMessage(null);
    setRestoreErrorMessage(null);
    setLastRestoreErrorMessage(null);
  }

  return {
    isExporting,
    exportErrorMessage,
    lastExport,
    isSelectingImport,
    importErrorMessage,
    pendingImport,
    isRestoring,
    restoreErrorMessage:
      restoreErrorMessage ?? persistedRestoreErrorMessage,
    lastRestore,
    exportBackup,
    pickBackupToImport,
    restorePendingImport,
    clearPendingImport,
    clearLastRestore: clearRestoreFeedback,
  };
}
