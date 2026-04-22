import mongoose from 'mongoose';

const syllabusSchema = new mongoose.Schema({
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  term: { type: String, required: true },
  coreBooks: [{ type: String }],
  supplementaryBooks: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Syllabus', syllabusSchema);
