import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { ErrorState } from '../components/ErrorState';
import { OfflineState } from '../components/OfflineState';
import { LoadingState } from '../components/LoadingState';
import { Screen } from '../components/Screen';
import { CategoryListItem } from '../components/categories/CategoryListItem';
import { HomeSearchBar } from '../components/home/HomeSearchBar';
import { spacing } from '../constants/theme';
import { useCategories } from '../hooks/useCategories';
import { useNetwork } from '../context/NetworkContext';
import type { CategoriesStackParamList, RootStackParamList } from '../navigation/types';
import type { HomeCategory } from '../types/catalog';
import { openCategoryFlow } from '../utils/openCategoryFlow';
import { useThemedStyles } from '../hooks/useThemedStyles';

type CategoriesNavigationProp = NativeStackNavigationProp<
  CategoriesStackParamList,
  'CategoriesList'
>;

export function CategoriesScreen() {
  const { styles } = useThemedStyles(c => ({
    header: {
      paddingHorizontal: spacing.screen,
      paddingTop: 8,
      paddingBottom: 16,
    },
    title: {
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: -0.8,
      color: c.text,
      marginBottom: 14,
    },
    list: {
      paddingBottom: 32,
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
    ({ item, index }: { item: HomeCategory; index: number }) => (
      <CategoryListItem category={item} onPress={openCategory} isFirst={index === 0} isLast={index === categories.length - 1} />
    ),
    [openCategory, categories.length],
  );

  const listHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Каталог</Text>
        <HomeSearchBar onProductPress={product => (navigation as unknown as NativeStackNavigationProp<RootStackParamList>).navigate('Product', { product })} />
      </View>
    ),
    [],
  );


  return (
    <Screen variant="home">
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}
