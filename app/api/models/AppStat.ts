import mongoose from 'mongoose';

/** Лічильники подій застосунку по днях (без персональних даних) */
const AppStatSchema = new mongoose.Schema({
  date: { type: String, required: true },
  event: { type: String, required: true },
  count: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
});
AppStatSchema.index({ date: 1, event: 1 }, { unique: true });

export default mongoose.models.AppStat || mongoose.model('AppStat', AppStatSchema);
