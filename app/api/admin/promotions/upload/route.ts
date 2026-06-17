import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import dbConnect from '@/lib/dbConnect';
import { checkAdminAuth } from '@/lib/adminAuth';
import PromotionAsset from '@/app/api/models/PromotionAsset';
import { getPromotionMediaUrl } from '@/lib/promotionMedia';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не знайдено' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Дозволені лише JPG, PNG або WebP' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Максимальний розмір файлу — 5 МБ' },
        { status: 400 },
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });

    await dbConnect();

    const asset = await PromotionAsset.create({
      mimeType: 'image/webp',
      data: optimized.data,
      width: optimized.info.width,
      height: optimized.info.height,
      size: optimized.data.length,
    });

    const assetId = String(asset._id);

    return NextResponse.json({
      assetId,
      url: getPromotionMediaUrl(assetId),
      width: optimized.info.width,
      height: optimized.info.height,
      size: optimized.data.length,
    });
  } catch (error: unknown) {
    console.error('POST /api/admin/promotions/upload failed:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
