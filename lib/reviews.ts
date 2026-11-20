import 'server-only';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Review from '@/app/api/models/Review';

export type PublicReview = { id: string; name: string; rating: number; text: string; verified: boolean; reply?: string; createdAt: string };
export type ReviewSummary = { count: number; average: number; reviews: PublicReview[] };

async function load(handle: string): Promise<ReviewSummary> {
  try {
    await dbConnect();
    const list = await Review.find({ handle, status: 'approved' }).sort({ createdAt: -1 }).limit(50).lean<Record<string, any>[]>();
    const count = list.length;
    const average = count ? Math.round((list.reduce((n, r) => n + r.rating, 0) / count) * 10) / 10 : 0;
    return {
      count,
      average,
      reviews: list.map((r) => ({ id: String(r._id), name: r.name || 'Покупець', rating: r.rating, text: r.text || '', verified: Boolean(r.verified), reply: r.reply || undefined, createdAt: new Date(r.createdAt).toISOString() })),
    };
  } catch {
    return { count: 0, average: 0, reviews: [] };
  }
}

export const getReviews = (handle: string) => unstable_cache(() => load(handle), ['reviews', handle], { revalidate: 3600, tags: ['reviews', `reviews:${handle}`] })();
