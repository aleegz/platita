import { Stack } from 'expo-router';

import { PlaceholderScreen } from '../../components';

const items = [
  'Exportación local de datos',
  'Importación desde respaldo',
  'Controles básicos de recuperación',
] as const;

export default function BackupScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Respaldo', headerTitle: '' }} />
      <PlaceholderScreen
        title="Respaldo"
        description="Ruta lista para futuras herramientas de backup y restauración local."
        items={items}
      />
    </>
  );
}
