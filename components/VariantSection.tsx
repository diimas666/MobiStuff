'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/interface/product';
import VariantSelector from './VariantSelector';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

interface Props {
  variants: string[];
  product: Product;
}

export default function VariantSection({ variants, product }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toggleFavorite, favorites } = useFavorites();

  const productId = product._id || product.id;
  const isFavorite = favorites.includes(productId);
  const inStock = product.inStock !== false;

  return (
    <div className="flex flex-col gap-4">
      {variants && variants.length > 0 && (
        <VariantSelector
          variants={variants}
          selected={selected}
          setSelected={setSelected}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => toggleFavorite(productId)}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition shadow-sm border ${
            isFavorite
              ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
              : 'bg-white text-gray-800 border-gray-200 hover:border-green-300 hover:bg-green-50'
          }`}
        >
          <Heart className="w-5 h-5" />
          {isFavorite ? 'В обраному' : 'В обране'}
        </button>

        <button
          type="button"
          onClick={() => addToCart(product)}
          disabled={!inStock}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5" />
          {inStock ? 'Купити' : 'Немає в наявності'}
        </button>
      </div>
    </div>
  );
}
