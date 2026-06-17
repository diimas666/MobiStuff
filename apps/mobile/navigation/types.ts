import type { NavigatorScreenParams } from '@react-navigation/native';
import type { HomeCategory, HomeProduct } from '../types/catalog';

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  Subcategories: { category: HomeCategory };
  Category: {
    category: HomeCategory;
    subcategorySlug?: string;
    subcategoryTitle?: string;
  };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileOrders: undefined;
  ViewedProducts: undefined;
  DeliveryAddresses: undefined;
  PaymentMethods: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Product: { product: HomeProduct };
  Checkout: undefined;
  PrivacyPolicy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Categories: NavigatorScreenParams<CategoriesStackParamList> | undefined;
  Cart:
    | {
        returnTo?: {
          name: 'Product';
          params: { product: HomeProduct };
        };
      }
    | undefined;
  Favorites:
    | {
        returnTo?: {
          tab: 'Profile';
          screen?: keyof ProfileStackParamList;
        };
      }
    | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
