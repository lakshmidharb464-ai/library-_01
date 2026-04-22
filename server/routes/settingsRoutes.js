import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/settings
router.get('/', protect, async (req, res) => {
  try {
    const settings = await storage.findOne('Setting');
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const updatedSettings = await storage.update('Setting', null, req.body);
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
