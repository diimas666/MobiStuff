import mongoose from 'mongoose';

/** «Повідомити про наявність» */
const StockAlertSchema = new mongoose.Schema(
  {
    productId: { type: String, index: true },
    handle: String,
    title: String,
    phone: String,
    email: String,
    notifiedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.StockAlert || mongoose.model('StockAlert', StockAlertSchema);
