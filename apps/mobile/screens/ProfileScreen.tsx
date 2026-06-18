import { useCallback, useState } from 'react';
import { ScrollView, StatusBar, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileMenuItem } from '../components/profile/ProfileMenuItem';
import { ProfileUserHeader } from '../components/profile/ProfileUserHeader';
import { SettingsSection } from '../components/settings/SettingsSection';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import { useNotifications } from '../context/NotificationsContext';
import { useOrders } from '../context/OrdersContext';
import { showToast } from '../context/ToastContext';
import type { ProfileStackParamList, TabParamList } from '../navigation/types';
import { loadCheckoutProfile } from '../services/checkoutProfileStorage';
import { useThemedStyles } from '../hooks/useThemedStyles';

type ProfileNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<TabParamList>
>;

export function ProfileScreen() {
  const { styles } = useThemedStyles(c => ({
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.screen,
      paddingTop: 8,
      paddingBottom: 32,
    },
    headerBlock: {
      marginBottom: 8,
      gap: 18,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.textOnDark,
    },
    group: {
      gap: 10,
      marginBottom: 18,
    },
  }));

  const navigation = useNavigation<ProfileNavigationProp>();
  const { unreadCount, refreshNotifications } = useNotifications();
  const { refreshOrders } = useOrders();
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

  const openSupport = useCallback(() => {
    navigation.navigate('Support');
  }, [navigation]);

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />

      <ScrollView
        testID="screen-profile"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Профіль</Text>
          <ProfileUserHeader
            isGuest={!hasProfile}
            name={displayName}
            email={displayEmail}
            onGuestPress={openLogin}
            onSettingsPress={openSettings}
          />
        </View>

        <SettingsSection title="Покупки" icon="bag-handle-outline" />
        <View style={styles.group}>
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
        </View>

        <SettingsSection title="Доставка та оплата" icon="location-outline" />
        <View style={styles.group}>
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
        </View>

        <SettingsSection title="Додаток" icon="apps-outline" />
        <View style={styles.group}>
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
            onPress={openSupport}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
