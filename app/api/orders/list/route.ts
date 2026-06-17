import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { normalizeOrderStatus } from '@/lib/orderStatus';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import Order from '../../models/Order';

function toMobileOrder(order: Record<string, unknown>) {
  const orderId =
    (typeof order.orderId === 'string' && order.orderId.trim()) ||
    String(order._id ?? '');

  return {
    id: orderId,
    name: typeof order.name === 'string' ? order.name : '',
    lastName: typeof order.lastName === 'string' ? order.lastName : '',
    phone: typeof order.phone === 'string' ? order.phone : '',
    email: typeof order.email === 'string' ? order.email : undefined,
    comment: typeof order.comment === 'string' ? order.comment : undefined,
    paymentMethod:
      typeof order.paymentMethod === 'string' ? order.paymentMethod : 'cod',
    city: typeof order.city === 'string' ? order.city : '',
    cityRef: typeof order.cityRef === 'string' ? order.cityRef : '',
    warehouse: typeof order.warehouse === 'string' ? order.warehouse : '',
    total: typeof order.total === 'number' ? order.total : 0,
    items: Array.isArray(order.items) ? order.items : [],
    createdAt:
      typeof order.createdAt === 'string'
        ? order.createdAt
        : new Date().toISOString(),
    status: normalizeOrderStatus(order.status),
  };
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const phone = normalizeUkrainianPhone(
      typeof body?.phone === 'string' ? body.phone : '',
    );

    if (!phone) {
      return NextResponse.json({ error: 'Невірний номер телефону' }, { status: 400 });
    }

    const phoneVariants = [phone, phone.replace(/^\+/, '')];
    const orders = await Order.find({ phone: { $in: phoneVariants } })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      orders: orders.map(order => toMobileOrder(order as Record<string, unknown>)),
    });
  } catch (error) {
    console.error('❌ orders/list:', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
