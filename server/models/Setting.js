import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  // General Library Settings (Managed by Admin/Custodian)
  libraryName: { type: String, default: 'LibraNova Smart Library' },
  finePerDay: { type: Number, default: 5 },
  studentLoanDays: { type: Number, default: 14 },
  facultyLoanDays: { type: Number, default: 30 },
  maxBooksPerStudent: { type: Number, default: 3 },
  maxBooksPerFaculty: { type: Number, default: 5 },
  maxBorrowDays: { type: Number, default: 14 },
  maxBooksPerUser: { type: Number, default: 5 },
  fineRatePerDay: { type: Number, default: 1.00 },
  gracePeriodDays: { type: Number, default: 2 },
  maxHoldDays: { type: Number, default: 7 },
  defaultFineCurrency: { type: String, default: 'USD' },
  maxReservationLimit: { type: Number, default: 5 },
  
  // Custodian specific flags (6 features)
  autoRenewEnabled: { type: Boolean, default: true },
  enforceConditionChecks: { type: Boolean, default: true },
  autoNotifyOverdue: { type: Boolean, default: true },
  autoRestocking: { type: Boolean, default: false },
  enableDigitalLending: { type: Boolean, default: true },
  allowInterLibraryLoan: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false },
  autoArchiveOldLogs: { type: Boolean, default: true },
  requireTwoFactorForStaff: { type: Boolean, default: false },

  // Faculty specific flags (9 features)
  facultyAllowSyllabusPublic: { type: Boolean, default: true },
  facultyAutoApproveBibliography: { type: Boolean, default: false },
  facultyNotifyStudentOnReading: { type: Boolean, default: true },
  facultyResearchPortalAccess: { type: Boolean, default: true },
  facultyGrantManagement: { type: Boolean, default: false },
  facultyCollaborativeAnnotating: { type: Boolean, default: true },
  facultyCustomDashboardLayout: { type: Boolean, default: false },
  facultyAutoRenewLimit: { type: Number, default: 3 },
  facultyPriorityQueuing: { type: Boolean, default: true },
  facultyResourceExport: { type: Boolean, default: true },
  facultyPeerReviewSystem: { type: Boolean, default: false },
  
  // Student specific flags (13+ features)
  studentAllowSelfRenew: { type: Boolean, default: true },
  studentNotifyDueSoon: { type: Boolean, default: true },
  defaultTimerMins: { type: Number, default: 25 },
  dailyReadingGoal: { type: Number, default: 20 },
  dailyReminderTime: { type: Number, default: 18 },
  focusModeEnabled: { type: Boolean, default: false },
  publicReadingHistory: { type: Boolean, default: false },
  studentAutoRenew: { type: Boolean, default: false },
  readerDarkMode: { type: Boolean, default: false },
  autoAcceptGroups: { type: Boolean, default: false },
  emailForwarding: { type: Boolean, default: false },
  hapticEnabled: { type: Boolean, default: true },
  newsletterSub: { type: Boolean, default: false },
  betaAccess: { type: Boolean, default: false },
  highContrast: { type: Boolean, default: false },
  studentReadingChallenges: { type: Boolean, default: true },
  studentStudyRoomBooking: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
