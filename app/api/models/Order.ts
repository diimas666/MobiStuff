import mongoose from 'mongoose';
import { DEFAULT_ORDER_STATUS } from '@/lib/orderStatus';

const OrderSchema = new mongoose.Schema(
  {
    orderId: String,
    status: {
      type: String,
      default: DEFAULT_ORDER_STATUS,
    },
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
