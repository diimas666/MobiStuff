import mongoose from 'mongoose';

/** Пристрій для push-сповіщень (iOS APNs) */
const PushDeviceSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    platform: { type: String, default: 'ios' },
    // Номери, для яких пристрій підтвердив доступ до замовлень (ключем доступу)
    phones: { type: [String], index: true, default: [] },
    // Замовлення, оформлені з цього пристрою (статуси приходять і без коду з SMS)
    orderIds: { type: [String], index: true, default: [] },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.PushDevice || mongoose.model('PushDevice', PushDeviceSchema);
