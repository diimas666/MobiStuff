import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { CartScreen } from '../screens/CartScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CategoriesStackNavigator } from './CategoriesStackNavigator';
import { createCategoriesTabListeners } from './categoriesTabListeners';
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
  const { colors } = useSettings();
  const hasCartItems = totalQuantity > 0;

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarButton: props => (
          <PlatformPressable {...props} testID={`tab-${route.name}`} />
        ),
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
              <View style={[styles.cartBadge, { backgroundColor: colors.danger, borderColor: colors.background }]} />
            </View>
          );
        },
      })}>
      {tabItems.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={screenComponents[tab.name]}
          options={{
            tabBarLabel: tab.label,
            unmountOnBlur: tab.name === 'Categories',
          }}
          listeners={
            tab.name === 'Categories' ? createCategoriesTabListeners : undefined
          }
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
    borderWidth: 1.5,
  },
});
