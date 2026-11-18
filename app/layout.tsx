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
import MetaPixel from '@/components/MetaPixel';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { jsonLd } from '@/lib/jsonLd';

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-onest',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — аксесуари для смартфонів з доставкою по Україні`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'uk_UA',
    images: [{ url: '/logo-m-1024.jpg', width: 1024, height: 1024, alt: SITE_NAME }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  formatDetection: { telephone: false },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'OnlineStore',
      '@id': `${SITE_URL}/#store`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-m-1024.jpg`,
      email: 'mobistuffinfo@gmail.com',
      areaServed: 'UA',
      currenciesAccepted: 'UAH',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'uk',
      publisher: { '@id': `${SITE_URL}/#store` },
    },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f5f5f7',
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
        <MetaPixel />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationJsonLd)} />
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
              <main className="mt-[60px] flex-1 pt-5 sm:mt-[64px] sm:pt-8">
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
