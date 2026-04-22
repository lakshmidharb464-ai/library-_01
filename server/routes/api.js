import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

const router = express.Router();

const SEED_BOOKS = [
  { id: 'b1', title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', isbn: '978-0135957059', category: 'Technology', copies: 5, available: 4, rating: 4.8, coverColor: '#00ffc8', year: 2019 },
  { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Technology', copies: 4, available: 2, rating: 4.6, coverColor: '#7b2fff', year: 2008 },
  { id: 'b3', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', isbn: '978-0262033848', category: 'Computer Science', copies: 3, available: 3, rating: 4.7, coverColor: '#00b4d8', year: 2009 },
  { id: 'b4', title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', isbn: '978-0062316097', category: 'History', copies: 6, available: 5, rating: 4.9, coverColor: '#ffd700', year: 2015 },
  { id: 'b5', title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', category: 'Self Development', copies: 8, available: 6, rating: 4.8, coverColor: '#ff4d6d', year: 2018 },
  { id: 'b6', title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', category: 'Technology', copies: 3, available: 1, rating: 4.5, coverColor: '#ff8c00', year: 1994 },
  { id: 'b7', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Fiction', copies: 5, available: 5, rating: 4.1, coverColor: '#90e0ef', year: 1925 },
  { id: 'b8', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0374533557', category: 'Psychology', copies: 4, available: 3, rating: 4.6, coverColor: '#c77dff', year: 2011 },
];

const SEED_USERS = [
  { id: 'u1', name: 'Aarav Sharma', email: 'aarav@lib.edu', role: 'student', department: 'Computer Science', joinDate: '2024-01-15', status: 'active' },
  { id: 'u2', name: 'Priya Mehta', email: 'priya@lib.edu', role: 'faculty', department: 'Mathematics', joinDate: '2023-08-01', status: 'active' },
  { id: 'u3', name: 'Rohan Das', email: 'rohan@lib.edu', role: 'librarian', department: 'Library', joinDate: '2022-06-10', status: 'active' },
  { id: 'u4', name: 'Sneha Patel', email: 'sneha@lib.edu', role: 'student', department: 'Physics', joinDate: '2024-03-20', status: 'active' },
  { id: 'u5', name: 'Vikram Nair', email: 'vikram@lib.edu', role: 'faculty', department: 'Chemistry', joinDate: '2023-07-15', status: 'active' },
];

// Memory Fallback Storage (Initial seed)
let memBooks = [...SEED_BOOKS];
let memUsers = [...SEED_USERS];

// GET /api/status - simple health check
router.get('/status', (req, res) => {
  res.json({ 
    status: 'Backend API is running',
    mode: isDbConnected ? 'Database' : 'Autonomous Memory',
    dbConnected: isDbConnected 
  });
});

/* ── Books ────────────────────────────────────────────────────── */

// GET /api/books - Get all books
router.get('/books', async (req, res) => {
  try {
    if (!isDbConnected) return res.json(memBooks);
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/books - Create a new book
router.post('/books', async (req, res) => {
  try {
    if (!isDbConnected) {
      const newBook = { ...req.body, id: `mb${Date.now()}`, _id: `mb${Date.now()}` };
      memBooks.push(newBook);
      return res.status(201).json(newBook);
    }
    const book = new Book(req.body);
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/books/seed - Seed books
router.post('/books/seed', async (req, res) => {
  try {
    const books = req.body;
    if (!isDbConnected) {
      memBooks = books.map((b, i) => ({ ...b, id: b.id || `mb${i}`, _id: b.id || `mb${i}` }));
      return res.status(201).json(memBooks);
    }
    await Book.deleteMany({});
    const createdBooks = await Book.insertMany(books);
    res.status(201).json(createdBooks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ── Users ────────────────────────────────────────────────────── */

// GET /api/users - Get all users
router.get('/users', async (req, res) => {
  try {
    if (!isDbConnected) return res.json(memUsers);
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/seed - Seed users
router.post('/users/seed', async (req, res) => {
  try {
    const users = req.body;
    if (!isDbConnected) {
      memUsers = users.map((u, i) => ({ ...u, id: u.id || `mu${i}`, _id: u.id || `mu${i}` }));
      return res.status(201).json(memUsers);
    }
    await User.deleteMany({});
    const createdUsers = await User.insertMany(users);
    res.status(201).json(createdUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/users - Create a new user
router.post('/users', async (req, res) => {
  try {
    if (!isDbConnected) {
      const newUser = { ...req.body, id: `mu${Date.now()}`, _id: `mu${Date.now()}` };
      memUsers.push(newUser);
      return res.status(201).json(newUser);
    }
    const user = new User(req.body);
    const createdUser = await user.save();
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/users/:id - Update an existing user (including status)
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (!isDbConnected) {
      const idx = memUsers.findIndex(u => u.id === id || u._id === id);
      if (idx === -1) return res.status(404).json({ message: 'User not found' });
      memUsers[idx] = { ...memUsers[idx], ...req.body };
      return res.json(memUsers[idx]);
    }
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/users/:id - Remove a user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (!isDbConnected) {
      const initialLen = memUsers.length;
      memUsers = memUsers.filter(u => u.id !== id && u._id !== id);
      if (memUsers.length === initialLen) return res.status(404).json({ message: 'User not found' });
      return res.json({ message: 'User deleted' });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
