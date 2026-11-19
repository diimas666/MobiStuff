import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { parseProductInput, ProductInputError, uniqueHandle } from '@/lib/adminProduct';
import { revalidateStore } from '@/lib/revalidateStore';

/** Повний список товарів для адмінки (з службовими полями MMA) */
export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();
  const products = await Product.find({})
    .select('+mmaKey +mmaSlug +mmaSourcePrice +priceManuallyEdited +lastSyncedAt').sort({ updatedAt: -1 }).lean();
  return NextResponse.json(products);
}

/** Створення товару з форми адмінки */
export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 });

  try {
    const { set } = parseProductInput(body, 'create');
    await dbConnect();
    const handle = await uniqueHandle(String(set.title));
    const created = await Product.create({ ...set, handle, priceManuallyEdited: true });
    revalidateStore();
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('POST /api/admin/products failed:', error);
    return NextResponse.json({ error: 'Не вдалося створити товар' }, { status: 500 });
  }
}
