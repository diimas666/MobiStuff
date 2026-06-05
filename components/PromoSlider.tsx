'use client';

import Image from 'next/image';
import Slider from 'react-slick';

const banners = [
  {
    src: '/images/banners/free-delivery.webp',
    alt: 'Безкоштовна доставка від 2500 грн',
  },
  {
    src: '/images/banners/borofone-discount.webp',
    alt: 'Знижка 5% на Borofone',
  },
];

export default function PromoSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    lazyLoad: 'ondemand' as const,
    responsive: [
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
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                loading={i === 0 ? 'eager' : 'lazy'}
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
