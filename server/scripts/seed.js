import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Book from '../models/Book.js';

dotenv.config();

const books = [
  { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", category: "Technology", totalCopies: 5, availableCopies: 5, coverColor: "#7b2fff", publishedYear: 2008 },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0135957059", category: "Technology", totalCopies: 3, availableCopies: 3, coverColor: "#00ffc8", publishedYear: 1999 },
  { title: "Design Patterns", author: "Erich Gamma", isbn: "978-0201633610", category: "Computer Science", totalCopies: 2, availableCopies: 2, coverColor: "#ff4d6d", publishedYear: 1994 },
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0062316097", category: "History", totalCopies: 10, availableCopies: 10, coverColor: "#ffd700", publishedYear: 2011 },
  { title: "The Alchemist", author: "Paulo Coelho", isbn: "978-0062315007", category: "Fiction", totalCopies: 15, availableCopies: 15, coverColor: "#00b4d8", publishedYear: 1988 },
];

const seed = async () => {
  try {
    console.log('🚀 Starting Seeding Process...');
    
    // Connect to DB
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in .env');
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    console.log('🧹 Cleared existing database records');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@lib.edu',
      password: adminPassword,
      role: 'admin',
      department: 'Administration'
    });
    console.log(`👤 Created Admin: ${admin.email}`);

    // Create Librarian
    const libPassword = await bcrypt.hash('lib123', 10);
    const librarian = await User.create({
      name: 'Rohan Das',
      email: 'rohan@lib.edu',
      password: libPassword,
      role: 'librarian',
      department: 'Library'
    });
    console.log(`👤 Created Librarian: ${librarian.email}`);

    // Create Student
    const stuPassword = await bcrypt.hash('student123', 10);
    const student = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@lib.edu',
      password: stuPassword,
      role: 'student',
      department: 'Computer Science'
    });
    console.log(`👤 Created Student: ${student.email}`);

    // Seed Books
    await Book.insertMany(books);
    console.log(`📚 Seeded ${books.length} initial books`);

    console.log('✨ Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error.message);
    process.exit(1);
  }
};

seed();
