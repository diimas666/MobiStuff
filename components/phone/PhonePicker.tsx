'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { useMyPhone } from '@/context/MyPhoneContext';

let cache: { model: string; count: number }[] | null = null;

/** Вибір моделі телефону: пошук + популярні моделі */
export default function PhonePicker() {
  const { phone, setPhone, pickerOpen, closePicker } = useMyPhone();
  const [models, setModels] = useState(cache ?? []);
  const [q, setQ] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (pickerOpen) {
      dialog.current?.showModal();
      if (!cache)
        fetch('/api/phone-models')
          .then((r) => (r.ok ? r.json() : { models: [] }))
          .then((d) => {
            cache = d.models;
            setModels(d.models);
          })
          .catch(() => {});
    } else dialog.current?.close();
  }, [pickerOpen]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? models.filter((m) => m.model.toLowerCase().includes(s)).slice(0, 60) : models.slice(0, 24);
  }, [models, q]);

  const choose = (m: string | null) => {
    setPhone(m);
    closePicker();
  };

  return (
    <dialog
      ref={dialog}
      onClose={closePicker}
      onClick={(e) => e.target === dialog.current && closePicker()}
      className="m-auto w-[calc(100%-24px)] max-w-lg rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-black/40"
      aria-label="Оберіть модель телефону"
    >
      <div className="flex max-h-[80dvh] flex-col">
        <div className="border-b border-line-soft p-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">Мій телефон</h2>
              <p className="mt-0.5 text-[14px] text-ink-3">Підкажемо, які чохли й стекла підходять саме вам.</p>
            </div>
            <button type="button" onClick={closePicker} className="hdr-icon -mt-1 -mr-2" aria-label="Закрити">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="iPhone 15 Pro, Galaxy S24…" aria-label="Пошук моделі" className="field h-11 pl-10" autoFocus />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {shown.map((m) => (
            <li key={m.model}>
              <button type="button" onClick={() => choose(m.model)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-canvas">
                <span className={phone === m.model ? 'font-semibold' : ''}>{m.model}</span>
                <span className="flex items-center gap-2 text-[13px] text-ink-3">
                  {m.count} тов.
                  {phone === m.model && <Check className="h-4 w-4 text-accent" />}
                </span>
              </button>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="px-3 py-6 text-center text-[14px] text-ink-3">{models.length ? 'Такої моделі не знайдено' : 'Завантажуємо моделі…'}</li>
          )}
        </ul>
        {phone && (
          <div className="border-t border-line-soft p-3">
            <button type="button" onClick={() => choose(null)} className="w-full rounded-xl py-2.5 text-[14px] font-medium text-sale hover:bg-sale/[0.05]">
              Скинути модель
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
