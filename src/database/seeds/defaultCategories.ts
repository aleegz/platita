import type { SQLiteDatabase } from 'expo-sqlite';

type CategoryType = 'income' | 'expense' | 'yield';

type DefaultCategory = {
  id: string;
  name: string;
  type: CategoryType;
};

type SeedDatabase = Pick<SQLiteDatabase, 'runAsync'>;

const defaultCategories: readonly DefaultCategory[] = [
  { id: 'income-salary', name: 'Sueldo', type: 'income' },
  { id: 'income-extra', name: 'Ingreso extra', type: 'income' },
  { id: 'expense-food', name: 'Comida', type: 'expense' },
  { id: 'expense-transport', name: 'Transporte', type: 'expense' },
  { id: 'expense-rent', name: 'Alquiler', type: 'expense' },
  { id: 'expense-services', name: 'Servicios', type: 'expense' },
  { id: 'expense-health', name: 'Salud', type: 'expense' },
  { id: 'expense-leisure', name: 'Ocio', type: 'expense' },
  { id: 'expense-education', name: 'Educación', type: 'expense' },
  { id: 'expense-taxes', name: 'Impuestos', type: 'expense' },
  { id: 'yield-investments', name: 'Rendimientos', type: 'yield' },
] as const;

export async function seedDefaultCategoriesAsync(database: SeedDatabase) {
  const timestamp = new Date().toISOString();

  for (const category of defaultCategories) {
    await database.runAsync(
      `
        INSERT OR IGNORE INTO categories (
          id,
          name,
          type,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, 1, ?, ?);
      `,
      category.id,
      category.name,
      category.type,
      timestamp,
      timestamp
    );
  }
}

