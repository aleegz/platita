import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen, TopBarBackButton } from '../../components';
import {
  CategoryForm,
  toCategoryFormValues,
  useCategory,
  useCategoryMutations,
} from '../../features/categories';
import { colors } from '../../theme';

const categoriesRoute = '/categories' as Href;

export default function CategoryDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const categoryId = typeof params.id === 'string' ? params.id : undefined;
  const { category, errorMessage, isLoading } = useCategory(categoryId);
  const {
    errorMessage: submitErrorMessage,
    isSubmitting,
    updateCategory,
  } = useCategoryMutations();

  const currentErrorMessage = errorMessage ?? submitErrorMessage;

  function returnToCategories() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(categoriesRoute);
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Screen
          title="Editar categoría"
          description="Cargando los datos de la categoría seleccionada."
          topBar={<TopBarBackButton label="Categorías" onPress={returnToCategories} />}
          topInset
        >
          <View style={styles.centeredCard}>
            <ActivityIndicator color={colors.text} size="small" />
            <Text style={styles.centeredText}>Cargando categoría...</Text>
          </View>
        </Screen>
      </>
    );
  }

  if (!categoryId || !category) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Screen
          title="Categoría no encontrada"
          description="No fue posible abrir la categoría seleccionada."
          topBar={<TopBarBackButton label="Categorías" onPress={returnToCategories} />}
          topInset
        >
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {currentErrorMessage ?? 'La categoría ya no existe o no está disponible.'}
            </Text>
          </View>
          <Pressable
            onPress={returnToCategories}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Volver a categorías</Text>
          </Pressable>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CategoryForm
        backLabel="Categorías"
        key={category.id}
        defaultValues={toCategoryFormValues(category)}
        description="Actualiza nombre, tipo o disponibilidad de la categoría."
        errorMessage={submitErrorMessage}
        isSubmitting={isSubmitting}
        onBackPress={returnToCategories}
        showActiveField
        submitLabel="Guardar cambios"
        title="Editar categoría"
        onSubmit={async (values) => {
          await updateCategory(category.id, values);
          returnToCategories();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centeredCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  centeredText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  messageCard: {
    borderRadius: 16,
    backgroundColor: colors.surfaceError,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
