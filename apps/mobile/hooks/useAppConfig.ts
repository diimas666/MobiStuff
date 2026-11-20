import { useEffect, useState } from 'react';
import { api } from '../config/api';
import { getStorageItem, setStorageItem } from '../services/safeStorage';

export type AppBanner = { id: string; title: string; subtitle: string; image: string; link: string; promoCode: string };
export type AppConfig = {
  banners: AppBanner[];
  minVersion: string;
  latestVersion: string;
  maintenance: { enabled: boolean; message: string };
  whatsNew: { version: string; items: string[] };
};

const KEY = 'app_config_cache';
const EMPTY: AppConfig = { banners: [], minVersion: '', latestVersion: '', maintenance: { enabled: false, message: '' }, whatsNew: { version: '', items: [] } };
let memory: AppConfig | null = null;
const listeners = new Set<(c: AppConfig) => void>();
let loading = false;

async function refresh() {
  if (loading) return;
  loading = true;
  try {
    const r = await api.appConfig();
    if (r.ok) {
      const c = { ...EMPTY, ...(await r.json()) } as AppConfig;
      memory = c;
      listeners.forEach(l => l(c));
      void setStorageItem(KEY, JSON.stringify(c));
    }
  } catch {
    // офлайн — лишаємо збережені
  } finally {
    loading = false;
  }
}

/** Налаштування застосунку з адмінки (баннери, оновлення, техроботи, «Що нового») */
export function useAppConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(memory ?? EMPTY);
  useEffect(() => {
    listeners.add(setConfig);
    if (!memory) {
      void getStorageItem(KEY).then(v => {
        if (v && !memory) {
          try {
            setConfig({ ...EMPTY, ...JSON.parse(v) });
          } catch {}
        }
      });
    }
    void refresh();
    return () => {
      listeners.delete(setConfig);
    };
  }, []);
  return config;
}

export const refreshAppConfig = refresh;
