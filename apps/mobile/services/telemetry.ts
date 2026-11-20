import { AppState, Platform } from 'react-native';
import { api } from '../config/api';

/**
 * Статистика застосунку (лише лічильники подій, без персональних даних)
 * і звіти про помилки. Події відправляються пакетом.
 */
export type AppEventName = 'app_open' | 'view_product' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'search' | 'push_open';

const APP_VERSION = '1.1';
let queue: { name: AppEventName; value?: number }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let currentScreen = '';

export function setCurrentScreen(name: string) {
  currentScreen = name;
}

function flush() {
  timer = null;
  if (!queue.length) return;
  const events = queue;
  queue = [];
  void api.appEvents({ events }).catch(() => {});
}

export function track(name: AppEventName, value?: number) {
  if (__DEV__) return;
  queue.push({ name, value });
  if (!timer) timer = setTimeout(flush, 8000);
}

AppState.addEventListener('change', s => {
  if (s === 'background') flush();
});

export function reportError(error: unknown, fatal = false) {
  const e = error instanceof Error ? error : new Error(String(error));
  if (__DEV__) return;
  void api
    .appError({ message: e.message, stack: e.stack, fatal, screen: currentScreen, appVersion: APP_VERSION, platform: Platform.OS })
    .catch(() => {});
}

/** Глобальний перехоплювач: помилки JS потрапляють у звіт (і далі — стандартна обробка) */
export function installErrorHandler() {
  const g = globalThis as unknown as { ErrorUtils?: { getGlobalHandler: () => (e: unknown, f?: boolean) => void; setGlobalHandler: (h: (e: unknown, f?: boolean) => void) => void } };
  const eu = g.ErrorUtils;
  if (!eu) return;
  const prev = eu.getGlobalHandler();
  eu.setGlobalHandler((error, isFatal) => {
    reportError(error, Boolean(isFatal));
    prev(error, isFatal);
  });
}
