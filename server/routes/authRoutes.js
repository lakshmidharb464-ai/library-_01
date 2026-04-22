import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import storage from '../services/storageService.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use storage service instead of direct Mongoose
    const user = await storage.findOne('User', { email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, role: user.role },
      process.env.JWT_SECRET || 'nebula-secret-key-2026',
      { expiresIn: '1d' }
    );

    // Log the login
    await storage.log(user.name, 'LOGIN', `Successful login from ${user.email}`);

    res.json({
      success: true,
      token,
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user exists
    const existing = await storage.findOne('User', { email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Security patch: Only allow student or faculty registration
    const allowedRoles = ['student', 'faculty'];
    const safeRole = allowedRoles.includes(role) ? role : 'student';

    const user = await storage.create('User', {
      name,
      email,
      password: hashedPassword,
      role: safeRole,
      department: department || 'General'
    });

    const token = jwt.sign(
      { id: user._id || user.id, role: user.role },
      process.env.JWT_SECRET || 'nebula-secret-key-2026',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
