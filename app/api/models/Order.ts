import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    name: String,
    lastName: String,
    phone: String,
    email: String,
    comment: String,
    city: String,
    cityRef: String,
    warehouse: String,
    paymentMethod: String,
    total: Number,
    items: Array,
    createdAt: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
