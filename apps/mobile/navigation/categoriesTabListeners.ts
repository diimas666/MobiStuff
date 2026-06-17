import {
  CommonActions,
  type EventArg,
  type NavigationProp,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { TabParamList } from './types';

type CategoriesTabRoute = RouteProp<TabParamList, 'Categories'>;

function getCategoriesStackKey(route: CategoriesTabRoute) {
  return route.state?.key ?? route.key;
}

function hasDeepCategoriesStack(route: CategoriesTabRoute) {
  const stackIndex = route.state?.index ?? 0;
  const stackLength = route.state?.routes?.length ?? 0;

  return stackIndex > 0 || stackLength > 1;
}

export function resetCategoriesStackToList(
  navigation: NavigationProp<TabParamList>,
  route: CategoriesTabRoute,
) {
  navigation.dispatch({
    ...CommonActions.reset({
      index: 0,
      routes: [{ name: 'CategoriesList' }],
    }),
    target: getCategoriesStackKey(route),
  });
}

export function createCategoriesTabListeners({
  navigation,
  route,
}: {
  navigation: NavigationProp<TabParamList>;
  route: CategoriesTabRoute;
}) {
  return {
    tabPress: (event: EventArg<'tabPress', true>) => {
      if (!hasDeepCategoriesStack(route)) {
        return;
      }

      event.preventDefault();
      resetCategoriesStackToList(navigation, route);
    },
    blur: () => {
      if (!hasDeepCategoriesStack(route)) {
        return;
      }

      resetCategoriesStackToList(navigation, route);
    },
  };
}

export function openPromoCategory(
  navigation: NavigationProp<TabParamList>,
  params: {
    category: { id: string; title: string; image?: string };
    subcategorySlug?: string;
    subcategoryTitle?: string;
    onSaleOnly?: boolean;
  },
) {
  navigation.dispatch(
    CommonActions.navigate({
      name: 'Categories',
      params: {
        screen: 'Category',
        params,
      },
    }),
  );
}
