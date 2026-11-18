'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ProductImage from '@/components/ProductImage';
import { Check, Heart, Plus } from 'lucide-react';
import { Product } from '@/interface/product';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { trackAddToWishlist } from '@/lib/analytics';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  compact?: boolean;
}

export default function ProductCard({ product, priority = false, compact = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const productId = product._id || product.id;
  const isFavorite = favorites.includes(productId);
  const imageSrc = (product.image ?? '').replace(/"/g, '').trim();
  const inStock = product.inStock !== false;
  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const href = `/product/${product.handle}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, image: imageSrc });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFavorite) trackAddToWishlist(product);
    toggleFavorite(productId);
  };

  return (
    <article className="tile tile-hover group relative flex h-full w-full flex-col overflow-hidden">
      <div className="relative aspect-square shrink-0">
        <Link href={href} className={`absolute inset-0 block ${compact ? 'p-4' : 'p-5 sm:p-7'}`} tabIndex={-1}>
          {imageSrc && (
            <div className="relative h-full w-full">
              <ProductImage
                src={imageSrc}
                alt={product.title}
                fill
                className="object-contain transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
              />
            </div>
          )}
        </Link>

        {product.discountPercent ? (
          <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-sale px-2 py-0.5 text-[12px] font-semibold text-white">
            −{product.discountPercent}%
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Прибрати з обраного' : 'Додати в обране'}
          className={`absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            isFavorite ? 'text-sale' : 'text-ink-3 hover:bg-canvas hover:text-ink'
          }`}
        >
          <Heart key={String(isFavorite)} className={`h-[18px] w-[18px] ${isFavorite ? 'pop fill-current' : ''}`} />
        </button>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? 'px-3.5 pb-3.5' : 'px-4 pb-4 sm:px-5 sm:pb-5'}`}>
        <div className="mb-1 flex min-h-[18px] items-center gap-2 text-[12px] font-medium">
          {product.isNew ? <span className="text-new">Новинка</span> : null}
          {!product.isNew && product.isTrending ? <span className="text-new">Хіт продажу</span> : null}
          {!product.isNew && !product.isTrending && product.brand ? (
            <span className="truncate text-ink-3">{product.brand}</span>
          ) : null}
        </div>

        <Link href={href} className="flex-1">
          <h3
            className={`line-clamp-2 font-medium leading-snug text-ink ${
              compact ? 'text-[13px]' : 'text-[14px] sm:text-[15px]'
            }`}
          >
            {product.title}
          </h3>
        </Link>

        {!compact && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                !inStock ? 'bg-ink-3' : product.lowStock ? 'bg-amber-500' : 'bg-accent-bright'
              }`}
            />
            {!inStock ? 'Немає в наявності' : product.lowStock ? 'Закінчується' : 'В наявності'}
          </p>
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0 leading-tight">
            <p className={`font-semibold tracking-tight text-ink ${compact ? 'text-[15px]' : 'text-[17px] sm:text-[19px]'}`}>
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-[12px] text-ink-3 line-through">{formatPrice(product.oldPrice)}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label={added ? 'Додано в кошик' : 'Додати в кошик'}
            className={`btn h-10 shrink-0 text-[13px] text-white ${
              added ? 'bg-ink' : 'bg-accent hover:bg-accent-hover'
            } ${compact ? 'w-10 px-0' : 'w-10 px-0 sm:w-auto sm:px-4'}`}
          >
            {added ? (
              <Check key="ok" className="pop h-[18px] w-[18px]" strokeWidth={2.5} />
            ) : (
              <Plus className="h-[18px] w-[18px]" strokeWidth={2.25} />
            )}
            {!compact && <span className="hidden sm:inline">{added ? 'Додано' : 'Купити'}</span>}
          </button>
        </div>
      </div>
    </article>
  );
}
