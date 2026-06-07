import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { filterCatalogProducts } from '@/lib/productCategoryRules';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    if (!category || !subcategory) {
      return NextResponse.json({ error: 'category and subcategory required' }, { status: 400 });
    }

    const products = filterCatalogProducts(
      await Product.find({
        categorySlug: category,
        subcategorySlug: subcategory,
      })
        .select('brand price title')
        .lean(),
      category
    );

    const brands = [
      ...new Set(
        products
          .map((p) => p.brand)
          .filter((b): b is string => Boolean(b && b.trim()))
      ),
    ].sort((a, b) => a.localeCompare(b, 'uk'));

    const prices = products.map((p) => p.price).filter((n) => typeof n === 'number' && n > 0);

    return NextResponse.json({
      brands,
      minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
      maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 5000,
      count: products.length,
    });
  } catch (error) {
    console.error('❌ Ошибка facets:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
