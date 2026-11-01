const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance
 * Supports reconnection and graceful error logging
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_assistant_db', {
      autoIndex: true,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
