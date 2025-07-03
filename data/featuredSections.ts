import { toSlug } from '@/lib/slugify';
import { actualProposition } from '@/data/actualProposition';
import { headphones } from '@/data/headphones';

export const featuredSections = [
  {
    title: 'Навушники',
    categorySlug: toSlug('Навушники'),
    subcategorySlug: toSlug('Усі навушники'),
    products: headphones,
  },
  {
    title: 'Павербанки',
    categorySlug: toSlug('Акумулятори та PowerBank'),
    subcategorySlug: toSlug('Павербанки'),
    products: actualProposition,
  },
  {
    title: 'USB кабелі',
    categorySlug: toSlug('Зарядки та кабелі'),
    subcategorySlug: toSlug('USB'),
    products: actualProposition,
  },
  {
    title: 'Мишки',
    categorySlug: toSlug("Комп'ютерна периферія"),
    subcategorySlug: toSlug('Мишки'),
    products: actualProposition,
  },
  {
    title: 'Тримачі в авто',
    categorySlug: toSlug('Автомобільна тематика'),
    subcategorySlug: toSlug('Тримачі'),
    products: actualProposition,
  },
  {
    title: 'Колонки',
    categorySlug: toSlug('Аудіо та відео'),
    subcategorySlug: toSlug('Колонки'),
    products: actualProposition,
  },
  {
    title: 'Смарт-годинники',
    categorySlug: toSlug('Гаджети'),
    subcategorySlug: toSlug('Смарт-годинники'),
    products: actualProposition, // нужный массив
  },
  {
    title: 'Чохли для iPhone',
    categorySlug: toSlug('Чохли'),
    subcategorySlug: toSlug('Для iPhone'),
    products: actualProposition,
  },
  {
    title: 'Плівки на екран',
    categorySlug: toSlug('Захист екрану'),
    subcategorySlug: toSlug('Плівки'),
    products: actualProposition,
  },
  {
    title: 'Кабель-тестери',
    categorySlug: toSlug('Корисні аксесуари'),
    subcategorySlug: toSlug('Кабель-тестери'),
    products: actualProposition,
  },
];
