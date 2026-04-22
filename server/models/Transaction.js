import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  type: {
    type: String,
    enum: ['issue', 'return', 'hold'],
    default: 'issue',
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: function() { return this.type === 'issue'; },
  },
  returnDate: {
    type: Date,
  },
  fineAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'hold-pending', 'hold-fulfilled'],
    default: 'active',
  },
  notes: String
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
