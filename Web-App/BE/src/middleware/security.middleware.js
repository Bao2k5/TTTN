// src/middleware/security.middleware.js
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const expressMongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

function corsMiddleware() {
  const opts = {
    origin: '*', // Allow ALL origins for local dev debugging
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  return cors(opts);
}

const isDev = process.env.NODE_ENV !== 'production';

// Basic API rate limiter
const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 2000, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 10, 
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, 
});

// Strict limiter for password reset
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 20 : 5, 
  message: 'Too many password reset attempts, please try again later.',
});

// Strict limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 30, 
  message: 'Too many upload requests, please try again later.',
});

// Moderate limiter for payment operations
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 50, 
  message: 'Too many payment requests, please slow down.',
});

// Sanitize data to prevent MongoDB Operator Injection
function mongoSanitize() {
  const m = expressMongoSanitize();
  return function (req, res, next) {
    try {
      return m(req, res, next);
    } catch (err) {
      if (err.message && err.message.includes('only a getter')) {
        try {
          ['query', 'body', 'params'].forEach(prop => {
            if (req[prop]) {
              const val = JSON.parse(JSON.stringify(req[prop]));
              Object.defineProperty(req, prop, {
                value: val,
                writable: true,
                configurable: true,
                enumerable: true
              });
            }
          });
          return m(req, res, next);
        } catch (innerErr) {
          // Silent fallback
        }
      }
      return next();
    }
  };
}

// Sanitize user input to prevent XSS attacks
function xssClean() {
  const x = xss();
  return function (req, res, next) {
    try {
      return x(req, res, next);
    } catch (err) {
      console.warn('[security.middleware] xss-clean failed, skipping for this request:', err && err.message ? err.message : err);
      return next();
    }
  };
}

module.exports = {
  corsMiddleware,
  basicLimiter,
  authLimiter,
  forgotLimiter,
  uploadLimiter,
  paymentLimiter,
  mongoSanitize,
  xss: xssClean,
  hpp
};
