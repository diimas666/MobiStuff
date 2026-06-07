import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET не налаштовано на сервері' },
      { status: 500 }
    );
  }

  const { password } = await req.json();

  if (password === secret) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Неправильний пароль' }, { status: 401 });
}
