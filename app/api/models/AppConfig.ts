import mongoose from 'mongoose';

/** Керування застосунком з адмінки (один документ, key = 'main') */
const AppConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    banners: [
      {
        _id: false,
        id: String,
        title: String,
        subtitle: String,
        image: String,
        // Куди веде: mobistuff://product/<handle>, mobistuff://category/<slug>, https://…
        link: String,
        promoCode: String,
        startsAt: String,
        endsAt: String,
        enabled: { type: Boolean, default: true },
      },
    ],
    minVersion: String,
    latestVersion: String,
    maintenance: { enabled: Boolean, message: String },
    whatsNew: { version: String, items: [String] },
    autoPush: {
      cart: { type: Boolean, default: true },
      priceDrop: { type: Boolean, default: true },
      winback: { type: Boolean, default: true },
      winbackPromoPercent: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);
