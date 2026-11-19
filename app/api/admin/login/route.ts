import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_TTL,
  checkAdminAuth,
  createSessionToken,
  LINK_SESSION_TTL,
  verifyLoginLink,
  loginRateLimited,
  sessionCookie,
  verifyPassword,
} from '@/lib/adminAuth';

/** Перевірка поточної сесії; з ?link=… — вхід за одноразовим посиланням */
export async function GET(req: Request) {
  const link = new URL(req.url).searchParams.get('link');
  if (link !== null) {
    if (loginRateLimited(req) || !verifyLoginLink(link)) {
      return NextResponse.redirect(new URL('/admin?link=expired', req.url));
    }
    const res = NextResponse.redirect(new URL('/admin/orders', req.url));
    res.headers.set('Set-Cookie', sessionCookie(createSessionToken(LINK_SESSION_TTL), LINK_SESSION_TTL));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  return NextResponse.json({ ok: checkAdminAuth(req) }, { status: checkAdminAuth(req) ? 200 : 401 });
}

/** Вхід */
export async function POST(req: Request) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'ADMIN_SECRET не налаштовано на сервері' }, { status: 500 });
  }

  if (loginRateLimited(req)) {
    return NextResponse.json({ error: 'Забагато спроб. Спробуйте через 15 хвилин.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  // Невелика затримка ускладнює перебір пароля
  await new Promise((r) => setTimeout(r, 400));

  if (!verifyPassword(body?.password)) {
    return NextResponse.json({ error: 'Неправильний пароль' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', sessionCookie(createSessionToken(), ADMIN_SESSION_TTL));
  return res;
}

/** Вихід */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', sessionCookie('', 0));
  return res;
}
