/**
 * Іконки застосунку з apps/mobile/assets/app-icon.svg:
 * iOS AppIcon (усі розміри, без альфа-каналу — вимога App Store),
 * Android mipmap (квадратна і кругла), іконка для сайту.
 *
 *   npm run mobile:icons
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'apps/mobile/assets/app-icon.svg');
const IOS_DIR = path.join(ROOT, 'apps/mobile/ios/EscapeMobile/Images.xcassets/AppIcon.appiconset');
const ANDROID_RES = path.join(ROOT, 'apps/mobile/android/app/src/main/res');

const svg = fs.readFileSync(SRC);
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).flatten({ background: '#1D1D1F' }).png();

// iOS
const contents = JSON.parse(fs.readFileSync(path.join(IOS_DIR, 'Contents.json'), 'utf8'));
for (const img of contents.images) {
  if (!img.filename) continue;
  const px = Math.round(parseFloat(img.size) * parseFloat(img.scale));
  await png(px).toFile(path.join(IOS_DIR, img.filename));
}
console.log(`iOS: ${contents.images.length} іконок`);

// Android
const ANDROID = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [dpi, size] of Object.entries(ANDROID)) {
  const dir = path.join(ANDROID_RES, `mipmap-${dpi}`);
  if (!fs.existsSync(dir)) continue;
  await png(size).toFile(path.join(dir, 'ic_launcher.png'));
  const circle = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
  await png(size).composite([{ input: circle, blend: 'dest-in' }]).toFile(path.join(dir, 'ic_launcher_round.png'));
}
console.log('Android: mipmap оновлено');

// Іконка застосунку для сайту (блок «Завантажте в App Store»)
const mask = Buffer.from('<svg width="256" height="256"><rect width="256" height="256" rx="57" fill="#fff"/></svg>');
await png(256).composite([{ input: mask, blend: 'dest-in' }]).toFile(path.join(ROOT, 'public/images/app-icon.png'));
console.log('Сайт: public/images/app-icon.png');
