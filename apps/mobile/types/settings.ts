export type ThemeMode = 'light' | 'dark';
export type AppLanguage = 'uk' | 'en';

export type AppSettings = {
  theme: ThemeMode;
  language: AppLanguage;
  orderStatusNotifications: boolean;
  favoriteDiscountNotifications: boolean;
  promoNotifications: boolean;
  showDiscountPrices: boolean;
  saveViewedHistory: boolean;
  hapticFeedback: boolean;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'uk',
  orderStatusNotifications: true,
  favoriteDiscountNotifications: true,
  promoNotifications: true,
  showDiscountPrices: true,
  saveViewedHistory: true,
  hapticFeedback: true,
};

export const THEME_MODE_OPTIONS: Array<{ id: ThemeMode; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export const LANGUAGE_OPTIONS: Array<{
  id: AppLanguage;
  label: string;
  available: boolean;
}> = [
  { id: 'uk', label: 'Українська', available: true },
  { id: 'en', label: 'English', available: false },
];

export const APP_VERSION = '1.0.0';
