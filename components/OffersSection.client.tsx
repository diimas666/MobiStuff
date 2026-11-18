import { Product } from '@/interface/product';
import { getCategoryLink } from '@/lib/getCategoryLink';
import HomeSectionTitle from './HomeSectionTitle';
import ProductShelf from './ProductShelf';

interface OfferSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  compact?: boolean;
  /** @deprecated лишено для сумісності */
  hideLayoutToggle?: boolean;
}

export default function OffersSection({
  title,
  subtitle,
  products,
  categorySlug,
  subcategorySlug,
  compact = false,
}: OfferSectionProps) {
  if (!products || products.length === 0) return null;
  const href = categorySlug && subcategorySlug ? getCategoryLink(categorySlug, subcategorySlug) : undefined;

  return (
    <section>
      {title ? <HomeSectionTitle title={title} subtitle={subtitle} href={href} /> : null}
      <ProductShelf products={products} compact={compact} />
    </section>
  );
}
