import { Stack } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ActionButton,
  Screen,
  SectionIntro,
  StateCard,
  SurfaceCard,
} from '../../components';
import { useBackup } from '../../features/backup';
import { colors } from '../../theme';

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function BackupScreen() {
  const {
    clearLastRestore,
    clearPendingImport,
    exportBackup,
    exportErrorMessage,
    importErrorMessage,
    isExporting,
    isRestoring,
    isSelectingImport,
    lastExport,
    lastRestore,
    pendingImport,
    pickBackupToImport,
    restoreErrorMessage,
    restorePendingImport,
  } = useBackup();

  function handleRestorePress() {
    if (!pendingImport) {
      return;
    }

    Alert.alert(
      'Restaurar respaldo',
      `Vas a reemplazar todos los datos actuales con el archivo "${pendingImport.fileName}". Antes de continuar, la app guardará un respaldo de emergencia del estado actual.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => {
            void restorePendingImport();
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Respaldo', headerTitle: '' }} />
      <Screen
        eyebrow="Configuración"
        title="Respaldo"
        description="Exporta un snapshot completo de tu base local e importa respaldos válidos de Platita sin depender de la nube."
        topInset
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <SurfaceCard style={styles.card}>
            <SectionIntro
              description="Genera un archivo SQLite consistente de toda tu información local para guardarlo o compartirlo."
              iconName="download-outline"
              title="Exportar datos"
            />
            <ActionButton
              iconName="download-outline"
              label="Exportar respaldo"
              loading={isExporting}
              onPress={() => {
                void exportBackup();
              }}
            />
            <Text style={styles.helperText}>
              El archivo se guarda en el directorio local de respaldos y, si el dispositivo lo permite, se abre la hoja de compartir.
            </Text>
            {lastExport ? (
              <View style={styles.infoBlock}>
                <Text style={styles.infoTitle}>Último respaldo exportado</Text>
                <MetadataRow label="Archivo" value={lastExport.fileName} />
                <MetadataRow
                  label="Generado"
                  value={formatDateTime(lastExport.createdAt)}
                />
                <MetadataRow
                  label="Tamaño"
                  value={formatFileSize(lastExport.fileSize)}
                />
                <MetadataRow
                  label="Compartido"
                  value={lastExport.shared ? 'Sí' : 'No'}
                />
              </View>
            ) : null}
            {exportErrorMessage ? (
              <StateCard
                align="left"
                description={exportErrorMessage}
                iconName="alert-circle-outline"
                title="No se pudo exportar el respaldo"
                tone="error"
              />
            ) : null}
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <SectionIntro
              description="Selecciona un archivo generado por Platita para inspeccionarlo antes de reemplazar tu base actual."
              iconName="cloud-upload-outline"
              title="Importar respaldo"
            />
            <ActionButton
              iconName="folder-open-outline"
              label="Seleccionar archivo"
              loading={isSelectingImport}
              onPress={() => {
                void pickBackupToImport();
              }}
              variant="secondary"
            />
            <StateCard
              align="left"
              description="La restauración reemplaza toda la base actual. Platita crea un respaldo de emergencia antes de aplicar el cambio."
              iconName="warning-outline"
              title="Importación total"
              tone="warning"
            />
            {importErrorMessage ? (
              <StateCard
                align="left"
                description={importErrorMessage}
                iconName="alert-circle-outline"
                title="No se pudo preparar el respaldo"
                tone="error"
              />
            ) : null}
            {pendingImport ? (
              <View style={styles.previewBlock}>
                <Text style={styles.infoTitle}>Respaldo listo para restaurar</Text>
                <MetadataRow label="Archivo" value={pendingImport.fileName} />
                <MetadataRow
                  label="Importado"
                  value={formatDateTime(pendingImport.importedAt)}
                />
                <MetadataRow
                  label="Modificado"
                  value={
                    pendingImport.lastModifiedAt
                      ? formatDateTime(pendingImport.lastModifiedAt)
                      : 'Sin dato'
                  }
                />
                <MetadataRow
                  label="Tamaño"
                  value={formatFileSize(pendingImport.fileSize)}
                />
                <MetadataRow
                  label="Schema"
                  value={`v${pendingImport.summary.schemaVersion}`}
                />

                <View style={styles.summaryGrid}>
                  <SummaryStat
                    label="Cuentas"
                    value={pendingImport.summary.accountCount}
                  />
                  <SummaryStat
                    label="Categorías"
                    value={pendingImport.summary.categoryCount}
                  />
                  <SummaryStat
                    label="Movimientos"
                    value={pendingImport.summary.transactionCount}
                  />
                  <SummaryStat
                    label="Presupuestos"
                    value={pendingImport.summary.monthlyBudgetCount}
                  />
                  <SummaryStat
                    label="Datos económicos"
                    value={pendingImport.summary.economicDataCount}
                  />
                  <SummaryStat
                    label="Perfil"
                    value={pendingImport.summary.hasUserProfile ? 1 : 0}
                  />
                </View>

                <Text style={styles.helperText}>
                  {pendingImport.summary.profileDisplayName
                    ? `Perfil detectado: ${pendingImport.summary.profileDisplayName}.`
                    : 'El respaldo no incluye un perfil cargado.'}
                </Text>

                <View style={styles.actionsRow}>
                  <ActionButton
                    iconName="refresh-outline"
                    label="Restaurar ahora"
                    loading={isRestoring}
                    onPress={handleRestorePress}
                    style={styles.actionHalf}
                    variant="danger"
                  />
                  <ActionButton
                    compact
                    iconName="close-outline"
                    label="Descartar"
                    onPress={clearPendingImport}
                    style={styles.actionHalf}
                    variant="secondary"
                  />
                </View>
              </View>
            ) : null}
            {restoreErrorMessage ? (
              <StateCard
                align="left"
                description={restoreErrorMessage}
                iconName="alert-circle-outline"
                title="La restauración falló"
                tone="error"
              />
            ) : null}
          </SurfaceCard>

          {lastRestore ? (
            <SurfaceCard style={styles.card}>
              <SectionIntro
                description="La base local fue reemplazada y ya está corriendo con los datos del respaldo restaurado."
                iconName="checkmark-circle-outline"
                title="Restauración completada"
              />
              <MetadataRow label="Archivo importado" value={lastRestore.importedFileName} />
              <MetadataRow
                label="Restaurado"
                value={formatDateTime(lastRestore.restoredAt)}
              />
              <MetadataRow
                label="Backup de emergencia"
                value={lastRestore.emergencyBackupFileName}
              />
              <ActionButton
                compact
                iconName="close-outline"
                label="Ocultar"
                onPress={clearLastRestore}
                variant="secondary"
              />
            </SurfaceCard>
          ) : null}
        </ScrollView>
      </Screen>
    </>
  );
}

type MetadataRowProps = {
  label: string;
  value: string;
};

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <View style={styles.metadataRow}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{value}</Text>
    </View>
  );
}

type SummaryStatProps = {
  label: string;
  value: number;
};

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes >= 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  if (sizeInBytes >= 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${sizeInBytes} B`;
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 18,
    paddingBottom: 24,
  },
  card: {
    gap: 16,
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  infoBlock: {
    gap: 8,
    paddingTop: 4,
  },
  previewBlock: {
    gap: 12,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metadataLabel: {
    color: colors.muted,
    fontSize: 13,
    flexShrink: 0,
  },
  metadataValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexBasis: '31%',
    minWidth: 92,
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionHalf: {
    flex: 1,
  },
});
