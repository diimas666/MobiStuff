'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const current =
          pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        const next = url.pathname + url.search;
        if (next !== current) setLoading(true);
      } catch {
        if (href.startsWith('/') && href !== pathname) setLoading(true);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div
      className="fixed top-[72px] left-0 right-0 z-[60] h-1 overflow-hidden bg-gray-200"
      role="progressbar"
      aria-label="Завантаження сторінки"
    >
      <div className="navigation-progress-bar h-full w-1/3 bg-green-500" />
    </div>
  );
}
