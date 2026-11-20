import type { Metadata } from 'next';
import RetryButton from './RetryButton';

export const metadata: Metadata = { title: 'Немає інтернету', robots: { index: false } };

/** Показується service worker'ом, коли сторінка не завантажилась через відсутність мережі */
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center sm:py-28">
      <svg viewBox="0 0 64 64" className="mx-auto h-20 w-20 text-line" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M8 24a34 34 0 0 1 48 0M16 32a23 23 0 0 1 32 0M24 40a12 12 0 0 1 16 0" />
        <circle cx="32" cy="49" r="3" fill="currentColor" stroke="none" />
        <path d="M10 10l44 44" className="text-ink-3" stroke="currentColor" />
      </svg>
      <h1 className="display-md mt-6">Немає інтернету.</h1>
      <p className="lead mt-4">Перевірте Wi‑Fi або мобільні дані. Кошик і обране збережені — нічого не загубиться.</p>
      <RetryButton />
    </div>
  );
}
