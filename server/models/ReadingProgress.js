import mongoose from 'mongoose';

const readingProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  totalPages: { type: Number, required: true },
  currentPage: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['reading', 'completed', 'paused', 'abandoned'], default: 'reading' },
  startedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ReadingProgress', readingProgressSchema);
