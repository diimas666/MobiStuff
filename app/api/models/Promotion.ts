import mongoose from 'mongoose';

export type PromotionLinkType = 'category' | 'on_sale';

const PromotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    cta: { type: String, default: 'До покупок' },
    color: { type: String, default: '#3D4F5C' },
    emoji: { type: String, default: '🛍️' },
    imageUrl: String,
    imageAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionAsset' },
    linkType: {
      type: String,
      enum: ['category', 'on_sale'],
      default: 'category',
    },
    categorySlug: { type: String, required: true },
    categoryTitle: { type: String, required: true },
    subcategorySlug: String,
    subcategoryTitle: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Promotion ||
  mongoose.model('Promotion', PromotionSchema);
