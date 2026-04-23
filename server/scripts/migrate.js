import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import dns from 'dns';

// Fix DNS for Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '../data/db.json');

// Models
import User from '../models/User.js';
import Book from '../models/Book.js';
// Import other models as needed

async function migrate() {
  try {
    console.log('🚀 Starting Migration to MongoDB...');
    
    if (!fs.existsSync(DB_FILE)) {
      console.log('❌ No JSON database found to migrate.');
      return;
    }

    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // 1. Migrate Users
    if (data.users && data.users.length > 0) {
      const existingUsers = await User.countDocuments();
      if (existingUsers === 0) {
        console.log(`👤 Migrating ${data.users.length} users...`);
        // Remove 'id' and let Mongo generate '_id', or map them
        const usersToInsert = data.users.map(u => {
          const { id, ...rest } = u;
          return rest;
        });
        await User.insertMany(usersToInsert);
        console.log('✅ Users migrated');
      } else {
        console.log('ℹ️ Users already exist in MongoDB, skipping user migration.');
      }
    }

    // 2. Migrate Books
    if (data.books && data.books.length > 0) {
      const existingBooks = await Book.countDocuments();
      if (existingBooks === 0) {
        console.log(`📚 Migrating ${data.books.length} books...`);
        const booksToInsert = data.books.map(b => {
          const { id, ...rest } = b;
          return rest;
        });
        await Book.insertMany(booksToInsert);
        console.log('✅ Books migrated');
      } else {
        console.log('ℹ️ Books already exist in MongoDB, skipping book migration.');
      }
    }

    console.log('🎉 Migration Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
    process.exit(1);
  }
}

migrate();
