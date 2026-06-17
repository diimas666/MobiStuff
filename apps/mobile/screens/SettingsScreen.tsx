import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LoadingState } from '../components/LoadingState';
import { BackButton } from '../components/navigation/BackButton';
import { SettingLanguageRow } from '../components/settings/SettingLanguageRow';
import { SettingLinkRow } from '../components/settings/SettingLinkRow';
import { SettingThemeRow } from '../components/settings/SettingThemeRow';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingToggleRow } from '../components/settings/SettingToggleRow';
import { Screen } from '../components/Screen';
import { radius, spacing } from '../constants/theme';
import { baseUrl } from '../config/api';
import { useNotifications } from '../context/NotificationsContext';
import { useSettings } from '../context/SettingsContext';
import { showToast } from '../context/ToastContext';
import { useViewedProducts } from '../context/ViewedProductsContext';
import type { ProfileStackParamList, RootStackParamList } from '../navigation/types';
import { invalidateCache } from '../services/apiCache';
import { clearStoredNotifications } from '../services/notificationsStorage';
import { useThemedStyles } from '../hooks/useThemedStyles';
import {
  APP_VERSION,
  type AppLanguage,
  type ThemeMode,
} from '../types/settings';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'Settings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function SettingsScreen() {
  const { styles } = useThemedStyles(c => ({
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
  },
  group: {
    gap: 10,
    marginBottom: 18,
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  resetCard: {
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  resetText: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
}));

  const navigation = useNavigation<NavigationProp>();
  const { settings, isHydrated, colors, resolvedTheme, updateSettings, resetSettings } =
    useSettings();
  const { clearViewedProducts } = useViewedProducts();
  const { refreshNotifications } = useNotifications();

  const handleThemeChange = useCallback(
    (theme: ThemeMode) => {
      void updateSettings({ theme });
    },
    [updateSettings],
  );

  const handleLanguageChange = useCallback(
    (language: AppLanguage) => {
      void updateSettings({ language });
    },
    [updateSettings],
  );

  const clearCatalogCache = useCallback(() => {
    invalidateCache();
    showToast('Кеш каталогу очищено', 'success');
  }, []);

  const clearViewedHistory = useCallback(() => {
    Alert.alert('Очистити історію?', 'Список переглянутих товарів буде видалено.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Очистити',
        style: 'destructive',
        onPress: () => {
          void clearViewedProducts().then(() => {
            showToast('Історію переглядів очищено', 'success');
          });
        },
      },
    ]);
  }, [clearViewedProducts]);

  const clearNotifications = useCallback(() => {
    Alert.alert('Очистити повідомлення?', 'Усі сповіщення будуть видалені.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Очистити',
        style: 'destructive',
        onPress: () => {
          void clearStoredNotifications().then(() => {
            void refreshNotifications();
            showToast('Повідомлення очищено', 'success');
          });
        },
      },
    ]);
  }, [refreshNotifications]);

  const resetAllSettings = useCallback(() => {
    Alert.alert('Скинути налаштування?', 'Усі параметри повернуться до стандартних.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Скинути',
        style: 'destructive',
        onPress: () => {
          void resetSettings().then(() => {
            showToast('Налаштування скинуто', 'success');
          });
        },
      },
    ]);
  }, [resetSettings]);

  const openContacts = useCallback(() => {
    void Linking.openURL(`${baseUrl}/contacts`);
  }, []);

  const openDeliveryInfo = useCallback(() => {
    void Linking.openURL(`${baseUrl}/delivery`);
  }, []);

  if (!isHydrated) {
    return (
      <Screen variant="home">
        <StatusBar
          barStyle={resolvedTheme === 'dark' ? 'light-content' : 'light-content'}
        />
        <View style={styles.loadingHeader}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <LoadingState label="Завантаження налаштувань..." />
      </Screen>
    );
  }

  return (
    <Screen variant="home">
      <StatusBar barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.textOnDark }]}>Налаштування</Text>
        </View>

        <SettingsSection title="Зовнішній вигляд" icon="color-palette-outline" />
        <View style={styles.group}>
          <SettingThemeRow value={settings.theme} onChange={handleThemeChange} />
        </View>

        <View style={styles.group}>
          <SettingLanguageRow
            value={settings.language}
            onChange={handleLanguageChange}
          />
        </View>

        <SettingsSection title="Сповіщення" icon="notifications-outline" />
        <View style={styles.group}>
          <SettingToggleRow
            icon="receipt-outline"
            label="Статуси замовлень"
            hint="Повідомлення про відправку та виконання"
            value={settings.orderStatusNotifications}
            onValueChange={value => void updateSettings({ orderStatusNotifications: value })}
          />
          <SettingToggleRow
            icon="pricetag-outline"
            label="Знижки в обраному"
            hint="Коли ціна на збережений товар знижується"
            value={settings.favoriteDiscountNotifications}
            onValueChange={value => void updateSettings({ favoriteDiscountNotifications: value })}
          />
          <SettingToggleRow
            icon="megaphone-outline"
            label="Акції та новинки"
            hint="Спеціальні пропозиції магазину"
            value={settings.promoNotifications}
            onValueChange={value => void updateSettings({ promoNotifications: value })}
          />
        </View>

        <SettingsSection title="Покупки" icon="bag-handle-outline" />
        <View style={styles.group}>
          <SettingToggleRow
            icon="trending-down-outline"
            label="Показувати знижки"
            hint="Відсоток економії на картках товарів"
            value={settings.showDiscountPrices}
            onValueChange={value => void updateSettings({ showDiscountPrices: value })}
          />
          <SettingToggleRow
            icon="eye-outline"
            label="Історія переглядів"
            hint="Зберігати переглянуті товари в профілі"
            value={settings.saveViewedHistory}
            onValueChange={value => void updateSettings({ saveViewedHistory: value })}
          />
          <SettingToggleRow
            icon="phone-portrait-outline"
            label="Вібровідгук"
            hint="Легкий відгук при додаванні в кошик (на реальному пристрої)"
            value={settings.hapticFeedback}
            onValueChange={value => void updateSettings({ hapticFeedback: value })}
          />
        </View>

        <SettingsSection title="Дані та пам'ять" icon="server-outline" />
        <View style={styles.group}>
          <SettingLinkRow
            icon="refresh-outline"
            label="Очистити кеш каталогу"
            hint="Оновити ціни та наявність товарів"
            onPress={clearCatalogCache}
          />
          <SettingLinkRow
            icon="trash-outline"
            label="Очистити переглянуті товари"
            destructive
            onPress={clearViewedHistory}
          />
          <SettingLinkRow
            icon="notifications-off-outline"
            label="Очистити повідомлення"
            destructive
            onPress={clearNotifications}
          />
        </View>

        <SettingsSection title="Інформація" icon="information-circle-outline" />
        <View style={styles.group}>
          <SettingLinkRow
            icon="shield-checkmark-outline"
            label="Політика конфіденційності"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <SettingLinkRow
            icon="car-outline"
            label="Доставка та оплата"
            onPress={openDeliveryInfo}
          />
          <SettingLinkRow
            icon="call-outline"
            label="Контакти магазину"
            onPress={openContacts}
          />
          <SettingLinkRow
            icon="phone-portrait-outline"
            label="Версія додатку"
            value={APP_VERSION}
            onPress={() => showToast(`MobiStuff v${APP_VERSION}`, 'info')}
          />
        </View>

        <View style={[styles.resetCard, { backgroundColor: colors.homeSearch }]}>
          <Text style={[styles.resetTitle, { color: colors.textOnDark }]}>
            Скинути налаштування
          </Text>
          <Text style={[styles.resetText, { color: colors.textOnDarkMuted }]}>
            Повернути тему, мову та перемикачі до стандартних значень.
          </Text>
          <SettingLinkRow
            icon="refresh-circle-outline"
            label="Скинути все"
            destructive
            onPress={resetAllSettings}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

