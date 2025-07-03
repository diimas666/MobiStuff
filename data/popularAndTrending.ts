// components/popularData.ts
import { toSlug } from '@/lib/slugify';
// тут популярные товары и трнединг товары и все!! 
export const popularItems = [
  {
    id: 1,
    title: 'Навушники',
    image: '/images/besprovodnye-nausniki.jpg',
    bg: 'bg-pink-100',
    categorySlug: toSlug('Навушники'), // navushnyky
    subcategorySlug: toSlug('Усі навушники'), // usi-navushnyky
  },
  {
    id: 2,
    title: 'Павербанки',
    image: '/images/akkumulatornoi-bataree.jpg',
    bg: 'bg-yellow-100',
    categorySlug: toSlug('Акумулятори та PowerBank'), // akumulyatory-ta-powerbank
    subcategorySlug: toSlug('Павербанки'), // paverbanky
  },
  {
    id: 3,
    title: 'Тримачі в авто',
    image: '/images/zensina-s-pomos-u-smartfona-s-rozetkoi.jpg',
    bg: 'bg-blue-100',
    categorySlug: toSlug('Автомобільна тематика'), // avtomobilna-tematyka
    subcategorySlug: toSlug('Тримачі'), // trymachi
  },
  {
    id: 4,
    title: 'Колонки Bluetooth',
    image: '/images/naturmort-tehnologiceskogo-ustroistva.jpg',
    bg: 'bg-green-100',
    categorySlug: toSlug('Аудіо та відео'), // audio-ta-video
    subcategorySlug: toSlug('Колонки'), // kolonky
  },
  {
    id: 5,
    title: 'USB-C кабелі',
    image: '/images/usb-kabel-tipa-c-na-sinem-fone.jpg',
    bg: 'bg-purple-100',
    categorySlug: toSlug('Зарядки та кабелі'), // zaryadky-ta-kabeli
    subcategorySlug: toSlug('USB-C'), // usb-c
  },
  {
    id: 6,
    title: 'Геймерські аксесуари',
    image: '/images/game.jpg',
    bg: 'bg-red-100',
    categorySlug: toSlug("Комп'ютерна периферія"), // komp-iuterna-peryferiia
    subcategorySlug: toSlug('Клавіатури'), // klaviatury (или Hаби, если хочешь другое)
  },
];

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

// export const categoryStructure = {
//   Кабелі: ['Type-C', 'Lightning', 'MicroUSB', 'USB-A', 'Магнітні'],
//   Повербанки: [
//     'Для телефону',
//     'Для планшету',
//     'Зарядні станції',
//     'Сонячні',
//     'Бездротові (MagSafe)',
//     'З ліхтариком',
//   ],
//   Колонки: ['Bluetooth', 'Портативні', 'З підсвіткою', 'Стаціонарні'],
//   'Зарядні пристрої': [
//     'Мережеві',
//     'Автомобільні',
//     'Бездротові',
//     'З кількома портами',
//   ],
//   Тримачі: ['В авто', 'На велосипед', 'Магнітні', 'На присосці'],
//   Навушники: ['Вакуумні', 'Накладні', 'Bluetooth (TWS)', 'З мікрофоном'],
//   Аксесуари: [
//     'Перехідники',
//     'Картридери',
//     'Чохли',
//     'Плівки та скло',
//     'Селфі-палки',
//   ],
//   Інше: ['Розетки', 'Ліхтарики', 'Адаптери', 'Тестери кабелів'],
// };
