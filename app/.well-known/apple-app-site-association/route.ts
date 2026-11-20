import { NextResponse } from 'next/server';

/**
 * Universal Links: посилання на сайт (товар, категорія, кошик, замовлення)
 * відкриваються одразу в застосунку, якщо він встановлений. Apple завантажує цей файл з домену.
 */
const APP_ID = `${process.env.APPLE_TEAM_ID || '8467HTC6V4'}.shop.mobistuff.app`;

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json({
    applinks: {
      details: [
        {
          appIDs: [APP_ID],
          components: [
            { '/': '/admin*', exclude: true },
            { '/': '/api/*', exclude: true },
            { '/': '/product/*' },
            { '/': '/category/*' },
            { '/': '/catalog' },
            { '/': '/cart' },
            { '/': '/favorites' },
            { '/': '/account' },
            { '/': '/tracking' },
          ],
        },
      ],
    },
  });
}
