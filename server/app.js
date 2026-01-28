const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const securityConfig = require('./config/security');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const { router: adminAuthRoutes } = require('./routes/admin-auth');
const articleRoutes = require('./routes/articles');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const mediaRoutes = require('./routes/media');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const searchRoutes = require('./routes/search');
const settingsRoutes = require('./routes/settings');
const healthRoutes = require('./routes/health');
const adsRoutes = require('./routes/ads');

const app = express();

// Security middleware
app.use(helmet(securityConfig.helmet));
app.use(cors(securityConfig.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/navigation', require('./routes/navigation'));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/site/index.html'));
});

app.get('/article.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/site/article.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Application error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});