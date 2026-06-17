import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoadingState } from '../components/LoadingState';
import { BackButton } from '../components/navigation/BackButton';
import { PaymentMethodOptionCard } from '../components/payment/PaymentMethodOptionCard';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { usePaymentMethods } from '../context/PaymentMethodsContext';
import { showToast } from '../context/ToastContext';
import type { ProfileStackParamList } from '../navigation/types';
import type { PaymentMethodType } from '../types/paymentMethods';
import { PAYMENT_METHOD_META } from '../types/paymentMethods';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'PaymentMethods'>;

const METHOD_ORDER: PaymentMethodType[] = [
  'card_transfer',
  'stripe',
  'google_pay',
  'apple_pay',
  'cod',
];

export function PaymentMethodsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { defaultMethod, isHydrated, setDefaultMethod } = usePaymentMethods();

  const handleSelectMethod = useCallback(
    async (method: PaymentMethodType) => {
      const meta = PAYMENT_METHOD_META[method];

      if (!meta.available) {
        showToast(`${meta.title} незабаром буде доступний`, 'info');
      }

      await setDefaultMethod(method);
    },
    [setDefaultMethod],
  );

  if (!isHydrated) {
    return (
      <Screen backgroundColor={colors.homeBackground}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingHeader}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <LoadingState label="Завантаження способів оплати..." />
      </Screen>
    );
  }

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
          <Text style={styles.title}>Способи оплати</Text>
          <Text style={styles.subtitle}>
            Оберіть основний спосіб оплати для оформлення замовлень
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основний спосіб</Text>
          <View style={styles.methodList}>
            {METHOD_ORDER.map(method => (
              <PaymentMethodOptionCard
                key={method}
                method={method}
                selected={defaultMethod === method}
                hidden={method === 'apple_pay' && Platform.OS !== 'ios'}
                onPress={() => void handleSelectMethod(method)}
              />
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Зараз доступні переказ на картку та оплата при отриманні. Stripe,
            Google Pay та Apple Pay з&apos;являться після підключення онлайн-оплати.
          </Text>
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
  loadingHeader: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 8,
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
  section: {
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  methodList: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.homeSearch,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textOnDarkMuted,
    lineHeight: 19,
  },
});
