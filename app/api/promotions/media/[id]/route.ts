import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PromotionAsset from '@/app/api/models/PromotionAsset';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await dbConnect();
    const asset = await PromotionAsset.findById(id).lean();

    if (!asset?.data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return new NextResponse(asset.data, {
      status: 200,
      headers: {
        'Content-Type': asset.mimeType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    console.error('GET /api/promotions/media failed:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
