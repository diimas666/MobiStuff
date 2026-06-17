import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoadingState } from '../components/LoadingState';
import { BackButton } from '../components/navigation/BackButton';
import { NotificationListItem } from '../components/notification/NotificationListItem';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useNotifications } from '../context/NotificationsContext';
import type { ProfileStackParamList, RootStackParamList, TabParamList } from '../navigation/types';
import type { NotificationItem } from '../types/notification';
import { groupNotificationsByDate } from '../utils/groupNotificationsByDate';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'Notifications'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

export function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    items,
    unreadCount,
    isHydrated,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const groupedItems = useMemo(() => groupNotificationsByDate(items), [items]);

  useFocusEffect(
    useCallback(() => {
      void refreshNotifications();
    }, [refreshNotifications]),
  );

  const handlePress = useCallback(
    async (item: NotificationItem) => {
      if (!item.read) {
        await markAsRead(item.id);
      }

      if (item.type === 'order_status') {
        navigation.navigate('ProfileOrders');
        return;
      }

      if (item.type === 'favorite_discount' && item.productHandle) {
        navigation.navigate('Product', {
          product: {
            id: item.productId ?? item.productHandle,
            handle: item.productHandle,
            title: item.title,
            price: 0,
          },
        });
      }
    },
    [markAsRead, navigation],
  );

  return (
    <Screen backgroundColor={colors.homeBackground}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          {unreadCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void markAllAsRead()}
              style={({ pressed }) => [styles.markAllButton, pressed && styles.pressed]}>
              <Text style={styles.markAllText}>Прочитати все</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Повідомлення</Text>
          <Text style={styles.subtitle}>
            {isHydrated && items.length > 0
              ? unreadCount > 0
                ? `${unreadCount} непрочитаних`
                : 'Усі повідомлення прочитані'
              : 'Статуси замовлень та знижки в обраному'}
          </Text>
        </View>

        {!isHydrated ? (
          <LoadingState label="Завантаження повідомлень..." />
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Повідомлень поки немає</Text>
            <Text style={styles.emptyText}>
              Тут з&apos;являться оновлення статусів замовлень і сповіщення про знижки на
              товари з обраного.
            </Text>
          </View>
        ) : (
          <View style={styles.groups}>
            {groupedItems.map(group => (
              <View key={group.dateKey} style={styles.group}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                <View style={styles.groupList}>
                  {group.items.map(item => (
                    <NotificationListItem
                      key={item.id}
                      item={item}
                      onPress={() => void handlePress(item)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.homeSearch,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textOnDark,
  },
  titleBlock: {
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    lineHeight: 20,
  },
  groups: {
    gap: 20,
  },
  group: {
    gap: 12,
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  groupList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
