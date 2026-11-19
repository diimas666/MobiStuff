'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Copy, Download, ExternalLink, Phone, Search, Trash2, X } from 'lucide-react';
import AdminWrapper from '@/components/AdminWrapper';
import { formatPrice } from '@/lib/format';
import {
  ORDER_STATUSES,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  normalizeOrderStatus,
  type OrderStatus,
} from '@/lib/orderStatus';

interface OrderItem {
  _id?: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
  handle?: string;
  variant?: string;
}

interface Order {
  _id: string;
  orderId?: string;
  status?: OrderStatus;
  name: string;
  lastName?: string;
  phone: string;
  email?: string;
  comment?: string;
  city?: string;
  warehouse?: string;
  paymentMethod?: string;
  total: number;
  items?: OrderItem[];
  createdAt: string;
  utm?: Record<string, string>;
  ttn?: string;
  managerNote?: string;
  history?: { at: string; text: string }[];
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const sourceLabel = (utm?: Record<string, string>) =>
  !utm
    ? ''
    : [utm.utm_source, utm.utm_campaign].filter(Boolean).join(' / ') ||
      (utm.fbclid ? 'Facebook/Instagram' : utm.gclid ? 'Google' : utm.ttclid ? 'TikTok' : 'реклама');

function StatusPill({ status }: { status: OrderStatus }) {
  const c = ORDER_STATUS_COLORS[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}>{ORDER_STATUS_LABELS[status]}</span>;
}

/* ---------- Картка замовлення ---------- */
function OrderSheet({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: (o: Order) => void }) {
  const [status, setStatus] = useState<OrderStatus>(normalizeOrderStatus(order.status));
  const [ttn, setTtn] = useState(order.ttn ?? '');
  const [note, setNote] = useState(order.managerNote ?? '');
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const willNotify =
    notify && status === 'shipped' && ttn.trim() !== '' && (ttn.trim() !== (order.ttn ?? '') || normalizeOrderStatus(order.status) !== 'shipped');

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ttn, managerNote: note, notify: willNotify }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Не вдалося зберегти');
      onSaved(d.order);
      toast.success(d.notified?.length ? `Збережено. Клієнту надіслано ТТН (${d.notified.join(', ')})` : 'Збережено');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Помилка');
    } finally {
      setSaving(false);
    }
  };

  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast.success('Скопійовано'));

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={`Замовлення ${order.orderId ?? ''}`}>
      <div className="menu-fade-in absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="sheet-right absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-canvas shadow-[0_0_60px_rgba(0,0,0,.18)]">
        <header className="flex items-center justify-between border-b border-line-soft bg-white px-5 py-4">
          <div>
            <p className="text-[19px] font-semibold tracking-tight">{order.orderId || 'Замовлення'}</p>
            <p className="text-[13px] text-ink-3">{new Date(order.createdAt).toLocaleString('uk-UA')}</p>
          </div>
          <button type="button" onClick={onClose} className="hdr-icon" aria-label="Закрити">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <section className="panel p-4">
            <p className="text-[17px] font-semibold">
              {order.name} {order.lastName}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={`tel:${order.phone}`} className="chip h-9 gap-1.5 text-[14px]">
                <Phone className="h-4 w-4" /> {order.phone}
              </a>
              <button type="button" onClick={() => copy(order.phone)} className="chip h-9 gap-1.5 text-[14px]">
                <Copy className="h-4 w-4" /> Копіювати
              </button>
            </div>
            {order.email && <p className="mt-2 text-[14px] text-ink-2">{order.email}</p>}
            {order.comment && <p className="mt-3 rounded-xl bg-canvas px-3 py-2 text-[14px]">«{order.comment}»</p>}
            {order.utm && <p className="mt-3 text-[13px] text-accent">📣 Прийшов з реклами: {sourceLabel(order.utm)}</p>}
          </section>

          <section className="panel p-4">
            <ul className="divide-y divide-line-soft">
              {order.items?.map((it, i) => (
                <li key={it._id || it.handle || i} className="flex items-center gap-3 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image || '/images/headphones-bg-white.webp'} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-canvas object-contain p-1" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[14px] leading-snug font-medium">{it.title}</p>
                    <p className="text-[13px] text-ink-3">
                      {it.variant ? `${it.variant} · ` : ''}
                      {it.quantity} × {formatPrice(it.price)}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold whitespace-nowrap">{formatPrice(it.quantity * it.price)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-line-soft pt-3 text-[16px] font-semibold">
              <span>Разом</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <p className="mt-1 text-[13px] text-ink-3">Оплата: {order.paymentMethod === 'card' ? 'карткою' : 'при отриманні'}</p>
          </section>

          <section className="panel p-4">
            <p className="text-[13px] text-ink-3">Нова Пошта</p>
            <p className="text-[15px] font-medium">{order.city}</p>
            <p className="text-[14px] text-ink-2">{order.warehouse}</p>
            <button
              type="button"
              onClick={() => copy(`${order.name} ${order.lastName ?? ''}, ${order.phone}, ${order.city}, ${order.warehouse}`)}
              className="link-more mt-2 text-[14px]"
            >
              Скопіювати дані для накладної
            </button>
          </section>

          <section className="panel space-y-4 p-4">
            <div>
              <p className="field-label">Статус</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)} className={`chip h-9 text-[14px] ${status === s ? 'chip-active' : ''}`}>
                    {ORDER_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="ord-ttn" className="field-label">ТТН Нової Пошти</label>
              <div className="flex gap-2">
                <input
                  id="ord-ttn"
                  value={ttn}
                  onChange={(e) => setTtn(e.target.value.replace(/[^\d\s]/g, ''))}
                  inputMode="numeric"
                  placeholder="20450012345678"
                  className="field font-medium tracking-wide"
                />
                {ttn.trim() && (
                  <a
                    href={`https://novaposhta.ua/tracking/?cargo_number=${ttn.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost shrink-0 px-4"
                    title="Відстежити"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            {status === 'shipped' && ttn.trim() && (
              <label className="flex items-center gap-3 text-[14px]">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-5 w-5 accent-[#138a47]" />
                Надіслати клієнту ТТН (SMS / email)
              </label>
            )}
            <div>
              <label htmlFor="ord-note" className="field-label">Примітка менеджера</label>
              <textarea
                id="ord-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Клієнт просив передзвонити після 18:00. Клієнт цього не бачить."
                className="field py-3"
              />
            </div>
          </section>

          {order.history && order.history.length > 0 && (
            <section className="px-1">
              <p className="mb-2 text-[13px] font-medium text-ink-3">Історія</p>
              <ol className="space-y-1.5">
                {[...order.history].reverse().map((h, i) => (
                  <li key={i} className="flex gap-3 text-[13px]">
                    <span className="w-28 shrink-0 text-ink-3">{fmtDate(h.at)}</span>
                    <span>{h.text}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <footer className="border-t border-line-soft bg-white px-5 py-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? 'Зберігаємо…' : willNotify ? 'Зберегти і надіслати ТТН' : 'Зберегти'}
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* ---------- Список ---------- */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/admin/getOrders', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      const s = normalizeOrderStatus(o.status);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return orders.filter((o) => {
      if (statusFilter !== 'all' && normalizeOrderStatus(o.status) !== statusFilter) return false;
      if (!q) return true;
      const text = [o.orderId, o.name, o.lastName, o.email, o.city, o.ttn].join(' ').toLowerCase();
      return text.includes(q) || (qDigits.length >= 3 && (o.phone?.replace(/\D/g, '').includes(qDigits) || Boolean(o.ttn?.includes(qDigits))));
    });
  }, [orders, query, statusFilter]);

  const open = orders.find((o) => o._id === openId) ?? null;
  const closeSheet = useCallback(() => setOpenId(null), []);

  const deleteSelected = async () => {
    if (!confirm(`Видалити ${selected.size} замовлень? Це не можна скасувати.`)) return;
    await fetch('/api/admin/deleteOrders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected] }),
    });
    setSelected(new Set());
    fetchOrders();
  };

  const exportHref = `/api/admin/orders/export${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`;
  const revenue = visible.filter((o) => normalizeOrderStatus(o.status) !== 'cancelled').reduce((n, o) => n + (o.total || 0), 0);

  return (
    <AdminWrapper>
      <div className="mx-auto max-w-6xl pb-20">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight">Замовлення</h2>
            <p className="text-[14px] text-ink-3">
              {visible.length} шт. на {formatPrice(revenue)}
            </p>
          </div>
          <a href={exportHref} className="btn-ghost h-10 px-4 text-[14px]">
            <Download className="h-4 w-4" /> Excel
          </a>
        </div>

        <div className="relative mb-3">
          <Search className="absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук: телефон, імʼя, № замовлення або ТТН"
            className="field h-12 pl-11"
            type="search"
          />
        </div>

        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {(['all', ...ORDER_STATUSES] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)} className={`chip shrink-0 gap-1.5 ${statusFilter === s ? 'chip-active' : ''}`}>
              {s === 'all' ? 'Усі' : ORDER_STATUS_LABELS[s]}
              <span className="opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-3xl bg-white" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="panel px-6 py-16 text-center">
            <p className="text-[17px] font-semibold">{orders.length ? 'Нічого не знайдено' : 'Замовлень поки немає'}</p>
            <p className="mt-1 text-[14px] text-ink-3">
              {orders.length ? 'Змініть пошук або фільтр статусу.' : 'Нові замовлення зʼявляться тут і в Telegram.'}
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-3xl bg-white">
            {visible.map((o, i) => {
              const status = normalizeOrderStatus(o.status);
              const first = o.items?.[0];
              return (
                <li key={o._id} className={`flex items-center gap-3 px-3 py-3 sm:px-4 ${i ? 'border-t border-line-soft' : ''}`}>
                  <input
                    type="checkbox"
                    aria-label={`Вибрати ${o.orderId ?? ''}`}
                    checked={selected.has(o._id)}
                    onChange={() =>
                      setSelected((prev) => {
                        const n = new Set(prev);
                        if (n.has(o._id)) n.delete(o._id);
                        else n.add(o._id);
                        return n;
                      })
                    }
                    className="h-4 w-4 shrink-0"
                  />
                  <button type="button" onClick={() => setOpenId(o._id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={first?.image || '/images/headphones-bg-white.webp'} alt="" className="hidden h-12 w-12 shrink-0 rounded-xl bg-canvas object-contain p-1 sm:block" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[15px] font-semibold">
                          {o.name} {o.lastName}
                        </span>
                        <StatusPill status={status} />
                        {o.utm && <span className="text-[12px] text-accent">📣 {sourceLabel(o.utm)}</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-ink-3">
                        {o.orderId} · {fmtDate(o.createdAt)} · {o.phone}
                        {o.ttn ? ` · ТТН ${o.ttn}` : ''}
                      </span>
                      <span className="block truncate text-[13px] text-ink-2">
                        {first?.title}
                        {(o.items?.length ?? 0) > 1 ? ` + ще ${(o.items?.length ?? 1) - 1}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[15px] font-semibold">{formatPrice(o.total)}</span>
                      <span className="block text-[12px] text-ink-3">{o.paymentMethod === 'card' ? 'картка' : 'післяплата'}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <span className="text-[14px]">Вибрано: {selected.size}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelected(new Set())} className="btn-ghost px-4">
                Скасувати
              </button>
              <button type="button" onClick={deleteSelected} className="btn-ghost px-4 text-sale">
                <Trash2 className="h-4 w-4" /> Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <OrderSheet
          key={open._id}
          order={open}
          onClose={closeSheet}
          onSaved={(o) => setOrders((prev) => prev.map((x) => (x._id === o._id ? { ...x, ...o } : x)))}
        />
      )}
    </AdminWrapper>
  );
}
