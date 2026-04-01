import { Stack } from 'expo-router';

import { PlaceholderScreen } from '../../components';

const items = [
  'Nombre de categoría',
  'Tipo: ingreso, gasto o rendimiento',
  'Estado activo para filtros y presupuestos',
] as const;

export default function NewCategoryScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nueva categoría', headerTitle: '' }} />
      <PlaceholderScreen
        title="Nueva categoría"
        description="Ruta preparada para alta de categorías sin implementar todavía el CRUD completo."
        items={items}
      />
    </>
  );
}
