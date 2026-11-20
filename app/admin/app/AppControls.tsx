'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ImagePlus, Trash2 } from 'lucide-react';

type Banner = { id: string; title: string; subtitle: string; image: string; link: string; promoCode: string; startsAt: string; endsAt: string; enabled: boolean };
type Config = {
  banners: Banner[];
  minVersion: string;
  latestVersion: string;
  maintenance: { enabled: boolean; message: string };
  whatsNew: { version: string; items: string[] };
  autoPush: { cart: boolean; priceDrop: boolean; winback: boolean; winbackPromoPercent: number };
};

const emptyBanner = (): Banner => ({ id: Math.random().toString(36).slice(2, 10), title: '', subtitle: '', image: '', link: '', promoCode: '', startsAt: '', endsAt: '', enabled: true });

/** Керування застосунком: баннери, оновлення, техроботи, «Що нового», автоматичні push */
export default function AppControls() {
  const [c, setC] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/app-config', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setC(d.config))
      .catch(() => {});
  }, []);

  if (!c) return <p className="panel px-5 py-8 text-center text-ink-3">Завантаження…</p>;
  const set = (patch: Partial<Config>) => setC({ ...c, ...patch });
  const setBanner = (i: number, patch: Partial<Banner>) => set({ banners: c.banners.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  const save = async () => {
    setSaving(true);
    const r = await fetch('/api/admin/app-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
    const d = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) return toast.error(d.error || 'Не вдалося зберегти');
    setC(d.config);
    toast.success('Збережено — застосунок оновиться протягом хвилини');
  };

  const upload = async (i: number, file?: File) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const d = await r.json().catch(() => ({}));
    const url = d.files?.[0]?.url;
    if (!r.ok || !url) return toast.error(d.error || 'Не вдалося завантажити');
    setBanner(i, { image: url });
  };

  const action = async (url: string, method: string, ok: string) => {
    const r = await fetch(url, { method });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.ok === false) return toast.error(d.error || 'Не вдалося');
    toast.success(ok);
  };

  return (
    <div className="space-y-6">
      <section className="panel space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-semibold">Баннери на головній</h3>
            <p className="text-[13px] text-ink-3">Показуються зверху головного екрана. Посилання: mobistuff://product/&lt;адреса товару&gt;, mobistuff://category/&lt;категорія&gt; або https://…</p>
          </div>
          <button type="button" onClick={() => set({ banners: [...c.banners, emptyBanner()] })} className="chip">+ Баннер</button>
        </div>
        {c.banners.length === 0 && <p className="text-[14px] text-ink-3">Баннерів немає — показуємо акції з розділу «Акції».</p>}
        {c.banners.map((b, i) => (
          <div key={b.id} className="grid gap-3 rounded-2xl bg-canvas p-4 sm:grid-cols-[140px_1fr]">
            <label className="flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white text-ink-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {b.image ? <img src={b.image} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" />}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(i, e.target.files?.[0])} />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={b.title} onChange={(e) => setBanner(i, { title: e.target.value })} placeholder="Заголовок" className="field" />
              <input value={b.subtitle} onChange={(e) => setBanner(i, { subtitle: e.target.value })} placeholder="Підзаголовок" className="field" />
              <input value={b.link} onChange={(e) => setBanner(i, { link: e.target.value })} placeholder="mobistuff://category/category-chehli" className="field" />
              <input value={b.promoCode} onChange={(e) => setBanner(i, { promoCode: e.target.value })} placeholder="Промокод (необовʼязково)" className="field" />
              <label className="text-[13px] text-ink-3">З <input type="date" value={b.startsAt} onChange={(e) => setBanner(i, { startsAt: e.target.value })} className="field mt-1" /></label>
              <label className="text-[13px] text-ink-3">По <input type="date" value={b.endsAt} onChange={(e) => setBanner(i, { endsAt: e.target.value })} className="field mt-1" /></label>
              <div className="flex items-center justify-between sm:col-span-2">
                <label className="flex items-center gap-2 text-[14px]">
                  <input type="checkbox" checked={b.enabled} onChange={(e) => setBanner(i, { enabled: e.target.checked })} /> Показувати
                </label>
                <button type="button" onClick={() => set({ banners: c.banners.filter((_, j) => j !== i) })} className="flex items-center gap-1 text-[14px] text-sale"><Trash2 className="h-4 w-4" /> Видалити</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="panel grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <h3 className="text-[17px] font-semibold">Оновлення</h3>
          <p className="text-[13px] text-ink-3">Якщо версія застосунку нижча за мінімальну — покупець бачить «Оновіть застосунок» і кнопку App Store.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-[13px] text-ink-3">Мінімальна<input value={c.minVersion} onChange={(e) => set({ minVersion: e.target.value })} placeholder="1.1" className="field mt-1" /></label>
            <label className="text-[13px] text-ink-3">Остання<input value={c.latestVersion} onChange={(e) => set({ latestVersion: e.target.value })} placeholder="1.1" className="field mt-1" /></label>
          </div>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">Технічні роботи</h3>
          <p className="text-[13px] text-ink-3">Замість застосунку покупці бачать повідомлення. Сайт працює як завжди.</p>
          <label className="mt-3 flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={c.maintenance.enabled} onChange={(e) => set({ maintenance: { ...c.maintenance, enabled: e.target.checked } })} /> Увімкнути
          </label>
          <input value={c.maintenance.message} onChange={(e) => set({ maintenance: { ...c.maintenance, message: e.target.value } })} placeholder="Оновлюємо каталог, повернемось за годину" className="field mt-2" />
        </div>
      </section>

      <section className="panel space-y-3 p-5">
        <h3 className="text-[17px] font-semibold">«Що нового» після оновлення</h3>
        <p className="text-[13px] text-ink-3">Показується один раз, коли покупець вперше відкриває вказану версію. Кожен пункт — з нового рядка.</p>
        <input value={c.whatsNew.version} onChange={(e) => set({ whatsNew: { ...c.whatsNew, version: e.target.value } })} placeholder="Версія, напр. 1.1" className="field max-w-40" />
        <textarea value={c.whatsNew.items.join('\n')} onChange={(e) => set({ whatsNew: { ...c.whatsNew, items: e.target.value.split('\n') } })} rows={4} placeholder={'Новий дизайн\nВідстеження посилки\nБали кешбеку'} className="field" />
      </section>

      <section className="panel space-y-3 p-5">
        <h3 className="text-[17px] font-semibold">Автоматичні push</h3>
        <p className="text-[13px] text-ink-3">Надсилаються щодня о 9:00 тим, хто дозволив сповіщення.</p>
        <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={c.autoPush.cart} onChange={(e) => set({ autoPush: { ...c.autoPush, cart: e.target.checked } })} /> «Ваш кошик чекає» — через 3 год після додавання, якщо не оформили</label>
        <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={c.autoPush.priceDrop} onChange={(e) => set({ autoPush: { ...c.autoPush, priceDrop: e.target.checked } })} /> «Ціна знизилась» — на товар з обраного (від −5%)</label>
        <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={c.autoPush.winback} onChange={(e) => set({ autoPush: { ...c.autoPush, winback: e.target.checked } })} /> «Давно не бачились» — хто не заходив 30+ днів</label>
        <label className="flex items-center gap-2 text-[14px] text-ink-2">
          Знижка в «Давно не бачились»
          <input type="number" min={0} max={30} value={c.autoPush.winbackPromoPercent} onChange={(e) => set({ autoPush: { ...c.autoPush, winbackPromoPercent: Number(e.target.value) } })} className="field h-9 w-20" /> %
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={saving} className="btn-primary h-11 px-6">{saving ? 'Зберігаємо…' : 'Зберегти'}</button>
        <button type="button" onClick={() => action('/api/admin/telegram', 'POST', 'Кнопки статусів у Telegram підключено')} className="btn-ghost h-11 px-4">Підключити кнопки в Telegram</button>
        <button type="button" onClick={() => action('/api/cron/backup', 'GET', 'Резервну копію надіслано в Telegram')} className="btn-ghost h-11 px-4">Резервна копія зараз</button>
      </div>
    </div>
  );
}
