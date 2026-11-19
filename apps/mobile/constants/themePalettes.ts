/**
 * Палітра в стилі сайту (Apple-подібна): світле полотно, білі картки, чорний текст,
 * зелений акцент. Ключі textOnDark/homeSurface лишились з попереднього дизайну,
 * тепер це «основний текст» і «картка».
 */
export const lightColors = {
  primary: '#138A47',
  primaryDark: '#0E6E38',
  text: '#1D1D1F',
  textMuted: '#86868B',
  textOnDark: '#1D1D1F',
  textOnDarkMuted: '#6E6E73',
  background: '#FFFFFF',
  screen: '#F5F5F7',
  homeBackground: '#F5F5F7',
  homeBackgroundTop: '#F5F5F7',
  homeBackgroundBottom: '#F5F5F7',
  homeBackgroundGlow: '#F5F5F7',
  homeBackgroundPattern: '#F5F5F7',
  homeSurface: '#FFFFFF',
  homeSearch: '#FFFFFF',
  card: '#FFFFFF',
  price: '#1D1D1F',
  priceLight: '#1D1D1F',
  danger: '#E30000',
  bannerStart: '#1D1D1F',
  bannerEnd: '#3A3A3C',
  // нові токени
  ink3: '#86868B',
  line: '#D2D2D7',
  lineSoft: '#E8E8ED',
  fill: '#EDEDF0',
  accentSoft: '#E7F4EC',
  sale: '#E30000',
  onPrimary: '#FFFFFF',
} as const;

export type AppColorPalette = {
  [K in keyof typeof lightColors]: string;
};

export const darkColors: AppColorPalette = {
  primary: '#30D158',
  primaryDark: '#28B14B',
  text: '#F5F5F7',
  textMuted: '#8E8E93',
  textOnDark: '#F5F5F7',
  textOnDarkMuted: '#A1A1A6',
  background: '#000000',
  screen: '#000000',
  homeBackground: '#000000',
  homeBackgroundTop: '#000000',
  homeBackgroundBottom: '#000000',
  homeBackgroundGlow: '#000000',
  homeBackgroundPattern: '#000000',
  homeSurface: '#1C1C1E',
  homeSearch: '#1C1C1E',
  card: '#1C1C1E',
  price: '#F5F5F7',
  priceLight: '#F5F5F7',
  danger: '#FF453A',
  bannerStart: '#1C1C1E',
  bannerEnd: '#2C2C2E',
  ink3: '#8E8E93',
  line: '#38383A',
  lineSoft: '#2C2C2E',
  fill: '#2C2C2E',
  accentSoft: '#12301E',
  sale: '#FF453A',
  onPrimary: '#000000',
};

export function getPaletteForTheme(theme: 'light' | 'dark'): AppColorPalette {
  return theme === 'dark' ? darkColors : { ...lightColors };
}
