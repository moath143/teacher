const mongoose = require('mongoose');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');

/**
 * @desc    Get all students with computed lesson count and total revenue
 * @route   GET /api/students
 * @access  Private
 */
const getStudents = async (req, res, next) => {
  try {
    const teacherId = req.teacher._id;
    const { search, stage, educationType, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter query
    const filter = { createdBy: teacherId };

    if (search && search.trim() !== '') {
      filter.$or = [
        { fullName: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (stage && stage !== 'All') {
      filter.stage = stage;
    }

    if (educationType && educationType !== 'All') {
      filter.educationType = educationType;
    }

    // Fetch matching students
    const students = await Student.find(filter).sort({
      [sortBy]: order === 'asc' ? 1 : -1,
    });

    // Aggregate lessons per student for this teacher
    const lessonAggregates = await Lesson.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(teacherId),
        },
      },
      {
        $group: {
          _id: '$studentId',
          totalLessons: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          lastLessonDate: { $max: '$lessonDate' },
        },
      },
    ]);

    // Create a lookup map for instant O(1) enrichment
    const aggMap = new Map();
    lessonAggregates.forEach((item) => {
      aggMap.set(item._id.toString(), {
        totalLessons: item.totalLessons,
        totalAmount: item.totalAmount,
        lastLessonDate: item.lastLessonDate,
      });
    });

    // Merge computed metrics into student documents
    const enrichedStudents = students.map((student) => {
      const stats = aggMap.get(student._id.toString()) || {
        totalLessons: 0,
        totalAmount: 0,
        lastLessonDate: null,
      };

      return {
        _id: student._id,
        fullName: student.fullName,
        stage: student.stage,
        enrollmentDate: student.enrollmentDate,
        educationType: student.educationType,
        phone: student.phone,
        notes: student.notes,
        totalLessons: stats.totalLessons,
        totalAmount: stats.totalAmount,
        lastLessonDate: stats.lastLessonDate,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedStudents.length,
      data: enrichedStudents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student details with financial stats and lesson history
 * @route   GET /api/students/:id
 * @access  Private
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID format',
      });
    }

    const student = await Student.findOne({
      _id: id,
      createdBy: teacherId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Fetch all lessons for this student
    const lessons = await Lesson.find({
      studentId: id,
      createdBy: teacherId,
    }).sort({ lessonDate: -1, lessonTime: -1 });

    // Calculate financial summary
    const totalLessons = lessons.length;
    const totalAmount = lessons.reduce((sum, lesson) => sum + (lesson.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          fullName: student.fullName,
          stage: student.stage,
          enrollmentDate: student.enrollmentDate,
          educationType: student.educationType,
          phone: student.phone,
          notes: student.notes,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        },
        financialSummary: {
          totalLessons,
          totalAmount,
        },
        lessons,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Private
 */
const createStudent = async (req, res, next) => {
  try {
    const { fullName, stage, enrollmentDate, educationType, phone, notes } = req.body;
    const teacherId = req.teacher._id;

    const student = await Student.create({
      fullName,
      stage,
      enrollmentDate: enrollmentDate || new Date(),
      educationType: educationType || 'Lessons',
      phone: phone || '',
      notes: notes || '',
      createdBy: teacherId,
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        ...student.toObject(),
        totalLessons: 0,
        totalAmount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student details
 * @route   PUT /api/students/:id
 * @access  Private
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher._id;
    const { fullName, stage, enrollmentDate, educationType, phone, notes } = req.body;

    let student = await Student.findOne({ _id: id, createdBy: teacherId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    student.fullName = fullName !== undefined ? fullName : student.fullName;
    student.stage = stage !== undefined ? stage : student.stage;
    student.enrollmentDate = enrollmentDate !== undefined ? enrollmentDate : student.enrollmentDate;
    student.educationType = educationType !== undefined ? educationType : student.educationType;
    student.phone = phone !== undefined ? phone : student.phone;
    student.notes = notes !== undefined ? notes : student.notes;

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student and optionally all associated lessons
 * @route   DELETE /api/students/:id
 * @access  Private
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher._id;

    const student = await Student.findOne({ _id: id, createdBy: teacherId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete associated lessons
    const deletedLessonsCount = await Lesson.deleteMany({
      studentId: id,
      createdBy: teacherId,
    });

    // Delete student
    await Student.deleteOne({ _id: id, createdBy: teacherId });

    res.status(200).json({
      success: true,
      message: `Student and ${deletedLessonsCount.deletedCount} related lesson(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate and download student report PDF
 * @route   GET /api/students/:id/pdf
 * @access  Private
 */
const exportStudentPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = req.teacher;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID format',
      });
    }

    const student = await Student.findOne({ _id: id, createdBy: teacher._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const lessons = await Lesson.find({
      studentId: id,
      createdBy: teacher._id,
    }).sort({ lessonDate: -1, lessonTime: -1 });

    const totalLessons = lessons.length;
    const totalAmount = lessons.reduce((sum, lesson) => sum + (lesson.amount || 0), 0);

    const { generateStudentReportPDF } = require('../services/pdfService');
    const pdfBytes = await generateStudentReportPDF({
      teacher: {
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
      },
      student,
      lessons,
      summary: {
        totalLessons,
        totalAmount,
        currency: teacher.currency || '$',
      },
    });

    const filename = `Report_${student.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);

    return res.end(Buffer.from(pdfBytes));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentPDF,
};
