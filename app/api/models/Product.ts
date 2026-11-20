import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: { type: String, required: true },
    images: [String],
    price: { type: Number, required: true },
    oldPrice: Number,
    discountPercent: Number,
    inStock: { type: Boolean, default: true },
    lowStock: { type: Boolean, default: false },
    isNew: Boolean,
    isFeatured: Boolean,
    handle: { type: String, required: true, unique: true },
    category: String,
    categorySlug: String,
    subcategorySlug: String,
    brand: String,
    rating: Number,
    isTrending: { type: Boolean, default: false },
    reviewsCount: Number,
    variants: [String],
    tags: [String],
    // Службові поля постачальника — не віддаються на вітрину (select: false)
    mmaKey: { type: String, unique: true, sparse: true, select: false },
    mmaSlug: { type: String, select: false },
    mmaSourcePrice: { type: Number, select: false },
    mmaSourceCurrency: { type: String, select: false }, // UAH | USD
    // Рекомендована роздрібна ціна постачальника (орієнтир ринку)
    mmaRrp: { type: Number, select: false },
    priceManuallyEdited: { type: Boolean, default: false, select: false },
    lastSyncedAt: { type: Date, select: false },
    // Поля, змінені вручну в адмінці — синхронізація з MMA їх не перезаписує
    manualFields: { type: [String], select: false },
  },
  {
    suppressReservedKeysWarning: true, // ✅ Добавь сюда
    timestamps: true, // ✅ ОБОВʼЯЗКОВО!
  }
);

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema);
