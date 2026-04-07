import type {
  Category,
  CategoryType,
} from '../../types/domain';

export const categoryTypeValues = [
  'income',
  'expense',
  'yield',
] as const;

export const protectedSystemCategoryIds = [
  'income-salary',
  'yield-investments',
] as const;

export type SaveCategoryInput = {
  name: string;
  type: CategoryType;
  active: boolean;
};

export type CategoryTypeOption = {
  value: CategoryType;
  label: string;
  description: string;
};

export const categoryTypeOptions: readonly CategoryTypeOption[] = [
  {
    value: 'income',
    label: 'Ingreso',
    description: 'Entradas de dinero como sueldo, ventas o reintegros.',
  },
  {
    value: 'expense',
    label: 'Gasto',
    description: 'Pagos, consumos y salidas de dinero para presupuestos.',
  },
  {
    value: 'yield',
    label: 'Rendimiento',
    description: 'Ganancias financieras, intereses o retornos de inversión.',
  },
] as const;

export const defaultCategoryFormValues: SaveCategoryInput = {
  name: '',
  type: 'expense',
  active: true,
};

export function isProtectedSystemCategoryId(categoryId: string) {
  return protectedSystemCategoryIds.includes(
    categoryId as (typeof protectedSystemCategoryIds)[number]
  );
}

export function isCategoryVisibleInCrud(category: Pick<Category, 'id'>) {
  return !isProtectedSystemCategoryId(category.id);
}

export function getCategoryTypeLabel(type: CategoryType) {
  const option = categoryTypeOptions.find((item) => item.value === type);

  return option ? option.label : type;
}

export function getCategoryTypeDescription(type: CategoryType) {
  const option = categoryTypeOptions.find((item) => item.value === type);

  return option ? option.description : '';
}

export function toCategoryFormValues(category: Category): SaveCategoryInput {
  return {
    name: category.name,
    type: category.type,
    active: category.active,
  };
}