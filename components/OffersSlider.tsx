"use client";
import { Product } from "@/interface/product";
import Slider from "react-slick";
import ProductCard from "./ProductCard";

interface OffersSliderProps {
  products: Product[];
  mobileSlidesToShow: number;
  slidesToScroll: number;
  compact?: boolean;
}

export default function OffersSlider({
  products,
  mobileSlidesToShow,
  slidesToScroll,
  compact = false,
}: OffersSliderProps) {
  if (!products || products.length === 0) return null;

  // 🛡️ Защита от 1 товара
  if (products.length < 2) {
    return (
      <div
        className={`grid gap-3 ${
          compact ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        }`}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact={compact} />
        ))}
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: compact ? 5 : 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: compact ? 4 : 4 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: compact ? 4 : 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: compact ? 3 : 2 },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: compact ? 2 : mobileSlidesToShow,
          slidesToScroll: slidesToScroll,
        },
      },
    ],
  };

  return (
    <Slider {...settings} className="mb-1 related-products-slider">
      {products.map((product) => (
        <div key={product.id} className="px-1 max-w-[480]:px-0">
          <ProductCard product={product} compact={compact} />
        </div>
      ))}
    </Slider>
  );
}
