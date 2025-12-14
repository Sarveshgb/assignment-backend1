import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import leadsRoutes from './routes/leads.js';
import eventsRoutes from './routes/events.js';
import quotesRoutes from './routes/quotes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const isConnected = mongoose.default.connection.readyState === 1;

        res.json({
            status: isConnected ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            database: isConnected ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/leads', leadsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/quotes', quotesRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Sports Travel Package API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            leads: '/api/leads',
            events: '/api/events',
            quotes: '/api/quotes',
            documentation: '/api-docs'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Sports Travel Package API Server                ║
║                                                       ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   Database: ${process.env.DB_NAME || 'sports_travel_db'}                ║
║                                                       ║
║   API Endpoints:                                      ║
║   - POST   /api/leads                                 ║
║   - GET    /api/leads                                 ║
║   - GET    /api/leads/:id                             ║
║   - PATCH  /api/leads/:id/status                      ║
║   - GET    /api/events                                ║
║   - GET    /api/events/:id/packages                   ║
║   - POST   /api/quotes/generate                       ║
║   - GET    /api/quotes                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
