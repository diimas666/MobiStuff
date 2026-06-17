import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  SUPPORT_STORE_EMAIL,
  SUPPORT_TEAM_EMAIL,
  SUPPORT_TOPIC_LABELS,
  type SupportTopicId,
} from '@/lib/support';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic ?? '').trim() as SupportTopicId;
    const message = String(body.message ?? '').trim();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const phone = String(body.phone ?? '').trim();

    if (!topic || !(topic in SUPPORT_TOPIC_LABELS)) {
      return NextResponse.json(
        { success: false, error: 'Оберіть тему звернення' },
        { status: 400 },
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Повідомлення занадто коротке' },
        { status: 400 },
      );
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { success: false, error: 'Поштовий сервіс тимчасово недоступний' },
        { status: 503 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const topicLabel = SUPPORT_TOPIC_LABELS[topic];
    const senderLine = [name, email, phone].filter(Boolean).join(' · ') || 'Користувач додатку';
    const safeMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    await transporter.sendMail({
      from: `"MobiStuff App" <${process.env.SMTP_USER}>`,
      to: [SUPPORT_STORE_EMAIL, SUPPORT_TEAM_EMAIL],
      replyTo: email || undefined,
      subject: `[Підтримка] ${topicLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 24px;">
          <div style="max-width: 640px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px;">
            <h2 style="margin: 0 0 12px; color: #111827;">Нове звернення з додатку</h2>
            <p style="margin: 0 0 8px;"><strong>Тема:</strong> ${topicLabel}</p>
            <p style="margin: 0 0 16px;"><strong>Від:</strong> ${senderLine}</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; white-space: pre-wrap; line-height: 1.5;">
              ${safeMessage}
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Support email error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
