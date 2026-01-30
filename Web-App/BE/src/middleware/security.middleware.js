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
  max: isDev ? 1000 : 200, // 200 requests per 15 minutes in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 10, // 10 login attempts per 15 minutes in production
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Very strict limiter for password reset
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 20 : 5, // 5 password reset attempts per hour in production
  message: 'Too many password reset attempts, please try again later.',
});

// Strict limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 30, // 30 uploads per 15 minutes in production
  message: 'Too many upload requests, please try again later.',
});

// Moderate limiter for payment operations
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 50, // 50 payment requests per 15 minutes in production
  message: 'Too many payment requests, please slow down.',
});

// Wrap express-mongo-sanitize to avoid crashing when req.query is read-only in some environments
function mongoSanitize() {
  const m = expressMongoSanitize();
  return function (req, res, next) {
    try {
      return m(req, res, next);
    } catch (err) {
      // Log and skip sanitation for this request to prevent server crash
      console.warn('[security.middleware] express-mongo-sanitize threw, skipping sanitize for request:', err && err.message ? err.message : err);
      return next();
    }
  };
}

// Wrap xss-clean to avoid crashing with read-only properties
function xssClean() {
  const x = xss();
  return function (req, res, next) {
    try {
      return x(req, res, next);
    } catch (err) {
      console.warn('[security.middleware] xss-clean threw, skipping sanitize for request:', err && err.message ? err.message : err);
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
