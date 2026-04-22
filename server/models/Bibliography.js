import mongoose from 'mongoose';

const bibliographySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  style: { type: String, required: true },
  citation: { type: String, required: true },
  projectName: { type: String, default: 'General' },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Bibliography', bibliographySchema);
