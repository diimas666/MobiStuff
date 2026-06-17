import Promotion from '@/app/api/models/Promotion';
import PromotionMeta from '@/app/api/models/PromotionMeta';
import { defaultPromotions } from '@/lib/defaultPromotions';

export async function ensureDefaultPromotions() {
  const totalCount = await Promotion.countDocuments();

  if (totalCount > 0) {
    await PromotionMeta.findOneAndUpdate(
      {},
      { defaultsSeeded: true },
      { upsert: true, setDefaultsOnInsert: true },
    );
    return;
  }

  const meta = await PromotionMeta.findOne().lean();
  if (meta?.defaultsSeeded) {
    return;
  }

  await Promotion.insertMany(defaultPromotions);
  await PromotionMeta.findOneAndUpdate(
    {},
    { defaultsSeeded: true },
    { upsert: true, setDefaultsOnInsert: true },
  );
}
