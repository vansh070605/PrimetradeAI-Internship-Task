/**
 * @file logger.js
 * @description Winston logger with console + daily-rotating file transports.
 *              Structured JSON logs in production; colorized in development.
 */

const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, printf, colorize, json, errors } = format;

const isDev = process.env.NODE_ENV !== 'production';

// Human-readable format for dev console
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  })
);

// Structured JSON format for production files
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Rotating file transport — keeps 14 days, max 20MB per file
const fileTransport = new DailyRotateFile({
  filename: path.join('logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: prodFormat,
});

const errorFileTransport = new DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: prodFormat,
});

const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  transports: [
    new transports.Console({
      format: isDev ? devFormat : prodFormat,
    }),
    fileTransport,
    errorFileTransport,
  ],
  // Uncaught exceptions and unhandled rejections go to their own log
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join('logs', 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join('logs', 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
    }),
  ],
});

module.exports = logger;
