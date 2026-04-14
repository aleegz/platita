export type BackupDatasetSummary = {
  schemaVersion: number;
  accountCount: number;
  categoryCount: number;
  transactionCount: number;
  monthlyBudgetCount: number;
  economicDataCount: number;
  hasUserProfile: boolean;
  profileDisplayName: string | null;
};

export type StoredBackupFile = {
  fileName: string;
  fileUri: string;
  fileSize: number;
  createdAt: string;
  shared: boolean;
};

export type BackupImportPreview = {
  fileName: string;
  fileUri: string;
  fileSize: number;
  importedAt: string;
  lastModifiedAt: string | null;
  summary: BackupDatasetSummary;
};
