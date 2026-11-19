const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Security headers with helmet (configured to allow inline scripts and assets in React SPA)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS support (useful during local dev when running separate ports without proxy)
app.use(cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local uploads folder for static attachment access
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount all API routes under /api
app.use('/api', apiRoutes);
app.use('/api', notFoundHandler);

// Serve the React production build copied to server/public.
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// For non-API routes, send React's index.html for client-side routing
app.get('*', (req, res, next) => {
  if (path.extname(req.path)) {
    return notFoundHandler(req, res, next);
  }

  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      const buildError = new Error('React production build is missing from server/public.');
      buildError.statusCode = 503;
      next(buildError);
    }
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
