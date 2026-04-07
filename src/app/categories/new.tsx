import { Stack, useRouter, type Href } from 'expo-router';

import {
  CategoryForm,
  defaultCategoryFormValues,
  useCategoryMutations,
} from '../../features/categories';

const categoriesRoute = '/categories' as Href;

export default function NewCategoryScreen() {
  const router = useRouter();
  const { createCategory, errorMessage, isSubmitting } = useCategoryMutations();

  function returnToCategories() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(categoriesRoute);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CategoryForm
        backLabel="Categorías"
        defaultValues={defaultCategoryFormValues}
        description="Crea una categoría para organizar mejor tus ingresos, gastos o rendimientos."
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onBackPress={returnToCategories}
        submitLabel="Guardar categoría"
        title="Nueva categoría"
        onSubmit={async (values) => {
          await createCategory(values);
          returnToCategories();
        }}
      />
    </>
  );
}