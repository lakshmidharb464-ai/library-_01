import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/settings
router.get('/', protect, async (req, res) => {
  try {
    const settings = await storage.findOne('Setting');
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings
router.put('/', protect, authorize('admin', 'custodian', 'student', 'faculty'), async (req, res) => {
  try {
    const role = req.user.role;
    // Shared UI/UX and Security fields allowed for everyone
    const sharedFields = [
      'scanlines', 'noiseOverlay', 'animations', 'haptic', 'accentTheme',
      'emailNotifications', 'pushNotifications', 'commLinkPings',
      'twoFactorEnabled', 'publicProfile'
    ];

    let allowedPayload = {};
    if (role === 'admin') {
      // Admin can update everything
      allowedPayload = req.body;
    } else {
      // For non-admins, aggregate role-specific and shared fields
      let roleFields = [];
      if (role === 'custodian') {
        roleFields = [
          'libraryName', 'finePerDay', 'fineRatePerDay', 'gracePeriodDays', 
          'maxHoldDays', 'autoRenewEnabled', 'enforceConditionChecks', 
          'autoNotifyOverdue', 'autoRestocking', 'enableDigitalLending', 
          'allowInterLibraryLoan', 'defaultFineCurrency'
        ];
      } else if (role === 'faculty') {
        roleFields = [
          'facultyAllowSyllabusPublic', 'facultyAutoApproveBibliography', 
          'facultyNotifyStudentOnReading', 'facultyResearchPortalAccess',
          'facultyGrantManagement', 'facultyCollaborativeAnnotating',
          'facultyCustomDashboardLayout', 'facultyAutoRenewLimit',
          'facultyPriorityQueuing', 'facultyResourceExport', 'facultyPeerReviewSystem'
        ];
      } else if (role === 'student') {
        roleFields = [
          'studentAllowSelfRenew', 'studentNotifyDueSoon', 'defaultTimerMins',
          'dailyReadingGoal', 'dailyReminderTime', 'focusModeEnabled',
          'publicReadingHistory', 'studentAutoRenew', 'readerDarkMode',
          'autoAcceptGroups', 'emailForwarding', 'hapticEnabled',
          'newsletterSub', 'betaAccess', 'highContrast', 
          'studentReadingChallenges', 'studentStudyRoomBooking'
        ];
      }
      
      [...roleFields, ...sharedFields].forEach(f => {
        if (req.body[f] !== undefined) allowedPayload[f] = req.body[f];
      });
    }

    if (Object.keys(allowedPayload).length === 0) {
      return res.status(403).json({ success: false, message: 'No authorized fields to update' });
    }

    const updatedSettings = await storage.update('Setting', null, allowedPayload);

    // Log security sensitive changes
    if (allowedPayload.twoFactorEnabled !== undefined) {
      const user = await storage.findOne('User', { _id: req.user.id });
      await storage.log(user.name, 'SECURITY', `Two-Factor Authentication ${allowedPayload.twoFactorEnabled ? 'ENABLED' : 'DISABLED'} for Nexus account`);
    }
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


export default router;
