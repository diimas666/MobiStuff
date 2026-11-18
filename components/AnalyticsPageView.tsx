'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export default function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams?.toString();

    // Запамʼятовуємо джерело реклами (UTM / fbclid / gclid / ttclid) — воно потрапить у замовлення
    try {
      const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid'];
      const utm: Record<string, string> = {};
      keys.forEach((k) => {
        const v = searchParams?.get(k);
        if (v) utm[k] = v.slice(0, 120);
      });
      if (Object.keys(utm).length) {
        localStorage.setItem('ms_utm', JSON.stringify({ ...utm, landing: pathname, at: new Date().toISOString() }));
      }
    } catch {}
    trackPageView(query ? `${pathname}?${query}` : pathname);

    fetch('/api/analytics/pageview', { method: 'POST' }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
