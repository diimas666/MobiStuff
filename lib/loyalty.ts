import 'server-only';
import dbConnect from '@/lib/dbConnect';
import Loyalty from '@/app/api/models/Loyalty';
import Order from '@/app/api/models/Order';
import { getStoreSettings } from '@/lib/storeSettings';

export async function getBalance(phone: string): Promise<{ balance: number; history: { at: Date; delta: number; reason: string; orderId?: string }[] }> {
  await dbConnect();
  const l = await Loyalty.findOne({ phone }).lean<{ balance: number; history: { at: Date; delta: number; reason: string; orderId?: string }[] }>();
  return { balance: l?.balance ?? 0, history: (l?.history ?? []).slice(-30).reverse() };
}

/** Скільки балів можна списати з цієї суми */
export async function maxRedeemable(phone: string, subtotal: number) {
  const s = await getStoreSettings();
  const { balance } = await getBalance(phone);
  return Math.max(0, Math.min(balance, Math.floor((subtotal * (s.maxPointsPercent ?? 30)) / 100)));
}

/** Атомарно списати бали (false — не вистачає) */
export async function spendPoints(phone: string, amount: number, orderId: string) {
  if (amount <= 0) return true;
  await dbConnect();
  const r = await Loyalty.updateOne(
    { phone, balance: { $gte: amount } },
    { $inc: { balance: -amount }, $push: { history: { delta: -amount, reason: 'Оплата балами', orderId, at: new Date() } } }
  );
  return r.modifiedCount === 1;
}

/** Нарахувати кешбек за виконане замовлення (один раз) */
export async function awardCashback(orderId: string) {
  const s = await getStoreSettings();
  const pct = s.cashbackPercent ?? 3;
  if (pct <= 0) return 0;
  await dbConnect();
  const order = await Order.findOneAndUpdate(
    { orderId, cashbackAwarded: { $ne: true } },
    { $set: { cashbackAwarded: true } },
    { new: true, strict: false }
  ).lean<{ phone: string; total: number }>();
  if (!order) return 0;
  const points = Math.floor((order.total * pct) / 100);
  if (points <= 0) return 0;
  await Loyalty.updateOne(
    { phone: order.phone },
    { $inc: { balance: points }, $push: { history: { delta: points, reason: `Кешбек ${pct}%`, orderId, at: new Date() } } },
    { upsert: true }
  );
  return points;
}

/** Повернути списані бали, якщо замовлення скасовано */
export async function refundPoints(orderId: string) {
  await dbConnect();
  const order = await Order.findOneAndUpdate(
    { orderId, pointsUsed: { $gt: 0 }, pointsRefunded: { $ne: true } },
    { $set: { pointsRefunded: true } },
    { new: true, strict: false }
  ).lean<{ phone: string; pointsUsed: number }>();
  if (!order) return 0;
  await Loyalty.updateOne(
    { phone: order.phone },
    { $inc: { balance: order.pointsUsed }, $push: { history: { delta: order.pointsUsed, reason: 'Повернення балів (скасоване замовлення)', orderId, at: new Date() } } },
    { upsert: true }
  );
  return order.pointsUsed;
}
