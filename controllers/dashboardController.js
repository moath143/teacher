const mongoose = require('mongoose');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');

/**
 * @desc    Get comprehensive dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const teacherId = req.teacher._id;
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    // 1. Total Students Count
    const totalStudents = await Student.countDocuments({ createdBy: teacherId });

    // 2. Aggregate Lessons Metrics (Total Lessons, Total Revenue)
    const overallLessonStats = await Lesson.aggregate([
      { $match: { createdBy: teacherObjectId } },
      {
        $group: {
          _id: null,
          totalLessons: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          avgLessonPrice: { $avg: '$amount' },
        },
      },
    ]);

    const totalLessons = overallLessonStats[0]?.totalLessons || 0;
    const totalRevenue = overallLessonStats[0]?.totalRevenue || 0;
    const avgLessonPrice = Math.round((overallLessonStats[0]?.avgLessonPrice || 0) * 100) / 100;

    // 3. Current Month Revenue
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentMonthStats = await Lesson.aggregate([
      {
        $match: {
          createdBy: teacherObjectId,
          lessonDate: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: null,
          monthlyLessons: { $sum: 1 },
          monthlyRevenue: { $sum: '$amount' },
        },
      },
    ]);

    const monthlyRevenue = currentMonthStats[0]?.monthlyRevenue || 0;
    const monthlyLessons = currentMonthStats[0]?.monthlyLessons || 0;

    // 4. Revenue By Month (Last 6-12 Months for chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueBreakdown = await Lesson.aggregate([
      {
        $match: {
          createdBy: teacherObjectId,
          lessonDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$lessonDate' },
            month: { $month: '$lessonDate' },
          },
          revenue: { $sum: '$amount' },
          lessonsCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly data for easy frontend chart mapping
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyChart = monthlyRevenueBreakdown.map((item) => {
      const monthIndex = item._id.month - 1;
      return {
        label: `${monthNames[monthIndex]} ${item._id.year}`,
        month: item._id.month,
        year: item._id.year,
        revenue: item.revenue,
        lessonsCount: item.lessonsCount,
      };
    });

    // 5. Recent Lessons (Top 6 most recent)
    const recentLessons = await Lesson.find({ createdBy: teacherId })
      .sort({ lessonDate: -1, createdAt: -1 })
      .limit(6)
      .populate('studentId', 'fullName stage educationType');

    // 6. Student Summaries (Per student: Name, Stage, Total Lessons, Total Amount)
    const allStudents = await Student.find({ createdBy: teacherId }).sort({ fullName: 1 });
    const studentAggregates = await Lesson.aggregate([
      { $match: { createdBy: teacherObjectId } },
      {
        $group: {
          _id: '$studentId',
          totalLessons: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          lastLessonDate: { $max: '$lessonDate' },
        },
      },
    ]);

    const aggMap = new Map();
    studentAggregates.forEach((item) => {
      aggMap.set(item._id.toString(), {
        totalLessons: item.totalLessons,
        totalAmount: item.totalAmount,
        lastLessonDate: item.lastLessonDate,
      });
    });

    const studentSummaries = allStudents.map((student) => {
      const stats = aggMap.get(student._id.toString()) || {
        totalLessons: 0,
        totalAmount: 0,
        lastLessonDate: null,
      };

      return {
        _id: student._id,
        fullName: student.fullName,
        stage: student.stage,
        educationType: student.educationType,
        phone: student.phone,
        totalLessons: stats.totalLessons,
        totalAmount: stats.totalAmount,
        lastLessonDate: stats.lastLessonDate,
      };
    });

    // 7. Stage Distribution for educational stage breakdown
    const stageDistribution = {};
    allStudents.forEach((student) => {
      stageDistribution[student.stage] = (stageDistribution[student.stage] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalStudents,
          totalLessons,
          totalRevenue,
          monthlyRevenue,
          monthlyLessons,
          avgLessonPrice,
        },
        monthlyRevenueChart: formattedMonthlyChart,
        recentLessons,
        studentSummaries,
        stageDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
