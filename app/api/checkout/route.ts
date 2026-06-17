import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../models/Order';
import { normalizeOrderPayload } from '@/lib/normalizeOrderPayload';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const raw = await req.json();
    const order = normalizeOrderPayload(raw);

    const newOrder = new Order(order);
    await newOrder.save();

    // Отправляем в Telegram
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifyTelegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
  }
}
