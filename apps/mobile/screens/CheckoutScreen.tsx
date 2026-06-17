import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  CheckoutAutocompleteField,
  type AutocompleteSuggestion,
} from '../components/checkout/CheckoutAutocompleteField';
import { CheckoutField } from '../components/checkout/CheckoutField';
import { CheckoutOrderItem } from '../components/checkout/CheckoutOrderItem';
import { CheckoutRadioRow } from '../components/checkout/CheckoutRadioRow';
import { CheckoutSection } from '../components/checkout/CheckoutSection';
import { NovaPoshtaBadge } from '../components/checkout/NovaPoshtaBadge';
import { OrderSuccessModal } from '../components/checkout/OrderSuccessModal';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { paymentCardNumber } from '../config/payment';
import { colors, radius, spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { showErrorToast, showToast } from '../context/ToastContext';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { useNovaPoshtaCities } from '../hooks/useNovaPoshtaCities';
import { useNovaPoshtaWarehouses } from '../hooks/useNovaPoshtaWarehouses';
import type { RootStackParamList } from '../navigation/types';
import { submitCheckout } from '../services/checkout';
import { formatPrice } from '../types/catalog';
import { generateOrderId, type StoredOrder } from '../types/order';
import { getCartTotals } from '../utils/cartTotals';
import { normalizePhone } from '../utils/checkoutValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { items, totalQuantity, clearCart } = useCart();
  const { addOrder } = useOrders();
  const cartTotals = useMemo(() => getCartTotals(items), [items]);
  const { total } = cartTotals;

  const {
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    city,
    setCity,
    cityRef,
    setCityRef,
    warehouse,
    setWarehouse,
    warehouseRef,
    setWarehouseRef,
    comment,
    setComment,
    paymentMethod,
    setPaymentMethod,
    blurField,
    validateForSubmit,
    persistProfile,
    getFieldError,
  } = useCheckoutForm();

  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showWarehouseSuggestions, setShowWarehouseSuggestions] = useState(false);
  const [novaPoshtaSelected, setNovaPoshtaSelected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  const {
    suggestions: citySuggestions,
    isLoading: isCityLoading,
    error: citySearchError,
  } = useNovaPoshtaCities(city, novaPoshtaSelected && showCitySuggestions);

  const {
    suggestions: warehouseSuggestions,
    isLoading: isWarehouseLoading,
    error: warehouseSearchError,
  } = useNovaPoshtaWarehouses(
    cityRef,
    warehouse,
    novaPoshtaSelected && showWarehouseSuggestions && Boolean(cityRef),
  );

  useEffect(() => {
    if (items.length === 0 && !isOrderComplete && !showSuccessModal) {
      navigation.goBack();
    }
  }, [items.length, isOrderComplete, showSuccessModal, navigation]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccessModal(false);
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const handleSubmit = async () => {
    if (!novaPoshtaSelected) {
      showToast('Оберіть спосіб доставки', 'info');
      return;
    }

    if (!validateForSubmit()) {
      showToast('Перевірте правильність заповнення форми', 'info');
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = normalizePhone(phone);
    const trimmedCity = city.trim();
    const trimmedWarehouse = warehouse.trim();
    const [firstName, ...restName] = trimmedName.split(/\s+/);
    const createdAt = new Date().toISOString();

    const order: StoredOrder = {
      id: generateOrderId(),
      name: firstName,
      lastName: restName.join(' '),
      phone: trimmedPhone,
      email: email.trim() || undefined,
      comment: comment.trim() || undefined,
      paymentMethod: paymentMethod === 'card' ? 'card_online' : 'cod',
      city: trimmedCity,
      cityRef,
      warehouse: trimmedWarehouse,
      total,
      items: [...items],
      createdAt,
      status: 'processing',
    };

    setIsSubmitting(true);

    let sentToServer = false;

    try {
      sentToServer = await submitCheckout(order);
    } catch {
      sentToServer = false;
    }

    try {
      await addOrder(order);
      await persistProfile();
    } catch {
      if (!sentToServer) {
        showErrorToast(new Error('save_failed'), 'Не вдалося оформити замовлення');
        setIsSubmitting(false);
        return;
      }
    }

    setIsOrderComplete(true);
    setShowSuccessModal(true);
    setIsSubmitting(false);

    void clearCart().catch(() => {});
  };

  const handleCityChange = (text: string) => {
    setCity(text);
    setCityRef('');
    setWarehouse('');
    setWarehouseRef('');
    setShowCitySuggestions(true);
    setShowWarehouseSuggestions(false);
  };

  const handleCitySelect = (item: AutocompleteSuggestion) => {
    setCity(item.title);
    setCityRef(item.id);
    setShowCitySuggestions(false);
    setWarehouse('');
    setWarehouseRef('');
    blurField('city');
  };

  const handleWarehouseChange = (text: string) => {
    setWarehouse(text);
    setWarehouseRef('');
    setShowWarehouseSuggestions(true);
  };

  const handleWarehouseSelect = (item: AutocompleteSuggestion) => {
    setWarehouse(item.title);
    setWarehouseRef(item.id);
    setShowWarehouseSuggestions(false);
    blurField('warehouse');
  };

  const cityFieldError = getFieldError('city') ?? citySearchError ?? undefined;
  const warehouseFieldError =
    getFieldError('warehouse') ?? warehouseSearchError ?? undefined;

  return (
    <Screen backgroundColor={colors.homeBackground}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Оформлення замовлення</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.layout}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <CheckoutSection title="Ваше замовлення">
            {items.map((item, index) => (
              <CheckoutOrderItem
                key={`${item.productId}-${item.variant ?? 'default'}`}
                item={item}
                isLast={index === items.length - 1}
              />
            ))}
          </CheckoutSection>

          <CheckoutSection title="Контактні дані">
            <CheckoutField
              label="Ім'я та прізвище"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              onBlur={() => blurField('name')}
              placeholder="Ваше ім'я"
              autoCapitalize="words"
              errorText={getFieldError('name')}
            />
            <CheckoutField
              label="Телефон"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              onBlur={() => blurField('phone')}
              placeholder="+380 XX XXX XX XX"
              keyboardType="phone-pad"
              errorText={getFieldError('phone')}
            />
            <CheckoutField
              label="Email"
              optional
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              onBlur={() => blurField('email')}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              errorText={getFieldError('email')}
            />
          </CheckoutSection>

          <CheckoutSection title="Доставка">
            <CheckoutRadioRow
              label="Нова пошта"
              hint="1-3 дні"
              selected={novaPoshtaSelected}
              onPress={() => setNovaPoshtaSelected(true)}
              leading={<NovaPoshtaBadge />}
            />
            <CheckoutAutocompleteField
              label="Місто"
              icon="location-outline"
              value={city}
              onChangeText={handleCityChange}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() => blurField('city')}
              placeholder="Почніть вводити місто"
              suggestions={citySuggestions}
              isLoading={isCityLoading}
              showSuggestions={showCitySuggestions && !cityRef}
              onSelect={handleCitySelect}
              helperText={cityRef && !getFieldError('city') ? `Обрано: ${city}` : undefined}
              errorText={cityFieldError}
            />
            <CheckoutAutocompleteField
              label="Відділення або поштомат"
              icon="cube-outline"
              value={warehouse}
              onChangeText={handleWarehouseChange}
              onFocus={() => {
                if (cityRef) {
                  setShowWarehouseSuggestions(true);
                } else {
                  blurField('warehouse');
                }
              }}
              onBlur={() => blurField('warehouse')}
              placeholder={cityRef ? '№ відділення або вулиця' : 'Спочатку оберіть місто'}
              editable={Boolean(cityRef)}
              suggestions={warehouseSuggestions}
              isLoading={isWarehouseLoading}
              showSuggestions={showWarehouseSuggestions && !warehouseRef}
              onSelect={handleWarehouseSelect}
              helperText={
                warehouseRef && !getFieldError('warehouse')
                  ? 'Відділення обрано'
                  : undefined
              }
              errorText={warehouseFieldError}
            />
          </CheckoutSection>

          <CheckoutSection title="Коментар до замовлення">
            <CheckoutField
              label="Коментар"
              hideLabel
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="Наприклад: передзвоніть перед доставкою"
              numberOfLines={4}
              textAlignVertical="top"
            />
          </CheckoutSection>

          <CheckoutSection title="Оплата">
            <CheckoutRadioRow
              label="Онлайн оплата карткою"
              selected={paymentMethod === 'card'}
              onPress={() => setPaymentMethod('card')}
            />
            <CheckoutRadioRow
              label="Оплата при отриманні"
              hint="Накладений платіж"
              selected={paymentMethod === 'cod'}
              onPress={() => setPaymentMethod('cod')}
            />

            {paymentMethod === 'card' ? (
              <View style={styles.cardBlock}>
                <Text style={styles.cardLabel}>Номер картки для оплати</Text>
                <Text style={styles.cardNumber} selectable>
                  {paymentCardNumber}
                </Text>
                <Text style={styles.cardHint}>
                  Перекажіть суму замовлення на цю картку та вкажіть ПІБ у призначенні
                  платежу
                </Text>
              </View>
            ) : null}
          </CheckoutSection>

          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Товари ({totalQuantity})
              </Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Всього до сплати</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && !isSubmitting && styles.pressed,
              isSubmitting && styles.submitDisabled,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.textOnDark} />
            ) : (
              <>
                <Text style={styles.submitText}>
                  {paymentMethod === 'card' ? 'Підтвердити замовлення' : 'Оформити замовлення'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={colors.textOnDark} />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <OrderSuccessModal visible={showSuccessModal} onClose={handleSuccessClose} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textOnDark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  layout: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
    gap: 24,
  },
  cardBlock: {
    padding: 14,
    borderRadius: radius.sm,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  cardHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  totalsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  grandTotalRow: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.screen,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: colors.homeBackground,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
