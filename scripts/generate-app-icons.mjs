import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'apps/mobile/assets/app-icon-source.png');
const BG = '#1B4332';
const PADDING = 0.01;

const isGreen = (r, g, b) => g > 90 && g > r + 25 && g > b + 10;

async function buildMaster(size = 1024) {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rgba = Buffer.alloc(width * height * 4);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const o = (y * width + x) * 4;

      if (isGreen(r, g, b)) {
        rgba[o] = r;
        rgba[o + 1] = g;
        rgba[o + 2] = b;
        rgba[o + 3] = 255;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  const mOnly = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();

  const inner = Math.round(size * (1 - PADDING * 2));
  const resizedM = await sharp(mOnly)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: resizedM, gravity: 'center' }])
    .png()
    .toBuffer();
}

const iosSizes = {
  'Icon-20@2x.png': 40,
  'Icon-20@3x.png': 60,
  'Icon-29@2x.png': 58,
  'Icon-29@3x.png': 87,
  'Icon-40@2x.png': 80,
  'Icon-40@3x.png': 120,
  'Icon-60@2x.png': 120,
  'Icon-60@3x.png': 180,
  'Icon-1024.png': 1024,
  // iPad (required when TARGETED_DEVICE_FAMILY includes iPad)
  'Icon-20~ipad.png': 20,
  'Icon-20~ipad@2x.png': 40,
  'Icon-29~ipad.png': 29,
  'Icon-29~ipad@2x.png': 58,
  'Icon-40~ipad.png': 40,
  'Icon-40~ipad@2x.png': 80,
  'Icon-76~ipad.png': 76,
  'Icon-76~ipad@2x.png': 152,
  'Icon-83.5~ipad@2x.png': 167,
};

const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const master = await buildMaster(1024);

const iosDir = path.join(ROOT, 'apps/mobile/ios/EscapeMobile/Images.xcassets/AppIcon.appiconset');
for (const [file, size] of Object.entries(iosSizes)) {
  await sharp(master).resize(size, size).png().toFile(path.join(iosDir, file));
}

const androidBase = path.join(ROOT, 'apps/mobile/android/app/src/main/res');
for (const [folder, size] of Object.entries(androidSizes)) {
  const dir = path.join(androidBase, folder);
  await sharp(master).resize(size, size).png().toFile(path.join(dir, 'ic_launcher.png'));
  await sharp(master).resize(size, size).png().toFile(path.join(dir, 'ic_launcher_round.png'));
}

await sharp(master).toFile(path.join(ROOT, 'apps/mobile/assets/app-icon-source.png'));

console.log('App icons generated: green M without white block');
