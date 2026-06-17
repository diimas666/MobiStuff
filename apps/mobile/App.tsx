import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoriteDiscountWatcher } from './components/notification/FavoriteDiscountWatcher';
import { CartProvider } from './context/CartContext';
import { DeliveryAddressesProvider } from './context/DeliveryAddressesContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { OrdersProvider } from './context/OrdersContext';
import { PaymentMethodsProvider } from './context/PaymentMethodsContext';
import { ToastProvider } from './context/ToastContext';
import { ViewedProductsProvider } from './context/ViewedProductsContext';
import { RootNavigator } from './navigation/RootNavigator';

enableScreens(true);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NotificationsProvider>
        <ViewedProductsProvider>
          <DeliveryAddressesProvider>
          <PaymentMethodsProvider>
          <FavoritesProvider>
            <FavoriteDiscountWatcher />
          <OrdersProvider>
            <CartProvider>
              <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </CartProvider>
          </OrdersProvider>
          </FavoritesProvider>
          </PaymentMethodsProvider>
          </DeliveryAddressesProvider>
        </ViewedProductsProvider>
        </NotificationsProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
