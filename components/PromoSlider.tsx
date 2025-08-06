'use client';

import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const banners = [
  {
    src: '/images/banners/free-delivery.png',
    alt: 'Безкоштовна доставка від 2500 грн',
  },
  {
    src: '/images/banners/borofone-discount.png',
    alt: 'Знижка 5% на Borofone',
  },
  {
    src: '/images/banners/new-arrivals.jpg',
    alt: 'Новинки тижня',
  },
  {
    src: '/images/banners/powerbanks-sale.jpg',
    alt: 'Акція на повербанки',
  },
];

export default function PromoSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full overflow-hidden">
      <Slider {...settings}>
        {banners.map((banner, i) => (
          <div key={i} className="px-2">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border shadow">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                unoptimized // <== ВАЖНО
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
