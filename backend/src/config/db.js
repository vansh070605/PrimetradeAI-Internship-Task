/**
 * @file db.js
 * @description MongoDB connection with retry logic and graceful shutdown handling.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure a stable, production-grade connection
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    retryCount = 0; // reset on success
  } catch (error) {
    retryCount++;
    logger.error(`MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      const delay = retryCount * 2000; // exponential-ish backoff
      logger.info(`Retrying MongoDB connection in ${delay / 1000}s...`);
      setTimeout(connectDB, delay);
    } else {
      logger.error('Max MongoDB connection retries reached. Exiting.');
      process.exit(1);
    }
  }
};

// Gracefully close connection when the process is terminating
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination.');
  process.exit(0);
});

module.exports = connectDB;
