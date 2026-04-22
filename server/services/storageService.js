import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}

class StorageService {
  constructor() {
    this.isUsingMongo = false;
    this.data = { users: [], books: [], transactions: [], auditlogs: [], settings: {}, syllabi: [], bibliographies: [], readingprogress: [], recommendations: [] };
    this.initPromise = this.init();
  }

  async init() {
    // Wait for a small delay to allow mongoose to attempt connection
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mongoose.connection.readyState === 1) {
      this.isUsingMongo = true;
      console.log('📦 Storage Service: Using MongoDB Engine');
    } else {
      this.isUsingMongo = false;
      this.loadFromFile();
      if (this.data.users.length === 0) {
        await this.seed();
      }
      console.log('📁 Storage Service: Using JSON File Engine (Fallback)');
    }
  }

  async ensureInitialized() {
    await this.initPromise;
  }

  async seed() {
    console.log('🌱 Storage Service: Seeding initial data...');
    const hash = await bcrypt.hash('demo123', 10).catch(() => '$2b$10$obGYfMfGPcS9/EtdCd5RBOw8AswK867ZtIDGwf7Rl3eSr9ptXNhMW');

    this.data.users = [
      { id: 'admin-1', name: 'System Admin', email: 'admin@lib.edu', password: hash, role: 'admin', department: 'Administration', isActive: true },
      { id: 'lib-1', name: 'Rohan Das', email: 'rohan@lib.edu', password: hash, role: 'librarian', department: 'Library', isActive: true },
      { id: 'stu-1', name: 'Aarav Sharma', email: 'aarav@lib.edu', password: hash, role: 'student', department: 'Computer Science', isActive: true },
      { id: 'fac-1', name: 'Dr. Sarah', email: 'teacher@lib.edu', password: hash, role: 'faculty', department: 'Mathematics', isActive: true }
    ];

    this.data.books = [
      { 
        id: 'book-1', 
        title: 'Clean Code', 
        author: 'Robert C. Martin', 
        category: 'Technology', 
        availableCopies: 5, 
        totalCopies: 5, 
        publishedYear: 2008, 
        coverColor: '#7b2fff',
        rating: 4.8
      },
      { 
        id: 'book-2', 
        title: 'The Alchemist', 
        author: 'Paulo Coelho', 
        category: 'Fiction', 
        availableCopies: 10, 
        totalCopies: 10, 
        publishedYear: 1988, 
        coverColor: '#00b4d8',
        rating: 4.5
      }
    ];

    this.data.settings = {
      libraryName: 'LibraNova Smart Library',
      finePerDay: 5,
      studentLoanDays: 14,
      facultyLoanDays: 30,
      maxBooksPerStudent: 3,
      maxBooksPerFaculty: 5
    };

    this.saveToFile();
  }

  loadFromFile() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } catch (e) {
        console.error('Failed to load JSON DB:', e);
      }
    } else {
      this.saveToFile();
    }
  }

  saveToFile() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
  }

  getCollectionName(modelName) {
    const map = {
      'Syllabus': 'syllabi',
      'Bibliography': 'bibliographies',
      'ReadingProgress': 'readingprogress',
      'Recommendation': 'recommendations',
      'User': 'users',
      'Book': 'books',
      'Transaction': 'transactions',
      'AuditLog': 'auditlogs',
      'Setting': 'settings'
    };
    return map[modelName] || modelName.toLowerCase() + 's';
  }

  // Common CRUD API
  async find(modelName, query = {}) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.find(query);
    }
    const collection = this.getCollectionName(modelName);
    return this.data[collection] || [];
  }

  async findOne(modelName, query = {}) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.findOne(query);
    }
    
    // Special case for settings
    if (modelName === 'Setting') {
      return this.data.settings;
    }

    const collection = this.getCollectionName(modelName);
    const list = this.data[collection] || [];
    return list.find(item => {
      return Object.entries(query).every(([key, val]) => item[key] === val);
    });
  }

  async create(modelName, payload) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.create(payload);
    }
    const collection = this.getCollectionName(modelName);
    const newItem = { 
      ...payload, 
      _id: Math.random().toString(36).substr(2, 9),
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    if (!this.data[collection]) this.data[collection] = [];
    this.data[collection].push(newItem);
    this.saveToFile();
    return newItem;
  }

  async update(modelName, id, payload) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.findByIdAndUpdate(id, payload, { new: true });
    }

    // Special case for settings
    if (modelName === 'Setting') {
      this.data.settings = { ...this.data.settings, ...payload };
      this.saveToFile();
      return this.data.settings;
    }

    const collection = this.getCollectionName(modelName);
    const index = this.data[collection].findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    
    this.data[collection][index] = { ...this.data[collection][index], ...payload };
    this.saveToFile();
    return this.data[collection][index];
  }

  async delete(modelName, id) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.findByIdAndDelete(id);
    }
    const collection = this.getCollectionName(modelName);
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => item._id !== id && item.id !== id);
    this.saveToFile();
    return initialLen !== this.data[collection].length;
  }

  async log(user, action, details) {
    return await this.create('AuditLog', { user, action, details });
  }
}

const storage = new StorageService();
export default storage;
