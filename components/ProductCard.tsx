"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/interface/product";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { trackAddToWishlist } from "@/lib/analytics";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  compact?: boolean;
}

export default function ProductCard({
  product,
  priority = false,
  compact = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const productId = product._id || product.id;
  const isFavorite = favorites.includes(productId);
  const imageSrc = (product.image ?? "").replace(/"/g, "").trim();
  const inStock = product.inStock !== false;
  const hasDiscount =
    product.oldPrice && product.oldPrice > product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, image: imageSrc });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFavorite) trackAddToWishlist(product);
    toggleFavorite(productId);
  };

  const favoriteBtnClass = (size: "sm" | "md") =>
    `z-10 flex shrink-0 items-center justify-center rounded-xl border shadow-sm transition cursor-pointer ${
      size === "sm" ? "h-7 w-7" : "h-9 w-9"
    } ${
      isFavorite
        ? "border-green-500 bg-green-500 text-white"
        : "border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:text-green-600"
    }`;

  if (compact) {
    return (
      <article className="group flex h-[280px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-green-200 hover:shadow-md">
        <div className="relative h-[150px] shrink-0 bg-white">
          <Link
            href={`/product/${product.handle}`}
            className="absolute inset-0 block p-2"
          >
            {imageSrc && (
              <div className="relative h-full w-full">
                <ProductImage
                  src={imageSrc}
                  alt={product.title}
                  fill
                  className="object-contain transition group-hover:scale-[1.03]"
                  sizes="(max-width: 480px) 45vw, 180px"
                  loading={priority ? "eager" : "lazy"}
                  priority={priority}
                />
              </div>
            )}
          </Link>
          {product.discountPercent ? (
            <span className="absolute top-2 left-2 z-10 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              −{product.discountPercent}%
            </span>
          ) : null}
          {!inStock && (
            <span className="absolute bottom-2 left-2 z-10 rounded-full bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-white">
              Немає
            </span>
          )}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`absolute top-2 right-2 ${favoriteBtnClass("sm")}`}
            aria-label={isFavorite ? "Прибрати з обраного" : "Додати в обране"}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-2.5">
          <Link href={`/product/${product.handle}`} className="min-h-0 flex-1">
            <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug text-gray-900">
              {product.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-end justify-between gap-1">
            <div className="min-w-0">
              <p className="text-sm font-bold text-green-600">{product.price} ₴</p>
              {hasDiscount && (
                <p className="text-[10px] line-through text-gray-400">
                  {product.oldPrice} ₴
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Додати в кошик"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-green-200 hover:shadow-md">
      <div className="relative aspect-square shrink-0 bg-white">
        <Link
          href={`/product/${product.handle}`}
          className="absolute inset-0 block p-3 sm:p-4"
        >
          {imageSrc && (
            <div className="relative h-full w-full">
              <ProductImage
                src={imageSrc}
                alt={product.title}
                fill
                className="object-contain transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 280px"
                loading={priority ? "eager" : "lazy"}
                priority={priority}
              />
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Новинка
            </span>
          )}
          {product.isTrending && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Тренд
            </span>
          )}
          {product.discountPercent ? (
            <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              −{product.discountPercent}%
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute top-2.5 right-2.5 ${favoriteBtnClass("md")}`}
          aria-label={isFavorite ? "Прибрати з обраного" : "Додати в обране"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link
          href={`/product/${product.handle}`}
          className="flex min-h-[5.5rem] flex-1 flex-col sm:min-h-[6rem]"
        >
          <p
            className={`mb-1 min-h-[14px] text-[11px] font-semibold uppercase tracking-wide text-green-600 ${
              product.brand ? "" : "invisible"
            }`}
          >
            {product.brand || "—"}
          </p>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-900 sm:min-h-[2.75rem] sm:text-base">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 flex min-h-[22px] items-center gap-2">
          {inStock ? (
            product.lowStock ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                Закінчується
              </span>
            ) : (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 ring-1 ring-green-200">
                В наявності
              </span>
            )
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">
              Немає в наявності
            </span>
          )}
        </div>

        <div className="mt-auto flex min-h-[52px] items-end justify-between gap-3 border-t border-gray-100 pt-3">
          <div className="min-h-[40px] min-w-0">
            <p className="text-xl font-bold text-gray-900 sm:text-2xl">
              {product.price}
              <span className="ml-0.5 text-sm font-semibold text-green-600">₴</span>
            </p>
            <p
              className={`text-sm text-gray-400 line-through ${
                hasDiscount ? "" : "invisible"
              }`}
            >
              {hasDiscount ? `${product.oldPrice} ₴` : "—"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-green-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Купити</span>
          </button>
        </div>
      </div>
    </article>
  );
}
