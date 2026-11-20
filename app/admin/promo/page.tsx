'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Copy, Trash2 } from 'lucide-react';
import AdminWrapper from '@/components/AdminWrapper';

type Promo = {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minTotal?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: string;
  active: boolean;
  note?: string;
};

const EMPTY = { code: '', type: 'percent' as 'percent' | 'fixed', value: '10', minTotal: '', maxUses: '', expiresAt: '', note: '' };

/** Промокоди: створення, увімкнення/вимкнення, статистика використань */
export default function AdminPromoPage() {
  const [items, setItems] = useState<Promo[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch('/api/admin/promo', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/promo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return toast.error(d.error || 'Не вдалося створити');
    toast.success(`Промокод ${d.item.code} створено`);
    setForm(EMPTY);
    load();
  };

  const toggle = async (p: Promo) => {
    await fetch(`/api/admin/promo/${p._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !p.active }) });
    load();
  };

  const remove = async (p: Promo) => {
    if (!confirm(`Видалити промокод ${p.code}?`)) return;
    await fetch(`/api/admin/promo/${p._id}`, { method: 'DELETE' });
    load();
  };

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const expired = (p: Promo) => p.expiresAt && new Date(p.expiresAt) < new Date();
  const exhausted = (p: Promo) => Boolean(p.maxUses) && (p.usedCount ?? 0) >= (p.maxUses ?? 0);

  return (
    <AdminWrapper>
      <div className="mx-auto max-w-4xl space-y-6 pb-16">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Промокоди</h2>
          <p className="text-[14px] text-ink-3">Покупець вводить код під час оформлення на сайті чи в застосунку — знижка рахується автоматично.</p>
        </div>

        <form onSubmit={create} className="panel grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label htmlFor="pr-code" className="field-label">Код</label>
            <input id="pr-code" className="field font-semibold tracking-wider uppercase" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="WELCOME10" required />
          </div>
          <div>
            <p className="field-label">Знижка</p>
            <div className="flex gap-2">
              <input aria-label="Розмір знижки" className="field" inputMode="numeric" value={form.value} onChange={(e) => set('value', e.target.value.replace(/\D/g, ''))} required />
              <div className="flex shrink-0 rounded-2xl bg-canvas p-1">
                {(['percent', 'fixed'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => set('type', t)} className={`rounded-xl px-3 text-[14px] font-medium ${form.type === t ? 'bg-white shadow-sm' : 'text-ink-2'}`}>
                    {t === 'percent' ? '%' : 'грн'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="pr-min" className="field-label">Мінімальна сума, грн</label>
            <input id="pr-min" className="field" inputMode="numeric" value={form.minTotal} onChange={(e) => set('minTotal', e.target.value.replace(/\D/g, ''))} placeholder="Без обмежень" />
          </div>
          <div>
            <label htmlFor="pr-max" className="field-label">Скільки разів можна використати</label>
            <input id="pr-max" className="field" inputMode="numeric" value={form.maxUses} onChange={(e) => set('maxUses', e.target.value.replace(/\D/g, ''))} placeholder="Без обмежень" />
          </div>
          <div>
            <label htmlFor="pr-exp" className="field-label">Діє до</label>
            <input id="pr-exp" type="date" className="field" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
          </div>
          <div>
            <label htmlFor="pr-note" className="field-label">Примітка (для себе)</label>
            <input id="pr-note" className="field" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Для блогера @name, сторіс 20.11" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Створюємо…' : 'Створити промокод'}
            </button>
          </div>
        </form>

        {items.length === 0 ? (
          <div className="panel px-6 py-12 text-center text-[15px] text-ink-3">Промокодів ще немає. Створіть перший — напр. WELCOME10 для нових клієнтів.</div>
        ) : (
          <ul className="overflow-hidden rounded-3xl bg-white">
            {items.map((p, i) => (
              <li key={p._id} className={`flex flex-wrap items-center gap-3 px-4 py-3.5 ${i ? 'border-t border-line-soft' : ''}`}>
                <button type="button" onClick={() => navigator.clipboard?.writeText(p.code).then(() => toast.success('Скопійовано'))} className="flex items-center gap-1.5 rounded-xl bg-canvas px-3 py-1.5 font-mono text-[15px] font-semibold tracking-wider" title="Скопіювати">
                  {p.code} <Copy className="h-3.5 w-3.5 text-ink-3" />
                </button>
                <span className="text-[16px] font-semibold text-sale">{p.type === 'percent' ? `−${p.value}%` : `−${p.value} грн`}</span>
                <span className="min-w-0 flex-1 text-[13px] text-ink-3">
                  Використано {p.usedCount ?? 0}
                  {p.maxUses ? ` з ${p.maxUses}` : ''}
                  {p.minTotal ? ` · від ${p.minTotal} грн` : ''}
                  {p.expiresAt ? ` · до ${new Date(p.expiresAt).toLocaleDateString('uk-UA')}` : ''}
                  {p.note ? ` · ${p.note}` : ''}
                </span>
                {expired(p) || exhausted(p) ? (
                  <span className="rounded-full bg-canvas px-2.5 py-1 text-[12px] text-ink-3">{expired(p) ? 'Термін минув' : 'Вичерпано'}</span>
                ) : null}
                <button type="button" role="switch" aria-checked={p.active} onClick={() => toggle(p)} aria-label={p.active ? 'Вимкнути' : 'Увімкнути'} className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${p.active ? 'bg-accent-bright' : 'bg-line-soft'}`}>
                  <span className={`absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform ${p.active ? 'translate-x-5' : ''}`} />
                </button>
                <button type="button" onClick={() => remove(p)} className="hdr-icon text-sale" aria-label={`Видалити ${p.code}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminWrapper>
  );
}
