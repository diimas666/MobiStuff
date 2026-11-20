'use client';

import { createContext, useContext } from 'react';
import { CARD_ONLY_FROM, FREE_DELIVERY_FROM } from '@/data/storePolicies';

export type PublicStoreSettings = {
  phone: string;
  email: string;
  instagram: string;
  telegram: string;
  viber: string;
  workingHours: string;
  freeDeliveryFrom: number;
  cardOnlyFrom: number;
  announcement: { enabled: boolean; text: string; link: string };
  saleEndsAt?: string;
  cashbackPercent?: number;
  maxPointsPercent?: number;
};

const FALLBACK: PublicStoreSettings = {
  phone: '',
  email: 'mobistuffinfo@gmail.com',
  instagram: '',
  telegram: '',
  viber: '',
  workingHours: '',
  freeDeliveryFrom: FREE_DELIVERY_FROM,
  cardOnlyFrom: CARD_ONLY_FROM,
  announcement: { enabled: false, text: '', link: '' },
};

const Ctx = createContext<PublicStoreSettings>(FALLBACK);

export function StoreSettingsProvider({ value, children }: { value: PublicStoreSettings; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Налаштування магазину з адмінки (пороги оплати/доставки, контакти) */
export const useStoreSettings = () => useContext(Ctx);
