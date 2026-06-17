import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileOrdersScreen } from '../screens/ProfileOrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
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
    </Stack.Navigator>
  );
}
