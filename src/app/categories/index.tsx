import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
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
import {
  categoryTypeValues,
  getCategoryTypeDescription,
  getCategoryTypeLabel,
  useCategories,
} from '../../features/categories';
import { colors } from '../../theme';
import type { Category, CategoryType } from '../../types/domain';

const settingsRoute = '/(tabs)/settings' as Href;
const newCategoryRoute = '/categories/new' as Href;
const categoryDetailRoute = (id: string) =>
  ({
    pathname: '/categories/[id]',
    params: { id },
  }) as unknown as Href;

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, errorMessage, isLoading } = useCategories();
  const activeCount = categories.filter((category) => category.active).length;
  const inactiveCount = categories.length - activeCount;
  const groupedCategories = categoryTypeValues
    .map((type) => {
      const items = categories.filter((category) => category.type === type);
      const activeItems = items.filter((category) => category.active).length;

      return {
        type,
        items,
        activeItems,
        inactiveItems: items.length - activeItems,
      };
    })
    .filter((group) => group.items.length > 0);

  function returnToSettings() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(settingsRoute);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        description="Gestiona las categorías disponibles para ingresos, gastos y rendimientos."
        eyebrow="Catálogo local"
        title="Categorías"
        topBar={(
          <Pressable
            accessibilityRole="button"
            onPress={returnToSettings}
            style={styles.backButton}
          >
            <Ionicons color={colors.text} name="chevron-back" size={20} />
            <Text style={styles.backButtonText}>Ajustes</Text>
          </Pressable>
        )}
        topInset
      >
        <StatusBar style="light" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SurfaceCard style={styles.summaryCard}>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryEyebrow}>Catálogo actual</Text>
              <Text style={styles.summaryTitle}>{activeCount} activas</Text>
              <Text style={styles.summaryDescription}>
                Desactiva categorías que ya no uses para ocultarlas de formularios
                sin perder tu historial.
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricPill label="Totales" value={String(categories.length)} />
              <MetricPill label="Activas" value={String(activeCount)} />
              <MetricPill label="Inactivas" value={String(inactiveCount)} />
            </View>

            <ActionButton
              iconName="add-circle-outline"
              label="Nueva categoría"
              onPress={() => router.push(newCategoryRoute)}
            />
          </SurfaceCard>

          {isLoading ? (
            <StateCard
              description="Cargando categorías..."
              loading
              title="Preparando catálogo"
            />
          ) : null}

          {!isLoading && errorMessage ? (
            <StateCard
              description={errorMessage}
              iconName="alert-circle-outline"
              title="No se pudieron cargar las categorías"
              tone="error"
            />
          ) : null}

          {!isLoading && !errorMessage && categories.length === 0 ? (
            <StateCard
              description="Crea tu primera categoría para organizar mejor ingresos, gastos y rendimientos."
              iconName="pricetags-outline"
              title="Todavía no hay categorías"
            />
          ) : null}

          {!isLoading && !errorMessage && categories.length > 0 ? (
            <View style={styles.groupList}>
              {groupedCategories.map((group) => (
                <SurfaceCard key={group.type} style={styles.groupCard}>
                  <SectionIntro
                    description={getCategoryTypeDescription(group.type)}
                    iconName={getCategoryTypeIconName(group.type)}
                    title={getCategoryTypeLabel(group.type)}
                  />

                  <View style={styles.groupMetricsRow}>
                    <CategoryStatusPill
                      iconName="albums-outline"
                      label={`${group.items.length} ${
                        group.items.length === 1 ? 'categoría' : 'categorías'
                      }`}
                    />
                    {group.activeItems > 0 ? (
                      <CategoryStatusPill
                        iconName="checkmark-circle-outline"
                        label={`${group.activeItems} activas`}
                        tone="success"
                      />
                    ) : null}
                    {group.inactiveItems > 0 ? (
                      <CategoryStatusPill
                        iconName="eye-off-outline"
                        label={`${group.inactiveItems} inactivas`}
                        tone="muted"
                      />
                    ) : null}
                  </View>

                  <View style={styles.categoryList}>
                    {group.items.map((category) => (
                      <CategoryRow
                        key={category.id}
                        category={category}
                        onPress={() => router.push(categoryDetailRoute(category.id))}
                      />
                    ))}
                  </View>
                </SurfaceCard>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </Screen>
    </>
  );
}

type MetricPillProps = {
  label: string;
  value: string;
};

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

type CategoryStatusPillProps = {
  label: string;
  iconName: IconName;
  tone?: 'default' | 'success' | 'muted';
};

function CategoryStatusPill({
  label,
  iconName,
  tone = 'default',
}: CategoryStatusPillProps) {
  return (
    <View
      style={[
        styles.categoryStatusPill,
        tone === 'success'
          ? styles.categoryStatusPillSuccess
          : tone === 'muted'
            ? styles.categoryStatusPillMuted
            : null,
      ]}
    >
      <Ionicons
        color={
          tone === 'success'
            ? colors.success
            : tone === 'muted'
              ? colors.muted
              : colors.text
        }
        name={iconName}
        size={14}
      />
      <Text
        style={[
          styles.categoryStatusPillText,
          tone === 'success'
            ? styles.categoryStatusPillTextSuccess
            : tone === 'muted'
              ? styles.categoryStatusPillTextMuted
              : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type CategoryRowProps = {
  category: Category;
  onPress: () => void;
};

function CategoryRow({ category, onPress }: CategoryRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.categoryCard,
        !category.active ? styles.categoryCardInactive : null,
      ]}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIdentity}>
          <View
            style={[
              styles.categoryIcon,
              !category.active ? styles.categoryIconInactive : null,
            ]}
          >
            <Ionicons
              color={category.active ? colors.text : colors.muted}
              name={getCategoryTypeIconName(category.type)}
              size={18}
            />
          </View>
          <View style={styles.categoryCopy}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryMeta}>
              {category.active
                ? 'Disponible en nuevos movimientos y presupuestos.'
                : 'Oculta en formularios, pero mantiene tu historial.'}
            </Text>
          </View>
        </View>

        <View style={styles.categoryAside}>
          <View
            style={[
              styles.statusBadge,
              category.active
                ? styles.statusBadgeActive
                : styles.statusBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                category.active
                  ? styles.statusBadgeTextActive
                  : styles.statusBadgeTextInactive,
              ]}
            >
              {category.active ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
          <Ionicons color={colors.muted} name="chevron-forward" size={18} />
        </View>
      </View>
    </Pressable>
  );
}

function getCategoryTypeIconName(type: CategoryType): IconName {
  switch (type) {
    case 'income':
      return 'arrow-down-circle-outline';
    case 'expense':
      return 'arrow-up-circle-outline';
    case 'yield':
      return 'sparkles-outline';
    default:
      return 'pricetags-outline';
  }
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 18,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: -4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  summaryCard: {
    gap: 16,
  },
  summaryCopy: {
    gap: 4,
  },
  summaryEyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  summaryDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricPill: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  groupList: {
    gap: 18,
  },
  groupCard: {
    gap: 14,
  },
  groupMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAccent,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  categoryStatusPillSuccess: {
    backgroundColor: colors.surfaceSuccess,
  },
  categoryStatusPillMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  categoryStatusPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryStatusPillTextSuccess: {
    color: colors.success,
  },
  categoryStatusPillTextMuted: {
    color: colors.muted,
  },
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryCardInactive: {
    backgroundColor: colors.surface,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
  },
  categoryIconInactive: {
    backgroundColor: colors.surfaceMuted,
  },
  categoryCopy: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  categoryMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  categoryAside: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeActive: {
    backgroundColor: colors.surfaceSuccess,
  },
  statusBadgeInactive: {
    backgroundColor: colors.surfaceAccent,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextActive: {
    color: colors.success,
  },
  statusBadgeTextInactive: {
    color: colors.muted,
  },
});
