import { useEffect, useState } from 'react';
import { api } from '../config/api';

/** Налаштування магазину з адмінки: пороги доставки/оплати, контакти */
export type StoreSettings = {
  freeDeliveryFrom: number;
  cardOnlyFrom: number;
  phone: string;
  email: string;
  instagram: string;
  telegram: string;
  workingHours: string;
  /** Реквізити для оплати карткою з адмінки */
  cardPaymentDetails: string;
};

const FALLBACK: StoreSettings = {
  freeDeliveryFrom: 2500,
  cardOnlyFrom: 4000,
  phone: '',
  email: 'mobistuffinfo@gmail.com',
  instagram: '',
  telegram: '',
  workingHours: '',
  cardPaymentDetails: '',
};

let cache: StoreSettings | null = null;
let inflight: Promise<StoreSettings> | null = null;

function load(): Promise<StoreSettings> {
  if (cache) return Promise.resolve(cache);
  inflight ??= api
    .settings()
    .then(r => (r.ok ? r.json() : null))
    .then((d: Partial<StoreSettings> | null) => {
      cache = { ...FALLBACK, ...(d ?? {}) };
      return cache;
    })
    .catch(() => FALLBACK)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useStoreSettings(): StoreSettings {
  const [s, setS] = useState<StoreSettings>(cache ?? FALLBACK);
  useEffect(() => {
    let alive = true;
    void load().then(v => alive && setS(v));
    return () => {
      alive = false;
    };
  }, []);
  return s;
}
