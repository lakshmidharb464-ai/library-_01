import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/users
router.get('/', protect, authorize('admin', 'librarian'), async (req, res) => {
  try {
    const users = await storage.find('User');
    // Hide passwords
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json({ success: true, data: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = await storage.create('User', { ...rest, password: hashedPassword });
    const { password: p, ...safeUser } = user;
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await storage.update('User', req.params.id, req.body);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const success = await storage.delete('User', req.params.id);
    if (!success) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;