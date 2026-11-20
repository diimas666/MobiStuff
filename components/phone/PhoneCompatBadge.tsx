'use client';

import { Check, Smartphone, TriangleAlert } from 'lucide-react';
import { useMyPhone } from '@/context/MyPhoneContext';
import { compatibleWith, compatModels } from '@/lib/phoneCompat';

/** На сторінці товару: чи підходить до телефону покупця */
export default function PhoneCompatBadge({ title }: { title: string }) {
  const { phone, openPicker } = useMyPhone();
  const models = compatModels(title);
  if (!models.length) return null;
  const ok = compatibleWith(title, phone);

  if (!phone)
    return (
      <button type="button" onClick={openPicker} className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-[14px] hover:bg-white/70">
        <Smartphone className="h-5 w-5 shrink-0 text-ink-3" />
        <span className="flex-1">
          Підходить для {models.slice(0, 3).join(', ')}
          {models.length > 3 ? ` і ще ${models.length - 3}` : ''}
        </span>
        <span className="font-medium text-accent">Мій телефон</span>
      </button>
    );

  return ok ? (
    <div className="flex items-center gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-[14px]">
      <Check className="h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
      <span className="flex-1">
        Підходить до вашого <b>{phone}</b>
      </span>
      <button type="button" onClick={openPicker} className="text-[13px] text-ink-3 hover:underline">
        Змінити
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
      <TriangleAlert className="h-5 w-5 shrink-0" />
      <span className="flex-1">
        Не для вашого {phone} — цей товар для {models.slice(0, 2).join(', ')}
      </span>
      <button type="button" onClick={openPicker} className="text-[13px] hover:underline">
        Змінити
      </button>
    </div>
  );
}
