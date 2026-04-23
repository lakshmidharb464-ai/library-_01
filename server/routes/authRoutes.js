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
      await storage.log('GUEST', 'SECURITY', `Failed login attempt: Non-existent account (${email})`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
    
    if (!isMatch) {
      await storage.log(user.name, 'SECURITY', `Failed login attempt: Incorrect password for ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'pending' || !user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval or suspended.' });
    }

    // Check if 2FA is enabled for this user (simulation: check global settings)
    const settings = await storage.findOne('Settings', { libraryName: { $exists: true } });
    const is2faEnabled = settings?.twoFactorEnabled || false;

    if (is2faEnabled) {
      // Log that 2FA is required
      await storage.log(user.name, 'SECURITY', `Nexus Protocol: 2FA Authentication challenge issued for ${user.email}`);
      
      return res.json({
        success: true,
        twoFactorRequired: true,
        tempId: user._id || user.id, // In a real app, this would be a temp token
        data: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
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
    const allowedRoles = ['student', 'faculty', 'custodian'];
    const safeRole = allowedRoles.includes(role) ? role : 'student';

    const user = await storage.create('User', {
      name,
      email,
      password: hashedPassword,
      role: safeRole,
      department: department || 'General',
      status: 'pending',
      isActive: false
    });

    // Log the registration
    await storage.log(name, 'ACCOUNT', `New registration initiated as ${safeRole} from ${email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Pending admin approval.',
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// PUT /api/auth/change-password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nebula-secret-key-2026');
    
    const user = await storage.findOne('User', { _id: decoded.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password).catch(() => currentPassword === user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.update('User', user._id || user.id, { password: hashedPassword });
    // Log the password change
    await storage.log(user.name, 'SECURITY', 'Password updated successfully');

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    // Validate pulse code (simulation)
    if (code !== '123456') {
      await storage.log('SYSTEM', 'SECURITY', `Nexus Pulse mismatch: Unauthorized entity access attempt for user ID: ${userId}`);
      return res.status(401).json({ success: false, message: 'Invalid Nexus Pulse code' });
    }

    const user = await storage.findOne('User', { _id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, role: user.role },
      process.env.JWT_SECRET || 'nebula-secret-key-2026',
      { expiresIn: '1d' }
    );

    await storage.log(user.name, 'LOGIN', `Nexus Pulse synchronized: Biometric identity confirmed for ${user.email}`);

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

export default router;
