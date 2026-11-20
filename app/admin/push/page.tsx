'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminWrapper from '@/components/AdminWrapper';

const LINKS = [
  { label: 'Головна', url: 'mobistuff://home' },
  { label: 'Каталог', url: 'mobistuff://catalog' },
  { label: 'Кошик', url: 'mobistuff://cart' },
  { label: 'Обране', url: 'mobistuff://favorites' },
];

/** Push-розсилка всім, хто встановив застосунок і дозволив сповіщення */
export default function AdminPushPage() {
  const [info, setInfo] = useState<{ devices: number; configured: boolean } | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('mobistuff://home');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/push', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setInfo)
      .catch(() => {});
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Надіслати сповіщення на ${info?.devices ?? 0} пристроїв?`)) return;
    setSending(true);
    const res = await fetch('/api/admin/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body, url }) });
    const d = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) return toast.error(d.error || 'Не вдалося надіслати');
    toast.success(`Доставлено: ${d.delivered} з ${d.total}`);
    setTitle('');
    setBody('');
  };

  return (
    <AdminWrapper>
      <div className="mx-auto max-w-2xl space-y-5 pb-16">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Push-розсилка</h2>
          <p className="text-[14px] text-ink-3">
            {info ? `${info.devices} пристроїв з увімкненими сповіщеннями.` : 'Завантаження…'} Статуси замовлень клієнти отримують автоматично.
          </p>
        </div>

        {info && !info.configured && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
            Push ще не підключено. Потрібен ключ APNs з Apple Developer (Keys → Apple Push Notifications service) і змінні APNS_KEY, APNS_KEY_ID, APNS_TEAM_ID на сервері.
          </p>
        )}

        <form onSubmit={send} className="panel space-y-4 p-5">
          <div>
            <label htmlFor="pu-title" className="field-label">Заголовок</label>
            <input id="pu-title" className="field" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="−20% на навушники до неділі" required />
          </div>
          <div>
            <label htmlFor="pu-body" className="field-label">Текст</label>
            <textarea id="pu-body" rows={3} className="field py-3" maxLength={300} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Встигніть забрати TWS-навушники зі знижкою — кількість обмежена." required />
          </div>
          <div>
            <p className="field-label">Що відкрити після натискання</p>
            <div className="flex flex-wrap gap-2">
              {LINKS.map((l) => (
                <button key={l.url} type="button" onClick={() => setUrl(l.url)} className={`chip ${url === l.url ? 'chip-active' : ''}`}>
                  {l.label}
                </button>
              ))}
            </div>
            <input aria-label="Посилання" className="field mt-2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="mobistuff://product/назва-товару" />
            <p className="mt-1.5 text-[12px] text-ink-3">Товар: mobistuff://product/&lt;адреса товару з сайту&gt;, категорія: mobistuff://category/&lt;розділ&gt;</p>
          </div>

          {/* Попередній вигляд */}
          <div className="rounded-3xl bg-canvas p-3">
            <div className="flex gap-3 rounded-2xl bg-white/90 p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/app-icon.png" alt="" className="h-9 w-9 rounded-[9px]" />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{title || 'Заголовок'}</p>
                <p className="line-clamp-3 text-[14px] text-ink-2">{body || 'Текст сповіщення'}</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={sending || !info?.configured || !info?.devices}>
            {sending ? 'Надсилаємо…' : 'Надіслати всім'}
          </button>
        </form>
      </div>
    </AdminWrapper>
  );
}
