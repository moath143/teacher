const mongoose = require('mongoose');

/**
 * Student Schema
 * Stores private student profiles managed by the teacher
 */
const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters'],
    },
    stage: {
      type: String,
      required: [true, 'Educational stage is required'],
      trim: true,
      enum: {
        values: [
          'Primary 1-3',
          'Primary 4-6',
          'Preparatory / Middle School',
          'Secondary 1',
          'Secondary 2',
          'Secondary 3 (Thanawya)',
          'University / Higher Ed',
          'Other',
        ],
        message: '{VALUE} is not a supported educational stage',
      },
    },
    enrollmentDate: {
      type: Date,
      required: [true, 'Enrollment date is required'],
      default: Date.now,
    },
    educationType: {
      type: String,
      required: [true, 'Education type is required'],
      enum: {
        values: ['Lessons', 'Full Course'],
        message: 'Education type must be either Lessons or Full Course',
      },
      default: 'Lessons',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
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

// Compound index for querying students by teacher and sorting by name
studentSchema.index({ createdBy: 1, fullName: 1 });
studentSchema.index({ createdBy: 1, stage: 1 });
studentSchema.index({ createdBy: 1, educationType: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
