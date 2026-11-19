import { useEffect } from 'react';
import { CommonActions, getStateFromPath, type NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { linking } from '../../navigation/linking';
import type { RootStackParamList } from '../../navigation/types';

/**
 * ЛИШЕ ДЛЯ РОЗРОБКИ (__DEV__): дозволяє відкрити екран у симуляторі без діалогу iOS.
 * Опитує локальний сервер http://localhost:8099/next — той віддає шлях на кшталт
 * «product/demo-41». У релізній збірці компонент нічого не робить.
 */
export function DevNavBridge({ navRef }: { navRef: NavigationContainerRefWithCurrent<RootStackParamList> }) {
  useEffect(() => {
    if (!__DEV__) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8099/next');
        if (res.status !== 200) return;
        const path = (await res.text()).trim();
        if (!path || !navRef.isReady()) return;
        const state = getStateFromPath(path, linking.config);
        if (state) navRef.dispatch(CommonActions.reset({ ...state, index: state.index ?? 0 } as never));
      } catch {
        // сервер не запущено — нічого не робимо
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [navRef]);
  return null;
}
