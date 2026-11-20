'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminWrapper from '@/components/AdminWrapper';

type Settings = {
  phone: string;
  email: string;
  instagram: string;
  telegram: string;
  viber: string;
  workingHours: string;
  freeDeliveryFrom: number;
  cardOnlyFrom: number;
  cardPaymentDetails: string;
  announcement: { enabled: boolean; text: string; link: string };
  notifyCustomers: { email: boolean; sms: boolean };
  reminderPromoPercent: number;
  remindersEnabled: boolean;
  saleEndsAt?: string;
  cashbackPercent?: number;
  maxPointsPercent?: number;
};
type Channels = { sms: boolean; email: boolean; telegram: boolean };

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-ink-3">{hint}</p>}
    </div>
  );
}

function Switch({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 py-2.5 text-left disabled:opacity-50">
      <span>
        <span className="block text-[15px]">{label}</span>
        {hint && <span className="block text-[12px] text-ink-3">{hint}</span>}
      </span>
      <span className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${checked ? 'bg-accent-bright' : 'bg-line-soft'}`}>
        <span className={`absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

/** Налаштування магазину: контакти, умови оплати/доставки, оголошення, сповіщення клієнтів */
export default function AdminSettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [channels, setChannels] = useState<Channels | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setS(d.settings);
        setChannels(d.channels);
      })
      .catch(() => {});
  }, []);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => (p ? { ...p, [k]: v } : p));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!s) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Не вдалося зберегти');
      setS(d.settings);
      toast.success('Налаштування збережено — сайт оновлено');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка');
    } finally {
      setSaving(false);
    }
  };

  if (!s) {
    return (
      <AdminWrapper>
        <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-white" />
      </AdminWrapper>
    );
  }

  return (
    <AdminWrapper>
      <form onSubmit={save} className="mx-auto max-w-3xl space-y-5 pb-28">
        <h2 className="text-[22px] font-semibold tracking-tight">Налаштування магазину</h2>

        <section className="panel space-y-4 p-5">
          <h3 className="text-[17px] font-semibold">Контакти</h3>
          <p className="-mt-2 text-[13px] text-ink-3">Показуються в футері, на сторінці «Контакти» і в листах клієнтам.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="st-phone" label="Телефон">
              <input id="st-phone" className="field" value={s.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+380 99 123 45 67" inputMode="tel" />
            </Field>
            <Field id="st-email" label="Email">
              <input id="st-email" className="field" value={s.email} onChange={(e) => set('email', e.target.value)} placeholder="shop@example.com" inputMode="email" />
            </Field>
            <Field id="st-ig" label="Instagram">
              <input id="st-ig" className="field" value={s.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/mobistuff" />
            </Field>
            <Field id="st-tg" label="Telegram">
              <input id="st-tg" className="field" value={s.telegram} onChange={(e) => set('telegram', e.target.value)} placeholder="https://t.me/mobistuff" />
            </Field>
            <Field id="st-viber" label="Viber">
              <input id="st-viber" className="field" value={s.viber} onChange={(e) => set('viber', e.target.value)} placeholder="+380 99 123 45 67" />
            </Field>
            <Field id="st-hours" label="Графік роботи">
              <input id="st-hours" className="field" value={s.workingHours} onChange={(e) => set('workingHours', e.target.value)} placeholder="Пн–Сб, 9:00–19:00" />
            </Field>
          </div>
        </section>

        <section className="panel space-y-4 p-5">
          <h3 className="text-[17px] font-semibold">Оплата і доставка</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="st-free" label="Безкоштовна доставка від, ₴" hint="Шкала в кошику і тексти на сайті">
              <input id="st-free" className="field" inputMode="numeric" value={s.freeDeliveryFrom} onChange={(e) => set('freeDeliveryFrom', Number(e.target.value.replace(/\D/g, '')) || 0)} />
            </Field>
            <Field id="st-card" label="Лише оплата карткою від, ₴" hint="Вище цієї суми післяплата недоступна">
              <input id="st-card" className="field" inputMode="numeric" value={s.cardOnlyFrom} onChange={(e) => set('cardOnlyFrom', Number(e.target.value.replace(/\D/g, '')) || 0)} />
            </Field>
          </div>
          <Field id="st-req" label="Реквізити для оплати карткою" hint="Клієнт отримає їх у листі/SMS одразу після замовлення з оплатою карткою">
            <textarea id="st-req" rows={3} className="field py-3" value={s.cardPaymentDetails} onChange={(e) => set('cardPaymentDetails', e.target.value)} placeholder={'Картка ПриватБанку: 5168 0000 0000 0000\nОтримувач: ФОП Шевченко О.'} />
          </Field>
        </section>

        <section className="panel space-y-4 p-5">
          <h3 className="text-[17px] font-semibold">Кешбек балами</h3>
          <p className="-mt-2 text-[13px] text-ink-3">Нараховуємо, коли ставите замовленню статус «Виконано». 1 бал = 1 грн. Покупець бачить баланс у кабінеті (вхід кодом з SMS).</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="st-cb" label="Кешбек, % від замовлення" hint="0 — вимкнено">
              <input id="st-cb" className="field" inputMode="numeric" value={s.cashbackPercent ?? 3} onChange={(e) => set('cashbackPercent', Math.min(20, Number(e.target.value.replace(/\D/g, '')) || 0))} />
            </Field>
            <Field id="st-mp" label="Можна оплатити балами до, % суми">
              <input id="st-mp" className="field" inputMode="numeric" value={s.maxPointsPercent ?? 30} onChange={(e) => set('maxPointsPercent', Math.min(100, Number(e.target.value.replace(/\D/g, '')) || 0))} />
            </Field>
          </div>
        </section>

        <section className="panel space-y-3 p-5">
          <h3 className="text-[17px] font-semibold">Таймер акції</h3>
          <Field id="st-sale" label="Акція діє до" hint="Показуємо відлік на сторінці «Акції» і в товарів зі знижкою. Порожньо — без таймера">
            <input id="st-sale" type="date" className="field" value={s.saleEndsAt ?? ''} onChange={(e) => set('saleEndsAt', e.target.value)} />
          </Field>
        </section>

        <section className="panel space-y-3 p-5">
          <h3 className="text-[17px] font-semibold">Оголошення на сайті</h3>
          <Switch label="Показувати оголошення" hint="Рядок над вмістом кожної сторінки" checked={s.announcement.enabled} onChange={(v) => set('announcement', { ...s.announcement, enabled: v })} />
          <Field id="st-ann" label="Текст">
            <input id="st-ann" className="field" maxLength={160} value={s.announcement.text} onChange={(e) => set('announcement', { ...s.announcement, text: e.target.value })} placeholder="−20% на всі навушники до неділі" />
          </Field>
          <Field id="st-ann-link" label="Посилання (необовʼязково)">
            <input id="st-ann-link" className="field" value={s.announcement.link} onChange={(e) => set('announcement', { ...s.announcement, link: e.target.value })} placeholder="/sale" />
          </Field>
        </section>

        <section className="panel p-5">
          <h3 className="text-[17px] font-semibold">Повідомлення клієнтам</h3>
          <p className="mt-1 mb-2 text-[13px] text-ink-3">Підтвердження замовлення і номер ТТН після відправлення.</p>
          <div className="divide-y divide-line-soft">
            <Switch
              label="Email"
              hint={channels?.email ? 'Пошта налаштована' : 'Потрібні SMTP_HOST, SMTP_USER, SMTP_PASS у налаштуваннях сервера'}
              checked={s.notifyCustomers.email}
              disabled={!channels?.email}
              onChange={(v) => set('notifyCustomers', { ...s.notifyCustomers, email: v })}
            />
            <Switch
              label="SMS"
              hint={channels?.sms ? 'TurboSMS підключено' : 'Потрібен TURBOSMS_TOKEN (turbosms.ua) у налаштуваннях сервера'}
              checked={s.notifyCustomers.sms}
              disabled={!channels?.sms}
              onChange={(v) => set('notifyCustomers', { ...s.notifyCustomers, sms: v })}
            />
          </div>
          <p className="mt-3 text-[13px] text-ink-3">
            Нові замовлення вам у Telegram: {channels?.telegram ? 'підключено' : 'не підключено (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)'}.
          </p>
        </section>

        <section className="panel space-y-3 p-5">
          <h3 className="text-[17px] font-semibold">Нагадування</h3>
          <p className="-mt-1 text-[13px] text-ink-3">
            «Ваш кошик чекає» — тим, хто вказав телефон чи email, але не оформив замовлення (через 1 год). І «Товар знову в наявності» — підписникам. Автоматично щодня о 9:00.
          </p>
          <Switch label="Надсилати нагадування" checked={s.remindersEnabled} onChange={(v) => set('remindersEnabled', v)} />
          <Field id="st-rem" label="Знижка в нагадуванні про кошик, %" hint="Персональний одноразовий промокод на 3 дні. 0 — без знижки">
            <input id="st-rem" className="field" inputMode="numeric" value={s.reminderPromoPercent} onChange={(e) => set('reminderPromoPercent', Math.min(30, Number(e.target.value.replace(/\D/g, '')) || 0))} />
          </Field>
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              const r = await fetch('/api/cron/reminders');
              const d = await r.json().catch(() => ({}));
              if (!r.ok) return toast.error(d.error || 'Не вдалося');
              toast.success(`Надіслано: кошиків ${d.carts ?? 0}, «в наявності» ${d.stock ?? 0}`);
            }}
          >
            Надіслати зараз
          </button>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl justify-end px-4 py-3">
            <button type="submit" className="btn-primary min-w-40" disabled={saving}>
              {saving ? 'Зберігаємо…' : 'Зберегти'}
            </button>
          </div>
        </div>
      </form>
    </AdminWrapper>
  );
}
