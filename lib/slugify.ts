import slugify from 'slugify';

/**
 * Создает slug из строки, например "Навушники Bluetooth" → "navushnyky-bluetooth"
 * @param str Текст для преобразования
 * @returns slug строка
 */
export function toSlug(str: string): string {
  return slugify(str, {
    lower: true,
    locale: 'uk', // Можно заменить на 'en' если нужно
    strict: true, // Удаляет символы вроде !?():"
    trim: true,
  });
}
