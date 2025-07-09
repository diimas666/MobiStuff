import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"MobiStuff" <${process.env.SMTP_USER}>`,
      to: body.email,
      subject: 'Підтвердження замовлення',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #10b981;">Дякуємо за замовлення, ${body.name}!</h2>
          <p>Ваше замовлення на суму <strong>${body.total} ₴</strong> прийняте.</p>

          <table style="width: 100%; margin-top: 20px; font-size: 14px;">
            <tr><td><strong>Місто:</strong></td><td>${body.city}</td></tr>
            <tr><td><strong>Відділення:</strong></td><td>${body.warehouse}</td></tr>
            <tr><td><strong>Оплата:</strong></td><td>${body.paymentMethod === 'card' ? 'Карткою' : 'При отриманні'}</td></tr>
            <tr><td><strong>Телефон:</strong></td><td>${body.phone}</td></tr>
            ${
              body.comment
                ? `<tr><td><strong>Коментар:</strong></td><td>${body.comment}</td></tr>`
                : ''
            }
          </table>

          <p style="margin-top: 30px; font-size: 13px; color: #6b7280;">
            З повагою, команда <strong>MobiStuff</strong><br/>mobistuff.shop
          </p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ SMTP помилка:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
