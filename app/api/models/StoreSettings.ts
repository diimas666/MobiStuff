import mongoose from 'mongoose';

/** Налаштування магазину (один документ, key = 'main') */
const StoreSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    phone: String,
    email: String,
    instagram: String,
    telegram: String,
    viber: String,
    workingHours: String,
    freeDeliveryFrom: Number,
    cardOnlyFrom: Number,
    cardPaymentDetails: String,
    announcement: {
      enabled: Boolean,
      text: String,
      link: String,
    },
    notifyCustomers: {
      email: Boolean,
      sms: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
