import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMAGES_DIR = 'public/images';

const SIZE_LIMITS = {
  category: 800,
  banner: 1200,
  brand: 400,
  brandFull: 1200,
  default: 1000,
};

function getMaxWidth(filePath) {
  if (filePath.includes('/banners/')) return SIZE_LIMITS.banner;
  if (filePath.includes('/brands/imagesFull/')) return SIZE_LIMITS.brandFull;
  if (filePath.includes('/brands/')) return SIZE_LIMITS.brand;
  return SIZE_LIMITS.category;
}

async function getAllImages(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllImages(fullPath)));
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const before = (await stat(filePath)).size;
  const maxWidth = getMaxWidth(filePath);
  const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  const buffer = await sharp(filePath)
    .resize(maxWidth, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  await sharp(buffer).toFile(webpPath);
  const after = (await stat(webpPath)).size;

  if (after < before) {
    await unlink(filePath);
    console.log(
      `✓ ${basename(filePath)}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (webp)`
    );
    return { saved: before - after };
  }

  await unlink(webpPath);
  const jpegPath = filePath.replace(/\.(png)$/i, '.jpg');
  await sharp(filePath)
    .resize(maxWidth, null, { withoutEnlargement: true, fit: 'inside' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(jpegPath + '.tmp');

  const jpegAfter = (await stat(jpegPath + '.tmp')).size;
  if (jpegAfter < before) {
    await unlink(filePath);
    const { rename } = await import('fs/promises');
    await rename(jpegPath + '.tmp', jpegPath);
    console.log(
      `✓ ${basename(filePath)}: ${(before / 1024).toFixed(0)}KB → ${(jpegAfter / 1024).toFixed(0)}KB (jpeg)`
    );
    return { saved: before - jpegAfter };
  }

  const { unlink: unlinkFs } = await import('fs/promises');
  await unlinkFs(jpegPath + '.tmp');
  console.log(`– ${basename(filePath)}: already optimal`);
  return { saved: 0 };
}

const images = await getAllImages(IMAGES_DIR);
let totalSaved = 0;

console.log(`Optimizing ${images.length} images...\n`);

for (const img of images) {
  const result = await optimizeImage(img);
  totalSaved += result.saved;
}

console.log(`\nTotal saved: ${(totalSaved / 1024 / 1024).toFixed(1)} MB`);
