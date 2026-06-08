import mongoose from 'mongoose';

const DailyStatSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    pageViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.DailyStat ||
  mongoose.model('DailyStat', DailyStatSchema);
