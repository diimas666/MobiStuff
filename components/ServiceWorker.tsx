'use client';

import { useEffect } from 'react';

/** Реєструє service worker (лише на продакшені) — для сторінки «Немає інтернету» */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
