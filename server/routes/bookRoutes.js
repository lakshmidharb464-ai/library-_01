import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const books = await storage.find('Book');
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/books
router.post('/', protect, authorize('librarian', 'admin'), async (req, res) => {
  try {
    const book = await storage.create('Book', req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/books/:id
router.put('/:id', protect, authorize('librarian', 'admin'), async (req, res) => {
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

export default router;
