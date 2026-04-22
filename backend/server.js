/**
 * @file server.js
 * @description Application entry point.
 *              Connects to MongoDB, then starts the HTTP server.
 *              Handles graceful shutdown on SIGTERM/SIGINT.
 */

require('dotenv').config();

const app = require('./app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────

  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });

    // Force close after 10 seconds if requests are taking too long
    setTimeout(() => {
      logger.error('Forcefully shutting down after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections (failsafe)
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    // In production, restart the process via a process manager (PM2/Docker)
    server.close(() => process.exit(1));
  });
});
