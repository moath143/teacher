require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Lesson.deleteMany({});

    console.log('[Seed] Creating demo teacher account...');
    // Create Teacher account
    // Password will be automatically hashed by the Teacher schema pre-save hook
    const teacher = await Teacher.create({
      name: 'Professor Ahmed Mansour',
      email: 'teacher@example.com',
      password: 'password123',
      subject: 'Mathematics & Physics',
      currency: '$',
    });

    console.log(`[Seed] Teacher created: ${teacher.email} / password123`);

    console.log('[Seed] Seeding students...');
    const studentsData = [
      {
        fullName: 'Omar Khaled',
        stage: 'Secondary 3 (Thanawya)',
        enrollmentDate: new Date('2025-01-10'),
        educationType: 'Lessons',
        phone: '+20 100 123 4567',
        notes: 'Prepares for Calculus and Dynamics finals. Highly engaged.',
        createdBy: teacher._id,
      },
      {
        fullName: 'Layla Mostafa',
        stage: 'Secondary 2',
        enrollmentDate: new Date('2025-01-15'),
        educationType: 'Full Course',
        phone: '+20 101 234 5678',
        notes: 'Full Algebra & Mechanics semester curriculum.',
        createdBy: teacher._id,
      },
      {
        fullName: 'Youssef Hassan',
        stage: 'Secondary 3 (Thanawya)',
        enrollmentDate: new Date('2025-02-01'),
        educationType: 'Lessons',
        phone: '+20 102 345 6789',
        notes: 'Needs additional practice in Trigonometry and Integration.',
        createdBy: teacher._id,
      },
      {
        fullName: 'Nour El-Din Samy',
        stage: 'Preparatory / Middle School',
        enrollmentDate: new Date('2025-02-10'),
        educationType: 'Lessons',
        phone: '+20 103 456 7890',
        notes: 'Middle school algebra foundation and geometry.',
        createdBy: teacher._id,
      },
      {
        fullName: 'Mariam Adel',
        stage: 'Secondary 1',
        enrollmentDate: new Date('2025-02-18'),
        educationType: 'Full Course',
        phone: '+20 104 567 8901',
        notes: 'Geometry and Physics introductory concepts.',
        createdBy: teacher._id,
      },
      {
        fullName: 'Karim Tarek',
        stage: 'University / Higher Ed',
        enrollmentDate: new Date('2025-03-01'),
        educationType: 'Lessons',
        phone: '+20 105 678 9012',
        notes: 'University Calculus II and Linear Algebra private tutoring.',
        createdBy: teacher._id,
      },
    ];

    const createdStudents = await Student.insertMany(studentsData);
    console.log(`[Seed] Seeded ${createdStudents.length} students.`);

    console.log('[Seed] Seeding lesson history & financial records...');
    const lessonsData = [
      // Omar Khaled lessons
      {
        studentId: createdStudents[0]._id,
        lessonTitle: 'Calculus: Limits & Derivatives Deep Dive',
        lessonDate: new Date('2025-03-02'),
        lessonTime: '16:00',
        amount: 35,
        notes: 'Solved 15 textbook problems. Strong grasp on chain rule.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[0]._id,
        lessonTitle: 'Calculus: Integration by Parts & Partial Fractions',
        lessonDate: new Date('2025-03-09'),
        lessonTime: '16:00',
        amount: 35,
        notes: 'Assigned assignment #4 on definite integrals.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[0]._id,
        lessonTitle: 'Dynamics: Newtons Laws of Motion Applications',
        lessonDate: new Date('2025-03-16'),
        lessonTime: '16:00',
        amount: 40,
        notes: 'Pulleys and inclined planes problem solving.',
        status: 'Completed',
        createdBy: teacher._id,
      },

      // Layla Mostafa lessons
      {
        studentId: createdStudents[1]._id,
        lessonTitle: 'Full Course Session 1: Quadratic Equations & Graphing',
        lessonDate: new Date('2025-03-03'),
        lessonTime: '17:30',
        amount: 50,
        notes: 'Comprehensive revision of quadratic formulas.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[1]._id,
        lessonTitle: 'Full Course Session 2: Trigonometric Identities',
        lessonDate: new Date('2025-03-10'),
        lessonTime: '17:30',
        amount: 50,
        notes: 'Double angle identities and cosine rule.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[1]._id,
        lessonTitle: 'Full Course Session 3: Vectors in 2D Plane',
        lessonDate: new Date('2025-03-17'),
        lessonTime: '17:30',
        amount: 50,
        notes: 'Dot product and vector projection exercises.',
        status: 'Completed',
        createdBy: teacher._id,
      },

      // Youssef Hassan lessons
      {
        studentId: createdStudents[2]._id,
        lessonTitle: 'Solid Geometry: Planes and Lines in 3D Space',
        lessonDate: new Date('2025-03-04'),
        lessonTime: '18:00',
        amount: 35,
        notes: 'Equation of sphere and intersection of planes.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[2]._id,
        lessonTitle: 'Solid Geometry: Cross Product & 3D Vectors',
        lessonDate: new Date('2025-03-11'),
        lessonTime: '18:00',
        amount: 35,
        notes: 'Area of triangle and volume of parallelepiped calculations.',
        status: 'Completed',
        createdBy: teacher._id,
      },

      // Nour El-Din Samy lessons
      {
        studentId: createdStudents[3]._id,
        lessonTitle: 'Prep Math: Linear Equations & Factorization',
        lessonDate: new Date('2025-03-05'),
        lessonTime: '15:00',
        amount: 25,
        notes: 'Difference of squares and trinomial factoring.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[3]._id,
        lessonTitle: 'Prep Math: Circle Geometry & Tangents',
        lessonDate: new Date('2025-03-12'),
        lessonTime: '15:00',
        amount: 25,
        notes: 'Angle in a semicircle theorems explained.',
        status: 'Completed',
        createdBy: teacher._id,
      },

      // Mariam Adel lessons
      {
        studentId: createdStudents[4]._id,
        lessonTitle: 'Full Course Module 1: Similarity of Triangles',
        lessonDate: new Date('2025-03-06'),
        lessonTime: '17:00',
        amount: 45,
        notes: 'Proportions in right-angled triangles.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[4]._id,
        lessonTitle: 'Full Course Module 2: Physics Kinematics & Velocity',
        lessonDate: new Date('2025-03-13'),
        lessonTime: '17:00',
        amount: 45,
        notes: 'Motion in a straight line with uniform acceleration.',
        status: 'Completed',
        createdBy: teacher._id,
      },

      // Karim Tarek lessons
      {
        studentId: createdStudents[5]._id,
        lessonTitle: 'Linear Algebra: Eigenvalues and Diagonalization',
        lessonDate: new Date('2025-03-08'),
        lessonTime: '19:00',
        amount: 50,
        notes: 'Matrix transformations and characteristic polynomials.',
        status: 'Completed',
        createdBy: teacher._id,
      },
      {
        studentId: createdStudents[5]._id,
        lessonTitle: 'Multivariable Calculus: Double & Triple Integrals',
        lessonDate: new Date('2025-03-15'),
        lessonTime: '19:00',
        amount: 50,
        notes: 'Polar and spherical coordinates transformations.',
        status: 'Completed',
        createdBy: teacher._id,
      },
    ];

    await Lesson.insertMany(lessonsData);
    console.log(`[Seed] Seeded ${lessonsData.length} lessons with amounts and notes.`);
    console.log('[Seed] Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

// Execute seed if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
