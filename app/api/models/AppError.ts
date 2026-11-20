import mongoose from 'mongoose';

/** Помилки застосунку, згруповані за відбитком */
const AppErrorSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, unique: true },
    message: String,
    stack: String,
    screen: String,
    appVersion: String,
    platform: String,
    fatal: Boolean,
    count: { type: Number, default: 0 },
    lastAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.AppError || mongoose.model('AppError', AppErrorSchema);
