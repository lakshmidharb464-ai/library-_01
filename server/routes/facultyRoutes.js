import express from 'express';
import storage from '../services/storageService.js';

const router = express.Router();

// Syllabi
router.get('/syllabi', async (req, res) => {
  try {
    const data = await storage.find('Syllabus');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/syllabi', async (req, res) => {
  try {
    const data = await storage.create('Syllabus', req.body);
    await storage.log(req.body.facultyName || 'Faculty', 'SYLLABUS_CREATED', `Course: ${req.body.courseCode}`);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/syllabi/:id', async (req, res) => {
  try {
    const data = await storage.update('Syllabus', req.params.id, req.body);
    await storage.log(req.body.facultyName || 'Faculty', 'SYLLABUS_UPDATED', `Course: ${req.body.courseCode}`);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/syllabi/:id', async (req, res) => {
  try {
    await storage.delete('Syllabus', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bibliographies
router.get('/bibliographies', async (req, res) => {
  try {
    const data = await storage.find('Bibliography');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/bibliographies', async (req, res) => {
  try {
    const data = await storage.create('Bibliography', req.body);
    await storage.log(req.body.userId || 'Faculty', 'BIBLIOGRAPHY_ENTRY_ADDED', `Style: ${req.body.style}, Project: ${req.body.projectName}`);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/bibliographies/:id', async (req, res) => {
  try {
    await storage.delete('Bibliography', req.params.id);
    await storage.log('Faculty', 'BIBLIOGRAPHY_ENTRY_REMOVED', `ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reading Progress
router.get('/progress', async (req, res) => {
  try {
    const data = await storage.find('ReadingProgress');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/progress', async (req, res) => {
  try {
    const existing = await storage.findOne('ReadingProgress', { userId: req.body.userId, bookId: req.body.bookId });
    let data;
    if (existing) {
      data = await storage.update('ReadingProgress', existing._id || existing.id, { ...req.body, updatedAt: new Date() });
      await storage.log(req.body.userId || 'User', 'READING_PROGRESS_UPDATED', `Status: ${req.body.status}, Page: ${req.body.currentPage}`);
    } else {
      data = await storage.create('ReadingProgress', req.body);
      await storage.log(req.body.userId || 'User', 'READING_PROGRESS_INITIALIZED', `Book: ${req.body.bookId}`);
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/progress/:id', async (req, res) => {
  try {
    await storage.delete('ReadingProgress', req.params.id);
    await storage.log('User', 'READING_PROGRESS_REMOVED', `ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const data = await storage.find('Recommendation');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    const data = await storage.create('Recommendation', req.body);
    await storage.log(req.body.requestedByName || 'User', 'BOOK_RECOMMENDED', `Book: ${req.body.title}`);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
