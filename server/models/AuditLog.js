import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
