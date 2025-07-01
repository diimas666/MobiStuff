export interface Product {
  id: string;
  title: string;
  description?: string; // Описание товара
  image: string;
  images?: string[]; // Галерея картинок
  price: number; // Актуальная цена
  oldPrice?: number; // Старая цена до скидки
  discountPercent?: number; // Скидка в %
  inStock?: boolean; // В наличии или нет
  isNew?: boolean; // Новый товар
  isFeatured?: boolean; // Показывать на главной
  handle: string; // URL-адрес
  category?: string; // Категория
  categorySlug?:string;
  subcategorySlug?: string;
  brand?: string; // Бренд
  rating?: number; // Рейтинг 1–5
  reviewsCount?: number; // Количество отзывов
  variants?: string[]; // Цвета, размеры и т.д.
  tags?: string[]; // Ключевые слова
}
