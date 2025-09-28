// src/config/swagger.ts

import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json'; // Import version from package.json

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal Backend API (RNRS)',
      version, // Use the version from your package.json
      description:
        'This is the comprehensive API documentation for the RNRS Job Portal backend. ' +
        'It is built with Express.js, TypeScript, and Prisma, providing a complete solution for job searching and recruitment.',
      contact: {
        name: 'Alex',
        // url: 'https://your-portfolio.com', // Optional: Add your website
        // email: 'your-email@example.com', // Optional: Add your email
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}/api/v1`,
        description: 'Local Development Server',
      },
      // You can add more server URLs here (e.g., for staging or production)
    ],
    // This components section is crucial for defining security and schemas
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}',
        },
      },
      // Schemas will be defined in a separate file for organization
    },
    // This security block makes the bearerAuth scheme global
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs. The JSDoc comments will be scanned from these files.
  apis: ['./src/routes/*.ts', './src/utils/swaggerSchemas.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;