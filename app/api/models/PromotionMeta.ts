import mongoose from 'mongoose';

const PromotionMetaSchema = new mongoose.Schema(
  {
    defaultsSeeded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.PromotionMeta ||
  mongoose.model('PromotionMeta', PromotionMetaSchema);
