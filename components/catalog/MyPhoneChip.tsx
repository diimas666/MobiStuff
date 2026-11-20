'use client';

import { Smartphone } from 'lucide-react';
import { useMyPhone } from '@/context/MyPhoneContext';
import { useFilters } from './FilterContext';

/** «Показати лише для iPhone 15 Pro» — якщо в категорії є товари для моделі покупця */
export default function MyPhoneChip({ models }: { models: string[] }) {
  const { phone, openPicker } = useMyPhone();
  const { params, setParams } = useFilters();
  if (!models.length) return null;
  const match = phone ? models.find((m) => m.toLowerCase() === phone.toLowerCase()) : undefined;
  const active = params.get('phone');

  if (!phone) {
    return (
      <button type="button" onClick={openPicker} className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] hover:bg-white/70">
        <Smartphone className="h-4 w-4 text-ink-3" />
        Вкажіть свій телефон — покажемо сумісні товари
      </button>
    );
  }
  if (!match || active === match) return null;
  return (
    <button type="button" onClick={() => setParams({ phone: match })} className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[14px] font-medium text-accent">
      <Smartphone className="h-4 w-4" />
      Показати лише для {match}
    </button>
  );
}
