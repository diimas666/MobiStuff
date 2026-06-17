import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeliveryAddressesScreen } from '../screens/DeliveryAddressesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PaymentMethodsScreen } from '../screens/PaymentMethodsScreen';
import { ProfileOrdersScreen } from '../screens/ProfileOrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ViewedProductsScreen } from '../screens/ViewedProductsScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        freezeOnBlur: true,
      }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ProfileOrders" component={ProfileOrdersScreen} />
      <Stack.Screen name="ViewedProducts" component={ViewedProductsScreen} />
      <Stack.Screen name="DeliveryAddresses" component={DeliveryAddressesScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
