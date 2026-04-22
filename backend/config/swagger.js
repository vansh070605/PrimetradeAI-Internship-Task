/**
 * @file config/swagger.js
 * @description swagger-jsdoc configuration — generates OpenAPI spec from JSDoc comments.
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description:
        'Production-ready REST API for task management with JWT authentication and RBAC.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and user management' },
      { name: 'Tasks', description: 'Task CRUD operations' },
    ],
  },
  // Paths to files with JSDoc swagger annotations
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
