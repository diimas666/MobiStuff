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
    <div div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #10b981;">Дякуємо за замовлення, ${name}!</h2>

    <p>Ваше замовлення на суму <strong>${total} ₴</strong> було успішно прийняте.</p>

    <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 6px; margin: 20px 0;">
      <p><strong>Місто:</strong> ${body.city}</p>
      <p><strong>Відділення:</strong> ${body.warehouse}</p>
      <p><strong>Оплата:</strong> ${body.paymentMethod === 'card' ? 'Карткою' : 'При отриманні'}</p>
      <p><strong>Телефон:</strong> ${body.phone}</p>
      ${body.comment ? `<p><strong>Коментар:</strong> ${body.comment}</p>` : ''}
    </div>

    <p>Ми зв'яжемося з вами найближчим часом.</p>

    <p style="font-size: 14px; color: #6b7280;">З повагою, команда MobiStuff<br/>mobistuff.shop</p>
  </div>
`;

    const data = await resend.emails.send({
      from: 'MobiStuff <info@mobistuff.shop>', // ← используем когда домен верифицируется
      // from: 'MobiStuff <onboarding@resend.dev>', // ⚠️ тимчасово
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
