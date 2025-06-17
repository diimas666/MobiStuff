// components/popularData.ts
import { toSlug } from '@/lib/slugify';

export const popularItems = [
  {
    id: 1,
    title: 'Геймерські аксесуари',
    image: '/images/game.jpg',
    bg: 'bg-red-100',
  },
  {
    id: 2,
    title: 'Навушники',
    image: '/images/besprovodnye-nausniki.jpg',
    bg: 'bg-pink-100',
  },
  {
    id: 3,
    title: 'Павербанки',
    image: '/images/akkumulatornoi-bataree.jpg',
    bg: 'bg-yellow-100',
  },
  {
    id: 4,
    title: 'Тримачі телефонів',
    image: '/images/zensina-s-pomos-u-smartfona-s-rozetkoi.jpg',
    bg: 'bg-blue-100',
  },
  {
    id: 5,
    title: 'Колонки Bluetooth',
    image: '/images/naturmort-tehnologiceskogo-ustroistva.jpg',
    bg: 'bg-green-100',
  },
  {
    id: 6,
    title: 'USB кабелі',
    image: '/images/usb-kabel-tipa-c-na-sinem-fone.jpg',
    bg: 'bg-purple-100',
  },
].map((item) => ({
  ...item,
  slug: toSlug(item.title),
}));

export const trendingItems = [
  {
    id: 1,
    title: 'Пауэрбанки',
    image: '/images/powerbank.jpg',
    bg: 'bg-red-100',
  },
  {
    id: 2,
    title: 'Магнітні кабелі',
    image: '/images/magnetic.jpg',
    bg: 'bg-purple-100',
  },
  {
    id: 3,
    title: 'Адаптери',
    image: '/images/adapter.jpg',
    bg: 'bg-orange-100',
  },
];

const categoryStructure = {
  Кабелі: ['Type-C', 'Lightning', 'MicroUSB', 'USB-A', 'Магнітні'],
  Повербанки: [
    'Для телефону',
    'Для планшету',
    'Зарядні станції',
    'Сонячні',
    'Бездротові (MagSafe)',
    'З ліхтариком',
  ],
  Колонки: ['Bluetooth', 'Портативні', 'З підсвіткою', 'Стаціонарні'],
  'Зарядні пристрої': [
    'Мережеві',
    'Автомобільні',
    'Бездротові',
    'З кількома портами',
  ],
  Тримачі: ['В авто', 'На велосипед', 'Магнітні', 'На присосці'],
  Навушники: ['Вакуумні', 'Накладні', 'Bluetooth (TWS)', 'З мікрофоном'],
  Аксесуари: [
    'Перехідники',
    'Картридери',
    'Чохли',
    'Плівки та скло',
    'Селфі-палки',
  ],
  Інше: ['Розетки', 'Ліхтарики', 'Адаптери', 'Тестери кабелів'],
};
