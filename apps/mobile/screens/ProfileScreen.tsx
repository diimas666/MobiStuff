import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileMenuItem } from '../components/profile/ProfileMenuItem';
import { ProfileUserHeader } from '../components/profile/ProfileUserHeader';
import { Screen } from '../components/Screen';
import { radius, spacing } from '../constants/theme';
import { useNotifications } from '../context/NotificationsContext';
import { useOrders } from '../context/OrdersContext';
import { useSettings } from '../context/SettingsContext';
import { showToast } from '../context/ToastContext';
import type { ProfileStackParamList, TabParamList } from '../navigation/types';
import { loadCheckoutProfile } from '../services/checkoutProfileStorage';
import { useThemedStyles } from '../hooks/useThemedStyles';

type ProfileNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<TabParamList>
>;

export function ProfileScreen() {
  const { styles, colors } = useThemedStyles(c => ({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  menu: {
    marginTop: 12,
    marginBottom: 20,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loginButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: c.danger,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '700',
    color: c.textOnDark,
  },
  pressed: {
    opacity: 0.82,
  },
}));

  const navigation = useNavigation<ProfileNavigationProp>();
  const { unreadCount, refreshNotifications } = useNotifications();
  const { refreshOrders } = useOrders();
  const { colors: themeColors } = useSettings();
  const [displayName, setDisplayName] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');
  const [hasProfile, setHasProfile] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      void refreshNotifications();
      void refreshOrders();

      loadCheckoutProfile().then(profile => {
        if (!isMounted) {
          return;
        }

        if (!profile) {
          setHasProfile(false);
          setDisplayName('');
          setDisplayEmail('');
          return;
        }

        const name = profile.name.trim();
        const email = profile.email.trim();
        const profileExists = Boolean(name || email);

        setHasProfile(profileExists);
        setDisplayName(name);
        setDisplayEmail(email);
      });

      return () => {
        isMounted = false;
      };
    }, [refreshNotifications, refreshOrders]),
  );

  const openLogin = useCallback(() => {
    showToast('Вхід в акаунт незабаром буде доступний', 'info');
  }, []);

  const openSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const openOrders = useCallback(() => {
    navigation.navigate('ProfileOrders');
  }, [navigation]);

  const openFavorites = useCallback(() => {
    navigation.navigate('Favorites', {
      returnTo: { tab: 'Profile', screen: 'ProfileMain' },
    });
  }, [navigation]);

  const openViewedProducts = useCallback(() => {
    navigation.navigate('ViewedProducts');
  }, [navigation]);

  const openDeliveryAddresses = useCallback(() => {
    navigation.navigate('DeliveryAddresses');
  }, [navigation]);

  const openPaymentMethods = useCallback(() => {
    navigation.navigate('PaymentMethods');
  }, [navigation]);

  const openNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const openComingSoon = useCallback((label: string) => {
    showToast(`${label} — розділ у розробці`, 'info');
  }, []);

  const handleLogout = useCallback(() => {
    showToast('Вихід з акаунту незабаром буде доступний', 'info');
  }, []);

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <ProfileUserHeader
            isGuest={!hasProfile}
            name={displayName}
            email={displayEmail}
            onGuestPress={openLogin}
            onSettingsPress={openSettings}
          />

          <View style={styles.menu}>
            <ProfileMenuItem
              icon="person-outline"
              label="Мої замовлення"
              onPress={openOrders}
            />
            <ProfileMenuItem
              icon="heart-outline"
              label="Обране"
              onPress={openFavorites}
            />
            <ProfileMenuItem
              icon="eye-outline"
              label="Переглянуті товари"
              onPress={openViewedProducts}
            />
            <ProfileMenuItem
              icon="location-outline"
              label="Адреси доставки"
              onPress={openDeliveryAddresses}
            />
            <ProfileMenuItem
              icon="card-outline"
              label="Способи оплати"
              onPress={openPaymentMethods}
            />
            <ProfileMenuItem
              icon="notifications-outline"
              label="Повідомлення"
              badge={unreadCount > 0 ? unreadCount : undefined}
              showChevron={false}
              onPress={openNotifications}
            />
            <ProfileMenuItem
              icon="settings-outline"
              label="Налаштування"
              onPress={openSettings}
            />
            <ProfileMenuItem
              icon="chatbubble-ellipses-outline"
              label="Підтримка"
              showChevron={false}
              onPress={() => openComingSoon('Підтримка')}
            />
          </View>

          {/* Реєстрація/вхід ще не реалізовані — кнопки тимчасово приховані
          {hasProfile ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
              <Text style={styles.logoutText}>Вийти</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={openLogin}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
              <Text style={styles.loginText}>Увійти</Text>
            </Pressable>
          )}
          */}
        </View>
      </ScrollView>
    </Screen>
  );
}

