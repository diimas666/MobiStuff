import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
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

enableScreens(true);

function AppShell() {
  const { resolvedTheme } = useSettings();

  return (
    <>
      <StatusBar barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'} />
      <OfflineBanner />
      <NavigationContainer>
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
                          <AppShell />
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
