'use client';
import { Product } from '@/interface/product';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from './ProductCard';
interface OffersSliderProps {
  products: Product[];
  mobileSlidesToShow: number;
}
export default function OffersSlider({
  products,
  mobileSlidesToShow,
}: OffersSliderProps) {
  const settings = {
    dots: true, // точки под слайдером
    infinite: true, // бесконечная прокрутка
    speed: 500, // скорость перехода
    slidesToShow: 4, // сколько карточек видно
    slidesToScroll: 1, // сколько листается за раз
    autoplay: true,
    // adaptiveHeight: true,
    autoplaySpeed: 4000, // автопрокрутка (мс)
    responsive: [
      {
        breakpoint: 1024, // до 1024px — 3 карточки
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768, // до 768px — 2 карточки
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480, // до 480px — 1 карточка
        settings: {
          slidesToShow: mobileSlidesToShow,
          // adaptiveHeight: true,
        },
      },
    ],
  };
  return (
    <Slider {...settings} className="mb-1 ">
      {products.map((product) => (
        <div key={product.id} className="px-1 max-w-[480]:px-0">
          <ProductCard product={product} />
        </div>
      ))}
    </Slider>
  );
}
