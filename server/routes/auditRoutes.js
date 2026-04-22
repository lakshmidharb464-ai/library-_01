import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await storage.find('AuditLog');
    // Sort by createdAt descending
    const sorted = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/audit-logs/clear (Optional for admin)
router.post('/clear', protect, authorize('admin'), async (req, res) => {
  try {
    if (storage.isUsingMongo) {
      const AuditLog = mongoose.model('AuditLog');
      await AuditLog.deleteMany({});
    } else {
      storage.data.auditlogs = [];
      storage.saveToFile();
    }
    res.json({ success: true, message: 'Logs cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
