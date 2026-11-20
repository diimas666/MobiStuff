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
    utm: { type: mongoose.Schema.Types.Mixed },
    subtotal: Number,
    // «Купити в 1 клік» — без адреси, менеджер передзвонює
    quick: Boolean,
    promo: { code: String, discount: Number, label: String },
    // Кешбек: списано балами / нараховано / повернуто
    pointsUsed: Number,
    cashbackAwarded: Boolean,
    pointsRefunded: Boolean,
    // Номер експрес-накладної Нової Пошти
    ttn: String,
    // Внутрішня примітка менеджера (клієнт не бачить)
    managerNote: String,
    // Історія: зміни статусу, ТТН, надіслані повідомлення
    history: [
      {
        at: { type: Date, default: Date.now },
        text: String,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
