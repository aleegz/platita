import { Stack } from 'expo-router';

import { PlaceholderScreen } from '../../components';

const items = [
  'Edición del nombre y tipo',
  'Activación o desactivación de categoría',
  'Uso futuro en movimientos y presupuestos',
] as const;

export default function CategoryDetailScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Detalle de categoría', headerTitle: '' }} />
      <PlaceholderScreen
        title="Detalle de categoría"
        description="Ruta placeholder para administrar una categoría existente."
        items={items}
      />
    </>
  );
}
