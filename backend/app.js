
const express = require('express');
const cors = require('cors');

const {
  notFound,
  errorHandler
} = require('./middleware/errorHandler');

const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '100kb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok'
    }
  });
});

// API Routes
app.use(
  '/api',
  require('./routes/habitRoutes'),
  require('./routes/analyticsRoutes'),
  require('./routes/settingsRoutes')
);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;