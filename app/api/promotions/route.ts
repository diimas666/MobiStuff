import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Promotion from '@/app/api/models/Promotion';
import { ensureDefaultPromotions } from '@/lib/seedDefaultPromotions';
import { resolvePromotionImageUrl } from '@/lib/promotionMedia';

export async function GET() {
  try {
    await dbConnect();

    await ensureDefaultPromotions();

    const promotions = await Promotion.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      promotions: promotions.map(item => ({
        id: String(item._id),
        title: item.title,
        subtitle: item.subtitle,
        cta: item.cta,
        color: item.color,
        emoji: item.emoji,
        imageUrl: resolvePromotionImageUrl(item),
        linkType: item.linkType,
        categorySlug: item.categorySlug,
        categoryTitle: item.categoryTitle,
        subcategorySlug: item.subcategorySlug ?? undefined,
        subcategoryTitle: item.subcategoryTitle ?? undefined,
        sortOrder: item.sortOrder,
      })),
    });
  } catch (error: unknown) {
    console.error('GET /api/promotions failed:', error);
    return NextResponse.json({ error: 'Failed to load promotions' }, { status: 500 });
  }
}
