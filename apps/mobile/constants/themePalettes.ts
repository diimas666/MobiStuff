export const lightColors = {
  primary: '#2DB84B',
  primaryDark: '#1F8F3A',
  text: '#111827',
  textMuted: '#9CA3AF',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.72)',
  background: '#FFFFFF',
  screen: '#F9FAFB',
  homeBackground: '#1B4332',
  homeBackgroundTop: '#52B788',
  homeBackgroundBottom: '#0B2E1F',
  homeBackgroundGlow: '#B7E4C7',
  homeBackgroundPattern: '#FFFFFF',
  homeSurface: 'rgba(255, 255, 255, 0.12)',
  homeSearch: 'rgba(0, 0, 0, 0.22)',
  card: '#FFFFFF',
  price: '#6EE7A0',
  priceLight: '#86EFAC',
  danger: '#EF4444',
  bannerStart: '#E91E8C',
  bannerEnd: '#7C3AED',
} as const;

export type AppColorPalette = {
  [K in keyof typeof lightColors]: string;
};

export const darkColors: AppColorPalette = {
  primary: '#34D399',
  primaryDark: '#10B981',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.72)',
  background: '#0F172A',
  screen: '#111827',
  homeBackground: '#0B1220',
  homeBackgroundTop: '#1B4332',
  homeBackgroundBottom: '#050A08',
  homeBackgroundGlow: '#2D6A4F',
  homeBackgroundPattern: '#FFFFFF',
  homeSurface: 'rgba(255, 255, 255, 0.08)',
  homeSearch: 'rgba(255, 255, 255, 0.06)',
  card: '#1F2937',
  price: '#6EE7A0',
  priceLight: '#86EFAC',
  danger: '#F87171',
  bannerStart: '#E91E8C',
  bannerEnd: '#7C3AED',
};

export function getPaletteForTheme(theme: 'light' | 'dark'): AppColorPalette {
  return theme === 'dark' ? darkColors : { ...lightColors };
}
