import 'server-only';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import StoreSettings from '@/app/api/models/StoreSettings';
import { CARD_ONLY_FROM, FREE_DELIVERY_FROM } from '@/data/storePolicies';

export type StoreSettingsData = {
  phone: string;
  email: string;
  instagram: string;
  telegram: string;
  viber: string;
  workingHours: string;
  freeDeliveryFrom: number;
  cardOnlyFrom: number;
  /** Реквізити для оплати карткою — надсилаються клієнту після замовлення */
  cardPaymentDetails: string;
  announcement: { enabled: boolean; text: string; link: string };
  notifyCustomers: { email: boolean; sms: boolean };
  /** Нагадування про кошик: знижка в персональному промокоді, % (0 — без промокоду) */
  reminderPromoPercent: number;
  remindersEnabled: boolean;
  /** Дата завершення акції (YYYY-MM-DD) — таймер на сайті */
  saleEndsAt: string;
  /** Кешбек балами, % від виконаного замовлення (0 — вимкнено) */
  cashbackPercent: number;
  /** Скільки % суми можна оплатити балами */
  maxPointsPercent: number;
};

export const DEFAULT_SETTINGS: StoreSettingsData = {
  phone: '',
  email: 'mobistuffinfo4@gmail.com',
  instagram: '',
  telegram: '',
  viber: '',
  workingHours: 'Пн–Сб, 9:00–19:00',
  freeDeliveryFrom: FREE_DELIVERY_FROM,
  cardOnlyFrom: CARD_ONLY_FROM,
  cardPaymentDetails: '',
  announcement: { enabled: false, text: '', link: '' },
  notifyCustomers: { email: true, sms: true },
  reminderPromoPercent: 5,
  remindersEnabled: true,
  saleEndsAt: '',
  cashbackPercent: 3,
  maxPointsPercent: 30,
};

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const money = (v: unknown, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n < 10_000_000 ? n : fallback;
};
const url = (v: unknown) => {
  const s = str(v, 300);
  return !s || /^(https?:\/\/|\/)/.test(s) ? s : '';
};

/** Перевірка і нормалізація полів з форми */
export function parseSettings(body: Record<string, any>, base: StoreSettingsData = DEFAULT_SETTINGS): StoreSettingsData {
  const email = str(body.email, 120);
  return {
    phone: str(body.phone, 40),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
    instagram: url(body.instagram),
    telegram: url(body.telegram),
    viber: str(body.viber, 120),
    workingHours: str(body.workingHours, 120),
    freeDeliveryFrom: money(body.freeDeliveryFrom, base.freeDeliveryFrom),
    cardOnlyFrom: money(body.cardOnlyFrom, base.cardOnlyFrom),
    cardPaymentDetails: str(body.cardPaymentDetails, 1000),
    announcement: {
      enabled: Boolean(body.announcement?.enabled),
      text: str(body.announcement?.text, 160),
      link: url(body.announcement?.link),
    },
    notifyCustomers: {
      email: body.notifyCustomers?.email !== false,
      sms: body.notifyCustomers?.sms !== false,
    },
    reminderPromoPercent: Math.min(30, money(body.reminderPromoPercent, base.reminderPromoPercent)),
    remindersEnabled: body.remindersEnabled !== false,
    cashbackPercent: Math.min(20, money(body.cashbackPercent, base.cashbackPercent ?? 3)),
    maxPointsPercent: Math.min(100, money(body.maxPointsPercent, base.maxPointsPercent ?? 30)),
    saleEndsAt: /^\d{4}-\d{2}-\d{2}$/.test(str(body.saleEndsAt, 10)) ? str(body.saleEndsAt, 10) : '',
  };
}

async function load(): Promise<StoreSettingsData> {
  try {
    await dbConnect();
    const doc = await StoreSettings.findOne({ key: 'main' }).lean<Record<string, any>>();
    if (!doc) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...Object.fromEntries(Object.entries(doc).filter(([k, v]) => k in DEFAULT_SETTINGS && v !== undefined && v !== null)),
      announcement: { ...DEFAULT_SETTINGS.announcement, ...(doc.announcement ?? {}) },
      notifyCustomers: { ...DEFAULT_SETTINGS.notifyCustomers, ...(doc.notifyCustomers ?? {}) },
    } as StoreSettingsData;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const getStoreSettings = unstable_cache(load, ['store-settings-v2'], { revalidate: 3600, tags: ['settings'] });

/** Публічна частина (для сторінок і застосунку). Реквізити картки — публічні: їх бачить кожен покупець */
export function publicSettings(s: StoreSettingsData) {
  const { notifyCustomers: _n, reminderPromoPercent: _r, remindersEnabled: _e, ...rest } = s;
  void _n;
  void _r;
  void _e;
  return rest;
}
