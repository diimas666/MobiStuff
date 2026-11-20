'use client';

import { Smartphone } from 'lucide-react';
import { useMyPhone } from '@/context/MyPhoneContext';

/** Кнопка «Мій телефон» у шапці / меню */
export default function MyPhoneButton({ className = '' }: { className?: string }) {
  const { phone, openPicker } = useMyPhone();
  return (
    <button
      type="button"
      onClick={openPicker}
      className={`${className.includes('hidden') ? '' : 'inline-flex '}items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors hover:bg-ink/[0.06] ${phone ? 'text-ink' : 'text-ink-2'} ${className}`}
    >
      <Smartphone className="h-4 w-4" />
      <span className="max-w-[140px] truncate">{phone ?? 'Мій телефон'}</span>
    </button>
  );
}
