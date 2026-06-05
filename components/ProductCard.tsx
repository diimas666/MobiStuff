'use client';

import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/interface/product';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { stripHtml } from '@/lib/htmlUtils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const productId = product._id || product.id;
  const isFavorite = favorites.includes(productId);
  const imageSrc = (product.image ?? '').replace(/"/g, '').trim();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: imageSrc,
    });
  };

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden shadow-md hover:border-green-500 transition-all duration-300 h-full">
      <Link href={`/product/${product.handle}`} className="flex flex-col flex-1">
        <div className="relative w-full aspect-[4/4] bg-gray-100">
          {imageSrc && (
            <ProductImage
              src={imageSrc}
              alt={product.title}
              fill
              className="object-cover rounded-t-xl"
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 280px"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          )}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              Новинка
            </span>
          )}
          {product.discountPercent && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        <div className="p-3 sm:p-4 pb-2 bg-gray-800 text-white flex-1 min-h-[110px] sm:min-h-[160px]">
          <h3 className="text-sm sm:text-lg font-semibold line-clamp-2 mb-1">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-300 mb-2 line-clamp-3">
              {stripHtml(product.description)}
            </p>
          )}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2 text-sm text-yellow-500">
              {'★'.repeat(Math.round(product.rating))}
              <span className="ml-1 text-gray-500">
                ({product.reviewsCount ?? 0})
              </span>
            </div>
          )}
          {product.brand && (
            <div className="flex gap-1 font-medium mb-2">
              Бренд : {product.brand}
            </div>
          )}
          {!product.inStock && (
            <span className="text-xs text-red-500">Нет в наличии</span>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 pb-3 sm:pb-4 pt-1 bg-gray-800">
        <div className="flex flex-col min-w-0 text-white">
          <span className="text-base sm:text-xl font-bold text-green-500">
            {product.price} грн
          </span>
          {product.oldPrice && (
            <span className="text-sm line-through text-green-500">
              {product.oldPrice} грн
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => toggleFavorite(productId)}
            className={`button-block-card hover:bg-green-500 ${
              isFavorite ? 'bg-green-500 text-white' : ''
            }`}
            title={isFavorite ? 'Прибрати з обраного' : 'Додати в обране'}
          >
            <Heart className="glass-icon-svg" />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className="button-block-card hover:bg-green-500 disabled:opacity-50"
            disabled={!product.inStock}
            title={!product.inStock ? 'Немає в наявності' : 'Додати в кошик'}
          >
            <ShoppingCart className="glass-icon-svg" />
          </button>
        </div>
      </div>
    </div>
  );
}
