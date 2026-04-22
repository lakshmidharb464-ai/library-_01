import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  category: { type: String, default: 'General' },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  rating: { type: Number, default: 4.0 },
  coverColor: { type: String, default: '#00ffc8' },
  publishedYear: { type: Number },
}, {
  timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
