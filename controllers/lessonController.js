const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');

/**
 * @desc    Get all lessons with student details and filters
 * @route   GET /api/lessons
 * @access  Private
 */
const getLessons = async (req, res, next) => {
  try {
    const teacherId = req.teacher._id;
    const { studentId, startDate, endDate, search, status, sortBy = 'lessonDate', order = 'desc' } = req.query;

    const filter = { createdBy: teacherId };

    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      filter.studentId = studentId;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.lessonDate = {};
      if (startDate) {
        filter.lessonDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.lessonDate.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { lessonTitle: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const lessons = await Lesson.find(filter)
      .populate('studentId', 'fullName stage educationType phone')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, lessonTime: order === 'asc' ? 1 : -1 });

    // Calculate total summary amount for the filtered list
    const totalAmount = lessons.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.status(200).json({
      success: true,
      count: lessons.length,
      totalAmount,
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Private
 */
const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Lesson ID format',
      });
    }

    const lesson = await Lesson.findOne({ _id: id, createdBy: teacherId }).populate(
      'studentId',
      'fullName stage educationType phone'
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new lesson for a student
 * @route   POST /api/lessons
 * @access  Private
 */
const createLesson = async (req, res, next) => {
  try {
    const teacherId = req.teacher._id;
    const { studentId, lessonTitle, lessonDate, lessonTime, amount, notes, status } = req.body;

    // Verify student exists and belongs to this teacher
    const student = await Student.findOne({ _id: studentId, createdBy: teacherId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or does not belong to you',
      });
    }

    const lesson = await Lesson.create({
      studentId,
      lessonTitle,
      lessonDate: lessonDate || new Date(),
      lessonTime,
      amount: Number(amount),
      notes: notes || '',
      status: status || 'Completed',
      createdBy: teacherId,
    });

    const populatedLesson = await Lesson.findById(lesson._id).populate(
      'studentId',
      'fullName stage educationType phone'
    );

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: populatedLesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing lesson
 * @route   PUT /api/lessons/:id
 * @access  Private
 */
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher._id;
    const { studentId, lessonTitle, lessonDate, lessonTime, amount, notes, status } = req.body;

    let lesson = await Lesson.findOne({ _id: id, createdBy: teacherId });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    if (studentId && studentId !== lesson.studentId.toString()) {
      const student = await Student.findOne({ _id: studentId, createdBy: teacherId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Target student not found or unauthorized',
        });
      }
      lesson.studentId = studentId;
    }

    lesson.lessonTitle = lessonTitle !== undefined ? lessonTitle : lesson.lessonTitle;
    lesson.lessonDate = lessonDate !== undefined ? lessonDate : lesson.lessonDate;
    lesson.lessonTime = lessonTime !== undefined ? lessonTime : lesson.lessonTime;
    lesson.amount = amount !== undefined ? Number(amount) : lesson.amount;
    lesson.notes = notes !== undefined ? notes : lesson.notes;
    lesson.status = status !== undefined ? status : lesson.status;

    const updatedLesson = await lesson.save();
    const populated = await Lesson.findById(updatedLesson._id).populate(
      'studentId',
      'fullName stage educationType phone'
    );

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:id
 * @access  Private
 */
const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher._id;

    const lesson = await Lesson.findOneAndDelete({ _id: id, createdBy: teacherId });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
