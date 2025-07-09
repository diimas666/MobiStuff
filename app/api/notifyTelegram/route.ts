import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const order = await req.json();

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

  try {
    const itemsText = order.items
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.title} — ${item.quantity} x ${item.price}₴ = ${
            item.quantity * item.price
          }₴`
      )
      .join('\n');

    const text = `🛒 НОВЕ ЗАМОВЛЕННЯ
      👤 ${order.name} ${order.lastName}
      📞 ${order.phone}
      💬 ${order.comment}
      📍 ${order.city}
      🏤 ${order.warehouse}
      💳 Оплата: ${order.paymentMethod === 'card' ? 'Карткою' : 'Післяплата'}
      💰 Всього: ${order.total} ₴

      🧾 Товари:
      ${itemsText}`;

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
