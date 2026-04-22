import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'faculty', 'librarian', 'admin'],
    default: 'student' 
  },
  department: { type: String, default: 'Computer Science' },
  isActive: { type: Boolean, default: true },
  borrowLimit: { type: Number, default: 3 },
  maxDays: { type: Number, default: 14 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);