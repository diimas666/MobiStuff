// app/api/sendEmail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Если прилетел весь заказ, вытащим нужные поля:
    const to = body.email || body.to;
    const name = body.name || 'Клієнт';
    const total = body.total || 0;

    const subject = 'Підтвердження замовлення';
    const html = `
      <p>Дякуємо, ${name}!</p>
      <p>Ваше замовлення на суму <strong>${total} ₴</strong> прийнято.</p>
      <p>Ми надішлемо його найближчим часом.</p>
    `;

    const data = await resend.emails.send({
      from: 'MobiStuff <info@mobistuff.shop>', // ← используем когда домен верифицируется
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Email send error:', error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
