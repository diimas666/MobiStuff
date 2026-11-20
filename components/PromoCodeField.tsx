'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export type AppliedPromo = { code: string; discount: number; label: string };

/** Поле промокоду в оформленні: перевіряє код на сервері і показує знижку */
export default function PromoCodeField({ total, value, onChange }: { total: number; value: AppliedPromo | null; onChange: (p: AppliedPromo | null) => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/promo/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, total }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Промокод не підійшов');
      onChange(d);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка');
    } finally {
      setLoading(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-accent-soft px-4 py-3 text-[14px]">
        <span>
          Промокод <b className="tracking-wide">{value.code}</b> · {value.label}
        </span>
        <span className="flex items-center gap-2">
          <b className="text-accent">−{formatPrice(value.discount)}</b>
          <button type="button" onClick={() => onChange(null)} aria-label="Прибрати промокод" className="rounded-full p-1 text-ink-3 hover:bg-white">
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="link-more text-[15px]">
        Є промокод?
      </button>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              apply();
            }
          }}
          placeholder="Промокод"
          aria-label="Промокод"
          autoFocus
          className="field h-11 font-semibold tracking-wider uppercase"
        />
        <button type="button" onClick={apply} disabled={loading || !code.trim()} className="btn-ghost h-11 shrink-0 px-4">
          {loading ? '…' : 'Застосувати'}
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-sale" role="alert">{error}</p>}
    </div>
  );
}
