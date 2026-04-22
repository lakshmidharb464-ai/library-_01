import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  reason: { type: String, required: true },
  requestedBy: { type: String, required: true },
  requestedByName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

export default mongoose.model('Recommendation', recommendationSchema);
