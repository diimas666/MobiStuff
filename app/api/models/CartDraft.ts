import mongoose from 'mongoose';

/** Незавершене оформлення: для нагадування «Ваш кошик чекає» */
const CartDraftSchema = new mongoose.Schema(
  {
    phone: { type: String, index: true },
    email: String,
    name: String,
    items: Array,
    total: Number,
    restoreToken: { type: String, unique: true },
    notifiedAt: Date,
    convertedAt: Date,
    promoCode: String,
  },
  { timestamps: true }
);

export default mongoose.models.CartDraft || mongoose.model('CartDraft', CartDraftSchema);
