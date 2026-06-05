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
    mmaKey: { type: String, unique: true, sparse: true },
    mmaSlug: String,
    mmaSourcePrice: Number,
    priceManuallyEdited: { type: Boolean, default: false },
    lastSyncedAt: Date,
  },
  {
    suppressReservedKeysWarning: true, // ✅ Добавь сюда
    timestamps: true, // ✅ ОБОВʼЯЗКОВО!
  }
);

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema);
