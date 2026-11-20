import mongoose from 'mongoose';

/** Відгук про товар. Показується після модерації; «Підтверджена покупка» — якщо залишено за посиланням із замовлення */
const ReviewSchema = new mongoose.Schema(
  {
    handle: { type: String, index: true },
    productTitle: String,
    name: String,
    rating: { type: Number, min: 1, max: 5 },
    text: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    orderId: String,
    verified: Boolean,
    reply: String,
    source: { type: String, default: 'site' }, // site | app
  },
  { timestamps: true }
);
ReviewSchema.index({ handle: 1, status: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
