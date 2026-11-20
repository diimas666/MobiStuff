'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import AdminWrapper from '@/components/AdminWrapper';
import { formatPrice } from '@/lib/format';

type C = { phone: string; name: string; email: string; city: string; orders: number; spent: number; cancelled: number; lastAt: string; firstAt: string; lastOrderId: string; points: number };
type Sort = 'last' | 'spent' | 'orders' | 'points';

const date = (s: string) => (s ? new Date(s).toLocaleDateString('uk-UA') : '—');

/** Покупці: хто скільки купує, бали, ручне нарахування */
export default function CustomersPage() {
  const [list, setList] = useState<C[] | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('last');
  const [edit, setEdit] = useState<C | null>(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');

  const load = () =>
    fetch('/api/admin/customers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setList(d.customers ?? []))
      .catch(() => setList([]));
  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const digits = s.replace(/\D/g, '');
    const f = (list ?? []).filter((c) => !s || c.name.toLowerCase().includes(s) || (digits.length >= 3 && c.phone.includes(digits)) || c.email.toLowerCase().includes(s) || c.city.toLowerCase().includes(s));
    const key: Record<Sort, (c: C) => number> = { last: (c) => +new Date(c.lastAt || 0), spent: (c) => c.spent, orders: (c) => c.orders, points: (c) => c.points };
    return [...f].sort((a, b) => key[sort](b) - key[sort](a));
  }, [list, q, sort]);

  const stats = useMemo(() => {
    const l = list ?? [];
    const repeat = l.filter((c) => c.orders - c.cancelled > 1).length;
    return { total: l.length, repeat, ltv: l.length ? Math.round(l.reduce((n, c) => n + c.spent, 0) / l.length) : 0 };
  }, [list]);

  const savePoints = async () => {
    if (!edit) return;
    const r = await fetch('/api/admin/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: edit.phone, delta: Number(delta), reason }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return toast.error(d.error || 'Не вдалося');
    toast.success(`Баланс: ${d.balance} балів`);
    setEdit(null);
    setDelta('');
    setReason('');
    load();
  };

  return (
    <AdminWrapper>
      <div className="space-y-5 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight">Покупці</h2>
            <p className="text-[14px] text-ink-3">
              {stats.total} покупців · повторно купували {stats.repeat} · у середньому {formatPrice(stats.ltv)} на покупця
            </p>
          </div>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Імʼя, телефон, місто…" className="field h-10 w-60" />
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field h-10 w-auto">
              <option value="last">Нещодавні</option>
              <option value="spent">Більше витратили</option>
              <option value="orders">Більше замовлень</option>
              <option value="points">Більше балів</option>
            </select>
          </div>
        </div>

        {!list ? (
          <p className="panel px-5 py-10 text-center text-ink-3">Завантаження…</p>
        ) : !shown.length ? (
          <p className="panel px-5 py-10 text-center text-ink-3">Покупців не знайдено</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-white">
            <table className="w-full text-[14px]">
              <thead className="text-left text-[12px] text-ink-3">
                <tr>
                  <th className="px-4 py-3 font-medium">Покупець</th>
                  <th className="px-4 py-3 font-medium">Замовлення</th>
                  <th className="px-4 py-3 font-medium">Витратив</th>
                  <th className="px-4 py-3 font-medium">Бали</th>
                  <th className="px-4 py-3 font-medium">Останнє</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.slice(0, 500).map((c) => (
                  <tr key={c.phone} className="border-t border-line-soft">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name || 'Без імені'}</p>
                      <p className="text-[12px] text-ink-3">
                        <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                        {c.city ? ` · ${c.city}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {c.orders}
                      {c.cancelled ? <span className="text-ink-3"> ({c.cancelled} скас.)</span> : null}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(c.spent)}</td>
                    <td className="px-4 py-3">{c.points}</td>
                    <td className="px-4 py-3">
                      <Link href="/admin/orders" className="hover:underline">{date(c.lastAt)}</Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setEdit(c)} className="chip">Бали</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setEdit(null)}>
          <div className="panel w-full max-w-sm space-y-3 p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-[17px] font-semibold">Бали: {edit.name || edit.phone}</p>
            <p className="text-[14px] text-ink-3">Зараз {edit.points}. Додатне число — нарахувати, відʼємне — списати.</p>
            <input value={delta} onChange={(e) => setDelta(e.target.value)} inputMode="numeric" placeholder="Напр. 50 або -20" className="field" autoFocus />
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Причина (бачить покупець)" className="field" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEdit(null)} className="btn-ghost h-10 px-4">Скасувати</button>
              <button type="button" onClick={savePoints} disabled={!Number(delta)} className="btn-primary h-10 px-4">Зберегти</button>
            </div>
          </div>
        </div>
      )}
    </AdminWrapper>
  );
}
