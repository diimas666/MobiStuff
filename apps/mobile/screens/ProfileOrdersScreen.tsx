import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoadingState } from '../components/LoadingState';
import { ProfileOrderCard } from '../components/profile/ProfileOrderCard';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useOrders } from '../context/OrdersContext';
import type { ProfileStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileOrders'>;

function formatOrdersCount(count: number) {
  if (count === 1) {
    return '1 замовлення';
  }

  if (count < 5) {
    return `${count} замовлення`;
  }

  return `${count} замовлень`;
}

export function ProfileOrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { orders, isHydrated, isSyncing, refreshOrders } = useOrders();

  const activeOrdersCount = useMemo(
    () => orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length,
    [orders],
  );

  useFocusEffect(
    useCallback(() => {
      void refreshOrders();
    }, [refreshOrders]),
  );

  return (
    <Screen backgroundColor={colors.homeBackground}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Мої замовлення</Text>
          <Text style={styles.subtitle}>
            {isHydrated && orders.length > 0
              ? `Всього ${formatOrdersCount(orders.length)}`
              : 'Історія ваших покупок'}
          </Text>
        </View>

        {isHydrated && orders.length > 0 ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.summaryValue}>{orders.length}</Text>
                <Text style={styles.summaryLabel}>Всього</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, styles.summaryIconActive]}>
                <Ionicons name="time-outline" size={18} color="#FCD34D" />
              </View>
              <View>
                <Text style={styles.summaryValue}>{activeOrdersCount}</Text>
                <Text style={styles.summaryLabel}>Активні</Text>
              </View>
            </View>
          </View>
        ) : null}

        {isSyncing ? (
          <View style={styles.syncBanner}>
            <Ionicons name="sync-outline" size={16} color={colors.textOnDarkMuted} />
            <Text style={styles.syncHint}>Оновлення статусів...</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          {!isHydrated ? (
            <LoadingState label="Завантаження замовлень..." />
          ) : orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Замовлень ще немає</Text>
              <Text style={styles.emptyText}>
                Оформіть покупку в каталозі — і вона з&apos;явиться тут із усіма
                деталями доставки та оплати.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}>
                <Text style={styles.emptyButtonText}>Повернутися до профілю</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order, index) => (
                <View key={order.id} style={styles.orderItem}>
                  {orders.length > 1 ? (
                    <Text style={styles.orderIndex}>
                      Замовлення {orders.length - index}
                    </Text>
                  ) : null}
                  <ProfileOrderCard order={order} />
                </View>
              ))}
            </View>
          )}
        </View>
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
    marginBottom: 16,
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.homeSearch,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.homeSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textOnDarkMuted,
    marginTop: 1,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.homeSurface,
  },
  syncHint: {
    fontSize: 13,
    color: colors.textOnDarkMuted,
  },
  section: {
    gap: 12,
  },
  ordersList: {
    gap: 20,
  },
  orderItem: {
    gap: 8,
  },
  orderIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textOnDarkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.homeSearch,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.homeSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  pressed: {
    opacity: 0.88,
  },
});
