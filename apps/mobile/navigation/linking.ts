import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Посилання на екрани застосунку:
 *   mobistuff://product/<handle>, mobistuff://cart, mobistuff://orders, mobistuff://catalog …
 */
export const linking: LinkingOptions<RootStackParamList> = {
  // + Universal Links з сайту (файл /.well-known/apple-app-site-association)
  prefixes: ['mobistuff://', 'https://mobistuff.shop', 'https://www.mobistuff.shop'],
  // mobistuff://push-enable обробляє нативна частина (запит дозволу), не навігація
  filter: url => !url.includes('push-enable') && !url.includes('request-review'),
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
              // /account на сайті — кабінет; у застосунку це «Мої замовлення»
              ProfileOrders: { path: 'orders', alias: ['account'] },
              ViewedProducts: 'viewed',
              DeliveryAddresses: 'addresses',
              PaymentMethods: 'payments',
              Notifications: 'notifications',
              Settings: 'settings',
              Support: 'support',
              Tracking: 'tracking/:ttn?',
            },
          },
        },
      },
    },
  },
};
