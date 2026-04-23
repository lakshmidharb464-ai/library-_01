import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/transactions
router.get('/', protect, authorize('custodian', 'admin'), async (req, res) => {
  try {
    const { user, book, status } = req.query;
    const query = {};
    if (user) query.user = user;
    if (book) query.book = book;
    if (status) query.status = status;

    const transactions = await storage.find('Transaction', query, { sort: { createdAt: -1 } });
    
    // Manual population for JSON / Lean Mongo
    const enriched = await Promise.all(transactions.map(async (t) => {
      const u = await storage.findOne('User', { _id: t.user }) || await storage.findOne('User', { id: t.user });
      const b = await storage.findOne('Book', { _id: t.book }) || await storage.findOne('Book', { id: t.book });
      return { ...t, user: u, book: b };
    }));
    
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/transactions/stats
router.get('/stats', protect, authorize('custodian', 'admin'), async (req, res) => {
  try {
    const totalTransactions = await storage.count('Transaction');
    const activeLoans = await storage.count('Transaction', { status: 'active' });
    const overdueLoans = await storage.count('Transaction', { status: 'active', dueDate: { $lt: new Date() } }); // $lt won't work in JSON yet but fine for Mongo
    
    // Simple JSON fallback for overdue (manual check)
    let overdueCount = overdueLoans;
    if (!storage.isUsingMongo) {
      const allActive = await storage.find('Transaction', { status: 'active' });
      overdueCount = allActive.filter(t => new Date(t.dueDate) < new Date()).length;
    }

    res.json({ 
      success: true, 
      data: {
        total: totalTransactions,
        active: activeLoans,
        overdue: overdueCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/transactions/issue
router.post('/issue', protect, authorize('custodian', 'admin'), async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const user = await storage.findOne('User', { _id: userId }) || await storage.findOne('User', { id: userId });
    const book = await storage.findOne('Book', { _id: bookId }) || await storage.findOne('Book', { id: bookId });

    if (!book || (book.availableCopies ?? book.available) <= 0) {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (user.role === 'faculty' ? 30 : 14));

    const transaction = await storage.create('Transaction', {
      user: userId,
      book: bookId,
      dueDate,
      status: 'active'
    });

    // Update book availability
    await storage.update('Book', bookId, { 
      availableCopies: (book.availableCopies ?? book.available) - 1,
      available: (book.available ?? book.availableCopies) - 1
    });

    // Log the issue
    await storage.log(req.user.name, 'BOOK_ISSUE', `Issued "${book.title}" to ${user.name}`);

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/transactions/return
router.post('/return', protect, authorize('custodian', 'admin'), async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await storage.findOne('Transaction', { _id: transactionId }) || await storage.findOne('Transaction', { id: transactionId });
    
    // Calculate fine
    const dueDate = new Date(transaction.dueDate);
    const returnDate = new Date();
    let fineAmount = 0;
    
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Fetch fine rate from settings
      const settings = await storage.findOne('Setting') || { finePerDay: 5 };
      fineAmount = diffDays * settings.finePerDay;
    }

    const updatedTx = await storage.update('Transaction', transactionId, {
      status: 'returned',
      returnDate,
      fineAmount
    });

    const book = await storage.findOne('Book', { _id: transaction.book }) || await storage.findOne('Book', { id: transaction.book });
    if (book) {
      await storage.update('Book', book._id || book.id, { 
        availableCopies: (book.availableCopies ?? 0) + 1
      });
    }

    // Log the return
    await storage.log(req.user.name, 'BOOK_RETURN', `Returned asset for transaction ${transactionId}`);

    res.json({ success: true, data: updatedTx });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
