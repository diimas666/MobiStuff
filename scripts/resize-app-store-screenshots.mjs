import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const INPUT_CANDIDATES = [
  path.join(ROOT, 'app-store-screenshots-source'),
  path.join(
    process.env.HOME ?? '',
    '.cursor/projects/Users-restart-Desktop-sites-mobistuff/assets',
  ),
];

const OUTPUT_BASE = path.join(ROOT, 'apps/mobile/app-store-screenshots');

/** Слоты App Store Connect — загружайте файлы ТОЛЬКО из нужной папки. */
const UPLOAD_SETS = [
  {
    folder: 'UPLOAD-6.9-portrait-1290x2796',
    slot: '6.9" Display — портрет (основной слот, загружайте сюда в первую очередь)',
    width: 1290,
    height: 2796,
    orientation: 'portrait',
  },
  {
    folder: 'UPLOAD-6.5-portrait-1284x2778',
    slot: '6.5" Display — портрет (если нет 6.9")',
    width: 1284,
    height: 2778,
    orientation: 'portrait',
  },
  {
    folder: 'UPLOAD-6.5-portrait-1242x2688',
    slot: '6.5" Display — портрет (альтернатива)',
    width: 1242,
    height: 2688,
    orientation: 'portrait',
  },
  {
    folder: 'UPLOAD-6.5-landscape-2778x1284',
    slot: '6.5" Display — альбом (только если нужен landscape)',
    width: 2778,
    height: 1284,
    orientation: 'landscape',
  },
  {
    folder: 'UPLOAD-6.5-landscape-2688x1242',
    slot: '6.5" Display — альбом (альтернатива)',
    width: 2688,
    height: 1242,
    orientation: 'landscape',
  },
  {
    folder: 'UPLOAD-iPad-13-portrait-2064x2752',
    slot: '13" iPad — портрет (обязательно, приложение поддерживает iPad)',
    width: 2064,
    height: 2752,
    orientation: 'portrait',
  },
];

const LABELS = [
  '01-home',
  '02-product',
  '03-product-details',
  '04-cart',
  '05-favorites',
  '06-profile',
  '07-settings',
  '08-categories',
  '09-category-products',
  '10-filters',
  '11-checkout',
];

const IPAD_BG = { r: 27, g: 67, b: 50, alpha: 1 };

function resolveInputDir() {
  for (const dir of INPUT_CANDIDATES) {
    if (dir && fs.existsSync(dir)) {
      return dir;
    }
  }

  throw new Error(
    'Не найдена папка со скриншотами. Положите PNG в app-store-screenshots-source/',
  );
}

async function exportScreenshot(
  inputPath,
  outputPath,
  width,
  height,
  orientation,
  mode = 'cover',
) {
  let pipeline = sharp(inputPath).rotate();

  if (orientation === 'landscape') {
    pipeline = pipeline.rotate(90);
  }

  pipeline = pipeline.resize(width, height, {
    fit: mode,
    position: 'centre',
    background: IPAD_BG,
    kernel: sharp.kernel.lanczos3,
  });

  await pipeline
    .toColorspace('srgb')
    .png({
      compressionLevel: 9,
      force: true,
      palette: false,
    })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  if (meta.width !== width || meta.height !== height) {
    throw new Error(
      `${outputPath}: expected ${width}x${height}, got ${meta.width}x${meta.height}`,
    );
  }
}

async function main() {
  const inputDir = resolveInputDir();
  const files = fs
    .readdirSync(inputDir)
    .filter(file => file.endsWith('.png') && file.includes('Simulator_Screenshot'))
    .sort();

  if (files.length === 0) {
    throw new Error(`Нет PNG-скриншотов в ${inputDir}`);
  }

  if (fs.existsSync(OUTPUT_BASE)) {
    fs.rmSync(OUTPUT_BASE, { recursive: true, force: true });
  }

  for (const set of UPLOAD_SETS) {
    fs.mkdirSync(path.join(OUTPUT_BASE, set.folder), { recursive: true });
  }

  for (const [index, file] of files.entries()) {
    const label = LABELS[index] ?? `${String(index + 1).padStart(2, '0')}-screen`;
    const inputPath = path.join(inputDir, file);

    for (const set of UPLOAD_SETS) {
      const outputPath = path.join(OUTPUT_BASE, set.folder, `${label}.png`);
      await exportScreenshot(
        inputPath,
        outputPath,
        set.width,
        set.height,
        set.orientation,
        set.folder.includes('iPad') ? 'contain' : 'cover',
      );
    }

    console.log(`✓ ${label}`);
  }

  const readme = `# Скриншоты для App Store Connect

## Важно
- Загружайте файлы **только из одной папки UPLOAD-*** за раз.
- **Портрет** и **альбом** — это разные слоты. Не смешивайте.
- Не загружайте исходники из app-store-screenshots-source/ (473×1024) — App Store их отклонит.

## Куда загружать

### iPhone (выберите ОДИН слот)
1. **UPLOAD-6.9-portrait-1290x2796/** — основной слот «6.9" Display» (рекомендуется)
2. **UPLOAD-6.5-portrait-1284x2778/** — слот «6.5" Display», если нет 6.9"
3. **UPLOAD-6.5-portrait-1242x2688/** — альтернатива для «6.5" Display»

### iPad (обязательно — приложение universal)
4. **UPLOAD-iPad-13-portrait-2064x2752/** — слот «13" Display»

### Landscape (только если нужен)
5. **UPLOAD-6.5-landscape-2778x1284/**
6. **UPLOAD-6.5-landscape-2688x1242/**

## Перегенерация
\`\`\`bash
npm run mobile:screenshots
\`\`\`
`;

  fs.writeFileSync(path.join(OUTPUT_BASE, 'README.md'), readme, 'utf8');

  console.log(`\nГотово: ${files.length} скриншотов`);
  console.log(`Папка: ${OUTPUT_BASE}`);
  console.log('\nЗагружайте в App Store Connect:');
  console.log('  iPhone → UPLOAD-6.9-portrait-1290x2796/');
  console.log('  iPad   → UPLOAD-iPad-13-portrait-2064x2752/');
}

await main();
