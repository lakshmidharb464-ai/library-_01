import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Setting from '../models/Setting.js';

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
    await Setting.deleteMany({});
    console.log('🧹 Cleared existing database records');

    // Default Password
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@lib.edu',
      password: hashedPassword,
      role: 'admin',
      department: 'Administration',
      status: 'active',
      isActive: true
    });
    console.log(`👤 Created Admin: ${admin.email}`);

    // Create Custodian
    const custodian = await User.create({
      name: 'Rohan Das',
      email: 'rohan@lib.edu',
      password: hashedPassword,
      role: 'custodian',
      department: 'Library',
      status: 'active',
      isActive: true
    });
    console.log(`👤 Created Custodian: ${custodian.email}`);

    // Create Student
    const student = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@lib.edu',
      password: hashedPassword,
      role: 'student',
      department: 'Computer Science',
      status: 'active',
      isActive: true
    });
    console.log(`👤 Created Student: ${student.email}`);

    // Seed Books
    await Book.insertMany(books);
    console.log(`📚 Seeded ${books.length} initial books`);

    // Seed Settings
    await Setting.create({
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
    });
    console.log('⚙️  Seeded default library settings');

    console.log('✨ Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error.message);
    process.exit(1);
  }
};

seed();

