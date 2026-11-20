import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { DevNavBridge } from './components/dev/DevNavBridge';
import type { RootStackParamList } from './navigation/types';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { syncPushToken } from './services/push';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoriteDiscountWatcher } from './components/notification/FavoriteDiscountWatcher';
import { OfflineBanner } from './components/OfflineBanner';
import { CartProvider } from './context/CartContext';
import { DeliveryAddressesProvider } from './context/DeliveryAddressesContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { OrdersProvider } from './context/OrdersContext';
import { PaymentMethodsProvider } from './context/PaymentMethodsContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { NetworkProvider } from './context/NetworkContext';
import { ToastProvider } from './context/ToastContext';
import { ViewedProductsProvider } from './context/ViewedProductsContext';
import { RootNavigator } from './navigation/RootNavigator';
import { MyPhoneProvider } from './context/MyPhoneContext';
import { PhonePickerSheet } from './components/phone/PhonePickerSheet';
import { linking } from './navigation/linking';

enableScreens(true);

const navigationRef = createNavigationContainerRef<RootStackParamList>();

function AppShell() {
  const { resolvedTheme } = useSettings();

  // Оновлюємо push-токен на сервері при кожному запуску
  useEffect(() => {
    void syncPushToken();
  }, []);

  return (
    <>
      <StatusBar barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'} />
      <OfflineBanner />
      <NavigationContainer ref={navigationRef} linking={linking}>
        {__DEV__ ? <DevNavBridge navRef={navigationRef} /> : null}
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ToastProvider>
          <NetworkProvider>
            <NotificationsProvider>
              <ViewedProductsProvider>
                <DeliveryAddressesProvider>
                  <PaymentMethodsProvider>
                    <FavoritesProvider>
                      <FavoriteDiscountWatcher />
                      <OrdersProvider>
                        <CartProvider>
                          <MyPhoneProvider>
                            <AppShell />
                            <PhonePickerSheet />
                          </MyPhoneProvider>
                        </CartProvider>
                      </OrdersProvider>
                    </FavoritesProvider>
                  </PaymentMethodsProvider>
                </DeliveryAddressesProvider>
              </ViewedProductsProvider>
            </NotificationsProvider>
          </NetworkProvider>
        </ToastProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

export default App;
