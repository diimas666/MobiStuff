import type { HomeCategory } from '../types/catalog';
import { getCatalogSubcategories } from './catalogTree';

type CategoryStackNavigation = {
  navigate: (
    screen: 'Subcategories' | 'Category',
    params:
      | { category: HomeCategory }
      | {
          category: HomeCategory;
          subcategorySlug?: string;
          subcategoryTitle?: string;
        },
  ) => void;
};

export function openCategoryFlow(
  navigation: CategoryStackNavigation,
  category: HomeCategory,
) {
  const subcategories = getCatalogSubcategories(category.id);

  if (subcategories.length > 0) {
    navigation.navigate('Subcategories', { category });
    return;
  }

  navigation.navigate('Category', { category });
}
