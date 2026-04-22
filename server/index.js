import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/faculty', facultyRoutes);

// GET /api/status - simple health check
app.get('/api/status', (req, res) => {
  res.json({ 
    success: true,
    status: 'Backend API is running',
    timestamp: new Date()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('LibraNova Backend API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
