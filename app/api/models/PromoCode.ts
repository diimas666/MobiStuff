import mongoose from 'mongoose';

/** Промокод: відсоток або фіксована сума, з обмеженнями */
const PromoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true },
    minTotal: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 }, // 0 — без обмежень
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    active: { type: Boolean, default: true },
    note: String,
  },
  { timestamps: true }
);

export default mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema);
