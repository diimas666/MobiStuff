import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../models/Order';
import { buildOrderFromPayload, notifyTelegram, OrderValidationError } from '@/lib/orders';
import { createOrderAccessToken } from '@/lib/orderAccess';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ message: 'Некоректні дані' }, { status: 400 });
    }

    await dbConnect();
    const order = await buildOrderFromPayload(raw as Record<string, unknown>);

    // Захист від подвійного натискання: те саме замовлення не створюємо двічі
    const existing = await Order.findOne({ orderId: order.orderId, phone: order.phone }).select('_id').lean();
    if (!existing) {
      await Order.create(order);
      await notifyTelegram(order);
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      total: order.total,
      paymentMethod: order.paymentMethod,
      // Ключ для перегляду історії замовлень цього номера (мобільний застосунок)
      ordersToken: createOrderAccessToken(order.phone),
    });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error('❌ Checkout error:', error);
    return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
  }
}
