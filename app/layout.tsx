import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { MobileSidebarProvider } from '@/context/MobileSidebarContext';
import { Onest } from 'next/font/google';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import ToastProvider from '@/components/ToastProvider';
import NavigationProgress from '@/components/NavigationProgress';
import AnalyticsPageView from '@/components/AnalyticsPageView';
import GoogleTags from '@/components/GoogleTags';

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-onest',
  preload: true,
});

export const metadata: Metadata = {
  title: 'MobiStuff',
  description: 'Інтернет-магазин мобільних аксесуарів в Україні',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#111827',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <GoogleTags />
      </head>
      <body
        className={`${onest.variable} antialiased min-h-screen flex flex-col site-page-bg`}
      >
        <FavoritesProvider>
          <CartProvider>
            <MobileSidebarProvider>
              <Header />
              <Suspense fallback={null}>
                <NavigationProgress />
                <AnalyticsPageView />
              </Suspense>
              <main className="mt-[68px] flex-1 pt-5 sm:pt-8">
                <Container>{children}</Container>
              </main>
              <Footer />
            </MobileSidebarProvider>
          </CartProvider>
        </FavoritesProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
