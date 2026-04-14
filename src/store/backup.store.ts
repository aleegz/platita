import { create } from 'zustand';

export type BackupRestoreSummary = {
  importedFileName: string;
  restoredAt: string;
  emergencyBackupFileName: string;
};

type BackupStoreState = {
  lastRestore: BackupRestoreSummary | null;
  lastRestoreErrorMessage: string | null;
  setLastRestore: (summary: BackupRestoreSummary) => void;
  setLastRestoreErrorMessage: (message: string | null) => void;
  clearRestoreFeedback: () => void;
};

export const useBackupStore = create<BackupStoreState>((set) => ({
  lastRestore: null,
  lastRestoreErrorMessage: null,
  setLastRestore: (summary) =>
    set({
      lastRestore: summary,
      lastRestoreErrorMessage: null,
    }),
  setLastRestoreErrorMessage: (message) =>
    set({
      lastRestoreErrorMessage: message,
    }),
  clearRestoreFeedback: () =>
    set({
      lastRestore: null,
      lastRestoreErrorMessage: null,
    }),
}));

export const backupStoreSelectors = {
  lastRestore: (state: BackupStoreState) => state.lastRestore,
  lastRestoreErrorMessage: (state: BackupStoreState) =>
    state.lastRestoreErrorMessage,
} as const;
