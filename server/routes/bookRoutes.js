import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const { category, author, sort, limit, skip } = req.query;
    const query = {};
    if (category) query.category = category;
    if (author) query.author = author;

    const options = {
      sort: sort ? { [sort]: req.query.order === 'desc' ? -1 : 1 } : { createdAt: -1 },
      limit: limit ? parseInt(limit) : 100,
      skip: skip ? parseInt(skip) : 0
    };

    const books = await storage.find('Book', query, options);
    const total = await storage.count('Book', query);
    
    res.json({ 
      success: true, 
      data: books,
      pagination: {
        total,
        limit: options.limit,
        skip: options.skip
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/books/search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    // Use regex-like search for title or author
    const query = {
      $or: [
        { title: `/${q}/` },
        { author: `/${q}/` }
      ]
    };
    
    // In Mongo, we should actually use a real regex if we were calling it directly,
    // but our StorageService handles the string-regex conversion.
    
    const books = await storage.find('Book', query, { limit: 20 });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/books
router.post('/', protect, authorize('custodian', 'admin'), async (req, res) => {
  try {
    const book = await storage.create('Book', req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/books/:id
router.put('/:id', protect, authorize('custodian', 'admin'), async (req, res) => {
  try {
    const book = await storage.update('Book', req.params.id, req.body);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/books/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const success = await storage.delete('Book', req.params.id);
    if (!success) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// POST /api/books/seed
router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    await storage.deleteMany('Book');
    const books = await storage.insertMany('Book', req.body);
    res.status(201).json({ success: true, data: books });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
