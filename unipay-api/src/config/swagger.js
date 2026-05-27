
// Configuration Swagger

module.exports = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'UniPay API',
            version: '1.0.0',
            description: 'API documentation for UniPay'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

