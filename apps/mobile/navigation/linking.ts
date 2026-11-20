import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Посилання на екрани застосунку:
 *   mobistuff://product/<handle>, mobistuff://cart, mobistuff://orders, mobistuff://catalog …
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['mobistuff://'],
  // mobistuff://push-enable обробляє нативна частина (запит дозволу), не навігація
  filter: url => !url.includes('push-enable'),
  config: {
    screens: {
      Product: 'product/:handle',
      Checkout: 'checkout',
      PrivacyPolicy: 'privacy',
      MainTabs: {
        screens: {
          Home: 'home',
          Cart: 'cart',
          Favorites: 'favorites',
          Categories: { screens: { CategoriesList: 'catalog', Category: 'category/:slug/:sub?' } },
          Profile: {
            screens: {
              ProfileMain: 'profile',
              ProfileOrders: 'orders',
              ViewedProducts: 'viewed',
              DeliveryAddresses: 'addresses',
              PaymentMethods: 'payments',
              Notifications: 'notifications',
              Settings: 'settings',
              Support: 'support',
            },
          },
        },
      },
    },
  },
};
