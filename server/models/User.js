import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'faculty', 'custodian', 'admin'],
    default: 'student' 
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  department: { type: String, default: 'Computer Science' },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiry: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  loginHistory: [{
    ip: String,
    userAgent: String,
    location: String,
    timestamp: { type: Date, default: Date.now }
  }],
  refreshToken: String,
  isActive: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['active', 'pending', 'suspended'], 
    default: 'pending' 
  },
  borrowLimit: { type: Number, default: 3 },
  maxDays: { type: Number, default: 14 }
}, { timestamps: true });

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  const bcrypt = await import('bcryptjs').then(m => m.default);
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);