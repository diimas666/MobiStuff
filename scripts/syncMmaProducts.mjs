import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { MmaClient, mapAvailability } from './lib/mma/client.mjs';
import { mapCategories } from './lib/mma/categoryMap.mjs';
import { applyMarkup, getMarkupPercent } from './lib/mma/pricing.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });
dotenv.config({ path: path.join(rootDir, '.env') });

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    images: [String],
    price: Number,
    oldPrice: Number,
    discountPercent: Number,
    inStock: Boolean,
    isNew: Boolean,
    isFeatured: Boolean,
    handle: { type: String, unique: true },
    category: String,
    categorySlug: String,
    subcategorySlug: String,
    brand: String,
    rating: Number,
    isTrending: Boolean,
    reviewsCount: Number,
    variants: [String],
    tags: [String],
    mmaKey: { type: String, unique: true, sparse: true },
    mmaSlug: String,
    mmaSourcePrice: Number,
    priceManuallyEdited: { type: Boolean, default: false },
    lastSyncedAt: Date,
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

const Product =
  mongoose.models.SyncProduct ||
  mongoose.model('SyncProduct', ProductSchema, 'products');

const DETAIL_CONCURRENCY = 12;

async function runPool(items, worker, concurrency) {
  const results = [];
  let index = 0;

  async function workerLoop() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, workerLoop)
  );
  return results;
}

function buildProductDoc(listing, details, client) {
  const breadcrumbs = details?.category?.breadcrumbs || [];
  const slug = details?.translation?.slug || listing.translation?.slug;
  const title = details?.translation?.name || listing.translation?.name;
  const { category, categorySlug, subcategorySlug } = mapCategories(breadcrumbs, title);
  const description = details?.translation?.description || '';
  const sourcePrice =
    listing.productVariantInfo?.price?.minValue ||
    details?.recommendedRetailPrice ||
    0;
  const sourceOldPrice = listing.productVariantInfo?.price?.minOldValue || null;

  const images = [
    ...client.pickAllImageUrls(details?.images || []),
    ...client.pickAllImageUrls(listing.images?.data || listing.images || []),
  ].filter((url, i, arr) => url && arr.indexOf(url) === i);

  const image = images[0] || '';

  const retailPrice = applyMarkup(sourcePrice, {
    categorySlug,
    subcategorySlug,
    breadcrumbs,
    title,
  });
  const retailOldPrice = sourceOldPrice
    ? applyMarkup(sourceOldPrice, {
        categorySlug,
        subcategorySlug,
        breadcrumbs,
        title,
      })
    : undefined;

  const brand = details?.brand?.translation?.seoTitle || undefined;
  const availability =
    details?.availabilityStatus || listing.availabilityStatus;

  return {
    mmaKey: details?.key || listing.key,
    mmaSlug: slug,
    title,
    description,
    image,
    images,
    mmaSourcePrice: sourcePrice > 0 ? sourcePrice : undefined,
    price: retailPrice,
    oldPrice: retailOldPrice,
    inStock: mapAvailability(availability),
    handle: slug,
    category,
    categorySlug,
    subcategorySlug,
    brand,
    isNew: listing.novelty || false,
    tags: [brand, category].filter(Boolean),
    lastSyncedAt: new Date(),
  };
}

async function upsertProduct(doc) {
  const existing = await Product.findOne({ mmaKey: doc.mmaKey });

  if (!existing) {
    if (!doc.price) {
      doc.price = 1;
      console.warn(
        `⚠️  ${doc.mmaKey}: цена неизвестна (добавьте MMA_LOGIN в .env.local)`
      );
    }

    await Product.create(doc);
    return { action: 'created' };
  }

  const update = {
    title: doc.title,
    description: doc.description,
    image: doc.image,
    images: doc.images,
    inStock: doc.inStock,
    category: doc.category,
    categorySlug: doc.categorySlug,
    subcategorySlug: doc.subcategorySlug,
    brand: doc.brand,
    mmaSlug: doc.mmaSlug,
    mmaSourcePrice: doc.mmaSourcePrice,
    isNew: doc.isNew,
    tags: doc.tags,
    lastSyncedAt: doc.lastSyncedAt,
  };

  if (!existing.priceManuallyEdited && doc.price) {
    update.price = doc.price;
    update.oldPrice = doc.oldPrice;
  }

  await Product.updateOne({ _id: existing._id }, { $set: update });
  return { action: 'updated' };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI не найден в .env.local');
    process.exit(1);
  }

  const client = new MmaClient({
    login: process.env.MMA_LOGIN,
    password: process.env.MMA_PASSWORD,
    delayMs: Number(process.env.MMA_REQUEST_DELAY_MS || 100),
  });

  const categoryFilter = process.env.MMA_CATEGORY_SLUG;
  const productLimit = Number(process.env.MMA_SYNC_LIMIT || 0);
  const isFullSync = !categoryFilter && productLimit === 0;

  console.log('🔄 Синхронизация ассортимента MMA → MobiStuff');
  console.log(`   Наценка: +40% | кабелі/скло +80% | мишки +50%`);
  console.log(`   Курс USD→UAH: ${process.env.MMA_USD_RATE || 42}`);
  console.log(`   Фото: URL с cdn.mma.ua`);
  console.log(`   Ручные цены в админке не перезаписываются\n`);

  await mongoose.connect(uri);
  await client.authenticate();

  const roots = await client.getRootCategories();
  let categorySlugs = client.collectCategorySlugs(roots);
  if (categoryFilter) {
    categorySlugs = categorySlugs.filter((s) => s === categoryFilter);
  }

  console.log(`📂 Категорий MMA: ${categorySlugs.length}`);

  const productMap = new Map();

  for (const [i, slug] of categorySlugs.entries()) {
    process.stdout.write(
      `\r📦 Категория ${i + 1}/${categorySlugs.length}: ${slug}...`
    );
    try {
      const products = await client.fetchAllCategoryProducts(slug);
      for (const p of products) {
        if (p.key) productMap.set(p.key, p);
      }
    } catch (err) {
      console.warn(`\n⚠️  Ошибка категории ${slug}: ${err.message}`);
    }
  }

  console.log(`\n✅ Уникальных товаров: ${productMap.size}`);

  let listings = [...productMap.values()];
  if (productLimit > 0) listings = listings.slice(0, productLimit);

  const seenKeys = new Set();
  const stats = { created: 0, updated: 0, skipped: 0, errors: 0 };

  await runPool(
    listings,
    async (listing) => {
      try {
        const slug = listing.translation?.slug;
        if (!slug || !listing.key) return;

        const details = await client.fetchProductDetails(slug);
        const doc = buildProductDoc(listing, details, client);
        seenKeys.add(doc.mmaKey);

        const result = await upsertProduct(doc);
        stats[result.action === 'created' ? 'created' : result.action === 'updated' ? 'updated' : 'skipped']++;

        const markup = getMarkupPercent(
          doc.categorySlug,
          doc.subcategorySlug,
          details?.category?.breadcrumbs,
          doc.title
        );
        if (stats.created + stats.updated <= 3) {
          console.log(
            `\n   ${result.action}: ${doc.title.slice(0, 50)} | ${doc.price || '?'} грн (+${markup}%)`
          );
        }
      } catch (err) {
        stats.errors++;
        console.warn(`\n❌ ${listing.key}: ${err.message}`);
      }
    },
    DETAIL_CONCURRENCY
  );

  let stale = { modifiedCount: 0 };
  if (isFullSync && seenKeys.size > 0) {
    stale = await Product.updateMany(
      {
        mmaKey: { $exists: true, $nin: [...seenKeys] },
        priceManuallyEdited: { $ne: true },
      },
      { $set: { inStock: false, lastSyncedAt: new Date() } }
    );
  }

  console.log('\n\n📊 Итог синхронизации:');
  console.log(`   Создано:     ${stats.created}`);
  console.log(`   Обновлено:   ${stats.updated}`);
  console.log(`   Пропущено:   ${stats.skipped}`);
  console.log(`   Ошибок:      ${stats.errors}`);
  console.log(`   Снято с наличия (нет в MMA): ${stale.modifiedCount}`);

  await mongoose.disconnect();
  console.log('\n✅ Готово!');
}

main().catch((err) => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
