import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import storage from '../services/storageService.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { sendEmail, getOTPTemplate, getResetPasswordTemplate } from '../services/emailService.js';

// Normalize legacy 'librarian' role to 'custodian' after rebranding
const normalizeRole = (role) => role === 'librarian' ? 'custodian' : role;

const recordLogin = async (user, req) => {
  const loginEntry = {
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    timestamp: new Date()
  };
  
  const history = [loginEntry, ...(user.loginHistory || [])].slice(0, 10);
  await storage.update('User', user.id || user._id, { loginHistory: history });
};

export const sendOTP = async (req, res) => {
  const { email, name, role } = req.body;

  try {
    let user = await storage.findOne('User', { email });

    if (!user) {
      // Create a pending user
      user = await storage.create('User', { 
        email, 
        name: name || email.split('@')[0], 
        role: role || 'student',
        status: 'pending',
        isActive: false
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await storage.update('User', user.id || user._id, {
      otp: {
        code: hashedOTP,
        expiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      }
    });

    await sendEmail({
      email: user.email,
      subject: 'Your Nexus Verification Code',
      html: getOTPTemplate(otp),
    });

    await storage.log(user.name || 'GUEST', 'SECURITY', `OTP sent to ${user.email}`);

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await storage.findOne('User', { email });

    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const expiry = new Date(user.otp.expiry);
    if (expiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp.code);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark as verified and active (or keep pending if admin approval required)
    // For Nexus, we'll auto-verify but status might still be pending
    const updateData = {
      isVerified: true,
      otp: undefined,
      isActive: true,
      status: 'active' // In a strict library system, this would be 'pending'
    };

    await storage.update('User', user.id || user._id, updateData);
    
    const effectiveRole = normalizeRole(user.role);
    const accessToken = generateAccessToken(user.id || user._id, effectiveRole);
    const refreshToken = generateRefreshToken(user.id || user._id);
    
    // Update refresh token in DB
    await storage.update('User', user.id || user._id, { refreshToken });
    await recordLogin(user, req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
      data: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        department: user.department,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await storage.findOne('User', { email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await storage.update('User', user.id || user._id, {
      otp: {
        code: hashedOTP,
        expiry: new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    await sendEmail({
      email: user.email,
      subject: 'Your New Nexus Verification Code',
      html: getOTPTemplate(otp),
    });

    res.status(200).json({ success: true, message: 'OTP resent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    const userExists = await storage.findOne('User', { email });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await storage.create('User', { 
      name, 
      email, 
      password: hashedPassword, 
      isVerified: false, 
      role: role || 'student',
      department: department || 'General',
      status: 'pending',
      isActive: false
    });

    await storage.log(name, 'ACCOUNT', `New registration: ${email}`);

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await storage.update('User', user.id || user._id, {
      otp: {
        code: hashedOTP,
        expiry: new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      import('fs').then(fs => {
        import('path').then(path => {
          try {
            const scratchDir = path.join(process.cwd(), 'scratch');
            if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir);
            fs.writeFileSync(path.join(scratchDir, 'latest_otp.txt'), `Email: ${user.email}\nOTP: ${otp}\nTimestamp: ${new Date().toISOString()}`);
          } catch (err) {
            console.error('Failed to write OTP to scratch file:', err);
          }
        });
      });
    }

    await sendEmail({
      email: user.email,
      subject: 'Your Nexus Verification Code',
      html: getOTPTemplate(otp),
    });

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      data: { email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await storage.findOne('User', { email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Password not set. Please use OTP login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await storage.log(user.name, 'SECURITY', `Failed login attempt for ${email}`);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }

    const effectiveRole = normalizeRole(user.role);
    const accessToken = generateAccessToken(user.id || user._id, effectiveRole);
    const refreshToken = generateRefreshToken(user.id || user._id);
    
    await storage.update('User', user.id || user._id, { refreshToken });
    await recordLogin(user, req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
      data: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        department: user.department,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await storage.findOne('User', { email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    await storage.update('User', user.id || user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Nexus Password Reset Request',
      html: getResetPasswordTemplate(resetUrl),
    });

    res.status(200).json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await storage.findOne('User', {
      resetPasswordToken: hashedToken
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    
    const expiry = new Date(user.resetPasswordExpire);
    if (expiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Token expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await storage.update('User', user.id || user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies || {};
  if (refreshToken) {
    const user = await storage.findOne('User', { refreshToken });
    if (user) {
      await storage.update('User', user.id || user._id, { refreshToken: undefined });
    }
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out' });
};
