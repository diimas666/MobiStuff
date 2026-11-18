import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { catalogCategory } from '@/data/catalogCategory';
import { absoluteUrl, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import { stripHtml } from '@/lib/htmlUtils';
import { FREE_DELIVERY_FROM } from '@/data/storePolicies';

/**
 * Товарний фід (Google Merchant Center / Meta Commerce Manager / TikTok Catalog).
 * Підключіть URL /feed/products.xml у рекламному кабінеті — і запускайте
 * динамічну рекламу та таргет на конкретні товари або набори товарів.
 * Фільтри: ?category=<slug>  ?brand=<назва>  ?label=hits|sale|new
 */
export const revalidate = 3600;

const abs = (src: string) => (src.startsWith('/') ? absoluteUrl(src) : src);

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // прибираємо керівні символи, недопустимі в XML
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const filter: Record<string, unknown> = {};
  const category = sp.get('category');
  const brand = sp.get('brand');
  const label = sp.get('label');
  if (category) filter.categorySlug = category;
  if (brand) filter.brand = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (label === 'hits') filter.isTrending = true;
  if (label === 'new') filter.isNew = true;
  if (label === 'sale') filter.oldPrice = { $gt: 0 };

  await dbConnect();
  const products = await Product.find(filter).lean<Record<string, any>[]>();
  const catTitle = new Map(catalogCategory.map((c) => [c.slug, c.title]));
  const subTitle = new Map(catalogCategory.flatMap((c) => c.subcategories.map((s) => [s.slug, s.title] as const)));

  const items = products
    .filter((p) => p.image && p.price > 0)
    .map((p) => {
      const id = String(p._id);
      const onSale = p.oldPrice && p.oldPrice > p.price;
      const description = stripHtml(p.description || '').slice(0, 4900) || p.title;
      const extra = (p.images || []).filter((i: string) => i && i !== p.image).slice(0, 10);
      const productType = [catTitle.get(p.categorySlug), subTitle.get(p.subcategorySlug)].filter(Boolean).join(' > ');
      const labels = [p.isTrending && 'hits', p.isNew && 'new', onSale && 'sale', p.isFeatured && 'featured'].filter(Boolean);
      return `  <item>
    <g:id>${esc(id)}</g:id>
    <g:title>${esc(p.title).slice(0, 150)}</g:title>
    <g:description>${esc(description)}</g:description>
    <g:link>${esc(absoluteUrl(`/product/${encodeURIComponent(p.handle)}?utm_source=feed&utm_medium=cpc&utm_campaign=catalog`))}</g:link>
    <g:image_link>${esc(abs(p.image))}</g:image_link>
${extra.map((i: string) => `    <g:additional_image_link>${esc(abs(i))}</g:additional_image_link>`).join('\n')}
    <g:availability>${p.inStock === false ? 'out_of_stock' : 'in_stock'}</g:availability>
    <g:condition>new</g:condition>
    <g:price>${esc(onSale ? p.oldPrice : p.price)}.00 UAH</g:price>
${onSale ? `    <g:sale_price>${esc(p.price)}.00 UAH</g:sale_price>\n` : ''}    <g:brand>${esc(p.brand || SITE_NAME)}</g:brand>
    <g:identifier_exists>no</g:identifier_exists>
${productType ? `    <g:product_type>${esc(productType)}</g:product_type>\n` : ''}${labels.map((l, i) => `    <g:custom_label_${i}>${l}</g:custom_label_${i}>`).join('\n')}
    <g:shipping><g:country>UA</g:country><g:service>Нова Пошта</g:service><g:price>${p.price >= FREE_DELIVERY_FROM ? '0' : '80'}.00 UAH</g:price></g:shipping>
  </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${esc(SITE_NAME)}</title>
  <link>${esc(absoluteUrl('/'))}</link>
  <description>${esc(SITE_DESCRIPTION)}</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
