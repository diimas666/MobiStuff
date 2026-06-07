// app/api/products/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { filterCatalogProducts } from '@/lib/productCategoryRules';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isTrending = searchParams.get('isTrending');
    const onSale = searchParams.get('onSale');
    const sort = searchParams.get('sort');

    const filter: Record<string, unknown> = {};

    if (category) filter.categorySlug = category;
    if (subcategory) filter.subcategorySlug = subcategory;
    if (brand) filter.brand = new RegExp(`^${escapeRegex(brand)}$`, 'i');

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }

    if (isTrending === 'true') filter.isTrending = true;

    if (onSale === 'true') {
      filter.$or = [
        { discountPercent: { $gt: 0 } },
        { $expr: { $and: [{ $gt: ['$oldPrice', '$price'] }, { $gt: ['$oldPrice', 0] }] } },
      ];
    }

    let sortOption: Record<string, 1 | -1> = { title: 1 };
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'title-asc':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { title: 1 };
    }

    const products = await Product.find(filter).sort(sortOption).lean();
    return NextResponse.json(filterCatalogProducts(products, category));
  } catch (error) {
    console.error('❌ Ошибка при получении товаров:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
