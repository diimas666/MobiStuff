import { useCallback, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ListGroup, ListRow } from '../components/ui/ListGroup';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import { useNotifications } from '../context/NotificationsContext';
import { useOrders } from '../context/OrdersContext';
import { useFavorites } from '../context/FavoritesContext';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useMyPhone } from '../context/MyPhoneContext';
import type { ProfileStackParamList, TabParamList } from '../navigation/types';
import { loadCheckoutProfile } from '../services/checkoutProfileStorage';
import { useThemedStyles } from '../hooks/useThemedStyles';

type ProfileNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>,
  BottomTabNavigationProp<TabParamList>
>;

const APP_STORE_REVIEW_URL = 'https://apps.apple.com/app/id6785212528?action=write-review';

/** Профіль: дані з останнього замовлення та групи розділів як у Налаштуваннях iOS */
export function ProfileScreen() {
  const { styles } = useThemedStyles(c => ({
    content: { flexGrow: 1, paddingHorizontal: spacing.screen, paddingTop: 8, paddingBottom: 40 },
    title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.8, color: c.text, marginBottom: 16 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.card, borderRadius: 22, padding: 16, marginBottom: 24 },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 22, fontWeight: '700', color: c.primary },
    name: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, color: c.text },
    meta: { marginTop: 2, fontSize: 14, lineHeight: 19, color: c.ink3 },
    version: { textAlign: 'center', fontSize: 12, color: c.ink3, marginTop: 4 },
  }));
  const navigation = useNavigation<ProfileNavigationProp>();
  const { unreadCount, refreshNotifications } = useNotifications();
  const { orders, refreshOrders } = useOrders();
  const { items: favorites } = useFavorites();
  const store = useStoreSettings();
  const { phone: myPhone, openPicker } = useMyPhone();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void refreshNotifications();
      void refreshOrders();
      loadCheckoutProfile().then(profile => {
        if (!alive) return;
        setName(profile?.name?.trim() ?? '');
        setPhone(profile?.phone?.trim() ?? '');
      });
      return () => {
        alive = false;
      };
    }, [refreshNotifications, refreshOrders]),
  );

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const go = (screen: keyof ProfileStackParamList) => () => navigation.navigate(screen);

  return (
    <Screen variant="home">
      <ScrollView testID="screen-profile" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          Профіль
        </Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(name || 'M').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name || 'Вітаємо в MobiStuff'}</Text>
            <Text style={styles.meta}>
              {phone || 'Ваші замовлення й адреси доставки зберігаються на цьому телефоні'}
            </Text>
          </View>
        </View>

        <ListGroup title="Покупки">
          <ListRow icon="cube" label="Мої замовлення" value={activeOrders ? `${activeOrders} активн.` : undefined} onPress={go('ProfileOrders')} testID="profile-orders" />
          <ListRow
            icon="heart"
            iconColor="#FF2D55"
            label="Обране"
            value={favorites.length ? String(favorites.length) : undefined}
            onPress={() => navigation.navigate('Favorites', { returnTo: { tab: 'Profile', screen: 'ProfileMain' } })}
          />
          <ListRow icon="time" iconColor="#5856D6" label="Переглянуті товари" onPress={go('ViewedProducts')} />
        </ListGroup>

        <ListGroup title="Мій телефон" footer="Покажемо, які чохли й стекла підходять саме до вашої моделі.">
          <ListRow icon="phone-portrait" iconColor="#1D1D1F" label="Модель" value={myPhone ?? 'Обрати'} onPress={openPicker} />
        </ListGroup>

        <ListGroup title="Доставка та оплата">
          <ListRow icon="location" iconColor="#FF9500" label="Адреси доставки" onPress={go('DeliveryAddresses')} />
          <ListRow icon="card" iconColor="#007AFF" label="Способи оплати" onPress={go('PaymentMethods')} />
        </ListGroup>

        <ListGroup title="Застосунок">
          <ListRow icon="notifications" iconColor="#FF3B30" label="Повідомлення" badge={unreadCount || undefined} onPress={go('Notifications')} />
          <ListRow icon="settings" iconColor="#8E8E93" label="Налаштування" onPress={go('Settings')} />
        </ListGroup>

        <ListGroup title="Допомога" footer={store.workingHours ? `Працюємо: ${store.workingHours}` : undefined}>
          <ListRow icon="chatbubble-ellipses" iconColor="#34C759" label="Написати в підтримку" onPress={go('Support')} />
          {store.phone ? (
            <ListRow icon="call" iconColor="#34C759" label="Зателефонувати" value={store.phone} onPress={() => void Linking.openURL(`tel:${store.phone.replace(/[^\d+]/g, '')}`)} />
          ) : null}
          <ListRow icon="star" iconColor="#FFCC00" label="Оцінити застосунок" onPress={() => void Linking.openURL(APP_STORE_REVIEW_URL)} />
        </ListGroup>

        <Text style={styles.version}>MobiStuff для iPhone</Text>
      </ScrollView>
    </Screen>
  );
}
