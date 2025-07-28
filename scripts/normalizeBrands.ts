// scripts/normalizeBrands.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../app/api/models/Product';
import { brands } from '../data/brands'; // 👈 Путь без @ для Node.js

dotenv.config();

async function normalizeBrands() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error(
        '❌ ENV-переменная MONGODB_URI не найдена. Проверь файл .env.'
      );
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Подключено к MongoDB');

    const validHandles = brands.map((b) => b.handle);
    const products = await Product.find({ brand: { $exists: true } });

    let updated = 0;

    for (const product of products) {
      const originalBrand = product.brand;
      if (!originalBrand) continue;

      const normalized = originalBrand.toLowerCase();

      if (!validHandles.includes(normalized)) {
        console.warn(
          `⛔ Пропущен: "${product.title}" — бренд "${originalBrand}" отсутствует в списке brands`
        );
        continue;
      }

      if (product.brand !== normalized) {
        product.brand = normalized;
        await product.save();
        updated++;
        console.log(`🔁 Обновлён: "${product.title}" → brand: "${normalized}"`);
      }
    }

    console.log(`\n🎉 Готово! Обновлено товаров: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка выполнения:', err);
    process.exit(1);
  }
}

normalizeBrands();
