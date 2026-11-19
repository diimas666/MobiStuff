import 'server-only';
import sharp from 'sharp';
import dbConnect from '@/lib/dbConnect';
import MediaAsset from '@/app/api/models/PromotionAsset';

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']);

export class UploadError extends Error {}

/** Відносний шлях до збереженого фото (працює на будь-якому домені) */
export const mediaPath = (id: string) => `/api/media/${id}`;

/**
 * Зберігає фото в базі: повертає орієнтацію, зменшує до maxSide і стискає у WebP.
 * Фото з телефона (HEIC, 10+ МБ) стають легкими ~100–300 КБ.
 */
export async function saveImage(file: File, maxSide = 1600) {
  if (!ALLOWED_TYPES.has(file.type)) throw new UploadError('Дозволені лише фото: JPG, PNG, WebP, AVIF, HEIC');
  if (file.size > MAX_UPLOAD_SIZE) throw new UploadError('Максимальний розмір фото — 8 МБ');

  const input = Buffer.from(await file.arrayBuffer());
  const out = await sharp(input)
    .rotate()
    .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer({ resolveWithObject: true })
    .catch(() => {
      throw new UploadError('Не вдалося обробити фото. Спробуйте JPG або PNG.');
    });

  await dbConnect();
  const asset = await MediaAsset.create({
    mimeType: 'image/webp',
    data: out.data,
    width: out.info.width,
    height: out.info.height,
    size: out.data.length,
  });
  const id = String(asset._id);
  return { assetId: id, url: mediaPath(id), width: out.info.width, height: out.info.height, size: out.data.length };
}
