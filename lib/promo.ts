import 'server-only';
import dbConnect from '@/lib/dbConnect';
import PromoCode from '@/app/api/models/PromoCode';

export class PromoError extends Error {}

export type PromoDoc = {
  _id: unknown;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minTotal?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: Date;
  active?: boolean;
};

export const normalizeCode = (v: unknown) =>
  typeof v === 'string' ? v.trim().toUpperCase().replace(/[^A-Z0-9А-ЯІЇЄҐ_-]/g, '').slice(0, 30) : '';

/** Розмір знижки для суми (не більше самої суми) */
export function discountFor(p: PromoDoc, subtotal: number) {
  const raw = p.type === 'percent' ? Math.round((subtotal * Math.min(90, Math.max(0, p.value))) / 100) : Math.round(p.value);
  return Math.max(0, Math.min(raw, subtotal));
}

/** Перевіряє код для суми кошика; кидає PromoError з поясненням для покупця */
export async function checkPromo(codeInput: unknown, subtotal: number) {
  const code = normalizeCode(codeInput);
  if (!code) throw new PromoError('Введіть промокод');
  await dbConnect();
  const p = await PromoCode.findOne({ code }).lean<PromoDoc>();
  if (!p || !p.active) throw new PromoError('Такого промокоду немає');
  if (p.expiresAt && new Date(p.expiresAt) < new Date()) throw new PromoError('Термін дії промокоду минув');
  if (p.maxUses && (p.usedCount ?? 0) >= p.maxUses) throw new PromoError('Промокод вже використано');
  if (p.minTotal && subtotal < p.minTotal) throw new PromoError(`Промокод діє для замовлень від ${p.minTotal} грн`);
  const discount = discountFor(p, subtotal);
  return {
    code,
    discount,
    label: p.type === 'percent' ? `−${p.value}%` : `−${p.value} грн`,
  };
}

/** Позначити використання (атомарно, з урахуванням ліміту) */
export async function consumePromo(code: string) {
  await dbConnect();
  await PromoCode.updateOne(
    { code, $or: [{ maxUses: 0 }, { maxUses: { $exists: false } }, { $expr: { $lt: ['$usedCount', '$maxUses'] } }] },
    { $inc: { usedCount: 1 } }
  );
}
