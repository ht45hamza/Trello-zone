import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Trello-Zone API',
            version: '1.0.0',
            description: 'Interactive API documentation for the Trello-Zone backend application.',
        },
        servers: [
            {
                url: 'http://localhost:5000',
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
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        // Look for annotations in route files (and server.ts)
        './routes/*.ts',
        './server.ts',
        // Support built javascript output paths if running in production
        './dist/routes/*.js',
        './dist/server.js',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
