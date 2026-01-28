require('dotenv').config();
const database = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
// Bind to 0.0.0.0 by default to allow port forwarding / external access
const HOST = process.env.HOST || '0.0.0.0';

// Routes are defined in app.js - no need to redefine here

let server;

async function startServer() {
    try {
        // Initialize database FIRST before loading app (which loads routes/models)
        await database.initialize();
        logger.info('Database initialized');
        
        // NOW load the app after database is ready
        const app = require('./app');

        // Auto-publish approved articles
        try {
            const Article = require('./models/Article');
            const publishedCount = await Article.autoPublishApproved();
            logger.info(`Auto-published ${publishedCount} approved articles (if any).`);
        } catch (err) {
            logger.error('Auto-publish error:', err);
        }

        // Start server
        server = app.listen(PORT, HOST, () => {
            logger.info(`Server running at http://${HOST}:${PORT}`);
            logger.info(`Admin panel: http://${HOST}:${PORT}/admin (Press Ctrl+Alt+A)`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

async function gracefulShutdown() {
    logger.info('Received shutdown signal, closing server gracefully...');

    if (server) {
        server.close(async () => {
            logger.info('HTTP server closed');

            try {
                await database.close();
                logger.info('Database connection closed');
                process.exit(0);
            } catch (error) {
                logger.error('Error closing database:', error);
                process.exit(1);
            }
        });
    }
}

// Start the server
startServer();
