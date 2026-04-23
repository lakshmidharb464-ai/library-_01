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
    // Wait for a delay to allow mongoose to attempt connection
    // Atlas handshakes can take 1-2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
      { id: 'admin-1', name: 'System Admin', email: 'admin@lib.edu', password: hash, role: 'admin', department: 'Administration', isActive: true, status: 'active' },
      { id: 'lib-1', name: 'Rohan Das', email: 'rohan@lib.edu', password: hash, role: 'custodian', department: 'Library', isActive: true, status: 'active' },
      { id: 'stu-1', name: 'Aarav Sharma', email: 'aarav@lib.edu', password: hash, role: 'student', department: 'Computer Science', isActive: true, status: 'active' },
      { id: 'fac-1', name: 'Dr. Sarah', email: 'teacher@lib.edu', password: hash, role: 'faculty', department: 'Mathematics', isActive: true, status: 'active' },
      { id: 'stu-pending', name: 'John Doe', email: 'john@lib.edu', password: hash, role: 'student', department: 'Biology', isActive: false, status: 'pending' },
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
      maxBooksPerFaculty: 5,
      maxBorrowDays: 14,
      maxBooksPerUser: 5,
      fineRatePerDay: 1.00,
      gracePeriodDays: 2,
      maxHoldDays: 7,
      defaultFineCurrency: 'USD',
      maxReservationLimit: 5,
      autoRenewEnabled: true,
      enforceConditionChecks: true,
      autoNotifyOverdue: true,
      autoRestocking: false,
      enableDigitalLending: true,
      allowInterLibraryLoan: false,
      maintenanceMode: false,
      autoArchiveOldLogs: true,
      requireTwoFactorForStaff: false,
      facultyAllowSyllabusPublic: true,
      facultyAutoApproveBibliography: false,
      facultyNotifyStudentOnReading: true,
      facultyResearchPortalAccess: true,
      facultyGrantManagement: false,
      facultyCollaborativeAnnotating: true,
      facultyCustomDashboardLayout: false,
      facultyAutoRenewLimit: 3,
      facultyPriorityQueuing: true,
      facultyResourceExport: true,
      facultyPeerReviewSystem: false,
      studentAllowSelfRenew: true,
      studentNotifyDueSoon: true,
      defaultTimerMins: 25,
      dailyReadingGoal: 20,
      dailyReminderTime: 18,
      focusModeEnabled: false,
      publicReadingHistory: false,
      studentAutoRenew: false,
      readerDarkMode: false,
      autoAcceptGroups: false,
      emailForwarding: false,
      hapticEnabled: true,
      newsletterSub: false,
      betaAccess: false,
      highContrast: false,
      studentReadingChallenges: true,
      studentStudyRoomBooking: true
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
  async find(modelName, query = {}, options = {}) {
    await this.ensureInitialized();
    // Helper to process query and convert string regexes to RegExp objects
    const processQuery = (q) => {
      const processed = {};
      Object.entries(q).forEach(([key, val]) => {
        if (key === '$or' || key === '$and') {
          processed[key] = val.map(v => processQuery(v));
        } else if (typeof val === 'string' && val.startsWith('/') && val.lastIndexOf('/') > 0) {
          const lastSlash = val.lastIndexOf('/');
          const pattern = val.slice(1, lastSlash);
          const flags = val.slice(lastSlash + 1);
          processed[key] = new RegExp(pattern, flags || 'i');
        } else {
          processed[key] = val;
        }
      });
      return processed;
    };

    const processedQuery = processQuery(query);

    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      let mQuery = Model.find(processedQuery);
      
      if (options.populate) mQuery = mQuery.populate(options.populate);
      if (options.sort) mQuery = mQuery.sort(options.sort);
      if (options.limit) mQuery = mQuery.limit(options.limit);
      if (options.skip) mQuery = mQuery.skip(options.skip);
      
      return await mQuery.lean();
    }
    
    const collection = this.getCollectionName(modelName);
    let list = [...(this.data[collection] || [])];
    
    // Advanced filtering in JSON mode
    if (Object.keys(processedQuery).length > 0) {
      list = list.filter(item => {
        const match = (q, i) => {
          return Object.entries(q).every(([key, val]) => {
            if (val === undefined || val === null) return true;
            
            if (key === '$or' && Array.isArray(val)) {
              return val.some(subQ => match(subQ, i));
            }
            
            if (key === '$and' && Array.isArray(val)) {
              return val.every(subQ => match(subQ, i));
            }

            if (val instanceof RegExp) {
              return val.test(i[key] || '');
            }

            if (typeof val === 'string' && typeof i[key] === 'string') {
              return i[key].toLowerCase().includes(val.toLowerCase());
            }
            
            return i[key] === val;
          });
        };
        return match(processedQuery, item);
      });
    }
    
    // Sort
    if (options.sort) {
      const [field, order] = Object.entries(options.sort)[0];
      list.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (order === -1 || order === 'desc') return valA < valB ? 1 : -1;
        return valA > valB ? 1 : -1;
      });
    }
    
    // Pagination
    if (options.skip) list = list.slice(options.skip);
    if (options.limit) list = list.slice(0, options.limit);
    
    return list;
  }

  async findOne(modelName, query = {}, options = {}) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      if (modelName === 'Setting') {
        let settings = await Model.findOne(query).lean();
        if (!settings) {
          settings = await Model.create(this.data.settings || {});
        }
        return settings;
      }
      let mQuery = Model.findOne(query);
      if (options.populate) mQuery = mQuery.populate(options.populate);
      return await mQuery.lean();
    }
    
    // Special case for settings
    if (modelName === 'Setting') {
      return this.data.settings;
    }

    const collection = this.getCollectionName(modelName);
    const list = this.data[collection] || [];
    return list.find(item => {
      return Object.entries(query).every(([key, val]) => {
        const itemVal = item[key];
        const targetVal = val;
        // Handle ID matching for both _id and id
        if (key === '_id' || key === 'id') {
          return item._id === targetVal || item.id === targetVal;
        }
        return itemVal === targetVal;
      });
    });
  }

  async count(modelName, query = {}) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.countDocuments(query);
    }
    const collection = this.getCollectionName(modelName);
    const list = this.data[collection] || [];
    if (Object.keys(query).length === 0) return list.length;
    
    return list.filter(item => {
      return Object.entries(query).every(([key, val]) => item[key] === val);
    }).length;
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
      if (modelName === 'Setting') {
        return await Model.findOneAndUpdate({}, payload, { new: true, upsert: true }).lean();
      }
      return await Model.findByIdAndUpdate(id, payload, { new: true }).lean();
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
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    }
    const collection = this.getCollectionName(modelName);
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => item._id !== id && item.id !== id);
    this.saveToFile();
    return initialLen !== this.data[collection].length;
  }

  async deleteMany(modelName, query = {}) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.deleteMany(query);
    }
    const collection = this.getCollectionName(modelName);
    if (Object.keys(query).length === 0) {
      this.data[collection] = [];
    } else {
      this.data[collection] = this.data[collection].filter(item => {
        return !Object.entries(query).every(([key, val]) => item[key] === val);
      });
    }
    this.saveToFile();
    return true;
  }

  async insertMany(modelName, items) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.insertMany(items);
    }
    const collection = this.getCollectionName(modelName);
    if (!this.data[collection]) this.data[collection] = [];
    const newItems = items.map(item => ({
      ...item,
      _id: Math.random().toString(36).substr(2, 9),
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }));
    this.data[collection].push(...newItems);
    this.saveToFile();
    return newItems;
  }

  async aggregate(modelName, pipeline = []) {
    await this.ensureInitialized();
    if (this.isUsingMongo) {
      const Model = mongoose.model(modelName);
      return await Model.aggregate(pipeline);
    }
    
    // Basic aggregation for JSON (summary only)
    const collection = this.getCollectionName(modelName);
    const data = this.data[collection] || [];
    
    // Simplified: if pipeline has $match, $group, etc., we would need a complex parser.
    // For now, return basic stats if it's a known aggregation type.
    return [{ total: data.length }];
  }

  async log(user, action, details) {
    return await this.create('AuditLog', { user, action, details });
  }
}

const storage = new StorageService();
export default storage;
