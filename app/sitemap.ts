import type { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { catalogCategory } from '@/data/catalogCategory';
import { brands } from '@/data/brands';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ['/', '/catalog', '/sale', '/delivery', '/returns', '/about', '/contacts', '/privacy'].map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === '/' || path === '/sale' ? ('daily' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : path === '/catalog' || path === '/sale' ? 0.8 : 0.3,
    })
  );

  const categories = catalogCategory.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      url: absoluteUrl(`/category/${cat.slug}/${sub.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  );

  const brandPages = brands.map((b) => ({
    url: absoluteUrl(`/brand/${b.handle}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  let products: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    const docs = await Product.find({}).select('handle image updatedAt').lean<{ handle: string; image?: string; updatedAt?: Date }[]>();
    products = docs.map((p) => ({
      url: absoluteUrl(`/product/${encodeURIComponent(p.handle)}`),
      lastModified: p.updatedAt ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      ...(p.image ? { images: [p.image.startsWith('/') ? absoluteUrl(p.image) : p.image] } : {}),
    }));
  } catch (e) {
    console.error('sitemap: products unavailable', e);
  }

  return [...staticPages, ...categories, ...brandPages, ...products];
}
