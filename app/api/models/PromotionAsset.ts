import mongoose from 'mongoose';

const PromotionAssetSchema = new mongoose.Schema(
  {
    mimeType: { type: String, required: true },
    data: { type: Buffer, required: true },
    width: Number,
    height: Number,
    size: Number,
  },
  { timestamps: true },
);

export default mongoose.models.PromotionAsset ||
  mongoose.model('PromotionAsset', PromotionAssetSchema);
