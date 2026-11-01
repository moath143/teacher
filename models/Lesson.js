const mongoose = require('mongoose');

/**
 * Lesson Schema
 * Tracks individual tutoring lessons, amounts paid/due, dates, and pedagogical notes
 */
const lessonSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    lessonTitle: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [150, 'Lesson title cannot exceed 150 characters'],
    },
    lessonDate: {
      type: Date,
      required: [true, 'Lesson date is required'],
      default: Date.now,
      index: true,
    },
    lessonTime: {
      type: String,
      required: [true, 'Lesson time is required (e.g. 16:30 or 04:30 PM)'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Lesson fee amount is required'],
      min: [0, 'Amount cannot be negative'],
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Completed', 'Scheduled', 'Cancelled'],
      default: 'Completed',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries by teacher, student, and date ranges
lessonSchema.index({ createdBy: 1, lessonDate: -1 });
lessonSchema.index({ studentId: 1, lessonDate: -1 });
lessonSchema.index({ createdBy: 1, studentId: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
