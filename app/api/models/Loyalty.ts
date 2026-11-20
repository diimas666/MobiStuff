import mongoose from 'mongoose';

/** Баланс балів кешбеку за номером телефону (1 бал = 1 грн) */
const LoyaltySchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    history: [{ at: { type: Date, default: Date.now }, delta: Number, reason: String, orderId: String, _id: false }],
  },
  { timestamps: true }
);

export default mongoose.models.Loyalty || mongoose.model('Loyalty', LoyaltySchema);
