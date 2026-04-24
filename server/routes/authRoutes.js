import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Public Routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);

export default router;
