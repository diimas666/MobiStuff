import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  CheckoutAutocompleteField,
  type AutocompleteSuggestion,
} from '../components/checkout/CheckoutAutocompleteField';
import { CheckoutField } from '../components/checkout/CheckoutField';
import { DeliveryAddressCard } from '../components/delivery/DeliveryAddressCard';
import { LoadingState } from '../components/LoadingState';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useDeliveryAddresses } from '../context/DeliveryAddressesContext';
import { showToast } from '../context/ToastContext';
import { useNovaPoshtaCities } from '../hooks/useNovaPoshtaCities';
import { useNovaPoshtaWarehouses } from '../hooks/useNovaPoshtaWarehouses';
import type { ProfileStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'DeliveryAddresses'>;

const EMPTY_FORM = {
  label: '',
  city: '',
  cityRef: '',
  warehouse: '',
  warehouseRef: '',
};

export function DeliveryAddressesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    addresses,
    isHydrated,
    addAddress,
    removeAddress,
    setDefaultAddress,
  } = useDeliveryAddresses();

  const [form, setForm] = useState(EMPTY_FORM);
  const [makeDefault, setMakeDefault] = useState(true);

  useEffect(() => {
    if (isHydrated && addresses.length === 0) {
      setMakeDefault(true);
    }
  }, [addresses.length, isHydrated]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showWarehouseSuggestions, setShowWarehouseSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    suggestions: citySuggestions,
    isLoading: isCityLoading,
    error: citySearchError,
  } = useNovaPoshtaCities(form.city, showCitySuggestions);

  const {
    suggestions: warehouseSuggestions,
    isLoading: isWarehouseLoading,
    error: warehouseSearchError,
  } = useNovaPoshtaWarehouses(
    form.cityRef,
    form.warehouse,
    showWarehouseSuggestions && Boolean(form.cityRef),
  );

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setMakeDefault(addresses.length === 0);
    setShowCitySuggestions(false);
    setShowWarehouseSuggestions(false);
  }, [addresses.length]);

  const handleCityChange = (text: string) => {
    setForm(current => ({
      ...current,
      city: text,
      cityRef: '',
      warehouse: '',
      warehouseRef: '',
    }));
    setShowCitySuggestions(true);
    setShowWarehouseSuggestions(false);
  };

  const handleCitySelect = (item: AutocompleteSuggestion) => {
    setForm(current => ({
      ...current,
      city: item.title,
      cityRef: item.id,
      warehouse: '',
      warehouseRef: '',
    }));
    setShowCitySuggestions(false);
  };

  const handleWarehouseChange = (text: string) => {
    setForm(current => ({
      ...current,
      warehouse: text,
      warehouseRef: '',
    }));
    setShowWarehouseSuggestions(true);
  };

  const handleWarehouseSelect = (item: AutocompleteSuggestion) => {
    setForm(current => ({
      ...current,
      warehouse: item.title,
      warehouseRef: item.id,
    }));
    setShowWarehouseSuggestions(false);
  };

  const handleSaveAddress = async () => {
    if (!form.cityRef || !form.warehouseRef) {
      showToast('Оберіть місто та відділення Нової пошти', 'info');
      return;
    }

    if (addresses.length >= 10) {
      showToast('Можна зберегти не більше 10 адрес', 'info');
      return;
    }

    setIsSaving(true);

    const created = await addAddress({
      label: form.label.trim() || `Адреса ${addresses.length + 1}`,
      city: form.city,
      cityRef: form.cityRef,
      warehouse: form.warehouse,
      warehouseRef: form.warehouseRef,
      isDefault: makeDefault || addresses.length === 0,
    });

    setIsSaving(false);

    if (!created) {
      showToast('Не вдалося зберегти адресу', 'info');
      return;
    }

    showToast('Адресу збережено', 'success');
    resetForm();
  };

  if (!isHydrated) {
    return (
      <Screen backgroundColor={colors.homeBackground}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingHeader}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <LoadingState label="Завантаження адрес..." />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={colors.homeBackground}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.layout}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Адреси доставки</Text>
            <Text style={styles.subtitle}>
              {addresses.length > 0
                ? `${addresses.length} збережених адрес для швидкого оформлення`
                : 'Додайте адресу Нової пошти для швидкого оформлення'}
            </Text>
          </View>

          {addresses.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Мої адреси</Text>
              <View style={styles.addressList}>
                {addresses.map(address => (
                  <DeliveryAddressCard
                    key={address.id}
                    address={address}
                    selected={address.isDefault}
                    onSelect={() => void setDefaultAddress(address.id)}
                    onDelete={() => void removeAddress(address.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Додати адресу</Text>
            <View style={styles.formCard}>
              <CheckoutField
                label="Назва адреси"
                icon="bookmark-outline"
                value={form.label}
                onChangeText={text => setForm(current => ({ ...current, label: text }))}
                placeholder="Наприклад: Дім, Робота"
              />

              <CheckoutAutocompleteField
                label="Місто"
                icon="location-outline"
                value={form.city}
                onChangeText={handleCityChange}
                onFocus={() => setShowCitySuggestions(true)}
                placeholder="Почніть вводити місто"
                suggestions={citySuggestions}
                isLoading={isCityLoading}
                showSuggestions={showCitySuggestions && !form.cityRef}
                onSelect={handleCitySelect}
                helperText={form.cityRef ? `Обрано: ${form.city}` : undefined}
                errorText={citySearchError ?? undefined}
              />

              <CheckoutAutocompleteField
                label="Відділення або поштомат"
                icon="cube-outline"
                value={form.warehouse}
                onChangeText={handleWarehouseChange}
                onFocus={() => {
                  if (form.cityRef) {
                    setShowWarehouseSuggestions(true);
                  }
                }}
                placeholder={form.cityRef ? '№ відділення або вулиця' : 'Спочатку оберіть місто'}
                editable={Boolean(form.cityRef)}
                suggestions={warehouseSuggestions}
                isLoading={isWarehouseLoading}
                showSuggestions={showWarehouseSuggestions && !form.warehouseRef}
                onSelect={handleWarehouseSelect}
                helperText={form.warehouseRef ? 'Відділення обрано' : undefined}
                errorText={warehouseSearchError ?? undefined}
              />

              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: makeDefault }}
                onPress={() => setMakeDefault(current => !current)}
                style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}>
                <View style={[styles.checkbox, makeDefault && styles.checkboxChecked]}>
                  {makeDefault ? (
                    <Ionicons name="checkmark" size={14} color={colors.textOnDark} />
                  ) : null}
                </View>
                <Text style={styles.checkboxLabel}>Зробити основною адресою</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={() => void handleSaveAddress()}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && !isSaving && styles.pressed,
                  isSaving && styles.saveDisabled,
                ]}>
                <Ionicons name="add-circle-outline" size={18} color={colors.textOnDark} />
                <Text style={styles.saveButtonText}>Зберегти адресу</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
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
  addressList: {
    gap: 12,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  pressed: {
    opacity: 0.88,
  },
});
