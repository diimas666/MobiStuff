import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { StyleSheet, Text, View } from 'react-native';
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
        tabBarInactiveTintColor: colors.ink3,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600',
          letterSpacing: 0.1,
        },
        // Панель як у iOS: біла, з тонкою лінією зверху, без важкої тіні
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.line,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const tab = tabItems.find(item => item.name === route.name);
          const iconName = tab
            ? focused
              ? tab.icons.active
              : tab.icons.inactive
            : 'ellipse-outline';
          const icon = <Ionicons name={iconName} size={25} color={color} />;
          void size;

          if (route.name !== 'Cart' || !hasCartItems) {
            return icon;
          }

          return (
            <View style={styles.iconWrap}>
              {icon}
              <View style={[styles.cartBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                <Text style={[styles.cartBadgeText, { color: colors.onPrimary }]}>{totalQuantity > 99 ? '99+' : totalQuantity}</Text>
              </View>
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
    top: -5,
    right: -11,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
