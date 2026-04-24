import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

// PATCH /api/admin/approve/:id - Approve a pending user
router.patch('/approve/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await storage.findOne('User', { _id: userId }) || await storage.findOne('User', { id: userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updated = await storage.update('User', userId, { status: 'active', isActive: true });
    await storage.log(req.user.id, 'ADMIN', `Approved user: ${user.name} (${user.email})`);

    const { password, ...safeUser } = updated;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/reject/:id - Reject a pending user
router.patch('/reject/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await storage.findOne('User', { _id: userId }) || await storage.findOne('User', { id: userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updated = await storage.update('User', userId, { status: 'rejected', isActive: false });
    await storage.log(req.user.id, 'ADMIN', `Rejected user: ${user.name} (${user.email})`);

    const { password, ...safeUser } = updated;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/announcements - Create announcement (persisted)
router.post('/announcements', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, body, priority, pinned } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    const announcement = await storage.create('AuditLog', {
      action: 'ANNOUNCEMENT',
      user: req.user.id,
      details: JSON.stringify({ title, body, priority: priority || 'info', pinned: !!pinned, author: req.body.author || 'Admin' }),
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
