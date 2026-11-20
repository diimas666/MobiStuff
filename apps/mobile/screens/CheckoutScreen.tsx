import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { CheckoutAddressPicker } from '../components/checkout/CheckoutAddressPicker';
import { CheckoutConsentCheckbox } from '../components/checkout/CheckoutConsentCheckbox';
import { CheckoutField } from '../components/checkout/CheckoutField';
import { CheckoutOrderItem } from '../components/checkout/CheckoutOrderItem';
import { CheckoutRadioRow } from '../components/checkout/CheckoutRadioRow';
import { CheckoutSection } from '../components/checkout/CheckoutSection';
import { NovaPoshtaBadge } from '../components/checkout/NovaPoshtaBadge';
import { OrderSuccessModal } from '../components/checkout/OrderSuccessModal';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { paymentCardNumber } from '../config/payment';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useLoyalty } from '../hooks/useLoyalty';
import { askPushPermissionOnce, syncPushToken } from '../services/push';
import { PromoCodeInput, type AppliedPromo } from '../components/checkout/PromoCodeInput';
import { radius, spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useDeliveryAddresses } from '../context/DeliveryAddressesContext';
import { useOrders } from '../context/OrdersContext';
import { usePaymentMethods } from '../context/PaymentMethodsContext';
import { showErrorToast, showToast } from '../context/ToastContext';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { useNovaPoshtaCities } from '../hooks/useNovaPoshtaCities';
import { useNovaPoshtaWarehouses } from '../hooks/useNovaPoshtaWarehouses';
import type { RootStackParamList } from '../navigation/types';
import { submitCheckout } from '../services/checkout';
import { formatPrice } from '../types/catalog';
import type { DeliveryAddress } from '../types/deliveryAddress';
import {
  mapPaymentMethodToCheckout,
  mapPaymentMethodToOrder,
  PAYMENT_METHOD_META,
  type PaymentMethodType,
} from '../types/paymentMethods';
import { generateOrderId, type StoredOrder } from '../types/order';
import { getCartTotals } from '../utils/cartTotals';
import { normalizePhone } from '../utils/checkoutValidation';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
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
    color: c.textOnDark,
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
    backgroundColor: c.accentSoft,
    gap: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
    letterSpacing: 1,
  },
  cardHint: {
    fontSize: 12,
    color: c.textMuted,
    lineHeight: 17,
  },
  selectedPaymentCard: {
    padding: 14,
    borderRadius: radius.sm,
    backgroundColor: c.accentSoft,
    gap: 4,
  },
  selectedPaymentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textMuted,
  },
  selectedPaymentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  selectedPaymentHint: {
    fontSize: 13,
    color: c.textMuted,
    lineHeight: 18,
  },
  totalsCard: {
    backgroundColor: c.card,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    color: c.textMuted,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },
  grandTotalRow: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.screen,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: c.line,
    backgroundColor: c.card,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: c.primary,
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
    fontSize: 17,
    fontWeight: '600',
    color: c.onPrimary,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
}));

  const insets = useSafeAreaInsets();
  const store = useStoreSettings();
  const { items, totalQuantity, clearCart } = useCart();
  const { total: cartTotal } = useMemo(() => getCartTotals(items), [items]);
  // Великі замовлення — лише передоплата карткою (поріг з адмінки)
  const cardOnly = cartTotal >= store.cardOnlyFrom;
  const { addOrder } = useOrders();
  const { addresses, isHydrated: addressesHydrated, getDefaultAddress } = useDeliveryAddresses();
  const { defaultMethod, isHydrated: paymentMethodsHydrated } = usePaymentMethods();
  const cartTotals = useMemo(() => getCartTotals(items), [items]);
  const { total } = cartTotals;
  const [promo, setPromo] = useState<AppliedPromo | null>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressInitialized, setAddressInitialized] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType>('card_transfer');
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  useEffect(() => {
    if (cardOnly && selectedPaymentMethod === 'cod') setSelectedPaymentMethod('card_transfer');
  }, [cardOnly, selectedPaymentMethod]);

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
    isProfileLoaded,
  } = useCheckoutForm();
  // Бали кешбеку: списати можна, якщо номер підтверджено кодом з SMS
  const loyalty = useLoyalty();
  const [usePoints, setUsePoints] = useState(false);
  const afterPromo = total - (promo?.discount ?? 0);
  const pointsAvailable =
    loyalty.balance && loyalty.token && normalizePhone(phone) === loyalty.phone
      ? Math.min(loyalty.balance, Math.floor((afterPromo * loyalty.maxPointsPercent) / 100))
      : 0;
  const pointsUsed = usePoints ? pointsAvailable : 0;
  const payable = afterPromo - pointsUsed;

  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showWarehouseSuggestions, setShowWarehouseSuggestions] = useState(false);
  const [novaPoshtaSelected, setNovaPoshtaSelected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [personalDataConsent, setPersonalDataConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

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

  const applyAddress = useCallback(
    (address: DeliveryAddress) => {
      setCity(address.city);
      setCityRef(address.cityRef);
      setWarehouse(address.warehouse);
      setWarehouseRef(address.warehouseRef);
      setShowCitySuggestions(false);
      setShowWarehouseSuggestions(false);
    },
    [setCity, setCityRef, setWarehouse, setWarehouseRef],
  );

  useEffect(() => {
    if (!paymentMethodsHydrated || !isProfileLoaded || paymentInitialized) {
      return;
    }

    setSelectedPaymentMethod(defaultMethod);
    setPaymentMethod(mapPaymentMethodToCheckout(defaultMethod));
    setPaymentInitialized(true);
  }, [
    defaultMethod,
    isProfileLoaded,
    paymentInitialized,
    paymentMethodsHydrated,
    setPaymentMethod,
  ]);

  useEffect(() => {
    if (!addressesHydrated || !isProfileLoaded || addressInitialized) {
      return;
    }

    const defaultAddress = getDefaultAddress();
    if (defaultAddress) {
      applyAddress(defaultAddress);
      setSelectedAddressId(defaultAddress.id);
    }

    setAddressInitialized(true);
  }, [
    addressInitialized,
    addressesHydrated,
    applyAddress,
    getDefaultAddress,
    isProfileLoaded,
  ]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccessModal(false);
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const handleSubmit = async () => {
    if (!novaPoshtaSelected) {
      showToast('Оберіть спосіб доставки', 'info');
      return;
    }

    if (!personalDataConsent) {
      setConsentError(true);
      showToast('Потрібна згода на обробку персональних даних', 'info');
      return;
    }

    if (!PAYMENT_METHOD_META[selectedPaymentMethod].available) {
      showToast('Оберіть доступний спосіб оплати', 'info');
      return;
    }

    if (!validateForSubmit()) {
      showToast('Перевірте правильність заповнення форми', 'info');
      return;
    }

    setConsentError(false);

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
      paymentMethod: mapPaymentMethodToOrder(selectedPaymentMethod),
      city: trimmedCity,
      cityRef,
      warehouse: trimmedWarehouse,
      total: payable,
      items: [...items],
      createdAt,
      status: 'processing',
    };

    setIsSubmitting(true);

    // Замовлення вважаємо оформленим лише коли сервер його прийняв
    const result = await submitCheckout({
      ...order,
      promoCode: promo?.code,
      ...(pointsUsed > 0 ? { usePoints: pointsUsed, pointsToken: loyalty.token ?? undefined } : {}),
    });
    if (!result.ok) {
      showToast(result.error, 'error');
      setIsSubmitting(false);
      return;
    }

    const saved: StoredOrder = {
      ...order,
      id: result.orderId || order.id,
      total: result.total ?? order.total,
      paymentMethod: result.paymentMethod ?? order.paymentMethod,
    };
    await addOrder(saved).catch(() => {});
    await persistProfile().catch(() => {});
    // Сповіщення про статус: питаємо дозвіл після першого замовлення
    void askPushPermissionOnce().then(() => syncPushToken());

    setIsOrderComplete(true);
    setShowSuccessModal(true);
    setIsSubmitting(false);

    void clearCart().catch(() => {});
  };

  const handleCityChange = (text: string) => {
    setSelectedAddressId(null);
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
    setSelectedAddressId(null);
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
  const showManualDeliveryFields = !selectedAddressId;
  const selectedPaymentMeta = PAYMENT_METHOD_META[selectedPaymentMethod];

  const selectCheckoutPayment = useCallback(
    (method: PaymentMethodType) => {
      const meta = PAYMENT_METHOD_META[method];

      if (!meta.available) {
        showToast(`${meta.title} незабаром буде доступний`, 'info');
        return;
      }

      setSelectedPaymentMethod(method);
      setPaymentMethod(mapPaymentMethodToCheckout(method));
    },
    [setPaymentMethod],
  );

  return (
    <Screen variant="home">

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
            <CheckoutAddressPicker
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={address => {
                setSelectedAddressId(address.id);
                applyAddress(address);
              }}
              onClear={() => {
                setSelectedAddressId(null);
                setCity('');
                setCityRef('');
                setWarehouse('');
                setWarehouseRef('');
              }}
            />
            {showManualDeliveryFields ? (
              <>
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
              </>
            ) : null}
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
              label={PAYMENT_METHOD_META.card_transfer.title}
              hint={PAYMENT_METHOD_META.card_transfer.description}
              selected={selectedPaymentMethod === 'card_transfer'}
              onPress={() => selectCheckoutPayment('card_transfer')}
            />
            <CheckoutRadioRow
              label={PAYMENT_METHOD_META.cod.title}
              hint={cardOnly ? `Недоступно для замовлень від ${formatPrice(store.cardOnlyFrom)}` : PAYMENT_METHOD_META.cod.description}
              selected={selectedPaymentMethod === 'cod'}
              onPress={() => (cardOnly ? showToast(`Від ${formatPrice(store.cardOnlyFrom)} — лише оплата карткою`, 'info') : selectCheckoutPayment('cod'))}
            />

            {selectedPaymentMethod === 'card_transfer' ? (
              <View style={styles.cardBlock}>
                <Text style={styles.cardLabel}>Номер картки для оплати</Text>
                <Text style={styles.cardNumber} selectable>
                  {store.cardPaymentDetails || paymentCardNumber}
                </Text>
                <Text style={styles.cardHint}>
                  Перекажіть суму замовлення на цю картку та вкажіть ПІБ у призначенні
                  платежу
                </Text>
              </View>
            ) : null}
          </CheckoutSection>

          <CheckoutConsentCheckbox
            checked={personalDataConsent}
            onToggle={() => {
              setPersonalDataConsent(current => !current);
              setConsentError(false);
            }}
            onOpenPolicy={() => navigation.navigate('PrivacyPolicy')}
            showError={consentError}
          />

          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Товари ({totalQuantity})
              </Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            <PromoCodeInput total={total} value={promo} onChange={setPromo} />
            {pointsAvailable > 0 ? (
              <Pressable accessibilityRole="switch" accessibilityState={{ checked: usePoints }} onPress={() => setUsePoints(v => !v)} style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>
                  Списати бали (є {loyalty.balance})
                </Text>
                <Ionicons name={usePoints ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
              </Pressable>
            ) : null}
            {pointsUsed > 0 ? (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.primary }]}>Оплачено балами</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>−{formatPrice(pointsUsed)}</Text>
              </View>
            ) : null}
            {promo ? (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.primary }]}>Промокод {promo.code}</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>−{formatPrice(promo.discount)}</Text>
              </View>
            ) : null}
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Всього до сплати</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(payable)}</Text>
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
                  {selectedPaymentMethod === 'cod'
                    ? 'Оформити замовлення'
                    : 'Підтвердити замовлення'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <OrderSuccessModal visible={showSuccessModal} onClose={handleSuccessClose} />
    </Screen>
  );
}

