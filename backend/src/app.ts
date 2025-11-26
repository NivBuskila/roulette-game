import express from 'express';
import cors from 'cors';
import routes from './routes';
import { config } from './config';
import { errorHandler, notFoundHandler, requestLogger } from './middleware';

/**
 * Create and configure Express application
 */
export function createApp() {
    const app = express();

    // CORS configuration
    app.use(cors({
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
    }));

    // Body parsing
    app.use(express.json({ limit: config.bodyLimit }));

    // Request logging
    app.use(requestLogger);

    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString()
        });
    });

    // API routes
    app.use('/api', routes);

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    return app;
}

export const app = createApp();
