export type ApiProduct = {
  _id: string;
  title: string;
  handle: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  description?: string;
  image?: string;
  images?: string[];
  category?: string;
  categorySlug?: string;
  brand?: string;
  subcategory?: string;
  subcategorySlug?: string;
  inStock?: boolean;
  lowStock?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  variants?: string[];
};

export type ApiCategory = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  category?: string;
  slug?: string;
  categorySlug?: string;
  image?: string;
  images?: string[];
};

export type HomeCategory = {
  id: string;
  title: string;
  image?: string;
};

export type HomeProduct = {
  id: string;
  handle: string;
  title: string;
  price: number;
  image?: string;
};

export type SearchProduct = HomeProduct & {
  description: string;
};

export type ProductDetail = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  image?: string;
  images: string[];
  variants: string[];
  category?: string;
  categorySlug?: string;
  inStock: boolean;
  lowStock: boolean;
  isNew: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  brand?: string;
};

export function formatPrice(value: number) {
  return `${value.toLocaleString('uk-UA')} ₴`;
}

export function mapProduct(product: ApiProduct): HomeProduct {
  return {
    id: product._id,
    handle: product.handle,
    title: product.title,
    price: product.price,
    image: product.image || product.images?.[0],
  };
}

export function extractCategories(
  products: ApiProduct[],
  limit?: number,
): HomeCategory[] {
  const categories = new Map<string, HomeCategory>();

  for (const product of products) {
    if (!product.category || !product.categorySlug) {
      continue;
    }

    if (categories.has(product.categorySlug)) {
      continue;
    }

    categories.set(product.categorySlug, {
      id: product.categorySlug,
      title: product.category,
      image: product.image || product.images?.[0],
    });
  }

  const items = Array.from(categories.values());
  return limit != null ? items.slice(0, limit) : items;
}
