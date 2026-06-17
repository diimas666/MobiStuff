import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { checkAdminAuth } from '@/lib/adminAuth';
import Promotion from '@/app/api/models/Promotion';
import PromotionAsset from '@/app/api/models/PromotionAsset';
import PromotionMeta from '@/app/api/models/PromotionMeta';
import { resolvePromotionImageUrl } from '@/lib/promotionMedia';

async function markPromotionsInitialized() {
  await PromotionMeta.findOneAndUpdate(
    {},
    { defaultsSeeded: true },
    { upsert: true, setDefaultsOnInsert: true },
  );
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const promotions = await Promotion.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json({
      promotions: promotions.map(item => ({
        ...item,
        imageUrl: resolvePromotionImageUrl(item),
      })),
    });
  } catch (error: unknown) {
    console.error('GET /api/admin/promotions failed:', error);
    return NextResponse.json({ error: 'Failed to load promotions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const created = await Promotion.create(body);
    await markPromotionsInitialized();
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create promotion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { id, ...patch } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updated = await Promotion.findByIdAndUpdate(id, patch, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...updated,
      imageUrl: resolvePromotionImageUrl(updated),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update promotion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const promotion = await Promotion.findById(id).lean();
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    if (promotion.imageAssetId) {
      await PromotionAsset.findByIdAndDelete(promotion.imageAssetId);
    }

    await Promotion.findByIdAndDelete(id);
    await markPromotionsInitialized();
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete promotion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
