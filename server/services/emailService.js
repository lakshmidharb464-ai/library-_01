import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Libranova Nexus" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    // In development, we might want to log the OTP to console if email fails
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- DEVELOPMENT ONLY: Email Content ---');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Content:', options.html);
      console.log('---------------------------------------');
    }
  }
};

export const getOTPTemplate = (otp) => `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #6366f1; margin: 0;">Libranova Nexus</h2>
  </div>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello,</p>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Use the following 6-digit code to verify your account. This code is valid for <strong>5 minutes</strong>.</p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #111827; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
  </div>
  <p style="color: #6b7280; font-size: 14px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
  <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; 2026 Libranova Systems. All rights reserved.</p>
</div>
`;

export const getResetPasswordTemplate = (resetUrl) => `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #6366f1; margin: 0;">Libranova Security</h2>
  </div>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello,</p>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">You requested to reset your password. Click the button below to proceed. This link expires in <strong>10 minutes</strong>.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
  </div>
  <p style="color: #6b7280; font-size: 14px; text-align: center;">If you didn't request this, please change your password immediately.</p>
  <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; 2026 Libranova Systems. All rights reserved.</p>
</div>
`;
