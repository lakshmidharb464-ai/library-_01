import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/users
router.get('/', protect, authorize('admin', 'custodian'), async (req, res) => {
  try {
    const { role, q } = req.query;
    const query = {};
    if (role) query.role = role;
    if (q) {
      query.$or = [
        { name: `/${q}/` },
        { email: `/${q}/` }
      ];
    }

    const users = await storage.find('User', query);
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
router.put('/:id', protect, authorize('admin', 'custodian'), async (req, res) => {
  try {
    const targetUser = await storage.findOne('User', { _id: req.params.id }) || await storage.findOne('User', { id: req.params.id });
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Custodian security check: can only edit students or faculty
    if (req.user.role === 'custodian' && !['student', 'faculty'].includes(targetUser.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this user role' });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await storage.update('User', req.params.id, req.body);
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

// PUT /api/users/profile/security
router.put('/profile/security', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await storage.findOne('User', { _id: userId }) || await storage.findOne('User', { id: userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password).catch(() => currentPassword === user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user
    await storage.update('User', userId, { password: hashedPassword });
    
    // Log the security action
    await storage.log(user.name, 'SECURITY', `Password updated successfully for ${user.email}`);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/seed
router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    await storage.deleteMany('User');
    const users = await storage.insertMany('User', req.body);
    res.status(201).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;