import type { AppSettings } from '../types/settings';
import { DEFAULT_APP_SETTINGS } from '../types/settings';
import { getStorageItem, setStorageItem } from './safeStorage';

const SETTINGS_STORAGE_KEY = 'app_settings';

export async function loadSettings(): Promise<AppSettings> {
  const stored = await getStorageItem(SETTINGS_STORAGE_KEY);

  if (!stored) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AppSettings>;

    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsed,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setStorageItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export async function getSettingsSnapshot(): Promise<AppSettings> {
  return loadSettings();
}
