// app/api/sendEmail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    await resend.emails.send({
      from: 'store@example.com',
      to: body.email,
      subject: 'Підтвердження замовлення',
      html: `<p>Дякуємо, ${body.name}! Ваше замовлення на суму <strong>${body.total} ₴</strong> прийнято.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Email error:', error);
    return NextResponse.json(
      { success: false, error: 'Не вдалося надіслати email' },
      { status: 500 }
    );
  }
}
