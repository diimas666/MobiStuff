'use client';
import { Product } from '@/interface/product';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ProductCard from './ProductCard';

interface OffersSliderProps {
  products: Product[];
  mobileSlidesToShow: number;
  slidesToScroll: number;
}

export default function OffersSlider({
  products,
  mobileSlidesToShow,
  slidesToScroll,
}: OffersSliderProps) {
  if (!products || products.length === 0) return null;

  // 🛡️ Защита от 1 товара
  if (products.length < 2) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: mobileSlidesToShow,
          slidesToScroll: slidesToScroll,
        },
      },
    ],
  };

  return (
    <Slider {...settings} className="mb-1">
      {products.map((product) => (
        <div key={product.id} className="px-1 max-w-[480]:px-0">
          <ProductCard product={product} />
        </div>
      ))}
    </Slider>
  );
}
