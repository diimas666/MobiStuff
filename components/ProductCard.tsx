'use client';

import Link from 'next/link';
// import Image from 'next/image';
import { Heart, ShoppingCart, Scale } from 'lucide-react';
import { Product } from '@/interface/product';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext'; // ✅ Импорт

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites(); // ✅ Используем контекст

  const productId = product._id || product.id;
  const isFavorite = favorites.includes(productId); // ✅ Проверка в контексте

  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: (product.image ?? '').replace(/"/g, '').trim(),
    });
  };

  return (
    <div className="flex flex-col justify-between border rounded-xl overflow-hidden shadow-md hover:border-green-500 transition-all duration-300 relative h-full">
      <Link
        href={`/product/${product.handle}`}
        className=" flex flex-col h-full"
      >
        {/* Верх: картинка */}
        <div className="relative w-full aspect-[4/4] bg-gray-100">
          {/* <Image
            src={(product.image ?? '').replace(/"/g, '')}
            alt={product.title}
            fill
            unoptimized // <== ВАЖНО
            className="object-cover rounded-t-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          /> */}
          <img
            src={(product.image ?? '').replace(/"/g, '')}
            alt={product.title}
            className="object-cover rounded-t-xl w-full h-full"
          />
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

        {/* Низ: текстовая часть */}
        {/* 280 меняе смотрим когда как  */}
        <div className="p-4 bg-gray-800 text-white flex flex-col justify-between min-h-[290px] grow">
          <div>
            <h3 className="text-lg font-semibold line-clamp-2 mb-1">
              {product.title}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-300 mb-2 line-clamp-3">
                {product.description}
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

            <div className="flex flex-wrap gap-2 min-h-[50px] items-start mb-2">
              <span className="text-xl font-bold text-green-500">
                {product.price} грн
              </span>
              {product.oldPrice && (
                <span className="text-sm line-through text-green-500 mt-[2px]">
                  {product.oldPrice} грн
                </span>
              )}
            </div>

            {!product.inStock && (
              <span className="text-xs text-red-500">Нет в наличии</span>
            )}
          </div>
        </div>
      </Link>

      {/* Кнопки */}
      <div className="flex gap-4 absolute right-3 bottom-3 z-10">
        <button
          onClick={(e) => {
            e.preventDefault(); // не переходить по ссылке
            toggleFavorite(productId); // ✅ Вызов из контекста
          }}
          className={`button-block-card hover:bg-green-500 ${
            isFavorite ? 'bg-green-500 text-white' : ''
          }`}
          title={isFavorite ? 'Прибрати з обраного' : 'Додати в обране'}
        >
          <Heart className="glass-icon-svg" />
        </button>

        <button className="button-block-card hover:bg-green-500">
          {''}
          <Scale className="glass-icon-svg" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault(); // не переходить по ссылке
            handleAddToCart();
          }}
          className="button-block-card hover:bg-green-500"
          disabled={!product.inStock}
          title={!product.inStock ? 'Немає в наявності' : 'Додати в кошик'}
        >
          <ShoppingCart className="glass-icon-svg" />
        </button>
      </div>
    </div>
  );
}
