import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { ErrorState } from '../components/ErrorState';
import { OfflineState } from '../components/OfflineState';
import { LoadingState } from '../components/LoadingState';
import { Screen } from '../components/Screen';
import { CategoryListItem } from '../components/categories/CategoryListItem';
import { spacing } from '../constants/theme';
import { useCategories } from '../hooks/useCategories';
import { useNetwork } from '../context/NetworkContext';
import type { CategoriesStackParamList } from '../navigation/types';
import type { HomeCategory } from '../types/catalog';
import { openCategoryFlow } from '../utils/openCategoryFlow';
import { useThemedStyles } from '../hooks/useThemedStyles';

type CategoriesNavigationProp = NativeStackNavigationProp<
  CategoriesStackParamList,
  'CategoriesList'
>;

export function CategoriesScreen() {
  const { styles, colors } = useThemedStyles(c => ({
    header: {
      paddingHorizontal: spacing.screen,
      paddingTop: 8,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.textOnDark,
    },
    list: {
      paddingBottom: 24,
    },
    separator: {
      height: 1,
      backgroundColor: c.homeSurface,
      marginLeft: spacing.screen + 72 + 16,
      marginRight: spacing.screen,
    },
  }));

  const navigation = useNavigation<CategoriesNavigationProp>();
  const { isOffline } = useNetwork();
  const { categories, isLoading, error, retry } = useCategories();

  const openCategory = useCallback(
    (category: HomeCategory) => {
      openCategoryFlow(navigation, category);
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: HomeCategory }) => (
      <CategoryListItem category={item} onPress={openCategory} />
    ),
    [openCategory],
  );

  const listHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Категорії</Text>
      </View>
    ),
    [],
  );

  const itemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />
      {isOffline && categories.length === 0 ? (
        <OfflineState onRetry={retry} />
      ) : isLoading && categories.length === 0 ? (
        <LoadingState label="Завантаження категорій..." />
      ) : error && categories.length === 0 ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <FlashList
          testID="screen-categories"
          data={categories}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ItemSeparatorComponent={itemSeparator}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}
