import 'server-only';
import { unstable_cache } from 'next/cache';
import { randomBytes } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import AppConfig from '@/app/api/models/AppConfig';

export type AppBanner = { id: string; title: string; subtitle: string; image: string; link: string; promoCode: string; startsAt: string; endsAt: string; enabled: boolean };
export type AppConfigData = {
  banners: AppBanner[];
  minVersion: string;
  latestVersion: string;
  maintenance: { enabled: boolean; message: string };
  whatsNew: { version: string; items: string[] };
  autoPush: { cart: boolean; priceDrop: boolean; winback: boolean; winbackPromoPercent: number };
};

export const DEFAULT_APP_CONFIG: AppConfigData = {
  banners: [],
  minVersion: '',
  latestVersion: '1.1',
  maintenance: { enabled: false, message: '' },
  whatsNew: { version: '', items: [] },
  autoPush: { cart: true, priceDrop: true, winback: true, winbackPromoPercent: 10 },
};

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const ver = (v: unknown) => (/^\d+(\.\d+){0,2}$/.test(str(v, 20)) ? str(v, 20) : '');
const date = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(str(v, 10)) ? str(v, 10) : '');
const link = (v: unknown) => {
  const s = str(v, 300);
  return /^(mobistuff:\/\/|https:\/\/)/.test(s) ? s : '';
};
const image = (v: unknown) => {
  const s = str(v, 500);
  return /^(https:\/\/|\/)/.test(s) ? s : '';
};

export function parseAppConfig(b: Record<string, any>): AppConfigData {
  return {
    banners: (Array.isArray(b.banners) ? b.banners : []).slice(0, 10).map((x: Record<string, unknown>) => ({
      id: str(x.id, 20) || randomBytes(4).toString('hex'),
      title: str(x.title, 60),
      subtitle: str(x.subtitle, 100),
      image: image(x.image),
      link: link(x.link),
      promoCode: str(x.promoCode, 30).toUpperCase(),
      startsAt: date(x.startsAt),
      endsAt: date(x.endsAt),
      enabled: x.enabled !== false,
    })).filter((x: AppBanner) => x.title || x.image),
    minVersion: ver(b.minVersion),
    latestVersion: ver(b.latestVersion),
    maintenance: { enabled: Boolean(b.maintenance?.enabled), message: str(b.maintenance?.message, 300) },
    whatsNew: {
      version: ver(b.whatsNew?.version),
      items: (Array.isArray(b.whatsNew?.items) ? b.whatsNew.items : []).map((i: unknown) => str(i, 120)).filter(Boolean).slice(0, 8),
    },
    autoPush: {
      cart: b.autoPush?.cart !== false,
      priceDrop: b.autoPush?.priceDrop !== false,
      winback: b.autoPush?.winback !== false,
      winbackPromoPercent: Math.max(0, Math.min(30, Math.round(Number(b.autoPush?.winbackPromoPercent ?? 10)) || 0)),
    },
  };
}

async function load(): Promise<AppConfigData> {
  try {
    await dbConnect();
    const doc = await AppConfig.findOne({ key: 'main' }).lean<Record<string, any>>();
    return doc ? { ...DEFAULT_APP_CONFIG, ...parseAppConfig(doc) } : DEFAULT_APP_CONFIG;
  } catch {
    return DEFAULT_APP_CONFIG;
  }
}

export const getAppConfig = unstable_cache(load, ['app-config-v1'], { revalidate: 600, tags: ['app-config'] });

/** Те, що бачить застосунок: лише активні баннери */
export function publicAppConfig(c: AppConfigData) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    banners: c.banners.filter((b) => b.enabled && (!b.startsAt || b.startsAt <= today) && (!b.endsAt || b.endsAt >= today)),
    minVersion: c.minVersion,
    latestVersion: c.latestVersion,
    maintenance: c.maintenance,
    whatsNew: c.whatsNew,
  };
}
