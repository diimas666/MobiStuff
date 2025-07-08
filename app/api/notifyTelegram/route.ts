import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const order = await req.json();

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

  try {
    const text = `🛒 НОВЕ ЗАМОВЛЕННЯ
    👤 ${order.name} ${order.lastName}
    📞 ${order.phone}
    📍 ${order.city}
    🏤 ${order.warehouse}
    💳 Оплата: ${order.paymentMethod === 'card' ? 'Карткою' : 'Післяплата'}
    💰 ${order.total} ₴`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Telegram error:', error);
    return NextResponse.json({ message: 'Помилка Telegram' }, { status: 500 });
  }
}
