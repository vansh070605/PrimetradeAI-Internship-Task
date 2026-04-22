/**
 * @file app.js
 * @description Express application factory.
 *              Configures all middleware, routes, and error handling.
 *              Separated from server.js for testability.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const errorHandler = require('./src/middlewares/errorHandler');
const ApiError = require('./src/utils/ApiError');
const logger = require('./src/utils/logger');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Helmet sets secure HTTP headers (XSS, HSTS, clickjacking protection, etc.)
app.use(helmet());

// CORS — only allow requests from configured client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Sanitize request data to prevent MongoDB operator injection attacks
app.use(mongoSanitize());

// ─── Rate Limiting ────────────────────────────────────────────────────────────

// Global rate limit — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Stricter limit for auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

app.use(globalLimiter);

// ─── Request Parsing ──────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' })); // Limit payload size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────

// HTTP request logging via Morgan, piped into Winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    // Skip logging health checks in production to reduce noise
    skip: (req) => process.env.NODE_ENV === 'production' && req.url === '/health',
  })
);

// ─── API Documentation ────────────────────────────────────────────────────────

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running', timestamp: new Date() });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found.`));
});

// ─── Centralized Error Handler ────────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
