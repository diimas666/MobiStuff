import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyMarkup, getMarkupPercent, loadUsdRate } from './lib/mma/pricing.mjs';
import { isGlassCategory } from './lib/mma/categoryMap.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });
dotenv.config({ path: path.join(rootDir, '.env') });

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
    oldPrice: Number,
    categorySlug: String,
    subcategorySlug: String,
    mmaSourcePrice: Number,
    mmaSourceCurrency: String,
    priceManuallyEdited: { type: Boolean, default: false },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

const Product =
  mongoose.models.RecalcProduct ||
  mongoose.model('RecalcProduct', ProductSchema, 'products');

async function main() {
  const uri = process.env.SYNC_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI не найден в .env.local');
    process.exit(1);
  }

  const onlyGlass = process.env.MMA_RECALC_GLASS === '1';

  const { rate, source } = await loadUsdRate();
  console.log(`💱 Курс $: ${rate} ₴ (${source})`);
  await mongoose.connect(uri);

  const filter = {
    priceManuallyEdited: { $ne: true },
    mmaSourcePrice: { $gt: 0 },
  };

  if (onlyGlass) {
    filter.$or = [
      { subcategorySlug: 'category-zashtitnie-stekla' },
      { categorySlug: 'category-zashtita-ekrana' },
    ];
  }

  const products = await Product.find(filter).select(
    'title price oldPrice categorySlug subcategorySlug mmaSourcePrice mmaSourceCurrency priceManuallyEdited'
  );

  let updated = 0;
  let skippedManual = 0;
  let unchanged = 0;
  let skippedLegacy = 0;

  for (const product of products) {
    if (onlyGlass) {
      const isGlass = isGlassCategory(
        product.categorySlug,
        product.subcategorySlug,
        [],
        product.title
      );
      if (!isGlass) continue;
    }

    const context = {
      categorySlug: product.categorySlug,
      subcategorySlug: product.subcategorySlug,
      breadcrumbs: [],
      title: product.title,
    };

    // Без позначки валюти (записи до виправлення) не перераховуємо — невідомо,
    // долари там чи гривні. Повна синхронизація (npm run sync-mma) оновить їх.
    if (!product.mmaSourceCurrency) {
      skippedLegacy++;
      continue;
    }
    const newPrice = applyMarkup(product.mmaSourcePrice, context, product.mmaSourceCurrency);
    if (!newPrice) continue;

    if (newPrice === product.price) {
      unchanged++;
      continue;
    }

    const markup = getMarkupPercent(
      product.categorySlug,
      product.subcategorySlug,
      [],
      product.title
    );

    await Product.updateOne({ _id: product._id }, { $set: { price: newPrice } });
    updated++;
    console.log(
      `✓ ${product.title.slice(0, 55)} | ${product.price} → ${newPrice} грн (+${markup}%)`
    );
  }

  console.log('\n📊 Пересчёт цен:');
  console.log(`   Обновлено:    ${updated}`);
  console.log(`   Без изменений: ${unchanged}`);
  console.log(`   Пропущено (ручная цена): ${skippedManual}`);
  console.log(`   Пропущено (стара ціна без валюти — оновить sync-mma): ${skippedLegacy}`);
  console.log(
    onlyGlass
      ? '   Режим: только захисне скло (+80%)'
      : '   Режим: все товары по правилам наценки'
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
