import { useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoadingState } from '../components/LoadingState';
import { ProfileOrderCard } from '../components/profile/ProfileOrderCard';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useOrders } from '../context/OrdersContext';

export function ProfileScreen() {
  const { orders, isHydrated, isSyncing, refreshOrders } = useOrders();

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
        <Text style={styles.title}>Профіль</Text>
        <Text style={styles.subtitle}>Ваші замовлення та налаштування</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мої замовлення</Text>
            {isSyncing ? (
              <Text style={styles.syncHint}>Оновлення статусів...</Text>
            ) : null}
          </View>

          {!isHydrated ? (
            <LoadingState label="Завантаження замовлень..." />
          ) : orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Замовлень ще немає</Text>
              <Text style={styles.emptyText}>
                Оформіть покупку в каталозі — і вона з&apos;явиться тут
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map(order => (
                <ProfileOrderCard key={order.id} order={order} />
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textOnDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  syncHint: {
    fontSize: 12,
    color: colors.textOnDarkMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  ordersList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.homeSearch,
    borderRadius: radius.lg,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.homeSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
