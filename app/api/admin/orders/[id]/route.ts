import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { applyOrderUpdate, OrderUpdateError } from '@/lib/orderUpdate';

type Ctx = { params: Promise<{ id: string }> };

/**
 * Оновлення замовлення з адмінки: статус, ТТН, примітка менеджера.
 * notify: true — надіслати клієнту ТТН (якщо статус «Відправлено» і ТТН вказано).
 */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Замовлення не знайдено' }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 });

  await dbConnect();
  const order = await Order.findById(id).lean<Record<string, any>>();
  if (!order) return NextResponse.json({ error: 'Замовлення не знайдено' }, { status: 404 });

  try {
    const { saved, notified } = await applyOrderUpdate(order, body);
    return NextResponse.json({ order: saved, notified });
  } catch (e) {
    if (e instanceof OrderUpdateError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
