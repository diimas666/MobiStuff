import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import { currentCustomerPhone } from '@/lib/customerSession';
import { getBalance } from '@/lib/loyalty';
import { normalizeOrderStatus } from '@/lib/orderStatus';

/** Дані кабінету: замовлення і бали (лише після входу кодом) */
export async function GET() {
  const phone = await currentCustomerPhone();
  if (!phone) return NextResponse.json({ loggedIn: false }, { headers: { 'Cache-Control': 'no-store' } });
  await dbConnect();
  const orders = await Order.find({ phone: { $in: [phone, phone.slice(1)] } })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('orderId status total items createdAt city warehouse ttn paymentMethod promo pointsUsed')
    .lean<Record<string, any>[]>();
  const loyalty = await getBalance(phone);
  return NextResponse.json(
    {
      loggedIn: true,
      phone,
      balance: loyalty.balance,
      history: loyalty.history,
      orders: orders.map((o) => ({ ...o, _id: undefined, status: normalizeOrderStatus(o.status) })),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
