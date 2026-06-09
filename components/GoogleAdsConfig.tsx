'use client';

import { useEffect } from 'react';
import { GOOGLE_ADS_ID } from '@/lib/analytics';

export default function GoogleAdsConfig() {
  useEffect(() => {
    if (!GOOGLE_ADS_ID) return;

    let attempts = 0;
    const maxAttempts = 50;

    const configure = () => {
      if (typeof window.gtag !== 'function') return false;
      window.gtag('config', GOOGLE_ADS_ID);
      return true;
    };

    if (configure()) return;

    const timer = setInterval(() => {
      attempts += 1;
      if (configure() || attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return null;
}
