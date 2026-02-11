import swaggerUi from 'swagger-ui-express';
import type { Application } from 'express';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Backend Boilerplate API',
    version: '1.0.0',
    description: 'Web and Mobile API with JWT authentication',
  },
  servers: [{ url: '/api', description: 'API base' }],
  tags: [
    { name: 'Web', description: 'Web / Admin API' },
    { name: 'Mobile', description: 'Mobile API' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {},
          meta: { type: 'object' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      RegisterBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
        },
      },
      RefreshBody: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
    },
  },
  paths: {
    '/web/v1/auth/register': {
      post: {
        tags: ['Web'],
        summary: 'Register (Web)',
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } },
          },
        },
        responses: { 201: { description: 'Registered' }, 400: { description: 'Validation error' } },
      },
    },
    '/web/v1/auth/login': {
      post: {
        tags: ['Web'],
        summary: 'Login (Web)',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
        },
        responses: { 200: { description: 'Tokens' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/web/v1/auth/refresh': {
      post: {
        tags: ['Web'],
        summary: 'Refresh token (Web)',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshBody' } } },
        },
        responses: { 200: { description: 'New tokens' } },
      },
    },
    '/web/v1/auth/logout': {
      post: {
        tags: ['Web'],
        summary: 'Logout (Web)',
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/web/v1/profile': {
      get: {
        tags: ['Web'],
        summary: 'Get profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile' }, 401: { description: 'Unauthorized' } },
      },
      patch: {
        tags: ['Web'],
        summary: 'Update profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
    },
    '/web/v1/users': {
      get: {
        tags: ['Web'],
        summary: 'List users (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'User list' } },
      },
    },
    '/mobile/v1/auth/register': {
      post: {
        tags: ['Mobile'],
        summary: 'Register (Mobile)',
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } },
          },
        },
        responses: { 201: { description: 'Registered' } },
      },
    },
    '/mobile/v1/auth/login': {
      post: {
        tags: ['Mobile'],
        summary: 'Login (Mobile)',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
        },
        responses: { 200: { description: 'Tokens' } },
      },
    },
    '/mobile/v1/auth/refresh': {
      post: {
        tags: ['Mobile'],
        summary: 'Refresh token (Mobile)',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshBody' } } },
        },
        responses: { 200: { description: 'New tokens' } },
      },
    },
    '/mobile/v1/profile': {
      get: {
        tags: ['Mobile'],
        summary: 'Get profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile' } },
      },
    },
  },
};

export function setupSwagger(app: Application, path: string = '/api/docs'): void {
  app.use(path, swaggerUi.serve, swaggerUi.setup(openApiSpec));
}
