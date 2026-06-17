import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { OrdersProvider } from './context/OrdersContext';
import { ToastProvider } from './context/ToastContext';
import { RootNavigator } from './navigation/RootNavigator';

enableScreens(true);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <FavoritesProvider>
          <OrdersProvider>
            <CartProvider>
              <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </CartProvider>
          </OrdersProvider>
        </FavoritesProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
