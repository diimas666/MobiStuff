import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { CartScreen } from '../screens/CartScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CategoriesStackNavigator } from './CategoriesStackNavigator';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { tabItems } from './tabConfig';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const screenComponents = {
  Home: HomeScreen,
  Categories: CategoriesStackNavigator,
  Cart: CartScreen,
  Favorites: FavoritesScreen,
  Profile: ProfileStackNavigator,
} as const;

export function TabNavigator() {
  const { totalQuantity } = useCart();
  const hasCartItems = totalQuantity > 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 72,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const tab = tabItems.find(item => item.name === route.name);
          const iconName = tab
            ? focused
              ? tab.icons.active
              : tab.icons.inactive
            : 'ellipse-outline';
          const icon = <Ionicons name={iconName} size={size} color={color} />;

          if (route.name !== 'Cart' || !hasCartItems) {
            return icon;
          }

          return (
            <View style={styles.iconWrap}>
              {icon}
              <View style={styles.cartBadge} />
            </View>
          );
        },
      })}>
      {tabItems.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={screenComponents[tab.name]}
          options={{ tabBarLabel: tab.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
