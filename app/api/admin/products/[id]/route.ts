import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { parseProductInput, ProductInputError } from '@/lib/adminProduct';
import { revalidateStore } from '@/lib/revalidateStore';

/** Поля, які синхронізація з постачальником не чіпає після ручної зміни */
const PROTECTED = ['title', 'description', 'image', 'images', 'brand', 'categorySlug', 'isNew', 'tags'];

type Ctx = { params: Promise<{ id: string }> };

const ADMIN_FIELDS = '+manualFields +mmaKey +mmaSlug +mmaSourcePrice +priceManuallyEdited +lastSyncedAt';

/** Один товар для форми редагування */
export async function GET(req: Request, { params }: Ctx) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
  await dbConnect();
  const product = await Product.findById(id).select(ADMIN_FIELDS).lean();
  if (!product) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
  return NextResponse.json({ product });
}

/** Повне редагування товару: назва, опис, фото, ціни, категорія, позначки */
export async function PUT(req: Request, { params }: Ctx) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 });

  try {
    const { set, unset } = parseProductInput(body, 'update');
    await dbConnect();
    const existing = await Product.findById(id)
      .select('price oldPrice ' + PROTECTED.join(' '))
      .lean<{ price: number; oldPrice?: number } & Record<string, unknown>>();
    if (!existing) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });

    // Ручна зміна ціни: синхронізація з постачальником її не перезапише
    if ((set.price !== undefined && set.price !== existing.price) || (set.oldPrice ?? null) !== (existing.oldPrice ?? null)) {
      set.priceManuallyEdited = true;
    }

    // Запамʼятовуємо, що змінено вручну, — синхронізація з MMA цього не перезапише
    const norm = (x: unknown) => (x == null || x === '' || (Array.isArray(x) && !x.length) ? null : x);
    const changed = PROTECTED.filter((k) => set[k] !== undefined && JSON.stringify(norm(set[k])) !== JSON.stringify(norm(existing[k])));

    const update: Record<string, unknown> = { $set: set };
    if (changed.length) update.$addToSet = { manualFields: { $each: changed } };
    if (Object.keys(unset).length) update.$unset = unset;
    const product = await Product.findByIdAndUpdate(id, update, { new: true }).select(ADMIN_FIELDS).lean();
    revalidateStore();
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('PUT /api/admin/products/[id] failed:', error);
    return NextResponse.json({ error: 'Не вдалося зберегти товар' }, { status: 500 });
  }
}
