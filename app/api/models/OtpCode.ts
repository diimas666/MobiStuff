import mongoose from 'mongoose';

/** Одноразові коди входу в історію замовлень (зберігаємо лише хеш) */
const OtpCodeSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  // Mongo сам видалить запис після закінчення терміну
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.OtpCode || mongoose.model('OtpCode', OtpCodeSchema);
