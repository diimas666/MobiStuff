import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MobileSidebarProvider } from '@/context/MobileSidebarContext';
import { Roboto } from 'next/font/google';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import ToastProvider from '@/components/ToastProvider';
import NavigationProgress from '@/components/NavigationProgress';
import AnalyticsPageView from '@/components/AnalyticsPageView';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-roboto',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${roboto.variable} antialiased min-h-screen flex flex-col site-page-bg`}
      >
        <FavoritesProvider>
          <CartProvider>
            <MobileSidebarProvider>
              <Header />
              <Suspense fallback={null}>
                <NavigationProgress />
                <AnalyticsPageView />
              </Suspense>
              <div className="mt-[80px] flex-1">
                <Container>{children}</Container>
              </div>
              <Footer />
            </MobileSidebarProvider>
          </CartProvider>
        </FavoritesProvider>
        <ToastProvider />
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
