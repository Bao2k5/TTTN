require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/db');
const { corsMiddleware, basicLimiter, authLimiter, forgotLimiter, mongoSanitize, xss, hpp } = require('./middleware/security.middleware');
const passport = require('./middleware/passport');
const session = require('express-session');

const app = express();
app.use(corsMiddleware());

// Enable compression for all responses
app.use(compression());

// Session for OAuth (only used during OAuth flow, not for JWT)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure Helmet with more permissive settings for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "https:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:3000", "https://res.cloudinary.com", "https://api.cloudinary.com"],
      frameSrc: ["'self'", "https:"],
      frameAncestors: ["'self'", "https:"],
    }
  }
}));

// Security middleware - now with proper error handling
app.use(mongoSanitize()); // Sanitize data to prevent MongoDB Operator Injection
// app.use(xss()); // Sanitize user input to prevent XSS attacks (Temporarily disabled for debugging)
// app.use(hpp()); // Protect against HTTP Parameter Pollution attacks
app.use(basicLimiter);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Connect to DB
connectDB();

// Mount routes
const apiRouter = require('./routes/index');
const securityRouter = require('./routes/security.routes');

app.use('/api', apiRouter);
app.use('/api/security', securityRouter);


// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, '..', 'uploads');
console.log('📁 Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// 404 handler - must be before error handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
